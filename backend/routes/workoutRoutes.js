const express = require('express');
const Workout = require('../models/Workout');
const router = express.Router();

// Middleware to verify token
const verifyToken = require('../middleware/auth');

// GET workouts for the logged-in user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const workouts = await Workout.find({ username: req.user.username });
    res.status(200).json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
