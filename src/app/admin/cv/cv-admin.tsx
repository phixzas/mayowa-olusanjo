"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../supabase";

const cvBucket = "cv-documents";
const cvPath = "mayowa-cv.pdf";
const maxCvSize = 20 * 1024 * 1024;

export default function CvAdmin() {
  const [supabase] = useState<SupabaseClient | null>(() =>
    createSupabaseBrowserClient(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
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

  async function uploadCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authorized || !cvFile) {
      return;
    }

    if (
      cvFile.type !== "application/pdf" ||
      !cvFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFormError("Choose a PDF file.");
      return;
    }
    if (cvFile.size > maxCvSize) {
      setFormError("CV files must be 20 MB or smaller.");
      return;
    }

    const signature = new TextDecoder().decode(
      await cvFile.slice(0, 5).arrayBuffer(),
    );
    if (signature !== "%PDF-") {
      setFormError("The selected file is not a valid PDF document.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    const { error } = await supabase.storage
      .from(cvBucket)
      .upload(cvPath, cvFile, {
        cacheControl: "0",
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      setFormError(
        error.message.toLowerCase().includes("bucket not found")
          ? "The CV bucket is missing. Run 202611180005_cv_documents.sql in the Supabase project configured for this app, then try again."
          : `Could not upload CV: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setCvFile(null);
    setFileInputKey((key) => key + 1);
    setNotice("CV uploaded. Visitors can download it using the CV button in the site header.");
    setSaving(false);
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
            "This account is not authorized to manage the CV. Add its Supabase user ID to the experience_admins table."}
        </p>
        <button className="button button-dark" type="button" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="admin-cv-layout">
      <div className="admin-list-heading">
        <div>
          <h2>CV download</h2>
          <p>Visitors can download this PDF from the CV icon in the header.</p>
        </div>
        <button className="admin-text-button" type="button" onClick={signOut}>Sign out</button>
      </div>
      <form className="admin-experience-form cv-admin-form" onSubmit={uploadCv}>
        <h2>Upload or replace CV</h2>
        <p className="profile-admin-help">
          Choose a PDF up to 20 MB. The uploaded file replaces the current download.
        </p>
        <label>
          CV file
          <input
            key={fileInputKey}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setCvFile(event.target.files?.[0] ?? null);
              setFormError(null);
              setNotice(null);
            }}
          />
        </label>
        {cvFile && <p className="admin-file-name">Selected: {cvFile.name}</p>}
        {formError && <p className="admin-error" role="alert">{formError}</p>}
        {notice && <p className="admin-success" role="status">{notice}</p>}
        <div className="admin-form-actions">
          <button className="button button-dark" type="submit" disabled={saving || !cvFile}>
            {saving ? "Uploading…" : "Upload CV"}
          </button>
        </div>
      </form>
    </div>
  );
}
