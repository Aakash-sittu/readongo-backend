import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchArsTechnica() {
  const feed = await parser.parseURL('https://feeds.arstechnica.com/arstechnica/index');
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'ArsTechnica',
      //date: item.pubDate,
    }));
}
