const { ArticleModel } = require('../models')
const filter = require('./filter')

/**
 * @param {Object} article
 * @param {String} article.id
 * @param {String} article.name
 * @param {Number} article.price
 * @param {import("mongoose").Schema.Types.ObjectId} article.userId
 * @returns saved article
 */
const saveArticle = async article => {
  const savedArticle = new ArticleModel(article)

  await savedArticle.save()

  return savedArticle
}

/**
 * @param {String} id
 * @returns found article
 */
const getArticleByID = async id => {
  const articles = await ArticleModel.find(filter(id))

  return articles[0]
}

/**
 * @returns found articles
 */
const getAllArticles = async () => {
  const articles = await ArticleModel.find()

  return articles
}

/**
 * @param {String} id
 * @returns found article
 */
const removeArticleByID = async id => {
  const article = await ArticleModel.findOneAndRemove(filter(id))

  return article
}

/**
 * @param {Object} article
 * @param {String} article.id
 * @param {String|undefined} article.name
 * @param {Number|undefined} article.price
 * @param {import("mongoose").Schema.Types.ObjectId | undefined} article.userId
 * @returns updated article
 */
const updateOneArticle = async article => {
  const { id, name, price, userId } = article
  const articleUpdated = await ArticleModel.findOneAndUpdate(
    filter(id),
    { name, price, userId },
    { new: true }
  )

  return articleUpdated
}

const getOneArticle = async (query = {}) => {
  const articles = await ArticleModel.find(query)

  return articles[0]
}

module.exports = {
  saveArticle,
  getArticleByID,
  getAllArticles,
  removeArticleByID,
  updateOneArticle,
  getOneArticle
}
