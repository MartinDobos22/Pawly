-- AnimalPassport — verzovanie článkov (article_versions)
-- Snapshot celého článku pri každom uložení / obnovení / publikovaní. Umožňuje
-- históriu verzií, rollback a audit (kto, kedy, čo). Globálny obsah ako articles
-- — žiadny per-user scope, prístup výhradne cez backend service_role
-- (RLS deny-by-default, service_role obchádza). Vyžaduje 0018 (articles).

create table if not exists article_versions (
  id             uuid primary key default gen_random_uuid(),
  article_id     uuid not null references articles(id) on delete cascade,
  version_number integer not null,
  data           jsonb not null,                 -- celý AdminArticle snapshot
  kind           text not null default 'manual', -- manual | autosave | publish | restore
  change_summary text,
  created_by     text,                           -- e-mail admina (z Firebase tokenu)
  created_at     timestamptz not null default now(),
  unique (article_id, version_number)
);

create index if not exists article_versions_article_idx
  on article_versions(article_id, version_number desc);

-- Globálny obsah: prístup len cez backend (service_role). Žiadne anon/auth policies.
alter table article_versions enable row level security;
