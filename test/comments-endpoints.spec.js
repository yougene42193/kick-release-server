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

    it(`creates a comment, responding with 201 and the new comment`, function() {
      this.retries(3)
      const testPost = testPosts[0]
      const testUser = testUsers[0]
      const newComment = {
        text: 'Test new comment',
        post_id: testPost.id,
        user_id: testUser.id,
      }
      return supertest(app)
        .post('/api/comments')
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.text).to.eql(newComment.text)
          expect(res.body.post_id).to.eql(newComment.post_id)
          expect(res.body.user.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`)
        })
        .expect(res =>
          db
            .from('kick_release_comments')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.text).to.eql(newComment.text)
              expect(row.post_id).to.eql(newComment.post_id)
              expect(row.user_id).to.eql(newComment.user_id)
            })
        )
    })

    const requiredFields = ['text', 'user_id', 'post_id']

    requiredFields.forEach(field => {
      const testPost = testPosts[0]
      const testUser = testUsers[0]
      const newComment = {
        text: 'Test new comment',
        user_id: testUser.id,
        post_id: testPost.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newComment[field]

        return supertest(app)
          .post('/api/comments')
          .send(newComment)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })
})
