import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  geminiApiKey: process.env.GEMINI_API_KEY,
  subreddits: [
    'technology',
    'programming',
    'webdev',
    'artificial',
    'machinlearning',
    'openai',
    'singularity',
    'saas'
  ],
  // Add other configurations here (e.g., API keys, Database URLs)
};
