const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  username: { type: String, required: true },
  workout: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Workout', workoutSchema);
