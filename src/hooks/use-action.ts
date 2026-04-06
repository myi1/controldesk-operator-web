// ---------------------------------------------------------------------------
// TanStack Query mutation — case action execution
// ---------------------------------------------------------------------------

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeAction } from "../api/actions";
import type { ActionParams, ActionResponse } from "../types/api";

export function useAction() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, Error, ActionParams>({
    mutationFn: executeAction,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["queue-rows"] });
      void queryClient.invalidateQueries({
        queryKey: ["case-detail", variables.doctype, variables.docname],
      });
    },
  });
}
