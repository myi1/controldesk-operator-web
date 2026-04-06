import { cn } from "../../lib/cn";
import { Badge } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SubStatusRowProps {
  label: string;
  value: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SubStatusRow({ label, value, className }: SubStatusRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        "py-1",
        className,
      )}
    >
      <span
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-fg-muted",
        )}
      >
        {label}
      </span>
      <Badge variant="neutral" size="sm">
        {value}
      </Badge>
    </div>
  );
}
