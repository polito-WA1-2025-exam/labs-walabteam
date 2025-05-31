import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";

import DefaultLayout from "./components/DefaultLayout";
import QuestionDescription from "./components/QuestionDescription";
import Answers from "./components/Answers";
import Questions from "./components/Questions";
import { Routes, Route, Navigate } from "react-router";
import { AnswerForm, EditAnswerForm } from "./components/AnswerForm";
import { LoginForm } from "./components/AuthComponents";
import NotFound from "./components/NotFound";
import API from "./API/API.mjs";

function App() {
  const [questions, setQuestions] = useState([]);

  //states to manage login: they are 'global', potentially needed by all components
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  //access to all the questions
  useEffect(() => {
    const getQuestions = async () => {
      const questions = await API.getQuestions();
      setQuestions(questions);
    }
    getQuestions();
  }, []);

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

  //if the user isn't logged-in edit and add pages can't be reached
  //if the user is logged-in login-page can't be reached
  return (
    <Routes>
      <Route element={ <DefaultLayout loggedIn={loggedIn} handleLogout={handleLogout} message={message} setMessage={setMessage} /> } >
        <Route path="/" element={ <Questions questions={questions}/> } />
        <Route path="/questions/:questionId" element={ <QuestionDescription questions={questions} /> } >
          <Route index element={ <Answers user={user} /> } />
          <Route path="answers/new" element={loggedIn ? <AnswerForm addAnswer={true} user={user} /> : <Navigate replace to='/' />} />
          <Route path="answers/:answerId/edit" element={loggedIn ? <EditAnswerForm editAnswer={true} user={user} /> : <Navigate replace to='/' />} /> 
        </Route>
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm handleLogin={handleLogin} />} />
        <Route path="*" element={ <NotFound /> } />
      </Route>
    </Routes>
  )

}

export default App;