// ---------------------------------------------------------------------------
// TanStack Query hook — bootstrap data
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchBootstrap } from "../api/bootstrap";
import type { BootstrapResponse } from "../types/api";

export function useBootstrap() {
  return useQuery<BootstrapResponse>({
    queryKey: ["bootstrap"],
    queryFn: () => fetchBootstrap(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
