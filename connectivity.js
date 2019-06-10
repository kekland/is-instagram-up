const axios = require('axios').default
const servicesToConnect = require("serviesToConnect.json")

const checkService = async (key, service) => {
  try {
    const response = await axios.get(service.url)
    return {service: key, up: true}
  }
  catch(e) {
    return {service: key, up: false}
  }
}

const checkServices = async () => {
  const promises = []
  for(const key in servicesToConnect.services) {
    promises.push(checkService(key, servicesToConnect[key]))
  }

  const data = await Promise.all(promises)
  const results = {}
  for(const result of data) {
    results[result.service] = up
  }

  return results
}

module.exports.checkService = checkService
module.exports.checkServices = checkServices