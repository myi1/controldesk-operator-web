import { cn } from "../../lib/cn";
import { getStatusEntry } from "../../config/status-config";
import type { StatusColor } from "../../types/enums";

export interface StatusBadgeProps {
  status: string;
  queueKey: string;
  size?: "sm" | "md";
  className?: string;
}

const colorToTextClass: Record<StatusColor, string> = {
  success: "text-status-success",
  warning: "text-status-warning",
  danger:  "text-status-danger",
  info:    "text-status-info",
  primary: "text-accent-primary",
  neutral: "text-fg-muted",
};

export function StatusBadge({ status, queueKey, size = "md", className }: StatusBadgeProps) {
  const entry = getStatusEntry(queueKey, status);
  return (
    <span
      className={cn(
        size === "sm"
          ? "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]"
          : "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
        "font-[number:var(--text-caption-medium-weight)]",
        colorToTextClass[entry.color],
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
