// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

const supabaseUrl = config.supabase.url;
// Use Service Role Key if available (bypasses RLS), otherwise fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey;

if (!supabaseUrl || !supabaseKey) {
  logger.warn('Supabase credentials missing. DB features will be unavailable.');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;
