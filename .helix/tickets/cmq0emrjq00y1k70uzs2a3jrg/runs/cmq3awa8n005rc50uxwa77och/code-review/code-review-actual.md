# Code Review Report -- BLD-693: ns-gm Server-Side Decomposition (helix-cli)

## Review Scope

Independent review of the helix-cli implementation for BLD-693. Reviewed all 4 changed CLI files (2 new handlers, 2 modified routers) and cross-referenced against ticket requirements, product scenarios (SCN-01 through SCN-09), and the server API contract.

## Files Reviewed

| File | Type | Review Outcome |
|------|------|----------------|
| `src/inspect/netsuite.ts` | New (60 lines) | Correct. cmdNetsuite handler with two modes: SuiteQL query (--query or positional) and log retrieval (logs subcommand with optional --script-id). Reads nsDefaultEnv from manifest. POSTs to /api/inspect/{repoId}/netsuite. Follows db.ts/logs.ts patterns. |
| `src/run/index.ts` | New (53 lines) | Correct. cmdRun handler with --repo (required), --code (or positional), --modules (comma-separated), --env (optional). Reads nsDefaultEnv from manifest. POSTs to /api/inspect/{repoId}/run. |
| `src/inspect/index.ts` | Modified (lines 8, 125-138) | Correct. Import for cmdNetsuite added at line 8. case "netsuite" at line 125 dispatches with --repo validation and help text. |
| `src/index.ts` | Modified (lines 17, 101-105) | Correct. Import for cmdRun added at line 17. case "run" at line 101 dispatches with configOrHelp pattern. |

## Missed Requirements & Issues Found

### Requirements Gaps

None found. All CLI-relevant acceptance criteria verified:

1. **`hlx inspect netsuite` command**: Supports `--query <SuiteQL>`, positional query, `logs` subcommand, `--script-id` filter, `--env prod|sandbox` override. Query/log body schemas match server Zod expectations.

2. **`hlx run` command**: Top-level command (not under inspect). Requires `--repo`. Supports `--code` or positional code, `--modules` (comma-separated to array), `--env`. Body schema matches server Zod expectations.

3. **`--env` as plain parameter**: Sent as body field, not JWT claim. Manifest nsDefaultEnv correctly maps PRODUCTION -> "prod", SANDBOX -> "sandbox". Falls back to undefined if manifest unavailable (server defaults to SANDBOX).

4. **hxFetch URL construction**: Default basePath `/api/inspect` + `/{repoId}/netsuite` or `/{repoId}/run` matches server routes at api.ts lines 263-264.

### Correctness/Behavior Issues

None found.

### Regression Risks

None. Changes are additive (new switch cases, new handler files). Existing CLI commands (login, token, inspect db/logs/api, comments, preview) are untouched.

### Code Quality/Robustness

1. **Minor: Duplicated `readManifestDefaultEnv`** (deferred): Both netsuite.ts and run/index.ts contain identical 10-line helper functions. Follows the codebase's self-contained handler pattern (db.ts, logs.ts don't share helpers either). Not a correctness issue.

### Verification/Test Gaps

No test files for the new handlers, which is consistent with codebase convention -- no existing inspect handler tests exist (db.ts, logs.ts have none).

## Changes Made by Code Review

No code changes made. The CLI implementation is correct and follows existing patterns.

## Remaining Risks / Deferred Items

1. **Network sandbox limitation**: npm install is blocked by DNS resolution failure. TypeScript typecheck and build cannot be run. Previous Verification Pass 2 confirmed: tsc exit 0, build exit 0, 63/63 tests pass.

2. **Cross-repo integration**: CLI depends on server endpoints being deployed. Atomic deployment coordination is important.

## Verification Impact Notes

No verification check IDs are affected. All CLI CHK-01 through CHK-05 remain valid.

## APL Statement Reference

See `code-review/apl.json`.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (BLD-693) | Primary specification | --env as plain parameter (Override 1), hlx run top-level, acceptance criteria |
| implementation/implementation-actual.md (cli) | Scope map for changed files | 2 new + 2 modified files, no changes in retry |
| implementation-plan/implementation-plan.md (cli) | Plan and check criteria | 5 steps, 5 CHK checks |
| product/product.md | User scenarios | SCN-01 through SCN-09 CLI command signatures and expected outcomes |
| verification/verification-actual.md (server, Pass 2) | Prior CLI verification | CLI CHK-01 through CHK-05 all passed |
| code-review/code-review-actual.md (cli, prior) | Previous review context | No issues found previously |
| src/inspect/netsuite.ts (direct read, 60 lines) | Full handler review | query/logs modes, manifest env reading, hxFetch POST |
| src/run/index.ts (direct read, 53 lines) | Full handler review | --repo/--code/--modules/--env, manifest env reading, hxFetch POST |
| src/inspect/index.ts (direct read, lines 100-147) | Router wiring review | case "netsuite" with help text and --repo validation |
| src/index.ts (direct read, lines 85-115) | Main dispatcher review | case "run" with configOrHelp pattern |
| src/lib/http.ts (grep) | URL construction review | hxFetch basePath defaults to /api/inspect |
| src/inspect/db.ts (reference) | Handler pattern comparison | Verified netsuite.ts follows identical resolveRepo/hxFetch/log pattern |
