import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Chýbajúca povinná Supabase premenná prostredia: ${name}. Pozri server/.env.example.`
    );
  }
  return value;
}

export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cachedClient;
}
