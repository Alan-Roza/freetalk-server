const mongoose = require('mongoose')
const msgSchema = new mongoose.Schema({
  _id: String,
  messages: [{
    senderId: String,
    message: String,
    createdAt: String
  }],
  integrates: [String],
  privateChat: Boolean
})

const Chat = mongoose.model('Chat', msgSchema)
module.exports = Chat