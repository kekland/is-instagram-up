const moment = require('moment')
const chalk = require('chalk').default

const log = (message, color = chalk.reset, prefix = '') => {
  console.log(`${prefix}${getTimeFormatted()} ${color(message)}`)
}

const getTimeFormatted = () => {
  const time = moment().format("llll")
  return `${chalk.gray(`[${time}]`)}`
}

const getStatusFormatted = (status) => {
  if(status) {
    return chalk.green(`success`)
  }
  else {
    return chalk.red(`fail`)
  }
}

module.exports.chalk = chalk
module.exports.moment = moment
module.exports.getTimeFormatted = getTimeFormatted
module.exports.getStatusFormatted = getStatusFormatted
module.exports.log = log