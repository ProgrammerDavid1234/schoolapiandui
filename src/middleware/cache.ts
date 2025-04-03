
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../services/redisClient';

const CACHE_TTL = 60 * 5; // 5 minutes in seconds

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip caching for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `api:${req.originalUrl}`;
  
  try {
    const redisClient = await getRedisClient();
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method to cache the response
    res.send = function(body: any): Response {
      const responseToCache = body;
      
      // Cache the response
      redisClient.setEx(cacheKey, CACHE_TTL, responseToCache);
      console.log(`Cached response for ${cacheKey}`);
      
      // Call the original send method
      return originalSend.call(this, body);
    };
    
    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next(); // Continue without caching if Redis fails
  }
};

export const clearCache = async (pattern: string): Promise<void> => {
  try {
    const redisClient = await getRedisClient();
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};
