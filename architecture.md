# ReadOnGo Architecture

ReadOnGo is a modern tech news aggregator that uses AI to summarize and categorize headlines from across the web, storing them in a high-performance database for instant access.

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js 5.x |
| **Database** | Supabase (PostgreSQL) |
| **AI / LLM** | Google Gemini (gemini-2.5-flash) |
| **Feed Parsing** | rss-parser, axios |
| **Deployment** | (Planned) Vercel / Heroku |

## System Architecture

### 1. Data Aggregation (Scrapers)
The system pulls data from 12+ sources in parallel using specialized services:
- **RSS Feeds**: Ars Technica, The Register, The Verge, Dev.to, Techmeme, Google News, etc.
- **REST APIs**: Reddit (JSON API), Hacker News (Algolia Search API).
- **Custom Scrapers**: GitHub Trending (via RSSHub), Product Hunt.

### 2. Aggregator Service (`aggregatorService.js`)
- **Parallel Fetching**: Uses `Promise.allSettled` to fetch all sources simultaneously.
- **Deduplication**: Automatically removes duplicate URLs found across different sources to save processing power and database space.

### 3. AI Processing (`aiService.js`)
- **Batching**: Splits news items into chunks of 50 to optimize prompt length.
- **Rate Limiting**: Implements a 2-second delay between batch calls to stay within API limits.
- **Content Enrichment**:
    - **Click-worthy Summaries**: Generates punchy, one-sentence summaries.
    - **Auto-Categorization**: Assigns categories like AI/ML, Programming, Security, etc.
- **Mock Mode**: A `MOCK_AI` toggle in `.env` allows for development without consuming API credits.

### 4. Persistence & Retention (`newsDbService.js`)
- **Upsert Strategy**: Uses Supabase `upsert` with a unique constraint on URLs to prevent collisions.
- **Retention Policy**: A 7-day TTL (Time To Live) is enforced using Supabase `pg_cron` (database-level) and a fallback Node.js cron (application-level).

### 5. Automation & Cron Jobs (`cronService.js`)
The system includes a background task runner using `node-cron` to ensure the news is always fresh without manual intervention:
- **Summarization Job**: Runs every 6 hours (`0 */6 * * *`). It scrapes all sources, processes them through Gemini, and upserts them into Supabase.
- **Cleanup Job**: Runs daily at midnight (`0 0 * * *`) to delete entries older than 7 days, ensuring optimal database performance.

### 6. In-Memory Caching Layer (`cacheService.js`)
To ensure sub-10ms response times, the system uses `node-cache` for high-speed data retrieval:
- **Hybrid Eviction Strategy**: 
    - **Proactive Refresh**: The Cron Job manually updates the cache immediately after saving new news items, ensuring Zero Latency for the next user.
    - **TTL Safety Net**: An absolute 12-hour TTL prevents "zombie data" if the Cron Job fails.
- **Performance**: Reduces Supabase database load by serving 99% of requests directly from the server's RAM.

### 7. Job Queueing & Concurrency (`queueService.js`)
To protect Gemini rate limits and prevent server crashes during heavy loads, the system uses a lightweight in-memory queue (`bottleneck`):
- **Concurrency Lock**: Only **one** summarization job can run at a time globally. If a user hits `/summary` while a job is already running, the system safely skips the redundant request.
- **Asynchronous Execution**: The `/api/news/summary` endpoint now returns a **202 Accepted** status immediately, offloading the 30-second AI process to a background worker.
- **Status Tracking**: Frontend clients can poll `/api/news/status` to check if a job is currently running or see the timestamp of the last successful run.

### 8. API Rate Limiting (`rateLimiter.js`)
To protect the server from abuse and ensure service availability, the system implements HTTP-level rate limiting using `express-rate-limit`:
- **Global Policy**: 100 requests per 15 minutes per IP across all routes.
- **Strict Summary Policy**: 5 requests per hour per IP specifically for the `/api/news/summary` endpoint. This prevents users from triggering expensive AI processing too frequently.

### 9. High-Performance Logging (`logger.js`)
The system uses **Pino** for all application logging:
- **Fast & Low Overhead**: Significantly more performant than `console.log`.
- **Structured JSON**: Logs are output as JSON, making them easy to ingest into observability platforms like ELK, Datadog, or Honeycomb.
- **Human Readable Development Mode**: In local development, `pino-pretty` is used to format logs into a clean, colorized, and readable format.

## API Endpoints

### `GET /api/news/all`
Returns raw, aggregated tech news from all sources (no AI).
**Response Structure:**
```json
{
  "status": "success",
  "count": 185,
  "data": [
    {
      "title": "Example Headline",
      "url": "https://example.com/news/1",
      "source": "The Verge",
      "date": "2024-05-10T12:00:00Z"
    }
  ]
}
```

### `GET /api/news/summary`
Triggers the full scrape + AI summary process and stores results in the DB.
**Response Structure:**
```json
{
  "status": "success",
  "count": 185,
  "data": [
    {
      "title": "Example Headline",
      "url": "https://example.com/news/1",
      "source": "The Verge",
      "summary": "A punchy, click-worthy sentence explaining why this matters.",
      "category": "AI/ML",
      "date": "2024-05-10T12:00:00Z"
    }
  ]
}
```

### `GET /api/news/db`
Instantly retrieves the latest summarized stories directly from Supabase.
**Response Structure:**
Matches the structure of `/api/news/summary`.

## Frontend Integration Guide

### 1. API Base Configuration
- **Base URL**: `http://localhost:8000/api` (Development)
- **Headers**: All requests return `application/json`.

### 2. Data Schema for UI
Frontend developers should expect the following fields for summarized news:
- `title`: The original article headline.
- `url`: Direct link to the source.
- `summary`: A click-worthy, one-sentence description (ideal for sub-headers).
- `category`: Used for filtering. Current categories include: `["AI/ML", "Programming", "Business/Startups", "Security", "Gadgets", "Science", "Other"]`.
- `source`: The origin name (e.g., "The Verge", "HackerNews"). Use this for source-specific icons.
- `date`: ISO 8601 string. Recommend using `Intl.DateTimeFormat` or `date-fns` to show "X hours ago".

### 3. Recommended UI Patterns
- **The "Instant Load" Strategy**: Always call `GET /news/db` on initial page load. It returns in ~5ms due to server-side caching.
- **The "Force Refresh"**: Implement a "Pull to Refresh" or "Sync Now" button that calls `GET /news/summary`. Note: This call can take 20-30 seconds as it runs the real-time AI pipeline. Show a "Summarizing with Gemini..." loader.
- **Filtering**: Use the `category` field to build a horizontal pill-scroll or a sidebar filter.
- **Source Labels**: Display the `source` as a small badge on each news card.

### 4. Error Handling
The API follows a standard error structure:
```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Detailed error message",
  "stack": "..." // Only in development mode
}
```

## Environment Configuration
The project is configured via a `.env` file containing:
- `PORT`: Server port (default 8000).
- `GEMINI_API_KEY`: Google Generative AI credentials.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: Database connection details.
- `MOCK_AI`: Toggle for simulated AI responses.
