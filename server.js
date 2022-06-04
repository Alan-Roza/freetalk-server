const express = require('express')
const { createServer } = require('http')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const Chats = require('./source/models/chats')
const authRoutes = require('./source/routes/authRoutes')
const { MongoClient } = require('mongodb')

var cors = require('cors');

const mongoDB = 'mongodb://localhost:27017/freetalk-db' // String connect mongodb
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

// Conectando ao mongodb'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('connected')
}).catch((err) => {
  console.log(err)
})

var client = new MongoClient(mongoDB)

var collection

io.on('connection', (socket) => {
  console.log('a user connected')

  // Conecta a um chat específico
  socket.on('join', async (chatId) => {
    let response
    try {
      response = await collection.findOne({ "_id": new mongoose.mongo.ObjectId(chatId) })
      if (!response) {
        response = await collection.insertOne({ "_id": new mongoose.mongo.ObjectId(chatId), messages: [] })
      }
      socket.join(chatId)
      socket.emit("joined", response)
      socket.activeRoom = chatId
    } catch (err) {
      console.error(err)
    }
  })

  // Cria um novo chat
  socket.on('create', async (newChat) => {
    const newId = new mongoose.mongo.ObjectId()
    try {
      await collection.insertOne({
        "_id": new mongoose.mongo.ObjectId(newId),

        references: [
          {
            name: newChat.references[0].name,
            userId: new mongoose.mongo.ObjectId(newChat.references[0].userId),
          },
          {
            name: newChat.references[1].name,
            userId: new mongoose.mongo.ObjectId(newChat.references[1].userId),
          }
        ],
        messages: [],
        privateChat: newChat.privateChat

      })
      socket.join(newId)
      socket.activeRoom = newId

      // Encontra e Retorna as informações do chat criado
      const response = await collection.findOne({ "_id": new mongoose.mongo.ObjectId(newId) })
      socket.emit("chat-created", response)
    } catch (err) {
      console.error(err)
    }
  })

  // Atualiza o chat com novas mensagens
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

    if (chat.currentUser) {
      Chats.find({ "references.userId": new mongoose.mongo.ObjectId(chat.currentUser) }).then(result => {
        socket.emit('output-messages', result)
      })
    }
  })

  // Os chats de um usuário específico
  socket.on('chat-in', (_id) => {
    if (_id) {
      _id = new mongoose.mongo.ObjectId(_id)
      Chats.find({ "references.userId": _id }).then(result => {
        socket.emit('output-messages', result)
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

// Inicia-se o server
httpServer.listen(PORT, async () => {
  try {
    await client.connect()
    collection = client.db('freetalk-db').collection('chats')
    console.log(`listening on *:${PORT}`)
  } catch (err) {
    console.error(err)
  }
})
