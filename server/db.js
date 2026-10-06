import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

export async function initializeSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured - using fallback mode');
    return false;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase initialized');
    return true;
  } catch (err) {
    console.error('Supabase initialization failed:', err);
    return false;
  }
}

export function getSupabase() {
  return supabase;
}
