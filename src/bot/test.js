const status = {
  instagram: false,
  youtube: false,
  vk: false
}

const newStatus = {
  instagram: true,
  youtube: false,
  vk: false
}

const statusGenerator = require('./status')

console.log(statusGenerator.generateStatusChangeMessage(statusGenerator.compareStatuses(status, newStatus), {instagram: {nameLocalized: {ru: "xd"}}}))