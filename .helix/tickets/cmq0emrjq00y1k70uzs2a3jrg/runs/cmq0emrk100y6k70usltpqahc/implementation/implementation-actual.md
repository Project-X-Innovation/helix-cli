# Implementation Report — BLD-693: ns-gm Server-Side Decomposition (helix-cli)

## Summary

Added two new CLI command handlers (`hlx inspect netsuite` and `hlx run`) that communicate with the new server-side NetSuite endpoints. Both handlers follow existing patterns from db.ts/logs.ts, support `--env prod|sandbox` with manifest default fallback, and are wired into the CLI's switch-based routing.

## Files Changed

### New Files

| File | Purpose |
|------|---------|
| `src/inspect/netsuite.ts` | Handler for `hlx inspect netsuite` with two modes: SuiteQL query (`--query` or positional) and log retrieval (`logs` subcommand with optional `--script-id`). POSTs to `/api/inspect/{repoId}/netsuite` with `{type, query/scriptId, env}` body. Reads nsDefaultEnv from `/tmp/helix-inspect/manifest.json` when `--env` not provided. |
| `src/run/index.ts` | Handler for `hlx run` for arbitrary SuiteScript execution. Supports `--repo` (required), `--code` or positional code, `--modules` (comma-separated), and `--env`. POSTs to `/api/inspect/{repoId}/run` with `{code, modules?, env?}` body. Same manifest default env reading as netsuite handler. |

### Modified Files

| File | Changes |
|------|---------|
| `src/inspect/index.ts` | Added import for `cmdNetsuite`. Added `case "netsuite"` to switch with help text and `--repo` validation. Updated `inspectUsage` text to include netsuite subcommand usage. |
| `src/index.ts` | Added import for `cmdRun`. Added `case "run"` to main switch using `configOrHelp` pattern. Updated top-level `usage` text to include `hlx run` and `hlx inspect netsuite` commands. |

## Verification Results

### CLI Required Checks

| Check | Status | Evidence |
|-------|--------|----------|
| CHK-01: TypeScript typecheck passes | PASS | `npx tsc --noEmit` exits with code 0 in helix-cli directory, zero type errors. |
| CHK-02: Build succeeds | PASS | `npm run build` exits with code 0, producing dist/ output. |
| CHK-03: New handler files exist with correct exports | PASS | `src/inspect/netsuite.ts` exports `cmdNetsuite`. `src/run/index.ts` exports `cmdRun`. `src/inspect/index.ts` switch includes `case "netsuite"`. `src/index.ts` switch includes `case "run"`. |
| CHK-04: CLI help text includes new commands | PASS | `node dist/index.js --help` shows `hlx run --repo <name> <code>` and `hlx inspect netsuite` commands. `node dist/index.js inspect --help` shows netsuite subcommand with query and logs modes. |
| CHK-05: Tests pass | PASS | `npm test` completes. No test files exist for the new CLI handlers (expected per scout analysis — CLI has no unit tests for command handlers). |

## Spec Deviations

None.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| implementation-plan/implementation-plan.md (cli) | Step-by-step implementation guide | 5 steps: netsuite handler, run handler, inspect router, main dispatcher, quality gates |
| implementation-plan/apl.json (cli) | Implementation questions answered | Handler patterns, manifest env reading, route mapping |
| tech-research/tech-research.md (cli) | Architecture decisions | AD-1 (separate files), AD-2 (hlx run top-level), AD-3 (--env body param), AD-4 (manifest default env) |
| scout/reference-map.json (cli) | File map | Handler patterns from db.ts/logs.ts |
| src/inspect/db.ts | Handler template | resolveRepo → hxFetch POST → console.log JSON pattern |
| src/inspect/index.ts | Router pattern | Switch with help text per subcommand |
| src/index.ts | Main dispatcher pattern | configOrHelp + switch case routing |
