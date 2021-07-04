import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Redirect } from 'react-router';
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
      {currentUser && currentUser.emailVerified ? (
        <Redirect to="/"></Redirect>
      ) : (
        <React.Fragment></React.Fragment>
      )}

      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">
            Verify Your E-mail
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Button
              disabled={loading || pressed}
              className="w-100 mt-2 mb-4"
              type="submit">
              Send Email Verification
            </Button>
          </Form>
          <h3 className="text-center mb-0">
          Make sure to check your inbox <br></br>to verify your email.
          </h3>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log In
        </Button>
      </div>
    </React.Fragment>
  );
}
