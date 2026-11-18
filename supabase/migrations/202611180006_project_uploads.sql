insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-dashboards',
  'project-dashboards',
  true,
  157286400,
  array['application/pdf']
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-assets',
  'project-assets',
  true,
  157286400,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'text/x-python',
    'application/json',
    'text/javascript',
    'text/plain',
    'text/html',
    'text/css',
    'text/csv',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.projects
  add column if not exists cover_image_path text;

create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique
    check (storage_path ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\.[a-z0-9]+$'),
  file_name text not null check (length(trim(file_name)) > 0),
  content_type text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_assets_project_order_idx
  on public.project_assets (project_id, display_order, created_at);

alter table public.project_assets enable row level security;

drop policy if exists "Anyone can view assets for published projects"
  on public.project_assets;
create policy "Anyone can view assets for published projects"
  on public.project_assets
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects
      where id = project_id
        and (
          is_published
          or exists (
            select 1
            from public.experience_admins
            where user_id = (select auth.uid())
          )
        )
    )
  );

drop policy if exists "Admins can manage project assets"
  on public.project_assets;
create policy "Admins can manage project assets"
  on public.project_assets
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

grant select on public.project_assets to anon, authenticated;
grant insert, update, delete on public.project_assets to authenticated;

drop policy if exists "Anyone can view project assets"
  on storage.objects;
create policy "Anyone can view project assets"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-assets');

drop policy if exists "Admins can upload project assets"
  on storage.objects;
create policy "Admins can upload project assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can update project assets"
  on storage.objects;
create policy "Admins can update project assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can delete project assets"
  on storage.objects;
create policy "Admins can delete project assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );
