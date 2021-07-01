import React, { useRef, useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

export default function SignUp() {
  const firstRef = useRef();
  const lastRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const responseRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, logout } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [optionsState, setOptionsState] = useState('0');
  const [orientationState, setOrientationState] = useState('0');
  const [phoneVal, setPhoneVal] = useState('');

  var adult = moment().subtract(18, 'years').calendar();
  console.log(adult);
  var form = moment(adult).format('YYYY-MM-DD');
  console.log(form);
  const [dateState, setDateState] = useState(form);

  const history = useHistory();
  // console.log(form)
  //console.log(optionsState)
  //console.log(dobRef.current.value)
  //console.log(sexRef.current.value)
  function dateWork(date) {
    console.log(date);

    //if (date.subtract (18, 'years'))
    setDateState(date);
    //console.log(date)
  }

  function isLegal(date, minimum_age = 18) {
    const [year, month, day] = date.split('-');
    const [y, m, d] = moment()
      .subtract(18, 'years')
      .format('yyyy-MM-DD')
      .split('-');

    var d1 = new Date(y, m, d);
    var d2 = new Date(year, month, day);
    return d2 <= d1 ? true : false;
  }

  function formatNumber(val) {
    if (!val) return val;

    const phone = val.replace(/[^\d]/g, '');
    if (phone.length < 4) return phone;

    if (phone.length < 7) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    }

    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  }

  function phoneWork(phone) {
    //console.log(phone.target.value)
    const formattedNumber = formatNumber(phone.target.value);
    setPhoneVal(formattedNumber);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    var bp = require('../Path.js');

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match.');
    }

    if (passwordRef.current.value.length <= 6) {
      return setError('Password should be more than six characters.');
    }

    // if (dobRef.current.value === 0)
    // {
    //   return setError('Please enter a valid Date of Birth.');
    // }

    if (optionsState === '0') {
      return setError('Please choose your sex.');
    }

    if (orientationState === '0') {
      return setError('Please choose your sexual orientation.');
    }

    if (phoneVal.trim().length < 14) {
      return setError('Please enter a valid phone number.');
    }

    if (dateState === '') return setError('Please enter a valid date...');

    if (!isLegal(dateState))
      return setError('You must be 18 years or older to sign up');

    if (firstRef.current.value === '')
      return setError('Please input your first name');

    if (lastRef.current.value === '')
      return setError('Please input your last name');

    var orient = {
      1: 'Heterosexual',
      2: 'Homosexual',
      3: 'Bisexual',
    };
    try {
      setError('');
      setLoading(true);
      var newUser_cred = await signup(
        emailRef.current.value.trim(),
        passwordRef.current.value
      );
      var newUser = newUser_cred.user;
      var obj = {
        firstName: firstRef.current.value.trim(),
        lastName: lastRef.current.value.trim(),
        email: newUser.email,
        sex: optionsState === '1' ? 'Male' : 'Female',
        sexOrientation: orient[orientationState],
        birth: dateState,
        phone: phoneVal,
        exitMessage: responseRef.current.value.trim(),
        userID: newUser.uid,
        photo: newUser.photoURL === null ? '' : newUser.photoURL,
        displayName: newUser.displayName === null ? '' : newUser.displayName,
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
        localStorage.removeItem('user_data');
      } catch (err) {
        setError('Secondary logout error : ' + err);
      }
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-3">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="firstName">
              <Form.Label>First name:</Form.Label>
              <Form.Control type="text" ref={firstRef} />
            </Form.Group>
            <Form.Group id="lastName">
              <Form.Label>Last name:</Form.Label>
              <Form.Control type="text" ref={lastRef} />
              <Form.Text className="text-muted">
                Your last name will stay private
              </Form.Text>
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
              <Form.Text className="text-muted">
                We will never share your email with anyone.
              </Form.Text>
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Form.Group id="dob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={dateState}
                onChange={(e) => dateWork(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                You must be 18+ years
              </Form.Text>
            </Form.Group>
            <Form.Row id="sex">
              <Form.Label>Sex</Form.Label>
              <Form.Control
                as="select"
                value={optionsState}
                onChange={(e) => setOptionsState(e.target.value)}
                required>
                <option value="0">Choose your sex...</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </Form.Control>
            </Form.Row>
            <Form.Row id="sexualOrientation">
              <Form.Label>Sexual Orientation</Form.Label>
              <Form.Control
                as="select"
                value={orientationState}
                onChange={(e) => setOrientationState(e.target.value)}
                required>
                <option value="0">Choose your sexual orientation...</option>
                <option value="1">Heterosexual</option>
                <option value="2">Homosexual</option>
                <option value="3">Bisexual</option>
              </Form.Control>
            </Form.Row>
            <Form.Group id="customResponse">
              <Form.Label>Custom end of chat response:</Form.Label>
              <Form.Control type="text" ref={responseRef} />
              <Form.Text className="text-muted">
                Users will see this response at the end of a chat. This can be
                changed later...
              </Form.Text>
            </Form.Group>
            <Form.Group id="phoneGroup">
              <Form.Label>Phone number:</Form.Label>
              <Form.Control
                type="tel"
                value={phoneVal}
                onChange={(e) => phoneWork(e)}
                required
              />
            </Form.Group>
            <Button disabled={loading} className="w-100 mt-2" type="submit">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </>
  );
}
