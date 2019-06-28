'use strict'
const xss = require('xss');

const CommentsService = {
  getAllComments(knex) {
    return knex.select('*').from('kick_release_comments');
  },

  getById(db, id) {
    return db
      .from('kick_release_comments AS comm')
      .select(
        'comm.id',
        'comm.text',
        'comm.post_id',
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id,
                  usr.user_name,
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .leftJoin(
        'kick_release_users AS usr',
        'comm.user_id',
        'usr.id'
      )
      .where('comm.id', id)
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
    const { user } = comment;
    return {
      id: comment.id,
      text: xss(comment.text),
      post_id: comment.post_id,
      user: {
        id: user.id,
        user_name: user.user_name
      },
    };
  }
};

module.exports = CommentsService;