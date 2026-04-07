import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, logout, getToken, setToken, clearToken } from "./auth";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  clearToken();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

/* ------------------------------------------------------------------ */
/*  Token storage                                                       */
/* ------------------------------------------------------------------ */

describe("token storage", () => {
  it("getToken returns null by default", () => {
    expect(getToken()).toBeNull();
  });

  it("setToken stores a value retrievable by getToken", () => {
    setToken("test-jwt-token");
    expect(getToken()).toBe("test-jwt-token");
  });

  it("clearToken removes the stored token", () => {
    setToken("test-jwt-token");
    clearToken();
    expect(getToken()).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  login                                                               */
/* ------------------------------------------------------------------ */

describe("login", () => {
  const successBody = {
    access_token: "jwt-abc123",
    token_type: "bearer",
    expires_at: "2026-12-31T00:00:00Z",
    user: {
      username: "operator@controldesk.local",
      roles: ["Operator"],
      default_actor_role: "Operator",
    },
  };

  it("stores the access token in sessionStorage on success", async () => {
    vi.stubGlobal("fetch", mockFetch(200, successBody));
    await login("operator@controldesk.local", "secret");
    expect(getToken()).toBe("jwt-abc123");
  });

  it("resolves with the user profile on success", async () => {
    vi.stubGlobal("fetch", mockFetch(200, successBody));
    const result = await login("operator@controldesk.local", "secret");
    expect(result.user.username).toBe("operator@controldesk.local");
    expect(result.user.roles).toEqual(["Operator"]);
  });

  it("calls POST /api/v1/auth/token with username and password", async () => {
    const spy = mockFetch(200, successBody);
    vi.stubGlobal("fetch", spy);
    await login("user", "pass");
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/auth/token");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({ username: "user", password: "pass" });
  });

  it("throws with the backend detail message on failure", async () => {
    vi.stubGlobal("fetch", mockFetch(401, { detail: "Invalid credentials" }));
    await expect(login("bad", "wrong")).rejects.toThrow("Invalid credentials");
  });

  it("throws a fallback message when the error body has no detail", async () => {
    vi.stubGlobal("fetch", mockFetch(401, {}));
    await expect(login("bad", "wrong")).rejects.toThrow("Login failed");
  });

  it("does not store a token when login fails", async () => {
    vi.stubGlobal("fetch", mockFetch(401, { detail: "Invalid credentials" }));
    await login("bad", "wrong").catch(() => undefined);
    expect(getToken()).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  logout                                                              */
/* ------------------------------------------------------------------ */

describe("logout", () => {
  it("clears the stored token", async () => {
    setToken("existing-token");
    await logout();
    expect(getToken()).toBeNull();
  });

  it("resolves without throwing (no network call needed)", async () => {
    await expect(logout()).resolves.toBeUndefined();
  });
});
