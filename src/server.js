const utils = require('./utils')
const connectivity = require('./connectivity')
const bot = require('./bot/bot')
const express = require('express')

const bootstrap = async () => {
  await bot.init()
  const app = express()

  app.get('/status', async (req, res) => {
    const status = await bot.serverGetStatus()
    res.send(status)
  })

  app.get('/history', async (req, res) => {
    const history = await bot.serverGetHistory()
    res.send(history)
  })
  
  app.get('/subscribers', async (req, res) => {
    const count = await bot.serverGetSubscriberCount()
    res.send({count})
  })

  app.listen(8080)
}

bootstrap()