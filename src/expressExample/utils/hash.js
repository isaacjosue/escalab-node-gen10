const { createHash } = require('crypto')
const nanoid = require('nanoid')

const hashString = string => {
  const salt = nanoid(6)
  const hash = createHash('sha256')

  hash.update(`${string}${salt}`)

  const result = hash.digest('hex')

  return { salt, result }
}

module.exports = hashString
