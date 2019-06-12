const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text.toLowerCase()
  bot.api.messages.send({ user_id: message.sender, message: responses.unknown })
  logger.logResponse('unknown')

  return true
}

module.exports.tryHandle = tryHandle