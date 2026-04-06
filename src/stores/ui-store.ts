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
    }),
    {
      name: "controldesk-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rowDensity: state.rowDensity,
      }),
    },
  ),
);
