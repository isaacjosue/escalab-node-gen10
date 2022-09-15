const { Router } = require('express')

const response = require('./response')

const HomeRouter = Router()

HomeRouter.route('/').get((req, res) => {
  response({ error: false, message: 'Hello world!', status: 200, res })
})

module.exports = HomeRouter
