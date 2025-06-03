import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router";

function GameComplete(props){

  //based on the fact we are logged or not
  //1.the condition ending the game changes
  //2.the game must be saved or not

    //NB
    //DURING A GAME A CARD WILL HAVE NEW ATTRIBUTE isNew, obtained, round.

    const [game, setGame] = useState([]);
    const [round, setRound] = useState([]);
    const [roundActive, setRoundActive] =  useState(false); //to manage visualization
    
    //const navigate = useNavigate();

    //initialize first 3 cards (we don't care what was the original order)
    useEffect(() => {
        const getInitialCards = async () => {
        const cards = await API.firstCards();
        const sorted = cards.map(c => ({ ...c, obtained: true, round: 0})).sort((a, b) => a.index - b.index);
        setGame(sorted);
        }
        getInitialCards();
    }, []);

    const startRound = async () => {
      try {
        setRoundActive(true);

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
      setRoundActive(false);

      //pick id newCard and ask for the real value
      const id_to_guess = structuredClone(round).find(c => c.isNew)?.id;
      const actual_index = await API.cardIndex(id_to_guess);   

      //order of id acutal
      const order_actual = structuredClone(round).map(c => c.isNew ? { ...c, index: actual_index } : c)
                           .sort((a, b) => a.index - b.index).map(c=>c.id);
      //order of id user
      const order_user = structuredClone(round).map(c=>c.id);

      //compare id
      let right = true;
      for (let i = 0; i < order_actual.length; i++) {
        if (order_actual[i] !== order_user[i]){
          right = false;
          break;
        }
      }

      //add the new card to the game
      const card = structuredClone(round).find(c => c.id ===id_to_guess);
      card.isNew = false;  
      card.index = actual_index;
      if(right){
        card.obtained = true;  
      } 
      else{
        card.obtained = false;  
      }   
      
      setGame(prevGame => [...prevGame, card].sort((a, b) => a.index - b.index));

      //claen round
      setRound([]);
    }

    const increaseFakeIndex = (card) => {
    //prendo la carta successiva estraggo il suo punteggio e faccio update del fake punteggio della mia carta
    //i'm sure that if i update next_card+0.4 i get a index greater than the card but less than the next
    
      setRound(prevGameC => {
        const next_pos = prevGameC.findIndex(c => c.id === card.id) + 1;
        const new_index = prevGameC[next_pos].index + 0.4;
        const updated_r = prevGameC.map(c => c.id === card.id ? { ...c, index: new_index } : c ).sort((a, b) => a.index - b.index);
        return updated_r;
        }
      )
    }
    const decreaseFakeIndex = (card) => {
    //prendo la carta successiva estraggo il suo punteggio e faccio update del fake punteggio della mia carta
    //i'm sure that if i update next_card+0.4 i get a index greater than the card but less than the next
    
      setRound(prevGameC => {
        const prev_pos = prevGameC.findIndex(c => c.id === card.id) - 1;
        const new_index = prevGameC[prev_pos].index - 0.4;
        const updated_r = prevGameC.map(c => c.id === card.id ? { ...c, index: new_index } : c ).sort((a, b) => a.index - b.index);
        return updated_r;
        }
      )
    }

    return(
        <>
            <Container className="text-center mt-5">
              {roundActive?
              <>
              <Row  className="mb-5">
                    <Col as="h2">Select the position of your new card</Col>
                </Row>
                
                <Row  className="mb-5">
                    {round.map((c) => <DisplayCard key={c.id} card={c} inc={increaseFakeIndex} dec={decreaseFakeIndex}/>)}
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
                    <Col as="h2">Your current cards won/notWon</Col>
                </Row>
                
                <Row  className="mb-5">
                    {game.filter(c => c.obtained).map(c => ( <DisplayCard key={c.id} card={c} /> ))}
                </Row>
                
                <Row  className="mb-4">
                    <Col>
                    <Button onClick = {startRound}>Ready for a new round</Button>
                    </Col>
                </Row>
                </>

              }
                
            </Container>
        </>
        
    );

}


function DisplayCard(props) {
  //I dont' display cards not obtained

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={props.card.image} />
      <Card.Body>
        {!props.card.isNew && <Card.Title>index: {props.card.index}, 
          obtained: {props.card.obtained.toString()}, round: {props.card.round}</Card.Title>}        
        <Card.Text>{props.card.situation}</Card.Text>
        {props.card.isNew && 
          <> 
          <Button className="me-3" variant="outline-dark" onClick = {() => props.dec(props.card)}>
            <i class="bi bi-arrow-left-circle-fill"></i>
          </Button>
          <Button className="me-3" variant="outline-dark" onClick = {() => props.inc(props.card)}>
            <i class="bi bi-arrow-right-circle-fill"></i>
          </Button> </>}
      </Card.Body>
    </Card>
  );
}


export default GameComplete;