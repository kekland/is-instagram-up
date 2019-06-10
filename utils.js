const moment = require('moment')
const chalk = require('chalk').default

const getTimeFormatted = () => {
  const time = moment().format("llll")
  return `${chalk.gray(`[${time}]`)}`
}

module.exports.chalk = chalk
module.exports.moment = moment
module.exports.getTimeFormatted = getTimeFormatted
