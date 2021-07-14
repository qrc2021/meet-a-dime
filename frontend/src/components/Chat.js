import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Container, Form, Modal, Image, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import { io } from 'socket.io-client';
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';

import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

var bp = require('../Path.js');
const firestore = firebase.firestore();

// Drawer
const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  },
  title: {
    flexGrow: 1,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    background: '#FFDCF2',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  listItemText: {
    fontSize: '25px',
    fontWeight: 'bold',
    color: '#E64398',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    // marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
}));

export default function Chat() {
  // Drawer
  const classes = useStyles();
  const itemsList = [
    {
      text: 'Home',
      icon: <HomeIcon style={{ color: '#e64398' }} />,
      onClick: redirectToHome,
    },
    {
      text: 'Logout',
      icon: <ExitToAppIcon style={{ color: '#e64398' }} />,
      onClick: handleLogout,
    },
  ];

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [switching, setSwitching] = useState(false);

  const messageRef = useRef();

  const timeoutRef1 = useRef();
  const timeoutRef2 = useRef();
  const extendedTimeoutRef = useRef();
  const socketRef = useRef();

  const EXPIRE_IN_MINUTES = 0.1; // 10 minutes
  const modalExpire = 10000; // 30 seconds in MS
  const [room, setRoom] = useState('');
  //const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState();
  const [afterChat, setAfterChat] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const refAfterChat = useRef(false);
  // const [isHost, setHost] = useState('none');
  const { currentUser, logout } = useAuth();

  const [match_age, setMatchAge] = useState('');
  const [match_name, setMatchName] = useState('user');
  const [match_sex, setMatchSex] = useState('');
  const [match_photo, setMatchPhoto] = useState('');
  // console.log(socket);
  useLocation();
  // Gets the passed in match id from the link in the home page
  // timeout_5 is passed in from the home link. it prevents removing the match document in the background.

  const history = useHistory();
  const observer = useRef(null);

  // if (location.state === undefined) window.location.href = '/';

  // const { match_id, timeout_5 } = location.state;

  var match_id = null;
  var timeout_5 = null;

  // In case the user navigates here directly by accident.
  if (
    history.location &&
    history.location.state &&
    history.location.state.state &&
    history.location.state.state.match_id
  ) {
    match_id = history.location.state.state.match_id;
    timeout_5 = history.location.state.state.timeout_5;
  } else {
    console.log('DOESNT BELONG');
    if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
    if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);
    window.location.href = '/';
  }

  document.getElementById('room-button');
  document.getElementById('message_input');
  document.getElementById('room-input');
  document.getElementById('form');

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
  }

  // Fetch the matches' name, birth, sex when page loads.
  async function fetchMatchInfo() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      var config = {
        method: 'post',
        url: bp.buildPath('api/getbasicuser'),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
    if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);
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
      console.log('LEFT MY ROOM TOO');

      history.push('/after', {
        state: { match_id: match_id, type: 'user_didnt_go_well' },
      });
    }, 0);
  }

  async function noMatchTimeout() {
    var seeker = 'none';
    var match = 'none';

    var docRef = firestore.collection('searching').doc(currentUser.uid);
    var doc = await docRef.get();
    if (doc.exists) {
      seeker = currentUser.uid;
      match = match_id;
    } else {
      seeker = match_id;
      match = currentUser.uid;
    }

    if (currentUser.uid === seeker) {
      await firestore.collection('searching').doc(currentUser.uid).update({
        seekerTail: 'timeout',
      });
      console.log('I am the seeker, I set my value TIMEOUT.');
    }

    if (currentUser.uid === match) {
      await firestore.collection('searching').doc(match_id).update({
        matchTail: 'timeout',
      });
      console.log('I am the match, I set my value TIMEOUT.');
    }
    socketRef.current.emit('leave-room-silently', currentUser.uid, room);

    history.push('/after', {
      state: { match_id: match_id, type: 'timeout' },
    });

    console.log('Left room silently');
  }

  async function pendingMatch() {
    // This disconnects then sends to the /after page with a state.
    function leavePageWith(stateString) {
      socketRef.current.emit('leave-room-silently', currentUser.uid, room);
      history.push('/after', {
        state: { match_id: match_id, type: stateString },
      });
    }
    // This sets both eachothe to success matches, if we get actually get there.
    async function setSuccessMatches() {
      await firestore
        .collection('users')
        .doc(currentUser.uid)
        .update({
          SuccessMatch: firebase.firestore.FieldValue.arrayUnion(match_id),
        });
      await firestore
        .collection('users')
        .doc(match_id)
        .update({
          SuccessMatch: firebase.firestore.FieldValue.arrayUnion(
            currentUser.uid
          ),
        });
    }
    /*
  Lord Lui Notes:
  it would definetly have to be with sockets 
  (emit an event to the other user) 
  
  or 
  with a firebase database listener to wait for changes 
  to the searching doc (like two fields would need to 
  be added to the doc, one for each of the users whether 
  they say yes. if it gets edited you can capture that)

  the searching doc gets created when the user searches, and stays up 
  during the chat until they go back to home

  so it should be accessible on the chat page to edit and update and read

  for each pair: one person is the title of the document, 
  and the other has their ID in the 'match' field

  def recommend making two accounts to test with, and one has to be 
  logged in on incognito mode or a different browser

  (just cause otherwise they share the same data when testing)*/

    // if (localStorage.getItem('modalExpiry') === null) {
    //   var exp = Date.now() + modalExpire * 60000;
    //   localStorage.setItem('modalExpiry', exp);
    //   console.log('set to', exp);
    // }

    // If a user clicks a match dime, stop the timeouts.
    if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
    if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);

    // This extended timeout waits for an answer.
    var extended_timeout = setTimeout(() => {
      socketRef.current.emit('leave-room-silently', currentUser.uid, room);
      observer.current();
      history.push('/after', {
        state: { match_id: match_id, type: 'extended_timeout' },
      });
    }, modalExpire);

    // Save in ref incase a regular abandon occurs.
    extendedTimeoutRef.current = extended_timeout;

    // Identify who is who.
    var seeker = 'none';
    var match = 'none';

    // There is only one doc. If I am the doc name, I am seeker. else, match
    var docRef = firestore.collection('searching').doc(currentUser.uid);
    var doc = await docRef.get();
    if (doc.exists) {
      seeker = currentUser.uid;
      match = match_id;
    } else {
      seeker = match_id;
      match = currentUser.uid;
    }

    // If im seeker, I need to set my value to true and wait for matchTail.
    if (currentUser.uid === seeker) {
      await firestore.collection('searching').doc(currentUser.uid).update({
        seekerTail: 'true',
      });
      console.log('I am the seeker, I set my value true.');
      // Now, check immediately just in case.
      var res = await firestore
        .collection('searching')
        .doc(currentUser.uid)
        .get();
      if (res.data().matchTail === 'true') {
        // OTHER PERSON SAID YES!!!!
        setSuccessMatches();
        console.log('match said yes!!');
        clearTimeout(extended_timeout);

        leavePageWith('match_made');
      } else {
        // Nothing yet, lets wait for a change to the matchTail.
        observer.current = firestore
          .collection('searching')
          .doc(currentUser.uid)
          .onSnapshot((docSnapshot) => {
            if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().matchTail === 'true'
            ) {
              // THEY SAID YES !! (but after)
              setSuccessMatches();
              console.log('other person (the match) said yes after');
              observer.current();
              clearTimeout(extended_timeout);
              leavePageWith('match_made');
            }
            if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().matchTail === 'timeout'
            ) {
              // The other person timed out..
              console.log('other person (the match) timed out');
              observer.current();
              clearTimeout(extended_timeout);
              leavePageWith('match_timedout');
            }
          });
      }
    }

    // If im match, I need to set my match to true and wait for seekerTail.
    if (currentUser.uid === match) {
      await firestore.collection('searching').doc(match_id).update({
        matchTail: 'true',
      });
      console.log('I am the match, I set my value true.');
      // Now, check immediately just in case.
      res = await firestore.collection('searching').doc(match_id).get();
      if (res.data().seekerTail === 'true') {
        // OTHER PERSON SAID YES!!!!
        setSuccessMatches();
        console.log('seeker said yes!!');
        clearTimeout(extended_timeout);
        leavePageWith('match_made');
      } else {
        // I need to passively listen for a document change.
        observer.current = firestore
          .collection('searching')
          .doc(match_id)
          .onSnapshot((docSnapshot) => {
            if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().seekerTail === 'true'
            ) {
              // THEY SAID YES !! (but after)
              setSuccessMatches();
              console.log('other person (the seeker) said yes after');
              observer.current();
              clearTimeout(extended_timeout);
              leavePageWith('match_made');
            }
            if (
              docSnapshot &&
              docSnapshot.data() &&
              docSnapshot.data().seekerTail === 'timeout'
            ) {
              // The other person timed out..
              console.log('other person (the seeker) timed out');
              observer.current();
              clearTimeout(extended_timeout);
              leavePageWith('match_timedout');
            }
          });
      }
    }
  }

  function MatchModal(props) {
    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            <Image
              style={{ height: '100%', width: '250px', cursor: 'pointer' }}
              src="DimeAssets/headerlogo.png"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: '#e64398',
          }}>
          <h4
            style={{
              color: '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            You did the time! Do you want the Dime?
          </h4>
          <h5
            style={{
              color: '#ffffff',
              fontWeight: 'normal',
              textAlign: 'center',
            }}>
            Please select Tails to Match or Heads to Pass.
          </h5>
        </Modal.Body>
        <Modal.Footer className="mx-auto">
          <Image
            style={{ height: '200px', width: '200px', cursor: 'pointer' }}
            src="DimeAssets/hearteyes.png"
            onClick={pendingMatch}
            alt="Tails"
          />
          <Image
            style={{ height: '200px', width: '200px', cursor: 'pointer' }}
            src="DimeAssets/sleepycoin.png"
            onClick={noMatch}
            alt="Heads"
          />
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

    // In case the user navigates here directly by accident.
    if (
      history.location &&
      history.location.state &&
      history.location.state.state &&
      history.location.state.state.match_id
    ) {
    } else {
      console.log('DOESNT BELONG, useeffect');
      if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
      if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);
      window.location.href = '/';
      return;
    }

    // This gets the match data.
    fetchMatchInfo();
    const sock = io(bp.buildPath(''), { forceNew: true });
    sock.auth = { id };
    sock.connect();
    sock.on('connect', () => {
      console.log(
        `Email: "${currentUser.email}" \n With User ID: "${currentUser.uid}" connected with socket id: "${sock.id}"`
      );
    });

    if (localStorage.getItem('chatExpiry') === null) {
      var exp = Date.now() + EXPIRE_IN_MINUTES * 60000;
      localStorage.setItem('chatExpiry', exp);
      console.log('set to', exp);
    }

    var checkLoop = setInterval(() => {
      if (window.location.pathname !== '/chat') {
        clearInterval(checkLoop);
        return;
      }

      var current = Date.now();
      if (current >= localStorage.getItem('chatExpiry')) {
        // The chat is over, logic for after chat goes here.
        clearInterval(checkLoop);
        setModalShow(true);
        setAfterChat(true);
        refAfterChat.current = true;
        timeoutRef1.current = setTimeout(() => {
          console.log('calling no match timeout');

          noMatchTimeout();
        }, modalExpire);
      }
    }, 2000);

    var current_time = Date.now();
    if (current_time >= localStorage.getItem('chatExpiry')) {
      //Modal match vs non-match
      // The chat is over, logic for after chat goes here.
      console.log('i ran once');
      clearInterval(checkLoop); // cancels the first loop.
      setModalShow(true);
      setAfterChat(true);
      refAfterChat.current = true;
      timeoutRef2.current = setTimeout(() => {
        console.log('calling no match timeout 2');
        noMatchTimeout();
      }, modalExpire);
    }

    // This is new!
    // We get both ids, and sort them alphabetically.
    // The concatenated string is the unique room id!
    const ids = [currentUser.uid, match_id];
    ids.sort();
    const new_room = ids[0] + ids[1];
    sock.emit(
      'join-room',
      currentUser.uid.toString(),
      new_room.toString(),
      function (message) {
        if (message === 'joined') {
          console.log('callback called, joining room now.');
          setRoom(new_room);
          displayMessage('Joined the room! Introduce yourself :)', 'system');
        }
      }
    );

    setSocket(sock);
    socketRef.current = sock;
    // Wait for incoming private messages.
    sock.on('message', (message, user) => {
      if (user !== currentUser.uid) displayMessage(message, 'received');
      console.log(user);
    });
    sock.on('abandoned', (message) => {
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

        console.log(refAfterChat.current);
        if (!refAfterChat.current) {
          history.push('/after', {
            state: { match_id: match_id, type: 'match_abandoned' },
          });
        } else {
          history.push('/after', {
            state: { match_id: match_id, type: 'match_didnt_go_well' },
          });
        }
        sock.emit('leave-room', currentUser.uid, room);
        if (timeoutRef1.current !== undefined)
          clearTimeout(timeoutRef1.current);
        if (timeoutRef2.current !== undefined)
          clearTimeout(timeoutRef2.current);
        if (extendedTimeoutRef.current !== undefined)
          clearTimeout(extendedTimeoutRef.current);
        console.log('LEFT MY ROOM');
      }, 0);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  //array to store users name and message (used for local storages purposes)
  //
  //store key as a string with numbers that will increment with every message.
  //why? because we can just loop through the strings (numbers) to access all of the messages in a loop
  //ie. we don't need to generate a ton of original keys every time we add a message
  var localStorageKey = 1701;
  var localStorageTracker = new Array();

  function handleSubmit(e) {
    e.preventDefault();
    const message = messageRef.current.value;
    // const room_ = room;

    if (message === '') return;
    displayMessage(message, 'sent');

    //send value of message to local storage
    localStorage.setItem(JSON.stringify(localStorageKey), JSON.stringify(message));
    localStorageKey+=7;

    //store user that sent message as well as message in array
    //note - even-numbered indices will be users while the odd number after the index will be the sent message
    localStorageTracker[localStorageTracker.length]=currentUser.uid;
    localStorageTracker[localStorageTracker.length]=toString(message);

    // ARGS ARE: from, room, message
    socket.emit('send-to-room', currentUser.uid, room, message);
    messageRef.current.value = '';
  }

  // Two modes added for some extra processing (like maybe classes or etc)
  function displayMessage(message, mode) {
    if (window.location.pathname === '/chat') {
      var suffix = '';
      if (mode === 'received') {
        suffix = ' (them)';
      } else if (mode === 'sent') {
        suffix = ' (you)';
      } else if (mode === 'system') {
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
      console.log('LEFT ROOM DUE TO LOGOUT');
      if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
      if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);
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
    console.log('LEFT ROOM WENT HOME');
    if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
    if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);
    history.push('/');
    // window.location.reload(); CHANGED_NOW
  }

  async function redirectToAfter() {
    // user left & setting pair to no match
    socket.emit('leave-room', currentUser.uid, room);
    console.log('LEFT ROOM: REDIRECT TO AFTER');
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
    if (timeoutRef1.current !== undefined) clearTimeout(timeoutRef1.current);
    if (timeoutRef2.current !== undefined) clearTimeout(timeoutRef2.current);

    history.push('/after', {
      state: { match_id: match_id, type: 'user_abandoned' },
    });
  }

  return (
    <React.Fragment>
      <AppBar
        style={{ background: '#ffffff' }}
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}>
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.title}>
            <Navbar bg="transparent">
              <Navbar.Brand>
                <img
                  style={{ cursor: 'pointer' }}
                  src="/DimeAssets/headerlogo.png"
                  width="250px"
                  height="100%"
                  className="d-inline-block align-top"
                  alt="logo"
                  href="home"
                  onClick={redirectToHome}
                />
              </Navbar.Brand>
            </Navbar>
          </Typography>
          <Button className="btn-abandon mx-3" onClick={redirectToAfter}>
            Abandon Chat
          </Button>
          <IconButton
            color="default"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            className={clsx(open && classes.hide)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
        {switching && (
          <div>
            <LinearProgress style={{ backgroundColor: 'pink' }} />
          </div>
        )}
      </AppBar>
      <h2 className="text-center mb-4 mt-4 pt-4">Chat</h2>
      <h3 className="text-center mb-4">
        (going home will make the users lose the match). for now they can still
        research for eachother tho
      </h3>
      {error && <Alert severity="error">{error}</Alert>}
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
            id="matchPhoto"
            alt="Profile pic of match"></img>
        ) : (
          <></>
        )}
        <hr></hr>
      </Container>
      <React.Fragment>
        <Container>
          <div id="message-container" className=""></div>
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
              {/* <h3>Our room id: {room}</h3> */}
            </Form>
          )}
        </Container>
        {/* <Button
          className={!afterChat ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={!afterChat ? redirectToAfter : redirectToHome}>
          {!afterChat ? 'Abandon Chat' : 'Go Home'}
        </Button> */}
      </React.Fragment>
      {/* <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div> */}
      <MatchModal
        backdrop="static"
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}>
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon
                style={{ color: '#e64398', fontSize: '30px' }}
              />
            )}
          </IconButton>
        </div>
        <Divider style={{ background: '#e64398' }} />
        <List>
          {itemsList.map((item, index) => {
            const { text, icon, onClick } = item;
            return (
              <ListItem button key={text} onClick={onClick}>
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText
                  classes={{ primary: classes.listItemText }}
                  primary={text}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </React.Fragment>
  );
}
