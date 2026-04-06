import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "./selection-store";

/** Reset the store to initial state before every test. */
beforeEach(() => {
  useSelectionStore.setState({ selectedIds: new Set(), count: 0 });
});

describe("toggle", () => {
  it("adds an id that is not yet selected", () => {
    useSelectionStore.getState().toggle("a");
    expect(useSelectionStore.getState().selectedIds.has("a")).toBe(true);
    expect(useSelectionStore.getState().count).toBe(1);
  });

  it("removes an id that is already selected", () => {
    useSelectionStore.getState().toggle("a");
    useSelectionStore.getState().toggle("a");
    expect(useSelectionStore.getState().selectedIds.has("a")).toBe(false);
    expect(useSelectionStore.getState().count).toBe(0);
  });

  it("creates a new Set instance (immutability)", () => {
    const before = useSelectionStore.getState().selectedIds;
    useSelectionStore.getState().toggle("x");
    const after = useSelectionStore.getState().selectedIds;
    expect(after).not.toBe(before);
  });
});

describe("selectRange", () => {
  it("adds multiple ids without removing existing ones", () => {
    useSelectionStore.getState().toggle("a");
    useSelectionStore.getState().selectRange(["b", "c"]);
    const { selectedIds } = useSelectionStore.getState();
    expect(selectedIds.has("a")).toBe(true);
    expect(selectedIds.has("b")).toBe(true);
    expect(selectedIds.has("c")).toBe(true);
    expect(useSelectionStore.getState().count).toBe(3);
  });

  it("handles duplicate ids gracefully", () => {
    useSelectionStore.getState().selectRange(["a", "a", "b"]);
    expect(useSelectionStore.getState().count).toBe(2);
  });
});

describe("selectAll", () => {
  it("replaces the current selection with the given ids", () => {
    useSelectionStore.getState().toggle("old");
    useSelectionStore.getState().selectAll(["x", "y"]);
    const { selectedIds } = useSelectionStore.getState();
    expect(selectedIds.has("old")).toBe(false);
    expect(selectedIds.has("x")).toBe(true);
    expect(selectedIds.has("y")).toBe(true);
    expect(useSelectionStore.getState().count).toBe(2);
  });
});

describe("clear", () => {
  it("empties the selection and resets count to 0", () => {
    useSelectionStore.getState().selectAll(["a", "b", "c"]);
    useSelectionStore.getState().clear();
    expect(useSelectionStore.getState().selectedIds.size).toBe(0);
    expect(useSelectionStore.getState().count).toBe(0);
  });
});

describe("isSelected", () => {
  it("returns true for a selected id", () => {
    useSelectionStore.getState().toggle("z");
    expect(useSelectionStore.getState().isSelected("z")).toBe(true);
  });

  it("returns false for an id that was never selected", () => {
    expect(useSelectionStore.getState().isSelected("missing")).toBe(false);
  });

  it("returns false after the id has been toggled off", () => {
    useSelectionStore.getState().toggle("w");
    useSelectionStore.getState().toggle("w");
    expect(useSelectionStore.getState().isSelected("w")).toBe(false);
  });
});
