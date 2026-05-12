import Parser from 'rss-parser';

const parser = new Parser();

/**
 * Service to handle RSS feed parsing.
 */
export const rssService = {
  /**
   * Fetches top Hacker News stories from RSS.
   * @returns {Promise<Array>} - List of HN stories.
   */
  async getLast24HoursHN() {
    const timestamp24hAgo = Math.floor(Date.now() / 1000) - 86400;
    const url = `https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=50&numericFilters=created_at_i>${timestamp24hAgo}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.hits.map(hit => ({
      title: hit.title,
      url: hit.url,
      source: 'HackerNews (Algolia)',
      //date: hit.created_at,
    }));
  }
};
