import React, { useState, useEffect } from 'react';
import { Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

export default function Profile() {
  // Prevent some prompt issues.

  const [error, setError] = useState('');
  const [photoStatus, setPhotoStatus] = useState('');
  const [myPhoto, setMyPhoto] = useState('');
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

  function processPhoto() {
    const selectedFile = document.getElementById('photoUploadGroup').files[0];
    if (selectedFile === undefined) return setPhotoStatus('no file selected');

    // Regex that gets the file extension
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(selectedFile.name)[1];
    setPhotoStatus('Uploading...');
    var storageRef = firebase.storage().ref();
    var profileRef = storageRef.child(currentUser.uid + '.' + ext);
    profileRef.put(selectedFile).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        firestore
          .collection('users')
          .doc(currentUser.uid)
          .update({ photo: url })
          .then(() => {
            console.log('photo set to user in database!');
            setPhotoStatus('Photo uploaded!');
            setMyPhoto(url);
          })
          .catch((error) => {
            console.log(error);
            // setError('something went wrong');
            setPhotoStatus('something went wrong.');
          });
      });
    });
  }

  async function fetchUserData() {
    console.log('ran');
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
        var photo = doc.data().photo;
        document.getElementById('birth').innerHTML = userBirth;
        document.getElementById('first').innerHTML = userFirstName;
        document.getElementById('last').innerHTML = userLastName;
        document.getElementById('phone').innerHTML = userPhone;
        document.getElementById('exit').innerHTML = userExitMessage;
        document.getElementById('sex').innerHTML = userSex;
        document.getElementById('orientation').innerHTML = userOrientation;
        setMyPhoto(photo);

        // Set some items into local storage for easy reference later
        //   its only 5 items right now just so it matches the other
        //   references on the Home.js page, but we can add all for sure

        // Ideally this should also get set when a user changes it
        // on this page as well.
        localStorage.setItem(
          'user_data',
          JSON.stringify({
            birth: userBirth,
            exitMessage: userExitMessage,
            firstName: userFirstName,
            sex: userSex,
            sexOrientation: userOrientation,
            photo: photo,
          })
        );
      }
    });
  }

  // useEffect ensures the function runs once at page load,
  // and not each time a state changes
  // (for example, just the fetchUserData(); by itself would
  // rerun each time the photo was set, or any of our other
  // states. now it will just run once, or whenever we call
  // it again to update.
  //
  // so to update: set the stuff in database, then call fetchUserData()
  // after that is complete, like in the .then() after the promise.
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <React.Fragment>
      <h2 className="text-center mb-4">Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Container>
        <strong>First Name:</strong> <span id="first"></span>
        <br></br>
        <strong>Last Name:</strong> <span id="last"></span>
        <br></br>
        <strong>Birthday:</strong> <span id="birth"></span>
        <br></br>
        <strong>Email:</strong> {currentUser.email}
        <br></br>
        <strong>Phone Number:</strong> <span id="phone"></span>
        <br></br>
        <strong>Exit Message:</strong> <span id="exit"></span>
        <br></br>
        <strong>Sex:</strong> <span id="sex"></span>
        <br></br>
        <strong>Sexual Orientation:</strong> <span id="orientation"></span>
        <br></br>
        <strong>User ID:</strong> {currentUser.uid}
        <br></br>
        <strong>Photo:</strong>
        <br></br>
        {myPhoto !== '' ? (
          <img height="100px" width="100px" src={myPhoto} id="photo"></img>
        ) : (
          <></>
        )}
        <br></br>
        {/* Temporary file input field, just needs style and
        probably some custom input fields */}
        <div className="my-3">
          <input type="file" id="photoUploadGroup" />

          <button
            className="btn btn-primary"
            id="photoUploadButton"
            onClick={processPhoto}>
            Upload Photo
          </button>
        </div>
        {photoStatus}
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
