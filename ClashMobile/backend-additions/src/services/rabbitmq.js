/**
 * RabbitMQ Service
 * Publishes game events to message queues for:
 * - Real-time score updates
 * - Question answered notifications
 * - Turn changes
 * - Powerup activations
 * - Game ended events
 *
 * Also provides STOMP WebSocket bridge for mobile clients.
 */

const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE_NAME = 'clash_of_minds';
const EXCHANGE_TYPE = 'topic'; // topic exchange for routing by game.{id}.{eventType}

let connection = null;
let channel = null;
let isConnected = false;

// ─── Queues ───────────────────────────────────────────────────────────
const QUEUES = {
  GAME_EVENTS:   'game.events',
  SCORE_UPDATES: 'game.scores',
  NOTIFICATIONS: 'game.notifications',
  ANALYTICS:     'game.analytics',
};

// ─── Connect ─────────────────────────────────────────────────────────
async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Declare topic exchange
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

    // Declare queues and bind to exchange
    for (const [name, queue] of Object.entries(QUEUES)) {
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, EXCHANGE_NAME, `game.#`);
    }

    connection.on('error', (err) => {
      console.error('[RabbitMQ] Connection error:', err.message);
      isConnected = false;
      scheduleReconnect();
    });

    connection.on('close', () => {
      console.warn('[RabbitMQ] Connection closed');
      isConnected = false;
      scheduleReconnect();
    });

    isConnected = true;
    console.log('[RabbitMQ] Connected to', RABBITMQ_URL);
  } catch (err) {
    console.error('[RabbitMQ] Connection failed:', err.message);
    console.warn('[RabbitMQ] Game events disabled — running without RabbitMQ');
    scheduleReconnect();
  }
}

let reconnectTimer = null;
function scheduleReconnect(delayMs = 5000) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connect();
  }, delayMs);
}

// ─── Publish event ────────────────────────────────────────────────────
async function publishEvent(eventType, gameId, payload) {
  if (!channel || !isConnected) return false;

  const routingKey = `game.${gameId}.${eventType}`;
  const message = JSON.stringify({
    type: eventType,
    gameId,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  try {
    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(message),
      { persistent: true, contentType: 'application/json' }
    );
    return true;
  } catch (err) {
    console.error('[RabbitMQ] Publish error:', err.message);
    return false;
  }
}

// ─── Convenience event publishers ─────────────────────────────────────
const events = {
  scoreUpdate: (gameId, team1Score, team2Score) =>
    publishEvent('SCORE_UPDATE', gameId, { team1Score, team2Score }),

  questionAnswered: (gameId, questionId, team, correct, pointsEarned) =>
    publishEvent('QUESTION_ANSWERED', gameId, { questionId, team, correct, pointsEarned }),

  turnChange: (gameId, currentTurn) =>
    publishEvent('TURN_CHANGE', gameId, { currentTurn }),

  powerupActivated: (gameId, powerupId, team) =>
    publishEvent('POWERUP_ACTIVATED', gameId, { powerupId, team }),

  gameEnded: (gameId, winner, team1Score, team2Score) =>
    publishEvent('GAME_ENDED', gameId, { winner, team1Score, team2Score }),

  gameCreated: (gameId, sessionName, team1Name, team2Name) =>
    publishEvent('GAME_CREATED', gameId, { sessionName, team1Name, team2Name }),
};

// ─── Consumer (for analytics/notifications workers) ───────────────────
async function consumeEvents(queue, handler) {
  if (!channel || !isConnected) return;
  await channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      await handler(event);
      channel.ack(msg);
    } catch (err) {
      console.error('[RabbitMQ] Consumer error:', err.message);
      channel.nack(msg, false, false); // discard
    }
  });
}

// ─── Graceful shutdown ────────────────────────────────────────────────
async function disconnect() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    isConnected = false;
  } catch {
    // ignore errors on shutdown
  }
}

module.exports = {
  connect,
  disconnect,
  publishEvent,
  events,
  consumeEvents,
  QUEUES,
  isConnected: () => isConnected,
};
