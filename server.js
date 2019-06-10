const utils = require('./utils')
const connectivity = require('./connectivity')

const checkConnection = async () => {
  process.stdout.write(`${getTimeFormatted()} Checking services: \n`)
  const status = getStatusOfAllServices
  for(const key in status) {
    
  }
}

const bootstrap = async () => {
  setInterval(checkConnection, 3000)
}

bootstrap()