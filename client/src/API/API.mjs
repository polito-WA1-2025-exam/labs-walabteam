import {Card} from "../models.mjs"

const SERVER_URL = "http://localhost:3001";

const firstCards = async () => {
  try{
    const response = await fetch(SERVER_URL + "/api/random3Cards");
    if(response.ok) {
      const cardsJson = await response.json();
      return cardsJson.map(c => new Card(c.id, c.situation, c.image, c.index));
    }
    else
      throw new Error('Server error.');
  } 
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
}

const randomCard = async (cardIds) => {
  try{
    const query = cardIds.join(','); 
    const response = await fetch(`${SERVER_URL}/api/randomCard?ids=${query}`);
    if(response.ok) {
      const cardJson = await response.json();
      return new Card(cardJson.id, cardJson.situation, cardJson.image, cardJson.index);
    }
    else
      throw new Error("Server error.");
  }
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
}

const cardIndex = async (cardId) => {
  try{
    const response = await fetch(`${SERVER_URL}/api/cardIndex/${cardId}`);
    if(response.ok) {
      const i = await response.json();
      return i;
    }
    else
      throw new Error("Server error.");
  }
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
}


//save game
const saveGame = async (outcome_g, date, rounds) => {
  try{
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
    } 
    else 
      throw new Error('Server error.');
  }
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
};

//user history 
const userHistory = async () => {
  try{
    const response = await fetch(SERVER_URL + "/api/gameHistory", {
    credentials: 'include',  
    });
    if (response.ok) {
      const games = await response.json();
      return games;
    } 
    else 
      throw new Error('Server error');
  }
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
};

const gameDetails = async (g_id) => {
  try{
      const response = await fetch(`${SERVER_URL}/api/gameDetail/${g_id}`, {
      credentials: 'include',  
    });
    if (response.ok) {
      const rounds = await response.json();
      return rounds;
    } 
    else 
      throw new Error('Server error');
  }
  catch (error) {
    throw new Error("Network error: " + error.message);
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
  try {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });

    if (response.ok) {
      const user = await response.json();
      return user;
    } 
    else {
      let errorData;
      try {
        errorData = await response.json();
      } 
      catch {
        errorData = null;
      }
      throw errorData || new Error('Server error');
    }
  } 
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
};

const logOut = async () => {
  try {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      return null;
    } 
    else {
      let errorData;
      try {
        errorData = await response.json();
      } 
      catch {
        errorData = null;
      }
      throw errorData || new Error('Server error.');
    }
  } 
  catch (error) {
    throw new Error("Network error: " + error.message);
  }
};


const API = { randomCard, firstCards, cardIndex, userHistory, saveGame, gameDetails, logIn, getUserInfo, logOut };
export default API;