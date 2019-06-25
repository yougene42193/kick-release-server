CREATE TABLE kick_release_users (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

ALTER TABLE kick_release_posts
    ADD COLUMN
        user_id INTEGER REFERENCES kick_release_users(id)
        ON DELETE SET NULL;