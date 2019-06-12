const statusEmoji = (status) => {
  return (status) ? '✅' : '❌'
}

const generateMessage = (status, services) => {
  let statusMessage = ''
  
  for (const key in status) {
    statusMessage += `${services[key].nameLocalized.ru}: ${statusEmoji(status[key])}\n`
  }

  return statusMessage
}

module.exports.generate = generateMessage