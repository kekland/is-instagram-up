const responses = require('./responses.json')
const db = require('../database/database')
const utils = require('../utils')

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
    else if (text === '/subscribe') {
      const id = message.sender

      const userExists = await userExistsInDatabase(id)
      if (userExists) {
        bot.api.messages.send({ user_id: message.sender, message: responses.onAlreadySubscribed })
        logResponse('onAlreadySubscribed')
      }
      else {
        await addUserToDatabase(id)

        bot.api.messages.send({ user_id: message.sender, message: responses.onSubscribe })
        logResponse('onSubscribe')
      }
    }
    else if (text === '/unsubscribe') {
      bot.api.messages.send({ user_id: message.sender, message: responses.onUnsubscribe })
      logResponse('onUnsubscribe')
    }
    else if (text === '/status') {

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

const init = async () => {
  await db.init()
}

module.exports.handleMessage = handleMessage
module.exports.init = init