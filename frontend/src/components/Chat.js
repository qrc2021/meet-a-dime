import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Alert, Container, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import moment from 'moment';
var bp = require('../Path.js');
const firestore = firebase.firestore();

export default function Chat() {
  const messageRef = useRef();
  const EXPIRE_IN_MINUTES = 0.1;
  const [room, setRoom] = useState('');
  //const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState();
  const [afterChat, setAfterChat] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  // const [isHost, setHost] = useState('none');
  const { currentUser, logout } = useAuth();

  const [match_age, setMatchAge] = useState('');
  const [match_name, setMatchName] = useState('user');
  const [match_sex, setMatchSex] = useState('');
  const [match_photo, setMatchPhoto] = useState('');

  const location = useLocation();
  // Gets the passed in match id from the link in the home page
  // timeout_5 is passed in from the home link. it prevents removing the match document in the background.

  const history = useHistory();

  if (location.state === undefined) window.location.href = '/';

  const { match_id, timeout_5 } = location.state;

  const joinRoomButton = document.getElementById('room-button');
  const messageInput = document.getElementById('message_input');
  const roomInput = document.getElementById('room-input');
  const form = document.getElementById('form');

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  // Fetch the matches' name, birth, sex when page loads.
  async function fetchMatchInfo() {
    try {
      var config = {
        method: 'post',
        url: bp.buildPath('api/getbasicuser'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: { uid: match_id },
      };
      var response = await axios(config);
      // console.log(response.data);
      console.log('fetched data!');
      setMatchAge(moment().diff(response.data.birth, 'years'));
      setMatchName(response.data.firstName);
      setMatchSex(response.data.sex);
      setMatchPhoto(response.data.photo);
    } catch (error) {
      console.log(error);
    }
  }

  function noMatch() {
    setTimeout(async () => {
      await firestore
        .collection('users')
        .doc(currentUser.uid)
        .update({
          FailMatch: firebase.firestore.FieldValue.arrayUnion(match_id),
        });
      await firestore
        .collection('users')
        .doc(match_id)
        .update({
          FailMatch: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
        });
      socket.emit('leave-room', currentUser.uid, room);
      history.push('/after', {
        state: { match_id: match_id, type: 'match_abandoned' },
      });
    }, 0);
  }

  function MatchModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Meet A Dime
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>You did the time! Do you want the Dime?</h4>
          <p>Please select...</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Match</Button>
          <Button onClick={noMatch}>No Match</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const id = currentUser.uid;

  // this effect only runs once.
  useEffect(() => {
    // This is a timeout that carried over from the last page. It deletes
    // the doc in the background.
    clearTimeout(timeout_5);
    // This gets the match data.
    fetchMatchInfo();
    const socket = io(bp.buildPath(''), { forceNew: true });
    socket.auth = { id };
    socket.connect();
    socket.on('connect', () => {
      console.log(
        `Email: "${currentUser.email}" \n With User ID: "${currentUser.uid}" connected with socket id: "${socket.id}"`
      );
    });

    if (localStorage.getItem('chatExpiry') === null) {
      var exp = Date.now() + EXPIRE_IN_MINUTES * 60000;
      localStorage.setItem('chatExpiry', exp);
      console.log('set to', exp);
    }

    var checkLoop = setInterval(() => {
      if (window.location.pathname !== '/chat') clearInterval(checkLoop);
      var current = Date.now();
      console.log('checking..');
      if (current >= localStorage.getItem('chatExpiry')) {
        //console.log('ITS OVER');
        //Modal match or non-match
        //   <matchModal
        //   show={modalShow}
        //   onHide={() => setModalShow(false)}
        // />

        setModalShow(true);

        clearInterval(checkLoop);
        setAfterChat(true);
      }
    }, 2000);

    var current_time = Date.now();
    console.log('checking..');
    if (current_time >= localStorage.getItem('chatExpiry')) {
      //console.log('ITS OVER');
      //Modal match or non-match

      clearInterval(checkLoop);
      setModalShow(true);
      setAfterChat(true);
    }

    // This is new!
    // We get both ids, and sort them alphabetically.
    // The concatenated string is the unique room id!
    const ids = [currentUser.uid, match_id];
    ids.sort();
    const new_room = ids[0] + ids[1];
    socket.emit(
      'join-room',
      currentUser.uid.toString(),
      new_room.toString(),
      function (message) {
        if (message == 'joined') {
          console.log('callback called, joining room now.');
          setRoom(new_room);
          displayMessage('Joined the room! Introduce yourself :)', 'system');
        }
      }
    );

    setSocket(socket);
    // Wait for incoming private messages.
    socket.on('message', (message, user) => {
      if (user !== currentUser.uid) displayMessage(message, 'received');
      console.log(user);
    });
    socket.on('abandoned', (message) => {
      //match left & setting the pair as no match
      displayMessage('Your match left the chat. Switching..', 'system');
      setTimeout(async () => {
        await firestore
          .collection('users')
          .doc(currentUser.uid)
          .update({
            FailMatch: firebase.firestore.FieldValue.arrayUnion(match_id),
          });
        await firestore
          .collection('users')
          .doc(match_id)
          .update({
            FailMatch: firebase.firestore.FieldValue.arrayUnion(
              currentUser.uid
            ),
          });
        socket.emit('leave-room', currentUser.uid, room);
        history.push('/after', {
          state: { match_id: match_id, type: 'match_abandoned' },
        });
      }, 0);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const message = messageRef.current.value;
    // const room_ = room;

    if (message === '') return;
    displayMessage(message, 'sent');
    // ARGS ARE: from, room, message
    socket.emit('send-to-room', currentUser.uid, room, message);
    messageRef.current.value = '';
  }

  // Two modes added for some extra processing (like maybe classes or etc)
  function displayMessage(message, mode) {
    if (window.location.pathname == '/chat') {
      var suffix = '';
      if (mode === 'received') {
        suffix = ' (them)';
      } else if (mode == 'sent') {
        suffix = ' (you)';
      } else if (mode == 'system') {
        suffix = ' [[sys msg, remove suffix later]]';
      }
      const div = document.createElement('div');
      div.textContent = message + suffix;
      document.getElementById('message-container').append(div);
    }
  }

  async function handleLogout() {
    try {
      // Push the state to login that we need to purge the old user searches.

      await firestore
        .collection('users')
        .doc(currentUser.uid)
        .update({
          FailMatch: firebase.firestore.FieldValue.arrayUnion(match_id),
        });
      await firestore
        .collection('users')
        .doc(match_id)
        .update({
          FailMatch: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
        });

      socket.emit('leave-room', currentUser.uid, room);
      await logout();
      history.push('/login', {
        state: { fromHome: true, oldID: currentUser.uid },
      });
      localStorage.removeItem('user_data');

      // window.location.reload();
    } catch {
      setError('Failed to log out');
    }
  }

  function redirectToHome() {
    // socket.emit('leave-room', currentUser.uid, room);
    socket.emit('leave-room', currentUser.uid, room);
    history.push('/');
    // window.location.reload(); CHANGED_NOW
  }

  async function redirectToAfter() {
    // user left & setting pair to no match
    socket.emit('leave-room', currentUser.uid, room);
    await firestore
      .collection('users')
      .doc(currentUser.uid)
      .update({
        FailMatch: firebase.firestore.FieldValue.arrayUnion(match_id),
      });
    await firestore
      .collection('users')
      .doc(match_id)
      .update({
        FailMatch: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      });

    history.push('/after', {
      state: { match_id: match_id, type: 'user_abandoned' },
    });
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
        <strong>their age:</strong> {match_age}
        <br></br>
        <strong>their name:</strong> {match_name}
        <br></br>
        <strong>their sex:</strong> {match_sex}
        <br></br>
        <strong>their photo:</strong>
        <br></br>
        {match_photo !== '' ? (
          <img
            height="100px"
            width="100px"
            src={match_photo}
            id="matchPhoto"></img>
        ) : (
          <></>
        )}
        <hr></hr>
      </Container>
      <React.Fragment>
        <Container>
          <div id="message-container"></div>
          <hr></hr>
          {!afterChat && (
            <Form onSubmit={handleSubmit}>
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                id="message_input"
                ref={messageRef}></Form.Control>
              <Button
                disabled={room === '' || afterChat ? true : false}
                type="submit"
                id="send-button">
                Send
              </Button>
              <br></br>
              <h3>Our room id: {room}</h3>
            </Form>
          )}
        </Container>
        <Button
          className={!afterChat ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={!afterChat ? redirectToAfter : redirectToHome}>
          {!afterChat ? 'Abandon Chat' : 'Go Home'}
        </Button>
      </React.Fragment>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <MatchModal show={modalShow} onHide={() => setModalShow(false)} />
    </React.Fragment>
  );
}
