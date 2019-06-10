const responses = require('./responses.json')
const db = require('../database/database')
const utils = require('../utils')

const logMessage = (message) => {
  utils.log(`Message from ${message.sender}: `, utils.color.blue)
  utils.log(`\t${utils.color.gray('body')}: ${message.text}`, utils.color.reset)
}

const logResponse = (responseType, color = utils.colors.green) => {
  utils.log(`\t${utils.color.gray('response')}: ${color(responseType)}`, utils.color.reset)
}

const handleMessage = async (bot, message) => {
  //console.log(message)
  const text = message.text.toLowerCase()
  logMessage(message)

  if(text === 'start') {
    bot.api.messages.send({user_id: message.sender, message: responses.welcome})
    logResponse('welcome')
  }
  else if(text === '/subscribe') {
    bot.api.messages.send({user_id: message.sender, message: responses.onSubscribe})
    logResponse('onSubscribe')
  }
  else if(text === '/unsubscribe') {
    bot.api.messages.send({user_id: message.sender, message: responses.onUnsubscribe})
    logResponse('onUnsubscribe')
  }
  else {
    bot.api.messages.send({user_id: message.sender, message: responses.unknown})
    logResponse('unknown', utils.color.red)
  }
}

module.exports.handleMessage = handleMessage