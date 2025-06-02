import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import './App.css';

import DefaultLayout from "./components/DefaultLayout";
import QuestionDescription from "./components/QuestionDescription";
import Answers from "./components/Answers";
import MainPage from "./components/MainPage";
import Game from "./components/Game";
import StartGame from "./components/StartGame";
import GameStatus from "./components/GameStatus";
import Round from "./components/Round";
import { Routes, Route, Navigate } from "react-router";
import { AnswerForm, EditAnswerForm } from "./components/AnswerForm";
import { LoginForm } from "./components/AuthComponents";
import NotFound from "./components/NotFound";
import API from "./API/API.mjs";

function App() {
  //states to manage login: they are 'global', potentially needed by all componentsnpm
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  //called only the first time we open the app to check if a session is still open on the server, if so, 
  //it updates the user and loggedIn states (allows the user to stay logged in even after refreshing/closing the page)
  useEffect(() => {
    const checkAuth = async () => {
      const user = await API.getUserInfo(); // we have the user info here
      setLoggedIn(true);
      setUser(user);
    };
    checkAuth();
  }, []);


  //we write here handleLogin/logout because we don't just call the api, but we also manage stateVariable that have to be 'global'
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
      setUser(user);
    }
    catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    // clean up everything
    setLoggedIn(false);
    setMessage('');
  };

  //for now let's define here our states (tanto devono essere riannulati tornando qui)

  //if the user isn't logged-in edit and add pages can't be reached
  //if the user is logged-in login-page can't be reached
  const [gameH, setGameH] = useState([]);
  const [gameC, setGameC] = useState([]);

  //the idea is the following we have a game
  //and we manage the playing moment to a moment in which i change my states and my situaton
  //and the default game route that shows your current situation (so you won/lost the game, your cards )
  //GameStatus because it's a overall vision (yes, about the outcome of a round, but also show all cards )
  return (
    <Routes>
      <Route element={<DefaultLayout loggedIn={loggedIn} handleLogout={handleLogout} message={message} setMessage={setMessage} /> } >
        <Route path="/" element={ <MainPage /> } />
        <Route path="/game" element={<Game /> } >
          <Route index element={ <StartGame gameH={gameH} setGameH={setGameH} gameC={gameC} setGameC={setGameC}/> } />
          <Route path="round" element={ <Round gameH={gameH} setGameH={setGameH} gameC={gameC} setGameC={setGameC}/> } />
          <Route path="status" element={ <GameStatus gameC={gameC}/> } />
        </Route>
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm handleLogin={handleLogin} />} />
        <Route path="*" element={ <NotFound /> } />
      </Route>
    </Routes>
  )

}

export default App;