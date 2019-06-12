const admin = require('firebase-admin')
const axios = require('axios').default
const utils = require('../utils')
const moment = require('moment')
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

const poll = async (services) => {
  const status = await pollServices(services)
  const timestamp = moment().unix()

  const data = { timestamp: timestamp, data: status }

  logStatus(status)

  await firebase.database().ref('status/history').push(data)
  await firebase.database().ref('status/current').set(data)
}


const bootstrap = async () => {
  const params = (await firebase.database().ref().child('params').once('value')).toJSON()

  const interval = params.requestInterval
  const services = params.services
  const serviceCount = Object.keys(services).length
  utils.log(`Starting to poll, got ${utils.color.green(serviceCount.toString())} services.`)
  utils.log(`Request interval: ${utils.color.green(params.requestInterval.toString())}s`)

  poll(services)
  setInterval(() => poll(services), interval * 1000)
}

bootstrap()