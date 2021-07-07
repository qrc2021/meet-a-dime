import React, { useRef, useState, useEffect } from 'react';
import Link from '@material-ui/core/Link';
//import { View, Text, ScrollView, TextInput } from 'react-native';
import { Card, Form, Button, Image, CardDeck } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useAuth } from '../contexts/AuthContext';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const history = useHistory();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  // This is to clear the old searching data when a user logouts.
  useEffect(() => {
    const firestore = firebase.firestore();
    async function purgeOld() {
      // Lock the search button until these tasks are complete.
      console.log('I SHOULD ONLY PRINT ONCE PER PAGE LOAD');
      try {
        // If I am "document host", clear the match field first.
        try {
          await firestore
            .collection('searching')
            .doc(userID)
            .update({ match: '' });
          console.log('cleared old match before delete');
        } catch (error) {
          console.log('tried to clear match before delete, but failed');
          console.log('most of the time this is ok');
          // this is okay because this most likely wont exist on each load.
        }

        // Delete the document (if exists) if I am a "document host".
        await firestore.collection('searching').doc(userID).delete();

        // The final mechanism for clearing. This is if I was a previous
        // "document joiner" or "filling in" the existing doc.
        // I will search all docs where my id is the match field, and clear it.
        // This will signal to those listening to that field that I am
        // no longer available.
        firestore
          .collection('searching')
          .where('match', '==', userID)
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
    }
    // Only if they came from home do we clear any possible active search.
    if (
      history &&
      history.location &&
      history.location.state &&
      history.location.state.state &&
      history.location.state.state.fromHome
    ) {
      var userID = history.location.state.state.oldID;
      purgeOld(userID);
      // clearAllTimeouts();
      console.log('Ran the clearing methods.');
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push('/verify');
      // window.location.reload();
    } catch (error) {
      setError('Failed to login: ' + error.message);
    }
    if (window.location.pathname === '/login') setLoading(false);
  }

  return (
    <>
      <CardDeck
        style={{
          display: 'flex',
          flexflow: 'row wrap',
          alignItems: 'center',
          backgroundColor: '#DCEAFF',
        }}>
        <Card.Img
          variant="top"
          src="DimeAssets/homelogo.png"
          style={{
            width: '900px',
            height: '900px',
            marginRight: 'auto',
            marginLeft: 'auto',
          }}
        />

        <Card
          varient="top"
          style={{
            minWidth: '300px',
            marginRight: 'auto',
            maxWidth: '400px',
          }}>
          <Card.Body>
            <Card.Img variant="top" src="DimeAssets/headerlogo.png" />
            {error && <Alert severity="error">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group
                id="email"
                style={{
                  marginBottom: '15px',
                }}>
                <Form.Control
                  placeholder="Email"
                  type="email"
                  ref={emailRef}
                  required
                />
              </Form.Group>
              <Form.Group
                id="password"
                style={{
                  marginBottom: '15px',
                }}>
                <Form.Control
                  placeholder="Password"
                  type="password"
                  ref={passwordRef}
                  required
                />
              </Form.Group>
              <Button
                disabled={loading}
                className="w-100 mt-2"
                type="submit"
                style={{
                  borderRadius: '15px',
                  backgroundColor: '#E64398',
                  fontWeight: 'bold',
                }}>
                Log In
              </Button>
            </Form>
            <div className="w-100 text-center mt-2">
              {/* <Link to="/forgot">Forgot Password?</Link> */}
              <Link
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  history.push('/forgot');
                }}>
                Forgot Password?
              </Link>
            </div>
          </Card.Body>
          <Card.Footer
            style={{
              color: '#B39BC8',
            }}>
            <Button
              disabled={loading}
              className="w-100 mt-2"
              href="/signup"
              style={{
                borderRadius: '15px',
                backgroundColor: '#B39BC8',
                fontWeight: 'bold',
              }}>
              Sign up
            </Button>
          </Card.Footer>
        </Card>
      </CardDeck>
    </>
  );
}
