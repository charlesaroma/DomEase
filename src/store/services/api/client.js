/* API Client */
import { API_URL } from "../mode";

/**
 * Where a sign-in token is kept. The admin keeps its own for the tab only
 * (sessionStorage); the web app keeps the household's across visits
 * (localStorage), as the mobile app does. The two never share a token.
 */
export function makeTokenStore(key, storage = "session") {
  const box = () => (storage === "local" ? localStorage : sessionStorage);
  return {
    get: () => {
      try {
        return box().getItem(key);
      } catch {
        return null;
      }
    },
    set: (token) => {
      try {
        if (token) box().setItem(key, token);
        else box().removeItem(key);
      } catch {
        /* private windows may refuse storage; the session then lasts the tab */
      }
    },
  };
}

export const tokenStore = makeTokenStore("domease:admin:token");

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * JSON over HTTPS to the DomEase API, with a sign-in token (the moderator's
 * unless `auth` names another store). A FormData body goes as multipart, for
 * uploads, and the browser sets its boundary.
 */
export async function http(path, { method = "GET", body, auth = tokenStore } = {}) {
  const token = auth.get();
  const form = body instanceof FormData;
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: {
      ...(form ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : form ? body : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? "Something went wrong. Please try again.");
  return data;
}
