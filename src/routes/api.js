import { Router } from 'express';
import { dataController } from '../controllers/dataController.js';
import { apiLimiter, summaryLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply global rate limiting to all API routes
router.use(apiLimiter);

/**
 * @route GET /api/data
 * @desc Get example data
 * @access Public
 */
router.get('/data', dataController.getData);
router.get('/fetch', dataController.scrapeReddit);
router.get('/rss', dataController.getLast24HoursHN);
router.get('/news/all', dataController.getAllNews);
router.get('/news/summary', summaryLimiter, dataController.getBatchedSummary);
router.get('/news/status', dataController.getJobStatus);
router.get('/news/db', dataController.getStoredNews);

// Test error route
router.get('/error', (req, res, next) => {
  const error = new Error('This is a test error!');
  error.statusCode = 400;
  next(error);
});

export default router;
