const utils = require('./utils')
const connectivity = require('./connectivity')

const checkConnection = async () => {
  process.stdout.write(`${getTimeFormatted()} Connecting to Instagram: `)
  const connected = await tryConnectToInstagram()
  if (connected) {
    process.stdout.write(chalk.green('connected\n'))
  }
  else {
    process.stdout.write(chalk.red('failed\n'))
  }
}

const bootstrap = async () => {
  setInterval(checkConnection, 3000)
}

bootstrap()