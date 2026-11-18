alter table public.projects
  add column if not exists linkedin_url text;

alter table public.projects
  drop constraint if exists project_linkedin_url_is_web_url;

alter table public.projects
  add constraint project_linkedin_url_is_web_url
  check (linkedin_url is null or linkedin_url ~ '^https?://');

alter table public.projects
  alter column linkedin_url
  set default 'https://www.linkedin.com/in/mayowa-philips-olusanjo-982663152';

update public.projects
set linkedin_url = 'https://www.linkedin.com/in/mayowa-philips-olusanjo-982663152'
where linkedin_url is null;

notify pgrst, 'reload schema';
