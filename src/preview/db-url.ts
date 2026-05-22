import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";

export async function cmdPreviewDbUrl(config: HxConfig, ticketId: string): Promise<void> {
  const data = (await hxFetch(config, `/tickets/${ticketId}/preview-db-url`, {
    basePath: "/api",
  })) as { connectionUri: string };

  process.stdout.write(data.connectionUri + "\n");
  process.stderr.write(
    "# Tip: $env:DATABASE_URL = (hlx preview db-url <ticket>); npm run dev\n",
  );
}
