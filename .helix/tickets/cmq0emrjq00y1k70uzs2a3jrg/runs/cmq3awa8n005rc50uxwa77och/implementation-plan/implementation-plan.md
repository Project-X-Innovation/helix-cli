# Implementation Plan — BLD-693: ns-gm Server-Side Decomposition (helix-cli)

## Overview

Add two new CLI subcommands (`hlx inspect netsuite` and `hlx run`) as thin HTTP interfaces to the server-side ns-gm decomposition. The CLI sends authenticated POST requests to the server's inspection proxy endpoints and prints JSON results. ~4 files changed (2 new, 2 modified). Zero new npm dependencies.

## Implementation Principles

- Follow existing handler patterns (`db.ts`, `logs.ts`) exactly — `resolveRepo -> hxFetch POST -> console.log JSON`.
- Use existing utilities (`hxFetch`, `getFlag`, `resolveRepo`, `getPositionalArgs`) without modification.
- `--env` parameter is a body field, consistent with how `--limit` is passed in the logs handler.
- `hlx run` is a top-level command (not under `inspect`) to reflect its different governance model.
- Default environment comes from manifest's `nsDefaultEnv` when `--env` is not explicitly provided.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Create inspect netsuite handler | New `src/inspect/netsuite.ts` |
| 2 | Create hlx run handler | New `src/run/index.ts` |
| 3 | Add netsuite case to inspect router | Modified `src/inspect/index.ts` |
| 4 | Add run case to main dispatcher | Modified `src/index.ts` |
| 5 | Run quality gates | Passing typecheck and build |

## Detailed Implementation Steps

### Step 1: Create src/inspect/netsuite.ts

**Goal:** Handler for `hlx inspect netsuite` supporting both SuiteQL queries and log retrieval.

**What to Build:**
- Create `src/inspect/netsuite.ts` following the `db.ts` and `logs.ts` patterns.
- Export `cmdNetsuite(config: HxConfig, repoNameOrId: string, args: string[]): Promise<void>`.
- Determine request type from args:
  - If first positional arg is `logs` -> type is `'logs'`, optionally read `--script-id` flag.
  - Otherwise -> type is `'query'`, read query from `--query` flag or remaining positional args.
- Read `--env` flag via `getFlag(args, '--env')`.
- If `--env` is not provided, read `nsDefaultEnv` from `/tmp/helix-inspect/manifest.json` (if available) and use that value.
- Call `resolveRepo(config, repoNameOrId)` to get `repoId`.
- Build body object: `{ type, query?, scriptId?, env? }`.
- Call `hxFetch(config, '/${repoId}/netsuite', { method: 'POST', body })`.
- `console.log(JSON.stringify(result, null, 2))`.
- Imports: `HxConfig` from `../lib/config.js`, `hxFetch` from `../lib/http.js`, `resolveRepo` from `../lib/resolve-repo.js`, `getFlag`/`getPositionalArgs` from `../lib/flags.js`, `readFileSync` from `node:fs`.

**Verification (AI Agent Runs):**
- `npx tsc --noEmit` passes.
- File exports `cmdNetsuite`.
- Body includes `type` discriminator.

**Success Criteria:**
- Handler follows the existing pattern.
- Supports both `query` and `logs` modes.
- `--env` passed in body when provided.
- Default env read from manifest when `--env` is omitted.

---

### Step 2: Create src/run/index.ts

**Goal:** Handler for top-level `hlx run` command for arbitrary SuiteScript execution.

**What to Build:**
- Create directory `src/run/` and file `src/run/index.ts`.
- Export `cmdRun(config: HxConfig, args: string[]): Promise<void>`.
- Parse flags:
  - `--repo` via `getFlag(args, '--repo')` — required.
  - `--env` via `getFlag(args, '--env')` — optional.
  - `--code` via `getFlag(args, '--code')` — optional (alternative to positional).
  - `--modules` via `getFlag(args, '--modules')` — optional, comma-separated list.
- Get code from `--code` flag or remaining positional args (joined with space).
- If `--env` is not provided, read `nsDefaultEnv` from `/tmp/helix-inspect/manifest.json` (if available).
- Call `resolveRepo(config, repoNameOrId)`.
- Build body: `{ code, modules?, env? }`.
- Call `hxFetch(config, '/${repoId}/run', { method: 'POST', body })`.
- `console.log(JSON.stringify(result, null, 2))`.
- Error if `--repo` or `code` is missing.

**Verification (AI Agent Runs):**
- `npx tsc --noEmit` passes.
- File exports `cmdRun`.
- Body includes `code` field.

**Success Criteria:**
- Handler follows the existing pattern.
- Supports both positional and `--code` flag for code input.
- `--modules` parsed as comma-separated array.
- `--env` passed in body when provided.

---

### Step 3: Add netsuite Case to Inspect Router

**Goal:** Wire `hlx inspect netsuite` into the inspect subcommand router.

**What to Build:**
- In `src/inspect/index.ts`:
  - Add `import { cmdNetsuite } from "./netsuite.js";` at the top.
  - Add `case "netsuite"` to the switch statement after the existing `api` case (around line 120):
    ```typescript
    case "netsuite": {
      if (isHelpRequested(rest)) {
        console.log(`Usage: hlx inspect netsuite --repo <name> --query "<suiteql>"
       hlx inspect netsuite --repo <name> logs [--script-id <id>]
       
Options:
  --env prod|sandbox    Override environment (default from step context)`);
        process.exit(0);
      }
      const repo = getFlag(rest, "--repo");
      if (!repo) { console.error("Error: --repo is required."); inspectUsage(); }
      await cmdNetsuite(config, repo, rest);
      break;
    }
    ```
  - Update the `inspectUsage` function's usage text (lines 9-31) to include the netsuite subcommand:
    ```
    hlx inspect netsuite --repo <name> --query "<suiteql>"
    hlx inspect netsuite --repo <name> logs [--script-id <id>]
    ```

**Verification (AI Agent Runs):**
- `npx tsc --noEmit` passes.
- `case "netsuite"` exists in the switch statement.
- Help text updated.

**Success Criteria:**
- `hlx inspect netsuite` dispatches to `cmdNetsuite`.
- Help text includes netsuite usage.
- `--repo` is validated as required.

---

### Step 4: Add run Case to Main Dispatcher

**Goal:** Wire `hlx run` as a top-level command.

**What to Build:**
- In `src/index.ts`:
  - Add `import { cmdRun } from "./run/index.js";` at the top (with other imports).
  - Add `case "run"` to the switch statement after the existing `inspect` case (around line 94):
    ```typescript
    case "run": {
      const config = configOrHelp(args.slice(1));
      await cmdRun(config, args.slice(1));
      break;
    }
    ```
  - Update the `usage` function's text (lines 39-67) to include:
    ```
    hlx run --repo <name> <code>          Execute SuiteScript server-side
    hlx run --repo <name> --code <code> [--modules m1,m2] [--env prod|sandbox]
    ```

**Verification (AI Agent Runs):**
- `npx tsc --noEmit` passes.
- `case "run"` exists in the switch statement.
- Usage text includes `hlx run`.

**Success Criteria:**
- `hlx run` dispatches to `cmdRun`.
- Usage text includes run command.
- Uses `configOrHelp` for config loading.

---

### Step 5: Quality Gates

**Goal:** Ensure all quality gates pass for the CLI changes.

**What to Build:** No code changes. Run quality checks.

**Verification (AI Agent Runs):**
- Typecheck: `npx tsc --noEmit`
- Build: `npm run build` (runs `tsc`)
- Tests (if any): `npm test` (runs `tsc && node --test dist/**/*.test.js`)

**Success Criteria:**
- TypeScript compiles without errors.
- Build succeeds.

---

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|-----------|--------|----------------|----------------|
| Node.js + npm installed | available | Dev environment | CHK-01 through CHK-05 |
| `npm install` completed | available | Standard dev setup | CHK-01 through CHK-05 |
| `.env` file with HELIX_API_KEY and HELIX_URL | available | Dev setup config provides values | CHK-04 |
| helix-global-server running on port 4000 with new routes | unknown | Depends on server-side implementation completing first | CHK-04 |

### Required Checks

[CHK-01] TypeScript typecheck passes
- Action: Run `npx tsc --noEmit` from the helix-cli root.
- Expected Outcome: Command exits with code 0 and no type errors.
- Required Evidence: Full command output showing zero errors.

[CHK-02] Build succeeds
- Action: Run `npm run build` from the helix-cli root.
- Expected Outcome: Build completes successfully.
- Required Evidence: Build command output with exit code 0.

[CHK-03] New handler files exist with correct exports
- Action: Verify `src/inspect/netsuite.ts` exports `cmdNetsuite` and `src/run/index.ts` exports `cmdRun`. Verify `src/inspect/index.ts` switch includes `case "netsuite"` and `src/index.ts` switch includes `case "run"`.
- Expected Outcome: All four files have the expected exports and switch cases.
- Required Evidence: File content showing the export declarations and switch cases.

[CHK-04] CLI help text includes new commands
- Action: After building, run `node dist/index.js --help` and `node dist/index.js inspect --help`.
- Expected Outcome: Top-level help includes `hlx run` command. Inspect help includes `hlx inspect netsuite` subcommand.
- Required Evidence: Command output showing both new commands in help text.

[CHK-05] Tests pass (if any exist)
- Action: Run `npm test` from the helix-cli root.
- Expected Outcome: Test command completes without failures.
- Required Evidence: Test runner output (or "no tests found" if no test files exist for the changed code, which is expected per scout analysis).

## Cross-Repo Coordination Notes

- The helix-cli `hlx inspect netsuite` handler POSTs to `POST /api/inspect/{repoId}/netsuite` — this route is registered in helix-global-server Step 4.
- The helix-cli `hlx run` handler POSTs to `POST /api/inspect/{repoId}/run` — this route is registered in helix-global-server Step 4.
- The CLI reads `nsDefaultEnv` from `/tmp/helix-inspect/manifest.json` — this field is written by helix-global-server Step 5 (`configureInspectionForStep`).
- Both CLI handlers use the existing `HELIX_INSPECT_TOKEN` env var for auth — no new auth mechanism needed.
- The server-side changes should be implemented first since the CLI depends on the server endpoints.

## Success Metrics

1. `hlx inspect netsuite` sends correct POST requests to the server endpoint.
2. `hlx run` sends correct POST requests to the server endpoint.
3. Both commands support `--env prod|sandbox` and read manifest defaults.
4. Help text updated for both commands.
5. TypeScript typecheck and build pass.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (BLD-693 + overrides) | Primary specification | Two CLI subcommands, --env as plain parameter |
| ticket.md (RSH-636 Research Report) | CLI scope | ~4 files: 2 new handlers, 2 router modifications |
| diagnosis/diagnosis-statement.md (cli) | CLI implementation scope | hxFetch basePath works, --env as body param |
| tech-research/tech-research.md (cli) | Architecture decisions | AD-1 (separate files), AD-2 (hlx run top-level), AD-3 (--env body param), AD-4 (manifest default env) |
| scout/scout-summary.md (cli) | CLI architecture analysis | Switch-based routing, hxFetch client, flag utilities |
| scout/reference-map.json (cli) | File map | Exact handler patterns and locations |
| src/inspect/db.ts | Handler template | resolveRepo -> hxFetch POST -> console.log JSON (12 lines) |
| src/inspect/logs.ts | Handler with optional flag | --limit flag sent as body param — same pattern for --env |
| src/inspect/index.ts | Inspect router | Switch with repos/db/logs/api cases, help text structure |
| src/index.ts:81-156 | Main dispatcher | Switch with 13 commands, configOrHelp pattern |
| src/lib/http.ts | HTTP client | basePath /api/inspect, Bearer auth, retry |
| src/lib/flags.ts | Flag parsing | getFlag, hasFlag, getPositionalArgs |
| product/product.md | User scenarios | SCN-01 through SCN-06 define CLI command signatures |
