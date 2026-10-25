async function request(url, options = {}) {
  const res = await fetch(url, { cache: "no-store", credentials: "same-origin", ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

function jsonRequest(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const fetchContent = () => request("/api/content");
export const fetchSession = () => request("/api/auth/session");
export const login = (password) => request("/api/auth/login", jsonRequest("POST", { password }));
export const logout = () => request("/api/auth/logout", { method: "POST" });
export const saveContent = (content) => request("/api/content", jsonRequest("PUT", content));

export function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/uploads", { method: "POST", body: form });
}
