import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Separator({
  orientation = "horizontal",
  className,
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      decorative
      className={cn(
        "shrink-0 bg-border-default",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
    />
  );
}
