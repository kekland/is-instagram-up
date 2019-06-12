const VK = require('vk-fast-longpoll')
const utils = require('../utils')
const admin = require('firebase-admin')
const services = require('../../data/services.json')
const statusGenerator = require('./status')
const handler = require('./handlers/handlers')

var serviceAccount = require("../../adminsdk.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://is-instagram-up.firebaseio.com/"
})

let cachedStatus = 'Нет статуса, пожалуйста, подождите'
let users = []
const initFirebase = async () => {
  utils.log("Initalizing firebase")
  const subs = (await firebase.database().ref().child('users').once('value')).toJSON()
  for (let sub in subs) {
    if (subs[sub]) {
      users.push(parseInt(sub))
    }
  }
  utils.log(`Got ${utils.color.green(users.length.toString())} subscribers`)

  firebase.database().ref().child('status/current/data').on('value', (value) => {
    utils.log('Got firebase update, generating message.', utils.color.grey)
    cachedStatus = statusGenerator.generate(value.toJSON(), services)
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
      handler.handle(bot, message, firebase, cachedStatus, users, addUser, removeUser)
    }
  });

  utils.log('Bot started', utils.color.green)
}

bootstrap()