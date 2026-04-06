// ---------------------------------------------------------------------------
// Token storage and session management for Frappe
// ---------------------------------------------------------------------------

const STORAGE_KEY = "controldesk_auth";
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface StoredCredentials {
  api_key: string;
  api_secret: string;
  user: string;
}

// ---- Credential persistence ----

function readCredentials(): StoredCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredCredentials;
  } catch {
    return null;
  }
}

function writeCredentials(creds: StoredCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
}

function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Public API ----

/**
 * Returns an Authorization header object when token credentials are stored.
 * If the session relies on cookies only, returns an empty object.
 */
export function getAuthHeaders(): Record<string, string> {
  const creds = readCredentials();
  if (!creds) return {};
  return { Authorization: `token ${creds.api_key}:${creds.api_secret}` };
}

/**
 * Log in via Frappe's built-in login endpoint.
 * On success Frappe sets session cookies; we also store the user identifier
 * so that `getCurrentUser()` works without an extra round-trip.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: string }> {
  const res = await fetch(`${BASE_URL}/api/method/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ usr: email, pwd: password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>).message ?? "Login failed",
    );
  }

  const data = (await res.json()) as { message: string; full_name?: string };

  // Frappe responds with the user email in `message` on success
  const user = data.message === "Logged In" ? email : data.message;

  // Persist minimally so getCurrentUser works across refreshes
  writeCredentials({ api_key: "", api_secret: "", user });

  return { user };
}

/**
 * Store explicit API key / secret credentials (e.g. from a settings page).
 */
export function setTokenCredentials(
  apiKey: string,
  apiSecret: string,
  user: string,
): void {
  writeCredentials({ api_key: apiKey, api_secret: apiSecret, user });
}

/**
 * Log out of the current Frappe session and clear stored credentials.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/method/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearCredentials();
  }
}

/**
 * Whether the client believes there is an active session.
 * This is a client-side heuristic only; the server may have expired the session.
 */
export function isAuthenticated(): boolean {
  return readCredentials() !== null;
}

/**
 * Return the email of the currently stored user, or `null` if not authenticated.
 */
export function getCurrentUser(): string | null {
  return readCredentials()?.user ?? null;
}
