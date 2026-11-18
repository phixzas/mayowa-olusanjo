"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import ProfilePhoto from "../../profile-photo";
import { createSupabaseBrowserClient } from "../../supabase";

const profilePhotoBucket = "profile-photos";
const profilePhotoPath = "profile-photo";
const maxPhotoSize = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileAdmin() {
  const [supabase] = useState<SupabaseClient | null>(() =>
    createSupabaseBrowserClient(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [photoPreviewKey, setPhotoPreviewKey] = useState(0);
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

  async function uploadPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authorized || !photo) {
      return;
    }

    if (!allowedPhotoTypes.includes(photo.type)) {
      setFormError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (photo.size > maxPhotoSize) {
      setFormError("Profile photos must be 5 MB or smaller.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    const { error } = await supabase.storage
      .from(profilePhotoBucket)
      .upload(profilePhotoPath, photo, {
        cacheControl: "0",
        contentType: photo.type,
        upsert: true,
      });

    if (error) {
      setFormError(
        error.message.toLowerCase().includes("bucket not found")
          ? "The profile photo bucket is missing. Run 202611180004_profile_photos.sql in the Supabase project configured for this app, then try again."
          : `Could not upload profile photo: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setPhoto(null);
    setFileInputKey((key) => key + 1);
    setPhotoPreviewKey((key) => key + 1);
    setNotice("Profile photo uploaded. It will appear on the homepage and About page.");
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
            "This account is not authorized to manage the profile photo. Add its Supabase user ID to the experience_admins table."}
        </p>
        <button className="button button-dark" type="button" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="profile-admin-layout">
      <section className="profile-admin-current">
        <div className="admin-list-heading">
          <h2>Current photo</h2>
          <button className="admin-text-button" type="button" onClick={signOut}>Sign out</button>
        </div>
        <ProfilePhoto
          key={photoPreviewKey}
          className="portrait-placeholder profile-admin-preview"
        />
      </section>

      <form className="admin-experience-form profile-admin-form" onSubmit={uploadPhoto}>
        <h2>Upload a profile photo</h2>
        <p className="profile-admin-help">
          Choose a JPEG, PNG, or WebP image up to 5 MB. Uploading replaces the current photo.
        </p>
        <label>
          Profile photo
          <input
            key={fileInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setPhoto(event.target.files?.[0] ?? null);
              setFormError(null);
              setNotice(null);
            }}
          />
        </label>
        {photo && <p className="admin-file-name">Selected: {photo.name}</p>}
        {formError && <p className="admin-error" role="alert">{formError}</p>}
        {notice && <p className="admin-success" role="status">{notice}</p>}
        <div className="admin-form-actions">
          <button className="button button-dark" type="submit" disabled={saving || !photo}>
            {saving ? "Uploading…" : "Upload photo"}
          </button>
        </div>
      </form>
    </div>
  );
}
