require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// CORS middleware - IMPORTANT for Docker networking
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit in production, keep retrying
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

// Health check endpoint - useful for Docker
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Listen on all interfaces (0.0.0.0) for Docker
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});