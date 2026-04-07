// ---------------------------------------------------------------------------
// REST API client — JWT Bearer auth, FastAPI backend at /api/v1/
// ---------------------------------------------------------------------------

import { z } from "zod";
import { getToken } from "../lib/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** Hard cap on how long a single attempt may take (ms). */
const REQUEST_TIMEOUT_MS = 30_000;

/** Maximum number of retry attempts for transient errors. */
const MAX_RETRIES = 3;

// ---------------------------------------------------------------------------
// Session expiry event
// ---------------------------------------------------------------------------

export function emitSessionExpired(): void {
  window.dispatchEvent(new CustomEvent("controldesk:session-expired"));
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public httpStatus: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Thrown when the backend returns a shape that doesn't match our schema. */
export class ApiSchemaError extends Error {
  constructor(
    endpoint: string,
    public cause: unknown,
  ) {
    const detail =
      cause instanceof z.ZodError
        ? ": " +
          cause.issues
            .slice(0, 3)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")
        : "";
    super(`Unexpected response shape from ${endpoint}${detail}`);
    this.name = "ApiSchemaError";
  }
}

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

/** True for errors worth retrying (transient network / server-side). */
function isRetryable(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.httpStatus === 0 || err.httpStatus === 408 || err.httpStatus >= 500;
  }
  return false;
}

/** Exponential backoff delay in ms with ±30% jitter. */
function backoffDelay(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 16_000);
  const jitter = base * 0.3 * (Math.random() * 2 - 1);
  return Math.max(0, base + jitter);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      // FastAPI validation error: [{ msg: string, loc: [...] }]
      const msgs = (body.detail as Array<{ msg?: string }>)
        .map((e) => e.msg)
        .filter(Boolean);
      if (msgs.length) return msgs.join("; ");
    }
  } catch {
    // Body is not JSON — fall through to generic message
  }
  return `HTTP ${res.status}`;
}

async function handleResponse<T>(res: Response, endpoint: string): Promise<T> {
  if (res.status === 401) {
    emitSessionExpired();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }
  if (res.status === 403) {
    throw new ApiError("Permission denied.", 403);
  }
  if (!res.ok) {
    const msg = await extractErrorMessage(res);
    throw new ApiError(msg, res.status);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiSchemaError(endpoint, new Error("Response body was not valid JSON"));
  }
}

// ---------------------------------------------------------------------------
// Core fetch with timeout
// ---------------------------------------------------------------------------

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw new ApiError("Network error. Please check your connection.", 0);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Public API: GET with optional query params
// ---------------------------------------------------------------------------

export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) qs.append(k, String(v));
  }
  const query = qs.toString();
  const url = query ? `${BASE_URL}${path}?${query}` : `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(backoffDelay(attempt - 1));

    let res: Response;
    try {
      res = await doFetch(url, { method: "GET", headers: authHeaders() });
    } catch (err) {
      lastError = err;
      if (isRetryable(err)) continue;
      throw err;
    }

    try {
      return await handleResponse<T>(res, path);
    } catch (err) {
      if (isRetryable(err)) { lastError = err; continue; }
      throw err;
    }
  }

  throw lastError ?? new ApiError("Request failed after multiple attempts.", 0);
}

// ---------------------------------------------------------------------------
// Public API: POST with JSON body
// ---------------------------------------------------------------------------

export async function apiPost<T>(path: string, body: unknown = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(backoffDelay(attempt - 1));

    let res: Response;
    try {
      res = await doFetch(url, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      lastError = err;
      if (isRetryable(err)) continue;
      throw err;
    }

    try {
      return await handleResponse<T>(res, path);
    } catch (err) {
      if (isRetryable(err)) { lastError = err; continue; }
      throw err;
    }
  }

  throw lastError ?? new ApiError("Request failed after multiple attempts.", 0);
}

// ---------------------------------------------------------------------------
// Public API: PUT with JSON body
// ---------------------------------------------------------------------------

export async function apiPut<T>(path: string, body: unknown = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(backoffDelay(attempt - 1));

    let res: Response;
    try {
      res = await doFetch(url, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      lastError = err;
      if (isRetryable(err)) continue;
      throw err;
    }

    try {
      return await handleResponse<T>(res, path);
    } catch (err) {
      if (isRetryable(err)) { lastError = err; continue; }
      throw err;
    }
  }

  throw lastError ?? new ApiError("Request failed after multiple attempts.", 0);
}

// ---------------------------------------------------------------------------
// Public API: PATCH with JSON body
// ---------------------------------------------------------------------------

export async function apiPatch<T>(path: string, body: unknown = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(backoffDelay(attempt - 1));

    let res: Response;
    try {
      res = await doFetch(url, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      lastError = err;
      if (isRetryable(err)) continue;
      throw err;
    }

    try {
      return await handleResponse<T>(res, path);
    } catch (err) {
      if (isRetryable(err)) { lastError = err; continue; }
      throw err;
    }
  }

  throw lastError ?? new ApiError("Request failed after multiple attempts.", 0);
}

// ---------------------------------------------------------------------------
// Public API: DELETE (no body)
// ---------------------------------------------------------------------------

export async function apiDelete<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(backoffDelay(attempt - 1));

    let res: Response;
    try {
      res = await doFetch(url, { method: "DELETE", headers: authHeaders() });
    } catch (err) {
      lastError = err;
      if (isRetryable(err)) continue;
      throw err;
    }

    try {
      return await handleResponse<T>(res, path);
    } catch (err) {
      if (isRetryable(err)) { lastError = err; continue; }
      throw err;
    }
  }

  throw lastError ?? new ApiError("Request failed after multiple attempts.", 0);
}
