// ---------------------------------------------------------------------------
// Server-side auth check — the single source of truth for session validity
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchCsrfToken } from "../lib/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function checkAuth(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/method/frappe.auth.get_logged_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
  });

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

export function useAuthCheck() {
  return useQuery<string, Error>({
    queryKey: ["auth-check"],
    queryFn: checkAuth,
    staleTime: 60_000,
    retry: false,
  });
}
