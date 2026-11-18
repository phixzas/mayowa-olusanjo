"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../supabase";
import type { Experience } from "../../experience/types";

type ExperienceForm = {
  title: string;
  organization: string;
  description: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_published: boolean;
  display_order: string;
};

const emptyForm: ExperienceForm = {
  title: "",
  organization: "",
  description: "",
  start_date: "",
  end_date: "",
  is_current: false,
  is_published: true,
  display_order: "0",
};

export default function ExperienceAdmin() {
  const [supabase] = useState<SupabaseClient | null>(() =>
    createSupabaseBrowserClient(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Experience[]>([]);
  const [form, setForm] = useState<ExperienceForm>(emptyForm);
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
      setEntries([]);
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

    async function loadEntries() {
      const { data, error } = await client
        .from("experiences")
        .select(
          "id, title, organization, description, start_date, end_date, is_current, is_published, display_order",
        )
        .order("display_order", { ascending: true })
        .order("start_date", { ascending: false });

      if (!active) {
        return;
      }

      if (error) {
        setFormError(`Could not load experience entries: ${error.message}`);
      } else {
        setEntries(data as Experience[]);
      }
    }

    void loadEntries();

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
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAccessError(`Sign-in failed: ${error.message}`);
    }
  }

  function startEditing(entry: Experience) {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      organization: entry.organization,
      description: entry.description,
      start_date: entry.start_date,
      end_date: entry.end_date ?? "",
      is_current: entry.is_current,
      is_published: entry.is_published,
      display_order: String(entry.display_order),
    });
    setFormError(null);
    setNotice(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function saveExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !authorized) {
      return;
    }

    if (!form.is_current) {
      if (!form.end_date) {
        setFormError("Add an end date, or mark this as your current role.");
        return;
      }

      if (form.end_date < form.start_date) {
        setFormError("The end date must be on or after the start date.");
        return;
      }
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    const payload = {
      title: form.title.trim(),
      organization: form.organization.trim(),
      description: form.description.trim(),
      start_date: form.start_date,
      end_date: form.is_current ? null : form.end_date || null,
      is_current: form.is_current,
      is_published: form.is_published,
      display_order: Number(form.display_order) || 0,
    };
    const result = editingId
      ? await supabase
          .from("experiences")
          .update(payload)
          .eq("id", editingId)
          .select(
            "id, title, organization, description, start_date, end_date, is_current, is_published, display_order",
          )
          .single()
      : await supabase
          .from("experiences")
          .insert(payload)
          .select(
            "id, title, organization, description, start_date, end_date, is_current, is_published, display_order",
          )
          .single();

    if (result.error) {
      setFormError(`Could not save this entry: ${result.error.message}`);
    } else {
      const saved = result.data as Experience;
      setEntries((current) =>
        editingId
          ? current.map((entry) => (entry.id === saved.id ? saved : entry))
          : [...current, saved].sort(
              (a, b) =>
                a.display_order - b.display_order ||
                b.start_date.localeCompare(a.start_date),
            ),
      );
      setNotice(editingId ? "Experience updated." : "Experience added.");
      setForm(emptyForm);
      setEditingId(null);
    }

    setSaving(false);
  }

  async function deleteExperience(id: string) {
    if (!supabase || !authorized) {
      return;
    }

    if (!window.confirm("Delete this experience entry?")) {
      return;
    }

    const { error } = await supabase.from("experiences").delete().eq("id", id);

    if (error) {
      setFormError(`Could not delete this entry: ${error.message}`);
      return;
    }

    setEntries((current) => current.filter((entry) => entry.id !== id));
    if (editingId === id) {
      resetForm();
    }
    setNotice("Experience deleted.");
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
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
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
            "This account is not authorized to manage experience entries. Add its Supabase user ID to the experience_admins table."}
        </p>
        <button className="button button-dark" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="admin-experience-layout">
      <section className="admin-entry-list">
        <div className="admin-list-heading">
          <div>
            <h2>Experience entries</h2>
            <p>{entries.length} saved</p>
          </div>
          <button className="admin-text-button" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="experience-state">No experience entries yet. Add your first one.</p>
        ) : (
          entries.map((entry) => (
            <article className="admin-entry-card" key={entry.id}>
              <div>
                <h3>{entry.title}</h3>
                <p>{entry.organization || "No organization"} · {entry.start_date}</p>
                <span>{entry.is_published ? "Published" : "Draft"}</span>
              </div>
              <div className="admin-entry-actions">
                <button type="button" onClick={() => startEditing(entry)}>Edit</button>
                <button type="button" onClick={() => void deleteExperience(entry.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <form className="admin-experience-form" onSubmit={saveExperience}>
        <h2>{editingId ? "Edit experience" : "Add experience"}</h2>
        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </label>
        <label>
          Organization
          <input
            value={form.organization}
            onChange={(event) =>
              setForm({ ...form, organization: event.target.value })
            }
            placeholder="Company or project"
          />
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
        <div className="admin-date-fields">
          <label>
            Start date
            <input
              type="date"
              value={form.start_date}
              onChange={(event) =>
                setForm({ ...form, start_date: event.target.value })
              }
              required
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={form.end_date}
              onChange={(event) =>
                setForm({ ...form, end_date: event.target.value })
              }
              disabled={form.is_current}
              required={!form.is_current}
            />
          </label>
        </div>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.is_current}
            onChange={(event) =>
              setForm({ ...form, is_current: event.target.checked })
            }
          />
          This is my current role
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
            {saving ? "Saving…" : editingId ? "Save changes" : "Add experience"}
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
