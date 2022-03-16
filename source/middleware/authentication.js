const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const { ResponseError } = require('../helpers/error')
const { AUTH_PRIVATE_KEY } = require('../config/globals')

module.exports.authentication = async (request, response, next) => {

  try {

    const authHeader = request.headers.authorization

    if (!authHeader) {
      return response.send('Acesso negado: usuário não autenticado.')
    }

    const [header, token] = authHeader.split(' ')

    if (String(header).toLowerCase() !== 'bearer') {
      return response.send('Acesso negado: tipo de autorização incorreta.')
    }

    if (request.originalUrl === '/auth/tokens/refresh') {
      const isValidJWT = jwt.verify(token, AUTH_PRIVATE_KEY, (error, result) => ['TokenExpiredError: jwt expired'].includes(String(error)) || result || false)

      if (!(isValidJWT)) return response.send('Acesso negado: token inválido')

      const result = jwt.decode(token)
      request.userId = result.id

      return next()
    }


    jwt.verify(token, AUTH_PRIVATE_KEY, async (error, result) => {
      try {
        if (error) return response.send('Acesso negado: token expirada.')

        if (!result) return response.send('Acesso negado: token inválida.')

        request.userId = result.id
        request.userName = result.userName
        console.info(`Authenticated: ${request.userName} with id ${request.userId}`)

        return next()
      } catch (error) {
        return ResponseError(response, error?.code, error?.message, error?.data, 'authorization')
      }
    })
  } catch (error) {
    return ResponseError(response, error?.code, error?.message, error?.data, 'authorization')
  }

}