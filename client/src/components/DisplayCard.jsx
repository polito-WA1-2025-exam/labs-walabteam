import { Card, Button } from "react-bootstrap";

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
        backgroundColor: '#1f1f33',
        color: 'white',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.4rem',
        marginBottom: '0.4rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
      }}>
        {props.index}
      </div>

      <div
        style={{
          width: '9rem',
          height: '12rem',         
          backgroundColor: 'white',
          border: '4px solid #1f1f33', 
          borderRadius: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={`/cards/${props.image}`}
          alt={props.situation}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>


      <div style={{
        backgroundColor: '#1f1f33',
        width: '9rem',
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
        backgroundColor: '#1f1f33',
        color: 'white',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.4rem',
        marginBottom: '0.4rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
      }}>
        ?
      </div>

      <div
        style={{
          width: '9rem',
          height: '12rem',         
          backgroundColor: 'white',
          border: '4px solid #1f1f33', 
          borderRadius: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={`/cards/${props.card.image}`}
          alt={props.card.situation}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>      

      <div style={{
        backgroundColor: '#1f1f33',
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