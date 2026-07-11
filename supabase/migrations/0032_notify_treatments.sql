-- AnimalPassport — pripomienky pre „Liečba" (treatments.next_due_date).
-- Pridá per-user preferenciu notify_treatments (default zapnuté).
-- Vyžaduje 0005_notifications.sql a 0031_treatments.sql.

alter table notification_preferences
  add column if not exists notify_treatments boolean not null default true;
