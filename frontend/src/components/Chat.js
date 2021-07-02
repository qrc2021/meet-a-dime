import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert, Container, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

var bp = require('../Path.js');
const firestore = firebase.firestore();

export default function Chat() {
  const messageRef = useRef();
  const [room, setRoom] = useState('');
  //const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState();
  const [isHost, setHost] = useState('host');
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  // Gets the passed in match id from the link in the home page
  const { match_id } = location.state;
  const history = useHistory();

  const joinRoomButton = document.getElementById('room-button');
  const messageInput = document.getElementById('message_input');
  const roomInput = document.getElementById('room-input');
  const form = document.getElementById('form');

  // form.addEventListener('submit', (e) => {
  //   e.preventDefault();
  //   const message = messageInput;
  //   const room = roomInput;

  //   if (message === '') return;
  //   displayMessage(message);
  // });

  // joinRoomButton.addEventListener('click', () => {
  //   const room = roomInput.value;
  // });

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

  async function fetchData(sid) {
    try {
      var config = {
        method: 'post',
        url: bp.buildPath('api/setsocketid'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          userID: currentUser.uid,
          matchID: match_id,
          user_socket_id: sid,
        },
      };

      var response = await axios(config);
      console.log(response.data);
      setHost(response.data.ishost ? 'true' : 'false');
      return response.data.ishost;
    } catch (error) {}
  }

  async function fetchSocket(hostStatus) {
    console.log('fetching sockets...');
    try {
      var config = {
        method: 'post',
        url: bp.buildPath('api/retrievesockets'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          hostID: hostStatus ? currentUser.uid : match_id,
          ishost: hostStatus,
        },
      };

      var response = await axios(config);
      console.log(config.data);
      console.log('Fetched: ' + response.data.socket_id);
      return response.data.socket_id;
    } catch (error) {
      console.log(error);
    }
  }

  const id = currentUser.uid;
  // Clear all timeouts on page load, because there could be pending
  // refreshes from abandoning searches that persist through pages.
  useEffect(() => {
    clearAllTimeouts();

    console.log('cleared timeouts.');
    const socket = io('http://localhost:5000');
    setSocket(socket);
    socket.auth = { id };
    socket.connect();
    socket.on('connect', () => {
      // console.log(
      //   `Email: "${currentUser.email}" \n With User ID: "${currentUser.uid}" connected with socket id: "${socket.id}"`
      // );
      displayMessage(
        `Email: "${currentUser.email}" \n With User ID: "${currentUser.uid}" connected with socket id: "${socket.id}"`
      );
      // console.log(`You matched with ${match_id}`);
      // socket.emit(
      //   'message',
      //   `Email: "${currentUser.email}" \n With User ID: "${currentUser.uid}" connected to the server with socket id: "${socket.id}"`
      // );
      var status = fetchData(socket.id).then((a) => {
        console.log(a);

        var interval = setInterval(() => {
          var id = fetchSocket(a).then((x) => {
            console.log(x);
            if (x !== '') {
              clearInterval(interval);
              console.log(id);
              setRoom(x);
            }
          });
        }, 1000);
      });
    });
  }, []);

  if (socket) {
    socket.on('connect', () => {
      socket.on('recieved-message', (message) => {
        displayMessage(message);
      });
    });
  }
  function handleSubmit(e) {
    e.preventDefault();
    const message = messageRef.current.value;
    const room_ = room;

    if (message === '') return;
    displayMessage(message);
    socket.emit('message', message, room_);
    messageRef.current.value = '';
  }

  function displayMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    document.getElementById('message-container').append(div);
  }

  async function handleLogout() {
    try {
      // Push the state to login that we need to purge the old user searches.
      await logout();
      localStorage.removeItem('user_data');
      history.push('/login', {
        state: { fromHome: true, oldID: currentUser.uid },
      });
      window.location.reload();
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
        <br></br>
        <strong>HOST:</strong> {isHost}
      </Container>
      <Container>
        <div id="message-container"></div>
        <Form onSubmit={handleSubmit}>
          <Form.Label>Message</Form.Label>
          <Form.Control
            type="text"
            id="message_input"
            ref={messageRef}></Form.Control>
          <Button type="submit" id="send-button">
            Send
          </Button>
          <br></br>
          <Form.Label htmlFor="room-input">Room</Form.Label>
          <Form.Control type="text" value={room}></Form.Control>
          <Button type="button" id="room-button">
            Join
          </Button>
        </Form>
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
