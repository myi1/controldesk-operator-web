// ---------------------------------------------------------------------------
// Bulk selection store (Zustand)
// ---------------------------------------------------------------------------

import { create } from "zustand";

export interface SelectionState {
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  selectRange: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  count: number;
}

export const useSelectionStore = create<SelectionState>()((set, get) => ({
  selectedIds: new Set<string>(),
  count: 0,

  toggle: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next, count: next.size };
    }),

  selectRange: (ids) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      for (const id of ids) {
        next.add(id);
      }
      return { selectedIds: next, count: next.size };
    }),

  selectAll: (ids) =>
    set(() => {
      const next = new Set(ids);
      return { selectedIds: next, count: next.size };
    }),

  clear: () => set({ selectedIds: new Set<string>(), count: 0 }),

  isSelected: (id) => get().selectedIds.has(id),
}));
