create table if not exists public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  tools text[] not null default '{}'
    check (cardinality(tools) > 0),
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_categories_display_order_title_idx
  on public.skill_categories (display_order, title);

create trigger set_skill_categories_updated_at
  before update on public.skill_categories
  for each row
  execute function public.set_experience_updated_at();

alter table public.skill_categories enable row level security;

create policy "Anyone can view published skill categories"
  on public.skill_categories
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

create policy "Admins can manage skill categories"
  on public.skill_categories
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

grant select on public.skill_categories to anon, authenticated;
grant insert, update, delete on public.skill_categories to authenticated;
