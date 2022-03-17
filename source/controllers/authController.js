const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { AUTH_PRIVATE_KEY } = require('../config/globals')

module.exports.register_post = async (req, res) => {
  const { username, password: plainTextPassword, passwordConfirm } = req.body

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ code: 400, status: 'error', message: 'Nome inválido' })
  }

  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.status(400).json({ code: 400, status: 'error', message: 'Senha inválido' })
  }

  if (plainTextPassword !== passwordConfirm) {
    return res.status(400).json({ code: 400, status: 'error', message: 'As senhas devem ser iguais' })
  }

  const password = await bcrypt.hash(plainTextPassword, 10)

  try {
    const response = await User.create({
      username,
      password
    })
    console.log('User created successfully', response)
  } catch (error) {
    console.log(error.message)
    if (error.code === 11000) {
      return res.status(400).json({ code: 400, status: 'error', message: 'Este usuário já existe' })
    }
    throw error
  }

  res.json({ status: 'Success', message: 'Cadastro realizado com sucesso!' })
}

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username }).lean()

  if (!user) {
    return res.status(400).json({ code: 400, status: 'error', message: 'Usuário ou Senha incorretos' })
  }

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ code: 400, status: 'error', message: 'Preencha o usuário' })
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ code: 400, status: 'error', message: 'Preencha a senha' })
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({
      id: user._id,
      username: user.username
    }, AUTH_PRIVATE_KEY)


    return res.json({ status: 'Success', token: token })
  }

  res.status(400).json({ code: 400, status: 'error', message: 'Usuário ou Senha incorretos' })
}

module.exports.refresh_token = async (req, res) => {
    return res.json({ status: 'Success' })
}