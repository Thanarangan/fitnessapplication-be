const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key"; // Use a strong secret key

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://Thanarangan:8760219686@cluster0.b8crhia.mongodb.net/FitnessTracker?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// Workout Schema
const workoutSchema = new mongoose.Schema({
  username: String,
  workoutType: String, // <-- This is where workoutType is stored
  duration: Number,
  createdAt: { type: Date, default: Date.now }
});
const Workout = mongoose.model('Workout', workoutSchema);

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (await User.findOne({ username })) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });

    await newUser.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid username or password" });

    const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", role: user.role, token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user = decoded;
    next();
  });
};

// Fetch all workouts (Admin only)
app.get('/api/workouts', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const workouts = await Workout.find();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch workouts for the logged-in user
app.get('/api/workouts/user', verifyToken, async (req, res) => {
  try {
    const workouts = await Workout.find({ username: req.user.username });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add workout (User only)
app.post('/api/workouts', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Access denied' });

    const { workoutType, duration } = req.body;

    if (!workoutType || !duration) {
      return res.status(400).json({ error: "Workout type and duration are required" });
    }

    const newWorkout = new Workout({ username: req.user.username, workoutType, duration });

    await newWorkout.save();
    res.status(201).json(newWorkout);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: Delete a workout
app.delete('/api/workouts/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
