import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchTechmeme() {
  const feed = await parser.parseURL('https://www.techmeme.com/feed.xml');
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'Techmeme',
      //date: item.pubDate,
    }));
}
