import sqlite from 'sqlite3';
import { Card } from './models.mjs';
import crypto from 'crypto'; 

//open db
const db = new sqlite.Database('db_StuffHappens.sqlite', (err) => {
  if (err) throw err;
});

//pick initial 3 cards
export const first_cards = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM cards ORDER BY RANDOM() LIMIT 3;';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else if (!rows || rows.length === 0) {
        reject(new Error("No cards in the db."));
      }
      else {
        const cards = rows.map((c) => new Card(c.id, c.situation, c.image, c.bad_luck_index));
        resolve(cards);
      }
    });
  });
}

//pick a card given some already picked cards (set a fake index, 0)
export const random_card_no_index = (excludedCards) => {
  return new Promise((resolve, reject) => {
    const placeholders = excludedCards.map(() => '?').join(',');
    const sql = `SELECT * FROM cards WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1;`;

    db.get(sql, excludedCards, (err, row) => {
      if (err)
        reject(err);
      else if (!row) {
        reject(new Error("No cards avialable."));
      }
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
      else if (!row) {
        reject(new Error(`Card with id: ${id} not found.`));
      }
      else {
        resolve(row.bad_luck_index);
      }
    });
  });
}

//save general game info
export const createGame = (userId, outcome, start_date) => {
  return new Promise((resolve, reject) => {
     if (!userId || !outcome || !start_date) {
      return reject(new Error("Empty parameters."));
    }

    const sql = `INSERT INTO users_history(user_id, outcome, start_date) VALUES (?, ?, ?)`;

    db.run(sql, [userId, outcome, start_date], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
};

//save detailed rounds info
export const addRoundsToGame = (gameId, rounds) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(rounds) || rounds.length === 0) {
      return reject(new Error("Rounds is empty or not valid."));
    }

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

//retrieve games of a user
export const games_of = (user_id) => {
  return new Promise((resolve, reject) => {
    if (!user_id) return reject(new Error("User id not valid."));

    const sql = `SELECT * FROM users_history WHERE user_id = ?;`;

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

//retrieve detailed info on a game 
export const info_game = (g_id) => {
  return new Promise((resolve, reject) => {
    if (!g_id) return reject(new Error("Game id not valid."));

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

//retrive user given username and password
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    if (!username || !password) return reject(new Error("Username or password not received."));

    const sql = 'SELECT * FROM users WHERE username = ?'; 
    db.get(sql, [username], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, username: row.username};

        crypto.scrypt(password, row.salt, 16, function(err, hashedPassword) {
          if (err) reject(err);

          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};