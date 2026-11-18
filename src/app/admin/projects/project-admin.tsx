"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../supabase";
import {
  DEFAULT_PROJECT_LINKEDIN_URL,
  type Project,
  type ProjectAsset,
  type ProjectType,
} from "../../projects/types";
import {
  getProjectFileContentType,
  getProjectImageContentType,
  getProjectStoragePath,
  hasValidProjectImageSignature,
  MAX_PROJECT_UPLOAD_BYTES,
  PROJECT_FILE_ACCEPT,
  PROJECT_IMAGE_ACCEPT,
  uploadProjectObject,
} from "./project-uploads";

const projectFields =
  "id, title, description, project_type, tools, dashboard_path, cover_image_path, github_url, live_url, linkedin_url, is_published, display_order, project_assets(id, storage_path, file_name, content_type, display_order)";

type ProjectForm = {
  title: string;
  description: string;
  project_type: ProjectType;
  tools: string;
  github_url: string;
  live_url: string;
  linkedin_url: string;
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
  linkedin_url: DEFAULT_PROJECT_LINKEDIN_URL,
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
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [existingAssets, setExistingAssets] = useState<ProjectAsset[]>([]);
  const [removedAssetIds, setRemovedAssetIds] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
    setCoverImageFile(null);
    setExistingCoverImage(null);
    setRemoveCoverImage(false);
    setAssetFiles([]);
    setExistingAssets([]);
    setRemovedAssetIds([]);
    setUploadProgress(null);
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
      linkedin_url: project.linkedin_url ?? DEFAULT_PROJECT_LINKEDIN_URL,
      is_published: project.is_published,
      display_order: String(project.display_order),
    });
    setDashboardFile(null);
    setExistingDashboard(project.dashboard_path);
    setRemoveDashboard(false);
    setCoverImageFile(null);
    setExistingCoverImage(project.cover_image_path);
    setRemoveCoverImage(false);
    setAssetFiles([]);
    setExistingAssets(project.project_assets ?? []);
    setRemovedAssetIds([]);
    setUploadProgress(null);
    setFormError(null);
    setNotice(null);
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authorized || !session) {
      return;
    }

    if (
      !isValidOptionalUrl(form.github_url) ||
      !isValidOptionalUrl(form.live_url) ||
      !isValidOptionalUrl(form.linkedin_url)
    ) {
      setFormError("Links must be valid HTTP or HTTPS URLs.");
      return;
    }

    const coverContentType = coverImageFile
      ? getProjectImageContentType(coverImageFile.name)
      : null;
    if (coverImageFile && !coverContentType) {
      setFormError("Cover images must be JPG, PNG, or WebP files.");
      return;
    }

    if (coverImageFile && coverContentType) {
      if (coverImageFile.size > MAX_PROJECT_UPLOAD_BYTES) {
        setFormError("Cover images must be 150 MB or smaller.");
        return;
      }
      if (
        (coverImageFile.type && coverImageFile.type !== coverContentType) ||
        !(await hasValidProjectImageSignature(coverImageFile, coverContentType))
      ) {
        setFormError("The selected cover image is not a valid JPG, PNG, or WebP file.");
        return;
      }
    }

    for (const file of assetFiles) {
      if (!getProjectFileContentType(file.name)) {
        setFormError(
          `${file.name} is not a supported file. Choose ZIP, code, notebook, data, or document files.`,
        );
        return;
      }
      if (file.size > MAX_PROJECT_UPLOAD_BYTES) {
        setFormError(`${file.name} is larger than the 150 MB per-file limit.`);
        return;
      }
    }

    if (dashboardFile) {
      if (getProjectFileContentType(dashboardFile.name) !== "application/pdf") {
        setFormError("Dashboard reports must be PDF files. Use the cover image field for screenshots.");
        return;
      }

      const signature = new TextDecoder().decode(
        await dashboardFile.slice(0, 5).arrayBuffer(),
      );
      if (signature !== "%PDF-") {
        setFormError("The selected file is not a valid PDF document.");
        return;
      }

      if (dashboardFile.size > MAX_PROJECT_UPLOAD_BYTES) {
        setFormError("Dashboard PDFs must be 150 MB or smaller.");
        return;
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      setFormError("Supabase is not configured for project uploads.");
      return;
    }
    const client = supabase;
    const currentSession = session;
    const projectUrl = supabaseUrl;

    setSaving(true);
    setFormError(null);
    setNotice(null);
    setUploadProgress(null);

    let dashboardPath = removeDashboard ? null : existingDashboard;
    let coverImagePath = removeCoverImage ? null : existingCoverImage;
    const uploadedObjects: { bucket: string; path: string }[] = [];
    const uploadedAssets: {
      file: File;
      path: string;
      contentType: string;
    }[] = [];
    const uploadFiles = [
      ...(dashboardFile ? [dashboardFile] : []),
      ...(coverImageFile ? [coverImageFile] : []),
      ...assetFiles,
    ];
    let completedUploads = 0;

    async function removeUploadedObjects(
      objects: { bucket: string; path: string }[],
    ): Promise<string[]> {
      const failures: string[] = [];
      const byBucket = new Map<string, string[]>();
      for (const object of objects) {
        byBucket.set(object.bucket, [
          ...(byBucket.get(object.bucket) ?? []),
          object.path,
        ]);
      }
      for (const [bucket, paths] of byBucket) {
        const { error } = await client.storage.from(bucket).remove(paths);
        if (error) {
          failures.push(`${bucket}: ${error.message}`);
        }
      }
      return failures;
    }

    async function uploadFile(
      file: File,
      bucket: string,
      contentType: string,
    ): Promise<string> {
      const path = getProjectStoragePath(currentSession.user.id, file.name);
      await uploadProjectObject({
        supabaseUrl: projectUrl,
        accessToken: currentSession.access_token,
        bucketName: bucket,
        objectPath: path,
        file,
        contentType,
        onProgress(percentage) {
          setUploadProgress(
            Math.round(((completedUploads + percentage / 100) / uploadFiles.length) * 100),
          );
        },
      });
      uploadedObjects.push({ bucket, path });
      completedUploads += 1;
      return path;
    }

    try {
      if (dashboardFile) {
        dashboardPath = await uploadFile(
          dashboardFile,
          "project-dashboards",
          "application/pdf",
        );
      }
      if (coverImageFile && coverContentType) {
        coverImagePath = await uploadFile(
          coverImageFile,
          "project-assets",
          coverContentType,
        );
      }
      for (const file of assetFiles) {
        const contentType = getProjectFileContentType(file.name);
        if (!contentType) {
          throw new Error(`Unsupported file type: ${file.name}`);
        }
        const path = await uploadFile(file, "project-assets", contentType);
        uploadedAssets.push({ file, path, contentType });
      }
    } catch (error) {
      const cleanupFailures = await removeUploadedObjects(uploadedObjects);
      const message =
        error instanceof Error ? error.message : "An unknown upload error occurred.";
      setFormError(
        `Could not upload project files: ${message}${
          cleanupFailures.length
            ? ` Uploaded files also could not be cleaned up: ${cleanupFailures.join("; ")}`
            : ""
        }`,
      );
      setUploadProgress(null);
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      project_type: form.project_type,
      tools: form.tools.split(",").map((tool) => tool.trim()).filter(Boolean),
      dashboard_path: dashboardPath,
      cover_image_path: coverImagePath,
      github_url: form.github_url.trim() || null,
      live_url: form.live_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || DEFAULT_PROJECT_LINKEDIN_URL,
      is_published: form.is_published,
      display_order: Number(form.display_order) || 0,
    };

    const result = editingId
      ? await client
          .from("projects")
          .update(payload)
          .eq("id", editingId)
          .select(projectFields)
          .single()
      : await client
          .from("projects")
          .insert(payload)
          .select(projectFields)
          .single();

    if (result.error) {
      const cleanupFailures = await removeUploadedObjects(uploadedObjects);
      setFormError(
        `Could not save project: ${result.error.message}${
          cleanupFailures.length
            ? ` Uploaded files also could not be cleaned up: ${cleanupFailures.join("; ")}`
            : ""
        }`,
      );
      setUploadProgress(null);
      setSaving(false);
      return;
    }

    const saved = result.data as Project;
    const retainedAssets = existingAssets.filter(
      (asset) => !removedAssetIds.includes(asset.id),
    );
    let addedAssets: ProjectAsset[] = [];

    if (uploadedAssets.length > 0) {
      const { data, error } = await client
        .from("project_assets")
        .insert(
          uploadedAssets.map((asset, index) => ({
            project_id: saved.id,
            storage_path: asset.path,
            file_name: asset.file.name,
            content_type: asset.contentType,
            display_order: retainedAssets.length + index,
          })),
        )
        .select("id, storage_path, file_name, content_type, display_order");

      if (error || !data) {
        const cleanupFailures = await removeUploadedObjects(
          uploadedAssets.map((asset) => ({
            bucket: "project-assets",
            path: asset.path,
          })),
        );
        const currentProject = {
          ...saved,
          dashboard_path: dashboardPath,
          cover_image_path: coverImagePath,
          project_assets: existingAssets,
        };
        setProjects((current) =>
          editingId
            ? current.map((project) =>
                project.id === saved.id ? currentProject : project,
              )
            : [...current, currentProject],
        );
        setEditingId(saved.id);
        setExistingDashboard(dashboardPath);
        setDashboardFile(null);
        setExistingCoverImage(coverImagePath);
        setCoverImageFile(null);
        setExistingAssets(existingAssets);
        setRemoveDashboard(false);
        setRemoveCoverImage(false);
        setUploadProgress(null);
        setFormError(
          `Project details were saved, but its downloadable files could not be linked: ${
            error?.message ?? "No file records were returned."
          }${
            cleanupFailures.length
              ? ` The uploaded files also could not be cleaned up: ${cleanupFailures.join("; ")}`
              : ""
          }`,
        );
        setSaving(false);
        return;
      }

      addedAssets = data as ProjectAsset[];
    }

    const assetsToRemove = existingAssets.filter((asset) =>
      removedAssetIds.includes(asset.id),
    );
    if (assetsToRemove.length > 0) {
      const { error } = await client
        .from("project_assets")
        .delete()
        .in(
          "id",
          assetsToRemove.map((asset) => asset.id),
        );
      if (error) {
        const currentProject = {
          ...saved,
          dashboard_path: dashboardPath,
          cover_image_path: coverImagePath,
          project_assets: [...existingAssets, ...addedAssets],
        };
        setProjects((current) =>
          editingId
            ? current.map((project) =>
                project.id === saved.id ? currentProject : project,
              )
            : [...current, currentProject],
        );
        setEditingId(saved.id);
        setExistingDashboard(dashboardPath);
        setDashboardFile(null);
        setExistingCoverImage(coverImagePath);
        setCoverImageFile(null);
        setAssetFiles([]);
        setExistingAssets([...existingAssets, ...addedAssets]);
        setRemoveDashboard(false);
        setRemoveCoverImage(false);
        setUploadProgress(null);
        setFormError(`Project saved, but old downloadable files could not be removed: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    const savedAssets = [...retainedAssets, ...addedAssets];
    const savedProject: Project = {
      ...saved,
      dashboard_path: dashboardPath,
      cover_image_path: coverImagePath,
      project_assets: savedAssets,
    };
    setProjects((current) =>
      editingId
        ? current.map((project) =>
            project.id === savedProject.id ? savedProject : project,
          )
        : [...current, savedProject].sort(
            (a, b) =>
              a.display_order - b.display_order ||
              a.title.localeCompare(b.title),
          ),
    );

    const oldDashboard = existingDashboard;
    const oldCoverImage = existingCoverImage;
    const cleanupFailures: string[] = [];
    if (oldDashboard && oldDashboard !== dashboardPath) {
      const { error } = await supabase.storage
        .from("project-dashboards")
        .remove([oldDashboard]);
      if (error) {
        cleanupFailures.push(`dashboard PDF: ${error.message}`);
      }
    }
    const oldAssetPaths = assetsToRemove.map((asset) => asset.storage_path);
    if (oldAssetPaths.length > 0) {
      const { error } = await supabase.storage
        .from("project-assets")
        .remove(oldAssetPaths);
      if (error) {
        cleanupFailures.push(`project files: ${error.message}`);
      }
    }
    if (oldCoverImage && oldCoverImage !== coverImagePath) {
      const { error } = await supabase.storage
        .from("project-assets")
        .remove([oldCoverImage]);
      if (error) {
        cleanupFailures.push(`cover image: ${error.message}`);
      }
    }

    setExistingDashboard(dashboardPath);
    setExistingCoverImage(coverImagePath);
    setDashboardFile(null);
    setCoverImageFile(null);
    setAssetFiles([]);
    setExistingAssets(savedAssets);
    setRemovedAssetIds([]);
    setRemoveDashboard(false);
    setRemoveCoverImage(false);
    setUploadProgress(null);
    if (cleanupFailures.length > 0) {
      setEditingId(savedProject.id);
      setFormError(
        `Project saved, but some replaced files could not be removed: ${cleanupFailures.join("; ")}`,
      );
      setNotice("Project saved.");
      setSaving(false);
      return;
    }

    setNotice(editingId ? "Project updated." : "Project added.");
    setForm(emptyForm);
    setEditingId(null);
    setExistingDashboard(null);
    setExistingCoverImage(null);
    setExistingAssets([]);
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

    const cleanupFailures: string[] = [];
    if (project.dashboard_path) {
      const { error: removeError } = await supabase.storage
        .from("project-dashboards")
        .remove([project.dashboard_path]);
      if (removeError) {
        cleanupFailures.push(`dashboard PDF: ${removeError.message}`);
      }
    }

    const projectAssetPaths = [
      ...(project.cover_image_path ? [project.cover_image_path] : []),
      ...(project.project_assets ?? []).map((asset) => asset.storage_path),
    ];
    if (projectAssetPaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("project-assets")
        .remove(projectAssetPaths);
      if (removeError) {
        cleanupFailures.push(`project files: ${removeError.message}`);
      }
    }

    if (cleanupFailures.length > 0) {
      setFormError(
        `Project deleted, but some uploaded files could not be removed: ${cleanupFailures.join("; ")}`,
      );
      return;
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
          Project cover image (JPG, PNG, or WebP; up to 150 MB)
          <input
            type="file"
            accept={PROJECT_IMAGE_ACCEPT}
            onChange={(event) =>
              setCoverImageFile(event.target.files?.[0] ?? null)
            }
          />
        </label>
        {existingCoverImage && !removeCoverImage && !coverImageFile && (
          <div className="admin-current-file">
            <a
              href={
                supabase.storage
                  .from("project-assets")
                  .getPublicUrl(existingCoverImage).data.publicUrl
              }
              target="_blank"
              rel="noreferrer"
            >
              View current cover image
            </a>
            <button type="button" onClick={() => setRemoveCoverImage(true)}>
              Remove image
            </button>
          </div>
        )}
        {coverImageFile && (
          <p className="admin-file-name">Selected image: {coverImageFile.name}</p>
        )}
        {removeCoverImage && (
          <p className="admin-file-name">
            The current cover image will be removed when you save.
            <button type="button" onClick={() => setRemoveCoverImage(false)}>
              Undo
            </button>
          </p>
        )}
        <label>
          Dashboard report (PDF only, up to 150 MB)
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
          Project files (ZIP, code, notebooks, spreadsheets, and documents; up to 150 MB each)
          <input
            type="file"
            accept={PROJECT_FILE_ACCEPT}
            multiple
            onChange={(event) =>
              setAssetFiles(Array.from(event.target.files ?? []))
            }
          />
        </label>
        <p className="admin-upload-note">
          Code files are shown in a viewer; other attached files are downloadable by visitors.
          Supabase may require a plan with a 150 MB upload limit.
        </p>
        {existingAssets.map((asset) => {
          const removed = removedAssetIds.includes(asset.id);
          const publicUrl = supabase.storage
            .from("project-assets")
            .getPublicUrl(asset.storage_path).data.publicUrl;
          return (
            <div className="admin-current-file" key={asset.id}>
              <a
                href={`${publicUrl}?download=${encodeURIComponent(asset.file_name)}`}
                target="_blank"
                rel="noreferrer"
              >
                {asset.file_name}
              </a>
              <button
                type="button"
                onClick={() =>
                  setRemovedAssetIds((current) =>
                    removed
                      ? current.filter((id) => id !== asset.id)
                      : [...current, asset.id],
                  )
                }
              >
                {removed ? "Keep file" : "Remove file"}
              </button>
            </div>
          );
        })}
        {assetFiles.map((file, index) => (
          <p className="admin-file-name" key={`${file.name}-${file.lastModified}-${index}`}>
            Selected: {file.name}
          </p>
        ))}
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
          LinkedIn link (defaults to your profile)
          <input
            type="url"
            value={form.linkedin_url}
            onChange={(event) =>
              setForm({ ...form, linkedin_url: event.target.value })
            }
            placeholder="https://www.linkedin.com/posts/..."
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
        {saving && uploadProgress !== null && (
          <p className="admin-file-name" role="status">
            Uploading project files: {uploadProgress}%
          </p>
        )}
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
