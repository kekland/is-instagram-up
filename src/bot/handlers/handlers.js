const logger = require('./logger')

const handlers = [
  require('./welcome.handler').tryHandle,
  require('./subscribe.handler').tryHandle,
  require('./unsubscribe.handler').tryHandle,
  require('./status.handler').tryHandle,
  require('./unknown.handler').tryHandle
]

const handle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe) => {
  logger.logMessage(message)
  for(const handler of handlers) {
    const result = await handler(bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger)
    if(result) {
      return true
    }
  }
  return false
}

module.exports.handle = handle