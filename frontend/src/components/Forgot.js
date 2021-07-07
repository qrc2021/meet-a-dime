import React, { useRef, useState } from 'react';
// import { Form, Button, Card, Alert } from 'react-bootstrap';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
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
      <Container style={{ justifyContent: 'center', maxWidth: 700 }}>
        <Card>
          <CardContent>
            <h2 className="text-center mb-4">Password Reset</h2>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <form onSubmit={handleSubmit}>
              <FormControl id="email">
                <InputLabel>Email</InputLabel>
                <Input type="email" inputRef={emailRef} required />
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                className="w-100 mt-2"
                type="submit">
                Reset Password
              </Button>
            </form>
            <div className="w-100 text-center mt-3">
              <Link
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  history.push('/login');
                }}>
                Login
              </Link>
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
