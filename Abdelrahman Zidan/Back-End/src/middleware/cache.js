const redis = require('../config/redis');
function cacheMiddleware(prefix, ttl = 300) {
  return async (req, res, next) => {
    const key = `${prefix}:${Buffer.from(JSON.stringify(req.query)).toString('base64')}`;
    try { const cached = await redis.get(key); if (cached) return res.json({ ...cached, _cached: true }); } catch {}
    const original = res.json.bind(res);
    res.json = (body) => { if (res.statusCode === 200 && body?.success !== false) redis.set(key, body, ttl).catch(() => {}); return original(body); };
    next();
  };
}
async function invalidate(pattern) { await redis.delPattern(`${pattern}:*`); }
module.exports = { cacheMiddleware, invalidate };
