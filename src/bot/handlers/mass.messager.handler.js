const handler = require('./handlers')
const utils = require('../../utils')
const messageEveryone = async (bot, users, message) => {
  utils.log(`Notifying ${users.length.toString()} users`)
  let batches = [[]]
  for(let i = 0; i < users.length; i++) {
    if(batches[batches.length - 1].length === 100) {
      batches.push([])
    }

    batches[batches.length - 1].push(users[i])
  }

  for(let batch of batches) {
    let ids = ''
    for(let user of batch) {
      ids += user.toString() + ','
    }
    ids = ids.slice(0, ids.length - 1)
    utils.log(`Sending batched message for ${batch.length.toString()} users`)
    bot.api.messages.send({ user_ids: ids, message: message })
    await utils.awaitFor(100)
  }
}

module.exports.messageEveryone = messageEveryone