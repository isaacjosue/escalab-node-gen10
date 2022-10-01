const { Router } = require('express')
const { UrlService } = require('../../services')

const { user: userIDSchema } = require('../../schemas')
const { validatorCompiler, auth } = require('./utils')
const response = require('./response')
const UrlRouter = Router()

UrlRouter.route('/url/:userId').post(
  validatorCompiler(userIDSchema, 'params'),
  auth.verifyIsCurrentUser('params', 'userId'),
  async (req, res, next) => {
    const {
      body: { link },
      params: { userId }
    } = req
    const urlService = new UrlService({ link, userId })

    try {
      const result = await urlService.saveUrl()

      response({
        error: false,
        message: result,
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

UrlRouter.route('/url/:id').get(auth.verifyUser(), async (req, res, next) => {
  const {
    params: { id }
  } = req

  try {
    const urlService = new UrlService({ id })
    const url = await urlService.getUrl()

    console.log(url.link)
    res.redirect(url.link)
  } catch (error) {
    next(error)
  }
})

module.exports = UrlRouter
