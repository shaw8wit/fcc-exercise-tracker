const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()


const Exercise = require("./trackerHelper.js").ExerciseModel;
const createUser = require("./trackerHelper.js").createUser;
const createExercise = require("./trackerHelper.js").createExercise;
const findUsers = require("./trackerHelper.js").findUsers;
const findExercises = require("./trackerHelper.js").findExercises;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .post(function(req, res) {
    createUser(req.body.username, function(err, newUser) {
      if (err) return console.log(err);
      res.json(newUser);
    });
  })
  .get(function(req, res) {
    findUsers(function(err, allUsers) {
      if (err) return console.log(err);
      res.json(allUsers);
    });
  });


app.post('/api/users/:_id/exercises', function(req, res) {
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const exercise = new Exercise({
    description: req.body.description,
    duration: req.body.duration,
    dateObj: date,
    date: date.toDateString()
  });
  createExercise(req.params._id, exercise, function(err, savedData) {
    if (err) return console.log(err);
    res.json(savedData);
  })
});

app.get('/api/users/:_id/logs', function(req, res) {
  const userId = req.params._id;
  const fromDate = req.query.from ? new Date(req.query.from) : undefined;
  const toDate = req.query.to ? new Date(req.query.to) : undefined;
  const limit = req.query.limit;
  findExercises(userId, fromDate, toDate, limit, function(err, data) {
    if (err) return console.log(err);
    res.json(data);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})