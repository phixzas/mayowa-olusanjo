alter table public.projects
  add column if not exists linkedin_url text;

alter table public.projects
  drop constraint if exists project_linkedin_url_is_web_url;

alter table public.projects
  add constraint project_linkedin_url_is_web_url
  check (linkedin_url is null or linkedin_url ~ '^https?://');
