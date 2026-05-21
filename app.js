const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String
}));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashed });
  res.json({ message: 'Signup successful' });
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ message: 'Login successful', token });
});

module.exports = app;
