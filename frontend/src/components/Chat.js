import React, { useState, useEffect } from 'react';
import { Button, Alert, Container, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import {io} from "socket.io-client";

import 'firebase/auth';
import 'firebase/firestore';

export default function Chat() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  // Gets the passed in match id from the link in the home page
  var { match_id } = location.state;
  const history = useHistory();

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  function clearAllTimeouts() {
    var id = window.setTimeout(function () {}, 0);
    while (id--) {
      window.clearTimeout(id);
    }
  }
  // Clear all timeouts on page load, because there could be pending
  // refreshes from abandoning searches that persist through pages.
  useEffect(() => {
    clearAllTimeouts();
    console.log('cleared timeouts.');
    const socket = io('http://localhost:5000')
    socket.on('connect', () => {
      console.log(`Email: "${currentUser.email}" connected with id: ${socket.id}`)
      
    })
  }, []);

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
      <h2 className="text-center mb-4">Chat</h2>
      <h3 className="text-center mb-4">
        (going home will make the users lose the match). for now they can still
        research for eachother tho
      </h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Container>
        <strong>Email:</strong> {currentUser.email}
        <br></br>
        <strong>User ID:</strong> {currentUser.uid}
        <br></br>
        <strong>MATCH:</strong> {match_id}
      </Container>
      <Container>
    
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
