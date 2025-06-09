import API from "../API/API.mjs";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useParams, useLocation} from "react-router";
import { DisplayCardBasic} from './DisplayCard';

function GameDetails(props){

    //const navigate = useNavigate(); //maybe to go back to the previous page
    const { g_id } = useParams();
    const [rounds, setRounds] = useState([]);

    const location = useLocation();
    const date = location.state.date;

    useEffect(() => {
        const getRounds = async () => {
        const rounds = await API.gameDetails(g_id);
        setRounds(rounds);
        }
        getRounds();
    }, []);

    /*return(
      <>
      <Container className="text-center mt-5">
      
      <Row  className="mb-5">
            <Col as="h1">Game of {date}</Col>
      </Row>
        
        <Row  className="mb-5">
          {rounds.map((r) => <DisplayRound key={r.bad_luck_index} round={r} />)}
        </Row>
    </Container>
  </>
  )*/
   return (
    <Container className="mt-5">
      <Row className="mb-4 text-center">
        <Col>
          <h1 className="display-4">Game of {date}</h1>
        </Col>
      </Row>

      {/* Tabella */}
      <Container>
        {/* Initial Cards Row */}
        {rounds.some((r) => r.round === 0) && (
          <Row className="align-items-center py-3 border-bottom">
            <Col md={2} className="fw-bold text-end pe-4">
              Initial Cards
            </Col>
            <Col md={10}>
              <Row>
                {rounds.map((r) =>
                  r.round === 0 ? (
                    <Col key={r.bad_luck_index} md={4} className="mb-3">
                      <DisplayCardBasic
                        image={r.image}
                        index={r.bad_luck_index}
                        situation={r.situation}
                      />
                    </Col>
                  ) : null
                )}
              </Row>
            </Col>
          </Row>
        )}

        {/* Other Rounds */}
        {rounds.map((r) =>
          r.round > 0 ? (
            <Row key={r.bad_luck_index} className="align-items-center py-3 border-bottom">
              <Col md={2} className="fw-bold text-end pe-4">
                Round {r.round}{' '}
                <Badge bg={r.result === 1 ? 'success' : 'danger'} className="ms-2">
                  {r.result === 1 ? 'Win' : 'Loss'}
                </Badge>
              </Col>
              <Col md={10}>
                <DisplayCardBasic
                  image={r.image}
                  index={r.bad_luck_index}
                  situation={r.situation}
                />
              </Col>
            </Row>
          ) : null
        )}
      </Container>
    </Container>
  );

}

/*function DisplayRound(props) {

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
*/

function DisplayRound({ round }) {
  const isInitial = round.round === 0;
  const isWin = round.result === 1;

  return (
    <Col md={4} className="mb-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="text-center">
          <Card.Title className="mb-3">
            {isInitial ? (
              <>
                🎴 <strong>Initial Cards</strong>
              </>
            ) : (
              <>
                🏁 <strong>Round {round.round}</strong>{' '}
                <Badge bg={isWin ? 'success' : 'danger'} className="ms-2">
                  {isWin ? 'Win' : 'Loss'}
                </Badge>
              </>
            )}
          </Card.Title>

          <DisplayCardBasic
            image={round.image}
            index={round.bad_luck_index}
            situation={round.situation}
          />
        </Card.Body>
      </Card>
    </Col>
  );
}

export default GameDetails;