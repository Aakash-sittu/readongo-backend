import Bottleneck from 'bottleneck';
import { logger } from '../utils/logger.js';

/**
 * Lightweight In-Memory Queue Service.
 * Ensures only one heavy job (like summarization) runs at a time.
 */
const limiter = new Bottleneck({
  maxConcurrent: 1, // Global lock: only one summarization at a time
  minTime: 0,
});

// Simple state tracker for the current job
let currentJobStatus = {
  isRunning: false,
  lastRun: null,
  error: null
};

export const queueService = {
  /**
   * Enqueue a task.
   * @param {Function} task - The async function to execute.
   * @returns {Promise} - Resolves when the task is queued, NOT when it finished.
   */
  async enqueue(taskName, taskFn) {
    if (currentJobStatus.isRunning) {
      logger.info(`Job [${taskName}] already running. Skipping request.`);
      return { status: 'already_running', message: 'A summarization job is currently in progress.' };
    }

    // We don't 'await' the limiter.schedule because we want to return immediately to the user
    limiter.schedule(async () => {
      currentJobStatus.isRunning = true;
      currentJobStatus.error = null;
      logger.info(`Started Background Job: ${taskName}`);

      try {
        await taskFn();
        currentJobStatus.lastRun = new Date();
        logger.info(`Job [${taskName}] completed successfully.`);
      } catch (err) {
        currentJobStatus.error = err.message;
        logger.error(`Job [${taskName}] failed: ${err.message}`);
      } finally {
        currentJobStatus.isRunning = false;
      }
    });

    return { status: 'queued', message: 'Job added to background queue.' };
  },

  /**
   * Get the status of the background worker.
   */
  getStatus() {
    return currentJobStatus;
  }
};
