// ---------------------------------------------------------------------------
// Base Frappe RPC client
// ---------------------------------------------------------------------------

import { getAuthHeaders } from "../lib/auth";
import type { FrappeResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public httpStatus: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  if (res.status === 401 || res.status === 403) {
    throw new ApiError("Unauthorized", res.status);
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string; exc?: string };
      if (body.message) message = body.message;
      else if (body.exc) message = body.exc;
    } catch {
      // Could not parse error body — keep the generic message
    }
    throw new ApiError(message, res.status);
  }

  const body = (await res.json()) as FrappeResponse<T>;
  return body.message;
}
