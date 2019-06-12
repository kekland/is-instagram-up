const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  if (text === 'start' || text === 'начать') {
    bot.api.messages.send({ user_id: message.sender, message: responses.welcome })
    logger.logResponse('welcome')
    return true
  }
  return false
}

module.exports.tryHandle = tryHandle