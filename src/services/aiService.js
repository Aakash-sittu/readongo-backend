import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey || '');

/**
 * Service to handle LLM processing in batches.
 */
export const aiService = {
  /**
   * Processes news items in batches for summarization and categorization.
   * @param {Array} newsItems - All news items.
   * @param {number} batchSize - Size of each batch (default 50).
   * @returns {Promise<Array>} - Aggregated results from all batches.
   */
  async processInBatches(newsItems, batchSize = 50) {
    if (process.env.MOCK_AI === 'true') {
      logger.info('MOCK MODE: Simulating AI processing...');
      return newsItems.map(item => ({
        ...item,
        summary: `[MOCK] This is a punchy summary for: ${item.title}`,
        category: 'AI/ML'
      }));
    }

    const results = [];
    const chunks = [];

    // Split into chunks
    for (let i = 0; i < newsItems.length; i += batchSize) {
      chunks.push(newsItems.slice(i, i + batchSize));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const prompt = `
        You are a tech news curator with a knack for writing irresistible headlines.  
Your goal: make every article so intriguing that readers can’t help but click.

I will give you a list of article titles and URLs. For each, output a JSON object with:
- "title": the original title
- "url": the original URL
- "summary": a **one‑sentence summary** that is:
    • Short, punchy (under 25 words)
    • Focused on the “why it matters” or the most surprising/controversial angle
    • Written like a click‑worthy subheadline – use power verbs, ask a rhetorical question, or hint at an unexpected outcome
- "category": one of ["AI/ML", "Programming", "Business/Startups", "Security", "Gadgets", "Science", "Other"]

Rules:
- Do NOT simply rephrase the title. Add spice.
- If the article is controversial or contains a debate, frame it as a question (e.g., “Is X the end of Y?”).
- If it’s a breakthrough, highlight the impact.
- Keep it factual – don’t invent details.
- Return ONLY a raw JSON array. No markdown, no extra text.

Examples of good summaries vs. bad:
- Bad: "Meta is using AI and employees are unhappy."
  Good: "Meta’s AI pivot is causing widespread employee misery—what’s really going on?"
- Bad: "Zed Editor released a theme builder."
  Good: "Build your perfect IDE theme in seconds with Zed’s new visual tool—no CSS required."

Here are the articles:
        ${chunk.map((item, idx) => `${idx + 1}. ${item.title}`).join('\n')}

        Return ONLY a JSON array of objects with this structure:
        [
          { "title": "original title", "summary": "one sentence summary", "category": "category" },
          ...
        ]
      `;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract and parse JSON
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedBatch = JSON.parse(jsonMatch[0]);
          // Merge with original data (to keep URLs)
          const mergedBatch = parsedBatch.map((pItem, idx) => ({
            ...chunk[idx],
            summary: pItem.summary,
            category: pItem.category
          }));
          results.push(...mergedBatch);
        }

        // Wait for 2 seconds between calls (except the last one) to avoid rate limits
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        logger.error(`Error processing batch ${i + 1}: ${error.message}`);
        // Fallback: keep items without summary/category if batch fails
        results.push(...chunk);
      }
    }

    return results;
  }
};
