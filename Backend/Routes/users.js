const router = require('express').Router();
let User = require('../models/user.model'); //mongoose model that we created

//first route than handles HTTP-get requests
//ie we are in port 5000 (server.js) and if we do /user with another /, then the JSON below activates
router.route('/').get((req, res) => {
  User.find() //Mongoose method that gets a list of all users in MongoDB Atlas database
    .then(users => res.json(users)) //return the users in JSON format from the database
    .catch(err => res.status(400).json('Error: ' + err)); //if there's an error
});

//handles HTTP-post requests 
router.route('/add').post((req, res) => {
  const username = req.body.username;

  const newUser = new User({username});

  //new user is saved to the database
  newUser.save() 
    .then(() => res.json('User added!')) //return the message in JSON
    .catch(err => res.status(400).json('Error: ' + err));
});

//exporting the router
module.exports = router;