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

//save game info
export const createGame = (userId, outcome, start_date) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO users_history(user_id, outcome, start_date) VALUES (?, ?, ?)`;

    db.run(sql, [userId, outcome, start_date], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
};

export const addRoundsToGame = (gameId, rounds) => {
  return new Promise((resolve, reject) => {
    /*if (!Array.isArray(rounds) || rounds.length === 0) {
      return resolve(); 
    }*/

    const sql = `INSERT INTO game_details(game_id, round, card_id, outcome) VALUES (?, ?, ?, ?)`;

    const insertions = rounds.map(r => {
      return new Promise((res, rej) => {
        db.run(sql, [gameId, r.round, r.id, r.obtained], (err) => {
          if (err) rej(err);
          else res();
        });
      });
    });

    Promise.all(insertions)
      .then(resolve)
      .catch(reject);
  });
};


//to manage display of history
//retrieve games of a user (first we have a page only with the list of games, their date and outcome)
export const games_of = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users_history WHERE user_id = ?;
    
    `;

    db.all(sql, [user_id], (err, rows) => {
      if (err)
        reject(err);
      else {
        const games = rows.map((g) => ({"g_id": g.game_id, "g_result": g.outcome, "g_date": g.start_date}));
        resolve(games);
      }
    });
  });
}

//then, clicking on game details we have to access to the list of rounds and information on single cards 
export const info_game = (g_id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT gd.round, gd.outcome, c.situation, c.image, c.bad_luck_index
                 FROM game_details gd, cards c
                 WHERE gd.game_id = ? AND gd.card_id = c.id
                 ORDER BY round;`;
    db.all(sql, [g_id], (err, rows) => {
      if (err)
        reject(err);
      else {
        const games = rows.map((r) => ({"round": r.round, "result": r.outcome, 
          "situation": r.situation, "image": r.image, "bad_luck_index": r.bad_luck_index}));
        resolve(games);
      }
    });
  });
}

//EVENTUALMENTE AGGIUNGERE/ TOGLIERE CAMPII DB
//FUNCTION NEEDED TO MANAGE USER LOGIN (it will be called in LocalStrategy not by a proper api)
//nb, reminder on promise for db: we reject only when we have errors not controlled (connection, not working functions ecc.)
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?'; //first we check username only for security reasons
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