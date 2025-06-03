import { Card, Button } from "react-bootstrap";

function DisplayCardBasic(props) {

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={props.card.image} />
      <Card.Body>
        <Card.Title>index: {props.card.index}</Card.Title>       
        <Card.Text>{props.card.situation}</Card.Text>
      </Card.Body>
    </Card>
  );
}

//card to position during a round
function DisplayCardInteractive(props) {

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={props.card.image} />
      <Card.Body>
        <Card.Title></Card.Title>       
        <Card.Text>{props.card.situation}</Card.Text>
          <> 
          <Button className="me-3" variant="outline-dark" onClick = {() => props.dec(props.card)}>
            <i className="bi bi-arrow-left-circle-fill"></i>
          </Button>
          <Button className="me-3" variant="outline-dark" onClick = {() => props.inc(props.card)}>
            <i className="bi bi-arrow-right-circle-fill"></i>
          </Button> 
          </>
      </Card.Body>
    </Card>
  );
}

function DisplayCardHistory(props) {

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={props.card.image} />
      <Card.Body>
        <Card.Title> index: {props.card.index}, 
          obtained: {props.card.obtained.toString()}, 
          round: {props.card.round}
        </Card.Title>       
        <Card.Text>{props.card.situation}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export { DisplayCardBasic, DisplayCardInteractive, DisplayCardHistory };