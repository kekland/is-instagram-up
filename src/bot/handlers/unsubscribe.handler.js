const handler = require('./handlers')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe) => {
  if (text === '/unsubscribe' || text === 'отписаться' || text === 'unsubscribe') {
    const id = message.sender

    const userExists = users.indexOf(id) !== -1
    if (userExists) {
      await onUnsubscribe(id)

      bot.api.messages.send({ user_id: message.sender, message: responses.onUnsubscribe, keyboard: keyboards.subscribeKeyboard })
      handler.logResponse('onUnsubscribe')
    }
    else {
      bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadyUnsubscribed, keyboard: keyboards.subscribeKeyboard })
      handler.logResponse('onAlreadyUnsubscribed', utils.color.yellow)
    }

    return true
  }
  return false
}

module.exports.tryHandle = tryHandle