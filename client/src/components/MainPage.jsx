import { Link } from "react-router";
import { Row, Col, Container } from "react-bootstrap";

function MainPage(props) {


  return (
    <Container className="text-center mt-5">
      <Row className="mb-5">
        <Col>
          <h1 className="fw-bold text-[#1f1f33] dark:text-[#e0e0f0]">🃏 Welcome to Stuff Happens Game 🃏</h1>
          <p className="text-muted fs-5">
            Draw a card and discover how unlucky your day really is!
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
        {props.loggedIn ?
          <Link to='/game' className='btn btn-primary btn-lg px-4 py-2'>Start Game</Link>
        :
          <Link to='/game' className='btn btn-primary btn-lg px-4 py-2'>Start Mock Game</Link>
        }
        </Col>
      </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="fw-semibold text-[#1f1f33] dark:text-[#e0e0f0]">🎮 How to Play</h2>
            <ul className="list-unstyled text-start mx-auto" style={{ maxWidth: '700px' }}>
              <li>🃏 Ogni carta rappresenta una situazione sfortunata con un indice di sfortuna da 1 a 100.</li>
              <li>🔢 Parti con 3 carte.</li>
              <li>🤔 A ogni round ricevi una nuova situazione e devi indovinare dove si inserisce tra le tue carte.</li>
              <li>✅ Se indovini la posizione, ottieni la carta.</li>
              <li>🥇 Vinci se riesci a collezionare 6 carte!</li>
              <li>❌ Perdi se sbagli 3 volte.</li>
            </ul>
          </Col>
        </Row>

    </Container>
  );
}

export default MainPage;
