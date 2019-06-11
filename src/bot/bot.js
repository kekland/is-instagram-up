const VK = require('vk-fast-longpoll')
const handler = require('./handler')
const utils = require('../utils')
const connectivity = require('../connectivity')

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

const getStatus = async (onStatusChange) => {
  previousStatus = status
  status = await connectivity.checkServices()

  const difference = compareStatuses()
  if(Object.keys(difference).length > 0) {
    utils.log('difference:')
    utils.log(`\t${JSON.stringify(difference)}`, utils.color.green)
    onStatusChange(difference)
  }

  /*utils.log('status: ')
  for (const key in status) {
    utils.log(`\t${utils.color.gray(key)}: ${utils.getStatusFormatted(status[key])}`)
  }*/
}

const initGetStatus = () => {
  getStatus(handler.onStatusChange)
  setInterval(() => getStatus(handler.onStatusChange), 15000)
}


const init = async () => {
  utils.log('Starting the bot')

  initGetStatus()

  bot = new VK(token)
  bot.longpoll.start();

  bot.longpoll.on('message', (message) => {
    if (!message.isOutbox) {
      handler.handleMessage(message)
    }
  });

  if(process.argv.length > 2 & process.argv[2] === 'test') {
    utils.log("Test commencing in 10 seconds")
    setTimeout(() => {
      utils.log("Test running")
      handler.checkConnectionFailure()
    }, 10000)
  }

  await handler.init(() => status, bot)
  utils.log('Bot started', utils.color.green)
}

module.exports.bot = bot
module.exports.init = init
