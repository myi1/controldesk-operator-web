import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface KbdProps {
  children: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Kbd({ children, className }: KbdProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "bg-bg-surface-inset",
        "border border-border-default",
        "rounded-[var(--radius-sm)]",
        "text-[length:var(--text-caption-size)] font-mono",
        "px-1.5 py-0.5",
        "min-w-[20px] text-center",
        className,
      )}
    >
      {children}
    </span>
  );
}
