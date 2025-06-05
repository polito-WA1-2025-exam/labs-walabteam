import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from "react";
import './App.css';

import DefaultLayout from "./components/DefaultLayout";
import MainPage from "./components/MainPage";
import GameComplete from "./components/GameComplete";
import EndGame from "./components/EndGame";
import GameHistory from "./components/GameHistory";
import GameDetails from "./components/GameDetails";
import { Routes, Route, Navigate } from "react-router";
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

  return (
    <Routes>
      <Route element={<DefaultLayout loggedIn={loggedIn} handleLogout={handleLogout} message={message} setMessage={setMessage} /> } >
        <Route path="/" element={ <MainPage loggedIn={loggedIn}/> } />
        <Route path="/game" element={<GameComplete loggedIn={loggedIn}/> } />
        <Route path="/endGame" element={<EndGame loggedIn={loggedIn} /> } />
        <Route path="/userHistory" element={<GameHistory loggedIn={loggedIn} /> } />
        <Route path="/gameDetails/:g_id" element={<GameDetails loggedIn={loggedIn} /> } />
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm handleLogin={handleLogin} />} />
        <Route path="*" element={ <NotFound /> } />
      </Route>
    </Routes>
  )

}

export default App;