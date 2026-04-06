// ---------------------------------------------------------------------------
// SettingsPage — route: /settings
// ---------------------------------------------------------------------------

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Monitor, Sun, Moon } from "lucide-react";
import { cn } from "../lib/cn";
import { logout, clearCsrfToken } from "../lib/auth";
import { useTheme } from "../hooks/use-theme";
import { useUIStore } from "../stores/ui-store";
import { useRoleGate } from "../hooks/use-role-gate";
import { useAuthCheck } from "../hooks/use-auth-check";
import {
  KEYBOARD_SHORTCUTS,
  type ShortcutScope,
} from "../config/keyboard-shortcuts";
import { Button } from "../components/primitives/Button";
import { Badge } from "../components/primitives/Badge";
import { Kbd } from "../components/primitives/Kbd";
import { Toggle } from "../components/primitives/Toggle";

/* ------------------------------------------------------------------ */
/*  Theme option button                                                */
/* ------------------------------------------------------------------ */

type ThemeValue = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemeValue; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function ThemeOption({
  value,
  label,
  icon: Icon,
  selected,
  onSelect,
}: {
  value: ThemeValue;
  label: string;
  icon: typeof Sun;
  selected: boolean;
  onSelect: (value: ThemeValue) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-2.5 cursor-pointer",
        "text-[length:var(--text-small-size)] font-[number:var(--text-body-medium-weight)]",
        "transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]",
        "focus-ring",
        selected
          ? "border-accent-primary bg-accent-primary-subtle text-accent-primary"
          : "border-border-default bg-bg-surface text-fg-muted hover:bg-bg-hover hover:text-fg-default",
      )}
    >
      <Icon size={16} aria-hidden />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Scope badge                                                        */
/* ------------------------------------------------------------------ */

const SCOPE_VARIANT: Record<ShortcutScope, "info" | "warning" | "neutral"> = {
  global: "info",
  queue: "warning",
  detail: "neutral",
};

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={cn(
          "text-[length:var(--text-heading-sm-size)] leading-[var(--text-heading-sm-leading)]",
          "font-semibold text-fg-default mb-4",
        )}
      >
        {title}
      </h2>
      <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-5">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { rowDensity, setRowDensity, sidebarCollapsed, toggleSidebar } =
    useUIStore();
  const { userRoles } = useRoleGate();
  const { data: currentUser } = useAuthCheck();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      // Always clean up client-side state, even if the network call failed
      clearCsrfToken();
      await queryClient.cancelQueries();
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  }, [navigate, queryClient]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[640px] px-6 py-8 space-y-8">
        {/* Page header */}
        <div>
          <h1
            className={cn(
              "text-[length:var(--text-heading-lg-size)] leading-[var(--text-heading-lg-leading)]",
              "font-semibold text-fg-default",
            )}
          >
            Settings
          </h1>
          <p className="mt-1 text-[length:var(--text-body-size)] text-fg-muted">
            Manage your preferences and account settings.
          </p>
        </div>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <div className="space-y-5">
            {/* Theme selector */}
            <div>
              <label id="theme-label" className="text-[length:var(--text-small-size)] font-medium text-fg-default block mb-2">
                Theme
              </label>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="theme-label">
                {THEME_OPTIONS.map((opt) => (
                  <ThemeOption
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    icon={opt.icon}
                    selected={theme === opt.value}
                    onSelect={setTheme}
                  />
                ))}
              </div>
            </div>

            {/* Row density */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                  Row density
                </p>
                <p className="text-[length:var(--text-caption-size)] text-fg-muted">
                  {rowDensity === "compact" ? "Compact" : "Comfortable"} row spacing
                </p>
              </div>
              <Toggle
                label={rowDensity === "compact" ? "Compact" : "Comfortable"}
                checked={rowDensity === "compact"}
                onCheckedChange={(checked) =>
                  setRowDensity(checked ? "compact" : "comfortable")
                }
              />
            </div>

            {/* Sidebar default */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                  Sidebar
                </p>
                <p className="text-[length:var(--text-caption-size)] text-fg-muted">
                  {sidebarCollapsed ? "Start collapsed" : "Start expanded"}
                </p>
              </div>
              <Toggle
                label={sidebarCollapsed ? "Collapsed" : "Expanded"}
                checked={!sidebarCollapsed}
                onCheckedChange={() => toggleSidebar()}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Keyboard shortcuts */}
        <SettingsSection title="Keyboard Shortcuts">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-default">
                  <th scope="col" className="pb-2 pr-4 text-[length:var(--text-caption-size)] font-[number:var(--text-body-medium-weight)] text-fg-muted">
                    Key
                  </th>
                  <th scope="col" className="pb-2 pr-4 text-[length:var(--text-caption-size)] font-[number:var(--text-body-medium-weight)] text-fg-muted">
                    Description
                  </th>
                  <th scope="col" className="pb-2 text-[length:var(--text-caption-size)] font-[number:var(--text-body-medium-weight)] text-fg-muted">
                    Scope
                  </th>
                </tr>
              </thead>
              <tbody>
                {KEYBOARD_SHORTCUTS.map((shortcut) => (
                  <tr
                    key={shortcut.key}
                    className="border-b border-border-default last:border-b-0"
                  >
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1">
                        {shortcut.key.split("+").map((part) => (
                          <Kbd key={part}>{part}</Kbd>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-[length:var(--text-small-size)] text-fg-default">
                      {shortcut.description}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={SCOPE_VARIANT[shortcut.scope]}
                        size="sm"
                      >
                        {shortcut.scope}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                  Email
                </p>
                <p className="text-[length:var(--text-small-size)] text-fg-muted">
                  {currentUser ?? "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[length:var(--text-small-size)] font-medium text-fg-default mb-2">
                Current roles
              </p>
              <div className="flex flex-wrap gap-2">
                {userRoles.length > 0 ? (
                  userRoles.map((role) => (
                    <Badge key={role} variant="default" size="sm">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[length:var(--text-small-size)] text-fg-muted">
                    No roles assigned
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border-default">
              <Button
                variant="danger"
                icon={LogOut}
                disabled={signingOut}
                onClick={() => void handleSignOut()}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
