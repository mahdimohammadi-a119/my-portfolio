import { defaultContent } from "../shared/defaultContent.js";

const MAX_TEXT = 4000;
const MAX_ITEMS = 50;
const URL_KEYS = new Set(["image", "href", "ctaHref"]);

// Only allow relative paths, http(s) links, anchors and mailto. Blocks javascript: and data: URLs.
function safeUrl(value, fallback) {
  if (typeof value !== "string") return fallback;
  const v = value.trim().slice(0, 500);
  const allowed =
    v === "" ||
    (v.startsWith("/") && !v.startsWith("//")) ||
    /^https?:\/\//i.test(v) ||
    v.startsWith("#") ||
    /^mailto:/i.test(v);
  return allowed ? v : fallback;
}

// Walks the default content as a template: keeps only known keys, enforces
// types and lengths, and fills anything missing or invalid with the default.
function normalizeLike(input, template, key) {
  if (typeof template === "string") {
    if (URL_KEYS.has(key)) return safeUrl(input, template);
    return typeof input === "string" ? input.slice(0, MAX_TEXT) : template;
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(input)) return structuredClone(template);
    return input.slice(0, MAX_ITEMS).map((item) => normalizeLike(item, template[0]));
  }

  if (template && typeof template === "object") {
    const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
    const out = {};
    for (const k of Object.keys(template)) {
      out[k] = normalizeLike(source[k], template[k], k);
    }
    return out;
  }

  return template;
}

export function normalizeContent(input) {
  const content = normalizeLike(input, defaultContent);

  // Project ids must be unique, because they are used as React keys.
  const seen = new Set();
  content.projects.items = content.projects.items.map((item) => {
    let id = String(item.id || "").slice(0, 64);
    if (!id || seen.has(id)) {
      id = `project-${crypto.randomUUID().slice(0, 8)}`;
    }
    seen.add(id);
    return { ...item, id };
  });

  return content;
}
