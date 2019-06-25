ALTER TABLE kick_release_posts
    DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS kick_release_users;