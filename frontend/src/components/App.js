import React from 'react';
import SignUp from './SignUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Login from './Login';
import Forgot from './Forgot';
import Home2 from './Home2';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute exact path="/Home2" component={Home2} />
          <Route path="/signup" component={SignUp} />
          <Route path="/login" component={Login} />
          <Route path="/forgot" component={Forgot} />
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
