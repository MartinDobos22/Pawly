-- AnimalPassport — priebeh stavu zdravotnej epizódy (status updates)
-- Časová os aktualizácií v rámci jednej epizódy (dátum + poznámka + voliteľná zmena stavu).
-- Uložené ako JSONB pole na health_episodes (rovnaký vzor ako attachments) — priebeh sa
-- vždy načíta/uloží spolu s epizódou. Žiadna nová tabuľka, žiadna zmena health RPC allowlistu
-- (0006/0031) ani GDPR exportu (0008/0016) — health_episodes tam už je. Vyžaduje 0002.

alter table health_episodes
  add column if not exists status_updates jsonb not null default '[]';
