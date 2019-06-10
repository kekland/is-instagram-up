const utils = require('./utils')
const connectivity = require('./connectivity')
const bot = require('./bot/bot')

const bootstrap = async () => {
  await bot.init()
}

bootstrap()