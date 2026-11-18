"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../supabase";
import type { Project, ProjectType } from "../../projects/types";

const projectFields =
  "id, title, description, project_type, tools, dashboard_path, github_url, live_url, is_published, display_order";

type ProjectForm = {
  title: string;
  description: string;
  project_type: ProjectType;
  tools: string;
  github_url: string;
  live_url: string;
  is_published: boolean;
  display_order: string;
};

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  project_type: "data_analysis",
  tools: "",
  github_url: "",
  live_url: "",
  is_published: true,
  display_order: "0",
};

function isValidOptionalUrl(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function ProjectAdmin() {
  const [supabase] = useState<SupabaseClient | null>(() =>
    createSupabaseBrowserClient(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [dashboardFile, setDashboardFile] = useState<File | null>(null);
  const [existingDashboard, setExistingDashboard] = useState<string | null>(null);
  const [removeDashboard, setRemoveDashboard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    void client.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAccessError(`Could not check your session: ${error.message}`);
      } else {
        setSession(data.session);
        setCheckingAdmin(Boolean(data.session));
      }
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingAdmin(Boolean(nextSession));
      setAuthorized(false);
      setAccessError(null);
      setProjects([]);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      return;
    }

    const client = supabase;
    const currentSession = session;
    let active = true;

    async function checkAdminAccess() {
      const { data, error } = await client
        .from("experience_admins")
        .select("user_id")
        .eq("user_id", currentSession.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        setAccessError(`Could not verify admin access: ${error.message}`);
        setAuthorized(false);
      } else {
        setAuthorized(Boolean(data));
      }

      setCheckingAdmin(false);
    }

    void checkAdminAccess();
    return () => {
      active = false;
    };
  }, [session, supabase]);

  useEffect(() => {
    if (!supabase || !authorized) {
      return;
    }

    const client = supabase;
    let active = true;

    async function loadProjects() {
      const { data, error } = await client
        .from("projects")
        .select(projectFields)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (error) {
        setFormError(`Could not load projects: ${error.message}`);
      } else {
        setProjects(data as Project[]);
      }
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, [authorized, supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setAccessError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAccessError(`Sign-in failed: ${error.message}`);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setDashboardFile(null);
    setExistingDashboard(null);
    setRemoveDashboard(false);
    setFormError(null);
    setNotice(null);
  }

  function startEditing(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      project_type: project.project_type,
      tools: project.tools.join(", "),
      github_url: project.github_url ?? "",
      live_url: project.live_url ?? "",
      is_published: project.is_published,
      display_order: String(project.display_order),
    });
    setDashboardFile(null);
    setExistingDashboard(project.dashboard_path);
    setRemoveDashboard(false);
    setFormError(null);
    setNotice(null);
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authorized || !session) {
      return;
    }

    if (!isValidOptionalUrl(form.github_url) || !isValidOptionalUrl(form.live_url)) {
      setFormError("Links must be valid HTTP or HTTPS URLs.");
      return;
    }

    if (dashboardFile) {
      if (dashboardFile.type !== "application/pdf" || !dashboardFile.name.toLowerCase().endsWith(".pdf")) {
        setFormError("Dashboard uploads must be PDF files, not image screenshots.");
        return;
      }

      const signature = new TextDecoder().decode(
        await dashboardFile.slice(0, 5).arrayBuffer(),
      );
      if (signature !== "%PDF-") {
        setFormError("The selected file is not a valid PDF document.");
        return;
      }

      if (dashboardFile.size > 50 * 1024 * 1024) {
        setFormError("Dashboard PDFs must be 50 MB or smaller.");
        return;
      }
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    let dashboardPath = removeDashboard ? null : existingDashboard;
    let uploadedPath: string | null = null;

    if (dashboardFile) {
      uploadedPath = `${session.user.id}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("project-dashboards")
        .upload(uploadedPath, dashboardFile, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        setFormError(`Could not upload dashboard PDF: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      dashboardPath = uploadedPath;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      project_type: form.project_type,
      tools: form.tools.split(",").map((tool) => tool.trim()).filter(Boolean),
      dashboard_path: dashboardPath,
      github_url: form.github_url.trim() || null,
      live_url: form.live_url.trim() || null,
      is_published: form.is_published,
      display_order: Number(form.display_order) || 0,
    };

    const result = editingId
      ? await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingId)
          .select(projectFields)
          .single()
      : await supabase
          .from("projects")
          .insert(payload)
          .select(projectFields)
          .single();

    if (result.error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("project-dashboards")
          .remove([uploadedPath]);
        if (cleanupError) {
          setFormError(
            `Could not save project: ${result.error.message}. The new PDF also could not be removed: ${cleanupError.message}`,
          );
          setSaving(false);
          return;
        }
      }
      setFormError(`Could not save project: ${result.error.message}`);
      setSaving(false);
      return;
    }

    const saved = result.data as Project;
    setProjects((current) =>
      editingId
        ? current.map((project) => (project.id === saved.id ? saved : project))
        : [...current, saved].sort(
            (a, b) =>
              a.display_order - b.display_order ||
              a.title.localeCompare(b.title),
          ),
    );

    const oldDashboard = existingDashboard;
    if (oldDashboard && oldDashboard !== dashboardPath) {
      const { error: removeError } = await supabase.storage
        .from("project-dashboards")
        .remove([oldDashboard]);
      if (removeError) {
        setFormError(
          `Project saved, but the replaced dashboard PDF could not be removed: ${removeError.message}`,
        );
        setSaving(false);
        setNotice("Project saved.");
        return;
      }
    }

    setNotice(editingId ? "Project updated." : "Project added.");
    setForm(emptyForm);
    setDashboardFile(null);
    setExistingDashboard(null);
    setRemoveDashboard(false);
    setEditingId(null);
    setSaving(false);
  }

  async function deleteProject(project: Project) {
    if (!supabase || !authorized) {
      return;
    }
    if (!window.confirm(`Delete "${project.title}"?`)) {
      return;
    }

    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) {
      setFormError(`Could not delete project: ${error.message}`);
      return;
    }

    setProjects((current) => current.filter((item) => item.id !== project.id));
    if (editingId === project.id) {
      resetForm();
    }

    if (project.dashboard_path) {
      const { error: removeError } = await supabase.storage
        .from("project-dashboards")
        .remove([project.dashboard_path]);
      if (removeError) {
        setFormError(
          `Project deleted, but its dashboard PDF could not be removed: ${removeError.message}`,
        );
        return;
      }
    }

    setNotice("Project deleted.");
  }

  async function signOut() {
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAccessError(`Could not sign out: ${error.message}`);
    }
  }

  if (!supabase) {
    return (
      <p className="experience-state experience-state--error">
        Supabase is not configured. Add the project URL and public anon key to .env.local, then restart the dev server.
      </p>
    );
  }
  if (checkingSession || checkingAdmin) {
    return <p className="experience-state">Checking admin access…</p>;
  }
  if (!session) {
    return (
      <form className="admin-login-card" onSubmit={signIn}>
        <h2>Admin sign-in</h2>
        <p>Sign in with the admin account configured in Supabase.</p>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {accessError && <p className="admin-error" role="alert">{accessError}</p>}
        <button className="button button-dark" type="submit">Sign in</button>
      </form>
    );
  }
  if (accessError || !authorized) {
    return (
      <div className="admin-access-card">
        <p className={accessError ? "admin-error" : ""} role="alert">
          {accessError ??
            "This account is not authorized to manage projects. Add its Supabase user ID to the experience_admins table."}
        </p>
        <button className="button button-dark" type="button" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="admin-experience-layout">
      <section className="admin-entry-list">
        <div className="admin-list-heading">
          <div>
            <h2>Projects</h2>
            <p>{projects.length} saved</p>
          </div>
          <button className="admin-text-button" type="button" onClick={signOut}>Sign out</button>
        </div>
        {projects.length === 0 ? (
          <p className="experience-state">No projects yet. Add your first project.</p>
        ) : (
          projects.map((project) => (
            <article className="admin-entry-card" key={project.id}>
              <div>
                <h3>{project.title}</h3>
                <p>{project.project_type === "data_analysis" ? "Data analysis" : "Data science"}</p>
                <span>{project.is_published ? "Published" : "Draft"}</span>
              </div>
              <div className="admin-entry-actions">
                <button type="button" onClick={() => startEditing(project)}>Edit</button>
                <button type="button" onClick={() => void deleteProject(project)}>Delete</button>
              </div>
            </article>
          ))
        )}
      </section>

      <form className="admin-experience-form" onSubmit={saveProject}>
        <h2>{editingId ? "Edit project" : "Add project"}</h2>
        <label>
          Project title
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </label>
        <label>
          Project type
          <select
            value={form.project_type}
            onChange={(event) =>
              setForm({ ...form, project_type: event.target.value as ProjectType })
            }
          >
            <option value="data_analysis">Data analysis</option>
            <option value="data_science">Data science</option>
          </select>
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            rows={5}
            required
          />
        </label>
        <label>
          Tools / skills (comma separated)
          <input
            value={form.tools}
            onChange={(event) => setForm({ ...form, tools: event.target.value })}
            placeholder="Python, Pandas, Power BI"
          />
        </label>
        <label>
          Dashboard report (PDF only, up to 50 MB; no screenshots)
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setDashboardFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {existingDashboard && !removeDashboard && !dashboardFile && (
          <div className="admin-current-file">
            <a
              href={
                supabase.storage
                  .from("project-dashboards")
                  .getPublicUrl(existingDashboard).data.publicUrl
              }
              target="_blank"
              rel="noreferrer"
            >
              View current dashboard PDF
            </a>
            <button type="button" onClick={() => setRemoveDashboard(true)}>
              Remove PDF
            </button>
          </div>
        )}
        {dashboardFile && (
          <p className="admin-file-name">Selected: {dashboardFile.name}</p>
        )}
        {removeDashboard && (
          <p className="admin-file-name">
            The current PDF will be removed when you save.
            <button type="button" onClick={() => setRemoveDashboard(false)}>Undo</button>
          </p>
        )}
        <label>
          GitHub repository URL
          <input
            type="url"
            value={form.github_url}
            onChange={(event) => setForm({ ...form, github_url: event.target.value })}
            placeholder="https://github.com/username/repository"
          />
        </label>
        <label>
          Live app or dashboard URL
          <input
            type="url"
            value={form.live_url}
            onChange={(event) => setForm({ ...form, live_url: event.target.value })}
            placeholder="https://your-app.streamlit.app"
          />
        </label>
        <label>
          Display order
          <input
            type="number"
            min="0"
            step="1"
            value={form.display_order}
            onChange={(event) =>
              setForm({ ...form, display_order: event.target.value })
            }
          />
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(event) =>
              setForm({ ...form, is_published: event.target.checked })
            }
          />
          Publish on portfolio
        </label>
        {formError && <p className="admin-error" role="alert">{formError}</p>}
        {notice && <p className="admin-success" role="status">{notice}</p>}
        <div className="admin-form-actions">
          <button className="button button-dark" type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button className="admin-text-button" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
