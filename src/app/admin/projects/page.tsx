import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../site-header";
import ProjectAdmin from "./project-admin";

export const metadata: Metadata = {
  title: "Manage Projects | Mayowa Philips Olusanjo",
  robots: { index: false, follow: false },
};

export default function ProjectAdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="experience-admin-page section-wrap">
        <span className="eyebrow">PORTFOLIO ADMIN</span>
        <h1>Manage projects.</h1>
        <p className="admin-intro">
          Add cover images, upload project files, and link GitHub, LinkedIn, or live apps before publishing.
        </p>
        <nav className="admin-section-nav" aria-label="Admin sections">
          <Link href="/admin/experience">Experience</Link>
          <Link href="/admin/projects" aria-current="page">Projects</Link>
          <Link href="/admin/skills">Skills</Link>
          <Link href="/admin/profile">Profile</Link>
          <Link href="/admin/cv">CV</Link>
        </nav>
        <ProjectAdmin />
      </section>
    </main>
  );
}
