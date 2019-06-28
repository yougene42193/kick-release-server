CREATE TABLE kick_release_posts (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    release_date TEXT NOT NULL,
    content TEXT
);