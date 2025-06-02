import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import { useOutletContext } from "react-router";
import { useNavigate, useParams, useLocation, Link } from "react-router";


function GameStatus(props){

  const gameC = props.gameC;

  const location = useLocation();
  const { roundWon } = location.state;

  const navigate = useNavigate();

  return(
  <>
    <Container className="text-center mt-5">
      {roundWon ? 
      <Row  className="mb-5">
        <Col as="h1">Good guess! </Col>
      </Row>
      :
      <Row  className="mb-5">
        <Col as="h1">Oh no... you didn't guess</Col>
      </Row>
      }

      <Row  className="mb-5">
        <Col as="h2">Your current cards</Col>
      </Row>
      
      <Row  className="mb-5">
        {gameC.map((c) => <DisplayCard key={c.id} card={c}/>)}
      </Row>
      
      <Row  className="mb-4">
        <Col>
          <Button>Ready</Button>
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
        <Card.Title>{props.card.index}</Card.Title>       
        <Card.Text>{props.card.situation}</Card.Text>
      </Card.Body>
    </Card>
  );
}


export default GameStatus;