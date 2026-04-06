// ---------------------------------------------------------------------------
// Session management — JWT Bearer tokens, stored in sessionStorage
//
// The new ControlDesk backend (FastAPI) issues stateless JWT access tokens on
// login. We store the token in sessionStorage so it survives tab refresh but
// is automatically cleared when the tab is closed, reducing the attack surface
// compared to localStorage. No credentials are ever persisted to disk.
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "cd_token";

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

/** Return the current access token, or null if not authenticated. */
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/** Persist a new access token (called immediately after a successful login). */
export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/** Remove the access token (called on logout or session expiry). */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export interface LoginUser {
  username: string;
  roles: string[];
  default_actor_role: string;
}

/**
 * Authenticate against the FastAPI token endpoint.
 * On success the JWT is stored in sessionStorage and the user profile is returned.
 */
export async function login(
  username: string,
  password: string,
): Promise<{ user: LoginUser }> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const detail = body.detail;
    const message =
      typeof detail === "string"
        ? detail
        : "Login failed. Please check your credentials.";
    throw new Error(message);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
    expires_at: string;
    user: LoginUser;
  };

  setToken(data.access_token);
  return { user: data.user };
}

// ---------------------------------------------------------------------------
// Logout — client-side only; JWT is stateless so no server call is needed
// ---------------------------------------------------------------------------

/**
 * Sign out the current user by clearing the stored access token.
 * The server does not need to be notified — the token will expire naturally.
 */
export async function logout(): Promise<void> {
  clearToken();
}
