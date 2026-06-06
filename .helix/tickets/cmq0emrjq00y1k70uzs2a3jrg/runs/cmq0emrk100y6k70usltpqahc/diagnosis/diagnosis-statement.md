# Diagnosis Statement — helix-cli

## Problem Summary

The helix-cli needs two new subcommands to surface the server-side ns-gm decomposition: `hlx inspect netsuite` for read-only SuiteQL/logs queries, and `hlx run` for arbitrary SuiteScript execution. Both use the existing inspection token authentication and hxFetch HTTP client with the `--env prod|sandbox` parameter for environment selection.

## Root Cause Analysis

This is a build ticket. The CLI is the thin interface layer for the server-side ns-gm decomposition. The existing CLI architecture (switch-based dispatchers, hxFetch client, flag utilities) cleanly supports the two new subcommands with minimal changes.

### Implementation Scope — ~4 files

**New files:**
1. **`src/inspect/netsuite.ts`** — Handler for `hlx inspect netsuite`. Follows the `db.ts` template pattern (lines 1-12): `resolveRepo → hxFetch POST /{repoId}/netsuite → console.log JSON`. Body includes `{type: 'query', query, env?}` or `{type: 'logs', scriptId?, env?}`. Supports `--repo`, `--env prod|sandbox`, `--query` flags plus positional query.
2. **`src/run/index.ts`** — Handler for `hlx run`. New top-level command. `resolveRepo → hxFetch POST /{repoId}/run → console.log JSON`. Body includes `{code, modules?, env?}`. Supports `--repo`, `--env prod|sandbox`, code from positional or flag.

**Modified files:**
3. **`src/inspect/index.ts`** — Add `case "netsuite"` to inspect router switch (after line 120). Add `--env` flag parsing. Update usage/help text (lines 9-31) to include netsuite subcommand.
4. **`src/index.ts`** — Add `case "run"` to main dispatcher switch (after line 136). Import `runRun` from `src/run/index.ts`. Update usage/help text (lines 39-67) to include `hlx run` command.

### Design Notes

- **hxFetch basePath**: Default `/api/inspect` works for both — `hlx inspect netsuite` calls `/{repoId}/netsuite` and `hlx run` calls `/{repoId}/run`, both under the `/api/inspect` prefix. No basePath override needed (AD-1).
- **`--env` parameter**: Parsed via `getFlag(args, '--env')` and included in the request body. When omitted, the server applies the per-step default.
- **Auth**: Uses existing `HELIX_INSPECT_TOKEN` env var → Bearer token header (http.ts:53-60).

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| Main dispatcher | src/index.ts:81-156 | Switch with 13 commands; 'run' case added after existing commands |
| Inspect router | src/inspect/index.ts:41-128 | Switch with repos/db/logs/api cases; 'netsuite' case follows same pattern |
| Handler template | src/inspect/db.ts:1-12 | resolveRepo → hxFetch POST → console.log JSON (12 lines) |
| HTTP client | src/lib/http.ts:37-43 | hxFetch with basePath /api/inspect, retry, Bearer/X-API-Key auth |
| Flag utilities | src/lib/flags.ts:5-35 | getFlag, hasFlag, getPositionalArgs, isHelpRequested, requireFlag |

## Success Criteria

1. `hlx inspect netsuite --repo <name> --query <suiteql>` sends POST to `/api/inspect/{repoId}/netsuite` with `{type: 'query', query}` and prints JSON response.
2. `hlx inspect netsuite --repo <name> logs` sends POST with `{type: 'logs'}` and prints JSON response.
3. `hlx run --repo <name> <code>` sends POST to `/api/inspect/{repoId}/run` with `{code}` and prints JSON response.
4. `--env prod|sandbox` flag is accepted by both commands and included in the request body.
5. TypeScript typecheck (`tsc --noEmit`) passes on helix-cli.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-636 §4) | CLI scope specification | ~4 files: 2 new handlers, 2 router modifications |
| ticket.md (Override 1) | Environment parameter design | --env prod\|sandbox as plain parameter, not JWT claim |
| scout/reference-map.json (cli) | File map with line numbers | Confirmed switch locations, handler patterns, flag utilities |
| scout/scout-summary.md (cli) | CLI architecture analysis | Two-tier routing, hxFetch basePath, flag parsing patterns |
| src/inspect/db.ts | Handler template | resolveRepo → hxFetch POST → console.log JSON |
| src/lib/http.ts:37-43 | HTTP client internals | basePath /api/inspect, body as Record<string, unknown> |
| src/lib/flags.ts:5-35 | Flag parsing API | getFlag, hasFlag, getPositionalArgs |
