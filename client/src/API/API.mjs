import { Answer, Question } from "../models/QAModels.mjs";
import {Card} from "../models.mjs"

const SERVER_URL = "http://localhost:3001";

const firstCards = async () => {
  const response = await fetch(SERVER_URL + "/api/random3Cards");
  if(response.ok) {
    const cardsJson = await response.json();
    return cardsJson.map(c => new Card(c.id, c.situation, c.image, c.index));
  }
  else
    throw new Error("Ops, there is an error on the server.");
}

const randomCard = async (cardIds) => {
  const query = cardIds.join(','); 
  const response = await fetch(`${SERVER_URL}/api/randomCard?ids=${query}`);
  if(response.ok) {
    const cardJson = await response.json();
    return new Card(cardJson.id, cardJson.situation, cardJson.image, cardJson.index);
  }
  else
    throw new Error("Ops, there is an error on the server.");
}

const cardIndex = async (cardId) => {
  const response = await fetch(`${SERVER_URL}/api/cardIndex/${cardId}`);
  if(response.ok) {
    const i = await response.json();
    return i;
  }
  else
    throw new Error("Ops, there is an error on the server.");
}


//save game
const saveGame = async (userId, game, outcome_g) => {
  const response = await fetch(`${SERVER_URL}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      outcome: outcome_g,
      rounds: game, 
    }),
  });

  if (response.ok) {
    return true;
  } else {
    const err = await response.json();
    throw new Error(err.error || 'Error in saving game.');
  }
};


//not of interest: 

// tutte le domande
// GET /api/questions
const getQuestions = async () => {
  const response = await fetch(SERVER_URL + "/api/questions");
  if(response.ok) {
    const questionsJson = await response.json();
    return questionsJson.map(q => new Question(q.id, q.text, q.email, q.userId, q.date));
  }
  else
    throw new Error("Internal server error");
}

// tutte le risposte di una certa domanda
// GET /api/questions/<id>/answers
const getAnswers = async (questionId) => {
  const response = await fetch(`${SERVER_URL}/api/questions/${questionId}/answers`);
  if(response.ok) {
    const answersJson = await response.json();
    return answersJson.map(ans => new Answer(ans.id, ans.text, ans.email, ans.userId, ans.date, ans.score));
  }
  else
    throw new Error("Ops, there is an error on the server.");
}

// vota una certa risposta
// POST /api/answers/<id>/vote
const voteUp = async (answerId) => {
  const response = await fetch(`${SERVER_URL}/api/answers/${answerId}/vote`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({vote: "up"}),
    credentials: 'include'
  });

  // TODO: migliorare gestione errori
  if(!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

// aggiungi una nuova risposta
// POST /api/questions/<id>/answers
const addAnswer = async (answer, questionId) => {
  const response = await fetch(`${SERVER_URL}/api/questions/${questionId}/answers`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({text: answer.text, email: answer.email, userId: answer.userId, score: 0, date: answer.date}),
    credentials: 'include'
  });

  // TODO: migliorare gestione errori
  if(!response.ok) {
    let errMessage = await response.json();
    if(response.status === 422)
      errMessage = `${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`
    else
      errMessage = errMessage.error;
    throw errMessage;
  }
  else return null;
}

// modifica una risposta esistente
// PUT /api/answers/<id>
const updateAnswer = async (answer) => {
  const response = await fetch(`${SERVER_URL}/api/answers/${answer.id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({text: answer.text, email: answer.email, userId: answer.userId, score: answer.score, date: answer.date}),
    credentials: 'include'
  });

  // TODO: migliorare gestione errori
  if(!response.ok) {
    let errMessage = await response.json();
    if(response.status === 422)
      errMessage = `${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`
    else
      errMessage = errMessage.error;
    throw errMessage;
  }
  else return null;
}

//api to ask for a user
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

//to manage open session (the app is closed and reopend and the session, so the login, is still valid)
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const API = { randomCard, firstCards, cardIndex, saveGame, getAnswers, getQuestions, voteUp, addAnswer, updateAnswer, logIn, getUserInfo, logOut };
export default API;