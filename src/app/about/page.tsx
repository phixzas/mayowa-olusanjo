import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../site-header";
import ProfilePhoto from "../profile-photo";
import { modelingApproach, models } from "../portfolio-data";
import SkillsList from "../skills/skills-list";

export const metadata: Metadata = {
  title: "About Mayowa Philips Olusanjo | Data Scientist & Data Analyst",
  description:
    "Learn about Mayowa Philips Olusanjo, a Data Scientist and Data Analyst passionate about turning raw data into actionable business insights.",
};

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="about-page section-wrap">
        <Link className="text-link about-back-link" href="/#home">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <span className="eyebrow">ABOUT MAYOWA PHILIPS OLUSANJO</span>
        <div className="about-page-grid">
          <ProfilePhoto
            className="portrait-placeholder about-page-portrait"
            eager
          />
          <div className="about-page-copy">
            <h1>
              Hi, I&apos;m Mayowa
              <br />
              <em>Philips Olusanjo.</em>
            </h1>
            <p>
              I&apos;m a Data Scientist and Data Analyst specializing in
              analyzing data, machine learning, and predictive modeling. I turn
              messy data into useful insights and models that help businesses
              predict outcomes, reduce risk, and make better decisions.
            </p>
            <p>
              I build and deploy predictive models with Python, Scikit-learn,
              XGBoost, Pandas, and Streamlit—from loan approval to sports
              analytics. My work doesn&apos;t stop at the notebook: I deploy
              models as live apps people can use.
            </p>
            <p>
              My projects span data cleaning, exploratory data analysis,
              feature engineering, model comparison, and machine learning.
            </p>
            <p>
              I keep improving by building end-to-end projects and sharing my
              work on GitHub.
            </p>
            <p>
              I&apos;m open to internships, freelance
              opportunities, and full-time roles where I can use data to solve
              business problems.
            </p>
            <Link className="button button-dark about-upwork-link" href="/#contact">
              Contact me <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="skills-section about-page-skills">
        <div className="skills-inner section-wrap">
          <div>
            <span className="eyebrow">SKILLS &amp; TOOLKIT</span>
            <h2>My machine-learning<br />toolkit.</h2>
            <p className="about-stack-copy">
              I use these tools to take projects from raw data through analysis,
              modeling, and deployment.
            </p>
          </div>
          <SkillsList limit={4} />
          <Link className="text-link about-all-skills-link" href="/skills">
            View all skills <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="models-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MODELS I WORK WITH</span>
            <h2>Choose the right<br />model for the problem.</h2>
          </div>
          <p>
            I don&apos;t rely on a single algorithm. I compare approaches,
            tune them, and use cross-validation to select the best fit.
          </p>
        </div>
        <div className="model-grid">
          {models.map((model, index) => (
            <article className="model-card" key={model.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{model.name}</h3>
              <p>{model.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="approach-section">
        <div className="section-wrap">
          <span className="eyebrow">MY APPROACH</span>
          <h2>From raw data<br />to a live solution.</h2>
          <ol className="approach-list">
            {modelingApproach.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
          <p>
            I evaluate models with metrics that match the problem, then deploy
            the selected model so people can use its predictions.
          </p>
        </div>
      </section>

      <section className="about-page-contact section-wrap">
        <span className="eyebrow">LET&apos;S WORK TOGETHER</span>
        <h2>Have a data challenge?</h2>
        <Link className="button button-dark" href="/#contact">
          Get in touch <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <footer className="site-footer section-wrap">
        <Link className="wordmark" href="/#home">mo<span>.</span></Link>
        <span>© 2026 Mayowa Philips Olusanjo</span>
        <Link href="/#home">Back to top ↑</Link>
      </footer>
    </main>
  );
}
