const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/results', require('./routes/results'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/daily-challenge', require('./routes/dailyChallenge'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Public stats route
const { getPublicStats } = require('./controllers/adminController');
app.get('/api/stats', getPublicStats);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AptitudeHub API is running', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AptitudeHub Backend running on port ${PORT}`);
});

module.exports = app;
