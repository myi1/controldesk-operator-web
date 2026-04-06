// ---------------------------------------------------------------------------
// Base Frappe RPC client
// ---------------------------------------------------------------------------

import { z } from "zod";
import { getCsrfToken, fetchCsrfToken } from "../lib/auth";
import type { FrappeResponse } from "../types/api";

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
    method: string,
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
    super(`Unexpected response shape from ${method}${detail}`);
    this.name = "ApiSchemaError";
  }
}

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

/** True for errors worth retrying (transient network / server-side). */
function isRetryable(err: unknown): boolean {
  if (err instanceof ApiError) {
    // Timeout, network down, or 5xx server errors
    return err.httpStatus === 0 || err.httpStatus === 408 || err.httpStatus >= 500;
  }
  return false;
}

/** Exponential backoff delay in ms with ±30% jitter. */
function backoffDelay(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 16_000); // cap at 16s
  const jitter = base * 0.3 * (Math.random() * 2 - 1);
  return Math.max(0, base + jitter);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Core fetch (single attempt)
// ---------------------------------------------------------------------------

async function doFetch(
  url: string,
  params: object,
  csrfToken: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    return res;
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
// Response parsing helpers
// ---------------------------------------------------------------------------

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; exc?: string };
    if (body.message) return body.message;
    if (body.exc) return body.exc;
  } catch {
    // Body is not JSON — use generic status message
  }
  return `HTTP ${res.status}`;
}

async function parseSuccessBody<T>(res: Response, method: string): Promise<T> {
  let body: FrappeResponse<T>;
  try {
    body = (await res.json()) as FrappeResponse<T>;
  } catch {
    throw new ApiSchemaError(method, new Error("Response body was not valid JSON"));
  }
  if (!("message" in body)) {
    throw new ApiSchemaError(method, new Error("Response missing 'message' envelope"));
  }
  return body.message;
}

// ---------------------------------------------------------------------------
// Public API call with retry
// ---------------------------------------------------------------------------

/**
 * Invoke a Frappe whitelisted RPC method with automatic retry on transient
 * errors, CSRF refresh on 403, and session-expiry signalling on 401.
 */
export async function frappeCall<T>(
  method: string,
  params: object = {},
): Promise<T> {
  const url = `${BASE_URL}/api/method/${method}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1));
    }

    let res: Response;
    try {
      res = await doFetch(url, params, getCsrfToken());
    } catch (err) {
      lastError = err;
      if (isRetryable(err)) continue;
      throw err;
    }

    // 401 — expired session, no point retrying
    if (res.status === 401) {
      emitSessionExpired();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }

    // 403 — possibly stale CSRF token; refresh and retry this attempt (once)
    if (res.status === 403) {
      const freshToken = await fetchCsrfToken();
      if (freshToken) {
        let retryRes: Response;
        try {
          retryRes = await doFetch(url, params, freshToken);
        } catch (err) {
          lastError = err;
          if (isRetryable(err)) continue;
          throw err;
        }

        if (retryRes.status === 401) {
          emitSessionExpired();
          throw new ApiError("Your session has expired. Please sign in again.", 401);
        }

        if (retryRes.status === 403) {
          throw new ApiError("Permission denied.", 403);
        }

        if (!retryRes.ok) {
          const msg = await extractErrorMessage(retryRes);
          const err = new ApiError(msg, retryRes.status);
          if (isRetryable(err)) { lastError = err; continue; }
          throw err;
        }

        return parseSuccessBody<T>(retryRes, method);
      }

      throw new ApiError("Permission denied.", 403);
    }

    // Other non-OK responses
    if (!res.ok) {
      const msg = await extractErrorMessage(res);
      const err = new ApiError(msg, res.status);
      if (isRetryable(err)) { lastError = err; continue; }
      throw err;
    }

    return parseSuccessBody<T>(res, method);
  }

  // All retries exhausted
  throw lastError ?? new ApiError("Request failed after multiple attempts.", 0);
}
