-- AnimalPassport — voliteľná poznámka pri vakcinácii, odčervení a ektoparazitároch.
-- Zobrazuje sa v histórii kategórie (timeline) a dá sa editovať v detaile záznamu.
-- Ostatné kategórie (vet visits, lieky, diéta, výdavky) už majú vlastné poznámkové polia.

alter table vaccinations add column if not exists note text;
alter table dewormings add column if not exists note text;
alter table ectoparasites add column if not exists note text;
