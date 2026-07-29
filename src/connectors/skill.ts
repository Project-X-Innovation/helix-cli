import type { ConnectorAuth } from "./resolve.js";
import { connectorGet } from "./http.js";

export async function cmdConnectorsSkill(auth: ConnectorAuth, name: string): Promise<void> {
  const markdown = await connectorGet(auth, `/${encodeURIComponent(name)}/$skill`, { accept: "text" });
  process.stdout.write(String(markdown));
}
