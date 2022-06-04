const User = require('../models/user')

module.exports.get_user = ((req, res) => {
  const { username } = req.body
  console.log(username, 'name', req.body)
  try {
    User.find({"username": username}).then(response => {
      if (response && response.length > 0 && Array.isArray(response)) {
        return res.status(200).json({ code: 200, status: 'success', message: 'Usuário encontrado com sucesso', data: response })
      } else if (response.length === 0 && Array.isArray(response)) {
        return res.status(400).json({ code: 400, status: 'error', message: 'Usuário não encontrado' })
      }
    })
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({ code: 400, status: 'error', message: 'Este usuário não existe' })
  }
})
