insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'cv-documents',
  'cv-documents',
  true,
  20971520,
  array['application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view CV documents" on storage.objects;
drop policy if exists "Admins can upload CV documents" on storage.objects;
drop policy if exists "Admins can replace CV documents" on storage.objects;

create policy "Anyone can view CV documents"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cv-documents');

create policy "Admins can upload CV documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cv-documents'
    and name = 'mayowa-cv.pdf'
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );

create policy "Admins can replace CV documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'cv-documents'
    and name = 'mayowa-cv.pdf'
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'cv-documents'
    and name = 'mayowa-cv.pdf'
    and exists (
      select 1
      from public.experience_admins
      where user_id = (select auth.uid())
    )
  );
