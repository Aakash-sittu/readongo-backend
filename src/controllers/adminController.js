import { asyncHandler } from '../middleware/asyncHandler.js';
import { queueService } from '../services/queueService.js';
import { cronService } from '../services/cronService.js';
import { logger } from '../utils/logger.js';

/**
 * Secret token to authenticate requests from Google Cloud Scheduler.
 * Set ADMIN_SECRET in your Cloud Run environment variables.
 */
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export const adminController = {
  /**
   * POST /api/admin/trigger-job
   * Called by Google Cloud Scheduler to trigger the news aggregation job.
   * Protected by a shared secret header.
   */
  triggerJob: asyncHandler(async (req, res) => {
    // Validate the shared secret from Cloud Scheduler
    const incomingSecret = req.headers['x-admin-secret'];

    if (ADMIN_SECRET && incomingSecret !== ADMIN_SECRET) {
      logger.warn('Unauthorized attempt to trigger admin job');
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    logger.info('Admin trigger received — adding aggregation job to queue.');

    const result = await queueService.enqueue('Cloud Scheduler Job', async () => {
      await cronService.runAggregationJob();
    });

    res.status(202).json({
      status: 'success',
      ...result,
    });
  }),
};
