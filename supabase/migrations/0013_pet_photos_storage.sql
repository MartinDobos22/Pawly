-- Pet avatar photos are low-sensitivity and are rendered directly as <img src> in
-- several places (dashboard hero, profile list, vet card). They live in a PUBLIC
-- bucket so the stored public URL works everywhere without signed-URL plumbing.
-- Object paths are user-scoped with random UUIDs (`<appUserId>/<uuid>.jpg`); uploads
-- only happen server-side via the service_role key (no anon insert policy), so the
-- public access is read-only-by-URL.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos',
  'pet-photos',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
