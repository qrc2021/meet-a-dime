import React, { useRef, useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Formik } from 'formik';
import * as yup from 'yup';
// import axios from 'axios';

import firebase from 'firebase/app';
import 'firebase/auth';

import 'firebase/firestore';
import 'firebase/storage';

// const DEFAULT_COIN_IMAGE =
//   'https://firebasestorage.googleapis.com/v0/b/meet-a-dime.appspot.com/o/default_1.png?alt=media&token=23ab5b95-0214-42e3-9c54-d7811362aafc';

export default function Prompts() {
  const [saving, setSaving] = useState(false);
  const firestore = firebase.firestore();
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [loadedInForm, setLoadedInForm] = useState(false);
  const [loading, setLoading] = useState('');

  const MAX_ANSWER_LENGTH = 280;
  const answer1Ref = useRef();
  const answer2Ref = useRef();
  const answer3Ref = useRef();
  const answer4Ref = useRef();
  const answer5Ref = useRef();
  const answer6Ref = useRef();
  const answer7Ref = useRef();
  const answer8Ref = useRef();
  const answer9Ref = useRef();
  const answer10Ref = useRef();
  const answer11Ref = useRef();
  const answer12Ref = useRef();
  const history = useHistory();

  function scrollToTop() {
    window.scrollTo(0, 0);
  }

  async function handleSubmitForm(values) {
    setLoading(true);
    setSaving(true);

    try {
      await firestore.collection('users').doc(currentUser.uid).update({
        question1Answer: values.answer1,
        question2Answer: values.answer2,
        question3Answer: values.answer3,
        question4Answer: values.answer4,
        question5Answer: values.answer5,
        question6Answer: values.answer6,
        question7Answer: values.answer7,
        question8Answer: values.answer8,
        question9Answer: values.answer9,
        question10Answer: values.answer10,
        question11Answer: values.answer11,
        question12Answer: values.answer12,
      });

      await firestore.collection('users').doc(currentUser.uid).update({
        initializedProfile: 1,
      });

      setLoading(false);
      setSaving(false);
      history.push('/profile');
    } catch (error) {
      console.log(error);
      setLoading(false);
      setSaving(false);
      setError(error);
    }
  }

  async function fetchUserData() {
    var doc = await firestore.collection('users').doc(currentUser.uid).get();
    if (doc && doc.exists) {
      if (doc.data().initializedProfile === 0) {
        answer1Ref.current = '';
        answer2Ref.current = '';
        answer3Ref.current = '';
        answer4Ref.current = '';
        answer5Ref.current = '';
        answer6Ref.current = '';
        answer7Ref.current = '';
        answer8Ref.current = '';
        answer9Ref.current = '';
        answer10Ref.current = '';
        answer11Ref.current = '';
        answer12Ref.current = '';
      } else {
        answer1Ref.current = doc.data().question1Answer;
        answer2Ref.current = doc.data().question2Answer;
        answer3Ref.current = doc.data().question3Answer;
        answer4Ref.current = doc.data().question4Answer;
        answer5Ref.current = doc.data().question5Answer;
        answer6Ref.current = doc.data().question6Answer;
        answer7Ref.current = doc.data().question7Answer;
        answer8Ref.current = doc.data().question8Answer;
        answer9Ref.current = doc.data().question9Answer;
        answer10Ref.current = doc.data().question10Answer;
        answer11Ref.current = doc.data().question11Answer;
        answer12Ref.current = doc.data().question12Answer;
      }
    }

    setLoadedInForm(true);
  }

  useEffect(() => {
    fetchUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // function redirectToProfile() {
  //   history.push('/profile');
  // }

  const schema = yup.object().shape({
    answer1: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer2: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer3: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer4: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer5: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer6: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer7: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer8: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer9: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer10: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer11: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
    answer12: yup
      .string()
      .max(
        MAX_ANSWER_LENGTH,
        'Response must be shorter than ' +
          MAX_ANSWER_LENGTH.toString() +
          ' characters.'
      )
      .required('Answer is required.')
      .trim(),
  });

  function scInView(id) {
    document.getElementById(`question${id}Answer`).scrollIntoView();
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-3">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          {loadedInForm && (
            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                handleSubmitForm(values);
              }}
              initialValues={{
                answer1: answer1Ref.current,
                answer2: answer2Ref.current,
                answer3: answer3Ref.current,
                answer4: answer4Ref.current,
                answer5: answer5Ref.current,
                answer6: answer6Ref.current,
                answer7: answer7Ref.current,
                answer8: answer8Ref.current,
                answer9: answer9Ref.current,
                answer10: answer10Ref.current,
                answer11: answer11Ref.current,
                answer12: answer12Ref.current,
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
                  <Form.Group id="question1Answer">
                    <Form.Label>
                      Question 1: What do you like to do for fun or to relax?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer1Ref}
                      value={values.answer1}
                      onChange={handleChange}
                      name="answer1"
                      isValid={touched.answer1 && !errors.answer1}
                      isInvalid={touched.answer1 && errors.answer1}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer1}
                      {errors.answer1 && scInView(1)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question2Answer">
                    <Form.Label>
                      Question 2: What do you do for a living?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer2Ref}
                      value={values.answer2}
                      onChange={handleChange}
                      name="answer2"
                      isValid={touched.answer2 && !errors.answer2}
                      isInvalid={touched.answer2 && errors.answer2}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer2}
                      {errors.answer2 && scInView(2)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question3Answer">
                    <Form.Label>
                      Question 3: Would you say you are a romantic?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer3Ref}
                      value={values.answer3}
                      onChange={handleChange}
                      name="answer3"
                      isValid={touched.answer3 && !errors.answer3}
                      isInvalid={touched.answer3 && errors.answer3}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer3}
                      {errors.answer3 && scInView(3)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question4Answer">
                    <Form.Label>
                      Question 4: Are you an optimist or a pessimist?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer4Ref}
                      value={values.answer4}
                      onChange={handleChange}
                      name="answer4"
                      isValid={touched.answer4 && !errors.answer4}
                      isInvalid={touched.answer4 && errors.answer4}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer4}
                      {errors.answer4 && scInView(4)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question5Answer">
                    <Form.Label>
                      Question 5: What are you most passionate about?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer5Ref}
                      value={values.answer5}
                      onChange={handleChange}
                      name="answer5"
                      isValid={touched.answer5 && !errors.answer5}
                      isInvalid={touched.answer5 && errors.answer5}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer5}
                      {errors.answer5 && scInView(5)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question6Answer">
                    <Form.Label>
                      Question 6: Do you like horoscopes? If so, what's your
                      sign?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer6Ref}
                      value={values.answer6}
                      onChange={handleChange}
                      name="answer6"
                      isValid={touched.answer6 && !errors.answer6}
                      isInvalid={touched.answer6 && errors.answer6}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer6}
                      {errors.answer6 && scInView(6)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question7Answer">
                    <Form.Label>
                      Question 7: What does an ideal date look like in your
                      eyes?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer7Ref}
                      value={values.answer7}
                      onChange={handleChange}
                      name="answer7"
                      isValid={touched.answer7 && !errors.answer7}
                      isInvalid={touched.answer7 && errors.answer7}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer7}
                      {errors.answer7 && scInView(7)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question8Answer">
                    <Form.Label>
                      Question 8: What does your ideal future look like?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer8Ref}
                      value={values.answer8}
                      onChange={handleChange}
                      name="answer8"
                      isValid={touched.answer8 && !errors.answer8}
                      isInvalid={touched.answer8 && errors.answer8}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer8}
                      {errors.answer8 && scInView(8)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question9Answer">
                    <Form.Label>
                      Question 9: What is your favorite type of music?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer9Ref}
                      value={values.answer9}
                      onChange={handleChange}
                      name="answer9"
                      isValid={touched.answer9 && !errors.answer9}
                      isInvalid={touched.answer9 && errors.answer9}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer9}
                      {errors.answer9 && scInView(9)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question10Answer">
                    <Form.Label>
                      Question 10: Do you have any pets? If you do, tell me
                      about them!
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer10Ref}
                      value={values.answer10}
                      onChange={handleChange}
                      name="answer10"
                      isValid={touched.answer10 && !errors.answer10}
                      isInvalid={touched.answer10 && errors.answer10}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer10}
                      {errors.answer10 && scInView(10)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question11Answer">
                    <Form.Label>
                      Question 11: Do you have any sibilings? If so, how many?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer11Ref}
                      value={values.answer11}
                      onChange={handleChange}
                      name="answer11"
                      isValid={touched.answer11 && !errors.answer11}
                      isInvalid={touched.answer11 && errors.answer11}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer11}
                      {errors.answer11 && scInView(11)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group id="question12Answer">
                    <Form.Label>
                      Question 12: What is your favorite game to play?
                    </Form.Label>
                    <Form.Control
                      type="text"
                      ref={answer12Ref}
                      value={values.answer12}
                      onChange={handleChange}
                      name="answer12"
                      isValid={touched.answer12 && !errors.answer12}
                      isInvalid={touched.answer12 && errors.answer12}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.answer12}
                      {errors.answer12 && scInView(12)}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Button
                    disabled={loading}
                    className="w-100 mt-2"
                    type="submit">
                    Save Changes
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/profile">Cancel</Link>
      </div>
      {saving && (
        <div
          style={{
            position: 'fixed',
            left: '0',
            bottom: '0',
            width: '100%',
          }}>
          <LinearProgress variant="indeterminate" />
        </div>
      )}
    </>
  );
}
