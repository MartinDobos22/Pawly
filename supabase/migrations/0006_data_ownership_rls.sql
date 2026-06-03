-- AnimalPassport — databázové vynútenie vlastníctva dát.
--
-- Model:
-- 1. Bežné user requesty nemajú obchádzať RLS cez priame service_role CRUD volania.
--    Pre budúce user-scoped JWT volania sa vlastníctvo číta z claimu app_user_id/user_id/sub.
-- 2. Backend, ktorý má Firebase usera namapovaného na users.id, môže volať security-definer
--    RPC funkcie nižšie. Každá explicitne prijíma p_app_user_id a pred mutáciou kontroluje
--    vlastníctvo zvieraťa alebo používateľského riadku.
-- 3. service_role má zostať vyhradený na cron/admin úlohy alebo na volanie týchto RPC funkcií,
--    nie na priame CRUD dotazy pre bežné user requesty.

create schema if not exists app;

-- Aktuálny app používateľ pre RLS policy z user-scoped JWT.
-- Preferovaný claim je app_user_id; user_id a sub sú podporené pre kompatibilitu.
create or replace function app.current_app_user_id()
returns uuid
language sql
stable
set search_path = public, app
as $$
  select case
    when claim.value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then claim.value::uuid
    else null
  end
  from (
    select nullif(
      coalesce(
        auth.jwt() ->> 'app_user_id',
        auth.jwt() ->> 'user_id',
        auth.jwt() ->> 'sub'
      ),
      ''
    ) as value
  ) claim;
$$;

create or replace function app.pet_is_owned_by(p_app_user_id uuid, p_pet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select exists (
    select 1
    from public.pets p
    where p.id = p_pet_id
      and p.user_id = p_app_user_id
  );
$$;

create or replace function app.current_user_owns_pet(p_pet_id uuid)
returns boolean
language sql
stable
set search_path = public, app
as $$
  select app.pet_is_owned_by(app.current_app_user_id(), p_pet_id);
$$;

create or replace function app.assert_user_exists(p_app_user_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = public, app
as $$
begin
  if auth.role() = 'authenticated' and app.current_app_user_id() is distinct from p_app_user_id then
    raise exception 'Authenticated caller cannot act for app user %.', p_app_user_id using errcode = 'P0001';
  end if;

  if p_app_user_id is null or not exists (select 1 from public.users where id = p_app_user_id) then
    raise exception 'App user % does not exist.', p_app_user_id using errcode = 'P0001';
  end if;
end;
$$;

create or replace function app.assert_pet_owner(p_app_user_id uuid, p_pet_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = public, app
as $$
begin
  perform app.assert_user_exists(p_app_user_id);
  if p_pet_id is null or not app.pet_is_owned_by(p_app_user_id, p_pet_id) then
    raise exception 'Pet % is not owned by app user %.', p_pet_id, p_app_user_id using errcode = 'P0001';
  end if;
end;
$$;

-- Whitelist zdravotných tabuliek spravovaných generickými RPC funkciami.
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
    'weight_logs'
  ) then
    raise exception 'Unsupported health table: %', p_table using errcode = 'P0001';
  end if;
  return p_table;
end;
$$;

create or replace function app.protected_patch_keys()
returns text[]
language sql
immutable
as $$
  select array['id', 'created_at', 'updated_at', 'user_id'];
$$;

create or replace function app.patch_assignments(p_table text, p_payload jsonb)
returns text
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_table text := app.health_table_name(p_table);
  v_assignments text;
begin
  select string_agg(
    format('%1$I = (jsonb_populate_record(null::public.%2$I, $1)).%1$I', c.column_name, v_table),
    ', '
    order by c.ordinal_position
  )
  into v_assignments
  from information_schema.columns c
  join jsonb_object_keys(coalesce(p_payload, '{}'::jsonb)) k(key) on k.key = c.column_name
  where c.table_schema = 'public'
    and c.table_name = v_table
    and c.column_name <> all(app.protected_patch_keys());

  if v_assignments is null then
    raise exception 'No writable columns in payload for table %.', p_table using errcode = 'P0001';
  end if;

  return v_assignments;
end;
$$;

create or replace function app.pet_patch_assignments(p_payload jsonb)
returns text
language plpgsql
stable
security definer
set search_path = public, app
as $$
declare
  v_assignments text;
begin
  select string_agg(
    format('%1$I = (jsonb_populate_record(null::public.pets, $1)).%1$I', c.column_name),
    ', '
    order by c.ordinal_position
  )
  into v_assignments
  from information_schema.columns c
  join jsonb_object_keys(coalesce(p_payload, '{}'::jsonb)) k(key) on k.key = c.column_name
  where c.table_schema = 'public'
    and c.table_name = 'pets'
    and c.column_name <> all(app.protected_patch_keys());

  if v_assignments is null then
    raise exception 'No writable columns in payload for pets.' using errcode = 'P0001';
  end if;

  return v_assignments;
end;
$$;

-- ── RLS policies pre user-scoped JWT ────────────────────────────────────────

alter table public.users enable row level security;
alter table public.pets enable row level security;
alter table public.vaccinations enable row level security;
alter table public.dewormings enable row level security;
alter table public.ectoparasites enable row level security;
alter table public.vet_visits enable row level security;
alter table public.medications enable row level security;
alter table public.medication_dose_logs enable row level security;
alter table public.diet_entries enable row level security;
alter table public.expenses enable row level security;
alter table public.health_episodes enable row level security;
alter table public.weight_logs enable row level security;
alter table public.saved_analyses enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_log enable row level security;

create policy "users own row" on public.users
  for all to authenticated
  using (id = app.current_app_user_id())
  with check (id = app.current_app_user_id());

create policy "pets owner access" on public.pets
  for all to authenticated
  using (user_id = app.current_app_user_id())
  with check (user_id = app.current_app_user_id());

create policy "vaccinations owner access" on public.vaccinations
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "dewormings owner access" on public.dewormings
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "ectoparasites owner access" on public.ectoparasites
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "vet_visits owner access" on public.vet_visits
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "medications owner access" on public.medications
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "medication_dose_logs owner access" on public.medication_dose_logs
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "diet_entries owner access" on public.diet_entries
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "expenses owner access" on public.expenses
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "health_episodes owner access" on public.health_episodes
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "weight_logs owner access" on public.weight_logs
  for all to authenticated
  using (app.current_user_owns_pet(pet_id))
  with check (app.current_user_owns_pet(pet_id));

create policy "saved_analyses owner access" on public.saved_analyses
  for all to authenticated
  using (user_id = app.current_app_user_id())
  with check (
    user_id = app.current_app_user_id()
    and (pet_id is null or app.current_user_owns_pet(pet_id))
  );

create policy "notification_preferences owner access" on public.notification_preferences
  for all to authenticated
  using (user_id = app.current_app_user_id())
  with check (user_id = app.current_app_user_id());

create policy "notification_log owner read" on public.notification_log
  for select to authenticated
  using (user_id = app.current_app_user_id());

-- ── Security-definer RPC pre backendové user requesty ───────────────────────

create or replace function public.app_list_pets(p_app_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, app
as $$
  select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at asc), '[]'::jsonb)
  from public.pets p
  where p.user_id = p_app_user_id
    and (coalesce(auth.role(), '') <> 'authenticated' or app.current_app_user_id() = p_app_user_id);
$$;

create or replace function public.app_get_pet(p_app_user_id uuid, p_pet_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, app
as $$
  select to_jsonb(p)
  from public.pets p
  where p.user_id = p_app_user_id
    and p.id = p_pet_id
    and (coalesce(auth.role(), '') <> 'authenticated' or app.current_app_user_id() = p_app_user_id);
$$;

create or replace function public.app_create_pet(p_app_user_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, app
as $$
declare
  v_row public.pets;
  v_payload jsonb := (coalesce(p_payload, '{}'::jsonb) - 'id' - 'created_at' - 'updated_at') || jsonb_build_object('user_id', p_app_user_id);
  v_columns text;
  v_values text;
begin
  perform app.assert_user_exists(p_app_user_id);

  select
    string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position),
    string_agg(format('(jsonb_populate_record(null::public.pets, $1)).%I', c.column_name), ', ' order by c.ordinal_position)
  into v_columns, v_values
  from information_schema.columns c
  join jsonb_object_keys(v_payload) k(key) on k.key = c.column_name
  where c.table_schema = 'public'
    and c.table_name = 'pets'
    and c.column_name not in ('id', 'created_at', 'updated_at');

  execute format('insert into public.pets (%s) select %s returning *', v_columns, v_values)
  using v_payload
  into v_row;

  return to_jsonb(v_row);
end;
$$;

create or replace function public.app_update_pet(p_app_user_id uuid, p_pet_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, app
as $$
declare
  v_row public.pets;
  v_assignments text;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb) - 'id' - 'user_id' - 'created_at' - 'updated_at';
begin
  perform app.assert_pet_owner(p_app_user_id, p_pet_id);
  v_assignments := app.pet_patch_assignments(v_payload);

  execute format('update public.pets set %s where id = $2 and user_id = $3 returning *', v_assignments)
  using v_payload, p_pet_id, p_app_user_id
  into v_row;

  return to_jsonb(v_row);
end;
$$;

create or replace function public.app_delete_pet(p_app_user_id uuid, p_pet_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, app
as $$
begin
  perform app.assert_pet_owner(p_app_user_id, p_pet_id);
  delete from public.pets where id = p_pet_id and user_id = p_app_user_id;
  return found;
end;
$$;

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
  return found;
end;
$$;

revoke all on function public.app_list_pets(uuid) from public;
revoke all on function public.app_get_pet(uuid, uuid) from public;
revoke all on function public.app_create_pet(uuid, jsonb) from public;
revoke all on function public.app_update_pet(uuid, uuid, jsonb) from public;
revoke all on function public.app_delete_pet(uuid, uuid) from public;
revoke all on function public.app_list_health_rows(uuid, text) from public;
revoke all on function public.app_create_health_row(uuid, text, jsonb) from public;
revoke all on function public.app_update_health_row(uuid, text, uuid, jsonb) from public;
revoke all on function public.app_delete_health_row(uuid, text, uuid) from public;

grant execute on function public.app_list_pets(uuid) to authenticated, service_role;
grant execute on function public.app_get_pet(uuid, uuid) to authenticated, service_role;
grant execute on function public.app_create_pet(uuid, jsonb) to authenticated, service_role;
grant execute on function public.app_update_pet(uuid, uuid, jsonb) to authenticated, service_role;
grant execute on function public.app_delete_pet(uuid, uuid) to authenticated, service_role;
grant execute on function public.app_list_health_rows(uuid, text) to authenticated, service_role;
grant execute on function public.app_create_health_row(uuid, text, jsonb) to authenticated, service_role;
grant execute on function public.app_update_health_row(uuid, text, uuid, jsonb) to authenticated, service_role;
grant execute on function public.app_delete_health_row(uuid, text, uuid) to authenticated, service_role;
