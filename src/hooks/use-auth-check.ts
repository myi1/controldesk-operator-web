// ---------------------------------------------------------------------------
// Simple auth check — calls Frappe's logged_in endpoint
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";

interface LoggedInResponse {
  message: string; // the user email, or "Guest"
}

async function checkAuth(): Promise<string> {
  const res = await fetch("/api/method/frappe.auth.get_logged_user", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  const data = (await res.json()) as LoggedInResponse;
  if (!data.message || data.message === "Guest") {
    throw new Error("Not authenticated");
  }

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
