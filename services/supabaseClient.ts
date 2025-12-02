import { createClient } from '@supabase/supabase-js';

const envUrl = (import.meta as any).env.VITE_SUPABASE_URL as string | undefined;
const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string | undefined;

const url = envUrl || '';
const key = envKey || '';

export const supabase = createClient(url, key);
