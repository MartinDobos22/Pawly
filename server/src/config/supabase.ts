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
// Tento kľúč má zostať vyhradený pre cron/admin úlohy alebo pre RPC funkcie,
// ktoré databázovo kontrolujú p_app_user_id. Bežné user CRUD operácie nemajú
// robiť priame service_role dotazy na tabuľky, pretože service_role obchádza RLS.
function requireServiceKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!value || value.trim().length === 0) {
    throw new Error(
      'Chýbajúca povinná Supabase premenná prostredia: SUPABASE_SERVICE_ROLE_KEY (alebo SUPABASE_SERVICE_KEY). Pozri server/.env.example.'
    );
  }
  return value;
}

// supabase-js si k base URL sám pridáva /rest/v1/... — odstráň prípadný
// koncový /rest/v1 a lomítka, aby URL fungovala aj keď ju niekto zadá s cestou.
function normalizeSupabaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/, '')
    .replace(/\/+$/, '');
}

export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      normalizeSupabaseUrl(requireEnv('SUPABASE_URL')),
      requireServiceKey(),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }
  return cachedClient;
}

export const getSupabaseAdmin = getSupabase;
