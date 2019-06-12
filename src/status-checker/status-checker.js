const admin = require('firebase-admin')
const axios = require('axios').default
const utils = require('../utils')
const cors = require('cors')
const moment = require('moment')
const express = require('express')

var serviceAccount = require("../../adminsdk.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://is-instagram-up.firebaseio.com/"
})

const getSerivce = async (service) => {
  try {
    const response = await axios.get(service.urlToCheck, { timeout: 10000 })
    return true
  }
  catch (e) {
    return false
  }
}

const pollServices = async (services) => {
  const status = {}

  for (const serviceKey in services) {
    const service = services[serviceKey]
    const working = await getSerivce(service)
    status[serviceKey] = working;
  }

  return status
}

const logStatus = async (status) => {
  utils.log('Status: ')
  for (const key in status) {
    utils.log(`\t${utils.color.gray(key)}: ${utils.getStatusFormatted(status[key])}`)
  }
}

let cachedStatus = {}
let cachedHistory = []
let cachedHistoryLength = 0
const poll = async (services) => {
  const status = await pollServices(services)
  const timestamp = moment().unix()

  const data = { timestamp: timestamp, data: status }

  logStatus(status)

  const historyRef = await firebase.database().ref('status/history').push(data)
  await historyRef.set(data)

  if(cachedHistory.length >= cachedHistoryLength) {
    cachedHistory.splice(0)
    cachedHistory.push(data)
  }
  await firebase.database().ref('status/current').set(data)
}

const downloadFromCache = async () => {
  utils.log('Downloading from cache...')
  cachedStatus = (await firebase.database().ref().child('status/current').once('value')).toJSON().data
  
  utils.log('Current status downloaded: ')
  logStatus(cachedStatus)

  cachedHistory = Object.values(
    (await firebase.database().ref().child('status/history').orderByKey().limitToLast(cachedHistoryLength).once('value')).toJSON()
  )
  utils.log(`Cached status downloaded, length: ${utils.color.green(cachedHistory.length.toString())}`)
}

const bootstrap = async () => {
  const params = (await firebase.database().ref().child('params').once('value')).toJSON()

  const interval = params.requestInterval
  const services = params.services
  const serviceCount = Object.keys(services).length
  cachedHistoryLength = params.cachedHistoryLength

  utils.log(`Request interval: ${utils.color.green(interval.toString())}s`)
  utils.log(`Cache length: ${utils.color.green(cachedHistoryLength.toString())} items`)

  await downloadFromCache()

  utils.log(`Starting to poll, got ${utils.color.green(serviceCount.toString())} services.`)

  poll(services)
  setInterval(() => poll(services), interval * 1000)


  const app = express()

  app.use(cors())

  app.get('/status', (req, res) => {
    utils.log(`IP: ${utils.color.green(req.ip)}\treq: status`)
    res.send(cachedStatus)
  })

  app.get('/history', (req, res) => {
    utils.log(`IP: ${utils.color.green(req.ip)}\treq: history`)
    res.send(cachedHistory)
  })

  app.listen(8081, () => {
    utils.log(`Server listening on port ${utils.color.green('8081')}`)
  })
}

bootstrap()