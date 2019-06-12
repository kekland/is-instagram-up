const responses = require('./responses.json')
const keyboard = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text
  if (text === '/subscribe' || text === 'подписаться' || text === 'subscribe') {
    const id = message.sender

    const userExists = users.indexOf(id) !== -1
    if (userExists) {
      bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadySubscribed, keyboard: keyboards.subscribedKeyboard })
      logger.logResponse('onAlreadySubscribed', utils.color.yellow)
    }
    else {
      await onSubscribe(id)

      bot.api.messages.send({ user_id: message.sender, message: responses.onSubscribe, keyboard: keyboards.subscribedKeyboard })
      logger.logResponse('onSubscribe')
    }

    return true
  }
  return false
}

module.exports.tryHandle = tryHandle