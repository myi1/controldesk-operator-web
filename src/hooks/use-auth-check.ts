// ---------------------------------------------------------------------------
// Server-side auth check — the single source of truth for session validity
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchCsrfToken } from "../lib/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// ---------------------------------------------------------------------------
// Error sentinel — distinguishes backend unavailability from auth failure
// ---------------------------------------------------------------------------

/**
 * Thrown when the auth endpoint itself is unreachable or returns a 5xx.
 * AppShell checks for this type to show a "service unavailable" banner
 * instead of redirecting to /login (which would also fail).
 */
export class AuthServiceUnavailableError extends Error {
  constructor(status: number) {
    super(
      status === 0
        ? "Could not reach the authentication service. Check your network connection."
        : `Authentication service is unavailable (HTTP ${status}). Please try again later.`,
    );
    this.name = "AuthServiceUnavailableError";
  }
}

// ---------------------------------------------------------------------------
// Query function
// ---------------------------------------------------------------------------

async function checkAuth(): Promise<string> {
  let res: Response;
  try {
    res = await fetch(
      `${BASE_URL}/api/method/frappe.auth.get_logged_user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      },
    );
  } catch {
    // Network-level failure (DNS, connection refused, offline)
    throw new AuthServiceUnavailableError(0);
  }

  // 5xx → service problem, not an auth failure
  if (res.status >= 500) {
    throw new AuthServiceUnavailableError(res.status);
  }

  // 4xx (401, 403, 404) → not authenticated
  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  const data = (await res.json()) as { message: string };
  if (!data.message || data.message === "Guest") {
    throw new Error("Not authenticated");
  }

  // Prime the CSRF token cache now that we know the session is valid.
  // Fire-and-forget — auth check result does not depend on CSRF fetch.
  void fetchCsrfToken();

  return data.message;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuthCheck() {
  return useQuery<string, Error>({
    queryKey: ["auth-check"],
    queryFn: checkAuth,
    staleTime: 60_000,
    // Retry once on transient failures; skip retry for auth/service errors.
    retry: (failureCount, err) =>
      !(err instanceof AuthServiceUnavailableError) &&
      err.message !== "Not authenticated" &&
      failureCount < 1,
    // Poll every 5 minutes so session expiry is detected proactively rather
    // than only when the next real API call happens to return 401.
    refetchInterval: 5 * 60 * 1000,
  });
}
