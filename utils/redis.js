import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// 1. General purpose connection (Rate Limiting, Caching)
export const redisClient = new Redis(REDIS_URL);

// 2. Factory for Queue connections (Blocking)
export const createQueueConnection = () => new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
