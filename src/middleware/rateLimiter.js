import rateLimit from 'express-rate-limit';

/**
 * Standard API Limiter: 100 requests per 15 minutes.
 * Applied globally to all API routes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * Strict Summary Limiter: 5 requests per hour.
 * Applied specifically to the heavy /summary endpoint.
 */
export const summaryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Summary requests are limited to 5 per hour to conserve resources. Please check /news/db for cached news.'
  }
});
