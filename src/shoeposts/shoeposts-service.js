const xss = require('xss')
const Treeize = require('treeize')

const ShoepostsService = {
    getAllPosts(db) {
        return db
            .from('kick_release_posts AS post')
            .select(
                'post.id',
                'post.title',
                'post.content',
                ...userFields,
                db.raw(
                    `count(DISTINCT rev) AS number_of_comments`
                ),
            )
            .leftJoin(
                'kick_release_comments AS rev',
                'post.id',
                'comment.post.id',
            )
            .leftJoin(
                'kick_release_users AS user',
                'post.user_id',
                'user.id',
            )
            .groupBy('post.id', 'user.id')
    },

    getById(db, id) {
        return ShoepostsService.getAllPosts(db)
            .where('post.id', id)
            .first()
    },

    getCommentsForPost(db, post_id) {
        return db
            .from('kick_release_comments AS comment')
            .select(
                'comment.id',
                'comment.text',
                ...userFields
            )
            .where('comment.post_id', post_id)
            .leftJoin(
                'kick_release_users AS user',
                'comment.user_id',
                'user.id',
            )
            .groupBy('comment.id', 'comment.id')
    },

    serializePosts(posts) {
        return posts.map(this.serializePost)
    },

    serializePost(post) {
        const postTree = new Treeize()

        const postData = postTree.grow([ post ]).getData()[0]

        return {
            id: postData.id,
            title: xss(postData.title),
            content: xss(postData.content),
            user: postData.user || {},
            number_of_reviews: Number(postData.number_of_reviews) || 0,
        }
    },

    serializePostComments(comments) {
        return comments.map(this.serializePostComments)
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
    'user.id AS user:id',
    'user.user_name AS user:user_name',
]

module.exports = ShoepostsService