const VK = require('vk-fast-longpoll')
const handler = require('./handler')
const utils = require('../utils')
const connectivity = require('../connectivity')
const moment = require('moment')
const db = require('../database/database')

const token = require('../../data/token.json').token
let bot = null

let previousStatus = {}
let status = {}

const compareStatuses = () => {
  const changes = {}

  for (const key in status) {
    const current = status[key]
    const previous = previousStatus[key]
    if (previous != null && current != previous) {
      changes[key] = { name: key, from: previous, now: current }
    }
  }

  return changes
}

const saveInHistory = async (status) => {
  let data = []
  try {
    data = JSON.parse(await db.main.get("history"))
  } catch (e) { }
  if (data.length >= 480) {
    data.splice(0)
  }
  data.push({ timestamp: moment().unix(), data: status })
  await db.main.put("history", JSON.stringify(data))

  utils.log(`History index: ${data.length}`, utils.color.gray)
}

const getStatus = async (onStatusChange) => {
  previousStatus = status
  status = await connectivity.checkServices()

  await saveInHistory(status)

  const difference = compareStatuses()
  if (Object.keys(difference).length > 0) {
    utils.log('difference:')
    utils.log(`\t${JSON.stringify(difference)}`, utils.color.green)
    onStatusChange(difference)
  }

  utils.log('status: ')
  for (const key in status) {
    utils.log(`\t${utils.color.gray(key)}: ${utils.getStatusFormatted(status[key])}`)
  }
}

const initGetStatus = () => {
  getStatus(handler.onStatusChange)
  setInterval(() => getStatus(handler.onStatusChange), 3 * 60 * 1000)
}


const init = async () => {
  utils.log('Starting the bot')
  await db.init()
  initGetStatus()

  bot = new VK(token)
  bot.longpoll.start();

  bot.longpoll.on('message', (message) => {
    if (!message.isOutbox) {
      handler.handleMessage(message)
    }
  });

  if (process.argv.length > 2 & process.argv[2] === 'test') {
    utils.log("Test commencing in 10 seconds")
    setTimeout(() => {
      utils.log("Test running")
      handler.checkConnectionFailure()
    }, 10000)
  }

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