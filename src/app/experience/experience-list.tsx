"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../supabase";
import { formatExperienceDate, formatExperienceDuration } from "./experience-utils";
import type { Experience } from "./types";

export default function ExperienceList() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = Boolean(supabase);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      return;
    }

    const client = supabase;
    async function loadExperiences() {
      const { data, error: queryError } = await client
        .from("experiences")
        .select(
          "id, title, organization, description, start_date, end_date, is_current, is_published, display_order",
        )
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("start_date", { ascending: false });

      if (!active) {
        return;
      }

      if (queryError) {
        setError(`Could not load experience entries: ${queryError.message}`);
      } else {
        setExperiences(data as Experience[]);
      }

      setLoading(false);
    }

    void loadExperiences();

    return () => {
      active = false;
    };
  }, [supabase]);

  if (loading) {
    return <p className="experience-state">Loading experience…</p>;
  }

  if (!configured) {
    return (
      <p className="experience-state">
        Experience entries will appear here after the portfolio database is configured.
      </p>
    );
  }

  if (error) {
    return <p className="experience-state experience-state--error">{error}</p>;
  }

  if (experiences.length === 0) {
    return (
      <p className="experience-state">
        Experience details are being prepared. In the meantime, you can{" "}
        <a
          href="https://www.linkedin.com/in/mayowa-philips-olusanjo-982663152"
          target="_blank"
          rel="noreferrer"
        >
          view my LinkedIn profile
        </a>
        .
      </p>
    );
  }

  return (
    <div className="experience-list">
      {experiences.map((experience) => (
        <article className="experience-card" key={experience.id}>
          <div className="experience-card-duration">
            <span>{formatExperienceDuration(experience)}</span>
            <small>
              {formatExperienceDate(experience.start_date)} –{" "}
              {experience.is_current || !experience.end_date
                ? "Present"
                : formatExperienceDate(experience.end_date)}
            </small>
          </div>
          <div className="experience-card-content">
            {experience.organization && (
              <span className="eyebrow">{experience.organization}</span>
            )}
            <h2>{experience.title}</h2>
            <p>{experience.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
