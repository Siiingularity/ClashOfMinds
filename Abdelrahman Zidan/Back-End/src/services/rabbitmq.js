const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE = 'clash_of_minds';
let connection = null, channel = null, connected = false;
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    for (const q of ['game.events', 'game.scores', 'game.notifications']) { await channel.assertQueue(q, { durable: true }); await channel.bindQueue(q, EXCHANGE, 'game.#'); }
    connection.on('error', (err) => { console.error('[RabbitMQ] Error:', err.message); connected = false; });
    connection.on('close', () => { connected = false; setTimeout(connectRabbitMQ, 10000); });
    connected = true;
    console.log('[RabbitMQ] ✅ Connected');
  } catch (err) { console.error('[RabbitMQ] ❌ Failed:', err.message); setTimeout(connectRabbitMQ, 10000); }
}
function publish(key, payload) { if (!channel || !connected) return false; try { channel.publish(EXCHANGE, key, Buffer.from(JSON.stringify({ ...payload, timestamp: new Date().toISOString() })), { persistent: true }); return true; } catch { return false; } }
const events = {
  gameCreated: (id, d) => publish(`game.${id}.created`, { type: 'GAME_CREATED', gameId: id, ...d }),
  scoreUpdate: (id, d) => publish(`game.${id}.score`, { type: 'SCORE_UPDATE', gameId: id, ...d }),
  questionAnswered: (id, d) => publish(`game.${id}.question`, { type: 'QUESTION_ANSWERED', gameId: id, ...d }),
  gameEnded: (id, d) => publish(`game.${id}.ended`, { type: 'GAME_ENDED', gameId: id, ...d }),
};
module.exports = { connectRabbitMQ, events, publish, isConnected: () => connected };
