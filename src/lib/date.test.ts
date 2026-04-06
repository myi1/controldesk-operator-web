import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  formatRelative,
  formatAbsolute,
  formatDateTime,
  isOverdue,
  daysUntil,
} from "./date";

// Pin "now" to a known ISO timestamp so tests don't drift.
const NOW = new Date("2026-04-07T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

/* ------------------------------------------------------------------ */
/*  formatRelative                                                      */
/* ------------------------------------------------------------------ */

describe("formatRelative", () => {
  it("returns 'just now' for a timestamp less than 60 s ago", () => {
    const d = new Date(NOW.getTime() - 30_000).toISOString();
    expect(formatRelative(d)).toBe("just now");
  });

  it("returns 'in a moment' for a timestamp less than 60 s in the future", () => {
    const d = new Date(NOW.getTime() + 30_000).toISOString();
    expect(formatRelative(d)).toBe("in a moment");
  });

  it("returns minutes ago", () => {
    const d = new Date(NOW.getTime() - 5 * 60_000).toISOString();
    expect(formatRelative(d)).toBe("5m ago");
  });

  it("returns minutes in future", () => {
    const d = new Date(NOW.getTime() + 45 * 60_000).toISOString();
    expect(formatRelative(d)).toBe("in 45m");
  });

  it("returns hours ago", () => {
    const d = new Date(NOW.getTime() - 3 * 3_600_000).toISOString();
    expect(formatRelative(d)).toBe("3h ago");
  });

  it("returns hours in future", () => {
    const d = new Date(NOW.getTime() + 2 * 3_600_000).toISOString();
    expect(formatRelative(d)).toBe("in 2h");
  });

  it("returns days ago", () => {
    const d = new Date(NOW.getTime() - 4 * 86_400_000).toISOString();
    expect(formatRelative(d)).toBe("4d ago");
  });

  it("returns days in future", () => {
    const d = new Date(NOW.getTime() + 10 * 86_400_000).toISOString();
    expect(formatRelative(d)).toBe("in 10d");
  });
});

/* ------------------------------------------------------------------ */
/*  formatAbsolute                                                      */
/* ------------------------------------------------------------------ */

describe("formatAbsolute", () => {
  it("formats a date as DD Mon YYYY", () => {
    expect(formatAbsolute("2026-04-07T00:00:00.000Z")).toMatch(/07 Apr 2026/);
  });

  it("zero-pads single-digit days", () => {
    expect(formatAbsolute("2026-04-01T00:00:00.000Z")).toMatch(/01 Apr 2026/);
  });

  it("handles December", () => {
    expect(formatAbsolute("2026-12-25T00:00:00.000Z")).toMatch(/25 Dec 2026/);
  });
});

/* ------------------------------------------------------------------ */
/*  formatDateTime                                                      */
/* ------------------------------------------------------------------ */

describe("formatDateTime", () => {
  it("includes time in HH:MM format", () => {
    // Use local-timezone-safe approach: create date from parts
    const d = new Date(2026, 3, 7, 14, 30, 0); // Apr 7 2026, 14:30 local
    const result = formatDateTime(d.toISOString());
    expect(result).toContain("14:30");
    expect(result).toContain("Apr");
    expect(result).toContain("2026");
  });

  it("zero-pads hours and minutes", () => {
    const d = new Date(2026, 0, 5, 9, 5, 0); // Jan 5 2026, 09:05 local
    const result = formatDateTime(d.toISOString());
    expect(result).toContain("09:05");
  });
});

/* ------------------------------------------------------------------ */
/*  isOverdue                                                           */
/* ------------------------------------------------------------------ */

describe("isOverdue", () => {
  it("returns true for a date in the past", () => {
    const past = new Date(NOW.getTime() - 86_400_000).toISOString();
    expect(isOverdue(past)).toBe(true);
  });

  it("returns false for a date in the future", () => {
    const future = new Date(NOW.getTime() + 86_400_000).toISOString();
    expect(isOverdue(future)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  daysUntil                                                           */
/* ------------------------------------------------------------------ */

describe("daysUntil", () => {
  it("returns positive days for a future date", () => {
    const future = new Date(NOW.getTime() + 3 * 86_400_000).toISOString();
    expect(daysUntil(future)).toBe(3);
  });

  it("returns negative days for a past date", () => {
    const past = new Date(NOW.getTime() - 2 * 86_400_000).toISOString();
    expect(daysUntil(past)).toBe(-2);
  });

  it("uses Math.ceil so partial days count as 1", () => {
    // 25 hours from now → ceil(25/24) = 2
    const future = new Date(NOW.getTime() + 25 * 3_600_000).toISOString();
    expect(daysUntil(future)).toBe(2);
  });
});
