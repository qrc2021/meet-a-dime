import React, { useState } from 'react';

import { Form, Button, Card, Navbar, CardDeck } from 'react-bootstrap';
import { Alert, AlertTitle } from '@material-ui/lab';

import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Redirect } from 'react-router';
import '../styles/Verify.css';
// import { auth } from '../firebase';

export default function Verify() {
  // const emailRef = useRef();
  const { logout, verify, currentUser } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [pressed, setPressed] = useState(false);

  async function handleLogout() {
    setError('');
    try {
      await logout();
      localStorage.removeItem('user_data');
      history.push('/login');
    } catch {
      setError('Failed to log out');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');

      setError('');
      setLoading(true);
      //   await resetPassword(emailRef.current.value);
      await verify();
      setMessage('Verify email is sent');
      setPressed(true);
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <React.Fragment>

    <Navbar bg="transparent">
      <Navbar.Brand href="login">
        <img
          src="/DimeAssets/headerlogo.png"
          width="300px"
          height="100%"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
    </Navbar>

      {currentUser && currentUser.emailVerified ? (
        <Redirect to="/"></Redirect>
      ) : (
        <React.Fragment></React.Fragment>
      )}

      <Card
      varient="top"
      style={{
        minWidth: '300px',
        maxWidth: '550px',
        marginRight: 'auto',
        marginLeft: 'auto',
        borderRadius: '30px',
      }}>
        <Card.Body>
          <h2 className="text-center mb-4"
          style={{
            fontWeight: 'bold',
            fontSize: '50px',
            color: '#7E7E7E',
          }}>
            Verify Your E-mail
          </h2>
          <Card.Img className="text-center mb-4"
          variant="top"
          src="DimeAssets/envelope.png"
          
        />
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Button
              disabled={loading || pressed}
              variant="top"
              className="btn-primary w-100 mt-2 mb-3"
              type="submit">
              Send Email Verification
            </Button>
          </Form>
          <h3 className="text-center mb-0"
          style={{
            fontWeight: '400',
            fontSize: '30px',
            color: '#7E7E7E',
          }}>
          Make sure to check your inbox to verify your email.
          </h3>
        </Card.Body>
      </Card>
      {/* <div className="w-100 text-center mt-2">
        <Button onClick={handleLogout}
          style={{
            fontWeight: 'bold',
            fontSize: '25px',
            color: 'white',
            backgroundColor: '#E64398',
            borderRadius: '30px',
            borderColor: '#E64398',
          }}>

          Log In
        </Button>
      </div> */}
    </React.Fragment>
  );
}
