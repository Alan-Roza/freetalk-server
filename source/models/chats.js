const mongoose = require('mongoose')
const msgSchema = new mongoose.Schema({
  messages: String
})

const Chat = mongoose.model('Chat', msgSchema)
module.exports = Chat