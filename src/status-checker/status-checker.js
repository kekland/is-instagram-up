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

let requestTimeout = 5000
let maxRequestRetries = 3
const getSerivce = async (service, currentRetry = 0) => {
  if(currentRetry === maxRequestRetries) return false
  try {
    const response = await axios.get(service.urlToCheck, { timeout: requestTimeout, headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    } })
    return true
  }
  catch (e) {
    return getSerivce(service, currentRetry + 1)
  }
}

const pollServices = async (services) => {
  const status = {}

  for (const serviceKey in services) {
    const service = services[serviceKey]
    const working = await getSerivce(service)
    console.log(service.name, working)
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
    cachedHistory.splice(0, 1)
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
  maxRequestRetries = params.maxRequestRetries
  requestTimeout = params.requestTimeout

  utils.log(`Request interval: ${utils.color.green(interval.toString())}s`)
  utils.log(`Cache length: ${utils.color.green(cachedHistoryLength.toString())} items`)
  utils.log(`Request timeout: ${utils.color.green(requestTimeout.toString())}ms`)
  utils.log(`Request retries: ${utils.color.green(maxRequestRetries.toString())} times`)

  await downloadFromCache()

  utils.log(`Starting to poll, got ${utils.color.green(serviceCount.toString())} services.`)

  poll(services)
  setInterval(() => poll(services), interval * 1000)


  const app = express()

  app.use(cors())
  app.use((req, res, next) => {
    utils.log(`IP: ${utils.color.green(req.ip)}\treq: ${utils.color.blue(req.path)}`)
    next()
  })

  app.get('/services', (req, res) => {
    res.send(services)
  })

  app.get('/status', (req, res) => {
    res.send(cachedStatus)
  })

  app.get('/history', (req, res) => {
    res.send(cachedHistory)
  })

  app.listen(8081, () => {
    utils.log(`Server listening on port ${utils.color.green('8081')}`)
  })
}

bootstrap()