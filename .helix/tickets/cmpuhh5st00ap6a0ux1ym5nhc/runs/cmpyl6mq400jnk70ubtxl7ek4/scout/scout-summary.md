# Scout Summary — helix-cli

## Problem

Two new CLI commands must be added to replace sandbox-side ns-gm CLI access, matching the two-surface governance model:

1. **`hlx inspect netsuite`** — Read-only SuiteQL queries and NetSuite script logs, routed through the server-side inspection proxy. Follows the established pattern of `hlx inspect db/logs/api`.
2. **`hlx run`** — Arbitrary SuiteScript execution routed through the server-side proxy. New top-level command (no existing `hlx run` command exists — verified by grep).

Both inherit the existing HTTP client (`hxFetch`), authentication (inspection tokens), retry logic, and error handling.

## Analysis Summary

### Established Patterns (Low-Risk Extension)

The helix-cli has a clean, consistent architecture:
- **Main dispatcher** (`src/index.ts:81-156`): Top-level switch routes commands
- **Inspect router** (`src/inspect/index.ts:41-128`): Sub-switch for inspect subcommands (repos, db, logs, api)
- **Handler template**: Each handler is 10-14 lines (resolve repo -> hxFetch -> print JSON)
- **HTTP client** (`src/lib/http.ts`): Dual-mode auth (hxi_ API key vs Bearer), 3-attempt retry with exponential backoff, 30s timeout

Adding `hlx inspect netsuite` = one new case in inspect router + one new handler file (~12 lines).
Adding `hlx run` = one new case in main dispatcher + one new handler module.

### Auth & Config (No Changes Needed)

Config loading (`src/lib/config.ts`) already supports both auth modes:
- **Sandbox agents**: `HELIX_INSPECT_TOKEN` / `HELIX_INSPECT_BASE_URL` env vars
- **Human users**: `~/.hlx/config.json` multi-org tokens with `hxi_` prefix

Both new commands use the same auth path — no changes needed.

### HTTP Client Consideration

`hxFetch` defaults to `basePath: '/api/inspect'`. For `hlx inspect netsuite` this works if the server endpoint is `POST /api/inspect/{repoId}/netsuite`. For `hlx run`, the basePath may need override to `/api` if the server route is `POST /api/run/{repoId}` — the goals command already demonstrates this pattern.

### Zero Dependencies

Zero runtime dependencies (only TypeScript dev tooling). Both new commands are pure TypeScript — no new packages needed.

## Relevant Files

| File | Role |
|------|------|
| `src/index.ts` | Main dispatcher — add `case "run"` (lines 81-156) |
| `src/inspect/index.ts` | Inspect router — add `case "netsuite"` + help text (lines 9-30, 41-128) |
| `src/inspect/db.ts` | Template for netsuite handler (12 lines) |
| `src/inspect/logs.ts` | Template showing optional flags (14 lines) |
| `src/inspect/api.ts` | Template showing GET-based pattern (11 lines) |
| `src/inspect/repos.ts` | Repo listing — shows types from manifest (13 lines) |
| `src/lib/http.ts` | HTTP client: auth, retry, timeout (134 lines) |
| `src/lib/config.ts` | Config loading: env vars -> config file (222 lines) |
| `src/lib/flags.ts` | Argument parsing: getFlag, hasFlag, requireFlag (36 lines) |
| `src/lib/resolve-repo.ts` | Repo name-to-ID resolution (80 lines) |
| `package.json` | Build: tsc, typecheck: tsc --noEmit, test: node --test |
| `tsconfig.json` | Target ES2022, Module Node16, strict |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Continuation Context) | Defines two-surface scope | hlx inspect netsuite (read-only) + hlx run (arbitrary SuiteScript) as CLI subcommands |
| src/index.ts (lines 81-156) | Verified command registration | Top-level switch with configOrHelp; no existing "run" case confirmed |
| src/inspect/index.ts (lines 41-128) | Verified inspect router | Switch on args[0] for db/logs/api/repos; supports --query-file pattern |
| src/inspect/db.ts (full file, 12 lines) | Verified handler template | resolveRepo -> hxFetch POST -> console.log JSON |
| src/lib/http.ts (lines 44, 52-61, 71-130) | Verified HTTP client | basePath defaults /api/inspect; dual-mode auth; 3-attempt retry |
| src/lib/config.ts (lines 40-86) | Verified config loading | HELIX_INSPECT_TOKEN env var takes precedence for sandbox agents |
| src/lib/flags.ts (full file, 36 lines) | Verified argument parsing | getFlag, requireFlag, getPositionalArgs available |
| package.json | Verified build pipeline | Zero deps, tsc build, node --test for tests |
