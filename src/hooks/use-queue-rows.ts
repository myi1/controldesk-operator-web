// ---------------------------------------------------------------------------
// TanStack Query hook — queue rows
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchQueueRows } from "../api/queue";
import type { QueueRowsResponse } from "../types/api";
import type { QueueFilters } from "../types/ui";

export interface UseQueueRowsOptions {
  queueName?: string;
  scopeName?: string;
  filters: QueueFilters;
}

export function useQueueRows(
  queueKey: string | null,
  filters: QueueFilters,
  scopeName?: string,
) {
  return useQuery<QueueRowsResponse>({
    queryKey: ["queue-rows", queueKey, scopeName, filters],
    queryFn: () =>
      fetchQueueRows({
        queue_name: scopeName ? undefined : queueKey!,
        scope_name: scopeName,
        status: filters.status,
        current_owner: filters.owner,
        escalation_state: filters.escalation_state,
        only_overdue: filters.only_overdue,
        search_text: filters.search_text,
      }),
    enabled: !!queueKey || !!scopeName,
  });
}
