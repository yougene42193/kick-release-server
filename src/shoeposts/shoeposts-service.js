const xss = require('xss')
const Treeize = require('treeize')

const ShoepostsService = {
    getAllPosts(db) {
        return db
            .from('kick_release_posts AS pst')
            .select(
                'pst.id',
                'pst.brand',
                'pst.title',
                'pst.release_date',
                'pst.content',
                ...userFields,
                db.raw(
                    `count(DISTINCT com) AS number_of_comments`
                ),
            )
            .leftJoin(
                'kick_release_comments AS com',
                'pst.id',
                'com.post_id',
            )
            .leftJoin(
                'kick_release_users AS usr',
                'pst.user_id',
                'usr.id',
            )
            .groupBy('pst.id', 'usr.id')
    },

    getById(db, id) {
        return ShoepostsService.getAllPosts(db)
            .where('pst.id', id)
            .first()
    },

    insertPost(knex, newPost) {
        return knex
            .insert(newPost)
            .into('kick_release_posts')
            .returning('*')
            .then(rows => {
                return rows[0];
            })
    },

    deletePost(knex, id) {
        return knex('kick_release_posts')
            .where({ id })
            .delete();
    },

    updatePost(knex, id, newPostFields) {
        return knex('kick_release_posts')
            .where({ id })
            .update(newPostFields);
    },

    getCommentsForPost(db, post_id) {
        return db
            .from('kick_release_comments AS com')
            .select(
                'com.id',
                'com.text',
                ...userFields
            )
            .where('com.post_id', post_id)
            .leftJoin(
                'kick_release_users AS usr',
                'com.user_id',
                'usr.id',
            )
            .groupBy('com.id', 'usr.id')
    },

    serializePosts(posts) {
        return posts.map(this.serializePost)
    },

    serializePost(post) {
        const postTree = new Treeize()

        const postData = postTree.grow([ post ]).getData()[0]

        return {
            id: postData.id,
            brand: xss(postData.brand),
            title: xss(postData.title),
            release_date: postData.release_date,
            content: xss(postData.content),
            user: postData.user || {},
            number_of_comments: Number(postData.number_of_comments) || 0,
        }
    },

    serializePostComments(comments) {
        return comments.map(this.serializePostComment)
    },

    serializePostComment(comment) {
        const commentTree = new Treeize()

        const commentData = commentTree.grow([ comment ]).getData()[0]

        return {
            id: commentData.id,
            post_id: commentData.post_id,
            text: xss(commentData.text),
            user: commentData.user || {},
        }
    },
}

const userFields = [
    'usr.id AS user:id',
    'usr.user_name AS user:user_name',
]

module.exports = ShoepostsService