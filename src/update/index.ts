import { loadFullConfig, saveConfig } from "../lib/config.js";
import {
  CANONICAL_BRANCH,
  CANONICAL_REPO,
  fetchLatestRelease,
  getGitHubToken,
} from "./check.js";
import { resolvePreferredChannel, type UpdateChannel } from "./channels.js";
import { fetchLatestNpmVersion, installNpmVersion } from "./npm.js";
import { performStagedUpdate } from "./perform.js";
import { getPackageSemver } from "./version.js";

type UpdateResult = "updated" | "up_to_date" | "failed";

async function tryLabUpdate(): Promise<UpdateResult> {
  const config = loadFullConfig();
  const localSha = config.installSource?.commit;
  const token = getGitHubToken();
  const result = await fetchLatestRelease(token);

  if (!result.release) {
    return "failed";
  }

  const remoteSha = result.release.commitSha;
  if (localSha && remoteSha.toLowerCase() === localSha.toLowerCase()) {
    return "up_to_date";
  }

  console.log("updating lab");
  const updateResult = await performStagedUpdate(
    result.release.assetUrl,
    remoteSha,
    token,
  );

  if (!updateResult.success) {
    return "failed";
  }

  saveConfig({
    installSource: {
      mode: "github",
      repo: CANONICAL_REPO,
      branch: CANONICAL_BRANCH,
      commit: remoteSha,
    },
  });
  return "updated";
}

function tryLtsUpdate(forceInstall: boolean): UpdateResult {
  const latestVersion = fetchLatestNpmVersion();
  if (!latestVersion) {
    return "failed";
  }

  const currentVersion = getPackageSemver();
  if (!forceInstall && currentVersion === latestVersion) {
    return "up_to_date";
  }

  console.log("updating lts");
  const installResult = installNpmVersion(latestVersion);
  if (!installResult.success) {
    return "failed";
  }

  saveConfig({
    installSource: {
      mode: "npm",
      version: latestVersion,
    },
  });
  return "updated";
}

async function runUpdateFlow(channel: UpdateChannel): Promise<UpdateResult> {
  if (channel === "lab") {
    const labResult = await tryLabUpdate();
    if (labResult === "failed") {
      return tryLtsUpdate(true);
    }
    return labResult;
  }

  return tryLtsUpdate(false);
}

/**
 * hlx update command handler.
 *
 * Flags:
 *   --enable-auto   Enable automatic update checks
 *   --disable-auto  Disable automatic update checks
 *   (no flags)      Check for and apply CLI updates
 */
export async function runUpdate(args: string[]): Promise<void> {
  if (args.includes("--enable-auto")) {
    saveConfig({ autoUpdate: true });
    console.log("Auto-update enabled. The CLI will check for updates on each invocation.");
    return;
  }

  if (args.includes("--disable-auto")) {
    saveConfig({ autoUpdate: false });
    console.log("Auto-update disabled.");
    return;
  }

  const config = loadFullConfig();
  const updateResult = await runUpdateFlow(
    resolvePreferredChannel(config.installSource),
  );

  if (updateResult === "up_to_date") {
    console.log("Already up to date.");
    return;
  }

  if (updateResult === "failed") {
    console.error("Update failed.");
    process.exit(1);
  }
}

/**
 * Pre-command auto-update check.
 * Runs before command dispatch when autoUpdate is enabled.
 * Silently skips on failure and never blocks command execution.
 */
export async function checkAutoUpdate(): Promise<void> {
  if (process.env.HLX_SKIP_UPDATE_CHECK) {
    return;
  }

  const config = loadFullConfig();
  if (config.autoUpdate !== true) {
    return;
  }

  await runUpdateFlow(resolvePreferredChannel(config.installSource));
}
