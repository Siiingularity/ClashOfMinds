/**
 * Redis Configuration
 * Provides caching for:
 * - Category lists (TTL: 10 minutes)
 * - Question pools per category (TTL: 5 minutes)
 * - Leaderboard (TTL: 1 minute)
 * - Auth tokens (blacklist for logout)
 */

const redis = require('redis');

let client = null;
let isConnected = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function connectRedis() {
  try {
    client = redis.createClient({ url: REDIS_URL });

    client.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('[Redis] Connected to', REDIS_URL);
      isConnected = true;
    });

    client.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    await client.connect();
    return client;
  } catch (err) {
    console.error('[Redis] Connection failed:', err.message);
    console.warn('[Redis] Caching disabled — running without Redis');
    return null;
  }
}

// ─── Cache operations ────────────────────────────────────────────────

async function get(key) {
  if (!client || !isConnected) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function set(key, value, ttlSeconds = 300) {
  if (!client || !isConnected) return false;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch {
    return false;
  }
}

async function del(key) {
  if (!client || !isConnected) return false;
  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

async function delPattern(pattern) {
  if (!client || !isConnected) return false;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(keys);
    return true;
  } catch {
    return false;
  }
}

// ─── Token blacklist (for logout) ────────────────────────────────────
async function blacklistToken(token, expirySeconds = 86400) {
  return set(`blacklist:${token}`, true, expirySeconds);
}

async function isTokenBlacklisted(token) {
  const val = await get(`blacklist:${token}`);
  return !!val;
}

// ─── Cache TTL constants ─────────────────────────────────────────────
const TTL = {
  CATEGORIES:   10 * 60,  // 10 minutes
  QUESTIONS:     5 * 60,  // 5 minutes
  LEADERBOARD:       60,  // 1 minute
  USER_PROFILE:  2 * 60,  // 2 minutes
  SITE_SETTINGS: 30 * 60, // 30 minutes
};

module.exports = {
  connectRedis,
  get,
  set,
  del,
  delPattern,
  blacklistToken,
  isTokenBlacklisted,
  TTL,
  getClient: () => client,
  isConnected: () => isConnected,
};
