import express from "express";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultContent } from "../shared/defaultContent.js";
import { normalizeContent } from "./normalize.js";

// Loads .env if present (Node 20.12+/21.7+). Real environment variables still work.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data", "content.json");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DIST_DIR = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 3001;
const IS_PROD = process.env.NODE_ENV === "production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

if (!ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD is not set. Add it to a .env file or to your environment.");
  process.exit(1);
}

// ---------- Auth ----------
const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const sessions = new Map(); // token -> expiresAt
const loginAttempts = new Map(); // ip -> { count, resetAt }
const passwordDigest = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest();

function passwordMatches(candidate) {
  const digest = crypto.createHash("sha256").update(candidate).digest();
  return crypto.timingSafeEqual(digest, passwordDigest);
}

function getToken(req) {
  const match = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return match ? match.slice(SESSION_COOKIE.length + 1) : null;
}

function isAuthenticated(req) {
  const token = getToken(req);
  if (!token || !sessions.has(token)) return false;
  if (sessions.get(token) < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function requireAdmin(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

function setSessionCookie(res, value, maxAgeSec) {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSec}`,
  ];
  if (IS_PROD) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

// ---------- Content storage (serialized writes, with a backup of the previous version) ----------
async function readContent() {
  try {
    const raw = await fs.promises.readFile(DATA_FILE, "utf8");
    return normalizeContent(JSON.parse(raw));
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("Could not read content file, serving defaults:", err.message);
    }
    return normalizeContent(defaultContent);
  }
}

let writeQueue = Promise.resolve();
function saveContent(content) {
  const job = writeQueue.then(async () => {
    await fs.promises.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.promises.copyFile(DATA_FILE, `${DATA_FILE}.bak`).catch(() => {});
    const tmp = `${DATA_FILE}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(content, null, 2), "utf8");
    await fs.promises.rename(tmp, DATA_FILE);
  });
  writeQueue = job.catch(() => {});
  return job;
}

// ---------- Uploads ----------
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const EXT_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + EXT_BY_TYPE[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, Boolean(EXT_BY_TYPE[file.mimetype])),
});

// ---------- App ----------
const app = express();
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/api/content", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(await readContent());
});

app.put("/api/content", requireAdmin, async (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid content" });
  }
  const content = normalizeContent(req.body);
  await saveContent(content);
  res.json(content);
});

app.get("/api/auth/session", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ authenticated: isAuthenticated(req) });
});

app.post("/api/auth/login", (req, res) => {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  const windowOpen = entry && entry.resetAt > now;

  if (windowOpen && entry.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: "Too many attempts. Please wait 15 minutes." });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || !passwordMatches(password)) {
    const current = windowOpen ? entry : { count: 0, resetAt: now + ATTEMPT_WINDOW_MS };
    current.count += 1;
    loginAttempts.set(ip, current);
    return res.status(401).json({ error: "Wrong password." });
  }

  loginAttempts.delete(ip);
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, now + SESSION_TTL_MS);
  setSessionCookie(res, token, SESSION_TTL_MS / 1000);
  res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getToken(req);
  if (token) sessions.delete(token);
  setSessionCookie(res, "", 0);
  res.json({ ok: true });
});

app.post("/api/uploads", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "Please choose a JPG, PNG, WEBP or GIF image smaller than 5 MB." });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "1d" }));

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// In production, serve the built site and let the React router handle /admin.
if (IS_PROD && fs.existsSync(path.join(DIST_DIR, "index.html"))) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

// Error handler (must be last)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.type === "entity.parse.failed" || err.status === 413) {
    return res.status(400).json({ error: "Invalid or too large request." });
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => {
  console.log(`CMS API running at http://localhost:${PORT}`);
});
