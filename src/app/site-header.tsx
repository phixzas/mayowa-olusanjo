import Link from "next/link";

const cvUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/cv-documents/mayowa-cv.pdf?download=Mayowa-Philips-Olusanjo-CV.pdf`
  : "/mayowa-olusanjo-cv.pdf";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/#home" aria-label="Mayowa Philips Olusanjo, home">
        mo<span>.</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/#home">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/experience">Experience</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/skills">Skills</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <a
        className="cv-link"
        href={cvUrl}
        download="Mayowa-Philips-Olusanjo-CV.pdf"
        aria-label="Download CV"
      >
        <span className="cv-label">CV</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.75v8.5m0 0 3-3m-3 3-3-3M2.5 10.75v2.5h11v-2.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </a>
    </header>
  );
}
