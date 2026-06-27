-- AnimalPassport — audit AI generovania obsahu článkov (ai_generations)
-- Každé AI volanie v CMS (meta popis, preformulovanie, FAQ, …) sa zaloguje:
-- prompt, odpoveď, model, tokeny, odhad nákladu. Slúži na auditovateľnosť a
-- sledovanie nákladov. Prístup len cez backend service_role (RLS deny-default).
-- Vyžaduje 0018 (articles).

create table if not exists ai_generations (
  id              uuid primary key default gen_random_uuid(),
  user_email      text,
  article_slug    text,
  type            text not null check (
    type in ('outline', 'rewrite', 'meta_description', 'faq', 'summary', 'source_check')
  ),
  prompt          text not null,
  response        text not null,
  model           text not null,
  input_tokens    integer,
  output_tokens   integer,
  estimated_cost  numeric(10, 6),
  created_at      timestamptz not null default now()
);

create index if not exists ai_generations_article_idx
  on ai_generations (article_slug, created_at desc);

alter table ai_generations enable row level security;
