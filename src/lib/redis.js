import { createClient } from "redis";

const globalForRedis = globalThis;

const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

let connectionPromise = null;

export async function getRedis() {
  if (redis.isReady) {
    return redis;
  }

  if (!connectionPromise) {
    connectionPromise = redis.connect().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;

  return redis;
}