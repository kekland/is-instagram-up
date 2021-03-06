const utils = require('./utils')
const connectivity = require('./connectivity')
const bot = require('./bot-backup/bot')
const cors = require('cors')
const express = require('express')

const bootstrap = async () => {
  await bot.init()
  const app = express()

  app.use(cors())

  app.get('/status', async (req, res) => {
    const status = await bot.serverGetStatus()
    res.send(status)
  })

  app.get('/history', async (req, res) => {
    let history = JSON.parse(await bot.serverGetHistory())
    if(history.length > 60) {
      history = history.slice(history.length - 60)
    }
    res.send(history)
  })
  
  app.get('/subscribers', async (req, res) => {
    const count = await bot.serverGetSubscriberCount()
    res.send({count})
  })

  utils.log(`Listening on port 8080`, utils.color.green)
  app.listen(8080)
}

bootstrap()