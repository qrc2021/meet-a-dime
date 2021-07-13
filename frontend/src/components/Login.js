import React, { useRef, useState, useEffect } from 'react';
import Link from '@material-ui/core/Link';
//import { View, Text, ScrollView, TextInput } from 'react-native';
import { Card, Form, Button, CardDeck } from 'react-bootstrap';
import Container from '@material-ui/core/Container';
import { useHistory } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import { useAuth } from '../contexts/AuthContext';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { Formik } from 'formik';
import * as yup from 'yup';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const history = useHistory();
  const [error, setError] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const schema = yup.object().shape({
    email: yup.string().email('An email is required.').required().trim(),
    password: yup.string().required('You must have a password.').min(7).trim(),
  });

  function handleErrors(error) {
    // console.log(error);
    if (error === 'auth/wrong-password') {
      // setError('Incorrect password.');
      setInvalidPassword(true);
    } else if (error === 'auth/user-not-found') {
      // setError('Your account does not exist.');
      setInvalidEmail(true);
    } else if (error === 'auth/too-many-requests') {
      setError('You are submitting too many requests, wait a few minutes.');
    } else {
      setError(error);
    }
  }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmitForm() {
    console.log('attempting submit.');
    try {
      setError('');
      setInvalidEmail(false);
      setInvalidPassword(false);
      setLoading(true);
      if (!isChecked) {
        await firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      }
      await login(emailRef.current.value, passwordRef.current.value);
      history.push('/verify');
      // window.location.reload();
    } catch (error) {
      // setError('Failed to login: ' + error.message);
      handleErrors(error.code === undefined ? error : error.code);
    }
    if (window.location.pathname === '/login') setLoading(false);
  }

  document.body.style.backgroundColor = '#dceaff';
  return (
    <>
      <Container style={{ flex: '1' }}>
        <CardDeck
          style={{
            display: 'flex',
            flexflow: 'row wrap',
            alignItems: 'center',
            backgroundColor: '#DCEAFF',
            marginTop: '50px'
          }}>
          <Card.Img
            variant="top"
            src="DimeAssets/homelogo.png"
            style={{
              maxWidth: '600px',
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
              borderRadius: '30px',
            }}>
            <Card.Body>
              <Card.Img
                variant="top"
                className="mb-3"
                src="DimeAssets/headerlogo.png"
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Formik
                validationSchema={schema}
                onSubmit={(values) => {
                  handleSubmitForm();
                }}
                initialValues={{
                  email: '',
                  password: '',
                }}>
                {({
                  handleSubmit,
                  handleChange,
                  setFieldValue,
                  handleBlur,
                  values,
                  touched,
                  isValid,
                  errors,
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group
                      id="name"
                      style={{
                        marginBottom: '15px',
                      }}>
                      <Form.Control
                        placeholder="Email"
                        type="email"
                        ref={emailRef}
                        value={values.email}
                        name="email"
                        onChange={handleChange}
                        isValid={touched.email && !errors.email}
                        isInvalid={
                          (touched.email && errors.email) || invalidEmail
                        }
                        data-lpignore="true"
                      />
                      <Form.Control.Feedback type="invalid">
                        {invalidEmail && 'Your account does not exist.'}
                      </Form.Control.Feedback>
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
                        value={values.password}
                        name="password"
                        onChange={handleChange}
                        isInvalid={
                          (touched.password && errors.password) ||
                          invalidPassword
                        }
                        data-lpignore="true"
                      />
                      <Form.Control.Feedback type="invalid">
                        {invalidPassword && 'Incorrect password.'}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check
                        defaultChecked={isChecked}
                        onClick={() => {
                          setChecked(!isChecked);
                        }}
                        type="checkbox"
                        label="Keep me logged in"
                      />
                    </Form.Group>
                    <Button
                      disabled={loading}
                      className="btn-primary w-100 mt-2 mb-1"
                      type="submit">
                      Log In
                    </Button>
                  </Form>
                )}
              </Formik>
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
                borderRadius: '30px',
              }}>
              <Button
                disabled={loading}
                className="btn-secondary w-100 mt-2"
                href="/signup">
                Sign up
              </Button>
            </Card.Footer>
          </Card>
        </CardDeck>
      </Container>
    </>
  );
}
