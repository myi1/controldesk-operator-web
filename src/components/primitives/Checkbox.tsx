import { useId } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";

interface CheckboxProps {
  label?: string;
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}

function Checkbox({
  label,
  checked,
  onCheckedChange,
  indeterminate,
  disabled,
  className,
}: CheckboxProps) {
  const autoId = useId();

  const resolvedChecked = indeterminate ? "indeterminate" : checked;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CheckboxPrimitive.Root
        id={autoId}
        checked={resolvedChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border-default bg-bg-surface",
          "outline-none transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-default)]",
          "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-2 focus-visible:outline-[var(--ring-focus)] focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:border-accent-primary data-[state=checked]:bg-accent-primary",
          "data-[state=indeterminate]:border-accent-primary data-[state=indeterminate]:bg-accent-primary",
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-fg-on-emphasis">
          {resolvedChecked === "indeterminate" ? (
            <Minus size={12} strokeWidth={3} aria-hidden />
          ) : (
            <Check size={12} strokeWidth={3} aria-hidden />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

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

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };
