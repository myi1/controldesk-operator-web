// ---------------------------------------------------------------------------
// TanStack Query hook — SLA breach data (Phase 8)
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchSLABreaches } from "../api/manager-oversight";
import type { SLABreachSummary } from "../types/api";

export function useSLABreaches() {
  return useQuery<SLABreachSummary[]>({
    queryKey: ["sla-breaches"],
    queryFn: () => fetchSLABreaches(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
