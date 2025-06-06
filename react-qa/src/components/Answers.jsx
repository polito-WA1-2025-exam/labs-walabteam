import "bootstrap-icons/font/bootstrap-icons.css";
import { Row, Col, Table, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import API from "../API/API.mjs";
import { Answer } from "../models/QAModels.mjs";

function Answers (props) {
  const [answers, setAnswers] = useState([]);

  const { questionId } = useParams();

  const getAnswers = async () => {
    const answers = await API.getAnswers(questionId);
    setAnswers(answers);
  }

  useEffect(() => {
    getAnswers();
  }, []);

  const voteUp = (answerId) => {
    setAnswers(oldAnswers => {
      return oldAnswers.map(ans => {
        if(ans.id === answerId) {
          const answer = new Answer(ans.id, ans.text, ans.email, ans.userId, ans.date, ans.score +1);
          answer.voted = true;
          return answer;
        }
        else
          return ans;
      });
    });

    API.voteUp(answerId)
      .then(() => getAnswers())
      .catch(err => console.log(err));
  }

  const deleteAnswer = (answerId) => {
    setAnswers(oldAnswers => {
      return oldAnswers.filter((answer) => answer.id !== answerId); 
    });
  }

  return(
    <>
    <Row>
      <Col as="h2">Answers:</Col>
    </Row>
    <Row>
      <Col lg={10} className="mx-auto">
        <AnswerTable answers={answers} voteUp={voteUp} deleteAnswer={deleteAnswer} user={props.user} />
        <Link className="btn btn-primary" to="answers/new">Add</Link>
      </Col>
    </Row>
    </>
  );
}

function AnswerTable (props) {
  const [sortOrder, setSortOrder] = useState("none");

  const sortedAnswers = [...props.answers];
  if(sortOrder === "asc")
    sortedAnswers.sort((a,b) => a.score - b.score);
  else if (sortOrder == "desc")
    sortedAnswers.sort((a,b) => b.score - a.score);

  const sortByScore = () => {
    setSortOrder(oldOrder => oldOrder === "asc" ? "desc" : "asc");
  }

  return (
    <Table striped>
      <thead>
        <tr>
          <th>Date</th>
          <th>Text</th>
          <th>Author</th>
          <th>Score <Button variant="link" className="text-black" onClick={sortByScore}><i className={sortOrder ==="asc" ? "bi bi-sort-numeric-up" : "bi bi-sort-numeric-down"}></i></Button></th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        { sortedAnswers.map((ans) => <AnswerRow key={ans.id} answer={ans} voteUp={props.voteUp} deleteAnswer={props.deleteAnswer} user={props.user} />) }
      </tbody>
    </Table>
  );
}

function AnswerRow(props) {
  return(
    <tr><AnswerData answer={props.answer} /><AnswerAction {...props} /></tr>
  );
}

function AnswerData(props) {
  return(
    <>
      <td>{props.answer.date.format("YYYY-MM-DD")}</td>
      <td>{props.answer.text}</td>
      <td>{props.answer.email}</td>
      <td>{props.answer.score}</td>
    </>
  );
}

function AnswerAction(props) {
  //we can't change/delete others' answers
  //we can't upvote out own answers
  return(
    <td>
      {props.user.username !== props.answer.email &&
        <Button variant="warning" onClick={() => props.voteUp(props.answer.id)} disabled={props.answer.voted}><i className="bi bi-arrow-up" /></Button>}
      {/* senza params: <Link className="btn btn-primary mx-1" to={`answers/${props.answer.id}/edit`}><i className="bi bi-pencil-square" /></Link> */}
      {//remember state={...} to use useLocation in destination page
        props.user.username === props.answer.email && <> 
        <Link className="btn btn-primary mx-1" to={`answers/${props.answer.id}/edit`} state={props.answer.serialize()} ><i className="bi bi-pencil-square" /></Link> 
        <Button variant="danger" onClick={() => props.deleteAnswer(props.answer.id)}><i className="bi bi-trash" /></Button>
      </>}
    </td>
  );
}

export default Answers;