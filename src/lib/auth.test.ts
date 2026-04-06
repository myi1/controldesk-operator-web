import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  login,
  logout,
  getCsrfToken,
  setCsrfToken,
  clearCsrfToken,
  fetchCsrfToken,
} from "./auth";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

beforeEach(() => {
  clearCsrfToken();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ */
/*  CSRF token cache                                                    */
/* ------------------------------------------------------------------ */

describe("CSRF token cache", () => {
  it("getCsrfToken returns empty string by default", () => {
    expect(getCsrfToken()).toBe("");
  });

  it("setCsrfToken stores a value retrievable by getCsrfToken", () => {
    setCsrfToken("abc123");
    expect(getCsrfToken()).toBe("abc123");
  });

  it("clearCsrfToken resets to empty string", () => {
    setCsrfToken("abc123");
    clearCsrfToken();
    expect(getCsrfToken()).toBe("");
  });
});

/* ------------------------------------------------------------------ */
/*  fetchCsrfToken                                                      */
/* ------------------------------------------------------------------ */

describe("fetchCsrfToken", () => {
  it("parses and caches the CSRF token from the HTML response", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(200, 'csrf_token = "token-xyz-12345678"'),
    );
    const token = await fetchCsrfToken();
    expect(token).toBe("token-xyz-12345678");
    expect(getCsrfToken()).toBe("token-xyz-12345678");
  });

  it("returns the cached (empty) token when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const token = await fetchCsrfToken();
    expect(token).toBe("");
  });

  it("returns the cached token when the HTML has no csrf_token pattern", async () => {
    vi.stubGlobal("fetch", mockFetch(200, "<html><body>no token here</body></html>"));
    const token = await fetchCsrfToken();
    expect(token).toBe("");
  });
});

/* ------------------------------------------------------------------ */
/*  login                                                               */
/* ------------------------------------------------------------------ */

describe("login", () => {
  it("resolves with the user email on success", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "Logged In" }));
    const result = await login("user@example.com", "password");
    expect(result.user).toBe("user@example.com");
  });

  it("uses the message field as user when not 'Logged In'", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { message: "user@frappe.io" }));
    const result = await login("user@frappe.io", "pw");
    expect(result.user).toBe("user@frappe.io");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(401, { message: "Invalid credentials" }),
    );
    await expect(login("bad@email.com", "wrong")).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("throws a fallback message when the error body has no message", async () => {
    vi.stubGlobal("fetch", mockFetch(401, {}));
    await expect(login("x@y.com", "pw")).rejects.toThrow(
      "Login failed",
    );
  });
});

/* ------------------------------------------------------------------ */
/*  logout                                                              */
/* ------------------------------------------------------------------ */

describe("logout", () => {
  it("resolves even when the network call succeeds", async () => {
    vi.stubGlobal("fetch", mockFetch(200, {}));
    await expect(logout()).resolves.toBeUndefined();
  });

  it("resolves (does not throw) even when the network call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(logout()).resolves.toBeUndefined();
  });
});
