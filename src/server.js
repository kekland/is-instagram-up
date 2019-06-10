const utils = require('./utils')
const connectivity = require('./connectivity')

const checkConnection = async () => {
  console.log(`${utils.getTimeFormatted()} Checking services:`)
  const status = await connectivity.checkServices()
  for(const key in status) {
    console.log(`\t${key}: ${utils.getStatusFormatted(status[key])}`)
  }
}

const bootstrap = async () => {
  checkConnection()
  setInterval(checkConnection, 60000)
}

bootstrap()