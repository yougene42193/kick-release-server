CREATE TABLE kick_release_comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    post_id INTEGER
        REFERENCES kick_release_posts(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES kick_release_users(id) ON DELETE CASCADE NOT NULL
);