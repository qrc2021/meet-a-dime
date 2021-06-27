import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Only continue to render components if the user is authenticated.
// Redirect users to login if this is not the case.
export default function PrivateRoute({ component: Component, ...remaining }) {
  const { currentUser } = useAuth();

  return (
    <Route
      {...remaining}
      render={(props) => {
        return currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        );
      }}></Route>
  );
}
