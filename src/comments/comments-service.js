'use strict'
const xss = require('xss');

const CommentsService = {
  getById(db, id) {
    return db
      .from('kick_release_comments AS comment')
      .select(
        'comment.id',
        'comment.text',
        'comment.post_id',
        db.raw(
          `row_to_json(
            (SELECT tmp FROM (
                SELECT
                    user.id,
                    user.user_name,
                ) tmp)
            ) AS "user"`
        )
      )
      .leftJoin(
        'kick_release_users AS user',
        'comment.user_id',
        'user.id'
      )
      .where('comment.id', id)
      .first();
  },

  insertComment(db, newComment) {
    return db
      .insert(newComment)
      .into('kick_release_comments')
      .returning('*')
      .then(([comment]) => comment)
      .then(comment =>
        CommentsService.getById(db, comment.id)
      );
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      text: xss(comment.text),
      post_id: comment.post_id,
      user: comment.user || {},
    };
  }
};

module.exports = CommentsService;