import { useState } from "react";
import { uploadImage } from "../lib/api";

export function getIn(source, path) {
  return path.reduce((value, key) => (value == null ? value : value[key]), source);
}

export function setIn(source, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(source) ? [...source] : { ...source };
  copy[head] = setIn(source[head], rest, value);
  return copy;
}

export function createId() {
  return `item-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function Group({ title, children }) {
  return (
    <section className="adm-group">
      <h2>{title}</h2>
      <div className="adm-grid">{children}</div>
    </section>
  );
}

export function Field({ label, value, onChange, multiline = false, wide = false, hint }) {
  return (
    <label className={wide ? "adm-field adm-wide" : "adm-field"}>
      <span className="adm-label">{label}</span>
      {multiline ? (
        <textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <small className="adm-hint">{hint}</small>}
    </label>
  );
}

const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-field adm-wide">
      <span className="adm-label">{label}</span>
      <div className="adm-image-row">
        <div className="adm-thumb">
          {value ? <img src={value} alt="" /> : <span>No image</span>}
        </div>

        <div className="adm-image-controls">
          <input
            type="text"
            value={value ?? ""}
            placeholder="/my-image.jpg or https://…"
            onChange={(e) => onChange(e.target.value)}
          />

          <div className="adm-image-actions">
            <label className={busy ? "adm-btn adm-btn-ghost adm-file-btn is-busy" : "adm-btn adm-btn-ghost adm-file-btn"}>
              {busy ? "Uploading…" : "Upload image"}
              <input type="file" accept={IMAGE_TYPES} onChange={handleFile} disabled={busy} />
            </label>

            {value && (
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => onChange("")}>
                Remove
              </button>
            )}
          </div>

          {error && <small className="adm-error">{error}</small>}
        </div>
      </div>
    </div>
  );
}

export function ListEditor({ items, onChange, createItem, addLabel, renderItem }) {
  function replaceAt(index, value) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="adm-list adm-wide">
      {items.map((item, index) => (
        <div className="adm-list-item" key={item?.id ?? index}>
          <div className="adm-list-body">
            {renderItem(item, index, (value) => replaceAt(index, value))}
          </div>

          <div className="adm-list-tools">
            <button
              type="button"
              className="adm-icon-btn"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className="adm-icon-btn"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              className="adm-icon-btn adm-danger"
              onClick={() => remove(index)}
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="adm-btn adm-btn-ghost adm-add" onClick={() => onChange([...items, createItem()])}>
        + {addLabel}
      </button>
    </div>
  );
}
