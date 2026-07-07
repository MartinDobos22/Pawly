-- AnimalPassport — zdroj/kredit titulného obrázka článku
-- Pridáva cover_credit (napr. „Zdroj: Unsplash / Jane Doe") zobrazený ako
-- popisok pod obrázkom v hlavičke článku. Voliteľné pole. Vyžaduje 0018 (articles).

alter table articles add column if not exists cover_credit text;
