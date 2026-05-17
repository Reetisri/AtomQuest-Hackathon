require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/goals', require('./routes/goal'));
app.use('/api/achievements', require('./routes/achievement'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/user'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AtomQuest API is running' });
});

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGODB_URI) {
        console.warn('MONGODB_URI is not defined in environment variables.');
        return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
