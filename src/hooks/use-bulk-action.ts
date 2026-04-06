// ---------------------------------------------------------------------------
// TanStack Query mutation — bulk case action execution
// ---------------------------------------------------------------------------

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeBulkAction,
  type BulkActionParams,
  type BulkActionResponse,
} from "../api/bulk-actions";

export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation<BulkActionResponse, Error, BulkActionParams>({
    mutationFn: executeBulkAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["queue-rows"] });
      void queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
      // Invalidate all open audit timelines — bulk actions may affect any case
      void queryClient.invalidateQueries({ queryKey: ["case-audit-timeline"] });
    },
  });
}
