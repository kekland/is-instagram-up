const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const tryHandle = async (bot, message, firebase, cachedStatus, users, onSubscribe, onUnsubscribe, logger) => {
  const text = message.text.toLowerCase()
  if (text.includes('thanks') || text.includes('спасибо') || text.includes('спс') || text.includes('спасиб')) {
    bot.api.messages.send({ user_id: message.sender, message: responses.thanks })
    logger.logResponse('unknown')
  }

  return true
}

module.exports.tryHandle = tryHandle