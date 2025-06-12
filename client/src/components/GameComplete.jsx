import API from "../API/API.mjs";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DisplayCardBasic, DisplayCardInteractive } from './DisplayCard';

function GameComplete(props) {
    const navigate = useNavigate();

    const [game, setGame] = useState([]);
    const [round, setRound] = useState([]);
    
    const [roundResult, setRoundResult] = useState('');

    const [startTime, setStartTime] = useState(null);

    const [timer, setTimer] = useState(30);   
    const [timerActive, setTimerActive] = useState(false);

    const [newCard, setNewCard] = useState(null); 

    //start
    useEffect(() => {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        setStartTime(now);

        const getInitialCards = async () => {
            const cards = await API.firstCards();
            const sorted = cards.map(c => ({ ...c, obtained: true, round: 0 }))
                                .sort((a, b) => a.index - b.index);
            setGame(sorted);
        };
        getInitialCards();
    }, []);

    //timer
    useEffect(() => {
        let countdown;
        if (timerActive && timer > 0) {
            countdown = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && timerActive) {
            clearInterval(countdown);
            setTimerActive(false);
            endRound();
        }
        return () => clearInterval(countdown);
    }, [timer, timerActive]);

    const startRound = async () => {
        try {
            setTimer(30);
            setTimerActive(true);

            const c_ids = game.map(c => c.id);
            const card = await API.randomCard(c_ids);
            const r = game.length - 2;
            const newCard = { ...card, isNew: true, round: r };

            setNewCard(newCard); // salva temporaneamente
            const obtainedCards = game.filter(c => c.obtained === true);
            setRound([...obtainedCards]); // inizialmente solo le carte ottenute
        } catch (error) {
            console.error("Errore nella fetch:", error);
        }
    };

    const insertNewCard = () => {
        if (newCard) {
            setRound(prev => [...prev, newCard].sort((a, b) => a.index - b.index));
            setNewCard(null); // rimuove dalla vista "fuori dal mazzo"
        }
    };

    const endRound = async () => {
        setTimerActive(false);

        const cardInRound = round.find(c => c.isNew);

        //fail if card not inserted
        if (!cardInRound && newCard) {
            const failedCard = { ...newCard, obtained: false, isNew: false };
            setGame(prev => [...prev, failedCard].sort((a, b) => a.index - b.index));
            setNewCard(null);
            setRound([]);
            setRoundResult(false);
            return;
        }

        const id_to_guess = round.find(c => c.isNew)?.id;
        const actual_index = await API.cardIndex(id_to_guess);

        const order_actual = round.map(c => c.isNew ? { ...c, index: actual_index } : c)
                                  .sort((a, b) => a.index - b.index)
                                  .map(c => c.id);
        const order_user = round.map(c => c.id);

        let right = JSON.stringify(order_actual) === JSON.stringify(order_user);

        const card = round.find(c => c.id === id_to_guess);
        card.isNew = false;
        card.index = actual_index;
        card.obtained = right;

        if(right)
          setRoundResult(true);
        else
          setRoundResult(false);

        setGame(prev => [...prev, card].sort((a, b) => a.index - b.index));
        setRound([]);
    };

    //if game value change we check if we have to finish it 
    useEffect(() => {
        if (game.length > 3) {
            if (!props.loggedIn) {
                navigate('/endGame', { state: { game } });
            } else {
                const owned = game.filter(item => item.obtained).length;
                const lost = game.filter(item => !item.obtained).length;
                let win = false;
                if (owned === 6 && lost < 3 || lost === 3) {
                    if (owned === 6) win = true;
                    API.saveGame(win ? 1 : 0, startTime, game);
                    navigate('/endGame', { state: { game } });
                }
            }
        }
    }, [game]);

    const updateIndex = (card, delta) => {
        setRound(prevRound => {
            const idx = prevRound.findIndex(c => c.id === card.id);
            const neighborIndex = idx + delta;
            if (neighborIndex < 0 || neighborIndex >= prevRound.length)
                return prevRound;
            const new_index = prevRound[neighborIndex].index + (delta > 0 ? 0.4 : -0.4);
            return prevRound.map(c => c.id === card.id ? { ...c, index: new_index } : c)
                            .sort((a, b) => a.index - b.index);
        });
    };

    const increaseFakeIndex = (card) => updateIndex(card, +1);
    const decreaseFakeIndex = (card) => updateIndex(card, -1);

    return (
        <Container className="text-center mt-5">
            {round.length > 0 || newCard ?
            <>
            <Row className="mb-5 justify-content-center align-items-start">
              {newCard && (
                <Col xs="auto" className="d-flex align-items-center me-3">
                  <DisplayCardBasic image={newCard.image} index={"?"} situation={newCard.situation} />
                  <Button variant="primary" className="ms-3" onClick={insertNewCard}>
                    Inserisci nel mazzo <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                </Col>
              )}
              <Col xs="auto" className={`d-flex flex-wrap ${newCard ? 'justify-content-end' : 'justify-content-center'}`} style={{ minWidth: '60%' }}> 
              {round.map((c, idx, arr) => (
                <Col key={c.id} xs="auto" className="text-center">
                  {c.isNew ? (
                    <DisplayCardInteractive card={c} inc={increaseFakeIndex} dec={decreaseFakeIndex} disableLeft={idx === 0} disableRight={idx === arr.length - 1} />
                  ) : (
                    <DisplayCardBasic image={c.image} index={c.index} situation={c.situation} />
                  )}
                </Col>
              ))}
              </Col>
            
            </Row>               

            <Row className="mb-2">
                <Col as="p">⏳ Tempo rimasto: {timer}s</Col>
            </Row>
            {!newCard &&
              <Row className="mb-4">
                  <Col> <Button onClick={endRound}>Conferma posizione</Button> </Col>
              </Row>

            }
                </>
                :
                <>
                    <Row className="mb-5">
                      {game.length > 3 ?
                      (roundResult ?
                        <Col as="h2"> Hai indovinato! Le tue carte correnti sono... </Col>
                        :
                        <Col as="h2"> Peccato, hai sbagliato! Le tue carte correnti sono... </Col>
                      )
                      :
                      <Col as="h2"> Le tue carte iniziali</Col>
                      }
                    </Row>

                    <Row className="mb-5 justify-content-center">
                        {game.filter(c => c.obtained).map(c => (
                            <DisplayCardBasic key={c.id} image={c.image} index={c.index} situation={c.situation} />
                        ))}
                    </Row>

                    <Row className="mb-4">
                        <Col>
                          {game.length > 3 ?
                          <Button onClick={startRound}>Pronto per il prossimo round</Button>
                          :
                          <Button onClick={startRound}>Inizia il round</Button>
                          }
                        </Col>
                    </Row>
                </>
            }
        </Container>
    );
}

export default GameComplete;

