'use strict';
const path = require('path')
const express = require('express')
const xss = require('xss')
const ShoepostsService = require('./shoeposts-service')
const { requireAuth } = require('../middleware/jwt-auth')

const shoepostsRouter = express.Router()
const jsonParser = express.json();

const serializePost = ( post ) => ({
    id: post.id,
    brand: xss(post.brand),
    title: xss(post.title),
    content: xss(post.content),
})

shoepostsRouter
    .route('/')
    //GET all posts in the database
    .get((req, res, next) => {
        ShoepostsService.getAllPosts(req.app.get('db'))
            .then(posts => {
                res.json(ShoepostsService.serializePosts(posts))
            })
            .catch(next)
    })
    //POST a new post into the database
    .post(jsonParser, (req, res, next) => {
        const { brand, title, release_date, content } = req.body;
        const newPost = { brand, title, release_date, content };
        for (const field of ['brand', 'title', 'release_date', 'content'])

            if(!req.body[field]) {
                return res.status(400).json({
                    error: { message: 'Missing item from post in request body' }
                });
            }

            ShoepostsService.insertPost(
                req.app.get('db'),
                newPost
            )
                .then(post => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${post.id}`))
                        .json(serializePost(post));
                })
                .catch(next);
    });

shoepostsRouter
    .route('/:post_id')
    //get single post
    .all(checkPostExists)
    .get((req, res) => {
        res.json(ShoepostsService.serializePost(res.post))
    })
    .delete((req, res, next) => {
        ShoepostsService.deletePost(
            req.app.get('db'),
            req.params.post_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { brand, title, release_date, content } = req.body;
        if(!brand) {
            return res.status(400).json({
                error: {
                    message: 'Request must contain brand name'
                }
            });
        }
        if(!title) {
            return res.status(400).json({
                error: {
                    message: 'Request must contain title name'
                }
            });
        }
        if(!release_date) {
            return res.status(400).json({
                error: {
                    message: 'Request must contain release_date name'
                }
            });
        }
        if(!content) {
            return res.status(400).json({
                error: {
                    message: 'Request must contain content name'
                }
            });
        }
        
        const postToUpdate = {
            brand,
            title,
            release_date,
            content,
        };

        ShoepostsService.updatePost(
            req.app.get('db'),
            req.params.post_id,
            postToUpdate
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })

shoepostsRouter.route('/:post_id/comments/')
    //get comments for post
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