-- AnimalPassport — odborná kontrola článkov (najmä zdravotných)
-- Riziko článku + audit kto/kedy kontroloval/fact-checkol/medicínsky posúdil +
-- per-article disclaimer a cyklus kontrol. Povinné pravidlá pre kategóriu
-- zdravie vynucuje articleValidation.ts. Vyžaduje 0018 (articles).

alter table articles
  add column if not exists risk_level             text,           -- low | medium | high
  add column if not exists reviewed_by            text,
  add column if not exists reviewed_at            timestamptz,
  add column if not exists reviewer_title         text,
  add column if not exists fact_checked_by        text,
  add column if not exists fact_checked_at        timestamptz,
  add column if not exists medical_reviewed_by    text,
  add column if not exists medical_reviewed_at    timestamptz,
  add column if not exists last_content_review_at timestamptz,
  add column if not exists next_review_due_at     timestamptz,
  add column if not exists disclaimer             text;
