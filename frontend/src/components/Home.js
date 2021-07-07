import React, { useState, useEffect, useRef } from 'react';
// import { Button, Alert, Container } from 'react-bootstrap';
import { Alert, AlertTitle } from '@material-ui/lab';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import moment from 'moment';

var bp = require('../Path.js');

export default function Home() {
  const observer = useRef(null);
  // Prevent some prompt issues.

  // error corresponds to an alert that will display err messages.
  const [error, setError] = useState('');
  // when lockout is true, the search button is disabled. this is for
  // locking the button while states are changing or loading is occuring
  const [lockout, setLockout] = useState(false);
  const [myPhoto, setMyPhoto] = useState('');
  // the firebase firestore instance, used to query, add, delete, edit from DB.
  const firestore = firebase.firestore();
  // The currentUser object represents the authenticated firebase user.
  // This is guaranteed to be here when rendered, because of the routes.
  const { currentUser, logout } = useAuth();
  // The match is the state the user is in, "not searching" searching or found.
  const [match, setMatch] = useState('Not searching.');
  const [id_of_match, setId] = useState('none');
  // Search timeout in milliseconds
  const MS_BEFORE_ABANDON_SEARCH = 10000;
  // Before match expires. they are separate just incase.
  const MS_BEFORE_ABANDON_MATCH_DOCJOIN = 10000;
  const MS_BEFORE_ABANDON_MATCH_DOCHOST = 10000;
  // The observer will eventually be a function that listens for changes
  // to the database. to prevent resource leaks, we can call observer()
  // to stop listening ('unsubscribe' to changes)
  // var observer = null;
  // The history is for redirects.
  const history = useHistory();
  // var timeout1 = null;
  // var timeout2 = null;
  // var timeout3 = null;
  // var timeout4 = null;
  var timeout5 = null;

  // Basic user info for their preferences. Will be referenced in search.
  var userInfo = {
    birth: '',
    exitMessage: '',
    firstName: '',
    sex: '',
    sexOrientation: '',
    photo: '',
  };

  // useEffect occurs only once on page load.
  // This will clear any record of the user in the 'searching' collection
  // so that it not only resets the searching state, but
  // could signal to other users that they are no longer available.
  // this works by setting the match field to empty if it exists, or if
  // they are the doc owner it just sets the field to "" and then deletes.
  //
  // The matching algorithm/mechanism is described after the useEffect, in
  // the search function.
  useEffect(() => {
    localStorage.removeItem('chatExpiry');

    async function getIntialUserPhoto() {
      try {
        var config = {
          method: 'post',
          url: bp.buildPath('api/getbasicuser'),
          headers: {
            'Content-Type': 'application/json',
          },
          data: { uid: currentUser.uid },
        };
        var response = await axios(config);
        setMyPhoto(response.data.photo);
      } catch (error) {
        console.log(error);
        console.log('issue in fetch data');
      }
      // document.getElementById('photo').src = userInfo.photo;
    }

    async function purgeOld() {
      // Lock the search button until these tasks are complete.
      setLockout(true);
      console.log('I SHOULD ONLY PRINT ONCE PER PAGE LOAD');
      try {
        // If I am "document host", clear the match field first.
        try {
          await firestore
            .collection('searching')
            .doc(currentUser.uid)
            .update({ match: '' });
          console.log('cleared old match before delete');
        } catch (error) {
          console.log('tried to clear match before delete, but failed');
          console.log('most of the time this is ok');
          // this is okay because this most likely wont exist on each load.
        }

        // Delete the document (if exists) if I am a "document host".
        await firestore.collection('searching').doc(currentUser.uid).delete();

        // The final mechanism for clearing. This is if I was a previous
        // "document joiner" or "filling in" the existing doc.
        // I will search all docs where my id is the match field, and clear it.
        // This will signal to those listening to that field that I am
        // no longer available.
        firestore
          .collection('searching')
          .where('match', '==', currentUser.uid)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
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
      } catch (error) {
        console.log(error);
      }
      // Unlock the button now that initial tasks are done.
      setLockout(false);
    }
    // call the function that was just defined here.
    purgeOld();
    getIntialUserPhoto();
    return () => {
      clearTimeout(timeout5);
      console.log('LEAVING!');
      if (observer.current !== null) {
        observer.current();
      } else {
        console.log('could not clear observer');
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  // This makes a POST request to the server listening at /api/getuser
  // It returns the user's search preferences.
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
      userInfo.photo = response.data.photo;

      // Set this into local storage for easy reference and persistence.
      localStorage.setItem('user_data', JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
      console.log('issue in fetch data');
    }
  }

  // When the user logs out, call the observer to unsubscribe to changes.
  // and logout.
  async function handleLogout() {
    try {
      // Push the state to login that we need to purge the old user searches.

      await logout();
      localStorage.removeItem('user_data');
      history.push('/login', {
        state: { fromHome: true, oldID: currentUser.uid },
      });
      // Sort of a workaround incase user logs back in quickly.
      // window.location.reload();
    } catch {
      setError('Failed to log out');
    }
  }

  // Used for the profile button in the JSX.
  function redirectToProfile() {
    history.push('/profile');
  }

  function clearAllTimeouts() {
    clearTimeout(timeout5);
    console.log('tried to clear timeouts in home. this probably didnt work.');
  }

  // .
  // ..
  // ...

  // The "waiting room" or search logic!
  // This is a bit long. But it happens in three main stages.
  // First, a description:
  // Users will post a document in the 'searching' collection of the DB,
  // which will have a blank "match" field. In this field, will go the
  // id of the user who matches these criteria.
  // The document contains the users search preferences, which is posted from
  // one of the steps here.

  // The idea is: post a document like an "ad" that you are looking for
  // someone. This is the "document host" that I referred to earlier.
  // The next person can come in and "fill" that document in, or join it.
  // However you want to word it. But users will always try to fill existing
  // documents first, before going and make a new one to be filled.

  // There will always be two types of users here: one that owns the doc,
  // and one that joins the doc (i.e. places their ID *into* the existing doc).

  // The main stages are here:
  //
  // 1. Fetch the user data (search preferences)
  //
  // 2. See if there are any documents that have mutual preferences.
  //    If so, fill that document! I place my ID in their match field.
  //    They are alerted, but now I listen for changes to that doc.
  //    This is now a successful pairing, because I joined their doc.
  //
  // 3. If no doc was found, create a document there. I am now a doc host.
  //    I will listen to that document and wait for the match field to
  //    be filled in. This is not a complete pair yet, my match field
  //    needs to be set by someone else. Listen to the doc and wait.

  // ...
  // ..
  // .

  async function searching() {
    // State for match is now searching.
    setMatch('Searching.');

    // Is there user preferences in the local storage?
    // If not, query the API and get the new data.
    if (localStorage.getItem('user_data') === null) {
      console.log('1');
      await fetchData();
      try {
      } catch (error) {
        setLockout(false);
        console.log(error);
      }
    } else {
      // otherwise, its in user data so lets just get it.
      var local = JSON.parse(localStorage.getItem('user_data'));
      console.log('2');
      userInfo.birth = local.birth;
      userInfo.exitMessage = local.exitMessage;
      userInfo.firstName = local.firstName;
      userInfo.sex = local.sex;
      userInfo.sexOrientation = local.sexOrientation;
      userInfo.photo = local.photo;
    }

    // Lock the search button for now, until tasks are done.
    setLockout(true);
    var matchFound = false; // Match found boolean, for this only.
    var matchInternal = ''; // ID of found, for this function only.

    // Nested function. This is so we can find what sex is being
    // sought, based on our current preferences.
    function getSearchingSex() {
      // Undeveloped preference logic. This NEEDS support for any, rn
      // is only basic support.
      var searchingSex = '';
      if (userInfo.sexOrientation === 'Heterosexual') {
        if (userInfo.sex === 'Male') {
          searchingSex = ['Female'];
        } else {
          searchingSex = ['Male'];
        }
      } else if (userInfo.sexOrientation === 'Homosexual') {
        if (userInfo.sex === 'Female') {
          searchingSex = ['Female'];
        } else {
          searchingSex = ['Male'];
        }
      } else if (userInfo.sexOrientation === 'Bisexual') {
        searchingSex = ['Male', 'Female']; // Not working right now.
      }
      return searchingSex;
    }
    // STAGE TWO //
    // Try to find and 'fill' an existing document, to complete a match!

    function fillMatch(doc_id) {
      try {
        // By doing '.update()', I set my ID into their doc
        firestore
          .collection('searching')
          .doc(doc_id)
          .update({ match: currentUser.uid });
        // Match is found! Do the correct tasks.
        matchFound = true;
        setId(doc_id);
        setMatch('Found match! ' + doc_id);
        // Clear the searching timeout.
        // clearTimeout(timeOut);
        clearAllTimeouts();
        matchInternal = doc_id;
      } catch (error) {
        console.log('324');
      }
    }

    try {
      // Find what sex we are seeking.
      var searchingSex = getSearchingSex();

      // The database query. Check all docs for possible matches.
      var snapshot = await firestore.collection('searching').get();
      snapshot.forEach((doc) => {
        // *************************************************************
        // NEEDS AGE CHECK, and some refactor for any sex.
        // Is it:
        //   - no current match
        //   - are they what I am searching for
        //   - am I what they are searching for
        console.log(doc.data().search_sex);
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        if (
          doc.data().match === '' &&
          searchingSex.includes(doc.data().sex) &&
          doc.data().search_sex.includes(userInfo.sex)
        ) {
          fillMatch(doc.id);
        }
      });
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      // Still part of phase two. Listen for changes to the doc we
      // just filled in. Its possible the doc owner drops out,
      // and we need to listen for this.
      // Some things not done yet: alert the users their match was dropped.
      // now it just kicks you back to the initial state. This is easy to
      // alert, we can just change a state or something.
      if (matchFound) {
        console.log('yes, but lets listen for changes');
        // This works only to see if fields changed, not if doc deleted.
        // The workaround is: before deleting, set the match to "" first.
        observer.current = firestore
          .collection('searching')
          .where(firebase.firestore.FieldPath.documentId(), '==', matchInternal)
          .onSnapshot((snapshot) => {
            // console.log(snapshot);
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'modified') {
                // So if the doc filler loses the match, then we need to reset.
                // console.log(`new match info ${change.doc.data().match}`);
                if (change.doc.data().match === '') {
                  // Uh oh. The doc match was just set empty. The doc owner
                  // must have refreshed their session.
                  matchFound = false;
                  setId('none');
                  setMatch('Not searching.');
                  setError('');
                  // clearTimeout(timeOut);
                  // These two clear all timeouts.
                  clearAllTimeouts();

                  setLockout(false);
                  ////observer();
                }
              }
            });
          });
      }
    } catch (error) {
      console.log(error);
    }

    // STAGE THREE //
    // This is if we didn't find a match, then we need to make our own
    // doc in 'searching' and then just wait for someone to join.
    if (!matchFound) {
      try {
        // Same searching logic as above.
        searchingSex = getSearchingSex();

        // Lets make a new document.
        // ************************************************************8
        // This has no support for age matches yet. We only
        // match based on mutual sex compatibility. The search age values
        // are just there for now, so hopefully we can implement
        // that within the searches.
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
            host_socket_id: '',
            join_socket_id: '',
          });
        // Just posted the new doc to the 'searching' collection.
        console.log('DOC CREATED');
        // Hang on to the observer now. This is the listener on my new
        // document. I am waiting for the match field to be filled,
        // but it can also get un-filled. Account for both.
        observer.current = firestore
          .collection('searching')
          .doc(currentUser.uid)
          .onSnapshot((docSnapshot) => {
            // The data exists AND the match is not empty! We just found one.
            if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().match !== ''
            ) {
              matchFound = true;
              setId(docSnapshot.data().match);
              setMatch('Found match! ' + docSnapshot.data().match);
              // clearTimeout(timeOut);
              clearAllTimeouts();
            } else if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().match === ''
            ) {
              // Match left..
              matchFound = false;
              setId('none');
              setMatch('Searching.');
              setError('');
              // clearTimeout(timeOut);
              // Clear timeouts, to prevent the match abandon refresh.
              clearAllTimeouts();
              timeout5 = setTimeout(() => {
                if (window.location.pathname == '/' && id_of_match === 'none') {
                  console.log('TIMEOUT DOC HOST');
                  setLockout(true);
                  // Abandoning the search should involve me clearing the old doc
                  // that I posted up.
                  async function deleteOldRecordAfterAbandon() {
                    try {
                      await firestore
                        .collection('searching')
                        .doc(currentUser.uid)
                        .update({ match: '' });
                      console.log('cleared old match before delete');
                    } catch (error) {
                      console.log(
                        'tried to clear match before delete, but failed'
                      );
                      console.log('most of the time this is ok');
                      // this is okay because this most likely wont exist on each load.
                    }

                    // Delete the document (if exists) if I am a "document host".
                    try {
                      await firestore
                        .collection('searching')
                        .doc(currentUser.uid)
                        .delete();
                      console.log('deleted my doc');
                    } catch (error) {
                      console.log('error:');
                      console.log(error);
                    }
                  }
                  deleteOldRecordAfterAbandon();

                  setMatch('Not searching.');
                  setError('');
                  if (observer.current !== null) {
                    observer.current();
                  } else {
                    console.log('could not clear observer in dochost');
                  }
                  setLockout(false);
                } else {
                  console.log('timeout 5 tried to run, but was ignored.');
                }
              }, MS_BEFORE_ABANDON_SEARCH);
            }
          });
      } catch (error) {
        alert(error);
        setLockout(false);
      }

      if (matchFound) {
        // Here is where we would also tell the user to move to the chat.
        // They have MS_BEFORE_ABANDON_MATCH seconds to do so.
        setLockout(true);
      }
    }
  }

  // The actual JSX components. The top is the errors/match states,
  // conditionally rendered.
  return (
    <React.Fragment>
      <h2 className="text-center mb-4">Welcome! WE GOOD :D </h2>
      {error && <Alert severity="error">{error}</Alert>}
      {match && match === 'Not searching.' && (
        <Alert severity="warning">{match}</Alert>
      )}
      {match && match === 'Searching.' && (
        <Alert severity="info">{match}</Alert>
      )}
      {match && match !== 'Not searching.' && match !== 'Searching.' && (
        <Alert severity="success">{match}</Alert>
      )}
      <Container>
        <strong>Email:</strong> {currentUser.email}
        <br></br>
        <strong>User ID:</strong> {currentUser.uid}
        <br></br>
        {/* <strong>Refresh token:</strong> {currentUser.refreshToken}
        <br></br> */}
        <strong>Photo:</strong>
        <br></br>
        {myPhoto !== '' ? (
          <img height="100px" width="100px" src={myPhoto} id="photo"></img>
        ) : (
          <></>
        )}
        <br></br>
        <strong>Verified email: </strong>
        {currentUser.emailVerified ? 'verified' : 'not verified'}
      </Container>

      <Button variant="contained" color="primary" onClick={redirectToProfile}>
        Profile
      </Button>
      <div className="w-100 text-center mt-2">
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <Link
        to={{
          pathname: id_of_match === 'none' ? '/' : '/chat',
          state: {
            match_id: id_of_match,
            timeout_5: timeout5,
          },
        }}>
        {id_of_match === 'none' ? 'No match yet.' : 'Go to chat page with data'}
      </Link>
      <br></br>
      <br></br>
      <Button
        variant="outlined"
        color="primary"
        disabled={lockout}
        onClick={searching}>
        Search for Match
      </Button>
    </React.Fragment>
  );
}
