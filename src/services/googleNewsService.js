import Parser from 'rss-parser';
import { isWithin24h } from '../utils/dateUtils.js';

const parser = new Parser();

export async function fetchGoogleNews() {
  const feed = await parser.parseURL(
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en'
  );
  return feed.items
    .filter(item => isWithin24h(item.pubDate))
    .map(item => ({
      title: item.title,
      url: item.link,
      source: 'GoogleNews',
      //date: item.pubDate,
    }));
}
