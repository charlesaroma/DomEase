/* API Client */
import { API_URL } from "../mode";

const TOKEN_KEY = "domease:admin:token";

export const tokenStore = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* private windows may refuse storage; the session then lasts the tab */
    }
  },
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** JSON over HTTPS to the DomEase API, with the moderator's token. */
export async function http(path, { method = "GET", body } = {}) {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? "Something went wrong. Please try again.");
  return data;
}
