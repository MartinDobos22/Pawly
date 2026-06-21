-- AnimalPassport — verejné články poradne (articles)
-- Verejný, globálny obsah BEZ vlastníka (na rozdiel od health tabuliek, ktoré sú
-- scopnuté na pet_id/user_id). Čítanie ide cez backend service_role (RLS
-- deny-by-default, service_role obchádza). Žiadny per-user scope, žiadne policies.
-- Vyžaduje 0001 (set_updated_at). Seed dát je v 0019_articles_seed.sql.

create table if not exists articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  category      text not null,                 -- krmivo | zdravie
  title         text not null,
  description   text not null,
  intro         text not null,
  sections      jsonb not null default '[]',   -- Block[] (paragraph/bullets/subheading/callout)
  faqs          jsonb not null default '[]',   -- FaqItem[]
  related_slugs text[] not null default '{}',
  cover_image   text,
  cta_intent    text not null,                 -- food | passport
  author        text,
  sources       jsonb not null default '[]',   -- ArticleSource[]
  updated       text not null,                 -- ISO dátum poslednej aktualizácie (mirror Article.updated)
  published     boolean not null default true,
  position      integer not null default 0,    -- poradie vo výpise
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_category_idx on articles(category);
create index if not exists articles_published_position_idx on articles(published, position);

create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();

-- Verejný obsah: čítanie cez backend (service_role). Žiadne anon/authenticated policies.
alter table articles enable row level security;
