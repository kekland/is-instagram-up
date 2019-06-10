const levelup = require('levelup')
const leveldown = require('leveldown')
const utils = require('../utils')

let db = null

const init = async () => {
  utils.log('Starting database')

  db = levelup(leveldown('./database/'))

  utils.log('Database started')
}
module.exports.main = db
module.exports.init = init