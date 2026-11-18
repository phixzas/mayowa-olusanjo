"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "../supabase";
import type { Project } from "./types";

const projectFields =
  "id, title, description, project_type, tools, dashboard_path, cover_image_path, github_url, live_url, is_published, display_order, project_assets(id, storage_path, file_name, content_type, display_order)";

export default function ProjectList({ limit }: { limit?: number }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      return;
    }
    const client = supabase;

    async function loadProjects() {
      let query = client
        .from("projects")
        .select(projectFields)
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;
      if (!active) {
        return;
      }

      if (queryError) {
        setError(`Could not load projects: ${queryError.message}`);
      } else {
        setProjects(data as Project[]);
      }
      setLoading(false);
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, [limit, supabase]);

  if (!supabase) {
    return (
      <p className="experience-state">
        Projects will appear here after the portfolio database is configured.
      </p>
    );
  }

  if (loading) {
    return <p className="experience-state">Loading projects…</p>;
  }

  if (error) {
    return <p className="experience-state experience-state--error">{error}</p>;
  }

  if (projects.length === 0) {
    return (
      <p className="experience-state">
        Projects are being added. Check back soon.
      </p>
    );
  }

  return (
    <div className="managed-project-grid">
      {projects.map((project) => {
        const { data: dashboard } = project.dashboard_path
          ? supabase.storage
              .from("project-dashboards")
              .getPublicUrl(project.dashboard_path)
          : { data: { publicUrl: null } };
        const { data: coverImage } = project.cover_image_path
          ? supabase.storage
              .from("project-assets")
              .getPublicUrl(project.cover_image_path)
          : { data: { publicUrl: null } };

        return (
          <article className="managed-project-card" key={project.id}>
            {coverImage.publicUrl ? (
              <div className="project-cover-frame">
                <Image
                  className="project-cover-image"
                  src={coverImage.publicUrl}
                  alt={`${project.title} project cover`}
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            ) : dashboard.publicUrl ? (
              <div className="project-dashboard-frame">
                <iframe
                  src={`${dashboard.publicUrl}#toolbar=0&navpanes=0`}
                  title={`${project.title} dashboard`}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className={`managed-project-art managed-project-art--${project.project_type}`}>
                <span>{project.project_type === "data_analysis" ? "DATA ANALYSIS" : "DATA SCIENCE"}</span>
                <strong>{project.title}</strong>
                <span className="managed-project-art-mark" aria-hidden="true">M<span>.</span></span>
              </div>
            )}
            <div className="managed-project-content">
              <div className="project-meta">
                <span>{project.project_type === "data_analysis" ? "DATA ANALYSIS" : "DATA SCIENCE"}</span>
                {project.dashboard_path && <span>PDF DASHBOARD</span>}
                {project.project_assets?.length > 0 && <span>PROJECT FILES</span>}
              </div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {project.tools.length > 0 && (
                <div className="tool-list">
                  {project.tools.map((tool) => <span key={tool}>{tool}</span>)}
                </div>
              )}
              <div className="managed-project-links">
                {project.dashboard_path && dashboard.publicUrl && (
                  <a href={dashboard.publicUrl} target="_blank" rel="noreferrer">
                    View dashboard PDF <span aria-hidden="true">↗</span>
                  </a>
                )}
                {project.project_assets?.map((asset) => {
                  const { data: file } = supabase.storage
                    .from("project-assets")
                    .getPublicUrl(asset.storage_path);
                  return (
                    <a
                      key={asset.id}
                      href={`${file.publicUrl}?download=${encodeURIComponent(asset.file_name)}`}
                    >
                      Download {asset.file_name} <span aria-hidden="true">↓</span>
                    </a>
                  );
                })}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noreferrer">
                    View code on GitHub <span aria-hidden="true">↗</span>
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noreferrer">
                    Open live app <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
