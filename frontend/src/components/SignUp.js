import React, { useRef, useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

export default function SignUp() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    var bp = require('../Path.js');

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match.');
    }

    if (passwordRef.current.value.length <= 6) {
      return setError('Password should be more than six characters');
    }

    try {
      setError('');
      setLoading(true);
      var newUser_cred = await signup(
        emailRef.current.value,
        passwordRef.current.value
      );
      var newUser = newUser_cred.user;
      var obj = {
        email: newUser.email,
        sex: '',
        sexOrientation: '',
        birth: '',
        exitMessage: '',
        userID: newUser.uid,
        photo: newUser.photoURL == null ? '' : newUser.photoURL,
        displayName: newUser.displayName == null ? '' : newUser.displayName,
        initializedProfile: 0,
        FailMatch: [],
        SuccessMatch: [],
      };

      var config = {
        method: 'post',
        url: bp.buildPath('api/newuser'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: obj,
      };

      var response = await axios(config);
      // var parsedRes = JSON.parse(response);
      if (response.data.error === '') {
        setLoading(false);
        history.push('/verify');
      } else {
        setError('Axios error');
      }
    } catch (error) {
      setError('Failed to create an account: ' + error);
      try {
        await logout();
      } catch (err) {
        setError('Secondary logout error : ' + err);
      }
      setLoading(false);
    }
  }

  //   // setLoading(false);
  //   if (!loading) {
  //     try {
  //       setError('');
  //       setLoading(true);
  //       var obj = {
  //         email: currentUser.email,
  //         sex: '',
  //         sexOrientation: '',
  //         birth: '',
  //         exitMessage: '',
  //         userID: currentUser.uid,
  //         photo: currentUser.photoURL,
  //         displayName: currentUser.displayName,
  //         initializedProfile: 0,
  //         FailMatch: [],
  //         SuccessMatch: [],
  //       };
  //       var js = JSON.stringify(obj);

  //       var config = {
  //         method: 'post',
  //         url: bp.buildPath('api/newuser'),
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         data: js,
  //       };

  //       var response = await axios(config);
  //       var parsedRes = JSON.parse(response);
  //       if (parsedRes.error === '') {
  //         history.push('/verify');
  //       } else {
  //         setError('Axios error');
  //       }
  //     } catch (error) {
  //       setError('Failed to create an account: ' + error);
  //       try {
  //         await logout();
  //       } catch (err) {
  //         setError('Secondary logout error : ' + err);
  //       }
  //     }

  //     setLoading(false);
  //   }
  // }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-3">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button disabled={loading} className="w-100 mt-2" type="submit">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        {' '}
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </>
  );
}
