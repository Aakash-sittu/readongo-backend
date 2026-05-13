import { fetchHackerNews } from './hackernewsService.js';
import { fetchLobsters } from './lobstersService.js';
import { fetchArsTechnica } from './arstechnicaService.js';
import { fetchTheRegister } from './theregisterService.js';
import { fetchTheVerge } from './vergeService.js';
import { fetchDevTo } from './devtoService.js';
import { fetchTechmeme } from './techmemeService.js';
import { fetchProductHunt } from './producthuntService.js';
import { fetchGitHubTrending } from './githubTrendingService.js';
import { fetchGoogleNews } from './googleNewsService.js';
import { redditService } from './redditService.js';
import { rssService } from './rssService.js';
import { config } from '../config/index.js';

const services = [
  fetchHackerNews,
  fetchLobsters,
  fetchArsTechnica,
  fetchTheRegister,
  fetchTheVerge,
  fetchDevTo,
  fetchTechmeme,
  fetchProductHunt,
  fetchGitHubTrending,
  fetchGoogleNews,
  // Adding Reddit and HN Algolia
  () => redditService.scrapeMultipleSubreddits(config.subreddits),
  () => rssService.getLast24HoursHN(),
];

/**
 * Aggregates news from all services in parallel.
 * @returns {Promise<Array>} - Combined list of news items.
 */
export async function fetchAllNews() {
  const results = await Promise.allSettled(services.map(fn => fn()));
  
  const flattened = results
    .filter(res => res.status === 'fulfilled')
    .map(res => res.value)
    .flat()
    .filter(item => item && item.url && item.title); // Drop items with no URL or title

  // Deduplicate by URL
  const uniqueNews = Array.from(
    new Map(flattened.map(item => [item.url, item])).values()
  );

  return uniqueNews.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
}
