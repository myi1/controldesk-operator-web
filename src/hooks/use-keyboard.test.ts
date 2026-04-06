import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboard } from "./use-keyboard";

/** Fire a keydown event on document with the given properties. */
function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...opts }));
}

/** Fire a keydown event from a simulated input element. */
function fireKeyFromInput(key: string) {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  document.body.removeChild(input);
}

describe("useKeyboard — single key shortcuts", () => {
  it("calls the handler when the key matches", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler }]));
    fireKey("k");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not call handler for a different key", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler }]));
    fireKey("j");
    expect(handler).not.toHaveBeenCalled();
  });

  it("is case-insensitive (uppercase K matches shortcut 'k')", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler }]));
    fireKey("K");
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe("useKeyboard — modifier keys", () => {
  it("matches mod+k when ctrlKey is pressed (non-Mac)", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "mod+k", handler }]));
    // use-keyboard checks isMac via navigator.userAgent; jsdom is non-Mac
    fireKey("k", { ctrlKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does NOT match mod+k without a modifier", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "mod+k", handler }]));
    fireKey("k");
    expect(handler).not.toHaveBeenCalled();
  });

  it("does NOT match plain 'k' when ctrl is held", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler }]));
    fireKey("k", { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useKeyboard — enabled flag", () => {
  it("skips the handler when enabled is false", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler, enabled: false }]));
    fireKey("k");
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the handler when enabled is true (or omitted)", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler, enabled: true }]));
    fireKey("k");
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe("useKeyboard — input element exclusion", () => {
  it("does NOT trigger when the event target is an INPUT element", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard([{ key: "k", handler }]));
    fireKeyFromInput("k");
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useKeyboard — listener cleanup", () => {
  it("removes the event listener on unmount", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useKeyboard([{ key: "k", handler: vi.fn() }]),
    );

    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
