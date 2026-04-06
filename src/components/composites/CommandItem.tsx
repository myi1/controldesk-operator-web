import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CommandItemProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect: () => void;
  active?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Kbd helper                                                         */
/* ------------------------------------------------------------------ */

function Kbd({ children }: { children: string }) {
  return (
    <kbd
      className={cn(
        "ml-auto shrink-0",
        "inline-flex items-center justify-center",
        "h-5 min-w-5 px-1.5",
        "rounded-[var(--radius-sm)]",
        "bg-bg-surface-inset",
        "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
        "font-[family-name:var(--font-mono)]",
        "text-fg-muted",
        "border border-border-default",
      )}
    >
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandItem({
  icon: Icon,
  label,
  description,
  shortcut,
  onSelect,
  active = false,
  className,
}: CommandItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2",
        "px-2 py-1.5",
        "rounded-[var(--radius-md)]",
        "text-left",
        "cursor-pointer select-none",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
        active ? "bg-bg-hover" : "bg-transparent",
        "hover:bg-bg-hover",
        "focus-ring",
        className,
      )}
    >
      {Icon && (
        <Icon
          size={16}
          className="shrink-0 text-fg-muted"
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "text-fg-default",
          )}
        >
          {label}
        </span>
        {description && (
          <span
            className={cn(
              "truncate",
              "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
              "text-fg-muted",
            )}
          >
            {description}
          </span>
        )}
      </div>

      {shortcut && <Kbd>{shortcut}</Kbd>}
    </button>
  );
}
