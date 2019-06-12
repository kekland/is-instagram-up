/*const level = require('level')
const fs = require('fs')
let x = ''
let db = level('./database/', { valueEncoding: 'json' })
db.createReadStream().on('data', (data) => {
  x += `${data.key}:${data.value}\n`
  console.log(data.key, data.value)
})
setTimeout(() => {
  fs.writeFileSync('./dump.txt', x)
}, 3000)
*/