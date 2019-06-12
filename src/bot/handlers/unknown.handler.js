const responses = require('./responses.json')
const keyboard = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text
  bot.api.messages.send({ user_id: message.sender, message: responses.unknown })
  logger.logResponse('unknown', utils.color.red)

  return true
}

module.exports.tryHandle = tryHandle