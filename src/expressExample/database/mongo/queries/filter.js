const filter = id => (typeof id === 'string' ? { id } : { _id: id })

module.exports = filter
