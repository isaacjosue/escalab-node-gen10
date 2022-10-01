const httpErrors = require('http-errors')
const { nanoid } = require('nanoid')

const UserService = require('./user')

const {
  mongo: { queries }
} = require('../database')
const {
  article: {
    saveArticle,
    getArticleByID,
    getAllArticles,
    removeArticleByID,
    updateOneArticle
  }
} = queries

class ArticleService {
  #articleId
  #name
  #price
  #userId

  /**
   * @param {Object} args
   * @param {String} args.articleId
   * @param {String} args.name
   * @param {Number} args.price
   * @param {import("mongoose").Schema.Types.ObjectId} args.userId
   */
  constructor(args = {}) {
    const { articleId = '', name = '', price = 1, userId = '' } = args

    this.#articleId = articleId
    this.#name = name
    this.#price = price
    this.#userId = userId
  }

  async verifyArticleExists() {
    if (!this.#articleId)
      throw new httpErrors.BadRequest('Missing required field: articleId')

    const article = await getArticleByID(this.#articleId)

    if (!article) throw new httpErrors.NotFound('Article not found')

    return article
  }

  async saveArticle() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await new UserService({
      userId: this.#userId
    }).verifyUserExists()

    return await saveArticle({
      id: nanoid(),
      name: this.#name,
      price: this.#price,
      userId: user._id
    })
  }

  async getArticleById() {
    if (!this.#articleId)
      throw new httpErrors.BadRequest('Missing required field: articleId')

    const article = await getArticleByID(this.#articleId)

    if (!article) throw new httpErrors.NotFound('Article does not exist')

    return article.articleId
  }

  async getAllArticles() {
    return await getAllArticles()
  }

  async removeArticleByID() {
    if (!this.#articleId)
      throw new httpErrors.BadRequest('Missing required field: articleId')

    const article = await removeArticleByID(this.#articleId)

    if (!article)
      throw new httpErrors.NotFound('The requested article does not exist')

    return article
  }

  async updateOneArticle() {
    if (!this.#articleId)
      throw new httpErrors.BadRequest('Missing required field: articleId')

    return await updateOneArticle({
      id: this.#articleId,
      name: this.#name,
      price: this.#price,
      userId: this.#userId
    })
  }

  async buyArticle() {
    if (!this.#articleId)
      throw new httpErrors.BadRequest('Missing required field: articleId')
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const article = await getArticleByID(this.#articleId)
    if (!article)
      throw new httpErrors.NotFound('The requested article does not exist')

    const sellerService = new UserService({
      userId: article.userId,
      balance: article.price
    })
    await sellerService.verifyUserExists()

    const buyerService = new UserService({
      userId: this.#userId,
      balance: article.price
    })
    const buyer = await buyerService.verifyUserExists()

    await buyerService.removeFromBalance()
    await sellerService.addToBalance()

    return await updateOneArticle({
      id: this.#articleId,
      userId: buyer._id
    })
  }

  async getArticlesByUser() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const userService = new UserService({ userId: this.#userId })
    const user = await userService.verifyUserExists()

    const articles = await getAllArticles()

    const articlesFiltered = articles.filter(
      article => article.userId.toString() === user._id.toString()
    )

    return articlesFiltered
  }
}

module.exports = ArticleService
