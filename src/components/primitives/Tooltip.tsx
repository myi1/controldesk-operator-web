import { type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TooltipProps {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  children: ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Tooltip({
  content,
  side = "top",
  delayDuration = 200,
  children,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 max-w-[240px]",
            "bg-fg-default text-fg-on-emphasis",
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "px-2 py-1",
            "rounded-[var(--radius-md)]",
            "shadow-md",
            "select-none",
            // Animate fade in/out
            "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-[var(--duration-fast)]",
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-fg-default" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
