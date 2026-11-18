import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../site-header";
import CvAdmin from "./cv-admin";

export const metadata: Metadata = {
  title: "Manage CV | Mayowa Philips Olusanjo",
  robots: { index: false, follow: false },
};

export default function CvAdminPage() {
  return (
    <main>
      <SiteHeader />
      <section className="experience-admin-page section-wrap">
        <span className="eyebrow">PORTFOLIO ADMIN</span>
        <h1>Manage CV.</h1>
        <p className="admin-intro">
          Upload a PDF that visitors can download from the header.
        </p>
        <nav className="admin-section-nav" aria-label="Admin sections">
          <Link href="/admin/experience">Experience</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/skills">Skills</Link>
          <Link href="/admin/profile">Profile</Link>
          <Link href="/admin/cv" aria-current="page">CV</Link>
        </nav>
        <CvAdmin />
      </section>
    </main>
  );
}
