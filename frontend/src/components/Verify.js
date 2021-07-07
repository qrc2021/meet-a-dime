import React, { useState } from 'react';
// import { Button, Card, Alert } from 'react-bootstrap';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { Alert, AlertTitle } from '@material-ui/lab';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
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

      <Container style={{ justifyContent: 'center', maxWidth: 700 }}>
        <Card>
          <CardContent>
            <h2 className="text-center mb-4">Verify Your E-mail</h2>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <form onSubmit={handleSubmit}>
              <Button
                disabled={loading || pressed}
                className="w-100 mt-2 mb-4"
                variant="contained"
                color="primary"
                type="submit">
                Send Email Verification
              </Button>
            </form>
            <p className="text-center mb-0">
              Make sure to check your inbox <br></br>to verify your email.
            </p>
          </CardContent>
        </Card>
      </Container>
      <div className="w-100 text-center mt-2">
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Log In
        </Button>
      </div>
    </React.Fragment>
  );
}
