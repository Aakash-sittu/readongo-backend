import { Router } from 'express';
import { dataController } from '../controllers/dataController.js';
import { adminController } from '../controllers/adminController.js';
import { apiLimiter, summaryLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply global rate limiting to all API routes
router.use(apiLimiter);

// Health check endpoint — used by Cloud Run startup & liveness probes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// Admin routes — triggered by Google Cloud Scheduler
router.post('/admin/trigger-job', adminController.triggerJob);

// Test error route
router.get('/error', (req, res, next) => {
  const error = new Error('This is a test error!');
  error.statusCode = 400;
  next(error);
});

export default router;
