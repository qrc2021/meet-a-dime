import React, { useState, useEffect } from 'react';
import { Navbar } from 'react-bootstrap';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useAuth } from '../contexts/AuthContext';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import AttachmentIcon from '@material-ui/icons/Attachment';
import Grid from '@material-ui/core/Grid';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import IconButton from '@material-ui/core/IconButton';

import { Alert, AlertTitle } from '@material-ui/lab';

import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
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

export default function Profile() {
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

  // Prevent some prompt issues.

  const [error, setError] = useState('');
  const [photoStatus, setPhotoStatus] = useState('');
  const [myPhoto, setMyPhoto] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState('');
  const firestore = firebase.firestore();
  const [switching, setSwitching] = useState(true);
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
    setSwitching(true);
    history.push('/');
  }

  // function redirectToUpdateProfile() {
  //   history.push('/update-profile');
  // }

  function processPhoto() {
    const selectedFile = document.getElementById('photoUploadGroup').files[0];
    if (selectedFile === undefined) return setPhotoStatus('no file selected');

    // Regex that gets the file extension
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(selectedFile.name)[1];
    setPhotoStatus('Uploading...');
    setIsUploading(true);
    setProgress(0);
    var storageRef = firebase.storage().ref();
    var profileRef = storageRef.child(currentUser.uid + '.' + ext);
    var uploadTask = profileRef.put(selectedFile);
    var observer = uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress_ = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress_);
        console.log('Upload is ' + progress_ + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
          default:
            console.log('error? in switch');
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        setError(error);
        setIsUploading(false);
      },
      () => {
        observer();
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          firestore
            .collection('users')
            .doc(currentUser.uid)
            .update({ photo: downloadURL })
            .then(() => {
              console.log('photo set to user in database!');
              setPhotoStatus('Done!');
              setMyPhoto(downloadURL);
              setSelectedFile('');
              setIsUploading('Done');
              setTimeout(() => {
                setPhotoStatus(false);
                setIsUploading(false);
              }, 3000);
            })
            .catch((error) => {
              console.log(error);
              // setError('something went wrong');
              setPhotoStatus('something went wrong.');
            });
        });
      }
    );
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
        var ageRangeMax = doc.data().ageRangeMax;
        var ageRangeMin = doc.data().ageRangeMin;
        document.getElementById('birth').innerHTML = userBirth;
        document.getElementById('first').innerHTML = userFirstName;
        document.getElementById('last').innerHTML = userLastName;
        document.getElementById('phone').innerHTML = userPhone;
        document.getElementById('exit').innerHTML = userExitMessage;
        document.getElementById('sex').innerHTML = userSex;
        document.getElementById('orientation').innerHTML = userOrientation;
        setMyPhoto(photo);
        setSwitching(false);

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
            ageRangeMin: ageRangeMin,
            ageRangeMax: ageRangeMax,
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
    document.body.style.backgroundColor = 'white';
    fetchUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                  src="/DimeAssets/headerlogo.png"
                  width="250px"
                  height="100%"
                  className="d-inline-block align-top"
                  alt="React Bootstrap logo"
                />
              </Navbar.Brand>
            </Navbar>
          </Typography>

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

      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}>
        <div className={classes.drawerHeader} />
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Container>
              <strong>Photo:</strong>
              <br></br>
              {myPhoto !== '' ? (
                <img
                  height="100px"
                  width="100px"
                  src={myPhoto}
                  id="photo"
                  alt="My Profile Pic"></img>
              ) : (
                <img
                  className="img-fluid"
                  src="DimeAssets/coinsignup.png"
                  height="100px"
                  width="100px"
                  alt="Default Pic"
                />
              )}
              <br></br>
              {/* Temporary file input field, just needs style and
        probably some custom input fields */}
              <div className="my-3">
                {/* <input type="file" id="photoUploadGroup" />

          <button
            className="btn btn-primary"
            id="photoUploadButton"
            onClick={processPhoto}>
            Upload Photo
          </button> */}
                <input
                  onChange={() => {
                    if (
                      document.getElementById('photoUploadGroup') &&
                      document.getElementById('photoUploadGroup').files[0]
                    )
                      setSelectedFile(
                        document.getElementById('photoUploadGroup').files[0]
                          .name
                      );
                  }}
                  accept="image/*"
                  id="photoUploadGroup"
                  hidden
                  type="file"
                />
                <label htmlFor="photoUploadGroup">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<AttachmentIcon />}>
                    Select
                  </Button>
                </label>
                <Box my={1}>{selectedFile}</Box>
                <Button
                  variant="contained"
                  color="default"
                  endIcon={<CloudUploadIcon />}
                  id="photoUploadButton"
                  onClick={processPhoto}
                  disabled={!selectedFile}>
                  Upload
                </Button>
              </div>
              {isUploading && (
                <LinearProgress variant="determinate" value={progress} />
              )}
              {photoStatus}
              <Link to="/update-profile" className="btn btn-primary">
                Update Profile
              </Link>
            </Container>
            {/* <Button variant="contained" color="primary">
          Home
        </Button>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Log Out
        </Button> */}
          </Grid>

          <Grid item xs={5}>
            <h2 className="text-center mb-4">Profile</h2>

            {error && (
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

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
              <strong>Sexual Orientation:</strong>{' '}
              <span id="orientation"></span>
              <br></br>
              <strong>User ID:</strong> {currentUser.uid}
              <br></br>
            </Container>
          </Grid>
        </Grid>
      </main>

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
