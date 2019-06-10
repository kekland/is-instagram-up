const utils = require('./utils')
const connectivity = require('./connectivity')
const database = require('./database/database')
const bot = require('./bot/bot')

const bootstrap = async () => {
  await database.init()
  await bot.init()
}

bootstrap()