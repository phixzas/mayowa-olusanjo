import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../site-header";

export const metadata: Metadata = {
  title: "Contact Mayowa Philips Olusanjo",
  description:
    "Contact Mayowa Philips Olusanjo about data analysis, data science, machine learning, and freelance opportunities.",
};

const contactMethods = [
  {
    number: "01",
    name: "WhatsApp",
    icon: "whatsapp",
    detail: "Send me a message about a project or opportunity.",
    href: "https://wa.me/2348122197072",
    action: "Message me on WhatsApp",
  },
  {
    number: "02",
    name: "GitHub",
    icon: "github",
    detail: "Explore my code, data-analysis dashboards, and data-science projects.",
    href: "https://github.com/phixzas",
    action: "Visit GitHub",
  },
  {
    number: "03",
    name: "LinkedIn",
    icon: "linkedin",
    detail: "Connect with me professionally.",
    href: "https://www.linkedin.com/in/mayowa-philips-olusanjo-982663152",
    action: "Connect on LinkedIn",
  },
  {
    number: "04",
    name: "Email",
    icon: "email",
    detail: "Send me an email and I’ll get back to you.",
    href: "mailto:olusanjomayowaphilips@gmail.com",
    action: "olusanjomayowaphilips@gmail.com",
  },
];

type ContactIconName = (typeof contactMethods)[number]["icon"];

function ContactIcon({ name }: { name: ContactIconName }) {
  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <path d="M24 5a18 18 0 0 0-15.4 27.3L6 42l10-2.5A18 18 0 1 0 24 5Z" />
        <path d="M18 16.5c.5-.8 1-.8 1.5-.8h1c.3 0 .7.2.9.7l1.5 3.5c.2.4.1.8-.2 1.1l-1.2 1.4c-.3.3-.4.6-.1 1 1 1.7 2.4 3 4.1 3.9.4.2.7.2 1-.2l1.4-1.7c.3-.4.7-.4 1.1-.2l3.3 1.6c.5.2.7.5.7.9 0 .7-.4 2.3-1.4 3.2-1 .9-2.4 1.4-4 1.1-1.5-.3-4.2-1.3-6.8-3.6-2.2-1.9-3.7-4.3-4.1-5.8-.5-1.5-.1-3.3.6-4.2.2-.4.4-.7.7-1Z" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <path d="M24 5a19 19 0 0 0-6 37c1 .2 1.3-.4 1.3-.9v-3.3c-5.4 1.2-6.5-2.3-6.5-2.3-.9-2.2-2.1-2.8-2.1-2.8-1.8-1.2.1-1.2.1-1.2 2 .1 3.1 2.1 3.1 2.1 1.8 3.1 4.7 2.2 5.8 1.7.2-1.3.7-2.2 1.3-2.7-4.3-.5-8.8-2.2-8.8-9.5 0-2.1.7-3.8 2-5.2-.2-.5-.9-2.5.2-5.2 0 0 1.6-.5 5.3 2a18.4 18.4 0 0 1 9.6 0c3.7-2.5 5.3-2 5.3-2 1.1 2.7.4 4.7.2 5.2 1.3 1.4 2 3.1 2 5.2 0 7.3-4.5 9-8.8 9.5.7.6 1.3 1.7 1.3 3.4v5c0 .5.3 1.1 1.3.9A19 19 0 0 0 24 5Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <rect x="7" y="7" width="34" height="34" rx="4" />
        <path d="M15 20v13M15 15.5v.1M22 33v-7.5c0-3.1 6-3.4 6 0V33M22 20v13" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <rect x="6" y="10" width="36" height="28" rx="3" />
      <path d="m8 13 16 13 16-13" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <section className="contact-page section-wrap">
        <Link className="text-link contact-back-link" href="/#home">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className="section-heading">
          <div>
            <span className="eyebrow">GET IN TOUCH</span>
            <h1>Let&apos;s start<br />a conversation.</h1>
          </div>
          <p>
            Interested in working together? Reach out about data analysis,
            data science, machine learning, freelance projects, or full-time
            opportunities.
          </p>
        </div>

        <div className="contact-method-grid">
          {contactMethods.map((method) => {
            const content = (
              <>
                <span className="contact-method-number">{method.number}</span>
                <span className={`contact-method-icon contact-method-icon--${method.icon}`}>
                  <ContactIcon name={method.icon} />
                </span>
                <h2>{method.name}</h2>
                <p>{method.detail}</p>
                <span className={method.href ? "contact-method-action" : "contact-method-action contact-method-action--pending"}>
                  {method.action}
                  {method.href && <span aria-hidden="true"> ↗</span>}
                </span>
              </>
            );

            return method.href ? (
              <a
                className="contact-method-card"
                href={method.href}
                key={method.name}
                target={method.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={method.href.startsWith("mailto:") ? undefined : "noreferrer"}
              >
                {content}
              </a>
            ) : (
              <article className="contact-method-card contact-method-card--pending" key={method.name}>
                {content}
              </article>
            );
          })}
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
