const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./services/rabbitmq');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const questionRoutes = require('./routes/questions');
const gameRoutes = require('./routes/games');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: true,
      redis: require('./config/redis').isConnected(),
      rabbitmq: require('./services/rabbitmq').isConnected(),
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Clash of Minds API',
    version: '1.0.0',
    endpoints: { auth: '/api/auth', users: '/api/users', categories: '/api/categories', questions: '/api/questions', games: '/api/games', health: '/health' }
  });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) { console.error('Failed to connect to database.'); process.exit(1); }
    app.listen(PORT, () => {
      console.log(`\n Server running on port ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/health\n`);
    });
    await connectRedis();
    await connectRabbitMQ();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
