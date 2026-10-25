import { useEffect, useMemo, useState } from "react";
import { fetchContent, fetchSession, login, logout, saveContent } from "../lib/api";
import { Field, Group, ImageField, ListEditor, createId, getIn, setIn } from "./fields";
import "./admin.css";

const SECTIONS = [
  { id: "site", label: "Site & SEO" },
  { id: "navbar", label: "Navbar" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

export default function AdminApp() {
  const [session, setSession] = useState("loading"); // loading | out | in
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [active, setActive] = useState("site");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () => Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved)),
    [draft, saved],
  );

  async function loadContent() {
    try {
      const data = await fetchContent();
      setDraft(data);
      setSaved(data);
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    }
  }

  useEffect(() => {
    fetchSession()
      .then(({ authenticated }) => {
        setSession(authenticated ? "in" : "out");
        if (authenticated) loadContent();
      })
      .catch(() => setSession("out"));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function handleLogin(password) {
    await login(password);
    setSession("in");
    await loadContent();
  }

  async function handleLogout() {
    await logout().catch(() => {});
    setDraft(null);
    setSaved(null);
    setSession("out");
  }

  async function handleSave() {
    setSaving(true);
    setStatus({ type: "", text: "" });
    try {
      const result = await saveContent(draft);
      setDraft(result);
      setSaved(result);
      setStatus({ type: "ok", text: "Saved. The site is up to date." });
    } catch (err) {
      if (err.status === 401) setSession("out");
      setStatus({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const update = (path, value) => setDraft((current) => setIn(current, path, value));

  if (session === "loading") {
    return <div className="adm-root adm-center"><p>Loading…</p></div>;
  }
  if (session === "out") {
    return <LoginScreen onLogin={handleLogin} />;
  }
  if (!draft) {
    return (
      <div className="adm-root adm-center">
        <p className={status.type === "error" ? "adm-error" : ""}>{status.text || "Loading content…"}</p>
      </div>
    );
  }

  const message =
    status.type === "error" ? status.text : dirty ? "You have unsaved changes." : status.text;

  return (
    <div className="adm-root">
      <header className="adm-header">
        <div className="adm-brand">Portfolio CMS</div>
        <div className="adm-header-actions">
          <a href="/" target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost">
            View site ↗
          </a>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="adm-layout">
        <aside className="adm-sidebar">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={section.id === active ? "adm-nav-item active" : "adm-nav-item"}
              onClick={() => setActive(section.id)}
            >
              {section.label}
            </button>
          ))}
        </aside>

        <div className="adm-panel">
          <SectionEditor id={active} draft={draft} update={update} />
        </div>
      </div>

      <div className="adm-savebar">
        <span className={status.type === "error" ? "adm-status error" : status.type === "ok" && !dirty ? "adm-status ok" : "adm-status"}>
          {message}
        </span>
        <div>
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            disabled={!dirty || saving}
            onClick={() => setDraft(saved)}
          >
            Discard
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onLogin(password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="adm-root adm-center">
      <form className="adm-login" onSubmit={handleSubmit}>
        <h1>Portfolio CMS</h1>
        <p>Sign in to edit your website.</p>
        <label className="adm-field">
          <span className="adm-label">Password</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <small className="adm-error">{error}</small>}
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function SectionEditor({ id, draft, update }) {
  const bind = (path) => ({ value: getIn(draft, path), onChange: (v) => update(path, v) });

  switch (id) {
    case "site":
      return (
        <Group title="Site & SEO">
          <Field label="Browser tab title" {...bind(["meta", "title"])} />
        </Group>
      );

    case "navbar":
      return (
        <>
          <Group title="Brand">
            <Field label="Logo text" {...bind(["navbar", "logo"])} />
          </Group>
          <Group title="Menu links">
            <ListEditor
              items={draft.navbar.links}
              onChange={(v) => update(["navbar", "links"], v)}
              createItem={() => ({ label: "New link", href: "#" })}
              addLabel="Add link"
              renderItem={(item, _index, setItem) => (
                <div className="adm-grid">
                  <Field label="Label" value={item.label} onChange={(v) => setItem({ ...item, label: v })} />
                  <Field
                    label="Link (e.g. #projects)"
                    value={item.href}
                    onChange={(v) => setItem({ ...item, href: v })}
                  />
                </div>
              )}
            />
          </Group>
          <Group title="Call to action button">
            <Field label="Button text" {...bind(["navbar", "ctaLabel"])} />
            <Field label="Button link" {...bind(["navbar", "ctaHref"])} />
          </Group>
        </>
      );

    case "hero":
      return (
        <>
          <Group title="Text">
            <Field label="Greeting" {...bind(["hero", "greeting"])} />
            <Field label="Title" {...bind(["hero", "title"])} />
            <Field label="Description" multiline wide {...bind(["hero", "description"])} />
          </Group>
          <Group title="Buttons">
            <Field label="Primary button text" {...bind(["hero", "primaryButton", "label"])} />
            <Field label="Primary button link" {...bind(["hero", "primaryButton", "href"])} />
            <Field label="Secondary button text" {...bind(["hero", "secondaryButton", "label"])} />
            <Field label="Secondary button link" {...bind(["hero", "secondaryButton", "href"])} />
          </Group>
          <Group title="Image">
            <ImageField label="Hero image" {...bind(["hero", "image"])} />
            <Field label="Image alt text" wide {...bind(["hero", "imageAlt"])} />
          </Group>
        </>
      );

    case "about":
      return (
        <>
          <Group title="Image">
            <ImageField label="About image" {...bind(["about", "image"])} />
            <Field label="Image alt text" wide {...bind(["about", "imageAlt"])} />
          </Group>
          <Group title="Text">
            <Field label="Heading" wide {...bind(["about", "heading"])} />
            <ListEditor
              items={draft.about.paragraphs}
              onChange={(v) => update(["about", "paragraphs"], v)}
              createItem={() => ""}
              addLabel="Add paragraph"
              renderItem={(item, index, setItem) => (
                <Field label={`Paragraph ${index + 1}`} multiline wide value={item} onChange={setItem} />
              )}
            />
            <Field label="Button text" {...bind(["about", "button", "label"])} />
            <Field label="Button link" {...bind(["about", "button", "href"])} />
          </Group>
        </>
      );

    case "skills":
      return (
        <>
          <Group title="Heading">
            <Field label="Heading" {...bind(["skills", "heading"])} />
            <Field label="Description" multiline wide {...bind(["skills", "description"])} />
          </Group>
          <Group title="Skill cards">
            <ListEditor
              items={draft.skills.items}
              onChange={(v) => update(["skills", "items"], v)}
              createItem={() => ({ name: "New skill", description: "", image: "" })}
              addLabel="Add skill"
              renderItem={(item, _index, setItem) => (
                <div className="adm-grid">
                  <Field label="Name" value={item.name} onChange={(v) => setItem({ ...item, name: v })} />
                  <Field
                    label="Short description"
                    value={item.description}
                    onChange={(v) => setItem({ ...item, description: v })}
                  />
                  <ImageField label="Logo" value={item.image} onChange={(v) => setItem({ ...item, image: v })} />
                </div>
              )}
            />
          </Group>
        </>
      );

    case "projects":
      return (
        <>
          <Group title="Heading">
            <Field label="Heading" {...bind(["projects", "heading"])} />
            <Field label="Description" multiline wide {...bind(["projects", "description"])} />
          </Group>
          <Group title="Project cards">
            <ListEditor
              items={draft.projects.items}
              onChange={(v) => update(["projects", "items"], v)}
              createItem={() => ({ id: createId(), title: "New project", description: "", image: "", alt: "New project" })}
              addLabel="Add project"
              renderItem={(item, _index, setItem) => (
                <div className="adm-grid">
                  <Field label="Title" value={item.title} onChange={(v) => setItem({ ...item, title: v })} />
                  <Field label="Image alt text" value={item.alt} onChange={(v) => setItem({ ...item, alt: v })} />
                  <Field
                    label="Description"
                    multiline
                    wide
                    value={item.description}
                    onChange={(v) => setItem({ ...item, description: v })}
                  />
                  <ImageField label="Screenshot" value={item.image} onChange={(v) => setItem({ ...item, image: v })} />
                </div>
              )}
            />
          </Group>
        </>
      );

    case "contact":
      return (
        <>
          <Group title="Heading">
            <Field label="Heading" {...bind(["contact", "heading"])} />
            <Field label="Description" multiline wide {...bind(["contact", "description"])} />
          </Group>
          <Group title="Contact details">
            <ListEditor
              items={draft.contact.details}
              onChange={(v) => update(["contact", "details"], v)}
              createItem={() => ({ icon: "★", label: "New item", value: "" })}
              addLabel="Add detail"
              renderItem={(item, _index, setItem) => (
                <div className="adm-grid">
                  <Field label="Icon (one character)" value={item.icon} onChange={(v) => setItem({ ...item, icon: v })} />
                  <Field label="Label" value={item.label} onChange={(v) => setItem({ ...item, label: v })} />
                  <Field label="Value" wide value={item.value} onChange={(v) => setItem({ ...item, value: v })} />
                </div>
              )}
            />
          </Group>
          <Group title="Form">
            <Field label="Name placeholder" {...bind(["contact", "form", "namePlaceholder"])} />
            <Field label="Email placeholder" {...bind(["contact", "form", "emailPlaceholder"])} />
            <Field label="Message placeholder" {...bind(["contact", "form", "messagePlaceholder"])} />
            <Field label="Button text" {...bind(["contact", "form", "submitLabel"])} />
          </Group>
        </>
      );

    case "footer":
      return (
        <Group title="Footer">
          <Field label="Made with text" {...bind(["footer", "madeWith"])} />
          <Field label="Back to top text" {...bind(["footer", "backToTopLabel"])} />
          <Field label="Copyright text" wide {...bind(["footer", "copyright"])} />
        </Group>
      );

    default:
      return null;
  }
}
