import API from "../API/API.mjs";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Outlet} from "react-router";

function Game(){

  return(
  <>
    <Container className="mt-5">
      <Row className="justify-content-center mb-4">
        <Col md="auto">
          <h1 className="fw-bold text-primary">🎮 Gioco in Corso</h1>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              {<Outlet/>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </>
  );

}

export default Game;