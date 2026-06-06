import { readFileSync } from "node:fs";
import type { HxConfig } from "../lib/config.js";
import { hxFetch } from "../lib/http.js";
import { resolveRepo } from "../lib/resolve-repo.js";
import { getFlag, getPositionalArgs } from "../lib/flags.js";

function readManifestDefaultEnv(): string | undefined {
  try {
    const raw = readFileSync("/tmp/helix-inspect/manifest.json", "utf8");
    const manifest = JSON.parse(raw) as Record<string, unknown>;
    if (typeof manifest.nsDefaultEnv === "string") {
      return manifest.nsDefaultEnv === "PRODUCTION" ? "prod" : "sandbox";
    }
  } catch {
    // Manifest not available — no default env
  }
  return undefined;
}

export async function cmdNetsuite(config: HxConfig, repoNameOrId: string, args: string[]): Promise<void> {
  const repoId = await resolveRepo(config, repoNameOrId);

  const envFlag = getFlag(args, "--env");
  const env = envFlag ?? readManifestDefaultEnv();

  const positional = getPositionalArgs(args, ["--repo", "--env", "--query", "--script-id"]);
  const firstPositional = positional[0];

  if (firstPositional === "logs") {
    // Log retrieval mode
    const scriptId = getFlag(args, "--script-id");
    const body: Record<string, unknown> = { type: "logs" };
    if (scriptId) body.scriptId = scriptId;
    if (env) body.env = env;

    const result = await hxFetch(config, `/${repoId}/netsuite`, {
      method: "POST",
      body,
    });
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Query mode
    const queryFlag = getFlag(args, "--query");
    const query = queryFlag ?? positional.join(" ");

    if (!query) {
      console.error("Error: a SuiteQL query is required. Use --query or pass it as a positional argument.");
      process.exit(1);
    }

    const body: Record<string, unknown> = { type: "query", query };
    if (env) body.env = env;

    const result = await hxFetch(config, `/${repoId}/netsuite`, {
      method: "POST",
      body,
    });
    console.log(JSON.stringify(result, null, 2));
  }
}
