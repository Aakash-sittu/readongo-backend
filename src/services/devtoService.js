import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchDevTo() {
  const feed = await parser.parseURL('https://dev.to/feed/tag/ai');
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'DevTo',
      //date: item.pubDate,
    }));
}
