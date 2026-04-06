import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-accent-primary text-fg-on-emphasis",
    "hover:bg-accent-primary-hover",
    "active:brightness-90",
  ].join(" "),

  secondary: [
    "bg-bg-surface text-fg-default",
    "border border-border-default",
    "hover:bg-bg-hover",
    "active:bg-bg-active",
  ].join(" "),

  ghost: [
    "bg-transparent text-fg-muted",
    "hover:bg-bg-hover hover:text-fg-default",
    "active:bg-bg-active",
  ].join(" "),

  danger: [
    "bg-status-danger text-fg-on-emphasis",
    "hover:brightness-90",
    "active:brightness-80",
  ].join(" "),

  icon: [
    "bg-transparent text-fg-muted",
    "hover:bg-bg-hover hover:text-fg-default",
    "active:bg-bg-active",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-[length:var(--text-small-size)] gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-8 px-3   text-[length:var(--text-small-size)] gap-1.5 rounded-[var(--radius-md)]",
  lg: "h-9 px-4   text-[length:var(--text-body-size)]  gap-2   rounded-[var(--radius-md)]",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 w-7 rounded-[var(--radius-sm)]",
  md: "h-8 w-8 rounded-[var(--radius-md)]",
  lg: "h-9 w-9 rounded-[var(--radius-md)]",
};

const iconSizeMap: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */

function Spinner({ size }: { size: number }) {
  return (
    <Loader2
      size={size}
      className="animate-spin"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon: Icon,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isIconOnly = variant === "icon";
    const isDisabled = disabled || loading;
    const iconPx = iconSizeMap[size];

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={cn(
          // Base
          "inline-flex items-center justify-center",
          "whitespace-nowrap select-none",
          "font-[number:var(--text-body-medium-weight)]",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
          "focus-ring",
          "cursor-pointer",

          // Disabled
          "disabled:opacity-50 disabled:pointer-events-none",

          // Variant
          variantStyles[variant],

          // Size — icon-only squares use a different map
          isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],

          className,
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner size={iconPx} />
            {!isIconOnly && children && (
              <span className="opacity-70">{children}</span>
            )}
          </>
        ) : (
          <>
            {Icon && <Icon size={iconPx} aria-hidden="true" />}
            {!isIconOnly && children}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
