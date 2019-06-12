const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text.toLowerCase()
  if (text === '/status' || text === 'статус сервисов' || text === 'статус' || text === 'status') {
    bot.api.messages.send({ user_id: message.sender, message: cachedStatus, keyboard: keyboards.subscribedKeyboard  })
    logger.logResponse('status')
    return true
  }
  return false
}

module.exports.tryHandle = tryHandle