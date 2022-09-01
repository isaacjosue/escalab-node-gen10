const httpErrors = require('http-errors')
const jwt = require('jsonwebtoken')

const validateAuthorization = (req, res, next) => {
  const {
    headers: { authorization }
  } = req

  if (!authorization)
    return next(new httpErrors.Unauthorized('You are not allowed'))

  const [tokenType, token] = authorization.split(' ')

  if (tokenType !== 'Bearer')
    throw new httpErrors.Unauthorized('You are not allowed')

  const payload = jwt.verify(token, process.env.SECRET)

  console.log(payload)

  next()
}

module.exports = validateAuthorization
