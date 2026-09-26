import { createClient } from '@supabase/supabase-js';

// Prioritize the publishable key added to .env, fallback to anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase environment variables are missing. Please check your client/.env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
