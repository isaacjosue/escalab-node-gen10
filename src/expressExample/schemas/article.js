const { Type } = require('@sinclair/typebox')

const storeArticleSchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  price: Type.Number()
})

const updateArticleSchema = Type.Partial(storeArticleSchema)

module.exports = {
  storeArticleSchema,
  updateArticleSchema
}
