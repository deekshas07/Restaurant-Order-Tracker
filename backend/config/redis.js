const { createClient } = require("redis");

const DEFAULT_CACHE_KEY = "orders:all";
const DEFAULT_TTL_SECONDS = Number(process.env.REDIS_CACHE_TTL) || 60;

let redisClient = null;
let isRedisConnected = false;
let lastRedisError = null;
let lastRedisLatencyMs = 0;

// Zero-Dependency In-Memory TTL Cache Engine (active when Redis server is offline)
const memoryCache = new Map();

const cacheStats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
  writes: 0,
  lastAction: "INIT",
  lastKey: DEFAULT_CACHE_KEY,
  lastActionAt: new Date().toISOString(),
};

async function initRedis() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const start = Date.now();

  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 1500,
        reconnectStrategy: false,
      },
    });

    client.on("error", (err) => {
      lastRedisError = err.message;
      isRedisConnected = false;
    });

    await client.connect();
    await client.ping();
    lastRedisLatencyMs = Date.now() - start;
    redisClient = client;
    isRedisConnected = true;
    lastRedisError = null;
    return true;
  } catch (err) {
    lastRedisError = err.message;
    isRedisConnected = false;
    redisClient = null;
    return false;
  }
}

/**
 * Low-level GET primitive with automatic TTL expiration and HIT/MISS telemetry.
 */
async function get(key = DEFAULT_CACHE_KEY) {
  const start = Date.now();
  cacheStats.lastKey = key;
  cacheStats.lastActionAt = new Date().toISOString();

  if (isRedisConnected && redisClient) {
    try {
      const raw = await redisClient.get(key);
      lastRedisLatencyMs = Date.now() - start;
      if (raw !== null && raw !== undefined) {
        cacheStats.hits += 1;
        cacheStats.lastAction = "HIT";
        return raw;
      }
    } catch (err) {
      lastRedisError = err.message;
      isRedisConnected = false;
    }
  }

  const entry = memoryCache.get(key);
  lastRedisLatencyMs = Math.max(1, Date.now() - start);

  if (entry && entry.expiresAt > Date.now()) {
    cacheStats.hits += 1;
    cacheStats.lastAction = "HIT";
    return entry.value;
  }

  if (entry) {
    memoryCache.delete(key);
  }

  cacheStats.misses += 1;
  cacheStats.lastAction = "MISS";
  return null;
}

/**
 * Low-level SET primitive with EX (TTL in seconds).
 */
async function set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const start = Date.now();
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  cacheStats.writes += 1;
  cacheStats.lastKey = key;
  cacheStats.lastActionAt = new Date().toISOString();

  memoryCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
    cachedAt: new Date().toISOString(),
  });

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, serialized, { EX: ttlSeconds });
      lastRedisLatencyMs = Date.now() - start;
      return "OK";
    } catch (err) {
      lastRedisError = err.message;
      isRedisConnected = false;
    }
  }

  lastRedisLatencyMs = Math.max(1, Date.now() - start);
  return "OK";
}

/**
 * Low-level DEL primitive with cache invalidation tracking.
 */
async function del(key = DEFAULT_CACHE_KEY, reason = "ORDER_MUTATION") {
  const start = Date.now();
  memoryCache.delete(key);
  if (key === DEFAULT_CACHE_KEY) {
    memoryCache.clear();
  }
  cacheStats.invalidations += 1;
  cacheStats.lastKey = key;
  cacheStats.lastAction = `INVALIDATED (${reason})`;
  cacheStats.lastActionAt = new Date().toISOString();

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
      lastRedisLatencyMs = Date.now() - start;
      return 1;
    } catch (err) {
      lastRedisError = err.message;
      isRedisConnected = false;
    }
  }

  lastRedisLatencyMs = Math.max(1, Date.now() - start);
  return 1;
}

async function getCachedOrders(key = DEFAULT_CACHE_KEY) {
  const raw = await get(key);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    return null;
  }
}

async function setCachedOrders(
  orders,
  key = DEFAULT_CACHE_KEY,
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  await set(key, JSON.stringify(orders), ttlSeconds);
  return true;
}

async function invalidateOrdersCache(reason = "ORDER_MUTATION") {
  await del(DEFAULT_CACHE_KEY, reason);
  return true;
}

function getActiveCacheKeys() {
  const now = Date.now();
  const keys = [];
  for (const [k, v] of memoryCache.entries()) {
    if (v.expiresAt > now) {
      keys.push({
        key: k,
        ttlRemainingSeconds: Math.max(
          0,
          Math.round((v.expiresAt - now) / 1000)
        ),
        cachedAt: v.cachedAt,
      });
    } else {
      memoryCache.delete(k);
    }
  }
  return keys;
}

function getRedisDiagnostics() {
  const activeKeys = getActiveCacheKeys();
  const totalLookups = cacheStats.hits + cacheStats.misses;
  const hitRatePercent =
    totalLookups > 0 ? Math.round((cacheStats.hits / totalLookups) * 100) : 0;

  return {
    engine: "Redis",
    connected: isRedisConnected,
    mode: isRedisConnected
      ? "Redis Server (Live Connection)"
      : "In-Memory TTL Cache Engine (Zero-Dependency Fallback Active)",
    url: process.env.REDIS_URL || "redis://localhost:6379",
    latencyMs: lastRedisLatencyMs,
    ttlSeconds: DEFAULT_TTL_SECONDS,
    stats: {
      ...cacheStats,
      hitRatePercent,
      isCached: activeKeys.length > 0,
      activeKeys,
    },
    lastError: isRedisConnected ? null : lastRedisError,
  };
}

module.exports = {
  DEFAULT_CACHE_KEY,
  initRedis,
  get,
  set,
  del,
  getCachedOrders,
  setCachedOrders,
  invalidateOrdersCache,
  getRedisDiagnostics,
};
