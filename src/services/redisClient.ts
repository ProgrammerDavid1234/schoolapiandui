
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

export async function initRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }
  
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (error) => {
    console.error('Redis Client Error', error);
  });

  await redisClient.connect();
  console.log('Redis client connected');
  
  return redisClient;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient || !redisClient.isOpen) {
    return await initRedis();
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis client closed');
  }
}
