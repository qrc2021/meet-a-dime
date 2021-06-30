import React, { useState, useRef, useEffect } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import moment from 'moment';
import e from 'cors';

var bp = require('../Path.js');

export default function Home() {
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState(false);
  const firestore = firebase.firestore();
  const { currentUser, logout } = useAuth();
  const [match, setMatch] = useState('Not searching.');
  const [id_of_match, setId] = useState('none');
  const MS_BEFORE_ABANDON_SEARCH = 30000;

  useEffect(() => {
    async function purgeOld() {
      setLockout(true);
      console.log('I SHOULD ONLY PRINT ONCE PER PAGE LOAD');
      try {
        try {
          await firestore
            .collection('searching')
            .doc(currentUser.uid)
            .update({ match: '' });
          console.log('cleared old match before delete');
        } catch (error) {
          console.log('tried to clear match before delete, but failed');
          console.log('most of the time this is ok');

          // console.log(error);
        }

        var res = await firestore
          .collection('searching')
          .doc(currentUser.uid)
          .delete();
        // console.log(res);

        // console.log(id_of_match);
        res = firestore
          .collection('searching')
          .where('match', '==', currentUser.uid)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              // console.log(doc.id, ' => ', doc.data());
              try {
                firestore
                  .collection('searching')
                  .doc(doc.id)
                  .update({ match: '' });
              } catch (error) {
                console.log('doc match clear error on start');
              }
            });
          })
          .catch((error) => {
            console.log('Error getting documents: ', error);
          });
        // console.log(res);
      } catch (error) {
        console.log(error);
      }
      setLockout(false);
    }
    purgeOld();
  }, []);
  // const messagesRef = firestore.collection('searching');
  // const query = messagesRef.orderBy('createdAt').limit(25);
  // const [activeSearches] = useCollectionData(query, { idField: 'id' });

  var observer = null;
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
    if (observer != null) observer();
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
    var timeOut = setTimeout(() => {
      if (id_of_match == 'none') {
        setMatch('Not searching.');
        if (observer != null) observer();
        setLockout(false);
      }
    }, MS_BEFORE_ABANDON_SEARCH);
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
    var matchInternal = '';
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
          doc.data().match == '' &&
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
            clearTimeout(timeOut);
            matchInternal = doc.id;
          } catch (error) {}
        }
      });
      if (matchFound) {
        console.log('yes, but lets listen for changes');
        console.log('idk how to implement this yet. the thing is ');
        console.log('if the doc creator deletes the doc, i cant see changes');
        // This works only to see if fields changed, not if doc deleted.

        observer = firestore
          .collection('searching')
          .where(firebase.firestore.FieldPath.documentId(), '==', matchInternal)
          .onSnapshot((snapshot) => {
            // console.log(snapshot);
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'modified') {
                // So if the doc filler loses the match, then we need to reset.
                console.log(`new match info ${change.doc.data().match}`);
                if (change.doc.data().match == '') {
                  matchFound = false;
                  setId('none');
                  setMatch('Not searching.');
                  clearTimeout(timeOut);
                  setLockout(false);
                  observer();
                }
              }
            });
          });
      }
    } catch (error) {
      console.log(error);
    }

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
              clearTimeout(timeOut);
              // observer();dont kill observer because we could lose the match.
            } else if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().match == ''
            ) {
              matchFound = false;
              setId('none');
              setMatch('Searching.');
              clearTimeout(timeOut);
              timeOut = setTimeout(() => {
                if (id_of_match == 'none') {
                  setMatch('Not searching.');
                  if (observer != null) observer();
                  setLockout(false);
                }
              }, MS_BEFORE_ABANDON_SEARCH);

              // observer();
            }
          });
      } catch (error) {
        alert(error);
        setLockout(false);
      }

      if (matchFound) {
        setLockout(true);
        // observer(); dont kill observer because we could lose the match.
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
      <h1>Match: {id_of_match}</h1>
      <Button onClick={redirectToProfile}>Profile</Button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <Link
        to={{
          pathname: id_of_match === 'none' ? '/' : '/Chat',
          state: {
            match_id: id_of_match,
          },
        }}>
        {id_of_match === 'none' ? 'No match yet.' : 'Go to chat page with data'}
      </Link>
      <br></br>
      <br></br>
      <Button disabled={lockout} onClick={searching}>
        Search for Match
      </Button>
      <div className="App">{/* <ChatRoom /> */}</div>
    </React.Fragment>
  );
}
