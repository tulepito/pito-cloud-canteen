import { redisConnection } from '@services/redis';

export async function getOrSetRedisCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const cached = await redisConnection.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn(`Redis read error for key: ${key}`, err);
  }

  const freshData = await fetcher();

  try {
    await redisConnection.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(`Redis write error for key: ${key}`, err);
  }

  return freshData;
}
