import React, { useState, useRef, useEffect } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import moment from 'moment';
import e from 'cors';

var bp = require('../Path.js');

export default function Chat() {
  const firestore = firebase.firestore();
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const { handle } = useParams();
  const location = useLocation();
  var { match_id } = location.state;
  const [match, setMatchID] = useState(match_id);
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
        <strong>MATCH:</strong> {match}
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

//
//
//
//
//
//
//
//
//
//
//

// Stolen::
// function ChatRoom() {
//   const dummy = useRef();
//   const messagesRef = firestore.collection('messages');
//   const query = messagesRef.orderBy('createdAt').limit(25);

//   const [messages] = useCollectionData(query, { idField: 'id' });

//   const [formValue, setFormValue] = useState('');

//   const sendMessage = async (e) => {
//     e.preventDefault();

//     const { uid, photoURL } = currentUser;

//     await messagesRef.add({
//       text: formValue,
//       createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//       uid,
//       photoURL,
//     });

//     setFormValue('');
//     dummy.current.scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <>
//       <main>
//         {messages &&
//           messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

//         <span ref={dummy}></span>
//       </main>

//       <form onSubmit={sendMessage}>
//         <input
//           value={formValue}
//           onChange={(e) => setFormValue(e.target.value)}
//           placeholder="send a message"
//         />

//         <button type="submit" disabled={!formValue}>
//           send
//         </button>
//       </form>
//     </>
//   );
// }

// function ChatMessage(props) {
//   const { text, uid, photoURL } = props.message;

//   const messageClass = uid === currentUser.uid ? 'sent' : 'received';

//   return (
//     <>
//       <div className={`message ${messageClass}`}>
//         <img src={photoURL} />
//         <p>{text}</p>
//       </div>
//     </>
//   );
// }
// Stolen::
