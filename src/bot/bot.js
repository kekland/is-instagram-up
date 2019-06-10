const VK = require('vk-fast-longpoll')
const handler = require('./handler')
const utils = require('../utils')
const connectivity = require('../connectivity')

const token = require('../../data/token.json').token
let bot = null

let status = {}


const getStatus = async () => {
  status = await connectivity.checkServices()
  utils.log('status: ')
  for(const key in status) {
    utils.log(`\t${utils.color.gray(key)}: ${utils.getStatusFormatted(status[key])}`)
  }
}

const initGetStatus = () => {
  getStatus()
  setInterval(() => getStatus(), 15000)
}

const init = async () => {
  utils.log('Starting the bot')

  await handler.init(() => status)
  initGetStatus()

  bot = new VK(token)
  bot.longpoll.start();

  bot.longpoll.on('message', (message) => {
    if (!message.isOutbox) {
      handler.handleMessage(bot, message)
    }
  });
  
  utils.log('Bot started', utils.color.green)
}

module.exports.bot = bot
module.exports.init = init
