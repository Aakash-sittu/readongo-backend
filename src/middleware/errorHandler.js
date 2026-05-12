import { config } from '../config/index.js';

/**
 * Centralized error handling middleware.
 */
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[Error] ${statusCode} - ${message}`);
  if (config.nodeEnv === 'development') {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
