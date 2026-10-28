// import { createClient } from "redis";

// const globalForRedis = globalThis;

// const redis =
//   globalForRedis.redis ??
//   createClient({
//     url: process.env.REDIS_URL,
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForRedis.redis = redis;
// }

// let connectionPromise = null;

// export async function getRedis() {
//   if (redis.isReady) {
//     return redis;
//   }

//   if (!connectionPromise) {
//     connectionPromise = redis.connect().catch((error) => {
//       connectionPromise = null;
//       throw error;
//     });
//   }

//   await connectionPromise;

//   return redis;
// }







import { createClient } from "redis";

const globalForRedis = globalThis;

function createRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (error) => {
    console.error("[REDIS ERROR]", error);
  });

  return client;
}

// Reuse the client across Next.js development hot reloads
const redis =
  globalForRedis.redis ??
  createRedisClient();

globalForRedis.redis = redis;

export async function getRedis() {
  // Redis is already connected
  if (redis.isReady) {
    return redis;
  }

  // Reuse the same connection attempt
  if (globalForRedis.redisConnectionPromise) {
    await globalForRedis.redisConnectionPromise;
    return redis;
  }

  // A connection may already be opening
  if (redis.isOpen) {
    // The client is open but not yet ready.
    // Wait for it to become ready instead of calling connect() again.
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Redis connection timed out"));
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        redis.off("ready", onReady);
        redis.off("error", onError);
      }

      function onReady() {
        cleanup();
        resolve();
      }

      function onError(error) {
        cleanup();
        reject(error);
      }

      redis.once("ready", onReady);
      redis.once("error", onError);

      if (redis.isReady) {
        onReady();
      }
    });

    return redis;
  }

  // Start one connection attempt
  const connectionPromise = redis.connect();

  globalForRedis.redisConnectionPromise = connectionPromise;

  try {
    await connectionPromise;
    return redis;
  } finally {
    if (globalForRedis.redisConnectionPromise === connectionPromise) {
      globalForRedis.redisConnectionPromise = null;
    }
  }
}
