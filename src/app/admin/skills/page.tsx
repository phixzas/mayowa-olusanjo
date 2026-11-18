import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../site-header";
import SkillsAdmin from "./skills-admin";

export const metadata: Metadata = {
  title: "Manage Skills | Mayowa Philips Olusanjo",
  robots: { index: false, follow: false },
};

export default function SkillsAdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="experience-admin-page section-wrap">
        <span className="eyebrow">PORTFOLIO ADMIN</span>
        <h1>Manage skills.</h1>
        <p className="admin-intro">
          Create skill categories and add as many tools as you need under each one.
        </p>
        <nav className="admin-section-nav" aria-label="Admin sections">
          <Link href="/admin/experience">Experience</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/skills" aria-current="page">Skills</Link>
          <Link href="/admin/profile">Profile</Link>
          <Link href="/admin/cv">CV</Link>
        </nav>
        <SkillsAdmin />
      </section>
    </main>
  );
}
