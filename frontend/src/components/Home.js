import React, { useState } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export default function Home() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();

  const history = useHistory();

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  console.log(currentUser);
  console.log(currentUser.getIdToken());

  async function handleLogout() {
    setError('');

    try {
      await logout();
      history.push('/login');
    } catch {
      setError('Failed to log out');
    }
  }

  function redirectToHome2() {
    history.push('/home2');
  }

  return (
    <React.Fragment>
      <h2 className="text-center mb-4">Welcome! WE GOOD :D </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Container>
        <strong>Email:</strong> {currentUser.email}
        <br></br>
        <strong>User ID:</strong> {currentUser.uid}
        <br></br>
        <strong>Refresh token:</strong> {currentUser.refreshToken}
        <br></br>
        <strong>Verified email:</strong>{' '}
        {currentUser.emailVerified ? 'verified' : 'not verified'}
      </Container>
      <Button onClick={redirectToHome2}>test</Button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </React.Fragment>
  );
}
