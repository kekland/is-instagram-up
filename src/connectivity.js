const axios = require('axios').default
const services = require('../data/services.json')

const getServiceStatus = async (key, service) => {
  try {
    const response = await axios.get(service.url, {timeout: 10000,})
    return { service: key, up: true }
  }
  catch (e) {
    return { service: key, up: false }
  }
}

const getStatusOfAllServices = async () => {
  const results = {}
  for (const key in services) {
    const result = await getServiceStatus(key, services[key]);
    results[result.service] = result.up
  }

  return results
}

module.exports.checkService = getServiceStatus
module.exports.checkServices = getStatusOfAllServices
module.exports.services = services