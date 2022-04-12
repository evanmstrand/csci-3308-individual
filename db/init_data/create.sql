DROP TABLE IF EXISTS review_table;
CREATE TABLE IF NOT EXISTS review_table(
  id SERIAl PRIMARY KEY,      
  artist VARCHAR(200),   
  review VARCHAR(200),
  review_date DATE
);

INSERT INTO review_table(artist, review, review_date)
VALUES('Radiohead', 'My Favorite Band!', '20200908'),
('Lamp', 'Just found out about them, theyre great', '20210429');

