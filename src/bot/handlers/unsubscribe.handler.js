const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text.toLowerCase()
  if (text === '/unsubscribe' || text === 'отписаться' || text === 'unsubscribe') {
    const id = message.sender.toString()

    const userExists = users.includes(id)
    if (userExists) {
      await onUnsubscribe(id)

      bot.api.messages.send({ user_id: message.sender, message: responses.onUnsubscribe, keyboard: keyboards.subscribeKeyboard })
      logger.logResponse('onUnsubscribe')
    }
    else {
      bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadyUnsubscribed, keyboard: keyboards.subscribeKeyboard })
      logger.logResponse('onAlreadyUnsubscribed')
    }

    return true
  }
  return false
}

module.exports.tryHandle = tryHandle