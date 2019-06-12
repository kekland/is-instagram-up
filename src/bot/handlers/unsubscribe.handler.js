const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text
  if (text === '/unsubscribe' || text === 'отписаться' || text === 'unsubscribe') {
    const id = message.sender

    const userExists = users.indexOf(id) !== -1
    if (userExists) {
      await onUnsubscribe(id)

      bot.api.messages.send({ user_id: message.sender, message: responses.onUnsubscribe, keyboard: keyboards.subscribeKeyboard })
      logger.logResponse('onUnsubscribe')
    }
    else {
      bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadyUnsubscribed, keyboard: keyboards.subscribeKeyboard })
      logger.logResponse('onAlreadyUnsubscribed', utils.color.yellow)
    }

    return true
  }
  return false
}

module.exports.tryHandle = tryHandle