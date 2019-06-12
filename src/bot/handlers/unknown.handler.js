const handler = require('./handlers')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe) => {
  bot.api.messages.send({ user_id: message.sender, message: responses.unknown })
  handler.logResponse('unknown', utils.color.red)

  return true
}

module.exports.tryHandle = tryHandle