import { spawnSync, type SpawnSyncReturns } from "node:child_process";

export const NPM_PACKAGE_NAME = "@projectxinnovation/helix-cli";
export const NPM_REGISTRY_URL = "https://registry.npmjs.org";

type RunCommand = (
  command: string,
  args: string[],
  options: {
    encoding: "utf8";
    stdio: ["ignore", "pipe", "pipe"];
  },
) => SpawnSyncReturns<string>;

function getNpmExecutable(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function trimOutput(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function fetchLatestNpmVersion(
  runCommand: RunCommand = spawnSync,
): string | null {
  const result = runCommand(
    getNpmExecutable(),
    ["view", NPM_PACKAGE_NAME, "version", "--registry", NPM_REGISTRY_URL, "--silent"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (result.status !== 0) {
    return null;
  }

  const version = trimOutput(result.stdout);
  return version.length > 0 ? version : null;
}

export function installNpmVersion(
  version: string,
  runCommand: RunCommand = spawnSync,
): { success: boolean; error?: string } {
  const result = runCommand(
    getNpmExecutable(),
    [
      "install",
      "-g",
      `${NPM_PACKAGE_NAME}@${version}`,
      "--registry",
      NPM_REGISTRY_URL,
      "--silent",
      "--no-fund",
      "--no-audit",
    ],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (result.status === 0) {
    return { success: true };
  }

  const detail = trimOutput(result.stderr) || trimOutput(result.stdout);
  return {
    success: false,
    error: detail || `npm exited with status ${result.status ?? 1}`,
  };
}
