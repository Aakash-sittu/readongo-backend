import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchTheVerge() {
  const feed = await parser.parseURL('https://www.theverge.com/rss/index.xml');
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'TheVerge',
      //date: item.pubDate,
    }));
}
