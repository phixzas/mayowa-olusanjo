"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../supabase";
import type { SkillCategory } from "./types";

export default function SkillsList({ limit }: { limit?: number }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      return;
    }
    const client = supabase;

    async function loadSkills() {
      const { data, error: queryError } = await client
        .from("skill_categories")
        .select("id, title, tools, is_published, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("title", { ascending: true });

      if (!active) {
        return;
      }

      if (queryError) {
        setError(`Could not load skills: ${queryError.message}`);
      } else {
        setCategories(data as SkillCategory[]);
      }
      setLoading(false);
    }

    void loadSkills();
    return () => {
      active = false;
    };
  }, [supabase]);

  if (!supabase) {
    return (
      <p className="experience-state">
        Skill categories will appear here after the portfolio database is configured.
      </p>
    );
  }

  if (loading) {
    return <p className="experience-state">Loading skills…</p>;
  }

  if (error) {
    return <p className="experience-state experience-state--error">{error}</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="experience-state">
        Skill categories are being added. Check back soon.
      </p>
    );
  }

  const visibleCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <div className="skill-category-grid">
      {visibleCategories.map((category, index) => (
        <article className="skill-category-card" key={category.id}>
          <div className="skill-category-heading">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{category.title}</h3>
          </div>
          <ul>
            {category.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </article>
      ))}
    </div>
  );
}
