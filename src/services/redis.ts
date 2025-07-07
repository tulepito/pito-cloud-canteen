import IORedis from 'ioredis';

export const redisConnection = new IORedis(process.env.NEXT_PUBLIC_REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
