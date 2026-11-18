"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../supabase";
import type { SkillCategory } from "../../skills/types";

type SkillForm = {
  title: string;
  tools: string;
  is_published: boolean;
  display_order: string;
};

const emptyForm: SkillForm = {
  title: "",
  tools: "",
  is_published: true,
  display_order: "0",
};

export default function SkillsAdmin() {
  const [supabase] = useState<SupabaseClient | null>(() =>
    createSupabaseBrowserClient(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [form, setForm] = useState<SkillForm>(emptyForm);
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
      setCategories([]);
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

    async function loadCategories() {
      const { data, error } = await client
        .from("skill_categories")
        .select("id, title, tools, is_published, display_order")
        .order("display_order", { ascending: true })
        .order("title", { ascending: true });

      if (!active) {
        return;
      }

      if (error) {
        setFormError(`Could not load skill categories: ${error.message}`);
      } else {
        setCategories(data as SkillCategory[]);
      }
    }

    void loadCategories();
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

  function startEditing(category: SkillCategory) {
    setEditingId(category.id);
    setForm({
      title: category.title,
      tools: category.tools.join("\n"),
      is_published: category.is_published,
      display_order: String(category.display_order),
    });
    setFormError(null);
    setNotice(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setNotice(null);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authorized) {
      return;
    }

    const tools = form.tools
      .split(/\r?\n/)
      .map((tool) => tool.trim())
      .filter(Boolean);

    if (tools.length === 0) {
      setFormError("Add at least one tool, using one line per tool.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    const payload = {
      title: form.title.trim(),
      tools,
      is_published: form.is_published,
      display_order: Number(form.display_order) || 0,
    };

    const result = editingId
      ? await supabase
          .from("skill_categories")
          .update(payload)
          .eq("id", editingId)
          .select("id, title, tools, is_published, display_order")
          .single()
      : await supabase
          .from("skill_categories")
          .insert(payload)
          .select("id, title, tools, is_published, display_order")
          .single();

    if (result.error) {
      setFormError(`Could not save this category: ${result.error.message}`);
    } else {
      const saved = result.data as SkillCategory;
      setCategories((current) =>
        editingId
          ? current.map((category) =>
              category.id === saved.id ? saved : category,
            )
          : [...current, saved].sort(
              (a, b) =>
                a.display_order - b.display_order ||
                a.title.localeCompare(b.title),
            ),
      );
      setNotice(editingId ? "Skill category updated." : "Skill category added.");
      setForm(emptyForm);
      setEditingId(null);
    }
    setSaving(false);
  }

  async function deleteCategory(category: SkillCategory) {
    if (!supabase || !authorized) {
      return;
    }
    if (!window.confirm(`Delete the "${category.title}" skill category?`)) {
      return;
    }

    const { error } = await supabase
      .from("skill_categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setFormError(`Could not delete this category: ${error.message}`);
      return;
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id),
    );
    if (editingId === category.id) {
      resetForm();
    }
    setNotice("Skill category deleted.");
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
            "This account is not authorized to manage skills. Add its Supabase user ID to the experience_admins table."}
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
            <h2>Skill categories</h2>
            <p>{categories.length} saved</p>
          </div>
          <button className="admin-text-button" type="button" onClick={signOut}>Sign out</button>
        </div>
        {categories.length === 0 ? (
          <p className="experience-state">
            No categories yet. Add one such as “Data Analysis.”
          </p>
        ) : (
          categories.map((category) => (
            <article className="admin-entry-card" key={category.id}>
              <div>
                <h3>{category.title}</h3>
                <p>{category.tools.length} tools: {category.tools.join(", ")}</p>
                <span>{category.is_published ? "Published" : "Draft"}</span>
              </div>
              <div className="admin-entry-actions">
                <button type="button" onClick={() => startEditing(category)}>Edit</button>
                <button type="button" onClick={() => void deleteCategory(category)}>Delete</button>
              </div>
            </article>
          ))
        )}
      </section>

      <form className="admin-experience-form" onSubmit={saveCategory}>
        <h2>{editingId ? "Edit skill category" : "Add skill category"}</h2>
        <label>
          Category title
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Data Analysis"
            required
          />
        </label>
        <label>
          Tools (enter one per line; add as many as you need)
          <textarea
            value={form.tools}
            onChange={(event) => setForm({ ...form, tools: event.target.value })}
            placeholder={"SQL\nExcel\nPower BI\nPython"}
            rows={10}
            required
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
            {saving ? "Saving…" : editingId ? "Save changes" : "Add category"}
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
