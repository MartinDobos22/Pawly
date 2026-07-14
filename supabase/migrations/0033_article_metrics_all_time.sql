-- AnimalPassport — analytika článkov: podpora „celé obdobie" (all-time).
-- Pôvodná article_metrics (0025) vyžadovala p_since. Tu ho zmeníme na
-- nullable: p_since = null → agregácia bez časového filtra (celá história).
-- Vyžaduje 0025.

create or replace function public.article_metrics(p_since timestamptz default null, p_slug text default null)
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
  where (p_since is null or e.created_at >= p_since)
    and (p_slug is null or e.article_slug = p_slug)
  group by e.article_slug;
$$;

revoke all on function public.article_metrics(timestamptz, text) from public;
grant execute on function public.article_metrics(timestamptz, text) to service_role;
