const UserService = require('./user')
const {
  mongo: { queries }
} = require('../database')
const { nanoid } = require('nanoid')
const {
  article: { getOneArticle, saveArticle },
  user: { getOneUser, updateOneUser }
} = queries

class ArticleService {
  #id
  #name
  #price
  #userId

  /**
   * @param {String|undefined} id
   * @param {String|undefined} name
   * @param {Number|undefined} price
   * @param {String|undefined} userId
   */
  constructor(args) {
    const { id = '', name = '', price = 0, userId = '' } = args

    this.#id = id
    this.#name = name
    this.#price = price
    this.#userId = userId
  }

  async verifyArticleExists() {
    if (!this.#id) throw new Error('Missing required field: id')

    const article = await getOneArticle(this.#id)

    if (!article) throw new Error('Article not found')

    return article
  }

  async getArticle() {
    if (!this.#userId) throw new Error('Missing required field: userId')

    const user = await getOneUser(this.#userId)

    if (!user) throw new Error('User does not exist')

    return user.articleId || []
  }

  async saveArticle() {
    if (!this.#userId) throw new Error('Missing required field: userId')

    const userService = new UserService(this.#userId)

    if (!(await userService.verifyUserExists()))
      throw new Error('User does not exist')

    const newArticle = await saveArticle({
      id: nanoid(),
      name: this.#name,
      price: this.#price
    })

    await updateOneUser({
      id: this.#userId,
      articleId: newArticle._id
    })

    return newArticle.toObject()
  }
}

module.exports = ArticleService
