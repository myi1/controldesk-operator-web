// ---------------------------------------------------------------------------
// UI state store (Zustand)
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  rowDensity: "compact" | "comfortable";
  setRowDensity: (d: "compact" | "comfortable") => void;

  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;

  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;

  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;

  /** Roles the user has currently toggled on. Empty = not yet initialised (hook will seed from userRoles). */
  activeRoles: string[];
  setActiveRoles: (roles: string[]) => void;
  /** Toggle a single role on/off. A user must retain at least 1 active role. */
  toggleRole: (role: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      rowDensity: "comfortable",
      setRowDensity: (rowDensity) => set({ rowDensity }),

      selectedRowId: null,
      setSelectedRowId: (selectedRowId) => set({ selectedRowId }),

      previewOpen: false,
      setPreviewOpen: (previewOpen) => set({ previewOpen }),

      shortcutsOpen: false,
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),

      activeRoles: [],
      setActiveRoles: (activeRoles) => set({ activeRoles }),
      toggleRole: (role) =>
        set((s) => {
          const isActive = s.activeRoles.includes(role);
          // Prevent deactivating the last role
          if (isActive && s.activeRoles.length <= 1) return s;
          const next = isActive
            ? s.activeRoles.filter((r) => r !== role)
            : [...s.activeRoles, role];
          return { activeRoles: next };
        }),
    }),
    {
      name: "controldesk-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rowDensity: state.rowDensity,
        activeRoles: state.activeRoles,
      }),
    },
  ),
);
