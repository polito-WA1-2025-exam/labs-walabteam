import { useActionState } from "react";
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router';

function LoginForm(props) {
    
    //Reminder: formData are the data in the fields at the moment the function is called (at submit)
    async function loginFunction(prevState, formData) {
        //take data from the form
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password'),
        };
        try {
            await props.handleLogin(credentials);
            return {success: true }; //saved in state (even if never actually used)
        } 
        catch (error) {
            return {error: 'Login failed. Check your credentials.' }; //saved in state
        }
    }

    //reminder: state is initialized with the value passed to useActionState
    //and can be modified by submit of form (so in the function loginFunction)
    const [state, formAction, isPending] = useActionState(loginFunction, {username: '', password: ''});

    //tipically, beyond form fields we have:
    //1.managing of pending state
    //2.managing of all possible values of state
    //3.submit and cancel buttons
    return (
        <>
            { isPending && <Alert variant="warning">Please, wait for the server's response...</Alert> }
            <Row>
                <Col md={6}>
                    <Form action={formAction}>
                        <Form.Group controlId='username' className='mb-3'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' name='username' required />
                        </Form.Group>

                        <Form.Group controlId='password' className='mb-3'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' name='password' required minLength={6} />
                        </Form.Group>

                        {state.error && <p className="text-danger">{state.error}</p>}

                        <Button type='submit' disabled={isPending}>Login</Button>
                        <Link className='btn btn-danger mx-2 my-2' to={'/'} disabled={isPending}>Cancel</Link>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

function LogoutButton(props) {
  return <Button variant='outline-light' onClick={props.logout}>Logout</Button>;
}

export { LoginForm, LogoutButton };