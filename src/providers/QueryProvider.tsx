// ---------------------------------------------------------------------------
// TanStack Query provider with global defaults
// ---------------------------------------------------------------------------

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiError } from "../api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Never retry auth errors
        if (error instanceof ApiError && (error.httpStatus === 401 || error.httpStatus === 403)) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: true,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
