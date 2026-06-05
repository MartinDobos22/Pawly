-- AnimalPassport — per-user locale pre lokalizované e-maily (pripomienky termínov)
-- Default 'sk' pre existujúcich používateľov. ensureUser middleware nastaví hodnotu pri prvom volaní
-- (z Accept-Language hlavičky, ak ešte locale nemá hodnotu odlišnú od defaultu).

alter table users
  add column if not exists locale text not null default 'sk'
    check (locale in ('sk', 'en'));
