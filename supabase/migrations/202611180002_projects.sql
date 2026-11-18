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
  52428800,
  array['application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view project dashboard PDFs"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-dashboards');

create policy "Admins can upload their project dashboard PDFs"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-dashboards'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

create policy "Admins can update their project dashboard PDFs"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-dashboards'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'project-dashboards'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

create policy "Admins can delete their project dashboard PDFs"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-dashboards'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text not null check (length(trim(description)) > 0),
  project_type text not null check (project_type in ('data_analysis', 'data_science')),
  tools text[] not null default '{}',
  dashboard_path text,
  github_url text,
  live_url text,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_dashboard_path_is_scoped
    check (
      dashboard_path is null
      or dashboard_path ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\.pdf$'
    ),
  constraint project_github_url_is_web_url
    check (github_url is null or github_url ~ '^https?://'),
  constraint project_live_url_is_web_url
    check (live_url is null or live_url ~ '^https?://')
);

create index if not exists projects_display_order_created_at_idx
  on public.projects (display_order, created_at desc);

create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_experience_updated_at();

alter table public.projects enable row level security;

create policy "Anyone can view published projects"
  on public.projects
  for select
  to anon, authenticated
  using (
    is_published
    or exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

create policy "Admins can manage projects"
  on public.projects
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

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
