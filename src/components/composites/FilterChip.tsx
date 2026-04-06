import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "h-6 pl-2 pr-1",
        "rounded-[var(--radius-full)]",
        "bg-bg-surface-inset",
        "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
        "text-fg-default",
        className,
      )}
    >
      <span className="text-fg-muted">{label}:</span>
      <span className="font-[number:var(--text-caption-medium-weight)]">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className={cn(
          "inline-flex items-center justify-center",
          "size-4 rounded-full",
          "text-fg-muted",
          "hover:bg-bg-hover hover:text-fg-default",
          "transition-colors duration-[var(--duration-fast)]",
          "cursor-pointer",
        )}
      >
        <X size={12} aria-hidden="true" />
      </button>
    </span>
  );
}
