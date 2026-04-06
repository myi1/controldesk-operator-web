import { cn } from "../../lib/cn";
import { getStatusEntry } from "../../config/status-config";
import type { StatusColor } from "../../types/enums";
import { Badge, type BadgeVariant, type BadgeSize } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StatusBadgeProps {
  status: string;
  queueKey: string;
  size?: BadgeSize;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Color mapping                                                      */
/* ------------------------------------------------------------------ */

const colorToBadgeVariant: Record<StatusColor, BadgeVariant> = {
  info: "info",
  primary: "default",
  warning: "warning",
  danger: "danger",
  success: "success",
  neutral: "neutral",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StatusBadge({ status, queueKey, size = "md", className }: StatusBadgeProps) {
  const entry = getStatusEntry(queueKey, status);
  const variant = colorToBadgeVariant[entry.color];

  return (
    <Badge variant={variant} size={size} className={cn(className)}>
      {entry.label}
    </Badge>
  );
}
