const levelup = require('levelup')
const leveldown = require('leveldown')
const utils = require('../utils')

let db = null

const init = async () => {
  utils.log('Starting database')

  db = levelup(leveldown('./database/'))
  module.exports.main = db

  utils.log('Database started', utils.color.green)
}
module.exports.main = db
module.exports.init = init