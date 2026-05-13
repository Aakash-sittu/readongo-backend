// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use Service Role Key if available (bypasses RLS), otherwise fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey;

export const supabase = createClient(config.supabase.url, supabaseKey);
