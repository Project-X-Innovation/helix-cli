import type { ConnectorAuth } from "./resolve.js";
import { connectorGet } from "./http.js";

/**
 * Collect repeated `--param key=value` flags into a query-param record.
 * Exported for tests. Throws on malformed values (no "=", or empty key).
 */
export function collectParams(args: string[]): Record<string, string> {
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== "--param") continue;
    const raw = args[i + 1];
    if (raw === undefined || raw.startsWith("--")) {
      throw new Error("--param requires a key=value argument.");
    }
    const eq = raw.indexOf("=");
    if (eq <= 0) {
      throw new Error(`Invalid --param "${raw}" — expected key=value.`);
    }
    params[raw.slice(0, eq)] = raw.slice(eq + 1);
    i++;
  }
  return params;
}

export async function cmdConnectorsRead(
  auth: ConnectorAuth,
  name: string,
  resource: string,
  options: { id?: string; limit?: string; cursor?: string; params?: Record<string, string> },
): Promise<void> {
  const base = `/${encodeURIComponent(name)}/${encodeURIComponent(resource)}`;

  if (options.id) {
    const result = await connectorGet(auth, `${base}/${encodeURIComponent(options.id)}`);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const queryParams: Record<string, string> = { ...(options.params ?? {}) };
  if (options.limit) queryParams.limit = options.limit;
  if (options.cursor) queryParams.cursor = options.cursor;

  const result = await connectorGet(auth, base, { queryParams });
  console.log(JSON.stringify(result, null, 2));
}
