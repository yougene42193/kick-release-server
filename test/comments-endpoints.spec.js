const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers.js')

describe('Comments Endpoints', function() {
  let db

  const {
    testPosts,
    testUsers,
  } = helpers.makePostsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/comments`, () => {
    beforeEach('insert posts', () =>
      helpers.seedPostsTables(
        db,
        testUsers,
        testPosts,
      )
    )

    const requiredFields = ['text', 'post_id']

    requiredFields.forEach(field => {
      const testPost = testPosts[0]
      const testUser = testUsers[0]
      const newComment = {
        text: 'Test new comment',
        
        post_id: testPost.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newComment[field]

        return supertest(app)
          .post('/api/comments')
          .send(newComment)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })
})
