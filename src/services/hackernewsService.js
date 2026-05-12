import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchHackerNews() {
  const feed = await parser.parseURL('https://hnrss.org/frontpage?points=50');
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'HackerNews',
      //date: item.pubDate,
    }));
}
