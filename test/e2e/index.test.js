const axios = require('axios')
const { faker } = require('@faker-js/faker')
const { server } = require('../../src/expressExample/network')

const URL = `http://localhost:${process.env.PORT || 3334}`

beforeAll(async () => {
  await server.start()
})

afterAll(async () => {
  await server.stop()
})

describe('API: GET /', () => {
  let response = {}

  test('Should return 200 as status code', async () => {
    response = await axios.get(URL)
    expect(response.status).toBe(200)
  })

  test('Should be a successful operation', () => {
    expect(response.data.error).toBe(false)
  })
})

describe('E2E test: Use cases from UserService', () => {
  const name = faker.name.firstName()
  const lastName = faker.name.lastName()
  const newUser = {
    name,
    lastName,
    email: faker.internet.email(name, lastName).toLowerCase(),
    password: faker.datatype.string()
  }
  const tokens = {
    accessToken: '',
    refreshToken: ''
  }

  describe('Testing save user', () => {
    let response = {}

    test('Should return 201 as status code', async () => {
      response = await axios.post(`${URL}/api/user/signup`, newUser)
      expect(response.status).toBe(201)
    })
  })

  describe('Testing login a user', () => {
    const keys = ['accessToken', 'refreshToken']

    test('Should return accessToken and refreshToken', async () => {
      const {
        data: { message }
      } = await axios.post(`${URL}/api/user/login`, {
        email: newUser.email,
        password: newUser.password
      })

      expect(Object.keys(message)).toEqual(keys)
      tokens.accessToken = message.accessToken
      tokens.refreshToken = message.refreshToken
    })
  })

  describe('Testing get all users', () => {
    test('Should return an array of users', async () => {
      const {
        data: { message: allUsers }
      } = await axios.get(`${URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      })

      expect(allUsers.some(u => u.email === newUser.email)).toBe(true)
    })
  })
})
