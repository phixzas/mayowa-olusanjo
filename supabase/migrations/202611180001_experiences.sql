create table if not exists public.experience_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.experience_admins enable row level security;

create policy "Admins can view their own access"
  on public.experience_admins
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  organization text not null default '',
  description text not null check (length(trim(description)) > 0),
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experience_dates_are_valid
    check (
      (is_current and end_date is null)
      or (not is_current and end_date is not null and end_date >= start_date)
    )
);

create index if not exists experiences_display_order_start_date_idx
  on public.experiences (display_order, start_date desc);

create or replace function public.set_experience_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_experience_updated_at
  before update on public.experiences
  for each row
  execute function public.set_experience_updated_at();

alter table public.experiences enable row level security;

create policy "Anyone can view published experience"
  on public.experiences
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

create policy "Admins can manage experience"
  on public.experiences
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

grant select on public.experiences to anon, authenticated;
grant insert, update, delete on public.experiences to authenticated;
grant select on public.experience_admins to anon, authenticated;
