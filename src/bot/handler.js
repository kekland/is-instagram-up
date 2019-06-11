const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const db = require('../database/database')
const utils = require('../utils')
const services = require('../../data/services.json')

let getStatus = null
let bot = null
const logMessage = (message) => {
  utils.log(`Message from ${message.sender}: `, utils.color.blue)
  utils.log(`\t${utils.color.gray('body')}: ${message.text}`, utils.color.reset)
}

const logResponse = (responseType, color = utils.color.green) => {
  utils.log(`\t${utils.color.gray('response')}: ${color(responseType)}`, utils.color.reset)
}

const getSubscribersList = async () => {
  let data = await db.main.get('subscribers')
  let list = JSON.parse(data)
  return list
}

const statusEmoji = (status) => {
  return (status)? '✅' : '❌'
}

const addUserToDatabase = async (id) => {
  await db.main.put(`${id}`, true)
  try {
    let list = await getSubscribersList()
    const index = list.indexOf(id)

    if (index === -1) {
      list.push(id)
    }

    await db.main.put('subscribers', JSON.stringify(list))
  }
  catch (e) {
    utils.log(e, utils.color.red)
  }
}

const deleteUserFromDatabase = async (id) => {
  await db.main.del(`${id}`)

  try {
    let list = await getSubscribersList()
    const index = list.indexOf(id)

    if (index !== -1) {
      list.splice(index, 1)
    }

    await db.main.put('subscribers', JSON.stringify(list))
  }
  catch (e) {
    utils.log(JSON.stringify(e), utils.color.red)
  }
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

const handleMessage = async (message) => {
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
      for (const key in status) {
        statusMessage += `${services[key].nameLocalized.ru}: ${statusEmoji(status[key])}\n`
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
  const subscribers = await getSubscribersList()
  let message = "Ой, ой - что-то поменялось: \n"
  for(const key in difference) {
    const status = difference[key]
    message += `${services[key].nameLocalized.ru}: ${statusEmoji(status.from)} ⮕ ${statusEmoji(status.now)}\n`
  }
  utils.log(`Status change: sending for ${subscribers.length}`)
  logResponse('statusChange', utils.color.blue)
  for(const subscriber of subscribers) {
    bot.api.messages.send({ user_id: subscriber, message: message })
    await utils.awaitFor(100)
  }
}

const init = async (_getStatus, _bot) => {
  await db.init()
  getStatus = _getStatus
  bot = _bot
}

module.exports.handleMessage = handleMessage
module.exports.init = init
module.exports.onStatusChange = onStatusChange