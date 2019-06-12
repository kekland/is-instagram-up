const VK = require('vk-fast-longpoll')
const utils = require('../utils')
const firebase = require('firebase-admin')
const token = require('../../data/token.json').token

var serviceAccount = require("../../adminsdk.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://is-instagram-up.firebaseio.com/"
})

let status = {}
const init = async () => {
  utils.log('Starting the bot')

  bot = new VK(token)
  bot.longpoll.start()

  bot.longpoll.on('message', (message) => {
    if (!message.isOutbox) {
      handler.handleMessage(message)
    }
  });

  await handler.init(() => status, bot, db)
  utils.log('Bot started', utils.color.green)
}

module.exports.bot = bot
module.exports.init = init
module.exports.serverGetStatus = async () => {
  return status
}
module.exports.serverGetHistory = async () => {
  try {
    const history = await db.main.get('history')
    return history
  }
  catch (e) {
    return []
  }
}
module.exports.serverGetSubscriberCount = async () => {
  const data = await handler.getSubscribersList()
  return data.length
}