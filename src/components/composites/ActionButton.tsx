import { cn } from "../../lib/cn";
import type { ProtectedAction } from "../../types/api";
import type { ActionRiskLevel } from "../../types/enums";
import { Button, type ButtonVariant } from "../primitives/Button";
import { Tooltip } from "../primitives/Tooltip";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ActionButtonProps {
  action: ProtectedAction;
  userRoles: string[];
  onExecute: (actionKey: string) => void;
  loading?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Infer risk level from the action's permission scope.
 * The backend ProtectedAction type doesn't include an explicit risk_level,
 * so we derive it from requires_human_release and permission_scope heuristics.
 */
function inferRiskLevel(action: ProtectedAction): ActionRiskLevel {
  if (action.permission_scope === "critical" || action.action_key.includes("cancel")) {
    return "critical";
  }
  if (action.requires_human_release) {
    return "high";
  }
  if (action.permission_scope === "elevated") {
    return "medium";
  }
  return "low";
}

const riskToVariant: Record<ActionRiskLevel, ButtonVariant> = {
  low: "ghost",
  medium: "secondary",
  high: "primary",
  critical: "danger",
};

function hasRequiredRole(userRoles: string[], availableRoles: string[]): boolean {
  return availableRoles.some((role) => userRoles.includes(role));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ActionButton({
  action,
  userRoles,
  onExecute,
  loading = false,
  className,
}: ActionButtonProps) {
  const canExecute = hasRequiredRole(userRoles, action.available_roles);
  const risk = inferRiskLevel(action);
  const variant = riskToVariant[risk];

  const button = (
    <Button
      variant={variant}
      size="sm"
      disabled={!canExecute}
      loading={loading}
      onClick={() => onExecute(action.action_key)}
      className={cn(className)}
    >
      {action.label}
    </Button>
  );

  if (!canExecute) {
    const requiredRoles = action.available_roles.join(", ");
    return (
      <Tooltip content={`Requires role: ${requiredRoles}`}>
        {/* Wrap in span so disabled button still receives pointer events for tooltip */}
        <span tabIndex={0} className="inline-flex">
          {button}
        </span>
      </Tooltip>
    );
  }

  return button;
}
