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

export async function cmdRun(config: HxConfig, args: string[]): Promise<void> {
  const repoNameOrId = getFlag(args, "--repo");
  if (!repoNameOrId) {
    console.error("Error: --repo is required.");
    process.exit(1);
  }

  const repoId = await resolveRepo(config, repoNameOrId);

  const envFlag = getFlag(args, "--env");
  const env = envFlag ?? readManifestDefaultEnv();

  const codeFlag = getFlag(args, "--code");
  const modulesFlag = getFlag(args, "--modules");
  const positional = getPositionalArgs(args, ["--repo", "--env", "--code", "--modules"]);

  const code = codeFlag ?? positional.join(" ");
  if (!code) {
    console.error("Error: SuiteScript code is required. Use --code or pass it as a positional argument.");
    process.exit(1);
  }

  const body: Record<string, unknown> = { code };
  if (modulesFlag) {
    body.modules = modulesFlag.split(",").map((m) => m.trim()).filter(Boolean);
  }
  if (env) body.env = env;

  const result = await hxFetch(config, `/${repoId}/run`, {
    method: "POST",
    body,
  });
  console.log(JSON.stringify(result, null, 2));
}
