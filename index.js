const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'oracle2023', // Cambia esto a tu contraseña
  database: 'forms_db'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/create-form', (req, res) => {
  res.render('create-form');
});

app.post('/create-form', (req, res) => {
    const { title, questions } = req.body;
    db.query('INSERT INTO forms (title) VALUES (?)', [title], (err, result) => {
      if (err) throw err;
      const formId = result.insertId;
      questions.forEach(question => {
        db.query('INSERT INTO questions (form_id, question_text) VALUES (?, ?)', [formId, question.text], (err, result) => {
          if (err) throw err;
          const questionId = result.insertId;
          question.options.forEach(option => {
            db.query('INSERT INTO options (question_id, option_text) VALUES (?, ?)', [questionId, option], (err) => {
              if (err) throw err;
            });
          });
        });
      });
      res.redirect(`/form/${formId}`);
    });
  });
  
  

app.get('/form/:id', (req, res) => {
    const formId = req.params.id;
    db.query('SELECT * FROM forms WHERE id = ?', [formId], (err, formResult) => {
      if (err) throw err;
      if (formResult.length === 0) {
        return res.status(404).send('Form not found');
      }
      db.query('SELECT * FROM questions WHERE form_id = ?', [formId], (err, questionsResult) => {
        if (err) throw err;
        const questions = questionsResult || [];
        let count = 0;
        if (questions.length === 0) {
          return res.render('form', { form: formResult[0], questions: [] });
        }
        questions.forEach(question => {
          db.query('SELECT * FROM options WHERE question_id = ?', [question.id], (err, optionsResult) => {
            if (err) throw err;
            question.options = optionsResult || [];
            count++;
            if (count === questions.length) {
              res.render('form', { form: formResult[0], questions });
            }
          });
        });
      });
    });
  });

app.post('/submit-response', (req, res) => {
  const { formId, responses } = req.body;
  responses.forEach(response => {
    db.query('INSERT INTO responses (question_id, option_id) VALUES (?, ?)', [response.questionId, response.optionId], (err) => {
      if (err) throw err;
    });
  });
  res.redirect(`/results/${formId}`);
});

app.get('/results/:id', (req, res) => {
    const formId = req.params.id;
    db.query('SELECT * FROM forms WHERE id = ?', [formId], (err, formResult) => {
      if (err) throw err;
      if (formResult.length === 0) {
        return res.status(404).send('Form not found');
      }
      db.query('SELECT * FROM questions WHERE form_id = ?', [formId], (err, questionsResult) => {
        if (err) throw err;
        const questions = questionsResult || [];
        let count = 0;
        if (questions.length === 0) {
          return res.render('results', { form: formResult[0], questions: [] });
        }
        questions.forEach(question => {
          db.query('SELECT * FROM options WHERE question_id = ?', [question.id], (err, optionsResult) => {
            if (err) throw err;
            question.options = optionsResult || [];
            let count2 = 0;
            if (question.options.length === 0) {
              question.options = [];
            }
            question.options.forEach(option => {
              db.query('SELECT COUNT(*) AS count FROM responses WHERE question_id = ? AND option_id = ?', [question.id, option.id], (err, responseResult) => {
                if (err) throw err;
                option.count = responseResult[0].count;
                count2++;
                if (count2 === question.options.length) {
                  if (questions.every(q => q.options.every(o => 'count' in o))) {
                    res.render('results', { form: formResult[0], questions });
                  }
                }
              });
            });
          });
        });
      });
    });
  });
  

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

