BEGIN;

TRUNCATE
    kick_release_comments,
    kick_release_posts,
    kick_release_users
    RESTART IDENTITY CASCADE;

INSERT INTO kick_release_users (user_name, password)
VALUES
  ('demouser', 'demopassword123'),
  ('demoshoe', 'shoedemo123'),
  ('kicksdemo', 'kicksdemo123'),
  ('username1', 'password1'),
  ('whenisitout', 'password123');

INSERT INTO kick_release_posts (brand, title, release_date, user_id, content)
VALUES
  ('Jordan', 'Air Jordan 3 "Knicks"', '09-07-2019', 1, 'White/Old Royal-University Orange-Tech Grey'),
  ('Jordan', 'Travis Scott x Air Jordan 1 Low', '09-14-2019', 1, 'Black/Sail-Dark Mocha-University Red'),
  ('Jordan', 'Air Jordan 13 "Lakers"', '07-20-2019', 1, 'White/Black-Court Purple-University Gold'),
  ('Yeezy', 'Adidas Yeezy 350 Boost V2 "Lundmark"', '07-13-2019', 3, null),
  ('Yeezy', 'Adidas Yeezy 350 Boost V2 "Lundmark Reflective"', '07-11-2019', 4, '$220'),
  ('Yeezy', 'Adidas Yeezy Boost 700 “Utility Black”', '06-29-2019', 3, 'Black Leather'),
  ('Adidas', 'Keith Haring x adidas Rivalry High', '06-30-2019', 2, 'Crystal White/Blue/Orange'),
  ('Nike', 'Mamba Focus', '06-30-2019', 3, null),
  ('Nike', 'Stranger Things x Nike Nike Blazer High "OG Pack"', '07-01-2019', 1, null),
  ('Nike', 'Nike Vandalized LX', '07-01-2019', 1, 'White/Platinum Tint-Game Royal');

INSERT INTO kick_release_comments (
  text,
  post_id,
  user_id
) VALUES
  (
      'New yeezys already?',
      4,
      1
  ),
  (
      'These are probably better then the regular ones',
      5,
      3
  );

COMMIT;
