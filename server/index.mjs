import express from 'express';
import morgan from 'morgan';
import { check, validationResult } from 'express-validator';
import { getUser, first_cards, random_card_no_index, card_index, createGame, addRoundsToGame, games_of, info_game} from './dao.mjs';
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

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');     
  return cb(null, user);
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
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  return cb(null, user); //in all http request we can access this fields through req.user
});

const isLoggedIn = (req, res, next) => {//next is to call the next middleware or the route
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized user'});
}

function handleServerError(res, route, error) {
  console.error(`[ERROR] ${route}: ${error.message}`);
  return res.status(500).json({ error: 'Internal server error.' });
}

app.get('/api/random3Cards', async (req, res) => {
  try {
    const cards = await first_cards();
    res.json(cards);
  } 
  catch (error) {
    handleServerError(res, '/api/random3Cards', error)
  }
});

app.get('/api/randomCard', [check('ids').notEmpty().withMessage('IDs required') ], async (req, res) => {
  const errors = validationResult(req); //check "check" results
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  try {
    const idsArray = req.query.ids.split(',').map(id => id.trim());
    const card = await random_card_no_index(idsArray);
    if (card.error) res.status(404).json(card);
    else res.json(card);
  } 
  catch (error) {
    handleServerError(res, '/api/randomCard', error);
  }
});

app.get('/api/cardIndex/:id', [check('id').notEmpty().withMessage('Invalid card ID') ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  try {
    const i = await card_index(req.params.id);
    if (i.error) res.status(404).json(i);
    else res.json(i);
  } 
  catch (error) {
    handleServerError(res, '/api/cardIndex/:id', error);
  }
});

//check outcome probably not a string
app.post('/api/games', isLoggedIn, 
  [check('rounds').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  const { outcome, date, rounds } = req.body;
  const userId = req.user.id;

  try {
    const gameId = await createGame(userId, outcome, date);
    await addRoundsToGame(gameId, rounds);
    res.status(201).end();
  } catch (error) {
    handleServerError(res, '/api/games', error);
  }
});

app.get('/api/gameHistory', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id; 
    const i = await games_of(userId);

    if (i.error) {
      res.status(404).json(i);
    } 
    else {
      res.json(i);
    }
  } 
  catch (error) {
    handleServerError(res, '/api/gameHistory', error)
  }
});

app.get('/api/gameDetail/:id_g', isLoggedIn, [check('id_g').notEmpty().withMessage('Game ID is required')], 
  async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  try {
    const gameId = req.params.id_g;
    const i = await info_game(gameId);
    if (i.error) res.status(404).json(i);
    else res.json(i);
  } catch (error) {
    handleServerError(res, '/api/gameDetail/:id_g', error);
  }
});

//session handlers
app.post('/api/sessions', passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user); 
});

app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);} //if session open we return the corresponding user
  else
    res.status(401).json({error: 'Not authenticated'});
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });