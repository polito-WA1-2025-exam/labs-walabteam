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
const saveGame = async (outcome_g, date, rounds) => {
  const response = await fetch(`${SERVER_URL}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      outcome: outcome_g,
      date: date,
      rounds: rounds
    }),
  });

  if (response.ok) {
    return true;
  } else {
    const err = await response.json();
    throw new Error(err.error || 'Error in saving game.');
  }
};

//user history 
const userHistory = async () => {
  const response = await fetch(SERVER_URL + "/api/gameHistory", {
    credentials: 'include',  
  });
  if (response.ok) {
    const games = await response.json();
    return games;
  } else {
    throw new Error("Ops, there is an error on the server.");
  }
};

const gameDetails = async (g_id) => {
  const response = await fetch(`${SERVER_URL}/api/gameDetail/${g_id}`, {
    credentials: 'include',  
  });
  if (response.ok) {
    const rounds = await response.json();
    return rounds;
  } else {
    throw new Error("Ops, there is an error on the server.");
  }
};

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

const API = { randomCard, firstCards, cardIndex, userHistory, saveGame, gameDetails, logIn, getUserInfo, logOut };
export default API;