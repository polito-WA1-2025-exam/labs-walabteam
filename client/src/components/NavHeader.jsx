import { useEffect, useState } from 'react';
import { Button, Container, Navbar } from 'react-bootstrap';
import { Link } from "react-router";
import { LogoutButton } from './AuthComponents';
import { useNavigate } from 'react-router';

function NavHeader(props) {

  //managing logout
  const navigate = useNavigate();
   const handleLogoutClick = () => {
    props.handleLogout();           
    navigate('/');     
  };

  //managing darkMode activation
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    // se darkMode === true, aggiungiamo data-bs-theme al tag html
    if(darkMode)
      document.documentElement.setAttribute("data-bs-theme", "dark");
    // altrimenti, rimuoviamo data-bs-theme
    else
      document.documentElement.removeAttribute("data-bs-theme");
  }, [darkMode]);

  return(

    <Navbar bg='primary' data-bs-theme='dark'>
      <Container fluid className="d-flex align-items-center">

        <Link to="/" className="navbar-brand mb-0 h1">
          Stuff Happens... at school
        </Link>

        <div className="ms-auto d-flex align-items-center gap-2">
          {props.loggedIn ? (
            <>
              <Link to="/userHistory" className="btn btn-outline-light">
                Games history
              </Link>
              <button className="btn btn-outline-light" onClick={handleLogoutClick}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline-light">
              Login
            </Link>
          )}

          <Button
            variant="outline-light"
            onClick={() => setDarkMode((oldMode) => !oldMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <i className="bi bi-sun-fill" /> : <i className="bi bi-moon-fill" />}
          </Button>
        </div>
      </Container>
    </Navbar>

  );
}

export default NavHeader;