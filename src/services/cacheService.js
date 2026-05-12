import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';

/**
 * Service to handle in-memory caching.
 * Default TTL: 12 hours (43200 seconds)
 */
const cache = new NodeCache({
  stdTTL: 43200,
  checkperiod: 600, // Check for expired keys every 10 minutes
});

export const cacheService = {
  KEYS: {
    LATEST_NEWS: 'latest_news_data',
  },

  /**
   * Get value from cache.
   */
  get(key) {
    const value = cache.get(key);
    if (value) {
      logger.info(`Cache Hit: ${key}`);
    } else {
      logger.info(`Cache Miss: ${key}`);
    }
    return value;
  },

  /**
   * Set value in cache.
   */
  set(key, value, ttl = 43200) {
    logger.info(`Cache Set: ${key}`);
    return cache.set(key, value, ttl);
  },

  /**
   * Delete value from cache.
   */
  del(key) {
    logger.info(`Cache Delete: ${key}`);
    return cache.del(key);
  },

  /**
   * Clear entire cache.
   */
  flush() {
    logger.info('Cache Flush');
    return cache.flushAll();
  }
};
