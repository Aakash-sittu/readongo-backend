import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchProductHunt() {
  const res = await fetch('https://www.producthunt.com/feed?category=tech', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const xml = await res.text();
  const feed = await parser.parseString(xml);
  return feed.items
    .filter(item => isWithin24h(item.pubDate || item.isoDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'ProductHunt',
      //date: item.pubDate,
    }));
}
