const VK = require('vk-fast-longpoll')
const utils = require('../utils')
const admin = require('firebase-admin')
const statusGenerator = require('./status')
const massMessenger = require('./handlers/mass.messager.handler')
const handler = require('./handlers/handlers')

var serviceAccount = require("../../adminsdk.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://is-instagram-up.firebaseio.com/"
})

let previousStatus = null
let cachedStatus = 'Нет статуса, пожалуйста, подождите'
let users = []
let services = {}
const initFirebase = async () => {
  utils.log("Initalizing firebase")
  const subs = (await firebase.database().ref().child('users').once('value')).toJSON()
  for (let sub in subs) {
    if (subs[sub]) {
      users.push(sub)
    }
  }
  console.log(users)
  utils.log(`Got ${utils.color.green(users.length.toString())} subscribers`)

  services = (await firebase.database().ref().child('params/services').once('value')).toJSON()
  firebase.database().ref().child('status/current/data').on('value', (value) => {
    utils.log('Got firebase update, generating message.', utils.color.grey)
    const status = value.toJSON()
    cachedStatus = statusGenerator.generate(status, services)
    
    if(previousStatus != null) {
      const difference = statusGenerator.compareStatuses(previousStatus, status)
      console.log(difference)
      // I know that this is ugly, sorry for that.
      if(JSON.stringify(difference) !== "{}") {
        utils.log(`Difference - sending messages now.`)
        const message = statusGenerator.generateStatusChangeMessage(difference, services)
        massMessenger.messageEveryone(bot, users, message)
      }
    }
    previousStatus = JSON.parse(JSON.stringify(status))
  })
  utils.log(`Subscribed to update event`)
}

const addUser = async (id) => {
  users.push(id)
  await firebase.database().ref().child(`users/${id}`).set(true)
}

const removeUser = async (id) => {
  const index = users.indexOf(id)
  if (index !== -1) {
    users.splice(index)
  }

  await firebase.database().ref().child(`users/${id}`).set(false)
}

const bootstrap = async () => {
  utils.log('Starting the bot')

  await initFirebase()
  const token = (await firebase.database().ref().child('params/token').once('value')).toJSON()
  utils.log(`Got service token ${token.slice(0, 6)}...`)
  bot = new VK(token)
  bot.longpoll.start()

  bot.longpoll.on('message', (message) => {
    if (!message.isOutbox) {
      console.log(message.sender)
      handler.handle(bot, message, firebase, cachedStatus, users, addUser, removeUser)
    }
  });

  utils.log('Bot started', utils.color.green)
  //massMessenger.messageEveryone(bot, users, 'Извиняюсь за частые тесты, но бот почему-то не работал. Сейчас будет тест изменения статуса: ')
}

bootstrap()