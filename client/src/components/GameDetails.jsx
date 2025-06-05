import API from "../API/API.mjs";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams} from "react-router";
import { DisplayCardBasic} from './DisplayCard';

function GameDetails(props){

    //const navigate = useNavigate(); //maybe to go back to the previous page
    const { g_id } = useParams();

    const [rounds, setRounds] = useState([]);

    useEffect(() => {
        const getRounds = async () => {
        const rounds = await API.gameDetails(g_id);
        setRounds(rounds);
        }
        getRounds();
    }, []);



    //magari passare attraverso state data del gioco per metterlo come titolo
    return(
      <>
      <Container className="text-center mt-5">
      
      <Row  className="mb-5">
            <Col as="h1">Game...</Col>
      </Row>
        
        <Row  className="mb-5">
          {rounds.map((r) => <DisplayRound key={r.bad_luck_index} round={r} />)}
        </Row>
    </Container>
  </>
  )

}

function DisplayRound(props) {

  return (
    <Col md={4} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>{props.round.round} Round </Card.Title>
          <Card.Text>Result: {props.round.result === 1 ? 'Win' : 'Loss'}</Card.Text>
          <DisplayCardBasic image={props.round.image} index={props.round.bad_luck_index} situation={props.round.situation}/>
        </Card.Body>
      </Card>
    </Col>
  );

}

export default GameDetails;