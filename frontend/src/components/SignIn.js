import Avatar from '@material-ui/core/Avatar';
import { Button } from 'react-bootstrap';
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Alert, AlertTitle } from '@material-ui/lab';
import firebase from 'firebase/app';
import 'firebase/auth';
import { ThemeProvider } from '@material-ui/styles';
import 'firebase/firestore';
import { createTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Meet a Dime
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme_colors = createTheme({
  palette: {
    primary: {
      main: '#d55596',
    },
    secondary: {
      main: '#af9cc6',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  mainGrid: {
    // border: '1px solid black',
  },
  link: {
    '&:hover': { color: '#874ecc' },
  },
  image: {
    backgroundImage: 'url("DimeAssets/homelogo.png")',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#DCEAFF',

    [theme.breakpoints.down('sm')]: {
      backgroundSize: '80%',
    },
    [theme.breakpoints.up('md')]: {
      backgroundSize: '85%',
    },
    [theme.breakpoints.up('lg')]: {
      backgroundSize: '600px',
    },
    [theme.breakpoints.up('xl')]: {
      backgroundSize: '700px',
    },
    backgroundPosition: 'center',
  },
  paper: {
    // border: '1px solid blue',
    // margin: theme.spacing(8, 4),
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transform: 'translateY(-50%)',
    position: 'relative',
    top: '50vh',
    padding: '20px',
    maxWidth: '600px',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const history = useHistory();
  const [error, setError] = useState('');
  const [isChecked, setChecked] = useState(false);
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
      if (!isChecked) {
        await firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      }

      await login(emailRef.current.value, passwordRef.current.value);
      history.push('/verify');
      console.log('submit');
      // window.location.reload();
    } catch (error) {
      setError('Failed to login: ' + error.message);
      console.log(error.message);
    }
    if (window.location.pathname === '/signin') setLoading(false);
  }
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme_colors}>
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={false} md={7} className={classes.image} />
        <Grid
          className={classes.mainGrid}
          item
          xs={12}
          sm={12}
          md={5}
          component={Paper}
          elevation={8}
          square>
          <div className={classes.paper}>
            <img
              style={{
                width: '90%',
                maxWidth: '500px',
              }}
              src="DimeAssets/headerlogo.png"
            />
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit} className={classes.form} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                color="secondary"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                inputRef={emailRef}
              />
              <TextField
                margin="normal"
                required
                color="secondary"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                inputRef={passwordRef}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={isChecked}
                    onClick={() => {
                      setChecked(!isChecked);
                    }}
                    value="remember"
                    color="secondary"
                  />
                }
                label="Remember me"
              />
              <Button
                style={{ maxWidth: '600px', display: 'block', margin: 'auto' }}
                className="btn-primary w-100 mt-2 mb-1"
                type="submit">
                Log In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                    href=""
                    underline="none"
                    color="secondary"
                    className={classes.link}
                    onClick={(e) => {
                      e.preventDefault();
                      history.push('/forgot');
                    }}>
                    Forgot Password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    color="secondary"
                    className={classes.link}
                    href=""
                    underline="none"
                    onClick={(e) => {
                      e.preventDefault();
                      history.push('/signup');
                    }}>
                    No account? Register here.
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </form>
          </div>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
