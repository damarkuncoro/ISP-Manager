import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Key is missing!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);