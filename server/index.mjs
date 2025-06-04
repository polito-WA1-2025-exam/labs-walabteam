import express from 'express';
import morgan from 'morgan';
import {check, validationResult} from 'express-validator';
import {listQuestions, getQuestion, listAnswersOf, addAnswer, updateAnswer, voteAnswer, getUser} from './dao.mjs';
import {first_cards, random_card_no_index, card_index} from './dao.mjs';
import cors from 'cors';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// init
const app = express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev')); 

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true //allow server to receive cookies also from other origins
};

app.use(cors(corsOptions));

//to review:
passport.use(new LocalStrategy(async function verify(username, password, cb) {//we need to write the verify func the strategy uses
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.'); //login not successfull (error message not mandatory)
    
  return cb(null, user); //successfull login, we return the callback (not the user)
}));

//initialize session
app.use(session({
  secret: "shhhhh... it's a secret!", //secret sentence to create session
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session')); //we define that session is used to authenticate

//we define information we want to store in the session
passport.serializeUser(function (user, cb) {
  cb(null, user); //user can be replace by whatever object we want
});
passport.deserializeUser(function (user, cb) {
  return cb(null, user); //in all http request we can access this fields through req.user
});




//OKKKKKKKKKKKKKKKKKK
 /*
URL: `/api/random3Cards`
HTTP Method: GET.
Description: Retrieve 3 random cards.
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). In case of success, returns an array of cardss in JSON format. Else, returns an error message.
Response body:
[
  {
    "id": 1,
    "situation": "Shark Attack! Lose one arm and one leg",
    "image": "https://d3fa68hw0m2vcc.cloudfront.net/f47/200227261.jpeg",
    "index": 96.5
  },
  ...
]*/

app.get('/api/random3Cards', (req, res) => {
  first_cards()
  .then(cards => res.json(cards))
  .catch(() => res.status(500).end());
});

 /*
URL: `/api/randomCard/<ids>`
HTTP Method: GET.
Description: Retrieve a random card not being one among the given cards with a fake index (0)
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). In case of success, returns an array of cards in JSON format. Else, returns an error message.
Response body:
  {
    "id": 1,
    "situation": "Shark Attack! Lose one arm and one leg",
    "image": "https://d3fa68hw0m2vcc.cloudfront.net/f47/200227261.jpeg",
    "index": 0
  }
*/
app.get('/api/randomCard', async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (!idsParam) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    const idsArray = idsParam.split(',').map(id => id.trim());

    const card = await random_card_no_index(idsArray);

    if (card.error) {
      res.status(404).json(card);
    } 
    else {
      res.json(card);
    }
  } 
  catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

/*URL: `/api/cardIndex/<id>`
HTTP Method: GET.
Description: Retrieve the index of a card given its id
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). In case of success, returns an array of cards in JSON format. Else, returns an error message.
Response body: { 5 }
*/
app.get('/api/cardIndex/:id', async (req, res) => {
  try {
    const i = await card_index(req.params.id);

    if (i.error) {
      res.status(404).json(i);
    } 
    else {
      res.json(i);
    }
  } 
  catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

//add api to retrieve card info

//
/*URL: `/api/cardIndex/<id>`
HTTP Method: POST.
Description: Upload info on game
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). 
Request body:

Response body: 
*/

//RICONTROLLARE ( da validare )
app.post('/api/games', isLoggedIn, async (req, res) => {
  const { outcome, rounds } = req.body;
  const userId =  req.user.id;

  try {
    const gameId = await createGame(userId, outcome);
    await addRoundsToGame(gameId, rounds);

    res.status(201).location(`/api/games/${gameId}`).end();
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({ error: 'Impossible to create the game and rounds.' });
  }
});

//TO REVIEW:

//to protect apis (we can also write a isAdmin or something else)
//ATTENTION: THE CHECK WITH THIS FUNCTION IS ONLY SERVER SIDE
//WE HAVE TO BLOCK USER POSSIBLE ACTIONS ALSO 'VISUALLY' FOR EXAMPLE MAKING SOME PAGES UNACCESSIBLE
//(and still we have to manage the server error arised when a non allowed user try to do something)
const isLoggedIn = (req, res, next) => {//next is to call the next middleware or the route
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}


// GET /api/questions
app.get('/api/questions', (req, res) => {
  listQuestions()
  .then(questions => res.json(questions))
  .catch(() => res.status(500).end());
});

// GET /api/questions/<id>
app.get('/api/questions/:id', async (request, response) => {
  try {
    const question = await getQuestion(request.params.id);
    if(question.error) {
      response.status(404).json(question);
    } else {
      response.json(question);
    }
  }
  catch {
    response.status(500).end();
  }
});

// GET /api/questions/<id>/answers
app.get('/api/questions/:id/answers', async (req, res) => {
  try {
    const answers = await listAnswersOf(req.params.id);
    res.json(answers);
  } catch {
    res.status(500).end();
  }
});

// POST /api/questions/<id>/answers
app.post('/api/questions/:id/answers', isLoggedIn, [
  check('text').notEmpty(),
  check('email').isEmail(),
  check('score').isNumeric(),
  check('date').isDate({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const newAnswer = req.body;
  const questionId = req.params.id;

  if(newAnswer.email !== req.user.username){
    return res.status(401).json({error: 'You can add answer only from your account'});
  }

  try {
    const id = await addAnswer(newAnswer, questionId);
    res.status(201).location(id).end();
  } catch(e) {
    console.error(`ERROR: ${e.message}`);
    res.status(503).json({error: 'Impossible to create the answer.'});
  }
});

// PUT /api/answers/<id>
app.put('/api/answers/:id', isLoggedIn, [
  check('text').notEmpty(),
  check('email').isEmail(),
  check('score').isNumeric(),
  check('date').isDate({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const answerToUpdate = req.body;
  answerToUpdate.id = req.params.id;

  if(answerToUpdate.email !== req.user.username){
    return res.status(401).json({error: 'You can\'t change the author of your question'});
  }

  try {
    await updateAnswer(answerToUpdate);
    res.status(200).end();
  } catch {
    res.status(503).json({'error': `Impossible to update answer #${req.params.id}.`});
  }
});

// POST /api/answers/<id>/vote
app.post('/api/answers/:id/vote', isLoggedIn, [
  check('vote').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const answerId = req.params.id;
  try {
    const num = await voteAnswer(answerId, req.body.vote);
    if(num === 1) {
      setTimeout(() => res.status(204).end(), 3000);
    }
    else
      throw new Error(`Error in casting a vote for answer #${answerId}`);
  } catch(e) {
    res.status(503).json({error: e.message});
  }
});

// POST /api/sessions 
//api for login, called if authentication is successfull
//(check if request contains username and password fields)
app.post('/api/sessions', passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user); //the response body depends on request body
});

//check if there is an open session
// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);} //if session open we return the corresponding user
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
//to logout (session and corresponding id: deleted)
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });