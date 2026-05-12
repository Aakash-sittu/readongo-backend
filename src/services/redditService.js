import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service to handle Reddit scraping via public JSON endpoints.
 */
export const redditService = {
  /**
   * Fetches the latest posts from a specific subreddit.
   * @param {string} subreddit - Name of the subreddit.
   * @param {number} limit - Number of posts to fetch (max 100).
   * @returns {Promise<Array>} - Array of formatted post objects.
   */
  async getSubredditPosts(subreddit, limit = 5) {
    try {
      const url = `https://www.reddit.com/r/${subreddit}.json?limit=${limit}`;
      logger.info(`Scraping Reddit: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (readongo:v1.0.0 (by /u/yourusername))',
        },
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure from Reddit');
      }

      return response.data.data.children.map((child) => ({
        //id: child.data.id,
        title: child.data.title,
        url: child.data.url,
        //author: child.data.author,
        //score: child.data.score,
        subreddit: child.data.subreddit,
        //source: `Reddit (r/${child.data.subreddit})`,
        //date: new Date(child.data.created_utc * 1000).toISOString(),
      }));
    } catch (error) {
      logger.error(`Failed to scrape r/${subreddit}: ${error.message}`);
      return []; // Return empty array so Promise.all doesn't fail entirely
    }
  },

  /**
   * Fetches posts from multiple subreddits in parallel.
   * @param {string[]} subreddits - Array of subreddit names.
   * @returns {Promise<Array>} - Flattened array of posts from all subreddits.
   */
  async scrapeMultipleSubreddits(subreddits) {
    const promises = subreddits.map(sub => this.getSubredditPosts(sub.trim()));
    const results = await Promise.all(promises);
    return results.flat();
  }
};
