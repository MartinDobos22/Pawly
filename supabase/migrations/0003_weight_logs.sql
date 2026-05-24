-- AnimalPassport — váhové záznamy (weight_logs)
-- Backend pristupuje cez service_role; RLS deny-by-default. Vyžaduje 0001 (pets, set_updated_at).

create table if not exists weight_logs (
  id         uuid primary key default gen_random_uuid(),
  pet_id     uuid not null references pets(id) on delete cascade,
  date       text,
  kg         numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists weight_logs_pet_id_idx on weight_logs(pet_id);

create trigger weight_logs_set_updated_at
  before update on weight_logs
  for each row execute function set_updated_at();

-- Server používa service_role (RLS obchádza). Žiadne anon/authenticated policies.
alter table weight_logs enable row level security;
