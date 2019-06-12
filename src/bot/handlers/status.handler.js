const handler = require('./handlers')

const tryHandle = (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe) => {
  if (text === '/status' || text === 'статус сервисов' || text === 'статус' || text === 'status') {
    bot.api.messages.send({ user_id: message.sender, message: cachedStatus })
    handler.logResponse('status')
    return true
  }
  return false
}

module.exports.tryHandle = tryHandle