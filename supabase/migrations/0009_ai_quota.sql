-- AnimalPassport — per-user daily AI call counter (cost safety net).
--
-- Účel: zabrániť tomu aby jeden používateľ (alebo bot) vyžral OpenAI/Vision
-- kredit. Per-IP rate limiter (aiHeavyLimiter, 20/min) chráni len pred burstom,
-- ale za 24h vie jeden účet spraviť tisíce volaní. Tento counter to zastropuje.
--
-- Reset: lazy — pri prvom volaní v novom kalendárnom dni (UTC, podľa
-- Supabase server timezone) sa počítadlo zresetuje na 1. Žiadny cron.

alter table public.users
  add column if not exists ai_calls_today int not null default 0,
  add column if not exists ai_calls_reset_at date not null default current_date;

-- Atomická check-and-increment funkcia.
-- Vracia jeden riadok: (exceeded, current_count, limit_value).
-- - Ak je posledný reset < dnes, počítadlo sa interne resetuje na 0 pred kontrolou.
-- - Ak count >= limit → exceeded=true a count sa NEinkrementuje.
-- - Inak count += 1 a exceeded=false.
-- FOR UPDATE lock chráni pred race conditions pri paralelných requestoch.
create or replace function public.app_increment_ai_quota(
  p_app_user_id uuid,
  p_limit int
)
returns table(exceeded boolean, current_count int, limit_value int)
language plpgsql
volatile
security definer
set search_path = public, app
as $$
declare
  v_today date := current_date;
  v_count int;
  v_reset date;
begin
  perform app.assert_user_exists(p_app_user_id);

  select ai_calls_today, ai_calls_reset_at into v_count, v_reset
    from public.users
    where id = p_app_user_id
    for update;

  if v_reset is null or v_reset < v_today then
    v_count := 0;
  end if;

  if v_count >= p_limit then
    return query select true, v_count, p_limit;
    return;
  end if;

  update public.users
    set ai_calls_today = v_count + 1,
        ai_calls_reset_at = v_today
  where id = p_app_user_id;

  return query select false, v_count + 1, p_limit;
end;
$$;

revoke all on function public.app_increment_ai_quota(uuid, int) from public;
grant execute on function public.app_increment_ai_quota(uuid, int) to service_role;
