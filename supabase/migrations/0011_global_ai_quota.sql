-- AnimalPassport — globálny denný strop AI volaní (cost circuit-breaker).
--
-- Účel: per-user `app_increment_ai_quota` chráni pred jedným power-userom
-- alebo botom. Tento strop chráni pred *kolektívnym* burstom (napríklad
-- ak by Pawly prišlo do trendu a 200 reálnych userov × 50 AI/deň = 10 000
-- OpenAI volaní/deň = $150+ za deň). Bez tohto kill switchu by sa o
-- prekročení dozvedel až OpenAI billing alert.
--
-- Singleton tabuľka (id=1) — žiadny per-key counter, len jedna hodnota
-- pre celý projekt. Reset je lazy (rovnaký pattern ako per-user).

create table if not exists app.global_ai_quota (
  id smallint primary key default 1,
  calls_today int not null default 0,
  reset_at date not null default current_date,
  constraint global_ai_quota_singleton check (id = 1)
);

insert into app.global_ai_quota (id) values (1) on conflict (id) do nothing;

-- Atomická check-and-increment funkcia.
-- Vracia jeden riadok: (exceeded, current_count, limit_value).
-- FOR UPDATE lock chráni pred race conditions pri paralelných requestoch.
create or replace function public.app_increment_global_ai_quota(p_limit int)
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
  select calls_today, reset_at into v_count, v_reset
    from app.global_ai_quota
    where id = 1
    for update;

  if v_reset is null or v_reset < v_today then
    v_count := 0;
  end if;

  if v_count >= p_limit then
    return query select true, v_count, p_limit;
    return;
  end if;

  update app.global_ai_quota
    set calls_today = v_count + 1,
        reset_at = v_today
  where id = 1;

  return query select false, v_count + 1, p_limit;
end;
$$;

revoke all on function public.app_increment_global_ai_quota(int) from public;
grant execute on function public.app_increment_global_ai_quota(int) to service_role;
