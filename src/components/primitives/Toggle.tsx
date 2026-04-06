import { useId } from "react";
import { cn } from "../../lib/cn";

interface ToggleProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function Toggle({
  label,
  checked = false,
  onCheckedChange,
  disabled,
  className,
}: ToggleProps) {
  const autoId = useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        id={autoId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 outline-none",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
          "focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-2 focus-visible:outline-[var(--ring-focus)] focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "border-accent-primary bg-accent-primary"
            : "border-border-emphasis bg-bg-surface",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm",
            "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-default)]",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>

      {label && (
        <label
          htmlFor={autoId}
          className={cn(
            "cursor-pointer select-none text-[length:var(--text-small-size)] text-fg-default",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

Toggle.displayName = "Toggle";

export { Toggle };
export type { ToggleProps };
