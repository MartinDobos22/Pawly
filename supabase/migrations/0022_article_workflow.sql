-- AnimalPassport — redakčný workflow článkov
-- Nahrádza binárny published/koncept stav plnohodnotným redakčným procesom:
-- draft → review → approved → scheduled → published → archived.
-- Pôvodný stĺpec `published` ostáva ako zdroj pravdy pre verejnú viditeľnosť
-- (public read/prerender), odvodzuje sa zo status (published <=> status='published').
-- Vyžaduje 0018 (articles).

alter table articles
  add column if not exists status          text not null default 'draft',
  add column if not exists assigned_editor text,
  add column if not exists editorial_notes text,
  add column if not exists publish_at      timestamptz,
  add column if not exists unpublish_at    timestamptz;

-- Backfill stavu z existujúceho published flagu.
update articles set status = case when published then 'published' else 'draft' end
  where status = 'draft';

create index if not exists articles_status_idx on articles(status);
-- Pre cron plánovač (scheduled publish/unpublish).
create index if not exists articles_publish_at_idx on articles(publish_at)
  where publish_at is not null;
create index if not exists articles_unpublish_at_idx on articles(unpublish_at)
  where unpublish_at is not null;
