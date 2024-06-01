CREATE DATABASE forms_db;

USE forms_db;

CREATE TABLE forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT,
  question_text VARCHAR(255) NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id)
);

CREATE TABLE options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT,
  option_text VARCHAR(255) NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT,
  option_id INT,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (option_id) REFERENCES options(id)
);
