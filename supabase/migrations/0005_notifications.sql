-- AnimalPassport — notifikácie na expirácie (e-mail).
-- Preferencie per používateľ + log odoslaných pripomienok (idempotencia).
-- Vyžaduje 0001_init_users_pets.sql (set_updated_at, users).

-- ── notification_preferences ────────────────────────────────────────────────
create table if not exists notification_preferences (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references users(id) on delete cascade,
  email_enabled        boolean not null default true,
  lead_days            integer[] not null default '{30,7,1}',
  notify_vaccinations  boolean not null default true,
  notify_dewormings    boolean not null default true,
  notify_ectoparasites boolean not null default true,
  notify_vet_checks    boolean not null default true,
  notify_medications   boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger notification_preferences_set_updated_at
  before update on notification_preferences
  for each row execute function set_updated_at();

-- ── notification_log ──────────────────────────────────────────────────────────
-- Zabraňuje opakovanému odoslaniu tej istej pripomienky (record + termín + offset).
create table if not exists notification_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  record_type text not null,
  record_id   uuid not null,
  due_date    text not null,
  offset_days integer not null,
  channel     text not null default 'email',
  sent_at     timestamptz not null default now(),
  unique (record_type, record_id, due_date, offset_days, channel)
);

create index if not exists notification_log_user_idx on notification_log(user_id);

-- ── RLS (deny-by-default) — server ide cez service_role ───────────────────────
alter table notification_preferences enable row level security;
alter table notification_log enable row level security;
