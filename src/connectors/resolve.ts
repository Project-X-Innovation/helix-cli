import { getFlag } from "../lib/flags.js";
import { loadConfig } from "../lib/config.js";

export type ConnectorAuth = {
  /** Fully-resolved gateway base, e.g. https://server.example.com/api/connect/v1 */
  baseUrl: string;
  /** Connector token (hct_...) sent as Authorization: Bearer */
  token: string;
};

export const CONNECT_BASE_PATH = "/api/connect/v1";

export const MISSING_TOKEN_MESSAGE = `No connector token found. Provide one via --token <hct_...> or the HELIX_CONNECTOR_TOKEN env var.
Connector tokens (hct_...) are org-scoped and minted by an org admin on the Helix server; Helix sandboxes get HELIX_CONNECTOR_TOKEN injected automatically. They are separate from hxi_ inspection API keys.`;

export const MISSING_URL_MESSAGE = `No server URL found. Provide one via --url <server>, the HELIX_CONNECT_URL env var, or configure an org with \`hlx token add --url <server>\`.`;

/**
 * Resolve the connector gateway URL and token for a command invocation.
 *
 * URL precedence:   --url flag > HELIX_CONNECT_URL env > current org's url from ~/.hlx/config.json
 * Token precedence: --token flag > HELIX_CONNECTOR_TOKEN env
 *
 * `env` and `configUrl` are injectable for tests; production callers pass
 * only `args` and get process.env plus the stored org config.
 */
export function resolveConnectorAuth(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
  configUrl?: () => string | undefined,
): ConnectorAuth {
  const urlSource =
    getFlag(args, "--url") ??
    env.HELIX_CONNECT_URL ??
    (configUrl ? configUrl() : loadConfig()?.url);

  if (!urlSource) {
    throw new Error(MISSING_URL_MESSAGE);
  }

  const token = getFlag(args, "--token") ?? env.HELIX_CONNECTOR_TOKEN;
  if (!token) {
    throw new Error(MISSING_TOKEN_MESSAGE);
  }

  const base = urlSource.replace(/\/+$/, "");
  return { baseUrl: `${base}${CONNECT_BASE_PATH}`, token };
}
