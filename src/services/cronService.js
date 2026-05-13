import cron from 'node-cron';
import * as aggregatorService from './aggregatorService.js';
import { aiService } from './aiService.js';
import { newsDbService } from './newsDbService.js';
import { cacheService } from './cacheService.js';
import { queueService } from './queueService.js';
import { logger } from '../utils/logger.js';

/**
 * Service to handle automated background tasks.
 */
export const cronService = {
  /**
   * Initializes all scheduled jobs.
   */
  init() {
    // Schedule: Once daily at 8:00 AM UTC (1:30 PM IST)
    // On Cloud Run this is replaced by Google Cloud Scheduler hitting /api/admin/trigger-job
    cron.schedule('0 8 * * *', async () => {
      logger.info('Cron triggered: Adding summarization job to queue.');
      
      await queueService.enqueue('Scheduled Aggregation', async () => {
        await this.runAggregationJob();
      });
    });

    // Schedule: Database cleanup (Every day at midnight)
    cron.schedule('0 0 * * *', async () => {
      logger.info('Starting daily database cleanup...');
      try {
        await newsDbService.cleanupOldNews();
        logger.info('Database cleanup completed.');
      } catch (error) {
        logger.error(`Database cleanup failed: ${error.message}`);
      }
    });

    logger.info('Cron Service initialized and jobs scheduled.');
  },

  /**
   * Core logic for fetching, summarizing, and saving news.
   */
  async runAggregationJob() {
    // 1. Scrape all sources
    const news = await aggregatorService.fetchAllNews();
    
    // 2. Process through AI (batches of 50)
    // aiService handles MOCK_AI internal logic
    const processedNews = await aiService.processInBatches(news, 50);

    // 3. Save to Supabase
    await newsDbService.saveNewsItems(processedNews);

    // 4. Proactive Cache Refresh from DB
    // Fetch fresh data from DB so cache reflects correct created_at ordering.
    await newsDbService.refreshCache();
  }
};
