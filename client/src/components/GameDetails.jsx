import API from "../API/API.mjs";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useParams, useLocation} from "react-router";
import { DisplayCardBasic} from './DisplayCard';

function GameDetails(props){

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

   return (
    <Container className="mt-5">
      <Row className="mb-4 text-center">
        <Col>
        <h1 className=" text-[#1f1f33] dark:text-[#e0e0f0]">Game of {date}</h1>
        <h2 className="text-[#1f1f33] dark:text-[#e0e0f0]">Collected cards: { ' ' }
          {rounds.filter(game => game.round !== 0 && game.result === 1).length}</h2>
        </Col>
      </Row>

      <Container>
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
                      <DisplayCardBasic image={r.image} index={r.bad_luck_index} situation={r.situation} />
                    </Col>
                  ) : null
                )}
              </Row>
            </Col>
          </Row>
        )}

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
                <DisplayCardBasic image={r.image} index={r.bad_luck_index} situation={r.situation} />
              </Col>
            </Row>
          ) : null
        )}
      </Container>
    </Container>
  );

}

export default GameDetails;