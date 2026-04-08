// ---------------------------------------------------------------------------
// ConfirmActionRunner — confirm-only action shell (no form fields)
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "../composites/ConfirmDialog";
import { useToast } from "../patterns/NotificationToast";
import { useRoleGate } from "../../hooks/use-role-gate";
import { executeConfirmAction } from "../../api/runners";
import { ApiError } from "../../api/client";
import type { ConfirmActionConfig } from "../../types/runner";

interface ConfirmActionRunnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ConfirmActionConfig;
  recordId: string;
}

function mapApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.httpStatus === 400)
      return "The submitted data was rejected. Check required fields and try again.";
    if (err.httpStatus === 403)
      return "You do not have permission to perform this action.";
    if (err.httpStatus === 404)
      return "This record no longer exists. Refresh the page.";
    if (err.httpStatus === 409)
      return "This action conflicts with a concurrent change. Refresh and retry.";
    if (err.httpStatus === 422)
      return "Validation failed. Review your inputs.";
    if (err.httpStatus >= 500)
      return "A server error occurred. Please try again in a moment.";
    return err.message;
  }
  return "An unexpected error occurred. Please try again.";
}

export function ConfirmActionRunner({
  open,
  onOpenChange,
  config,
  recordId,
}: ConfirmActionRunnerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeRoles } = useRoleGate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the runner restricts to certain roles and none intersect with the user's
  // active roles, do not render at all (ISSUE-013).
  if (
    config.allowedRoles.length > 0 &&
    !config.allowedRoles.some((r) => activeRoles.includes(r))
  ) {
    return null;
  }

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await executeConfirmAction(config.endpoint, recordId, config.fixedPayload ?? {});

      // Invalidate TanStack Query caches
      for (const key of config.invalidates) {
        await queryClient.invalidateQueries({ queryKey: [key] });
      }

      toast({
        title: "Success",
        description: config.successMessage,
        variant: "success",
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Action failed",
        description: mapApiError(err),
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
      confirmVariant={config.confirmVariant}
      loading={isSubmitting}
      onConfirm={() => void handleConfirm()}
    />
  );
}
