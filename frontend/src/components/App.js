import React from 'react';
import SignUp from './SignUp';
import 'bootstrap/dist/css/bootstrap.min.css';
// import { Container } from 'react-bootstrap';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Login from './Login';
import Forgot from './Forgot';
import Profile from './Profile';
import Verify from './Verify';
import Chat from './Chat';
import NoContent from './NoContent';
import After from './After';
import UpdateProfile from './UpdateProfile';
import Prompts from './Prompts';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute path="/update-profile" component={UpdateProfile} />
          <PrivateRoute exact path="/chat" component={Chat} />
          <PrivateRoute exact path="/after" component={After} />
          <PrivateRoute exact path="/prompts" component={Prompts} />
          <Route exact path="/verify" component={Verify} />
          <Route path="/signup" component={SignUp} />
          <Route path="/login" component={Login} />
          <Route path="/forgot" component={Forgot} />
          <Route component={NoContent} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;

// <Container
//             className="d-flex align-items-center justify-content-center"
//             style={{ minHeight: '100vh' }}>
//             <div className="w-100" style={{ maxWidth: '400px' }}>
//               <Route path="/signup" component={SignUp} />
//               <Route path="/login" component={Login} />
//               <Route path="/forgot" component={Forgot} />
//             </div>
//           </Container>
