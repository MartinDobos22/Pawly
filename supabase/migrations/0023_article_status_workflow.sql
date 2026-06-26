-- AnimalPassport — redakčný workflow v2 (stavový stroj + audit)
-- Premenúva stav 'review' → 'in_review' a pridáva audit polia ku každému
-- redakčnému prechodu (kto a kedy poslal na kontrolu / schválil / publikoval /
-- archivoval). Prechody stavov sa vynucujú na API (articleService). Vyžaduje
-- 0018 (articles) a 0022 (article_workflow).

update articles set status = 'in_review' where status = 'review';

alter table articles
  add column if not exists submitted_for_review_at timestamptz,
  add column if not exists submitted_for_review_by text,
  add column if not exists approved_at  timestamptz,
  add column if not exists approved_by  text,
  add column if not exists published_at timestamptz,
  add column if not exists published_by text,
  add column if not exists archived_at  timestamptz,
  add column if not exists archived_by  text;
