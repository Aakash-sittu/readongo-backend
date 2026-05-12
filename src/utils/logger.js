import pino from 'pino';

/**
 * Pino Logger Configuration
 * - Uses 'pino-pretty' in development for human-readable logs.
 * - Standard JSON output in production for machine parsing.
 */
const transport = process.env.NODE_ENV !== 'production' 
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
});
