import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../site-header";
import SkillsList from "./skills-list";

export const metadata: Metadata = {
  title: "Skills | Mayowa Philips Olusanjo",
  description:
    "Explore Mayowa Philips Olusanjo's data analysis, machine learning, and development tools.",
};

export default function SkillsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="skills-page section-wrap">
        <Link className="text-link skills-back-link" href="/#home">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className="section-heading">
          <div>
            <span className="eyebrow">MY TOOLKIT</span>
            <h1>Skills for turning<br />data into decisions.</h1>
          </div>
          <p>
            Tools and technologies I use across data analysis, visualization,
            machine learning, and deployment.
          </p>
        </div>
        <SkillsList />
      </section>
      <footer className="site-footer section-wrap">
        <Link className="wordmark" href="/#home">mo<span>.</span></Link>
        <span>© 2026 Mayowa Philips Olusanjo</span>
        <Link href="/#home">Back to top ↑</Link>
      </footer>
    </main>
  );
}
