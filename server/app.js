require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();


const cors = require("cors");



app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  next();
});

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);

    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
const registerRoute = require('./Routes/register');
const loginRoute = require('./Routes/login');
const urlRoute = require('./Routes/url');

app.use('/api/auth', registerRoute);
app.use('/api/auth', loginRoute);
app.use('/', urlRoute);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server running',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Start Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});