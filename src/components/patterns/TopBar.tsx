import { Menu, Search, Sun, Moon } from "lucide-react";
import { Button } from "../primitives/Button";
import { Kbd } from "../primitives/Kbd";
import { Avatar } from "../primitives/Avatar";
import { useUIStore } from "../../stores/ui-store";
import { useCommandPaletteStore } from "../../stores/command-palette-store";
import { useTheme } from "../../hooks/use-theme";
import { cn } from "../../lib/cn";

export function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openPalette = useCommandPaletteStore((s) => s.open);
  const { resolvedTheme, setTheme, theme } = useTheme();

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-topbar)]",
        "flex h-[var(--topbar-height)] items-center gap-2",
        "border-b border-border-default",
        "bg-bg-surface px-3",
      )}
    >
      {/* Menu toggle */}
      <Button
        variant="icon"
        size="sm"
        icon={Menu}
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
      />

      {/* Logo */}
      <span className="text-[length:var(--text-body-size)] font-semibold text-fg-default select-none">
        ControlDesk
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search trigger */}
      <Button
        variant="ghost"
        size="sm"
        icon={Search}
        onClick={openPalette}
        className="gap-2 text-fg-muted"
      >
        <span className="hidden sm:inline">Search...</span>
        <Kbd>{"⌘K"}</Kbd>
      </Button>

      {/* Theme toggle */}
      <Button
        variant="icon"
        size="sm"
        icon={resolvedTheme === "dark" ? Sun : Moon}
        aria-label="Toggle theme"
        onClick={cycleTheme}
      />

      {/* User section */}
      <div className="flex items-center gap-2 pl-1">
        <Avatar name="Operator" size="sm" />
        <span className="hidden text-[length:var(--text-small-size)] text-fg-default sm:inline">
          Operator
        </span>
      </div>
    </header>
  );
}
