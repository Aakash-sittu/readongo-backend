import { config } from '../config/index.js';
import { redditService } from '../services/redditService.js';
import { rssService } from '../services/rssService.js';
import * as aggregatorService from '../services/aggregatorService.js';
import { aiService } from '../services/aiService.js';
import { newsDbService } from '../services/newsDbService.js';
import { cacheService } from '../services/cacheService.js';
import { queueService } from '../services/queueService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * Controller to handle data requests.
 */
export const dataController = {
  /**
   * Sample handler to get data.
   */
  getData: asyncHandler(async (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Data retrieved successfully',
      data: {
        item: 'example',
      },
    });
  }),

  /**
   * Scrapes predefined subreddits from config.
   */
  scrapeReddit: asyncHandler(async (req, res) => {
    const subreddits = config.subreddits;

    const posts = await redditService.scrapeMultipleSubreddits(subreddits);

    res.status(200).json({
      status: 'success',
      count: posts.length,
      data: posts,
    });
  }),

  /**
   * Fetches top stories from Hacker News RSS.
   */
  getTopHackerNews: asyncHandler(async (req, res) => {
    const stories = await rssService.getLast24HoursHN();

    res.status(200).json({
      status: 'success',
      count: stories.length,
      data: stories,
    });
  }),

  getLast24HoursHN: asyncHandler(async (req, res) => {
    const stories = await rssService.getLast24HoursHN();

    res.status(200).json({
      status: 'success',
      count: stories.length,
      data: stories,
    });
  }),

  /**
   * Fetches news from all sources.
   */
  getAllNews: asyncHandler(async (req, res) => {
    const news = await aggregatorService.fetchAllNews();

    res.status(200).json({
      status: 'success',
      count: news.length,
      data: news,
    });
  }),

  /**
   * Enqueues a news summarization job.
   * Returns immediately with a job status.
   */
  getBatchedSummary: asyncHandler(async (req, res) => {
    const result = await queueService.enqueue('Manual Summary Request', async () => {
      const news = await aggregatorService.fetchAllNews();
      const processedNews = await aiService.processInBatches(news, 50);
      await newsDbService.saveNewsItems(processedNews);
      
      // Update cache manually after background job finishes
      cacheService.set(cacheService.KEYS.LATEST_NEWS, processedNews);
    });

    res.status(202).json({
      status: 'success',
      ...result
    });
  }),

  /**
   * Returns the status of the current background job.
   */
  getJobStatus: asyncHandler(async (req, res) => {
    const status = queueService.getStatus();
    res.status(200).json({
      status: 'success',
      data: status
    });
  }),

  /**
   * Retrieves already processed news from Supabase.
   */
  getStoredNews: asyncHandler(async (req, res) => {
    const news = await newsDbService.getLatestNews(100);

    res.status(200).json({
      status: 'success',
      count: news.length,
      data: news,
    });
  }),
};
