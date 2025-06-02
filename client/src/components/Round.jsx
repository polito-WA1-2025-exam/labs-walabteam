import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import { useOutletContext } from "react-router";
import { useNavigate, useParams, useLocation, Link } from "react-router";

function Round(props){
  const { gameH, setGameH, gameC, setGameC } = props;
  const [roundWon, setRoundWon] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const startRound = async () => {
      try {
        const c_ids = gameH.map(c => c.id);
        const card = await API.randomCard(c_ids);
        setGameC(prev => [...prev, { ...card, isNew: true }].sort((a, b) => a.index - b.index));
        //we don't add the card to the history here, because we want to add it with the outcome of the roun
        //that we can't know yet
      } catch (err) {
        console.error("Error fetching new card:", err);
      }
    };
    startRound();    
  }, []); 

  //occhio a impedire di farlo se non ci sono più carte a dx o a sx
  const increaseFakeIndex = (card) => {
    //prendo la carta successiva estraggo il suo punteggio e faccio update del fake punteggio della mia carta
    //i'm sure that if i update next_card+0.4 i get a index greater than the card but less than the next
    const next_pos = gameC.findIndex(c => c.id === card.id) + 1;
    const new_index = gameC[next_pos].index + 0.4;
    //update cards:
    const updated_round = gameC.map(c => c.id === card.id ? { ...c, index: new_index } : c );
    const sorted_round = [...updated_round].sort((a, b) => a.index - b.index);
    setGameC(sorted_round);
  }
  
  const decreaseFakeIndex = (card) => {
    const prev_pos = gameC.findIndex(c => c.id === card.id) - 1;
    const new_index = gameC[prev_pos].index - 0.4;
    const updated_round = gameC.map(c => c.id === card.id ? { ...c, index: new_index } : c );
    const sorted_round = [...updated_round].sort((a, b) => a.index - b.index);
    setGameC(sorted_round);
  }

  //OCCHIO SEMBRA CHE SI VINCA SEMPRE...
  const check_order = async () => {
    //we just look at the order of the card (ids of cards)
    const user_order = [...gameC];

    const id = gameC.find(c => c.isNew).id;
    const actual_index= await API.cardIndex(id);

    const actual_cards= user_order.map(c => c.id === id ? {...c, index: actual_index} : c)
    .sort((a, b) => a.index - b.index);

    const actual_indices = actual_cards.map(c => c.id);

    const user_indices = user_order.map(c => c.id);  

    //check order:
    let right = true;
    for (let i = 0; i < actual_indices.length; i++) {
      if (actual_indices[i] !== user_indices[i]){
        right = false;
        break;
      }
    }

    if(right){
      setRoundWon(true);

      setGameC(actual_cards);
      setGameH(actual_cards); //to manage better
      navigate(`../status`, {state: {roundWon}});
    }
    else{
      setRoundWon(false);

      setGameH(actual_cards); //to manage better 
      navigate(`../status`, {state: {roundWon}});
    }
          
  }  

  return(
  <>
    <Container className="text-center mt-5">
      <Row  className="mb-5">
        <Col as="h2">Your initial cards</Col>
      </Row>
      
      <Row  className="mb-5">
        {gameC.map((c) => <DisplayCard key={c.id} card={c} increase={increaseFakeIndex} decrease={decreaseFakeIndex}/>)}
      </Row>
      
      <Row  className="mb-4">
        <Col>
          <Button onClick= {()=> check_order()}>Submit</Button>
        </Col>
      </Row>
    </Container>
  </>
  );

}

//buttons to disable if the card is all on right all on the left
function DisplayCard(props) {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={props.card.image} />
      <Card.Body>
        {!props.card.isNew && <Card.Title>{props.card.index}</Card.Title>}        
        <Card.Text>{props.card.situation}</Card.Text>
        {props.card.isNew && 
          <> 
          <Button className="me-3" variant="outline-dark" onClick = {() => props.decrease(props.card)}>
            <i class="bi bi-arrow-left-circle-fill"></i>
          </Button>
          <Button className="me-3" variant="outline-dark" onClick = {() => props.increase(props.card)}>
            <i class="bi bi-arrow-right-circle-fill"></i>
          </Button> </>}
      </Card.Body>
    </Card>
  );
}

export default Round;