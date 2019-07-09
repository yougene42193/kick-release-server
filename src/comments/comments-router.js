'use strict';
const express = require('express');
const path = require('path');
const CommentsService = require('./comments-service');
const { requireAuth } = require('../middleware/jwt-auth');

const commentsRouter = express.Router();
const jsonBodyParser = express.json();

const serializeComment = (comment) => ({
  id: comment.id,
  text: comment.text,
  post_id: comment.post_id,
  user: comment.user_id,
});

commentsRouter 
  //get comments
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    CommentsService.getAllComments(knexInstance)
      .then(comments => {
        res.json(comments.map(serializeComment));
      })
      .catch(next);
  })
  //Post comments
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { post_id, text } = req.body;
    const newComment = { post_id, text };

    for (const [key, value] of Object.entries(newComment))
      if (value == null) 
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    newComment.user_id = req.user.id;

    CommentsService.insertComment(
      req.app.get('db'),
      newComment
    )
      .then(comment => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.id}`))
          .json(CommentsService.serializeComment(comment));
      })
      .catch(next);
  });

module.exports = commentsRouter;