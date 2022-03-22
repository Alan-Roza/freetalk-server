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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchema'
  }]
},
  { collection: 'chats' }
)

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat
