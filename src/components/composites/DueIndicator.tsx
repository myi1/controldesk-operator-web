import { cn } from "../../lib/cn";
import { daysUntil } from "../../lib/date";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DueIndicatorProps {
  targetDate: string | null;
  isOverdue: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DueIndicator({ targetDate, isOverdue, className }: DueIndicatorProps) {
  if (!targetDate) {
    return (
      <span
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-fg-muted",
          className,
        )}
      >
        No due date
      </span>
    );
  }

  const days = daysUntil(targetDate);

  if (isOverdue) {
    const overdueDays = Math.abs(days);
    return (
      <span
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-status-danger",
          className,
        )}
      >
        {overdueDays}d overdue
      </span>
    );
  }

  if (days === 0) {
    return (
      <span
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "font-[number:var(--text-body-medium-weight)]",
          "text-status-warning",
          className,
        )}
      >
        Due today
      </span>
    );
  }

  if (days >= 1 && days <= 3) {
    return (
      <span
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-status-warning",
          className,
        )}
      >
        Due in {days}d
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
        "text-fg-muted",
        className,
      )}
    >
      Due in {days}d
    </span>
  );
}
