const utils = require('../../utils')

const logMessage = (message) => {
  utils.log(`Message from ${message.sender}: `, utils.color.blue)
  utils.log(`\t${utils.color.gray('body')}: ${message.text}`, utils.color.reset)
}

const logResponse = (responseType, color = utils.color.green) => {
  utils.log(`\t${utils.color.gray('response')}: ${color(responseType)}`, utils.color.reset)
}

const handlers = [
  require('./welcome.handler').tryHandle,
  require('./subscribe.handler').tryHandle,
  require('./unsubscribe.handler').tryHandle,
  require('./status.handler').tryHandle,
  require('./unknown.handler').tryHandle
]

const handle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe) => {
  logMessage(message)
  for(const handler of handlers) {
    const result = await handler(bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe)
    if(result) {
      return true
    }
  }
  return false
}

module.exports.logMessage = logMessage
module.exports.logResponse = logResponse