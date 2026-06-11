# Backend Additions — Redis + RabbitMQ Integration

## How to integrate into your existing backend

### 1. Install dependencies

```bash
npm install redis amqplib
```

### 2. Add to `src/server.js`

```js
const { connectRedis }   = require('./config/redis');
const { connect: connectRabbitMQ } = require('./services/rabbitmq');

// After app initialization, before app.listen:
await connectRedis();
await connectRabbitMQ();
```

### 3. Add Redis caching to category/question routes

In `src/routes/categories.js`:
```js
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

router.get('/',          cacheMiddleware('categories', 600), controller.getAll);
router.get('/by-section',cacheMiddleware('categories:sections', 600), controller.getBySection);

// In POST/PUT/DELETE handlers, invalidate:
await invalidateCache('categories');
```

In `src/routes/questions.js`:
```js
router.get('/category/:id', cacheMiddleware('questions', 300), controller.getByCategory);
```

### 4. Publish RabbitMQ events from game controller

In `src/controllers/gameController.js`:
```js
const mq = require('../services/rabbitmq');

// After creating a game:
await mq.events.gameCreated(game.id, sessionName, team1Name, team2Name);

// After updating scores:
await mq.events.scoreUpdate(gameId, team1Score, team2Score);

// After ending game:
await mq.events.gameEnded(gameId, winner, team1Score, team2Score);
```

### 5. Environment Variables

Add to your Railway / `.env`:
```
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

---

## File overview

| File | Purpose |
|------|---------|
| `src/config/redis.js`        | Redis client + get/set/del helpers |
| `src/middleware/cache.js`    | Express caching middleware |
| `src/services/rabbitmq.js`   | RabbitMQ publisher + consumer |
