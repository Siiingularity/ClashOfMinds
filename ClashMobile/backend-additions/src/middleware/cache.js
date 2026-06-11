/**
 * Redis Cache Middleware
 * Drop-in middleware for Express routes — caches GET responses.
 *
 * Usage in routes:
 *   const { cacheMiddleware } = require('../middleware/cache');
 *   router.get('/categories', cacheMiddleware('categories', 600), categoryController.getAll);
 */

const redis = require('../config/redis');

/**
 * Creates a caching middleware for a given key prefix and TTL.
 * @param {string} keyPrefix - Cache key prefix (e.g. 'categories')
 * @param {number} ttlSeconds - Cache lifetime in seconds
 */
function cacheMiddleware(keyPrefix, ttlSeconds = 300) {
  return async (req, res, next) => {
    // Build a unique key from prefix + query params
    const queryStr = JSON.stringify(req.query);
    const cacheKey = `${keyPrefix}:${Buffer.from(queryStr).toString('base64')}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ ...cached, _cached: true, _cacheKey: cacheKey });
      }
    } catch {
      // Cache miss or error — fall through to controller
    }

    // Intercept res.json to store response in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode === 200 && body && body.success !== false) {
        redis.set(cacheKey, body, ttlSeconds).catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidates all cache keys matching a pattern.
 * Call this after any write operation (create/update/delete).
 */
async function invalidateCache(pattern) {
  await redis.delPattern(`${pattern}:*`);
}

/**
 * Convenience middleware that sets Cache-Control headers.
 */
function setCacheHeaders(maxAgeSeconds = 60) {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`);
    next();
  };
}

module.exports = { cacheMiddleware, invalidateCache, setCacheHeaders };
