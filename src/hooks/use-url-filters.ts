// ---------------------------------------------------------------------------
// URL-synced queue filters hook
// ---------------------------------------------------------------------------

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { QueueFilters } from "../types/ui";
import type { EscalationState } from "../types/enums";

const VALID_ESCALATION_STATES = new Set(["normal", "blocked", "escalated"]);

/**
 * Reads QueueFilters from URL search params and provides a setter
 * that updates the URL. Filters survive page refresh.
 */
export function useUrlFilters(): [QueueFilters, (filters: QueueFilters) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<QueueFilters>(() => {
    const status = searchParams.get("status") || undefined;
    const owner = searchParams.get("owner") || undefined;
    const escalation = searchParams.get("escalation_state") || undefined;
    const overdue = searchParams.get("overdue");
    const search = searchParams.get("q") || undefined;

    return {
      status,
      owner,
      escalation_state: escalation && VALID_ESCALATION_STATES.has(escalation)
        ? (escalation as EscalationState)
        : undefined,
      only_overdue: overdue === "true" ? true : undefined,
      search_text: search,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (next: QueueFilters) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);

        // Helper to set or delete a param
        function sync(key: string, value: string | undefined) {
          if (value) {
            params.set(key, value);
          } else {
            params.delete(key);
          }
        }

        sync("status", next.status);
        sync("owner", next.owner);
        sync("escalation_state", next.escalation_state);
        sync("overdue", next.only_overdue ? "true" : undefined);
        sync("q", next.search_text);

        return params;
      }, { replace: true });
    },
    [setSearchParams],
  );

  return [filters, setFilters];
}
