const responses = require('./responses.json')
const keyboard = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text
  if (text === 'start' || text === 'начать') {
    bot.api.messages.send({ user_id: message.sender, message: responses.welcome })
    logger.logResponse('welcome')
    return true
  }
  return false
}

module.exports.tryHandle = tryHandle