const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
var api = require('./api.js')

require('dotenv').config()

const url = process.env.MONGODB_URI
// const MongoClient = require('mongodb').MongoClient;
// const client = new MongoClient(url, { useUnifiedTopology: true });
// client.connect();

const mongoose = require('mongoose')
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('connected to db with mongoose!!')
})

const PORT = process.env.PORT || 5000

const app = express()

app.set('port', process.env.PORT || 5000)

app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  )
  next()
})

api.setApp(app, db, mongoose)

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT)
})

///////////////////////////////////////////////////// For Heroku deployment
// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  })
}
