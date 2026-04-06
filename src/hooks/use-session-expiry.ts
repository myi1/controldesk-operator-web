// ---------------------------------------------------------------------------
// Session expiry watcher
//
// Listens for the "controldesk:session-expired" custom event dispatched by
// api/client.ts whenever a 401 is received. Redirects the user to /login
// while preserving the current URL as a `?next=` param so they land back
// where they were after re-authenticating.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearCsrfToken } from "../lib/auth";

export function useSessionExpiry(): void {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Use a ref so the handler closure always reads the latest location
  // without needing to be re-registered on every navigation.
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    let handled = false;

    function handleExpiry() {
      // Guard against duplicate events from concurrent in-flight requests
      if (handled) return;
      handled = true;

      clearCsrfToken();
      queryClient.clear();

      const returnTo = locationRef.current.pathname + locationRef.current.search;
      const loginUrl =
        returnTo && returnTo !== "/" && returnTo !== "/login"
          ? `/login?next=${encodeURIComponent(returnTo)}`
          : "/login";

      navigate(loginUrl, { replace: true });
    }

    window.addEventListener("controldesk:session-expired", handleExpiry);
    return () => {
      window.removeEventListener("controldesk:session-expired", handleExpiry);
    };
  }, [navigate, queryClient]);
}
