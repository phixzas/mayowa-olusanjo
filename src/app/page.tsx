const projects = [
  {
    number: "01",
    category: "BUSINESS INTELLIGENCE",
    title: "Sales performance dashboard",
    description:
      "A clear view of revenue, orders, and product trends to help teams make faster decisions.",
    tools: ["Power BI", "SQL", "DAX"],
    visual: "sales",
  },
  {
    number: "02",
    category: "DATA SCIENCE",
    title: "Customer churn analysis",
    description:
      "Exploring customer behavior and surfacing the signals that can help reduce churn.",
    tools: ["Python", "Pandas", "Scikit-learn"],
    visual: "churn",
  },
  {
    number: "03",
    category: "ANALYTICS",
    title: "Product insights report",
    description:
      "An interactive exploration of user engagement, retention, and product growth.",
    tools: ["Python", "SQL", "Tableau"],
    visual: "product",
  },
];

function DashboardPreview({ type }: { type: string }) {
  return (
    <div className={`project-visual project-visual--${type}`} aria-hidden="true">
      <div className="visual-topbar">
        <span />
        <span />
        <span />
        <div />
      </div>
      <div className="visual-content">
        <div className="visual-heading">
          <span />
          <span />
        </div>
        <div className="visual-metrics">
          <span />
          <span />
          <span />
        </div>
        <div className="visual-chart">
          <div className="chart-y-axis">
            <i />
            <i />
            <i />
            <i />
          </div>
          <svg viewBox="0 0 320 100" preserveAspectRatio="none">
            <path className="chart-area" d="M0 80 C28 72 37 83 63 58 S101 66 128 43 S166 54 192 30 S234 43 258 18 S291 27 320 4 V100 H0Z" />
            <path className="chart-line" d="M0 80 C28 72 37 83 63 58 S101 66 128 43 S166 54 192 30 S234 43 258 18 S291 27 320 4" />
          </svg>
        </div>
        <div className="visual-footer">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Mayowa Olusanjo, home">
          mo<span>.</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-link" href="#contact">
          Let&apos;s talk <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="availability">
            <span />
            DATA ANALYST &amp; DATA SCIENTIST
          </div>
          <h1>
            Making data
            <br />
            <span>make sense.</span>
          </h1>
          <p className="hero-description">
            I&apos;m Mayowa Olusanjo, a data professional turning complex
            questions into thoughtful analysis, useful dashboards, and
            confident decisions.
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="#work">
              Explore my work <span aria-hidden="true">↓</span>
            </a>
            <a className="text-link" href="#about">
              More about me <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-note">
            <span>BASED IN</span>
            <strong>Building insights, wherever you are</strong>
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
          <strong>3<span>+</span></strong>
          <span>Years of professional experience</span>
        </div>
        <div className="stat">
          <strong>—</strong>
          <span>Live App Store apps · add your count</span>
        </div>
        <div className="stat stat-note">
          <strong>—</strong>
          <span>GitHub stars · add your count</span>
        </div>
      </section>

      <section className="work-section section-wrap" id="work">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELECTED WORK · 2022—2025</span>
            <h2>Ideas, explored<br />through data.</h2>
          </div>
          <p>
            A selection of dashboards and data projects. Each one starts with
            a question and ends with a clearer picture.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number}>
              <DashboardPreview type={project.visual} />
              <div className="project-details">
                <div className="project-meta">
                  <span>{project.category}</span>
                  <span>{project.number}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tool-list">
                  {project.tools.map((tool) => <span key={tool}>{tool}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="projects-note">
          Project previews are sample layouts—replace them with your live dashboards and case studies.
        </p>
      </section>

      <section className="about-section" id="about">
        <div className="about-inner section-wrap">
          <div className="about-label">
            <span className="eyebrow">A LITTLE ABOUT ME</span>
            <div className="portrait-placeholder" aria-label="Photo placeholder">
              <span>MO</span>
              <small>YOUR PHOTO</small>
            </div>
          </div>
          <div className="about-copy">
            <h2>Good data work is<br />equal parts <em>rigor</em><br />and curiosity.</h2>
            <p>
              For the past three years, I&apos;ve been working with data to
              answer real-world questions. I enjoy the full process: getting
              the data into shape, finding the story inside it, and presenting
              the result in a way people can actually use.
            </p>
            <p>
              My toolkit spans analysis, visualization, and machine learning.
              I&apos;m always learning, asking better questions, and looking
              for the signal in the noise.
            </p>
            <a className="text-link" href="#contact">
              Get to know me <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="about-skills">
            <span className="eyebrow">WHAT I WORK WITH</span>
            <div><span>01</span> Data analysis</div>
            <div><span>02</span> Dashboards &amp; BI</div>
            <div><span>03</span> Python &amp; SQL</div>
            <div><span>04</span> Machine learning</div>
            <div><span>05</span> Data storytelling</div>
          </div>
        </div>
      </section>

      <section className="contact-section section-wrap" id="contact">
        <span className="eyebrow">HAVE A QUESTION OR A PROJECT?</span>
        <h2>Let&apos;s make<br /><span>something clear.</span></h2>
        <p>I&apos;m open to data roles and interesting collaborations.</p>
        <a className="button button-light" href="mailto:your-email@example.com">
          Get in touch <span aria-hidden="true">↗</span>
        </a>
        <span className="contact-orbit contact-orbit-one" />
        <span className="contact-orbit contact-orbit-two" />
      </section>

      <footer className="site-footer section-wrap">
        <a className="wordmark" href="#home">mo<span>.</span></a>
        <span>© {new Date().getFullYear()} Mayowa Olusanjo</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}
