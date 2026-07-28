import type { ConnectorAuth } from "./resolve.js";
import { connectorGet, ConnectorApiError } from "./http.js";

export const CONNECTORS_INDEX_MISSING_MESSAGE =
  "server does not expose $connectors yet — upgrade helix-global-server";

export async function cmdConnectorsList(auth: ConnectorAuth): Promise<void> {
  try {
    const result = await connectorGet(auth, "/$connectors");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    if (error instanceof ConnectorApiError && error.status === 404) {
      console.error(CONNECTORS_INDEX_MISSING_MESSAGE);
      process.exit(1);
    }
    throw error;
  }
}
