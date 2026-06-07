# Code Review Report -- BLD-693: ns-gm Server-Side Decomposition (helix-cli)

## Review Scope

Fresh independent review of the helix-cli implementation for BLD-693. Reviewed all 4 changed CLI files (2 new handlers, 2 modified routers). Cross-referenced against ticket requirements, product scenarios (SCN-01 through SCN-09), the server API contract (Zod schemas in inspection-controller.ts), and the hxFetch URL construction path (http.ts basePath logic).

## Files Reviewed

| File | Type | Review Outcome |
|------|------|----------------|
| `src/inspect/netsuite.ts` | New (60 lines) | Correct. cmdNetsuite handler with two modes: SuiteQL query (--query or positional arg) and log retrieval (logs subcommand with optional --script-id). Reads nsDefaultEnv from manifest (PRODUCTION->"prod", SANDBOX->"sandbox"). POSTs to /{repoId}/netsuite via hxFetch. Body matches server's inspectNetsuiteBody discriminated union. |
| `src/run/index.ts` | New (53 lines) | Correct. cmdRun handler with --repo (required), --code (or positional), --modules (comma-separated to array), --env. Reads nsDefaultEnv from manifest. POSTs to /{repoId}/run via hxFetch. Body matches server's runSuitescriptBody Zod schema. |
| `src/inspect/index.ts` | Modified (lines 8, 125-138) | Correct. Import for cmdNetsuite at line 8. case "netsuite" at line 125 with --repo validation, help text with usage examples and --env documentation. |
| `src/index.ts` | Modified (lines 17, 101-105) | Correct. Import for cmdRun at line 17. case "run" at line 101 with configOrHelp guard pattern matching other top-level commands. |

## Missed Requirements & Issues Found

### Requirements Gaps

None found. All CLI-relevant acceptance criteria verified:

1. **`hlx inspect netsuite` command**: Supports `--query <SuiteQL>`, positional query (e.g., `hlx inspect netsuite "SELECT ..."`), `logs` subcommand, `--script-id` filter, `--env prod|sandbox` override. Body schemas: `{ type: "query", query, env? }` and `{ type: "logs", scriptId?, env? }` match server Zod discriminated union.

2. **`hlx run` command**: Top-level command (not under inspect, consistent with product spec). Requires `--repo`. Supports `--code` or positional code, `--modules` (comma-separated, split to array via `.split(",").map(m => m.trim()).filter(Boolean)`), `--env`. Body `{ code, modules?, env? }` matches server Zod schema.

3. **`--env` as plain parameter (Override 1)**: Sent as body field. readManifestDefaultEnv reads nsDefaultEnv from manifest written by orchestrator. --env flag overrides manifest default. Falls back to undefined if manifest unavailable; server resolveEnvironment defaults to SANDBOX.

4. **hxFetch URL construction**: Verified in http.ts: basePath defaults to `/api/inspect`, so `/{repoId}/netsuite` resolves to `/api/inspect/{repoId}/netsuite` and `/{repoId}/run` to `/api/inspect/{repoId}/run`, matching server routes at api.ts:263-264.

### Correctness/Behavior Issues

None found.

### Regression Risks

None. Changes are additive (new switch cases, new handler files). Existing CLI commands (login, token, inspect db/logs/api, comments, preview, skill, library) are untouched. No existing imports or exports modified.

### Code Quality/Robustness

1. **Minor: Duplicated `readManifestDefaultEnv`** (deferred): Both netsuite.ts and run/index.ts contain identical 10-line helpers. Follows the codebase's self-contained handler pattern (db.ts, logs.ts, api.ts don't share helpers either). Not a correctness issue; consistent with existing conventions.

### Verification/Test Gaps

No test files for the new handlers, which is consistent with codebase convention -- no existing inspect handler tests exist (db.ts, logs.ts, api.ts have no handler-level tests).

## Changes Made by Code Review

No code changes made. The CLI implementation is correct and follows existing patterns.

## Remaining Risks / Deferred Items

1. **Network sandbox limitation**: npm registry unreachable (ENOTFOUND). TypeScript typecheck and build cannot be run. Previous Verification Pass 2 confirmed: tsc exit 0, build exit 0, 63/63 tests pass, help text shows both commands.

2. **Cross-repo integration**: CLI depends on server endpoints being deployed. Atomic deployment coordination is important (server + CLI must deploy together).

## Verification Impact Notes

No verification check IDs are affected. All CLI CHK-01 through CHK-05 remain valid. No code changes made since last verification pass.

## APL Statement Reference

See `code-review/apl.json`.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (BLD-693) | Primary specification | --env as plain parameter (Override 1), hlx run as top-level command |
| implementation/implementation-actual.md (cli) | Scope map of changed files | 2 new + 2 modified files; no code changes in retry pass |
| implementation-plan/implementation-plan.md (cli) | Plan and check criteria | 5 steps, 5 CHK checks |
| product/product.md | User scenarios | SCN-01 through SCN-09 CLI command signatures and expected outcomes |
| diagnosis/diagnosis-statement.md (cli) | Implementation completeness | All 4 CLI success criteria verified |
| repo-guidance.json | Repo intent classification | helix-cli = secondary target |
| src/inspect/netsuite.ts (direct read, 60 lines) | Full handler review | query/logs modes, manifest env reading, hxFetch POST, Zod-compatible body |
| src/run/index.ts (direct read, 53 lines) | Full handler review | --repo/--code/--modules/--env, modules split/trim/filter, hxFetch POST |
| src/inspect/index.ts (direct read, lines 1-15, 115-140) | Router wiring review | case "netsuite" with help text, --repo validation, cmdNetsuite dispatch |
| src/index.ts (direct read, lines 1-20, 90-115) | Main dispatcher review | case "run" with configOrHelp guard, cmdRun dispatch |
| src/lib/http.ts (direct read, lines 1-60) | URL construction verification | basePath='/api/inspect', URL=config.url+base+path, auth header logic |
| Server inspection-controller.ts (cross-reference) | Zod schema validation | Verified CLI body payloads match server discriminated union and runSuitescriptBody |
| Server api.ts:263-264 (cross-reference) | Route path verification | /inspect/:repositoryId/netsuite and /inspect/:repositoryId/run match CLI paths |
