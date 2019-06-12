const statusEmoji = (status) => {
  return (status) ? '✅' : '❌'
}

const generateMessage = (status, services) => {
  //console.log(status, services)
  let statusMessage = ''
  
  for (const key in status) {
    statusMessage += `${services[key].nameLocalized.ru}: ${statusEmoji(status[key])}\n`
  }

  return statusMessage
}

const compareStatuses = (previousStatus, newStatus) => {
  const changes = {}

  for (const key in newStatus) {
    const current = newStatus[key]
    const previous = previousStatus[key]
    if (previous != null && current != previous) {
      changes[key] = { name: key, from: previous, now: current }
    }
  }

  return changes
}

const generateStatusChangeMessage = (difference) => {
  let message = ''
  for (const key in difference) {
    const status = difference[key]
    message += `${services[key].nameLocalized.ru}: ${statusEmoji(status.from)} → ${statusEmoji(status.now)}\n`
  }
  return message
}

module.exports.compareStatuses = compareStatuses
module.exports.generate = generateMessage
module.exports.generateStatusChangeMessage = generateStatusChangeMessage