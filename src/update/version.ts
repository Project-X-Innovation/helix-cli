import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFullConfig } from "../lib/config.js";

function readPackageVersionField(): string {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const packageRoot = join(thisDir, "..", "..");
  const pkgPath = join(packageRoot, "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as { version?: string };
  return pkg.version ?? "unknown";
}

export function getPackageSemver(): string {
  try {
    return readPackageVersionField();
  } catch {
    return "unknown";
  }
}

/**
 * Read the package version from package.json at runtime.
 * At runtime this file lives at dist/update/version.js,
 * so package.json is two directories up (../../package.json).
 *
 * When the config file contains an installSource.commit SHA,
 * appends the short SHA in parentheses: e.g. "1.3.4 (c8620a5)".
 * Falls back to semver-only if the SHA is absent or config is unreadable.
 */
export function getPackageVersion(): string {
  const semver = getPackageSemver();
  if (semver === "unknown") {
    return "unknown";
  }

  let packageRoot = "";
  const thisDir = dirname(fileURLToPath(import.meta.url));
  packageRoot = join(thisDir, "..", "..");

  try {
    const config = loadFullConfig();
    const commit = config.installSource?.commit;
    if (commit && typeof commit === "string" && commit.length >= 7) {
      return `${semver} (${commit.slice(0, 7)})`;
    }
  } catch {
    // Config read failure — fall back to semver-only
  }

  try {
    const metadataPath = join(packageRoot, "build-metadata.json");
    const raw = readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(raw) as { commit?: string };
    const commit = metadata.commit;
    if (commit && typeof commit === "string" && commit.length >= 7) {
      return `${semver} (${commit.slice(0, 7)})`;
    }
  } catch {
    // No embedded build metadata — fall back to semver-only
  }

  return semver;
}
