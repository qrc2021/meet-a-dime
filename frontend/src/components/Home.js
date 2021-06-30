import React, { useState, useRef } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import moment from 'moment';

var bp = require('../Path.js');

export default function Home() {
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState(false);
  const firestore = firebase.firestore();
  const { currentUser, logout } = useAuth();
  const [match, setMatch] = useState('Not searching.');
  const [id_of_match, setId] = useState('none');

  // const messagesRef = firestore.collection('searching');
  // const query = messagesRef.orderBy('createdAt').limit(25);
  // const [activeSearches] = useCollectionData(query, { idField: 'id' });

  var observer = 'none';
  //
  //
  //

  const history = useHistory();
  var userInfo = {
    birth: '',
    exitMessage: '',
    firstName: '',
    sex: '',
    sexOrientation: '',
  };
  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  // console.log(currentUser);
  // console.log(currentUser.getIdToken());

  async function fetchData() {
    try {
      var config = {
        method: 'post',
        url: bp.buildPath('api/getuser'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: { uid: currentUser.uid },
      };

      var response = await axios(config);
      console.log(response.data);

      userInfo.birth = response.data.birth;
      userInfo.exitMessage = response.data.exitMessage;
      userInfo.firstName = response.data.firstName;
      userInfo.sex = response.data.sex;
      userInfo.sexOrientation = response.data.sexOrientation;

      localStorage.setItem('user_data', JSON.stringify(response.data));
      // var parsedRes = JSON.parse(response);
    } catch (error) {}
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

  function redirectToProfile() {
    history.push('/Profile');
  }

  async function searching() {
    setMatch('Searching.');

    if (localStorage.getItem('user_data') == null) {
      await fetchData();
      try {
      } catch (error) {
        setLockout(false);
      }
    } else {
      var local = JSON.parse(localStorage.getItem('user_data'));
      userInfo.birth = local.birth;
      userInfo.exitMessage = local.exitMessage;
      userInfo.firstName = local.firstName;
      userInfo.sex = local.sex;
      userInfo.sexOrientation = local.sexOrientation;
    }

    setLockout(true);
    var matchFound = false;
    try {
      //
      //
      //
      //
      //
      const [year, month, day] = userInfo.birth.split('-');
      var searchingSex = '';
      if (userInfo.sexOrientation == 'Heterosexual') {
        if (userInfo.sex == 'Male') {
          searchingSex = 'Female';
        } else {
          searchingSex = 'Male';
        }
      } else if (userInfo.sexOrientation == 'Homosexual') {
        if (userInfo.sex == 'Female') {
          searchingSex = 'Female';
        } else {
          searchingSex = 'Male';
        }
      } else {
        searchingSex = 'Any';
      }
      //
      //
      //
      //
      //
      var snapshot = await firestore.collection('searching').get();
      snapshot.forEach((doc) => {
        // console.log(doc.id, '=>', doc.data());
        // *************************************************************
        if (
          doc.data().sex === searchingSex &&
          doc.data().search_sex === userInfo.sex
        ) {
          // NEEDS AGE CHECK, and some refactor for any sex.

          try {
            firestore
              .collection('searching')
              .doc(doc.id)
              .update({ match: currentUser.uid });
            matchFound = true;
            setId(doc.id);
            setMatch('Found match! ' + doc.id);
          } catch (error) {}
        }
      });
    } catch (error) {}

    if (!matchFound) {
      try {
        const [year, month, day] = userInfo.birth.split('-');
        var searchingSex = '';
        if (userInfo.sexOrientation == 'Heterosexual') {
          if (userInfo.sex == 'Male') {
            searchingSex = 'Female';
          } else {
            searchingSex = 'Male';
          }
        } else if (userInfo.sexOrientation == 'Homosexual') {
          if (userInfo.sex == 'Female') {
            searchingSex = 'Female';
          } else {
            searchingSex = 'Male';
          }
        } else {
          searchingSex = 'Any';
        }
        await firestore
          .collection('searching')
          .doc(currentUser.uid)
          .set({
            match: '',
            age: moment().diff(userInfo.birth, 'years'),
            sex: userInfo.sex,
            search_age_start: '18',
            search_age_end: '99',
            search_sex: searchingSex,
            seeker: currentUser.uid,
          });
        console.log('DOC CREATED');
        observer = firestore
          .collection('searching')
          .doc(currentUser.uid)
          .onSnapshot((docSnapshot) => {
            if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().match != ''
            ) {
              matchFound = true;
              setId(docSnapshot.data().match);
              setMatch('Found match! ' + docSnapshot.data().match);
              observer();
            }
          });
      } catch (error) {
        alert(error);
        setLockout(false);
      }

      if (matchFound) {
        setLockout(true);
        observer();
      }
    }
  }

  return (
    <React.Fragment>
      <h2 className="text-center mb-4">Welcome! WE GOOD :D </h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {match && match == 'Not searching.' && (
        <Alert variant="warning">{match}</Alert>
      )}
      {match && match == 'Searching.' && <Alert variant="info">{match}</Alert>}
      {match && match != 'Not searching.' && match != 'Searching.' && (
        <Alert variant="success">{match}</Alert>
      )}
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
      <h1>{id_of_match}</h1>
      <Button onClick={redirectToProfile}>Profile</Button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <Button disabled={lockout} onClick={searching}>
        Search for Match
      </Button>
      <div className="App">{/* <ChatRoom /> */}</div>
    </React.Fragment>
  );

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
  //

  // Stolen::
  function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);

    const [messages] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
      e.preventDefault();

      const { uid, photoURL } = currentUser;

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });

      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
      <>
        <main>
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

          <span ref={dummy}></span>
        </main>

        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="send a message"
          />

          <button type="submit" disabled={!formValue}>
            send
          </button>
        </form>
      </>
    );
  }

  function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === currentUser.uid ? 'sent' : 'received';

    return (
      <>
        <div className={`message ${messageClass}`}>
          <img src={photoURL} />
          <p>{text}</p>
        </div>
      </>
    );
  }
  // Stolen::
}
