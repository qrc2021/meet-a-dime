import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isHost, setHost] = useState('none');
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  // Gets the passed in match id from the link in the home page
  // timeout_5 is passed in from the home link. it prevents removing the match document in the background.
  const { match_id, timeout_5 } = location.state;

  const history = useHistory();

  const joinRoomButton = document.getElementById('room-button');
  const messageInput = document.getElementById('message_input');
  const roomInput = document.getElementById('room-input');
  const form = document.getElementById('form');

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  // The function definition for the inital posting of the user's socket id to the DB.
  async function APIsendSocketID(sid) {
    if (sid == '') return;
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
  }

  const id = currentUser.uid;

  // This function retrieves the socket id of your match, using the API built for this purpose.
  async function fetchOtherSocket(is_the_host) {
    var id_to_send = '';

    var is_host = '';
    if (is_the_host == 'true') {
      is_host = 'true';
      id_to_send = currentUser.uid;
    } else if (is_the_host == 'false') {
      is_host = 'false';
      id_to_send = match_id;
    } else {
      console.log('in fetchOtherSocket, recieved something else.');
      return '';
    }

    try {
      var config = {
        method: 'post',
        url: bp.buildPath('api/retrievesockets'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          hostID: id_to_send,
          ishost: is_host,
        },
      };
      console.log('sending:');
      console.log(config);

      var response = await axios(config);

      console.log('response:');
      console.log(response);

      return response.data.socket_id;
    } catch (error) {
      console.log('SOME ERROR');
      console.log(error);
    }
  }

  // This useEffect runs each time that the host status changes. When it changes, we query the DB
  // and see if we get the other's socket id. if so, then perfect! if not, keep polling every second.
  useEffect(() => {
    // console.log('********** IS HOST CHANGED**************');
    if (isHost == 'true') {
      console.log('***** IS HOST IS NOW TRUE');
      fetchOtherSocket('true')
        .then((response) => {
          console.log('in true, just got back with');
          console.log(response);
          if (response === '') {
            console.log('i need to do more to find out (in true)');
            var trueInterval = setInterval(() => {
              console.log('some polling!');
              fetchOtherSocket('true').then((response) => {
                if (response !== '') {
                  console.log(response);
                  setRoom(response);
                  clearInterval(trueInterval);
                }
              });
            }, 1000);
          } // match session id was not empty!
          else {
            setRoom(response);
          }
        })
        .catch((err) => console.log(err));
    } else if (isHost == 'false') {
      console.log('********* IS HOST IS NOW FALSE');
      fetchOtherSocket('false')
        .then((response) => {
          console.log('in false, just got back with');
          console.log(response);
          if (response === '') {
            console.log('i need to do more to find out (in false)');
            var falseInterval = setInterval(() => {
              console.log('some polling!');
              fetchOtherSocket('false').then((response) => {
                if (response !== '') {
                  console.log(response);
                  setRoom(response);
                  clearInterval(falseInterval);
                }
              });
            }, 1000);
          } else {
            // match session id was not empty!
            setRoom(response);
          }
        })
        .catch((err) => console.log(err));
    } else if (isHost == 'none') {
      console.log('THERE IS NO HOST!');
    }
  }, [isHost]);

  // this effect only runs once.
  useEffect(() => {
    clearTimeout(timeout_5);
    // clearAllTimeouts();
    // console.log('cleared timeouts.');
    const socket = io(bp.buildPath(''));
    socket.auth = { id };
    socket.connect();
    socket.on('connect', () => {
      displayMessage(
        `Email: "${currentUser.email}" \n With User ID: "${currentUser.uid}" connected with socket id: "${socket.id}"`
      );
      // When connected, try to send in my socket id. I get back whether I am host or not, which I can then use later.
      APIsendSocketID(socket.id).then(
        (hostValue) => {
          console.log('RESOLVED. is user host?');
          console.log(hostValue);
        },
        (reason) => {
          console.log('REASON');
          console.log(reason);
        }
      );
      setSocket(socket);
    });
    // Wait for incoming private messages.
    socket.on('private', (message, to, from) =>
      displayMessage(message, 'received')
    );
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const message = messageRef.current.value;
    const room_ = room;

    if (message === '') return;
    displayMessage(message, 'sent');
    // ARGS ARE: message, to, from
    // Emit a private message.
    socket.emit('private', message, room_, socket.id);
    messageRef.current.value = '';
  }

  // Two modes added for some extra processing (like maybe classes or etc)
  function displayMessage(message, mode) {
    var suffix = '';
    if (mode === 'received') {
      suffix = ' (them)';
    } else if (mode == 'sent') {
      suffix = ' (you)';
    }
    const div = document.createElement('div');
    div.textContent = message + suffix;
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
    window.location.reload();
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
          <Button
            disabled={room == '' ? true : false}
            type="submit"
            id="send-button">
            Send
          </Button>
          <br></br>
          {/* <Form.Label htmlFor="room-input">Room</Form.Label>
          <Form.Control type="text" value={room}></Form.Control>
          <Button type="button" id="room-button">
            Join
          </Button> */}
          <h3>Their room: {room}</h3>
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
