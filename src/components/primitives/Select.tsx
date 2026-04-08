import { useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

function Select({
  label,
  placeholder = "Select\u2026",
  options,
  value,
  onValueChange,
  error,
  disabled,
  className,
}: SelectProps) {
  const autoId = useId();
  const triggerId = `${autoId}-trigger`;
  const errorId = `${autoId}-error`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label
          htmlFor={triggerId}
          className="text-[length:var(--text-small-size)] font-medium text-fg-default"
        >
          {label}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={triggerId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-[var(--radius-md)] border bg-bg-surface px-3 text-[length:var(--text-small-size)] text-fg-default",
            "outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-default)]",
            "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-2 focus-visible:outline-[var(--ring-focus)] focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[placeholder]:text-fg-faint",
            error
              ? "border-status-danger focus-visible:border-status-danger focus-visible:outline-status-danger"
              : "border-border-default",
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown size={16} className="text-fg-faint" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={cn(
              "z-[var(--z-modal-dropdown)] max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-auto rounded-[var(--radius-lg)] border border-border-default bg-bg-surface-raised p-1 shadow-md",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "relative flex h-8 cursor-pointer select-none items-center rounded-[var(--radius-md)] pl-8 pr-3 text-[length:var(--text-small-size)] text-fg-default outline-none whitespace-nowrap",
                    "transition-colors duration-[var(--duration-instant)] ease-[var(--ease-default)]",
                    "hover:bg-bg-hover focus:bg-bg-hover",
                    "data-[state=checked]:bg-bg-active data-[state=checked]:text-accent-primary",
                  )}
                >
                  <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center justify-center">
                    <Check size={14} aria-hidden />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[length:var(--text-caption-size)] text-status-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

Select.displayName = "Select";

export { Select };
export type { SelectProps, SelectOption };
