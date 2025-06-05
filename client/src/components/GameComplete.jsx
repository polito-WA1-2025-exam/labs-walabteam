import API from "../API/API.mjs";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DisplayCardBasic, DisplayCardInteractive } from './DisplayCard';

function GameComplete(props){
    //NB
    //DURING A GAME A CARD WILL HAVE NEW ATTRIBUTE isNew, obtained, round.

    const navigate = useNavigate();

    const [game, setGame] = useState([]);
    const [round, setRound] = useState([]);

    //start of the game 
    const [startTime, setStartTime] = useState(null);

    //timer
    const [timer, setTimer] = useState(30);   
    const [timerActive, setTimerActive] = useState(false); 

    //initialize first 3 cards (we don't care what was the original order)
    useEffect(() => {
        //game started
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        setStartTime(now);

        const getInitialCards = async () => {
        const cards = await API.firstCards();
        const sorted = cards.map(c => ({ ...c, obtained: true, round: 0})).sort((a, b) => a.index - b.index);
        setGame(sorted);
        }
        getInitialCards();
    }, []);

    //to check
    useEffect(() => {
      let countdown;
      if (timerActive && timer > 0) {
        countdown = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } 
      else if (timer === 0 && timerActive) {
        clearInterval(countdown);
        setTimerActive(false);
        endRound(); 
      }
      return () => clearInterval(countdown); 
    }, [timer, timerActive]);

    const startRound = async () => {
      try {
        //timer
        // Avvia il countdown
        setTimer(30);
        setTimerActive(true);

        //select currently owned cards
        const obtainedCards = game.filter(c => c.obtained === true);

        //pick the new card
        //to assign the round we look at length of game (we know 3 cards are associated to round 0)
        const r = game.length-2;
        const c_ids = game.map(c => c.id);
        const card = await API.randomCard(c_ids);
        const newCard = { ...card, isNew: true, round:r};

        //update cards for the round      
        const updatedRound = [...obtainedCards, newCard].sort((a, b) => a.index - b.index);
        setRound(updatedRound);
      } 
      catch (error) {
        console.error("Errore nella fetch:", error);
      }
    }

    const endRound = async () => {
      //timer
      setTimerActive(false);

      //pick id newCard and ask for the real value
      const id_to_guess = round.find(c => c.isNew)?.id;
      const actual_index = await API.cardIndex(id_to_guess);   

      //order of id acutal
      const order_actual = round.map(c => c.isNew ? { ...c, index: actual_index } : c)
                           .sort((a, b) => a.index - b.index).map(c=>c.id);
      //order of id user
      const order_user = round.map(c=>c.id);

      //compare id
      let right = true;
      for (let i = 0; i < order_actual.length; i++) {
        if (order_actual[i] !== order_user[i]){
          right = false;
          break;
        }
      }

      //add the new card to the game
      const card = round.find(c => c.id ===id_to_guess);
      card.isNew = false;  
      card.index = actual_index;
      if(right){
        card.obtained = true;  
      } 
      else{
        card.obtained = false;  
      }   
      
      setGame(prevGame => [...prevGame, card].sort((a, b) => a.index - b.index));
      setRound([]);
    }

    //if the value of game change: check if the game is finished or not
    useEffect(() => {
      if(game.length > 3){
        if(!props.loggedIn){
          navigate('/endGame', { state: { game } });
        }
        else{
          const owned = game.filter(item => item.obtained).length
          const lost = game.filter(item => !item.obtained).length
          let win = false;
          if(owned === 6 && lost < 3|| lost === 3){
            if(owned === 6)
              win = true;
            const outcomeInt = win ? 1 : 0;
            API.saveGame(outcomeInt, startTime, game);
            navigate('/endGame', { state: { game } });
          }

      }  
    }
    }, [game]);

    const updateIndex = (card, delta) => {
    setRound(prevRound => {
      const idx = prevRound.findIndex(c => c.id === card.id);
      const neighborIndex = idx + delta;
      if(neighborIndex < 0 || neighborIndex >= prevRound.length) 
        return prevRound;
      const new_index = prevRound[neighborIndex].index + (delta > 0 ? 0.4 : -0.4);
      return prevRound.map(c => c.id === card.id ? { ...c, index: new_index } : c).sort((a, b) => a.index - b.index);
      });
    }

    const increaseFakeIndex = (card) => updateIndex(card, +1);
    const decreaseFakeIndex = (card) => updateIndex(card, -1);

    return(
      <>
      <Container className="text-center mt-5">
      
      {round.length > 0 ?
      <>
      <Row  className="mb-5">
            <Col as="h2">Select the position of your new card</Col>
        </Row>
        
        <Row  className="mb-5">
          {round.map((c) => c.isNew ? 
                            ( <DisplayCardInteractive key={c.id} card={c} inc={increaseFakeIndex} dec={decreaseFakeIndex} />) 
                            : 
                            (<DisplayCardBasic key={c.id} image={c.image} index={c.index} situation={c.situation} /> ) )}
        </Row>
        
        <Row className="mb-2">
          <Col as="h5">⏳ Time left: {timer}s</Col>
        </Row>

        <Row  className="mb-4">
            <Col>
            <Button onClick = {endRound}>Position choosen</Button>
            </Col>
        </Row>
      </>
      :
      <>
      <Row  className="mb-5">
            <Col as="h2">Round results, your current cards...</Col>
        </Row>
        
        <Row  className="mb-5">
            {game.filter(c => c.obtained).map(c => ( <DisplayCardBasic key={c.id} image={c.image} index={c.index} situation={c.situation} /> ))}
        </Row>
        
        <Row  className="mb-4">
            <Col>
            <Button onClick = {startRound}>Ready for next round</Button>
            </Col>
        </Row>
        </>
      }          
    </Container>
  </>
  )

}

export default GameComplete;