require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    userId: String,
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    dateObj: Date,
    date: String
  }
);

const userSchema = new Schema(
  {
    username: { type: String, required: true },
  }
);

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);


const createUser = (userName, done) => {
  var user = new User({ 'username': userName });
  user.save(function(err, dbUser) {
    if (err) return console.log(err);
    done(null, { _id: dbUser._id, username: dbUser.username });
  });
};

const findUsers = (done) => {
  User.find({}, function(err, all) {
    if (err) return console.log(err);
    done(null, all);
  });
};

const createExercise = (userId, exercise, done) => {
  User.findById(userId, function(err, dbUser) {
    if (err) return console.log(err);
    exercise.userId = userId;
    exercise.save(function(err, dbExercise) {
      if (err) return console.log(err);
      done(null, {
        _id: dbUser._id,
        username: dbUser.username,
        description: dbExercise.description,
        duration: dbExercise.duration,
        date: dbExercise.date
      });
    });
  });
};

const findExercises = (userId, fromDate, toDate, limit, done) => {
  let searchObj = { userId: userId };
  if (fromDate || toDate) searchObj['dateObj'] = {};
  if (fromDate) searchObj['dateObj']['$gte'] = fromDate;
  if (toDate) searchObj['dateObj']['$lt'] = toDate;
  const query = Exercise.find(searchObj);
  if (limit) query.limit(parseInt(limit));
  query.select({ _id: 0, userId: 0, __v: 0, dateObj: 0 });
  query.exec(function(err, matchedExercises) {
    if (err) return console.log(err);
    User.findById(userId, function(err, user) {
      if (err) return console.log(err);
      done(null, {
        _id: user._id,
        username: user.username,
        count: matchedExercises.length,
        log: matchedExercises
      });
    });
  });
};


exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.createUser = createUser;
exports.findUsers = findUsers;
exports.createExercise = createExercise;
exports.findExercises = findExercises;