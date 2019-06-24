'use strict';
const express = require('express')
const ShoepostsService = require('./shoeposts-service')
const { requireAuth } = require('../middleware/jwt-auth')

const shoepostsRouter = express.Router()

shoepostsRouter
    .route('/')
    .get((req, res, next) => {
        ShoepostsService.getAllPosts(req.app.get('db'))
            .then(posts => {
                res.json(ShoepostsService.serializePosts(posts))
            })
            .catch(next)
    })

shoepostsRouter
    .route('/:post_id')
    .all(requireAuth)
    .all(checkPostExists)
    .get((req, res) => {
        res.json(ShoepostsService.serializePost(res.post))
    })

shoepostsRouter.route('/:post_id/comments/')
    .all(requireAuth)
    .all(checkPostExists)
    .get((req, res, next) => {
        ShoepostsService.getCommentsForPost(
            req.app.get('db'),
            req.params.post_id
        )
            .then(comments => {
                res.json(ShoepostsService.serializePostComments(comments))
            })
            .catch(next)
    })

async function checkPostExists(req, res, next) {
    try {
        const post = await ShoepostsService.getById(
            req.app.get('db'),
            req.params.post_id
        )

        if(!post)
            return res.status(404).json({
                error: `Post doesn't exist`
            })

        res.post = post
        next()
    }   catch(error) {
        next(error)
    }
}

module.exports = shoepostsRouter