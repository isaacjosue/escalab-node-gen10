const { UrlModel } = require('../models')
const filter = require('./filter')

/**
 * @param {String} id
 * @param {String} link
 * @returns saved url
 */
const saveUrl = async url => {
  const savedUrl = new UrlModel(url)

  await savedUrl.save()

  return savedUrl
}

/**
 * @param {String} id
 * @returns found url
 */
const getOneUrl = async id => {
  const urls = await UrlModel.find(filter(id)).populate('userId')

  return urls[0]
}

module.exports = {
  saveUrl,
  getOneUrl
}
