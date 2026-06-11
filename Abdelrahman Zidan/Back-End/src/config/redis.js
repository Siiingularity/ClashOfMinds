const redis = require('redis');
let client = null, connected = false;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
async function connectRedis() {
  try {
    client = redis.createClient({ url: REDIS_URL });
    client.on('error', (err) => { console.error('[Redis] Error:', err.message); connected = false; });
    client.on('connect', () => { console.log('[Redis] ✅ Connected'); connected = true; });
    await client.connect();
  } catch (err) { console.error('[Redis] ❌ Failed:', err.message); }
}
const TTL = { CATEGORIES: 600, QUESTIONS: 300, LEADERBOARD: 60 };
async function get(key) { if (!client || !connected) return null; try { const v = await client.get(key); return v ? JSON.parse(v) : null; } catch { return null; } }
async function set(key, value, ttl = 300) { if (!client || !connected) return false; try { await client.set(key, JSON.stringify(value), { EX: ttl }); return true; } catch { return false; } }
async function delPattern(pattern) { if (!client || !connected) return false; try { const keys = await client.keys(pattern); if (keys.length > 0) await client.del(keys); return true; } catch { return false; } }
module.exports = { connectRedis, get, set, delPattern, TTL, isConnected: () => connected };
