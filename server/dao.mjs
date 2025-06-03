import sqlite from 'sqlite3';
import { Card } from './models.mjs';
import crypto from 'crypto'; //used to compare passwords

//open db
const db = new sqlite.Database('db_StuffHappens.sqlite', (err) => {
  if (err) throw err;
});

//pick 3 cards (first round)
export const first_cards = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM cards ORDER BY RANDOM() LIMIT 3;';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const cards = rows.map((c) => new Card(c.id, c.situation, c.image, c.bad_luck_index));
        resolve(cards);
      }
    });
  });
}

//pick a card given some already picked cards (fake index given, initialized at 0)
export const random_card_no_index = (excludedCards) => {
  return new Promise((resolve, reject) => {
    const placeholders = excludedCards.map(() => '?').join(',');
    const sql = `SELECT * FROM cards WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1;`;

    db.get(sql, excludedCards, (err, row) => {
      if (err)
        reject(err);
      else {
        const card = new Card(row.id, row.situation, row.image, 0);
        resolve(card);
      }
    });
  });
}

//pick the actual index of a given card
export const card_index = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT bad_luck_index FROM cards WHERE id = ?;`;

    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else {
        resolve(row.bad_luck_index);
      }
    });
  });
}









// get a question given its id
export const getQuestion = (id) => {
  return new Promise ((resolve, reject) => {
    const sql = 'SELECT question.*, user.email FROM question JOIN user ON question.authorId = user.id WHERE question.id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({error: "Question not available, check the inserted id."});
      } else {
        resolve(new Question(row.id, row.text, row.email, row.authorId, row.date));
      }
    });
  });
}

// add a new question
export const addQuestion = (question) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO question(text, authorId, date) VALUES (?,?,?)';
    db.run(sql, [question.text, question.userId, question.date], function(err) {
      if (err)
        reject(err);
      else 
        resolve(this.lastID);
    });
  });
}

// get all the answer of a given question
export const listAnswersOf = (questionId) => {
  return new Promise ((resolve, reject) => {
    const sql = 'SELECT answer.*, user.email FROM answer JOIN user ON answer.authorId = user.id WHERE answer.questionId = ?';
    db.all(sql, [questionId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const answers = rows.map((ans) => new Answer(ans.id, ans.text, ans.email, ans.authorId, ans.date, ans.score));
        resolve(answers);
      }
    });
  });
}

// add a new answer
export const addAnswer = (answer, questionId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO answer(text, authorId, date, score, questionId) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [answer.text, answer.userId, answer.date, answer.score, questionId], function (err) {
      if (err)
        reject(err);
      else
        resolve(this.lastID);
    });
  });
}

// update an existing answer
export const updateAnswer = (answer) => {
  return new Promise((resolve, reject) => {
    let sql = "UPDATE answer SET text = ?, authorId = ?, date = ?, score = ? WHERE id = ?"
    db.run(sql, [answer.text, answer.userId, answer.date, answer.score, answer.id], function (err) {
      if (err)
        reject(err);
      else
        resolve(this.lastID);
    });
  });
}

// vote for an answer
export const voteAnswer = (answerId, vote) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE answer SET score = score + ? WHERE id= ?';
    const delta = vote === 'up' ? 1 : -1;
    db.run(sql, [delta, answerId], function(err) {
      if (err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
}
// get all the questions
export const listQuestions = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT question.*, user.email FROM question JOIN user ON question.authorId = user.id';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const questions = rows.map((q) => new Question(q.id, q.text, q.email, q.authorId, q.date));
        resolve(questions);
      }
    });
  });
}

//EVENTUALMENTE AGGIUNGERE/ TOGLIERE CAMPII DB
//FUNCTION NEEDED TO MANAGE USER LOGIN (it will be called in LocalStrategy not by a proper api)
//nb, reminder on promise for db: we reject only when we have errors not controlled (connection, not working functions ecc.)
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?'; //first we check email only for security reasons
    db.get(sql, [username], (err, row) => {
      if (err) { 
        reject(err); 
      }
      //if no db connection error, i check if the user exists or not
      else if (row === undefined) { //if the email doesn't exist
        resolve(false); //remember: resolve because it's not a problem of the db
      }
      else {
        //if the user is found we check the password eventualemnete 
        const user = {id: row.id, username: row.username};
        
        //crypto.scrypt receives password, salt, length of hash and a function that manage the 
        //hashed password obtained and the case of err
        //(similar logic to db.get receiving the sql and a function managing the result of the sql or the err) 
        crypto.scrypt(password, row.salt, 16, function(err, hashedPassword) {
          if (err) reject(err); //error not really controlled by us (related to the function)
          //if no error we can compare the two password
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user); //if the user exist with that password I return it's information
        });
      }
    });
  });
};