// ---------------------------------------------------------------------------
// Command palette store (Zustand)
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentItem {
  id: string;
  title: string;
  type: string;
  path: string;
}

export interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  recentItems: RecentItem[];
  addRecent: (item: RecentItem) => void;
}

const MAX_RECENT = 20;

export const useCommandPaletteStore = create<CommandPaletteState>()(
  persist(
    (set) => ({
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      recentItems: [],
      addRecent: (item) =>
        set((state) => {
          // Remove duplicate if it already exists
          const filtered = state.recentItems.filter((r) => r.id !== item.id);
          // Prepend the new item and cap at MAX_RECENT
          return { recentItems: [item, ...filtered].slice(0, MAX_RECENT) };
        }),
    }),
    {
      name: "controldesk-command-palette",
      partialize: (state) => ({
        recentItems: state.recentItems,
      }),
    },
  ),
);
