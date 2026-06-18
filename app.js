const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const promClient = require('prom-client');


//TO collect and monitor data
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const app = express();

app.use(express.json());

//Monitoring Metrics
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});


//To Track requests
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
    end({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok'})
});

app.get('/health/ready', (req, res) => {

  if (mongoose.connection.readyState === 1) {
      return res.status(200).json({
      status: 'ready',
      mongodb: 'connected'
    });
  }

  return res.status(503).json({
    status: 'not ready',
     mongodb: 'disconnected'
  });
});

module.exports = app;
