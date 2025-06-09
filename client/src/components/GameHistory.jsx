import API from "../API/API.mjs";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router";


function GameHistory(props){

    const navigate = useNavigate();

    const {loggedIn, user} = props;

    const [games, setGames] = useState([]);

    useEffect(() => {
        const getGames = async () => {
        const games = await API.userHistory();
        const gamesSorted = games.sort((a, b) => dayjs(b.g_date).valueOf() - dayjs(a.g_date).valueOf());
        setGames(gamesSorted);
        }
        getGames();
    }, []);

    return(
      <>
      <Container className="text-center mt-5">
      
      <Row  className="mb-5">
            <Col as="h2">Your past games</Col>
      </Row>
        
        <Row  className="mb-5">
          {games.map((g) => <DisplayGame key={g.g_id} id={g.g_id} date={g.g_date} result={g.g_result} />)}
        </Row>
    </Container>
  </>
  )

}

function DisplayGame(props) {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/gameDetails/${props.id}`, { state: { date: props.date}
    });
  };

  return (
    <Col md={4} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Game on {dayjs(props.date).format('DD/MM/YYYY HH:mm')}</Card.Title>
          <Card.Text>Result: {props.result === 1 ? 'Win' : 'Loss'}</Card.Text>
          <Button variant="primary" onClick={handleDetailsClick}>
            See details
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default GameHistory;