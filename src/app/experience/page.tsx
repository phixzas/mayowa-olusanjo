import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../site-header";
import ExperienceList from "./experience-list";

export const metadata: Metadata = {
  title: "Experience | Mayowa Philips Olusanjo",
  description:
    "Professional experience, role details, and time in each role for Mayowa Philips Olusanjo.",
};

export default function ExperiencePage() {
  return (
    <main>
      <SiteHeader />
      <section className="experience-page section-wrap">
        <Link className="text-link experience-back-link" href="/#home">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className="section-heading">
          <div>
            <span className="eyebrow">CAREER HISTORY</span>
            <h1>Experience<br />that adds up.</h1>
          </div>
          <p>
            A selection of roles and projects, with the time spent in each
            calculated from the dates.
          </p>
        </div>
        <a
          className="text-link experience-linkedin"
          href="https://www.linkedin.com/in/mayowa-philips-olusanjo-982663152"
          target="_blank"
          rel="noreferrer"
        >
          View my LinkedIn profile <span aria-hidden="true">↗</span>
        </a>
        <ExperienceList />
      </section>
      <section className="experience-page-contact">
        <div className="section-wrap">
          <span className="eyebrow">LET&apos;S CONNECT</span>
          <h2>Have an opportunity in mind?</h2>
          <Link className="button button-dark" href="/#contact">
            Get in touch <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <footer className="site-footer section-wrap">
        <Link className="wordmark" href="/#home">mo<span>.</span></Link>
        <span>© 2026 Mayowa Philips Olusanjo</span>
        <Link href="/#home">Back to top ↑</Link>
      </footer>
    </main>
  );
}
