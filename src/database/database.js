const level = require('level')
const utils = require('../utils')

let db = null

const init = async () => {
  utils.log('Starting database')

  db = level('./database/', { valueEncoding: 'json' })
  module.exports.main = db

  utils.log('Database started', utils.color.green)
}
module.exports.main = db
module.exports.init = init