import React, { useState } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export default function Profile() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }
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

  function redirectToHome() {
    history.push('/');
  }

  return (
    <React.Fragment>
      <h2 className="text-center mb-4">Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Container>
        <strong>Email:</strong> {currentUser.email}
        <br></br>
        <strong>User ID:</strong> {currentUser.uid}
      </Container>
      <Button onClick={redirectToHome}>Home</Button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </React.Fragment>
  );
}
