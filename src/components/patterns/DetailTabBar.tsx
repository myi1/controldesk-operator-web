import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type DetailTab = "overview" | "timeline" | "documents" | "related" | "actions";

export interface DetailTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

interface TabDef {
  value: DetailTab;
  label: string;
}

const TABS: TabDef[] = [
  { value: "overview", label: "Overview" },
  { value: "timeline", label: "Timeline" },
  { value: "documents", label: "Documents" },
  { value: "related", label: "Related" },
  { value: "actions", label: "Actions" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DetailTabBar({ activeTab, onTabChange }: DetailTabBarProps) {
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List
        className={cn(
          "sticky top-0 z-[9]",
          "flex items-center gap-0",
          "border-b border-border-default",
          "bg-bg-default",
          "px-6",
          "overflow-x-auto",
        )}
        aria-label="Case detail tabs"
      >
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative",
              "px-3 py-2.5",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "whitespace-nowrap",
              "cursor-pointer select-none",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
              // Default state
              "text-fg-muted hover:text-fg-default",
              // Active state
              "data-[state=active]:text-fg-default",
              "data-[state=active]:font-[number:var(--text-body-medium-weight)]",
              // Active underline
              "after:absolute after:inset-x-0 after:bottom-0",
              "after:h-0.5 after:rounded-full",
              "after:transition-colors after:duration-[var(--duration-fast)]",
              "data-[state=active]:after:bg-accent-primary",
              "data-[state=inactive]:after:bg-transparent",
              // Focus
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:rounded-[var(--radius-sm)]",
            )}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
