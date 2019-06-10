const VK = require('vk-fast-longpoll');
const handler = require('./handler')

const token = require('../../data/token.json').token
const bot = new VK(token);

bot.longpoll.start();

bot.longpoll.on('message', (message) => {
  if (!message.isOutbox) {
    handler.handleMessage(bot, message)
  }
});
