const express = require('express')
const { createServer } = require('http')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const Chats = require('./source/models/chats')
const User = require('./source/models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authRoutes = require('./source/routes/authRoutes')
const { MongoClient } = require('mongodb')

var cors = require('cors');

const mongoDB = 'mongodb://localhost:27017/freetalk-db'
const PORT = 3100
const app = express()

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(cors({
  origin: '*'
}));

app.use(bodyParser.json())

app.use(express.static('public'));

app.use(authRoutes)

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('connected')
}).catch((err) => {
  console.log(err)
})

var client = new MongoClient(mongoDB)

var collection

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('join', async (chatId) => {
    try {
      const response = await collection.findOne({ "_id": new mongoose.mongo.ObjectId(chatId) })
      console.log(new mongoose.mongo.ObjectId(chatId), 'response')
      if (!response) {
        await collection.insertOne({ "_id": new mongoose.mongo.ObjectId(chatId), messages: [] })
      }
      socket.join(chatId)
      socket.emit("joined", response)
      socket.activeRoom = chatId
    } catch (err) {
      console.error(err)
    }
  })

  socket.on('create', async (newChat) => {
    const newId = new mongoose.mongo.ObjectId()
    try {
      await collection.insertOne({
        "_id": new mongoose.mongo.ObjectId(newId),

        references: newChat.references,
        messages: [],
        // receiverName: newChat.receiverName,
        privateChat: newChat.privateChat

      })
      socket.join(newId)
      socket.emit("joined", newId)
      socket.activeRoom = newId

      const response = await collection.findOne({ "_id": new mongoose.mongo.ObjectId(newId) })
      socket.emit("chat-created", response)
    } catch (err) {
      console.error(err)
    }
  })

  socket.on("message", async (chat) => {
    collection.updateOne({ "_id": new mongoose.mongo.ObjectId(socket.activeRoom) }, {
      "$push": {
        "messages": {
          message: chat.message,
          senderId: new mongoose.mongo.ObjectId(chat.senderId),
          createdAt: new Date(chat.createdAt)
        }
      }
    })
    const response = await collection.findOne({ "_id": new mongoose.mongo.ObjectId(socket.activeRoom) })
    io.to(socket.activeRoom).emit("message", response)

    Chats.find().then(result => {
      io.emit('chat-updated', result)
    })
  })

  Chats.find().then(result => {
    socket.emit('output-messages', result)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

httpServer.listen(PORT, async () => {
  try {
    await client.connect()
    collection = client.db('freetalk-db').collection('chats')
    console.log(`listening on *:${PORT}`)
  } catch (err) {
    console.error(err)
  }
})
