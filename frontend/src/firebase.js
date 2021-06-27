import firebase from 'firebase/app';
import 'firebase/auth';
require('dotenv').config();

const app = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FB_APIKEY,
  authDomain: process.env.REACT_APP_FB_authDomain,
  projectId: process.env.REACT_APP_FB_projectId,
  storageBucket: process.env.REACT_APP_FB_storageBucket,
  messagingSenderId: process.env.REACT_APP_FB_messagingSenderId,
  appId: process.env.REACT_APP_FB_appId,
  measurementId: process.env.REACT_APP_FB_measurementId,
});
console.log(process.env);
export const auth = app.auth();
export default app;
