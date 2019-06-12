const handler = require('./handlers')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe) => {
  if (text === '/subscribe' || text === 'подписаться' || text === 'subscribe') {
    const id = message.sender

    const userExists = users.indexOf(id) !== -1
    if (userExists) {
      bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadySubscribed, keyboard: keyboards.subscribedKeyboard })
      handler.logResponse('onAlreadySubscribed', utils.color.yellow)
    }
    else {
      await onSubscribe(id)

      bot.api.messages.send({ user_id: message.sender, message: responses.onSubscribe, keyboard: keyboards.subscribedKeyboard })
      handler.logResponse('onSubscribe')
    }

    return true
  }
  return false
}

module.exports.tryHandle = tryHandle