import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { cn } from "../../lib/cn";

type InputSize = "md" | "lg";

interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon;
  inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  md: "h-8 text-[length:var(--text-small-size)]",
  lg: "h-9 text-[length:var(--text-body-size)]",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      type = "text",
      icon: Icon,
      inputSize = "md",
      className,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const isSearch = type === "search";
    const LeadingIcon = Icon ?? (isSearch ? Search : undefined);

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-[length:var(--text-small-size)] font-medium text-fg-default"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {LeadingIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <LeadingIcon
                size={16}
                className="text-fg-faint"
                aria-hidden="true"
              />
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full rounded-[var(--radius-md)] border bg-bg-surface px-3 text-fg-default placeholder:text-fg-faint",
              "outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-default)]",
              "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-2 focus-visible:outline-[var(--ring-focus)] focus-visible:outline-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[inputSize],
              LeadingIcon ? "pl-8" : "",
              error
                ? "border-status-danger focus-visible:border-status-danger focus-visible:outline-status-danger"
                : "border-border-default",
            )}
            {...props}
          />
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-[length:var(--text-caption-size)] text-status-danger"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="text-[length:var(--text-caption-size)] text-fg-muted"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
