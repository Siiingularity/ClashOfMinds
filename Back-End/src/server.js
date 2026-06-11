const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const questionRoutes = require('./routes/questions');
const gameRoutes = require('./routes/games');
const sectionRoutes = require('./routes/sections');
const siteSettingsRoutes = require('./routes/site-settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Clash of Minds API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      questions: '/api/questions',
      games: '/api/games',
      health: '/health'
    }
  });
});

// Handle 404
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error(' Failed to connect to database. Please check your configuration.');
      console.log('Make sure MySQL is running and the database exists.');
      console.log('Run "npm run init-db" to initialize the database.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n Server running on port ${PORT}`);
      console.log(` API Documentation: http://localhost:${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
