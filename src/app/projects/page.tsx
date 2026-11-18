import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../site-header";
import ProjectList from "./project-list";

export const metadata: Metadata = {
  title: "Projects | Mayowa Philips Olusanjo",
  description:
    "Data analysis dashboards, data-science projects, GitHub code, and live applications by Mayowa Philips Olusanjo.",
};

export default function ProjectsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="projects-page section-wrap">
        <Link className="text-link projects-back-link" href="/#home">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className="section-heading">
          <div>
            <span className="eyebrow">DATA ANALYSIS · DATA SCIENCE</span>
            <h1>Projects built<br />to be explored.</h1>
          </div>
          <p>
            Explore dashboard PDFs, source code, and live apps. Dashboard
            reports are uploaded as documents, not screenshots.
          </p>
        </div>
        <ProjectList />
      </section>
      <footer className="site-footer section-wrap">
        <Link className="wordmark" href="/#home">mo<span>.</span></Link>
        <span>© 2026 Mayowa Philips Olusanjo</span>
        <Link href="/#home">Back to top ↑</Link>
      </footer>
    </main>
  );
}
