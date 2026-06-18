-- Voľný text pre druh zvieraťa keď animal_type = 'other' ('Iné zviera').
-- Frontend ho vyžaduje (povinné pole), AI ho používa na presné vyhodnotenie podľa druhu.

alter table pets add column if not exists custom_species text;
