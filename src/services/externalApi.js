import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service to handle external API interactions.
 */
export const externalApiService = {
  /**
   * Fetches data from an external source.
   * @param {string} endpoint - The API endpoint.
   * @returns {Promise<any>} - The data from the API.
   */
  fetchData: async (endpoint) => {
    try {
      logger.info(`Fetching data from: ${endpoint}`);
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching data from ${endpoint}`, error);
      throw error;
    }
  },
};
