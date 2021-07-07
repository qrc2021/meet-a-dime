import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Alert, Container, Form } from 'react-bootstrap';
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

export default function After() {
  // Prevent some prompt issues.

  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();

  const [match_age, setMatchAge] = useState('');
  const [match_name, setMatchName] = useState('user');
  const [match_sex, setMatchSex] = useState('');
  const [match_photo, setMatchPhoto] = useState('');
  const [match_id, setMatchID] = useState('');
  const [pageType, setPageType] = useState('');

  const location = useLocation();
  // Gets the passed in match id from the link in the home page
  // timeout_5 is passed in from the home link. it prevents removing the match document in the background.

  const history = useHistory();

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  // Fetch the matches' name, birth, sex when page loads.
  async function fetchMatchInfo(id_of_match) {
    try {
      var config = {
        method: 'post',
        url: bp.buildPath('api/getbasicuser'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: { uid: id_of_match },
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

  // this effect only runs once.
  useEffect(() => {
    if (
      history &&
      history.location &&
      history.location.state &&
      history.location.state.state &&
      history.location.state.state.match_id
    ) {
      var mtch_id = history.location.state.state.match_id;
      console.log(mtch_id);
      fetchMatchInfo(mtch_id);
      setMatchID(mtch_id);
      setPageType(history.location.state.state.type);
      console.log(history.location.state.state.type);
    } else {
      console.log('not from chat');
      redirectToHome();
    }
    // This gets the match data.
  }, []);

  //   async function handleLogout() {
  //     try {
  //       // Push the state to login that we need to purge the old user searches.
  //       await logout();
  //       localStorage.removeItem('user_data');
  //       history.push('/login', {
  //         state: { fromHome: true, oldID: currentUser.uid },
  //       });
  //       window.location.reload();
  //     } catch {
  //       setError('Failed to log out');
  //     }
  //   }

  function redirectToHome() {
    history.push('/');
    // window.location.reload(); CHANGED_NOW
  }

  return (
    <React.Fragment>
      <h2 className="text-center mb-4">After Chat</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {pageType && pageType == 'match_abandoned' && (
        <Alert variant="info">{'Your match left.'}</Alert>
      )}
      {pageType && pageType == 'user_abandoned' && (
        <Alert variant="info">{"Sorry it didn't go well :("}</Alert>
      )}
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
      <Button onClick={redirectToHome}>Home</Button>
    </React.Fragment>
  );
}
