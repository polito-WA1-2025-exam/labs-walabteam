import { Card, Button } from "react-bootstrap";

//per aggiungere immagine:
/*
<img
        src={props.image}
        alt="card"
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '0.5rem',
          boxShadow: '0 0 8px rgba(0,0,0,0.2)',
        }}
      />

<img
        src={props.card.image}
        alt="card"
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '0.5rem',
          boxShadow: '0 0 8px rgba(0,0,0,0.2)',
        }}
      />
*/


function DisplayCardBasic(props) {
  return (
    <div style={{
      width: '9rem',
      margin: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        backgroundColor: '#a370f7',
        color: 'white',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.4rem',
        marginBottom: '0.4rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
      }}>
        {props.index}
      </div>


      {/*aggiungere immagine*/}

      <div style={{
        backgroundColor: '#a370f7',
        color: 'white',
        padding: '0.4rem',
        borderRadius: '0.4rem',
        marginTop: '0.4rem',
        fontSize: '0.8rem',
        textAlign: 'center',
        minHeight: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {props.situation}
      </div>
    </div>
  );
}

function DisplayCardInteractive(props) {
  return (
    <div style={{
      width: '9rem',
      margin: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      <div style={{
        backgroundColor: '#a370f7',
        color: 'white',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.4rem',
        marginBottom: '0.4rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
      }}>
        ?
      </div>

{/*aggiungere immagine*/}
      

      <div style={{
        backgroundColor: '#a370f7',
        color: 'white',
        padding: '0.4rem',
        borderRadius: '0.4rem',
        marginTop: '0.4rem',
        fontSize: '0.8rem',
        textAlign: 'center',
        minHeight: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {props.card.situation}
      </div>

      <div style={{
        marginTop: '0.4rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <Button variant="outline-dark" size="sm"
          onClick={() => props.dec(props.card)}
          disabled={props.disableLeft}>
          <i className="bi bi-arrow-left-circle-fill"></i>
        </Button>

        <Button variant="outline-dark" size="sm"
          onClick={() => props.inc(props.card)}
          disabled={props.disableRight}>
          <i className="bi bi-arrow-right-circle-fill"></i>
        </Button>
      </div>
    </div>
  );
}

export { DisplayCardBasic, DisplayCardInteractive};