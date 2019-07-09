const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
      {
        id: 1,
        user_name: 'test-user-1',
        password: 'password',
      },
      {
        id: 2,
        user_name: 'test-user-2',
        password: 'password',
      },
      {
        id: 3,
        user_name: 'test-user-3',
        password: 'password',
      },
      {
        id: 4,
        user_name: 'test-user-4',
        password: 'password',
      },
    ]
  }
  
  function makePostsArray(users) {
    return [
      {
        id: 1,
        title: 'First test post!',
        brand: 'Jordan',
        release_date: '2019-07-02',
        user_id: users[0].id,
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      },
      {
        id: 2,
        title: 'Second test post!',
        brand: 'Nike',
        release_date: '2019-07-12',
        user_id: users[1].id,
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      },
      {
        id: 3,
        title: 'Third test post!',
        brand: 'Yeezy',
        release_date: '2019-11-21',
        user_id: users[2].id,
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      },
      {
        id: 4,
        title: 'Fourth test post!',
        brand: 'Adidas',
        release_date: '2019-01-02',
        user_id: users[3].id,
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      },
    ]
  }
  
  function makeCommentsArray(users, posts) {
    return [
      {
        id: 1,
        text: 'First test comment!',
        post_id: posts[0].id,
        user_id: users[0].id,
      },
      {
        id: 2,
        text: 'Second test comment!',
        post_id: posts[0].id,
        user_id: users[1].id,
      },
      {
        id: 3,
        text: 'Third test comment!',
        post_id: posts[0].id,
        user_id: users[2].id,
      },
      {
        id: 4,
        text: 'Fourth test comment!',
        post_id: posts[0].id,
        user_id: users[3].id,
      },
    ];
  }
  
  function makeExpectedPost(users, post, comments=[]) {
    const user = users
      .find(user => user.id === post.user_id)
  
    const number_of_comments = comments
      .filter(comment => comment.post_id === post.id)
      .length

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      number_of_comments,
      user: {
        id: user.id,
        user_name: user.user_name,
      },
    }
  }
  
  function makeExpectedPostComments(users, postId, comments) {
    const expectedComments = comments
      .filter(comment => comment.post_id === postId)
  
    return expectedComments.map(comment => {
      const commentUser = users.find(user => user.id === comment.user_id)
      return {
        id: comment.id,
        text: comment.text,
        user: {
          id: commentUser.id,
          user_name: commentUser.user_name,
        }
      }
    })
  }
  
  function makeMaliciousPost(user) {
    const maliciousPost = {
      id: 911,
      brand: 'fake brand',
      release_date: '2019-08-22',
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      user_id: user.id,
      content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedPost = {
      ...makeExpectedPost([user], maliciousPost),
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
      maliciousPost,
      expectedPost,
    }
  }
  
  function makePostsFixtures() {
    const testUsers = makeUsersArray()
    const testPosts = makePostsArray(testUsers)
    const testComments = makeCommentsArray(testUsers, testPosts)
    return { testUsers, testPosts, testComments }
  }
  
  function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        kick_release_posts,
        kick_release_users,
        kick_release_comments
        RESTART IDENTITY CASCADE`
    )
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('kick_release_users').insert(preppedUsers)
      .then(() =>
        db.raw(
          `SELECT setval('kick_release_users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
    )
}
  
  function seedPostsTables(db, users, posts, comments=[]) {
    return db
      .into('kick_release_users')
      .insert(users)
      .then(() =>
        db
          .into('kick_release_posts')
          .insert(posts)
      )
      .then(() =>
        comments.length && db.into('kick_release_comments').insert(comments)
      )
  }
  
  function seedMaliciousPost(db, user, post) {
    return db
      .into('kick_release_users')
      .insert([user])
      .then(() =>
        db
          .into('kick_release_posts')
          .insert([post])
      )
  }

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.user_name,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
  }
  
  module.exports = {
    makeUsersArray,
    makePostsArray,
    makeExpectedPost,
    makeExpectedPostComments,
    makeMaliciousPost,
    makeCommentsArray,
    makePostsFixtures,
    cleanTables,
    seedUsers,
    seedPostsTables,
    seedMaliciousPost,
    makeAuthHeader,
  }
  