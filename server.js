const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
var api = require("./api.js");

require("dotenv").config();

var admin = require("firebase-admin");

var serviceAccount = require("./fireauth");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// const url = process.env.MONGODB_URI
// // const MongoClient = require('mongodb').MongoClient;
// // const client = new MongoClient(url, { useUnifiedTopology: true });
// // client.connect();

// const mongoose = require('mongoose')
// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

// const db = mongoose.connection
// db.on('error', console.error.bind(console, 'connection error:'))
// db.once('open', () => {
//   console.log('connected to db with mongoose!!')
// })

const PORT = process.env.PORT || 5000;

const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  cors: {
    origin: ["http://localhost:3000", "https://meetadime.herokuapp.com/"],
  },
});

http.listen(process.env.PORT || 5000, function () {
  var host = http.address().address;
  var port = http.address().port;
  console.log("App listening to port: ", port);
});

io.on("connection", (socket) => {
  console.log(`Chatroom id: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("message", (string) => {
    console.log(string);
  });
});

app.set("port", process.env.PORT || 5000);

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

api.setApp(app, admin);

// app.listen(PORT, () => {
//   console.log("Server listening on port " + PORT);
// });

///////////////////////////////////////////////////// For Heroku deployment
// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("frontend/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}
