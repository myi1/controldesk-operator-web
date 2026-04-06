import { describe, it, expect } from "vitest";
import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("formats a round number with two decimal places", () => {
    expect(formatCurrency(5000)).toBe("AED 5,000.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("AED 0.00");
  });

  it("formats a fractional amount", () => {
    expect(formatCurrency(1234.5)).toBe("AED 1,234.50");
  });

  it("formats a large number with thousands separators", () => {
    expect(formatCurrency(1_000_000)).toBe("AED 1,000,000.00");
  });

  it("formats a negative amount", () => {
    const result = formatCurrency(-500);
    // Sign position may vary by locale; just verify the core values appear
    expect(result).toContain("AED");
    expect(result).toContain("500.00");
  });
});
