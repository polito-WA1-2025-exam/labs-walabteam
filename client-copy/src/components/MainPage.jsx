import { Link } from "react-router";
import { Row, Col, Container } from "react-bootstrap";

function MainPage() {

  return (
    <Container className="text-center mt-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold text-primary">🃏 Welcome to Stuff Happens Game 🃏</h1>
          <p className="text-muted fs-5">
            Draw a card and discover how unlucky your day really is!
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Link to='/game' className='btn btn-primary btn-lg px-4 py-2'>Start mock game</Link>
        </Col>
      </Row>

    </Container>
  );
}

export default MainPage;
