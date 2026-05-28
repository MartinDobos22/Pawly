alter table if exists pets
  add column if not exists date_of_birth_precision text
  check (date_of_birth_precision in ('year', 'year-month', 'full'));

alter table if exists pets
  add column if not exists birth_year integer
  check (birth_year between 1900 and 2100);

alter table if exists pets
  add column if not exists birth_month integer
  check (birth_month between 1 and 12);
