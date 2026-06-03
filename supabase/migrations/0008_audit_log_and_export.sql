-- AnimalPassport — audit log pre zdravotné dáta + GDPR export.
--
-- Účel:
-- 1. Každý prístup k zdravotným dátam cez app_* RPC funkcie sa zapíše do app.audit_log.
--    Umožňuje detekciu zneužitia v prípade úniku service_role kľúča alebo kompromitácie
--    prevádzkovateľského účtu.
-- 2. RPC app_get_my_audit_log dovolí používateľovi prečítať si vlastný audit feed
--    (GDPR „right of access").
-- 3. RPC app_export_user_data zhromaždí všetky používateľské dáta do jedného jsonb
--    (GDPR „right to data portability").

-- ── 1. Tabuľka audit_log ────────────────────────────────────────────────────

create table if not exists app.audit_log (
  id           bigserial primary key,
  app_user_id  uuid references public.users(id) on delete set null,
  action       text not null check (action in ('list', 'create', 'update', 'delete', 'export')),
  table_name   text not null,
  record_id    uuid,
  pet_id       uuid,
  created_at   timestamptz not null default now()
);

create index if not exists audit_log_user_idx
  on app.audit_log (app_user_id, created_at desc);

alter table app.audit_log enable row level security;
-- žiadna policy → table je dostupná len cez service_role + security-definer RPC.

-- ── 2. Helper na zápis ──────────────────────────────────────────────────────

create or replace function app.write_audit_log(
  p_app_user_id uuid,
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_pet_id uuid
)
returns void
language sql
volatile
security definer
set search_path = public, app
as $$
  insert into app.audit_log (app_user_id, action, table_name, record_id, pet_id)
  values (p_app_user_id, p_action, p_table_name, p_record_id, p_pet_id);
$$;

revoke all on function app.write_audit_log(uuid, text, text, uuid, uuid) from public;

-- ── 3. Update existujúcich health RPC — pridanie audit zápisu ───────────────

create or replace function public.app_list_health_rows(p_app_user_id uuid, p_table text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_table text := app.health_table_name(p_table);
  v_rows jsonb;
begin
  perform app.assert_user_exists(p_app_user_id);
  execute format(
    'select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at asc), ''[]''::jsonb)
       from public.%I t
       join public.pets p on p.id = t.pet_id
      where p.user_id = $1',
    v_table
  )
  using p_app_user_id
  into v_rows;

  perform app.write_audit_log(p_app_user_id, 'list', v_table, null, null);
  return v_rows;
end;
$$;

create or replace function public.app_create_health_row(p_app_user_id uuid, p_table text, p_payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, app
as $$
declare
  v_table text := app.health_table_name(p_table);
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb) - 'id' - 'created_at' - 'updated_at' - 'user_id';
  v_pet_id uuid := nullif(v_payload ->> 'pet_id', '')::uuid;
  v_columns text;
  v_values text;
  v_row jsonb;
begin
  perform app.assert_pet_owner(p_app_user_id, v_pet_id);

  select
    string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position),
    string_agg(format('(jsonb_populate_record(null::public.%I, $1)).%I', v_table, c.column_name), ', ' order by c.ordinal_position)
  into v_columns, v_values
  from information_schema.columns c
  join jsonb_object_keys(v_payload) k(key) on k.key = c.column_name
  where c.table_schema = 'public'
    and c.table_name = v_table
    and c.column_name not in ('id', 'created_at', 'updated_at', 'user_id');

  execute format('insert into public.%1$I (%2$s) select %3$s returning to_jsonb(%1$I.*)', v_table, v_columns, v_values)
  using v_payload
  into v_row;

  perform app.write_audit_log(
    p_app_user_id,
    'create',
    v_table,
    nullif(v_row ->> 'id', '')::uuid,
    v_pet_id
  );
  return v_row;
end;
$$;

create or replace function public.app_update_health_row(p_app_user_id uuid, p_table text, p_record_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, app
as $$
declare
  v_table text := app.health_table_name(p_table);
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb) - 'id' - 'created_at' - 'updated_at' - 'user_id';
  v_existing_pet_id uuid;
  v_new_pet_id uuid;
  v_assignments text;
  v_row jsonb;
begin
  execute format('select pet_id from public.%I where id = $1', v_table)
  using p_record_id
  into v_existing_pet_id;

  if v_existing_pet_id is null then
    return null;
  end if;

  perform app.assert_pet_owner(p_app_user_id, v_existing_pet_id);

  if v_payload ? 'pet_id' then
    v_new_pet_id := nullif(v_payload ->> 'pet_id', '')::uuid;
    perform app.assert_pet_owner(p_app_user_id, v_new_pet_id);
  end if;

  v_assignments := app.patch_assignments(v_table, v_payload);
  execute format('update public.%I set %s where id = $2 returning to_jsonb(%I.*)', v_table, v_assignments, v_table)
  using v_payload, p_record_id
  into v_row;

  perform app.write_audit_log(
    p_app_user_id,
    'update',
    v_table,
    p_record_id,
    coalesce(v_new_pet_id, v_existing_pet_id)
  );
  return v_row;
end;
$$;

create or replace function public.app_delete_health_row(p_app_user_id uuid, p_table text, p_record_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, app
as $$
declare
  v_table text := app.health_table_name(p_table);
  v_existing_pet_id uuid;
begin
  execute format('select pet_id from public.%I where id = $1', v_table)
  using p_record_id
  into v_existing_pet_id;

  if v_existing_pet_id is null then
    return false;
  end if;

  perform app.assert_pet_owner(p_app_user_id, v_existing_pet_id);

  execute format('delete from public.%I where id = $1', v_table)
  using p_record_id;

  perform app.write_audit_log(
    p_app_user_id,
    'delete',
    v_table,
    p_record_id,
    v_existing_pet_id
  );
  return found;
end;
$$;

-- ── 4. Read-only RPC pre používateľa: vlastný audit feed ───────────────────

create or replace function public.app_get_my_audit_log(p_app_user_id uuid, p_limit int default 200)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_rows jsonb;
  v_limit int := least(greatest(coalesce(p_limit, 200), 1), 1000);
begin
  perform app.assert_user_exists(p_app_user_id);

  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select id, action, table_name, record_id, pet_id, created_at
    from app.audit_log
    where app_user_id = p_app_user_id
    order by created_at desc
    limit v_limit
  ) t;

  return v_rows;
end;
$$;

-- ── 5. GDPR data export ────────────────────────────────────────────────────

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
    'weight_logs'
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

-- ── 6. Granty ──────────────────────────────────────────────────────────────

revoke all on function public.app_get_my_audit_log(uuid, int) from public;
revoke all on function public.app_export_user_data(uuid) from public;

grant execute on function public.app_get_my_audit_log(uuid, int) to authenticated, service_role;
grant execute on function public.app_export_user_data(uuid) to authenticated, service_role;
