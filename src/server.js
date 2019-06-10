const utils = require('./utils')
const connectivity = require('./connectivity')
const database = require('./database/database')

const checkConnection = async () => {
  console.log(`${utils.getTimeFormatted()} Checking services:`)
  const status = await connectivity.checkServices()
  for(const key in status) {
    console.log(`\t${key}: ${utils.getStatusFormatted(status[key])}`)
  }
}

const bootstrap = async () => {
  database.init()
}

bootstrap()