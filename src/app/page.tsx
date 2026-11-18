import Link from "next/link";
import SiteHeader from "./site-header";
import ProfilePhoto from "./profile-photo";
import ProjectList from "./projects/project-list";
import SkillsList from "./skills/skills-list";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="availability">
            <span />
            DATA SCIENTIST · DATA ANALYST · MACHINE LEARNING &amp; PREDICTIVE MODELING
          </div>
          <h1>
            Hi, I&apos;m Mayowa
            <br />
            <span>Philips Olusanjo.</span>
          </h1>
          <p className="hero-description">
            I analyze messy data to uncover useful insights, then build
            predictive models businesses can actually use. From loan approval
            to sports analytics, I build and deploy practical machine-learning
            solutions.
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="#projects">
              View my projects <span aria-hidden="true">↓</span>
            </a>
            <Link className="text-link" href="/contact">
              Contact me <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="hero-note">
            <span>FROM NOTEBOOK TO LIVE APP</span>
            <strong>I build models people can use</strong>
          </div>
        </div>

        <div className="hero-art" aria-label="Decorative data visualization">
          <div className="hero-art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-orb">
            <div className="orb-ring" />
            <div className="orb-core">MO</div>
          </div>
          <div className="floating-card floating-card-top">
            <span className="card-kicker">INSIGHT OF THE DAY</span>
            <strong>Clarity creates<br />better decisions.</strong>
            <span className="card-sparkline">⌁⌁⌁⌁⌁</span>
          </div>
          <div className="floating-card floating-card-bottom">
            <span className="mini-icon">↗</span>
            <div>
              <span className="card-kicker">GROWTH, MADE VISIBLE</span>
              <strong>Data with direction</strong>
            </div>
          </div>
          <span className="art-caption">CURIOUS BY NATURE · PRECISE BY DESIGN</span>
        </div>
      </section>

      <section className="stats-strip section-wrap" aria-label="At a glance">
        <div className="stat">
          <strong>End to end</strong>
          <span>From raw data to deployed models</span>
        </div>
        <div className="stat">
          <strong>Model choice</strong>
          <span>Compare, tune, and evaluate</span>
        </div>
        <div className="stat stat-note">
          <strong>Built to use</strong>
          <span>Practical predictions, not just notebooks</span>
        </div>
      </section>

      <section className="about-section about-preview" id="about">
        <div className="about-inner section-wrap">
          <div className="about-label">
            <span className="eyebrow">DATA SCIENTIST · DATA ANALYST · PREDICTIVE MODELING</span>
            <ProfilePhoto className="portrait-placeholder" />
          </div>
          <div className="about-copy">
            <h2>I turn messy data<br />into models with<br /><em>real-world value.</em></h2>
            <p>
              I build end-to-end machine-learning projects, from data preparation
              and model evaluation to deployment as usable apps.
            </p>
            <Link className="text-link" href="/about">
              Read more about me <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="experience-section section-wrap" id="experience">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPERIENCE</span>
            <h2>My professional<br />experience.</h2>
          </div>
          <p>
            Explore my roles, responsibilities, and the time spent in each
            experience.
          </p>
        </div>
        <Link className="experience-preview-link" href="/experience">
          <span>View experience and role durations</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section className="work-section section-wrap" id="projects">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELECTED MACHINE-LEARNING PROJECTS</span>
            <h2>Models built<br />to be useful.</h2>
          </div>
          <p>
            Browse data-analysis dashboards, machine-learning projects, source
            code, and live applications.
          </p>
        </div>
        <ProjectList limit={4} />
        <div className="projects-all-link">
          <Link className="button button-dark" href="/projects">
            Explore all projects <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="skills-section" id="skills">
        <div className="skills-inner section-wrap">
          <div>
            <span className="eyebrow">SKILLS &amp; TOOLKIT</span>
            <h2>Tools for<br />the whole journey.</h2>
            <p className="skills-preview-copy">
              Explore the tools I use for analysis, machine learning, and deployment.
            </p>
          </div>
          <SkillsList limit={4} />
        </div>
        <div className="skills-all-link section-wrap">
          <Link className="text-link" href="/skills">
            View all skills <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="contact-section section-wrap" id="contact">
        <span className="eyebrow">HAVE A QUESTION OR A PROJECT?</span>
        <h2>Let&apos;s make<br /><span>something clear.</span></h2>
        <p>
          I&apos;m open to freelance opportunities,
          internships, and full-time roles.
        </p>
        <Link className="button button-light" href="/contact">
          Contact me <span aria-hidden="true">↗</span>
        </Link>
        <span className="contact-orbit contact-orbit-one" />
        <span className="contact-orbit contact-orbit-two" />
      </section>

      <footer className="site-footer section-wrap">
        <a className="wordmark" href="#home">mo<span>.</span></a>
        <span>© 2026 Mayowa Philips Olusanjo</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}
