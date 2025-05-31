import { Alert, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./NavHeader";

function DefaultLayout(props) {
  
  //nb the fact we check is props.message contains something is due to the fact that the first time
  //we open the page there is nothin and the <Row>...</Row> defined after would cause a problem
  return(
    <>
      <NavHeader loggedIn={props.loggedIn} handleLogout={props.handleLogout} />
      <Container fluid className="mt-3">
        {props.message && <Row>
          <Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert>
        </Row>}
        <Outlet />
      </Container>
    </>
  );
}

export default DefaultLayout;