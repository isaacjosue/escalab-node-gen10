const { Router } = require('express')

const {
  role: { storeRoleSchema }
} = require('../../schemas')
const { validatorCompiler, auth } = require('./utils')
const response = require('./response')
const { RoleService } = require('../../services')

const RoleRouter = Router()

RoleRouter.route('/role').post(
  validatorCompiler(storeRoleSchema, 'body'),
  auth.verifyUser(),
  async (req, res, next) => {
    const {
      body: { id, name }
    } = req

    try {
      const roleService = new RoleService({ id, name })

      response({
        error: false,
        message: await roleService.saveRole(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

RoleRouter.route('/role/:id').get(auth.verifyUser(), async (req, res, next) => {
  const {
    params: { id }
  } = req

  try {
    const roleService = new RoleService({ id })

    response({
      error: false,
      message: await roleService.getRoleByID(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

module.exports = RoleRouter
