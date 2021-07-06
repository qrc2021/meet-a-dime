import React, { useState } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';


export default function Profile() {
  const [error, setError] = useState('');
  const firestore = firebase.firestore();
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  // Redirect users if they are not verified.
  if (!currentUser.emailVerified) {
    history.push('/verify');
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

  function redirectToHome() {
    history.push('/');
  }

  async function fetchUserData(){
    var snapshot = await firestore.collection('users').get();
    snapshot.forEach((doc) => {
      if (doc.data().userID === currentUser.uid) {
        var userBirth = doc.data().birth;
        var userFirstName = doc.data().firstName;
        var userLastName = doc.data().lastName;
        var userPhone = doc.data().phone;
        var userExitMessage = doc.data().exitMessage;
        var userSex = doc.data().sex;
        var userOrientation = doc.data().sexOrientation;
        document.getElementById("birth").innerHTML = userBirth;
        document.getElementById("first").innerHTML = userFirstName;
        document.getElementById("last").innerHTML = userLastName;
        document.getElementById("phone").innerHTML = userPhone;
        document.getElementById("exit").innerHTML = userExitMessage;
        document.getElementById("sex").innerHTML = userSex;
        document.getElementById("orientation").innerHTML = userOrientation;
      }
    })
  }

  fetchUserData();

  return (
    <React.Fragment>
      <h2 className="text-center mb-4">Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Container>
        <strong>First Name:</strong> <span id = "first"></span>
        <br></br>
        <strong>Last Name:</strong> <span id = "last"></span>
        <br></br>
        <strong>Birthday:</strong> <span id = "birth"></span>
        <br></br>
        <strong>Email:</strong> {currentUser.email}
        <br></br>
        <strong>Phone Number:</strong> <span id = "phone"></span>
        <br></br>
        <strong>Exit Message:</strong> <span id = "exit"></span>
        <br></br>
        <strong>Sex:</strong> <span id = "sex"></span>
        <br></br>
        <strong>Sexual Orientation:</strong> <span id = "orientation"></span>
        <br></br>
        <strong>User ID:</strong> {currentUser.uid}
      </Container>
      <Button onClick={redirectToHome}>Home</Button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </React.Fragment>
  );
}
