const Workout = require('../models/Workout'); // Assuming you have a Workout model

// POST endpoint to add a new workout
exports.addWorkout = async (req, res) => {
  try {
    const { username, workoutType, duration } = req.body;
    const newWorkout = new Workout({
      username,
      workoutType,
      duration,
    });

    await newWorkout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding workout' });
  }
};
