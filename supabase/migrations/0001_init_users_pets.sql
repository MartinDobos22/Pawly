-- AnimalPassport — základná schéma: users + pets
-- Backend (Express) pristupuje cez service_role kľúč; RLS je defense-in-depth.

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── users ─────────────────────────────────────────────────────────────────
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  email        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

-- ── pets ──────────────────────────────────────────────────────────────────
create table if not exists pets (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  name              text not null,
  animal_type       text not null check (animal_type in ('dog', 'cat', 'other')),
  breed             text,
  date_of_birth     date,
  sex               text check (sex in ('MALE', 'FEMALE', 'UNKNOWN')),
  age_years         integer,
  age_months        integer,
  weight_kg         numeric,
  photo_url         text,
  microchip_number  text,
  passport_number   text,
  size              text check (size in ('mini', 'small', 'medium', 'large', 'giant')),
  life_stage        text check (life_stage in ('puppy', 'junior', 'adult', 'senior')),
  activity_level    text check (activity_level in ('low', 'moderate', 'high', 'working')),
  allergies         text[] not null default '{}',
  intolerances      text[] not null default '{}',
  health_conditions text[] not null default '{}',
  chronic_conditions jsonb not null default '[]',
  procedures        jsonb not null default '[]',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists pets_user_id_idx on pets(user_id);

create trigger pets_set_updated_at
  before update on pets
  for each row execute function set_updated_at();

-- ── RLS (deny-by-default) ───────────────────────────────────────────────────
-- Server používa service_role (RLS obchádza). Žiadne policies pre anon/authenticated
-- → cez verejný (anon) kľúč sa nedá čítať ani písať nič.
alter table users enable row level security;
alter table pets enable row level security;

-- Budúce priame klient↔Supabase volania (ak sa zapne Firebase ako third-party JWT
-- provider). Odkomentuj a sprav users.firebase_uid dostupné cez auth.jwt()->>'sub':
--
-- create policy "pets owner can read" on pets for select
--   using (user_id = (select id from users where firebase_uid = auth.jwt()->>'sub'));
-- create policy "pets owner can write" on pets for all
--   using (user_id = (select id from users where firebase_uid = auth.jwt()->>'sub'))
--   with check (user_id = (select id from users where firebase_uid = auth.jwt()->>'sub'));
