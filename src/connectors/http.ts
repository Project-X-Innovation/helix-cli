import type { ConnectorAuth } from "./resolve.js";

const REQUEST_TIMEOUT_MS = 30_000;

/** Error thrown for non-2xx gateway responses, carrying the wire-protocol error shape. */
export class ConnectorApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ConnectorApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Parse a gateway error body ({error:{code,message}}) into a ConnectorApiError.
 * Falls back to the raw body text when the shape doesn't match.
 */
export function toConnectorApiError(status: number, bodyText: string): ConnectorApiError {
  try {
    const parsed = JSON.parse(bodyText) as { error?: { code?: string; message?: string } };
    if (parsed?.error?.message) {
      return new ConnectorApiError(status, parsed.error.message, parsed.error.code);
    }
  } catch {
    // Not JSON — fall through to raw text
  }
  const trimmed = bodyText.trim().slice(0, 500);
  return new ConnectorApiError(status, trimmed || `HTTP ${status}`);
}

/** Format a ConnectorApiError for display, with an auth hint on 401. */
export function formatConnectorError(error: ConnectorApiError): string {
  const code = error.code ? `${error.code}: ` : "";
  let message = `${code}${error.message} (HTTP ${error.status})`;
  if (error.status === 401) {
    message += "\nThe connector token was rejected. Check --token / HELIX_CONNECTOR_TOKEN — tokens are hct_... values minted by an org admin on the Helix server.";
  }
  return message;
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/**
 * GET a gateway path. Returns parsed JSON (or raw text when `accept` is "text").
 * Throws ConnectorApiError on non-2xx responses.
 *
 * `fetchImpl` is injectable for tests.
 */
export async function connectorGet(
  auth: ConnectorAuth,
  path: string,
  options: { queryParams?: Record<string, string>; accept?: "json" | "text"; fetchImpl?: FetchLike } = {},
): Promise<unknown> {
  const url = new URL(`${auth.baseUrl}${path}`);
  if (options.queryParams) {
    for (const [key, value] of Object.entries(options.queryParams)) {
      url.searchParams.set(key, value);
    }
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. The server may be unavailable.`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Could not reach ${url.origin} — ${error.message}`);
    }
    throw error;
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw toConnectorApiError(response.status, bodyText);
  }

  if (options.accept === "text") {
    return response.text();
  }
  return response.json();
}
