const axios = require('axios')
const { faker } = require('@faker-js/faker')
const { server } = require('../../../src/expressExample/network')

const URL = `http://localhost:${process.env.PORT || 3333}/api`

jest.setTimeout(10000)

beforeAll(async () => {
  await server.start()
})
afterAll(async () => {
  await server.stop()
})

describe('E2E tests: ', () => {
  const buyer = {
    id: '',
    accessToken: '',
    refreshToken: '',
    expectedBalance: 0
  }
  const seller = {
    id: '',
    accessToken: '',
    refreshToken: '',
    expectedBalance: 0
  }

  describe('Test user logic', () => {
    describe('1. Sign up as buyer', () => {
      const name = faker.name.firstName()
      const lastName = faker.name.lastName()
      const newUser = {
        name,
        lastName,
        email: faker.internet.email(name, lastName).toLowerCase(),
        password: faker.datatype.string(),
        role: '2'
      }

      test('Should return status code 201', async () => {
        const response = await axios.post(`${URL}/user/signup`, newUser)
        expect(response.status).toEqual(201)
      })

      describe('1.1. Log in as buyer', () => {
        const keys = ['id', 'accessToken', 'refreshToken']
        let response = {}

        test('Should return status code 200', async () => {
          response = await axios.post(`${URL}/user/login`, {
            email: newUser.email,
            password: newUser.password
          })

          expect(response.status).toBe(200)
        })

        test('Should return accessToken and refreshToken', async () => {
          const {
            data: { message }
          } = response

          expect(Object.keys(message)).toEqual(keys)

          buyer.id = message.id
          buyer.accessToken = message.accessToken
          buyer.refreshToken = message.refreshToken
        })
      })
    })

    describe("2. Add funds to buyer's balance", () => {
      const funds = 20
      let response

      test('Should return status code 200', async () => {
        response = await axios.post(
          `${URL}/user/funds/${buyer.id}`,
          {
            funds
          },
          {
            headers: {
              Authorization: `Bearer ${buyer.accessToken}`
            }
          }
        )

        expect(response.status).toBe(200)
      })

      test('Should add funds succesfully', async () => {
        const {
          data: { message }
        } = response

        expect(message.balance).toBe(buyer.expectedBalance + funds)

        buyer.expectedBalance += funds
      })
    })

    describe('3. Sign up as seller', () => {
      const name = faker.name.firstName()
      const lastName = faker.name.lastName()
      const newUser = {
        name,
        lastName,
        email: faker.internet.email(name, lastName).toLowerCase(),
        password: faker.datatype.string(),
        role: '3'
      }

      test('Should return status code 201', async () => {
        const response = await axios.post(`${URL}/user/signup`, newUser)
        expect(response.status).toEqual(201)
      })

      describe('3.1. Log in as seller', () => {
        const keys = ['id', 'accessToken', 'refreshToken']
        let response

        test('Should return status code 200', async () => {
          response = await axios.post(`${URL}/user/login`, {
            email: newUser.email,
            password: newUser.password
          })
          expect(response.status).toBe(200)
        })

        test('Should return accessToken and refreshToken', async () => {
          const {
            data: { message }
          } = response

          expect(Object.keys(message)).toEqual(keys)

          seller.id = message.id
          seller.accessToken = message.accessToken
          seller.refreshToken = message.refreshToken
        })
      })
    })
  })

  describe('\nTest article logic: ', () => {
    const article = {
      name: 'sample text',
      price: 30
    }
    let articleId = ''

    describe('4. Create article as seller', () => {
      test('Should return status code 201', async () => {
        const {
          data: { message },
          status
        } = await axios.post(
          `${URL}/article/create`,
          { ...article, id: seller.id },
          {
            headers: {
              Authorization: `Bearer ${seller.accessToken}`
            }
          }
        )

        expect(status).toBe(201)

        articleId = message.id
      })
    })

    describe('5. Buy article as buyer', () => {
      describe('5.1. SCENARIO 1: Insufficient funds', () => {
        let response
        test('Should return status code 400', async () => {
          try {
            response = await axios.post(
              `${URL}/article/${articleId}`,
              {
                id: buyer.id
              },
              {
                headers: {
                  Authorization: `Bearer ${buyer.accessToken}`
                }
              }
            )
          } catch (error) {
            response = error.response
          } finally {
            expect(response.status).toBe(400)
          }
        })

        test('Should return error message "Insufficient funds"', () => {
          const {
            data: { message }
          } = response
          expect(message).toBe('Insufficient funds')
        })
      })

      describe('5.2. SCENARIO 2: Sufficient funds', () => {
        const funds = 35

        describe('Add funds to buyer account: ', () => {
          let response

          test('Should return status code 200', async () => {
            response = await axios.post(
              `${URL}/user/funds/${buyer.id}`,
              {
                funds
              },
              {
                headers: {
                  Authorization: `Bearer ${buyer.accessToken}`
                }
              }
            )

            expect(response.status).toBe(200)
          })

          test('Should add funds succesfully', async () => {
            const {
              data: { message }
            } = response
            expect(message.balance).toBe(buyer.expectedBalance + funds)

            buyer.expectedBalance += funds
          })
        })

        describe('Buy article: ', () => {
          test('Should return status code 200', async () => {
            const response = await axios.post(
              `${URL}/article/${articleId}`,
              {
                id: buyer.id
              },
              {
                headers: {
                  Authorization: `Bearer ${buyer.accessToken}`
                }
              }
            )

            expect(response.status).toBe(200)

            buyer.expectedBalance -= article.price
            seller.expectedBalance += article.price
          })
        })
      })
    })

    describe('6. Send funds from buyer to seller', () => {
      describe('Show money was taken from buyer', () => {
        let response

        test('Should return status code 200', async () => {
          response = await axios.get(`${URL}/user/${buyer.id}`, {
            headers: { Authorization: `Bearer ${buyer.accessToken}` }
          })

          expect(response.status).toBe(200)
        })

        test('Should have buyer balance equal expected balance', async () => {
          const {
            data: { message }
          } = response
          expect(message.balance).toBe(buyer.expectedBalance)
        })
      })

      describe('Show money was given to seller', () => {
        let response

        test('Should return status code 200', async () => {
          response = await axios.get(`${URL}/user/${seller.id}`, {
            headers: { Authorization: `Bearer ${seller.accessToken}` }
          })

          expect(response.status).toBe(200)
        })

        test('Should have seller balance equal expected balance', async () => {
          const {
            data: { message }
          } = response
          expect(message.balance).toBe(seller.expectedBalance)
        })
      })
    })

    describe('7. Pass ownership of article from seller to buyer', () => {
      let articles
      test('Should have buyer own 1 article', async () => {
        const {
          data: { message }
        } = await axios.get(`${URL}/article/owner/${buyer.id}`, {
          headers: { Authorization: `Bearer ${buyer.accessToken}` }
        })

        expect(message.length).toBe(1)

        articles = message
      })
      test('Should have buyer.id equal article.userId', async () => {
        const {
          data: { message: user }
        } = await axios.get(`${URL}/user/${buyer.id}`, {
          headers: { Authorization: `Bearer ${buyer.accessToken}` }
        })

        expect(articles[0].userId.toString).toBe(user._id.toString)
      })
    })
  })
})
