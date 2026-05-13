import { supabase } from '../config/supabase.js';
import { cacheService } from './cacheService.js';
import { logger } from '../utils/logger.js';

/**
 * Service to handle News storage in Supabase.
 */
export const newsDbService = {
  /**
   * Saves or updates a list of news items.
   * @param {Array} newsItems - List of processed news items.
   */
  async saveNewsItems(newsItems) {
    if (!newsItems || newsItems.length === 0) return;

    // Deduplicate by URL to prevent "ON CONFLICT DO UPDATE cannot affect row a second time"
    const uniqueNews = Array.from(
      new Map(newsItems.map(item => [item.url, item])).values()
    );

    // Filter out items missing required fields to avoid DB constraint violations
    const validNews = uniqueNews.filter(item => item.url && item.title);

    if (validNews.length === 0) return;

    // Map fields to match database schema
    const rows = validNews.map(item => ({
      title: item.title,
      url: item.url,
      summary: item.summary || null,
      category: item.category || 'Other',
      source: item.source || 'Unknown',
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('news_items')
      .upsert(rows, { onConflict: 'url' });

    if (error) {
      logger.error(`Error saving news to Supabase: ${error.message}`);
      throw error;
    }

    return data;
  },

  /**
   * Fetches news items from the database.
   * @param {number} limit - Number of items to fetch.
   * @returns {Promise<Array>}
   */
  async getLatestNews(limit = 50) {
    // 1. Check cache first
    const cachedData = cacheService.get(cacheService.KEYS.LATEST_NEWS);
    if (cachedData) return cachedData;

    // 2. Cache miss - fetch from DB
    return this.refreshCache(limit);
  },

  /**
   * Always fetches fresh data from DB and updates the cache.
   * Used after a job completes to ensure the cache reflects the latest saved batch.
   * @param {number} limit - Number of items to fetch.
   * @returns {Promise<Array>}
   */
  async refreshCache(limit = 100) {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(`Error refreshing cache from Supabase: ${error.message}`);
      return [];
    }

    cacheService.set(cacheService.KEYS.LATEST_NEWS, data);
    logger.info(`Cache refreshed with ${data.length} items from DB.`);
    return data;
  },

  /**
   * Deletes news items older than 7 days.
   */
  async cleanupOldNews() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error } = await supabase
      .from('news_items')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString());

    if (error) {
      logger.error(`Error cleaning up old news: ${error.message}`);
    }
  }
};
