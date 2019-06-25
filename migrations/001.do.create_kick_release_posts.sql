CREATE TABLE kick_release_posts (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    title TEXT NOT NULL,
    release_date DATE NOT NULL,
    content TEXT
);