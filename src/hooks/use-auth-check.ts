// ---------------------------------------------------------------------------
// Server-side auth check — the single source of truth for session validity
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { getToken } from "../lib/auth";
import type { LoginUser } from "../lib/auth";

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

async function checkAuth(): Promise<LoginUser> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Network-level failure (DNS, connection refused, offline)
    throw new AuthServiceUnavailableError(0);
  }

  // 5xx → service problem, not an auth failure
  if (res.status >= 500) {
    throw new AuthServiceUnavailableError(res.status);
  }

  // 4xx (401, 403, 404) → not authenticated or token expired
  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  const data = (await res.json()) as LoginUser;
  if (!data.username) {
    throw new Error("Not authenticated");
  }

  return data;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuthCheck() {
  return useQuery<LoginUser, Error>({
    queryKey: ["auth-check"],
    queryFn: checkAuth,
    staleTime: 60_000,
    // Retry once on transient failures; skip retry for auth/service errors.
    retry: (failureCount, err) =>
      !(err instanceof AuthServiceUnavailableError) &&
      err.message !== "Not authenticated" &&
      failureCount < 1,
    // Poll every 5 minutes so token expiry is detected proactively.
    refetchInterval: 5 * 60 * 1000,
  });
}
