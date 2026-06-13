-- AnimalPassport — fix volatility audit-logujúcich RPC funkcií.
--
-- Migrácia 0008 pridala do app_list_health_rows a app_export_user_data audit zápis
-- (perform app.write_audit_log(...) = INSERT do app.audit_log), ale ponechala obe funkcie
-- deklarované ako `stable`. STABLE/IMMUTABLE funkcie v Postgrese bežia v read-only
-- transakcii, takže INSERT v nich zlyhá s `25006: cannot execute INSERT in a read-only
-- transaction`. Dôsledok: všetkých 10 health list endpointov vracalo 500.
--
-- Fix: rovnaké telá ako v 0008, len `stable` → `volatile`.

create or replace function public.app_list_health_rows(p_app_user_id uuid, p_table text)
returns jsonb
language plpgsql
volatile
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

create or replace function public.app_export_user_data(p_app_user_id uuid)
returns jsonb
language plpgsql
volatile
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

-- Granty (idempotentné — create or replace ich zachováva, opakujeme pre istotu).
revoke all on function public.app_list_health_rows(uuid, text) from public;
revoke all on function public.app_export_user_data(uuid) from public;

grant execute on function public.app_list_health_rows(uuid, text) to authenticated, service_role;
grant execute on function public.app_export_user_data(uuid) to authenticated, service_role;
