import { getRedis } from "./redis";

export async function rateLimit({
  key,
  limit,
  windowSeconds,
}) {
  const redis = await getRedis();

  const redisKey = `rate-limit:${key}`;

  const current = await redis.incr(redisKey);

  if (current === 1) {
    await redis.expire(redisKey, windowSeconds);
  }

  const ttl = await redis.ttl(redisKey);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    retryAfter: Math.max(0, ttl),
  };
}