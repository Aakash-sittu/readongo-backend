# ReadOnGo — AI-Powered Tech News API

A production-grade Express.js API that aggregates tech news from 12+ sources, enriches each article with AI-generated summaries and categories via Google Gemini, and serves them through a high-performance cached endpoint.

---

## Features

- **Multi-Source Aggregation** — Pulls from Hacker News, Reddit, The Verge, Ars Technica, Lobsters, Dev.to, Techmeme, Product Hunt, GitHub Trending, and more.
- **AI Summarization** — Batches headlines through Gemini 2.5 Flash to generate click-worthy summaries and category labels.
- **Supabase Persistence** — Stores processed news with a 7-day auto-expiry policy.
- **In-Memory Caching** — Sub-10ms responses via `node-cache` with proactive refresh on each cron run.
- **Background Jobs** — Auto-refreshes every 6 hours and cleans up stale data at midnight using `node-cron`.
- **Job Queue** — Prevents concurrent AI jobs using `bottleneck` (concurrency lock).
- **Rate Limiting** — 100 req/15min globally, 5 req/hr on the heavy `/summary` endpoint.
- **Pino Logging** — Structured JSON logs in production, pretty-printed in development.
- **Mock Mode** — Set `MOCK_AI=true` to develop without burning API credits.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (ESM) |
| Framework | Express.js 5 |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.5 Flash |
| Feed Parsing | rss-parser, axios |
| Caching | node-cache |
| Scheduler | node-cron |
| Queue | bottleneck |
| Rate Limiting | express-rate-limit |
| Logging | Pino + pino-pretty |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/Aakash-sittu/readongo-backend.git
cd readongo-backend
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Open `.env` and fill in your credentials:
```env
PORT=8000
NODE_ENV=development
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
MOCK_AI=true  # Set to false for real AI summaries
```

### 3. Set Up the Database
Run this SQL in your **Supabase SQL Editor**:
```sql
CREATE TABLE news_items (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  summary TEXT,
  category TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: enable auto-cleanup via pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'delete-old-news',
  '0 0 * * *',
  $$ DELETE FROM news_items WHERE created_at < NOW() - INTERVAL '7 days' $$
);
```

### 4. Run the Server
```bash
npm run dev
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/news/db` | Instant cached news from DB (~5ms) |
| `GET` | `/api/news/all` | Raw aggregated news (no AI) |
| `GET` | `/api/news/summary` | Trigger AI summarization (async, returns 202) |
| `GET` | `/api/news/status` | Check background job status |
| `GET` | `/api/rss` | HN Algolia last 24h |
| `GET` | `/api/fetch` | Reddit posts |

### Response Structure
```json
{
  "status": "success",
  "count": 150,
  "data": [
    {
      "title": "Original article headline",
      "url": "https://example.com/article",
      "summary": "A punchy one-sentence insight on why this matters.",
      "category": "AI/ML",
      "source": "HackerNews",
      "created_at": "2024-05-12T18:00:00Z"
    }
  ]
}
```

### Error Response
```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again after 15 minutes."
}
```

---

## Development Tips

| Task | Command |
|---|---|
| Start dev server | `npm run dev` |
| Enable mock AI | Set `MOCK_AI=true` in `.env` |
| Populate DB (mock) | `GET /api/news/summary` |
| Verify DB connection | `node -e "import('./src/config/supabase.js').then(m => m.supabase.from('news_items').select('count', { count: 'exact', head: true }).then(console.log))"` |

---

## Architecture

See [architecture.md](./architecture.md) for a full breakdown of every service, design decision, and the frontend integration guide.

---

## License

ISC
