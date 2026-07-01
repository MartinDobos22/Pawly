-- AnimalPassport — verejný bucket pre titulné obrázky článkov poradne.
-- Obrázky sú nízko-citlivé a renderujú sa priamo ako <img src> na verejných
-- stránkach → PUBLIC bucket, aby uložená public URL fungovala bez signed-URL.
-- Cesty: `articles/<uuid>.<ext>`. Upload len server-side cez service_role
-- (žiadna anon insert policy) → verejný prístup je read-only-by-URL.
-- Vzor: 0013_pet_photos_storage.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
