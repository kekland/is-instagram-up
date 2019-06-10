const VK = require('vk-fast-longpoll')
const handler = require('./handler')
const utils = require('../utils')

const token = require('../../data/token.json').token
let bot = null

const init = async () => {
  utils.log('Starting the bot')

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
