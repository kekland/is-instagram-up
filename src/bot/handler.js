const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const db = require('../database/database')
const utils = require('../utils')
const services = require('../../data/services.json')

let getStatus = null
const logMessage = (message) => {
  utils.log(`Message from ${message.sender}: `, utils.color.blue)
  utils.log(`\t${utils.color.gray('body')}: ${message.text}`, utils.color.reset)
}

const logResponse = (responseType, color = utils.color.green) => {
  utils.log(`\t${utils.color.gray('response')}: ${color(responseType)}`, utils.color.reset)
}

const addUserToDatabase = async (id) => {
  await db.main.put(`${id}`, true)
}

const deleteUserFromDatabase = async (id) => {
  await db.main.del(`${id}`)
}

const userExistsInDatabase = async (id) => {
  try {
    const row = await db.main.get(`${id}`)
    return true
  }
  catch (e) {
    return false
  }
}

const handleMessage = async (bot, message) => {
  try {
    const text = message.text.toLowerCase()
    logMessage(message)

    if (text === 'start') {
      bot.api.messages.send({ user_id: message.sender, message: responses.welcome })
      logResponse('welcome')
    }
    else if (text === '/subscribe' || text === 'подписаться') {
      const id = message.sender

      const userExists = await userExistsInDatabase(id)
      if (userExists) {
        bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadySubscribed, keyboard: keyboards.subscribedKeyboard })
        logResponse('onAlreadySubscribed', utils.color.yellow)
      }
      else {
        await addUserToDatabase(id)

        bot.api.messages.send({ user_id: message.sender, message: responses.onSubscribe, keyboard: keyboards.subscribedKeyboard })
        logResponse('onSubscribe')
      }
    }
    else if (text === '/unsubscribe' || text === 'отписаться') {
      const id = message.sender

      const userExists = await userExistsInDatabase(id)
      if (userExists) {
        await deleteUserFromDatabase(id)

        bot.api.messages.send({ user_id: message.sender, message: responses.onUnsubscribe, keyboard: keyboards.subscribeKeyboard })
        logResponse('onUnsubscribe')
      }
      else {
        bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadyUnsubscribed, keyboard: keyboards.subscribeKeyboard })
        logResponse('onAlreadyUnsubscribed', utils.color.yellow)
      }
    }
    else if (text === '/status' || text === 'статус сервисов') {
      let statusMessage = 'Вот, что сейчас с интернетом: \n'
      const status = getStatus()
      for(const key in status) {
        statusMessage += `${services[key].nameLocalized.ru}: ${(status[key]? '✔' : '✖')}\n`
      }
      bot.api.messages.send({ user_id: message.sender, message: statusMessage })
      logResponse('status')
    }
    else {
      bot.api.messages.send({ user_id: message.sender, message: responses.unknown })
      logResponse('unknown', utils.color.red)
    }
  }
  catch (e) {
    utils.log(e, utils.color.red)

    bot.api.messages.send({ user_id: message.sender, message: responses.error })
    logResponse('error', utils.color.red)
  }
}

const onStatusChange = async (difference) => {
  utils.log(difference)
}

const init = async (_getStatus) => {
  await db.init()
  getStatus = _getStatus
}

module.exports.handleMessage = handleMessage
module.exports.init = init
module.exports.onStatusChange = onStatusChange