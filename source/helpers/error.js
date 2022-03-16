const ResponseError = async function (response, code, message, data, path) {
  switch (code) {
    case 400:
      return response.send_badRequest(message, data)
    case 401:
      return response.send_unauthorized(message, data)
    case 403:
      return response.send_forbidden(message, data)
    case 404:
      return response.send_notFound(message, data)
    case 409:
      return response.send_conflict(message, data)
    case 418:
      return response.send_imATeapot(message, data)
    case 422:
      return response.send_unprocessableEntity(message, data)
    case 500:
      console.warn({ message, data })
      // await ErrorHandlerQueries.create({ code, data, message, path })
      return response.send_internalServerError(message, data)
    case 503:
      console.warn({ message, data })
      // await ErrorHandlerQueries.create({ code, data, message, path })
      return response.send_badGateway(message, data)
    default:
      console.warn({ message, data })
      // await ErrorHandlerQueries.create({ code, data, message, path })
      return response.send_internalServerError('Ocorreu um erro! Tente novamente mais tarde.', data)
  }
}

module.exports = {
  ResponseError
}
