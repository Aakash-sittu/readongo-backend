import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchLobsters() {
  const feed = await parser.parseURL('https://lobste.rs/rss');
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'Lobsters',
      //date: item.pubDate,
    }));
}
