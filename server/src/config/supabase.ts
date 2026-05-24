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

// Akceptuj oba názvy (SUPABASE_SERVICE_ROLE_KEY je preferovaný, SUPABASE_SERVICE_KEY ako alias).
function requireServiceKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!value || value.trim().length === 0) {
    throw new Error(
      'Chýbajúca povinná Supabase premenná prostredia: SUPABASE_SERVICE_ROLE_KEY (alebo SUPABASE_SERVICE_KEY). Pozri server/.env.example.'
    );
  }
  return value;
}

export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(requireEnv('SUPABASE_URL'), requireServiceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}
