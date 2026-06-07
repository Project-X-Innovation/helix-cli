# Diagnosis Statement — helix-cli

## Problem Summary

BLD-693 requires two new CLI commands in helix-cli as thin interfaces to server-side ns-gm decomposition endpoints: `hlx inspect netsuite` (SuiteQL + logs, read-only by server construction) and `hlx run` (arbitrary SuiteScript, role-bounded by server). Both use existing `hxFetch` HTTP client and inspection token authentication. Environment selection via `--env prod|sandbox` with per-step defaults from the inspection manifest.

## Root Cause Analysis

This is a BUILD ticket. The CLI changes are a thin interface layer following established patterns (db.ts, logs.ts handlers). All code is implemented:

1. **netsuite.ts** (60 lines) — `cmdNetsuite` handler with two modes: query mode (POST `type='query'` with query string from `--query` or positional args) and logs mode (POST `type='logs'` with optional `--script-id`, triggered by "logs" positional arg). Reads manifest `nsDefaultEnv` for default `--env`. POSTs to `/{repoId}/netsuite`.

2. **run/index.ts** (53 lines) — `cmdRun` handler with `--repo` (required, validated with exit(1)), `--env`/`--code`/`--modules` (optional). Code from `--code` or positional args. Modules parsed as comma-separated string. POSTs to `/{repoId}/run`.

3. **Router integration** — `inspect/index.ts` has 'netsuite' case at lines 125-138. `index.ts` has 'run' case at lines 101-105. Both import with `.js` extensions (ES module convention).

4. **No test files** — No existing inspect handler tests (db.ts, logs.ts have none either), so absence is consistent with codebase convention.

## Evidence Summary

| Evidence | Location | Finding |
|----------|----------|---------|
| Query/logs handler | inspect/netsuite.ts | 60 lines, two modes, manifest env reading |
| SuiteScript handler | run/index.ts | 53 lines, --repo required, --code/--modules/--env |
| Inspect router | inspect/index.ts:125-138 | netsuite case added |
| Main router | index.ts:101-105 | run case added |
| Shared infra | lib/http.ts | hxFetch with basePath /api/inspect, retry, auth |
| Build | package.json | tsc only, zero runtime deps |

## Success Criteria

1. `hlx inspect netsuite` sends SuiteQL or log requests to server — **implementation verified**
2. `hlx run` sends SuiteScript code to server — **implementation verified**
3. `--env` overrides manifest default; manifest nsDefaultEnv maps PRODUCTION→prod — **implementation verified**
4. Both handlers follow existing CLI patterns (hxFetch, resolveRepo, getFlag) — **implementation verified**

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | CLI = thin interface, ~4 files |
| scout/reference-map.json (CLI) | File inventory | 2 new + 2 modified files confirmed |
| scout/scout-summary.md (CLI) | Analysis summary | Handlers follow existing patterns, zero runtime deps |
| inspect/netsuite.ts | Direct read | 60-line handler with query/logs modes |
| run/index.ts | Direct read | 53-line handler with --repo/--env/--code/--modules |
| inspect/index.ts | Direct read | netsuite case at 125-138 |
| index.ts | Direct read | run case at 101-105 |
