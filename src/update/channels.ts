import type { InstallSource } from "../lib/config.js";
import { CANONICAL_BRANCH, CANONICAL_REPO } from "./check.js";

export type UpdateChannel = "lab" | "lts";

export function isCanonicalGitHubSource(source?: InstallSource): boolean {
  return (
    source?.mode === "github" &&
    source.repo === CANONICAL_REPO &&
    source.branch === CANONICAL_BRANCH
  );
}

export function resolvePreferredChannel(source?: InstallSource): UpdateChannel {
  return isCanonicalGitHubSource(source) ? "lab" : "lts";
}
