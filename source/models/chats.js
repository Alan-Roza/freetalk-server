const mongoose = require('mongoose')
const chatSchema = new mongoose.Schema({
  messages: [{
    senderId: {
      type: String
    },
    message: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
  }],
  senderName: String,
  receiverName: String,
  privateChat: Boolean,
  references: [{
    name: String,
    userId: mongoose.Schema.Types.ObjectId
  }]
},
  { collection: 'chats' }
)

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat
