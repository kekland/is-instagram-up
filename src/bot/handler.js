const responses = require('./responses.json')
const keyboards = require('./keyboards.json')

const utils = require('../utils')
const services = require('../../data/services.json')

let getStatus = null
let bot = null
let db = null
const logMessage = (message) => {
  utils.log(`Message from ${message.sender}: `, utils.color.blue)
  utils.log(`\t${utils.color.gray('body')}: ${message.text}`, utils.color.reset)
}

const logResponse = (responseType, color = utils.color.green) => {
  utils.log(`\t${utils.color.gray('response')}: ${color(responseType)}`, utils.color.reset)
}

const getSubscribersList = async () => {
  try {
    let data = await db.main.get('subscribers')
    let list = JSON.parse(data)
    return list
  }
  catch (e) {
    return []
  }
}

const statusEmoji = (status) => {
  return (status) ? '✅' : '❌'
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

    if (text === 'start' || text === 'начать') {
      bot.api.messages.send({ user_id: message.sender, message: responses.welcome })
      logResponse('welcome')
    }
    else if (text === '/subscribe' || text === 'подписаться' || text === 'subscribe') {
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
    else if (text === '/unsubscribe' || text === 'отписаться' || text === 'unsubscribe') {
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
    else if (text === '/status' || text === 'статус сервисов' || text === 'статус' || text === 'status') {
      let statusMessage = ''
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

const onStatusChange = async (difference, test = false) => {
  const subscribers = await getSubscribersList()
  let message = ""
  if(test) message += "Внимание, это проверка сети - не обращайте внимание на это сообщение\n"
  for (const key in difference) {
    const status = difference[key]
    message += `${services[key].nameLocalized.ru}: ${statusEmoji(status.from)} → ${statusEmoji(status.now)}\n`
  }
  utils.log(`Status change: sending for ${subscribers.length}`)
  logResponse('statusChange', utils.color.blue)
  for (const subscriber of subscribers) {
    bot.api.messages.send({ user_id: subscriber, message: message })
    await utils.awaitFor(1000)
  }
}

const checkConnectionFailure = () => {
  onStatusChange({"telegram": {"name": "telegram", from: false, now: true}}, true)
}

const broadcast = async (message) => {
  const subscribers = await getSubscribersList()
  for (const subscriber of subscribers) {
    bot.api.messages.send({ user_id: subscriber, message: message })
    await utils.awaitFor(1000)
  }
}

const init = async (_getStatus, _bot, _db) => {
  db = _db
  getStatus = _getStatus
  bot = _bot

  setInterval(async () => {
    const subs = await getSubscribersList()
    utils.log(`Subscriber count: ${utils.color.green(subs.length)}`)
  }, 60 * 1000)
}

module.exports.handleMessage = handleMessage
module.exports.init = init
module.exports.checkConnectionFailure = checkConnectionFailure
module.exports.onStatusChange = onStatusChange
module.exports.getSubscribersList = getSubscribersList
module.exports.broadcast = broadcast