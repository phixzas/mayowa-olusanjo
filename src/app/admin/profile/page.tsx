import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../site-header";
import ProfileAdmin from "./profile-admin";

export const metadata: Metadata = {
  title: "Manage Profile Photo | Mayowa Philips Olusanjo",
  robots: { index: false, follow: false },
};

export default function ProfileAdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="experience-admin-page section-wrap">
        <span className="eyebrow">PORTFOLIO ADMIN</span>
        <h1>Manage profile photo.</h1>
        <p className="admin-intro">
          Upload or replace the photo shown on the homepage and About page.
        </p>
        <nav className="admin-section-nav" aria-label="Admin sections">
          <Link href="/admin/experience">Experience</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/skills">Skills</Link>
          <Link href="/admin/profile" aria-current="page">Profile</Link>
          <Link href="/admin/cv">CV</Link>
        </nav>
        <ProfileAdmin />
      </section>
    </main>
  );
}
