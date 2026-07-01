-- AnimalPassport — alt text titulného obrázka článku
-- Pridáva cover_alt pre prístupnosť a og:image:alt. Pri publikovaní je povinný
-- (validácia v articleValidation.ts). Vyžaduje 0018 (articles).

alter table articles add column if not exists cover_alt text;
