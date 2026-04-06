import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ProgressVariant = "default" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md";

export interface ProgressProps {
  /** 0-100. Omit or pass undefined for indeterminate mode. */
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const variantFill: Record<ProgressVariant, string> = {
  default: "bg-accent-primary",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
};

const sizeHeight: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-2",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  className,
}: ProgressProps) {
  const isIndeterminate = value === undefined;
  const pct = isIndeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-bg-surface-inset",
        sizeHeight[size],
        className,
      )}
    >
      {isIndeterminate ? (
        <div
          className={cn(
            "h-full w-1/3 rounded-full",
            variantFill[variant],
            "animate-[progress-shimmer_1.5s_ease-in-out_infinite]",
          )}
        />
      ) : (
        <div
          className={cn(
            "h-full rounded-full",
            "transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-default)]",
            variantFill[variant],
          )}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}
