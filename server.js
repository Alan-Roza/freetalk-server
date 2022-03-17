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

io.on('connection', (socket) => {
  console.log('a user connected')

  Chats.find().then(result => {
    socket.emit('output-messages', result)
  })

  socket.on('chat-message', (msg) => {
    const message = new Chats({ msg })
    message.save().then(() => {
      console.log(msg, 'msg')
      io.emit('message', msg)
    })
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

httpServer.listen(PORT, async() => {
  console.log(`listening on *:${PORT}`)
})
