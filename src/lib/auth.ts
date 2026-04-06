// ---------------------------------------------------------------------------
// Session management for Frappe — cookie-based, no credentials in localStorage
//
// Frappe sets an httpOnly session cookie on successful login. All subsequent
// requests carry that cookie automatically (credentials: "include"). We do NOT
// store any credentials or user identity in localStorage; the server is the
// only source of truth for session validity.
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Authenticate against Frappe's built-in login endpoint.
 * On success Frappe sets a session cookie; no credentials are persisted
 * on the client.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: string }> {
  const res = await fetch(`${BASE_URL}/api/method/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ usr: email, pwd: password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(body.message ?? "Login failed. Please check your credentials.");
  }

  const data = (await res.json()) as { message: string; full_name?: string };

  // Frappe responds with "Logged In" in `message` on success
  const user = data.message === "Logged In" ? email : data.message;
  return { user };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

/**
 * Terminate the current Frappe session.
 * The CSRF token is included so the backend accepts the POST.
 */
export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/method/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
    credentials: "include",
  }).catch((err: unknown) => {
    // Best-effort — even if the network call fails, the client-side
    // cleanup below will run so the user is redirected to login.
    console.warn("[auth] Logout request failed (session may still be active on server):", err);
  });
}

// ---------------------------------------------------------------------------
// CSRF token — in-memory only, never persisted
// ---------------------------------------------------------------------------
//
// Frappe embeds csrf_token in the HTML it serves. For a standalone SPA
// we fetch it once after login from a lightweight bootstrap GET, then cache
// it in a module-level variable for the lifetime of the page.
//
// Rotation: if any request receives a 403 we call refreshCsrfToken() to
// re-fetch and retry (handled in api/client.ts).

let _csrfToken = "";

/** Return the cached CSRF token (empty string if not yet fetched). */
export function getCsrfToken(): string {
  return _csrfToken;
}

/** Store a new CSRF token (called by the API client on 403 retry). */
export function setCsrfToken(token: string): void {
  _csrfToken = token;
}

/**
 * Fetch the CSRF token from Frappe and cache it.
 *
 * Frappe embeds `csrf_token = "…"` in its HTML shell. When the SPA is served
 * through Frappe (the normal production setup) we parse it from the page body.
 * In dev (Vite proxy) we fall back to an unauthenticated GET that returns a
 * minimal HTML fragment containing the token.
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "text/html" },
    });
    const html = await res.text();
    // Frappe injects:  csrf_token = "abc123"
    const match = html.match(/csrf_token\s*=\s*["']([^"']{10,})["']/);
    if (match?.[1]) {
      _csrfToken = match[1];
      return _csrfToken;
    }
  } catch (err) {
    // Non-fatal — requests will proceed without CSRF header and the backend
    // will reject them with 403 if it requires the token, triggering a retry.
    console.warn("[auth] CSRF token fetch failed:", err);
  }
  return _csrfToken;
}

/** Clear the cached CSRF token (on logout). */
export function clearCsrfToken(): void {
  _csrfToken = "";
}
