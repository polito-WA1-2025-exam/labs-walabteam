import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Outlet} from "react-router";
import { useNavigate } from "react-router";

function StartGame(props){

  const { gameH, setGameH, gameC, setGameC } = props;
  const navigate = useNavigate();

  //initialize first 3 cards
  useEffect(() => {
    const getInitialCards = async () => {
      const cards = await API.firstCards();
      const sorted = [...cards].sort((a, b) => a.index - b.index);
      setGameC(sorted);
      setGameH(sorted);
    }
      getInitialCards();
  }, []);

    return(
  <>
    <Container className="text-center mt-5">
      <Row  className="mb-5">
        <Col as="h2">Your current cards</Col>
      </Row>
      
      <Row  className="mb-5">
        {gameC.map((c) => <DisplayCard key={c.id} card={c}/>)}
      </Row>
      
      <Row  className="mb-4">
        <Col>
          <Button onClick= {()=> navigate(`round`)}>Ready</Button>
        </Col>
      </Row>
    </Container>
  </>
  );

}

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

export default StartGame;