# Clash of Minds - Backend API

Backend API for the Clash of Minds Trivia Game built with Node.js, Express, and MySQL.

## Features

-  JWT Authentication
-  User Management
-  Category Management
-  Question Management
-  Game Session Tracking
-  Dashboard Statistics
-  Admin Privileges

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env .env.local
# Edit .env.local with your database credentials
```

3. Initialize the database:
```bash
npm run init-db
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (auth required)
- `PUT /api/auth/profile` - Update profile (auth required)
- `PUT /api/auth/change-password` - Change password (auth required)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/by-section` - Get categories grouped by section
- `GET /api/categories/random` - Get random categories for game
- `GET /api/categories/stats` - Get category statistics (admin)
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `PATCH /api/categories/:id/toggle` - Toggle category status (admin)

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/stats` - Get question statistics (admin)
- `GET /api/questions/category/:categoryId` - Get questions by category
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create question (admin)
- `POST /api/questions/bulk` - Create multiple questions (admin)
- `POST /api/questions/random` - Get random questions for game
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)
- `PATCH /api/questions/:id/toggle` - Toggle question status (admin)

### Game Sessions
- `GET /api/games` - Get all game sessions (admin)
- `GET /api/games/my-games` - Get user's game sessions
- `GET /api/games/leaderboard` - Get game leaderboard
- `GET /api/games/dashboard/stats` - Get dashboard stats (admin)
- `GET /api/games/:id` - Get game session by ID
- `POST /api/games` - Create game session
- `PUT /api/games/:id/scores` - Update game scores
- `POST /api/games/:id/record-question` - Record a question
- `POST /api/games/:id/end` - End game session
- `POST /api/games/:id/abandon` - Abandon game session
- `DELETE /api/games/:id` - Delete game session (admin)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_NAME | Database name | clash_of_minds |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | |
| JWT_SECRET | JWT secret key | |
| JWT_EXPIRES_IN | JWT expiration | 7d |

## Database Schema

### Tables
- `users` - User accounts
- `categories` - Question categories
- `questions` - Trivia questions
- `game_sessions` - Game session records
- `game_questions` - Questions asked in games
- `powerups` - Available powerups
- `user_powerups` - User powerup inventory

## License

MIT
