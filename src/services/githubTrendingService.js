import Parser from 'rss-parser';
import { config } from '../config/index.js';

const parser = new Parser();
const RSSHUB_BASE = process.env.RSSHUB_BASE || 'https://rsshub.app';

export async function fetchGitHubTrending() {
  const feed = await parser.parseURL(`${RSSHUB_BASE}/github/trending/daily`);
  return feed.items
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'GitHubTrending',
      //date: item.pubDate,
    }));
}
