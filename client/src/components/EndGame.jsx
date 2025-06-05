import API from "../API/API.mjs";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useLocation} from "react-router";
import { DisplayCardBasic} from './DisplayCard';

function EndGame(props){

    const navigate = useNavigate();

    const location = useLocation();
    const game = location.state?.game;

    //history + is logged (win/not win change on logged)
    //save game on db
    //RICONTROLLARE
    let win = false;
    const owned = game.filter(item => item.obtained).length;

    if(props.loggedIn){
        if(owned === 6)
            win = true;
    }
    else{
        if(owned === 4)
            win = true;        
    }

    return(
        <>
        <Container className="text-center mt-5">
            <Row  className="mb-5">
                {win?
                <Col as="h2">You Won!</Col>
                :
                <Col as="h2">Oh no you lost!</Col>}
                    
            </Row>
                
            <Row  className="mb-5">
                {game.filter(c => c.obtained).map(c => ( <DisplayCardBasic key={c.id} image={c.image} index={c.index} situation={c.situation} /> ))}
            </Row>
                
            <Row  className="mb-4">
                <Col>
                    <Button onClick= {() => navigate('/game')}>Start new game</Button>
                </Col>
            </Row>                
        </Container>
        </>
    )

}

export default EndGame;