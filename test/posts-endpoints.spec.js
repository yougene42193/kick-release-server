const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Posts Endpoints', function() {
  let db

  const {
    testUsers,
    testPosts,
    testComments,
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

  describe(`GET /api/posts`, () => {
    context(`Given no posts`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/posts')
          .expect(200, [])
      })
    })

    context('Given there are posts in the database', () => {
      beforeEach('insert posts', () =>
        helpers.seedPostsTables(
          db,
          testUsers,
          testPosts,
          testComments,
        )
      )

      it('responds with 200 and all of the posts', () => {
        const expectedPosts = testPosts.map(post =>
          helpers.makeExpectedPost(
            testUsers,
            post,
            testComments,
          )
        )
        return supertest(app)
          .get('/api/posts')
          .expect(200, expectedPosts)
      })
    })

    context(`Given an XSS attack post`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPost,
        expectedPost,
      } = helpers.makeMaliciousPost(testUser)

      beforeEach('insert malicious post', () => {
        return helpers.seedMaliciousPost(
          db,
          testUser,
          maliciousPost,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/posts`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedPost.title)
            expect(res.body[0].content).to.eql(expectedPost.content)
          })
      })
    })
  })

  describe(`GET /api/posts/:post_id`, () => {
    context(`Given no posts`, () => {
      it(`responds with 404`, () => {
        const postId = 123456
        return supertest(app)
          .get(`/api/posts/${postId}`)
          .expect(404, { error: `Post doesn't exist` })
      })
    })

    context('Given there are posts in the database', () => {
      beforeEach('insert posts', () =>
        helpers.seedPostsTables(
          db,
          testUsers,
          testPosts,
          testComments,
        )
      )

      it('responds with 200 and the specified post', () => {
        const postId = 2
        const expectedThing = helpers.makeExpectedPost(
          testUsers,
          testPosts[postId - 1],
          testComments,
        )

        return supertest(app)
          .get(`/api/posts/${postId}`)
          .expect(200, expectedPost)
      })
    })

    context(`Given an XSS attack post`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPost,
        expectedPost,
      } = helpers.makeMaliciousPost(testUser)

      beforeEach('insert malicious post', () => {
        return helpers.seedMaliciousPost(
          db,
          testUser,
          maliciousPost,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/posts/${maliciousPost.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedPost.title)
            expect(res.body.content).to.eql(expectedPost.content)
          })
      })
    })
  })

  describe(`GET /api/posts/:post_id/comments`, () => {
    context(`Given no posts`, () => {
      it(`responds with 404`, () => {
        const postId = 123456
        return supertest(app)
          .get(`/api/posts/${postId}/comments`)
          .expect(404, { error: `Post doesn't exist` })
      })
    })

    context('Given there are comments for thing in the database', () => {
      beforeEach('insert posts', () =>
        helpers.seedPostsTables(
          db,
          testUsers,
          testPosts,
          testComments,
        )
      )

      it('responds with 200 and the specified comments', () => {
        const postId = 1
        const expectedComments = helpers.makeExpectedPostComments(
          testUsers, postId, testComments
        )

        return supertest(app)
          .get(`/api/posts/${postId}/comments`)
          .expect(200, expectedComments)
      })
    })
  })
})
