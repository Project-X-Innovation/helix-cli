import type { ConnectorAuth } from "./resolve.js";
import { connectorGet } from "./http.js";

/**
 * Pick a single resource's schema out of the $schema payload.
 *
 * Handles both shapes the gateway may serve:
 *   resources as an object map  → resources[name]
 *   resources as an array       → entry whose `name` (or `resource`) equals name
 *
 * Returns the resource schema, or undefined with `available` listing what exists.
 */
export function pickResource(
  schema: unknown,
  resource: string,
): { found: unknown | undefined; available: string[] } {
  const resources = (schema as { resources?: unknown })?.resources;

  if (Array.isArray(resources)) {
    const names = resources.map((r) => {
      const entry = r as { name?: string; resource?: string };
      return entry.name ?? entry.resource ?? "";
    });
    const idx = names.indexOf(resource);
    return { found: idx >= 0 ? resources[idx] : undefined, available: names.filter(Boolean) };
  }

  if (resources && typeof resources === "object") {
    const map = resources as Record<string, unknown>;
    return { found: map[resource], available: Object.keys(map) };
  }

  return { found: undefined, available: [] };
}

export async function cmdConnectorsSchema(
  auth: ConnectorAuth,
  name: string,
  resource?: string,
): Promise<void> {
  const response = (await connectorGet(auth, `/${encodeURIComponent(name)}/$schema`)) as {
    data?: unknown;
  };
  const schema = response?.data ?? response;

  if (!resource) {
    console.log(JSON.stringify(schema, null, 2));
    return;
  }

  const { found, available } = pickResource(schema, resource);
  if (found === undefined) {
    console.error(
      `Error: resource "${resource}" not found on connector "${name}".` +
        (available.length ? ` Available resources: ${available.join(", ")}` : ""),
    );
    process.exit(1);
  }
  console.log(JSON.stringify(found, null, 2));
}
