const { Router } = require('express')
const httpErrors = require('http-errors')

const {
  user: { storeUserSchema, updateUserSchema, userIDSchema, userLoginSchema }
} = require('../../schemas')
const { validatorCompiler, auth } = require('./utils')
const response = require('./response')
const { UserService } = require('../../services')

const UserRouter = Router()

UserRouter.route('/user').get(auth.verifyUser(), async (req, res, next) => {
  try {
    const userService = new UserService()

    response({
      error: false,
      message: await userService.getAllUsers(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

UserRouter.route('/user/signup').post(
  validatorCompiler(storeUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const {
        body: { name, lastName, email, password }
      } = req

      response({
        error: false,
        message: await new UserService({
          name,
          lastName,
          email,
          password
        }).saveUser(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/login').post(
  validatorCompiler(userLoginSchema, 'body'),
  auth.generateTokens(),
  async (req, res, next) => {
    try {
      const {
        accessToken,
        refreshToken,
        body: { email, password }
      } = req
      const user = await new UserService({ email, password }).login()

      if (user)
        return response({
          error: false,
          message: {
            id: user.id,
            accessToken,
            refreshToken
          },
          res,
          status: 200
        })

      throw new httpErrors.Unauthorized('You are not registered')
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/:id')
  .get(
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          params: { id: userId }
        } = req
        const userService = new UserService({ userId })

        response({
          error: false,
          message: await userService.getUserByID(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .delete(
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          params: { id }
        } = req
        const userService = new UserService({ userId: id })

        response({
          error: false,
          message: await userService.removeUserByID(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .patch(
    validatorCompiler(userIDSchema, 'params'),
    validatorCompiler(updateUserSchema, 'body'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      const {
        body: { name, lastName, email },
        params: { id: userId }
      } = req

      try {
        response({
          error: false,
          message: await new UserService({
            userId,
            name,
            lastName,
            email
          }).updateOneUser(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

UserRouter.route('/user/refreshAccessToken/:id').get(
  validatorCompiler(userIDSchema, 'params'),
  auth.verifyIsCurrentUser(),
  auth.refreshAccessToken(),
  async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = req

      response({
        error: false,
        message: {
          accessToken,
          refreshToken
        },
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/funds/:id').post(
  validatorCompiler(userIDSchema, 'params'),
  auth.verifyIsCurrentUser(),
  async (req, res, next) => {
    try {
      const {
        body: { funds: balance },
        params: { id: userId }
      } = req

      response({
        error: false,
        message: await new UserService({
          userId,
          balance
        }).addToBalance(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

module.exports = UserRouter
