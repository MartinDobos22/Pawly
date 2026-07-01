-- AnimalPassport — analytika článkov (article_events)
-- Surové eventy z verejných stránok poradne (view, scroll, CTA, …). Zápis ide
-- cez backend service_role (verejný tracking endpoint), RLS deny-by-default.
-- 30d metriky sa agregujú on-the-fly cez RPC article_metrics. Vyžaduje 0018.

create table if not exists article_events (
  id           uuid primary key default gen_random_uuid(),
  article_slug text not null,
  event_type   text not null check (
    event_type in ('view', 'cta_click', 'scroll_50', 'scroll_90', 'related_click', 'source_click')
  ),
  metadata     jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create index if not exists article_events_slug_created_idx
  on article_events (article_slug, created_at desc);
create index if not exists article_events_created_idx
  on article_events (created_at desc);

alter table article_events enable row level security;

-- Agregácia metrík za obdobie (on-the-fly). p_slug = null → všetky články.
create or replace function public.article_metrics(p_since timestamptz, p_slug text default null)
returns table (
  article_slug   text,
  views          bigint,
  cta_clicks     bigint,
  scroll_50      bigint,
  scroll_90      bigint,
  related_clicks bigint,
  source_clicks  bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.article_slug,
    count(*) filter (where e.event_type = 'view'),
    count(*) filter (where e.event_type = 'cta_click'),
    count(*) filter (where e.event_type = 'scroll_50'),
    count(*) filter (where e.event_type = 'scroll_90'),
    count(*) filter (where e.event_type = 'related_click'),
    count(*) filter (where e.event_type = 'source_click')
  from public.article_events e
  where e.created_at >= p_since
    and (p_slug is null or e.article_slug = p_slug)
  group by e.article_slug;
$$;

revoke all on function public.article_metrics(timestamptz, text) from public;
grant execute on function public.article_metrics(timestamptz, text) to service_role;
