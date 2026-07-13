-- AnimalPassport — opakovaná liečba / injekcie (treatments)
-- Pravidelné terapeutické injekcie a liečba, ktoré nie sú očkovaním proti nákaze
-- (napr. Cytopoint proti alergii, alergénová imunoterapia). Majú vlastný interval
-- a „ďalší termín" ako odčervenie/ektoparazity. Backend pristupuje cez service_role
-- (RLS deny-by-default). Vyžaduje 0001 (pets, set_updated_at), 0006 (health RPC allowlist),
-- 0008/0016 (GDPR export).

create table if not exists treatments (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references pets(id) on delete cascade,
  category      text,                     -- skupina/problém (ALLERGY_SKIN, HEART, …)
  name          text not null,            -- konkrétne liečivo / terapia
  form          text,                     -- TABLET | INJECTION | DROPS | TOPICAL | DIET | OTHER
  reason        text,
  date_given    text,
  interval_days integer,
  next_due_date text,
  note          text,
  attachments   jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- idempotentné pre prípad, že staršia verzia migrácie už tabuľku vytvorila
alter table treatments add column if not exists category text;
alter table treatments add column if not exists form text;

create index if not exists treatments_pet_id_idx on treatments(pet_id);

create trigger treatments_set_updated_at
  before update on treatments
  for each row execute function set_updated_at();

-- Server používa service_role (RLS obchádza). Žiadne anon/authenticated policies.
alter table treatments enable row level security;

-- ── Rozšír allowlist health RPC (0006/0016) o treatments ────────────────────
create or replace function app.health_table_name(p_table text)
returns text
language plpgsql
immutable
set search_path = public, app
as $$
begin
  if p_table not in (
    'vaccinations',
    'dewormings',
    'ectoparasites',
    'vet_visits',
    'medications',
    'medication_dose_logs',
    'diet_entries',
    'expenses',
    'health_episodes',
    'weight_logs',
    'check_ins',
    'treatments'
  ) then
    raise exception 'Unsupported health table: %', p_table using errcode = 'P0001';
  end if;
  return p_table;
end;
$$;

-- ── Doplň treatments do GDPR exportu (0008/0016) ────────────────────────────
create or replace function public.app_export_user_data(p_app_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_user jsonb;
  v_pets jsonb;
  v_pet_ids uuid[];
  v_result jsonb;
  v_table text;
  v_rows jsonb;
  v_export jsonb := '{}'::jsonb;
  v_health_tables text[] := array[
    'vaccinations',
    'dewormings',
    'ectoparasites',
    'vet_visits',
    'medications',
    'medication_dose_logs',
    'diet_entries',
    'expenses',
    'health_episodes',
    'weight_logs',
    'check_ins',
    'treatments'
  ];
begin
  perform app.assert_user_exists(p_app_user_id);

  select to_jsonb(u) into v_user
  from public.users u
  where u.id = p_app_user_id;

  select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at asc), '[]'::jsonb),
         coalesce(array_agg(p.id), array[]::uuid[])
  into v_pets, v_pet_ids
  from public.pets p
  where p.user_id = p_app_user_id;

  foreach v_table in array v_health_tables loop
    execute format(
      'select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at asc), ''[]''::jsonb)
         from public.%I t
        where t.pet_id = any($1)',
      v_table
    )
    using v_pet_ids
    into v_rows;
    v_export := v_export || jsonb_build_object(v_table, v_rows);
  end loop;

  -- saved_analyses scope-uje sa cez user_id (môže byť bez pet_id)
  select coalesce(jsonb_agg(to_jsonb(s) order by s.created_at asc), '[]'::jsonb)
  into v_rows
  from public.saved_analyses s
  where s.user_id = p_app_user_id;
  v_export := v_export || jsonb_build_object('saved_analyses', v_rows);

  -- notification_preferences (per-user singleton)
  select coalesce(to_jsonb(np), 'null'::jsonb)
  into v_rows
  from public.notification_preferences np
  where np.user_id = p_app_user_id;
  v_export := v_export || jsonb_build_object('notification_preferences', v_rows);

  v_result := jsonb_build_object(
    'exported_at', now(),
    'app_user_id', p_app_user_id,
    'user', v_user,
    'pets', v_pets,
    'health', v_export
  );

  perform app.write_audit_log(p_app_user_id, 'export', 'user_data', null, null);
  return v_result;
end;
$$;

revoke all on function public.app_export_user_data(uuid) from public;
grant execute on function public.app_export_user_data(uuid) to authenticated, service_role;
