import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import { useOutletContext } from "react-router";
import { useNavigate, useParams, useLocation, Link } from "react-router";

function Round(props){

  const { gameH, setGameH, gameC, setGameC } = props;

  useEffect(() => {
  const c_ids = gameH.map(c => c.id);
  API.randomCard(c_ids)
    .then(card => {
      setGameC(prev => [...prev, { ...card, isNew: true }].sort((a, b) => a.index - b.index));
    })
    .catch(err => {
      console.error("Error fetching new card:", err);
    });

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
          <Button>Submit</Button>
        </Col>
      </Row>
    </Container>
  </>
  );

}

//for a card to place: we don't want to show score and we want buttons
//aggiungere il disable nel caso ci fosse lentezza ma è stata registrata la richiesta di spostare

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