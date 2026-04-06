// ---------------------------------------------------------------------------
// Base Frappe RPC client
// ---------------------------------------------------------------------------

import { getCsrfToken, fetchCsrfToken } from "../lib/auth";
import type { FrappeResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** Default timeout for every API request (30 seconds). */
const REQUEST_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Session expiry event
// ---------------------------------------------------------------------------
// Any module can listen for "controldesk:session-expired" on window to react
// to a 401 response (e.g. redirect to login).

export function emitSessionExpired(): void {
  window.dispatchEvent(new CustomEvent("controldesk:session-expired"));
}

// ---------------------------------------------------------------------------
// Error type
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

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

/**
 * Invoke a Frappe whitelisted RPC method.
 *
 * @param method  Dotted method path, e.g. `controldesk_core.api.get_operator_shell_bootstrap`
 * @param params  JSON-serialisable params forwarded in the request body
 * @returns       The unwrapped `message` payload from the Frappe response envelope
 */
export async function frappeCall<T>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const url = `${BASE_URL}/api/method/${method}`;

  // Abort the request after REQUEST_TIMEOUT_MS
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;

  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // CSRF token required by Frappe for all session-authenticated POSTs
        "X-Frappe-CSRF-Token": getCsrfToken(),
      },
      credentials: "include",
      body: JSON.stringify(params),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  clearTimeout(timeoutId);

  // 401 — session has expired or was never established
  if (res.status === 401) {
    emitSessionExpired();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  // 403 — could be a stale CSRF token; fetch a fresh one and retry once
  if (res.status === 403) {
    const freshToken = await fetchCsrfToken();
    if (freshToken) {
      // Retry with the refreshed token
      const retryRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Frappe-CSRF-Token": freshToken,
        },
        credentials: "include",
        body: JSON.stringify(params),
      });

      if (retryRes.status === 401) {
        emitSessionExpired();
        throw new ApiError("Your session has expired. Please sign in again.", 401);
      }

      if (!retryRes.ok) {
        throw new ApiError(await extractErrorMessage(retryRes), retryRes.status);
      }

      const retryBody = (await retryRes.json()) as FrappeResponse<T>;
      return retryBody.message;
    }

    throw new ApiError("Permission denied.", 403);
  }

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  const body = (await res.json()) as FrappeResponse<T>;
  return body.message;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; exc?: string };
    if (body.message) return body.message;
    if (body.exc) return body.exc;
  } catch {
    // Response body was not JSON — fall through to generic message
  }
  return `HTTP ${res.status}`;
}
