const { Router } = require('express')

const {
  user: { userIDSchema },
  article: { storeArticleSchema, updateArticleSchema }
} = require('../../schemas')
const { validatorCompiler, auth } = require('./utils')
const response = require('./response')
const { ArticleService } = require('../../services')

const ArticleRouter = Router()

ArticleRouter.route('/article').get(
  auth.verifyUser(),
  async (req, res, next) => {
    try {
      const articleService = new ArticleService()

      return response({
        error: false,
        message: await articleService.getAllArticles(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

ArticleRouter.route('/article/create').post(
  validatorCompiler(storeArticleSchema, 'body'),
  auth.verifyIsCurrentUser('body'),
  async (req, res, next) => {
    try {
      const {
        body: { id: userId, name, price }
      } = req

      return response({
        error: false,
        message: await new ArticleService({
          name,
          price,
          userId
        }).saveArticle(),
        status: 201,
        res
      })
    } catch (error) {
      next(error)
    }
  }
)

ArticleRouter.route('/article/owner/:id').get(
  validatorCompiler(userIDSchema, 'params'),
  auth.verifyUser(),
  async (req, res, next) => {
    const {
      params: { id: userId }
    } = req

    try {
      return response({
        error: false,
        message: await new ArticleService({ userId }).getArticlesByUser(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

ArticleRouter.route('/article/:articleId')
  .get(auth.verifyUser(), async (req, res, next) => {
    try {
      const {
        params: { articleId }
      } = req

      return response({
        error: false,
        message: new ArticleService({ articleId }).getArticleById(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })
  .post(auth.verifyIsCurrentUser('body'), async (req, res, next) => {
    try {
      const {
        body: { id: userId },
        params: { articleId }
      } = req

      return response({
        error: false,
        message: await new ArticleService({ userId, articleId }).buyArticle(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })
  .delete(auth.verifyUser(), async (req, res, next) => {
    try {
      const {
        params: { articleId }
      } = req

      return response({
        error: false,
        message: await new ArticleService({ articleId }).removeArticleByID(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })
  .patch(
    validatorCompiler(updateArticleSchema, 'body'),
    auth.verifyUser(),
    async (req, res, next) => {
      const {
        body: { name, price },
        params: { articleId }
      } = req

      try {
        const articleService = new ArticleService({
          articleId,
          name,
          price
        })

        return response({
          error: false,
          message: await articleService.updateOneArticle(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

module.exports = ArticleRouter
