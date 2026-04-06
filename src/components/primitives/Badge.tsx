import { type ReactNode } from "react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  /* Queue family colors */
  | "onboarding"
  | "vacancy"
  | "maintenance"
  | "receivables"
  | "renewals"
  | "moveout"
  | "reporting"
  | "service-recovery"
  | "commercial-intake"
  | "approvals"
  | "integration-sync"
  | "documents"
  | "handoffs"
  | "escalations"
  | "sla-watch";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show as a small colored dot instead of a filled badge. */
  dot?: boolean;
  className?: string;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Color map                                                          */
/* ------------------------------------------------------------------ */

/**
 * Each entry returns [bg, text, dotColor].
 * We use the subtle variant for the background and the full color for text/dot.
 */
const colorMap: Record<BadgeVariant, { bg: string; fg: string; dot: string }> = {
  default:   { bg: "bg-accent-primary-subtle", fg: "text-accent-primary",  dot: "bg-accent-primary" },
  success:   { bg: "bg-status-success-subtle", fg: "text-status-success",  dot: "bg-status-success" },
  warning:   { bg: "bg-status-warning-subtle", fg: "text-status-warning",  dot: "bg-status-warning" },
  danger:    { bg: "bg-status-danger-subtle",  fg: "text-status-danger",   dot: "bg-status-danger" },
  info:      { bg: "bg-status-info-subtle",    fg: "text-status-info",     dot: "bg-status-info" },
  neutral:   { bg: "bg-status-neutral-subtle", fg: "text-status-neutral",  dot: "bg-status-neutral" },

  /* Queue families — no subtle token, so we use a 10% opacity overlay approach */
  onboarding:        queueColor("--queue-onboarding"),
  vacancy:           queueColor("--queue-vacancy"),
  maintenance:       queueColor("--queue-maintenance"),
  receivables:       queueColor("--queue-receivables"),
  renewals:          queueColor("--queue-renewals"),
  moveout:           queueColor("--queue-moveout"),
  reporting:         queueColor("--queue-reporting"),
  "service-recovery": queueColor("--queue-service-recovery"),
  "commercial-intake": queueColor("--queue-commercial-intake"),
  approvals:         queueColor("--queue-approvals"),
  "integration-sync": queueColor("--queue-integration-sync"),
  documents:         queueColor("--queue-documents"),
  handoffs:          queueColor("--queue-handoffs"),
  escalations:       queueColor("--queue-escalations"),
  "sla-watch":       queueColor("--queue-sla-watch"),
};

function queueColor(token: string) {
  return {
    bg: `bg-[color-mix(in_srgb,var(${token})_12%,transparent)]`,
    fg: `text-[var(${token})]`,
    dot: `bg-[var(${token})]`,
  };
}

/* ------------------------------------------------------------------ */
/*  Size helpers                                                       */
/* ------------------------------------------------------------------ */

const sizeStyles: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
  md: "h-6 px-2   text-[length:var(--text-small-size)]   leading-[var(--text-small-leading)]",
};

const dotDiameter: Record<BadgeSize, string> = {
  sm: "size-1.5",
  md: "size-2",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
}: BadgeProps) {
  const colors = colorMap[variant];

  if (dot) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          "font-[number:var(--text-caption-medium-weight)]",
          size === "sm"
            ? "text-[length:var(--text-caption-size)]"
            : "text-[length:var(--text-small-size)]",
          "text-fg-default",
          className,
        )}
      >
        <span
          className={cn("shrink-0 rounded-full", dotDiameter[size], colors.dot)}
          aria-hidden="true"
        />
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "whitespace-nowrap rounded-[var(--radius-full)]",
        "font-[number:var(--text-caption-medium-weight)]",
        sizeStyles[size],
        colors.bg,
        colors.fg,
        className,
      )}
    >
      {children}
    </span>
  );
}
