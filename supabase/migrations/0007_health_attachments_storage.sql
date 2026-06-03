-- Health attachments are stored as private Supabase Storage objects.
-- Health-record JSONB attachments keep only metadata references:
-- objectPath, mimeType, size, caption, createdAt.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'health-attachments',
  'health-attachments',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function app_sanitize_health_attachments(value jsonb)
returns jsonb
language sql
immutable
as $$
  select coalesce(
    (
      select jsonb_agg(
        jsonb_strip_nulls(
          jsonb_build_object(
            'objectPath', item->>'objectPath',
            'mimeType', item->>'mimeType',
            'size', nullif(item->>'size', '')::integer,
            'caption', coalesce(item->>'caption', item->>'label'),
            'createdAt', item->>'createdAt'
          )
        )
      )
      from jsonb_array_elements(case when jsonb_typeof(value) = 'array' then value else '[]'::jsonb end) as item
      where item ? 'objectPath'
    ),
    '[]'::jsonb
  );
$$;

update vaccinations set attachments = app_sanitize_health_attachments(attachments);
update dewormings set attachments = app_sanitize_health_attachments(attachments);
update ectoparasites set attachments = app_sanitize_health_attachments(attachments);
update vet_visits set attachments = app_sanitize_health_attachments(attachments);
update health_episodes set attachments = app_sanitize_health_attachments(attachments);

alter table vaccinations
  drop constraint if exists vaccinations_attachments_metadata_only,
  add constraint vaccinations_attachments_metadata_only check (attachments = app_sanitize_health_attachments(attachments));
alter table dewormings
  drop constraint if exists dewormings_attachments_metadata_only,
  add constraint dewormings_attachments_metadata_only check (attachments = app_sanitize_health_attachments(attachments));
alter table ectoparasites
  drop constraint if exists ectoparasites_attachments_metadata_only,
  add constraint ectoparasites_attachments_metadata_only check (attachments = app_sanitize_health_attachments(attachments));
alter table vet_visits
  drop constraint if exists vet_visits_attachments_metadata_only,
  add constraint vet_visits_attachments_metadata_only check (attachments = app_sanitize_health_attachments(attachments));
alter table health_episodes
  drop constraint if exists health_episodes_attachments_metadata_only,
  add constraint health_episodes_attachments_metadata_only check (attachments = app_sanitize_health_attachments(attachments));
