# Mayowa Philips Olusanjo — Portfolio

A responsive Next.js portfolio focused on Mayowa Philips Olusanjo's data-analysis and data-science work, predictive models, live apps, and machine-learning approach.

The homepage includes short About and Experience previews. Visit `/about` for the full biography and `/experience` for the career timeline.
Projects are managed at `/admin/projects` and displayed at `/projects`. Each project can include a cover image, a dashboard PDF, downloadable files, and links to GitHub, LinkedIn, or a live app.
Skills are displayed at `/skills` and managed by category at `/admin/skills`; each category can contain as many tools as needed.
Contact links are displayed at `/contact` and configured in `src/app/contact/page.tsx`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to GitHub Pages

The `main` branch deploys automatically to
`https://phixzas.github.io/mayowa-olusanjo/` using a static Next.js export.
In the GitHub repository, open **Settings → Pages** and set **Build and
deployment → Source** to **GitHub Actions**. The workflow builds with the
public Supabase URL and publishable key from `.env.example`; do not add a
service-role key there.

The admin pages remain browser-based and use Supabase. Sign in at
`https://phixzas.github.io/mayowa-olusanjo/admin/experience/` after deployment.

## Personalize the portfolio

- Update project descriptions, tools, and modeling details in `src/app/portfolio-data.ts`.
- Upload or replace your profile photo at `/admin/profile`; it appears on the homepage and About page.
- Upload or replace your CV at `/admin/cv`; the header's download button serves the uploaded PDF.
- Add your Streamlit app URL to the relevant project and contact links.

## Experience admin setup

Experience entries are stored in Supabase and can be managed at `/admin/experience`.
The admin form supports role title, organization, description, start/end dates,
current-role status, display order, and draft/published visibility. The public
experience page calculates the duration for each role from its dates.

1. Create a Supabase project and run these migrations in order in the Supabase SQL Editor:
   - `supabase/migrations/202611180001_experiences.sql`
   - `supabase/migrations/202611180002_projects.sql`
   - `supabase/migrations/202611180003_skill_categories.sql`
   - `supabase/migrations/202611180004_profile_photos.sql`
   - `supabase/migrations/202611180005_cv_documents.sql`
   - `supabase/migrations/202611180006_project_uploads.sql`
   - `supabase/migrations/202611180007_project_linkedin_url.sql`
   - `supabase/migrations/202611180008_default_project_linkedin_url.sql`
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` using your project URL and public anon/publishable key.
   Never put a Supabase service-role key in the Next.js app.
3. In Supabase Authentication, create an admin user with email and password.
   Copy that user's ID from the Users page and add it in the SQL Editor:

   ```sql
   insert into public.experience_admins (user_id)
   values ('YOUR-AUTH-USER-UUID');
   ```

4. Restart the dev server, then sign in at `/admin/experience`.

Row-level security limits edits to user IDs explicitly added to
`experience_admins`; visitors can only read published entries.
The same admin account can manage projects at `/admin/projects`. Project cover
images support JPG, PNG, and WebP. Downloadable project files support ZIP,
common code and notebook formats, CSV/Excel, PDF, and common text documents.
Uploads are limited to 150 MB per file and are public on published projects;
only authorized admins can upload or remove them. Supabase Free has a 50 MB
global file-size limit, so 150 MB uploads require a plan that supports that
limit and a matching **Storage → Global file size limit** setting. The project
dashboard PDF remains separately viewable on the project card. Add GitHub,
LinkedIn, and live app/dashboard URLs for source repositories, related posts,
and interactive demos. Existing and new projects default to the portfolio's
LinkedIn profile link; you can replace it with a project-specific LinkedIn URL.
The same admin account can manage skill categories at `/admin/skills`. Enter one
tool per line; published categories appear on both the homepage and About page.
The same admin account can upload or replace the profile photo at `/admin/profile`.
Profile photos are stored in the public `profile-photos` bucket; only authorized
admins can upload or replace the image. CV PDFs are managed separately at
`/admin/cv` and stored in the public `cv-documents` bucket; clicking the header's
download button downloads the uploaded file.

## Validate and build

```bash
npm run lint
npm run build
```
