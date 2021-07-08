import React, { useRef, useState } from 'react';
// import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Navbar, Button } from 'react-bootstrap';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
// import Button from '@material-ui/core/Button';
import { Alert, AlertTitle } from '@material-ui/lab';
import Card from '@material-ui/core/Card';
import { useHistory } from 'react-router-dom';
import CardContent from '@material-ui/core/CardContent';
import { useAuth } from '../contexts/AuthContext';
// import { Link } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import FormControl from '@material-ui/core/FormControl';

export default function Forgot() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(emailRef.current.value);
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('If an account exists, an email will be sent soon.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No matching email.');
      } else {
        setError('Unexpected error');
      }
    }

    setLoading(false);
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
            alt="React Bootstrap logo"
          />
        </Navbar.Brand>
      </Navbar>

      <Container style={{ justifyContent: 'center', maxWidth: 700 }}>
        <Card
          varient="top"
          style={{
            minWidth: '250px',
            maxWidth: '420px',
            marginRight: 'auto',
            marginLeft: 'auto',
            borderRadius: '30px',
          }}>
          <CardContent>
            <h2 
              className="text-center mb-2"
              style={{
                fontWeight: 'bold',
                fontSize: '50px',
                color: '#7E7E7E',
              }}>
              Password Reset</h2>
            <h3
              className="text-center mb-3"
              style={{
                fontWeight: '400',
                fontSize: '20px',
                color: '#7E7E7E',
              }}>
              Please enter your email below:
            </h3>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <form onSubmit={handleSubmit}>
              <FormControl id="email"
                className="mb-2"
                style={{
                  width: '100%'
                }}>
                <InputLabel>Email</InputLabel>
                <Input type="email" inputRef={emailRef} required />
              </FormControl>
              <Button
                variant="contained"
                // color="primary"
                disabled={loading}
                className="btn-primary w-100 mt-2"
                type="submit"
                style={{
                  fontSize: '20px',
                }}>
                Reset Password
              </Button>
            </form>
            <div className="w-100 text-center mt-3">
              <Button
                className="btn-secondary"
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  history.push('/login');
                }}
                style={{
                  fontSize: '19px',
                }}>
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
      <div className="w-100 text-center mt-2">
        Need an account?{' '}
        <Link
          href=""
          onClick={(e) => {
            e.preventDefault();
            history.push('/signup');
          }}>
          Sign Up
        </Link>
      </div>
    </>
  );
}
