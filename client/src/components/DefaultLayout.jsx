import { Alert, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./NavHeader";

/*TO DO:
make footer a component
*/


function DefaultLayout(props) {
  return (
    <div className="page-wrapper">
      <NavHeader loggedIn={props.loggedIn} handleLogout={props.handleLogout} />

      <Container fluid className="mt-3 p-4 page-content">
        {props.message && (
          <Row>
            <Alert
              variant={props.message.type}
              onClose={() => props.setMessage("")}
              dismissible
            >
              {props.message.msg}
            </Alert>
          </Row>
        )}
        <Outlet />
      </Container>


      <footer className="text-center py-3 border-top footer-style">
        © 2025 StuffHappens • A card game of fate and fun
      </footer>
    </div>
  );
}

export default DefaultLayout;