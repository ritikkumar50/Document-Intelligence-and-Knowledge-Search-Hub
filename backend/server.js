const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadMiddleware = require('./middleware/uploadMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Document Intelligence Hub API is running' });
});

// Connect to MongoDB first
const mongo = mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('MongoDB Connected');
    
    // Only register routes after DB is connected
    const authRoutes = require('./routes/authRoutes');
    const documentRoutes = require('./routes/documentRoutes');
    const chatRoutes = require('./routes/chatRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/chat', chatRoutes);
    
    // Start server only if not running in a serverless environment
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Check your internet connection and MongoDB credentials');
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = app;
