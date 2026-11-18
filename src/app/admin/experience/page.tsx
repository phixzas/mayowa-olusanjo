import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../site-header";
import ExperienceAdmin from "./experience-admin";

export const metadata: Metadata = {
  title: "Manage Experience | Mayowa Philips Olusanjo",
  robots: { index: false, follow: false },
};

export default function ExperienceAdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="experience-admin-page section-wrap">
        <span className="eyebrow">PORTFOLIO ADMIN</span>
        <h1>Manage experience.</h1>
        <p className="admin-intro">
          Add, update, publish, and remove experience cards.
        </p>
        <nav className="admin-section-nav" aria-label="Admin sections">
          <Link href="/admin/experience" aria-current="page">Experience</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/skills">Skills</Link>
          <Link href="/admin/profile">Profile</Link>
          <Link href="/admin/cv">CV</Link>
        </nav>
        <ExperienceAdmin />
      </section>
    </main>
  );
}
