-- AnimalPassport — zdravotné záznamy (vaccinations, dewormings, ectoparasites,
-- vet_visits, medications, dose_logs, diet_entries, expenses, episodes, saved_analyses)
-- Backend pristupuje cez service_role; RLS deny-by-default. Dátumy ako text (ISO round-trip).
-- Vyžaduje 0001_init_users_pets.sql (funkcia set_updated_at, tabuľka pets).

-- ── vaccinations ────────────────────────────────────────────────────────────
create table if not exists vaccinations (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references pets(id) on delete cascade,
  type         text not null,
  name         text not null,
  date_applied text,
  valid_until  text,
  batch_number text,
  attachments  jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── dewormings ──────────────────────────────────────────────────────────────
create table if not exists dewormings (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references pets(id) on delete cascade,
  product_name  text not null,
  date_given    text,
  interval_days integer,
  next_due_date text,
  attachments   jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── ectoparasites ─────────────────────────────────────────────────────────────
create table if not exists ectoparasites (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references pets(id) on delete cascade,
  product_name  text not null,
  form          text not null,
  date_given    text,
  interval_days integer,
  duration_days integer,
  next_due_date text,
  attachments   jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── vet_visits ──────────────────────────────────────────────────────────────
create table if not exists vet_visits (
  id                uuid primary key default gen_random_uuid(),
  pet_id            uuid not null references pets(id) on delete cascade,
  date              text,
  clinic_name       text,
  vet_name          text,
  reason            text,
  findings          text,
  diagnosis         text,
  recommendations   text,
  diet_change       text,
  next_check_date   text,
  ai_extracted_text text,
  ai_exam_type      text,
  medication_ids    uuid[] not null default '{}',
  attachments       jsonb not null default '[]',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── medications ─────────────────────────────────────────────────────────────
create table if not exists medications (
  id                uuid primary key default gen_random_uuid(),
  pet_id            uuid not null references pets(id) on delete cascade,
  name              text not null,
  reason            text,
  dose              text,
  frequency         text,
  start_date        text,
  end_date          text,
  long_term         boolean,
  from_vet_visit_id uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── medication_dose_logs ──────────────────────────────────────────────────────
create table if not exists medication_dose_logs (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references pets(id) on delete cascade,
  medication_id uuid not null references medications(id) on delete cascade,
  date          text,
  taken         boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── diet_entries ────────────────────────────────────────────────────────────
create table if not exists diet_entries (
  id                  uuid primary key default gen_random_uuid(),
  pet_id              uuid not null references pets(id) on delete cascade,
  food_id             text,
  food_name           text not null,
  started_at          text,
  ended_at            text,
  reaction_notes      text,
  suitability_status  text,
  suitability_reasons text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── expenses ──────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id                    uuid primary key default gen_random_uuid(),
  pet_id                uuid not null references pets(id) on delete cascade,
  date                  text,
  amount                numeric not null default 0,
  currency              text not null default 'EUR',
  category              text not null,
  related_vet_visit_id  uuid,
  related_diet_entry_id uuid,
  related_medication_id uuid,
  note                  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── health_episodes ───────────────────────────────────────────────────────────
create table if not exists health_episodes (
  id                  uuid primary key default gen_random_uuid(),
  pet_id              uuid not null references pets(id) on delete cascade,
  symptom_title       text not null,
  symptom_description text,
  category            text not null,
  started_at          text,
  ended_at            text,
  location            text,
  triggers            text[] not null default '{}',
  diagnosis           text,
  vet_visit_id        uuid,
  medication_ids      uuid[] not null default '{}',
  treatment_notes     text,
  what_worked         text[] not null default '{}',
  what_didnt_work     text[] not null default '{}',
  outcome             text not null,
  severity            text not null,
  lessons_learned     text,
  attachments         jsonb not null default '[]',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── saved_analyses (história analýz krmiva) ─────────────────────────────────────
create table if not exists saved_analyses (
  id               uuid primary key default gen_random_uuid(),
  pet_id           uuid references pets(id) on delete cascade,
  user_id          uuid not null references users(id) on delete cascade,
  date             text,
  composition      text,
  source_label     text,
  result           jsonb not null,
  pet_profile_name text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── indexy + updated_at triggery + RLS ──────────────────────────────────────────
do $$
declare
  t text;
  health_tables text[] := array[
    'vaccinations','dewormings','ectoparasites','vet_visits','medications',
    'medication_dose_logs','diet_entries','expenses','health_episodes'
  ];
begin
  foreach t in array health_tables loop
    execute format('create index if not exists %I on %I(pet_id)', t || '_pet_id_idx', t);
    execute format(
      'create trigger %I before update on %I for each row execute function set_updated_at()',
      t || '_set_updated_at', t
    );
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

create index if not exists medication_dose_logs_medication_id_idx on medication_dose_logs(medication_id);
create index if not exists saved_analyses_user_id_idx on saved_analyses(user_id);

create trigger saved_analyses_set_updated_at
  before update on saved_analyses
  for each row execute function set_updated_at();

alter table saved_analyses enable row level security;

-- Server používa service_role (RLS obchádza). Žiadne anon/authenticated policies →
-- cez verejný kľúč sa k zdravotným záznamom nedá dostať.
