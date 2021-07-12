import React, { useRef, useState } from 'react';
import { Form, Button, Navbar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const DEFAULT_COIN_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/meet-a-dime.appspot.com/o/default_1.png?alt=media&token=23ab5b95-0214-42e3-9c54-d7811362aafc';

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
  // const answer1Ref = useRef();
  // const answer2Ref = useRef();
  // const answer3Ref = useRef();
  // const answer4Ref = useRef();
  // const answer5Ref = useRef();
  // const answer6Ref = useRef();
  // const answer7Ref = useRef();
  // const answer8Ref = useRef();
  // const answer9Ref = useRef();
  // const answer10Ref = useRef();
  // const answer11Ref = useRef();
  // const answer12Ref = useRef();

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

  //counts the number of characters a user is typing for personal questions
  //they get a live count that turns red if they are over the character limit
  //NOTE - Add at a later date
  // var maxAnswerLength = 280;

  async function handleSubmit(e) {
    e.preventDefault();
    var bp = require('../Path.js');

    //scroll to top of page toi see error messages
    function scrollToTop() {
      window.scrollTo(0, 0);
    }

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      scrollToTop();
      return setError('Passwords do not match.');
    }

    if (passwordRef.current.value.length <= 6) {
      scrollToTop();
      return setError('Password should be more than six characters.');
    }

    // if (dobRef.current.value === 0)
    // {
    //   return setError('Please enter a valid Date of Birth.');
    // }

    if (optionsState === '0') {
      scrollToTop();
      return setError('Please choose your sex.');
    }

    if (orientationState === '0') {
      scrollToTop();
      return setError('Please choose your sexual orientation.');
    }

    if (phoneVal.trim().length < 14) {
      scrollToTop();
      return setError('Please enter a valid phone number.');
    }

    if (dateState === '') {
      scrollToTop();
      return setError('Please enter a valid date.');
    }

    if (!isLegal(dateState)) {
      scrollToTop();
      return setError('You must be 18 years or older to sign up.');
    }

    if (firstRef.current.value === '') {
      scrollToTop();
      return setError('Please input your first name.');
    }

    if (lastRef.current.value === '') {
      scrollToTop();
      return setError('Please input your last name.');
    }

    //if (answer1Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 1: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer2Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 2: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer3Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 3: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer4Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 4: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer5Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 5: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer6Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 6: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer7Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 7: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer8Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 8: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer9Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 9: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer10Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 10: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer11Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 11: Please keep your answer within 280 characters.'
    //  );
    //}

    //if (answer12Ref.current.value.length > maxAnswerLength) {
    //  scrollToTop();
    //  return setError(
    //    'Question 12: Please keep your answer within 280 characters.'
    //  );
    //}

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
        photo: DEFAULT_COIN_IMAGE,
        displayName: newUser.displayName === null ? '' : newUser.displayName,
        initializedProfile: 0,
        FailMatch: [],
        SuccessMatch: [],
        //question1Answer: answer1Ref.current.value.trim(),
        //question2Answer: answer2Ref.current.value.trim(),
        //question3Answer: answer3Ref.current.value.trim(),
        //question4Answer: answer4Ref.current.value.trim(),
        //question5Answer: answer5Ref.current.value.trim(),
        //question6Answer: answer6Ref.current.value.trim(),
        //question7Answer: answer7Ref.current.value.trim(),
        //question8Answer: answer8Ref.current.value.trim(),
        //question9Answer: answer9Ref.current.value.trim(),
        //question10Answer: answer10Ref.current.value.trim(),
        //question11Answer: answer11Ref.current.value.trim(),
        //question12Answer: answer12Ref.current.value.trim(),
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
      <Navbar bg="transparent">
        <Navbar.Brand href="login">
          <img
            src="/DimeAssets/headerlogo.png"
            width="300px"
            height="100%"
            className="d-inline-block align-top"
            alt="Dimelogo"
          />
        </Navbar.Brand>
      </Navbar>

      <Grid container spacing={1}>
        <Grid item xs={5}>
          <img
            className="img-fluid"
            alt="signup"
            src="DimeAssets/coinsignup.png"
          />
        </Grid>
        <Grid item xs={5}>
          {/* <Card.Body> */}
          <h2 className="text-center mb-3" style={{ color: '#929292' }}>
            Create an Account
          </h2>
          {error && <Alert severity="error">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="firstName">
              <Form.Control
                type="text"
                ref={firstRef}
                placeholder="First Name"
              />
            </Form.Group>
            <Form.Group id="lastName">
              <Form.Control type="text" ref={lastRef} placeholder="Last Name" />
              <Form.Text className="text-muted">
                Your last name will stay private
              </Form.Text>
            </Form.Group>
            <Form.Group id="email">
              <Form.Control
                type="email"
                ref={emailRef}
                required
                placeholder="Email"
              />
              <Form.Text className="text-muted">
                We will never share your email with anyone.
              </Form.Text>
            </Form.Group>
            <Form.Group id="password">
              <Form.Control
                type="password"
                ref={passwordRef}
                required
                placeholder="Password"
              />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                required
                placeholder="Password Confirmation"
              />
            </Form.Group>
            <Form.Group id="dob">
              <Form.Label className="text-muted">Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={dateState}
                onChange={(e) => dateWork(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                You must be 18+ years.
              </Form.Text>
            </Form.Group>
            <Form.Row id="sex">
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
              <Form.Control
                type="text"
                ref={responseRef}
                placeholder="End of Chat Response"
              />
              <Form.Text className="text-muted">
                Users will see this response at the end of a chat. This can be
                changed later...
              </Form.Text>
            </Form.Group>
            <Form.Group id="phoneGroup">
              <Form.Control
                type="tel"
                value={phoneVal}
                onChange={(e) => phoneWork(e)}
                required
                placeholder="Phone Number"
              />
            </Form.Group>

            <Button disabled={loading} className="w-100 mt-2" type="submit">
              Register
            </Button>
          </Form>
          {/* </Card.Body> */}

          <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

//I'm gonna implement the questions over on the profile page in a different way: WILL ADDRESS 7/13

/*<Form.Group id="question1Answer">
    <Form.Label>
        Question 1: What do you like to do for fun or to relax?
            </Form.Label>
    <Form.Control type="text" ref={answer1Ref} required />
</Form.Group>
    <Form.Group id="question2Answer">
        <Form.Label>Question 2: What do you do for a living?</Form.Label>
        <Form.Control type="text" ref={answer2Ref} required />
    </Form.Group>
    <Form.Group id="question3Answer">
        <Form.Label>
            Question 3: Would you say you are a romantic?
            </Form.Label>
        <Form.Control type="text" ref={answer3Ref} required />
    </Form.Group>
    <Form.Group id="question4Answer">
        <Form.Label>
            Question 4: Are you an optimist or a pessimist?
            </Form.Label>
        <Form.Control type="text" ref={answer4Ref} required />
    </Form.Group>
    <Form.Group id="question5Answer">
        <Form.Label>
            Question 5: What are you most passionate about?
            </Form.Label>
        <Form.Control type="text" ref={answer5Ref} required />
    </Form.Group>
    <Form.Group id="question6Answer">
        <Form.Label>
            Question 6: Do you like horoscopes? If so, what's your sign?
            </Form.Label>
        <Form.Control type="text" ref={answer6Ref} required />
    </Form.Group>
    <Form.Group id="question7Answer">
        <Form.Label>
            Question 7: What does an ideal date look like in your eyes?
            </Form.Label>
        <Form.Control type="text" ref={answer7Ref} required />
    </Form.Group>
    <Form.Group id="question8Answer">
        <Form.Label>
            Question 8: What does your ideal future look like?
            </Form.Label>
        <Form.Control type="text" ref={answer8Ref} required />
    </Form.Group>
    <Form.Group id="question9Answer">
        <Form.Label>
            Question 9: What is your favorite type of music?
            </Form.Label>
        <Form.Control type="text" ref={answer9Ref} required />
    </Form.Group>
    <Form.Group id="question10Answer">
        <Form.Label>
            Question 10: Do you have any pets? If you do, tell me about them!
            </Form.Label>
        <Form.Control type="text" ref={answer10Ref} required />
    </Form.Group>
    <Form.Group id="question11Answer">
        <Form.Label>
            Question 11: Do you have any sibilings? If so, how many?
            </Form.Label>
        <Form.Control type="text" ref={answer11Ref} required />
    </Form.Group>
    <Form.Group id="question12Answer">
        <Form.Label>
            Question 12: What is your favorite game to play?
            </Form.Label>
        <Form.Control type="text" ref={answer12Ref} required />
    </Form.Group>*/
