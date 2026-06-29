-- AnimalPassport — druh zvieraťa pre články poradne (filter popri kategórii).
--
-- Článok sa dá filtrovať podľa druhu (pes, mačka, …) navyše k téme
-- (category = krmivo/zdravie). Prázdne pole = článok nie je viazaný na druh
-- (zobrazí sa pri každom filtri druhu / vo „Všetky").

alter table articles
  add column if not exists species text[] not null default '{}';

comment on column articles.species is
  'Druhy zvierat (kľúče z ANIMAL_SPECIES), ktorých sa článok týka. Verejný filter.';
