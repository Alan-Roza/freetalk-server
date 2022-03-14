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
  origin: 'http://localhost:3030'
}));

app.use(bodyParser.json())

app.use(express.static('public'));

app.use(authRoutes)

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('connected')
}).catch((err) => {
  console.log(err)
})

// app.post('/login', async (req,res) => {
//   const {username, password} = req.body
//   const user = await User.findOne({username}).lean()

//   if (!user) {
//     return res.status(400).json({code: 400, status: 'error', message: 'Usuário ou Senha incorretos'})
//   }

//   if (!username || typeof username !== 'string') {
//     return res.status(400).json({code: 400, status: 'error', message: 'Preencha o usuário'})
//   }

//   if (!password || typeof password !== 'string') {
//     return res.status(400).json({code: 400, status: 'error', message: 'Preencha a senha'})
//   }

//   if (await bcrypt.compare(password, user.password)) {
//     const token = jwt.sign({
//       id: user._id, 
//       username: user.username
//     }, JWT_SECRET)

//     const sign = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

//     return res.json({ status: 'Success', user: sign})
//   }

//   res.status(400).json({code: 400, status: 'error', message: 'Usuário ou Senha incorretos'})
// })

// app.post('/register', async (req, res) => {
//   const {username, password: plainTextPassword, passwordConfirm} = req.body

//   if (!username || typeof username !== 'string') {
//     return res.status(400).json({code: 400, status: 'error', message: 'Nome inválido'})
//   }

//   if (!plainTextPassword || typeof plainTextPassword !== 'string') {
//     return res.status(400).json({code: 400, status: 'error', message: 'Senha inválido'})
//   }

//   if (plainTextPassword !== passwordConfirm) {
//     return res.status(400).json({code: 400, status: 'error', message: 'As senhas devem ser iguais'})
//   }

//   const password = await bcrypt.hash(plainTextPassword, 10)

//   try {
//    const response = await User.create({
//       username,
//       password
//     })
//     console.log('User created successfully', response)
//   } catch (error) {
//     console.log(error.message)
//     if (error.code === 11000) {
//       return res.status(400).json({code: 400, status: 'error', message: 'Este usuário já existe'})
//     }
//     throw error
//   }

//   res.json({status: 'Success', message: 'Cadastro realizado com sucesso!'})
// })

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
