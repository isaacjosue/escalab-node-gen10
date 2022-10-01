const ROLES = {
  1: {
    name: 'admin',
    description: 'system admin'
  },
  2: {
    name: 'buyer',
    description: 'user who can buy articles'
  },
  3: {
    name: 'seller',
    description: 'user who can sell articles'
  }
}

const ROLE_IDS = Object.keys(ROLES)

const ROLE_NAMES = Object.entries(ROLES).map(role => role[1].name)

module.exports = {
  ROLES,
  ROLE_IDS,
  ROLE_NAMES
}
