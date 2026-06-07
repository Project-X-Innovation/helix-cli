# Implementation Plan — helix-cli (BLD-693)

## Overview

Add two new CLI subcommands (`hlx inspect netsuite` and `hlx run`) as thin HTTP interfaces to the server-side ns-gm decomposition endpoints. **All implementation code is already in place on the branch** (~4 files: 2 new, 2 modified), confirmed by diagnosis. This plan focuses on environment setup, quality gate validation, and verifying the CLI commands are correctly wired.

Key changes already on the branch:
- `src/inspect/netsuite.ts` (60 lines): `cmdNetsuite` handler with query/logs modes, reads manifest `nsDefaultEnv` for default `--env`, POSTs to `/{repoId}/netsuite`
- `src/run/index.ts` (53 lines): `cmdRun` handler with `--repo` (required), `--env`/`--code`/`--modules` (optional), POSTs to `/{repoId}/run`
- `src/inspect/index.ts`: `case "netsuite"` at lines 125-138 in inspect router switch
- `src/index.ts`: `case "run"` at lines 101-105 in main dispatcher switch

## Implementation Principles

- **Verify first, fix if needed**: Code is implemented. Run quality gates and fix only discovered issues.
- **Follow existing patterns**: Both handlers follow the `resolveRepo -> hxFetch POST -> console.log JSON` pattern from `db.ts` and `logs.ts`.
- **No new dependencies**: Zero runtime npm deps, consistent with codebase convention.
- **CLI builds independently**: TypeScript compilation can be verified without the server running.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Environment setup | .env written, `npm install` completed |
| 2 | TypeScript typecheck | `tsc --noEmit` passes |
| 3 | Build | `npm run build` succeeds (tsc) |
| 4 | Verify handler exports and router wiring | Files exist with correct exports and switch cases |
| 5 | CLI help text verification | Help output includes new commands |

## Detailed Implementation Steps

### Step 1: Environment Setup

**Goal**: Establish the CLI development environment.

**What to Build**:
- Write the `.env` file with `HELIX_API_KEY` and `HELIX_URL` from dev setup config
- Run `npm install` to ensure devDependencies are present (@types/node, typescript)

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmq3awa8n005rc50uxwa77och/helix-cli
test -f .env && echo "OK" || echo "MISSING"
npm install
```

**Success Criteria**:
- `.env` file exists with `HELIX_API_KEY` and `HELIX_URL`
- `npm install` exits with code 0

### Step 2: TypeScript Typecheck

**Goal**: Confirm all TypeScript types resolve correctly including the two new handler files.

**What to Build**:
- Run `npm run typecheck` (`tsc --noEmit`)
- If type errors are found, fix them in the affected files

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmq3awa8n005rc50uxwa77och/helix-cli
npm run typecheck
```

**Success Criteria**:
- `tsc --noEmit` exits with code 0 with no type errors

### Step 3: Build

**Goal**: Full TypeScript compilation succeeds.

**What to Build**:
- Run `npm run build` (executes `tsc`)
- This compiles all TypeScript to `dist/` including the new handler files

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmq3awa8n005rc50uxwa77och/helix-cli
npm run build
```

**Success Criteria**:
- Build exits with code 0
- `dist/inspect/netsuite.js` and `dist/run/index.js` exist in output

### Step 4: Verify Handler Exports and Router Wiring

**Goal**: Confirm the new handlers are correctly exported and wired into the command routers.

**What to Build**:
- Verify `src/inspect/netsuite.ts` exports `cmdNetsuite`
- Verify `src/run/index.ts` exports `cmdRun`
- Verify `src/inspect/index.ts` has `case "netsuite"` dispatching to `cmdNetsuite`
- Verify `src/index.ts` has `case "run"` dispatching to `cmdRun`

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmq3awa8n005rc50uxwa77och/helix-cli
# Check exports
grep -n "export.*cmdNetsuite" src/inspect/netsuite.ts
grep -n "export.*cmdRun" src/run/index.ts
# Check router wiring
grep -n '"netsuite"' src/inspect/index.ts
grep -n '"run"' src/index.ts
```

**Success Criteria**:
- Both handlers export their command functions
- Both routers have the correct case statements

### Step 5: CLI Help Text Verification

**Goal**: Verify the CLI help text includes the new commands.

**What to Build**:
- After building, run the CLI with `--help` to verify top-level help includes `hlx run`
- Run `hlx inspect --help` to verify inspect help includes `netsuite` subcommand

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmq3awa8n005rc50uxwa77och/helix-cli
node dist/index.js --help
node dist/index.js inspect --help
```

**Success Criteria**:
- Top-level help mentions `run` command
- Inspect help mentions `netsuite` subcommand

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js >= 18 runtime | available | package.json `engines.node: ">=18"` | CHK-01 through CHK-05 |
| npm devDependencies installed | available | `npm install` in Step 1 | CHK-01 through CHK-05 |
| .env file with HELIX_API_KEY and HELIX_URL | available | Dev setup config provides values | CHK-05 |
| helix-global-server running with new routes | unknown | Depends on server-side implementation being deployed; CLI can build/typecheck independently | CHK-05 |

### Required Checks

[CHK-01] TypeScript typecheck passes
- Action: Run `npm run typecheck` (`tsc --noEmit`) from the helix-cli root directory.
- Expected Outcome: Command exits with code 0 and no type errors.
- Required Evidence: Terminal output showing the command completes with exit code 0 and no error lines.

[CHK-02] Build succeeds
- Action: Run `npm run build` (`tsc`) from the helix-cli root directory.
- Expected Outcome: Build completes successfully. `dist/inspect/netsuite.js` and `dist/run/index.js` exist in the output directory.
- Required Evidence: Build command output with exit code 0. File listing of `dist/inspect/netsuite.js` and `dist/run/index.js` showing they exist.

[CHK-03] Handler files exist with correct exports
- Action: Verify `src/inspect/netsuite.ts` exports `cmdNetsuite` and `src/run/index.ts` exports `cmdRun`. Verify `src/inspect/index.ts` switch includes `case "netsuite"` and `src/index.ts` switch includes `case "run"`.
- Expected Outcome: All four files have the expected exports and switch cases.
- Required Evidence: grep output showing `export` lines for `cmdNetsuite` and `cmdRun`, and `case "netsuite"` and `case "run"` in the respective router files.

[CHK-04] CLI help text includes new commands
- Action: After building, run `node dist/index.js --help` and `node dist/index.js inspect --help` from the helix-cli root directory.
- Expected Outcome: Top-level help output includes the `run` command. Inspect help output includes the `netsuite` subcommand.
- Required Evidence: Command output from both help invocations showing the new commands listed in the usage text.

[CHK-05] Tests pass
- Action: Run `npm test` from the helix-cli root directory (runs `tsc && node --test dist/**/*.test.js`).
- Expected Outcome: Test command completes without failures. If no test files exist for the new handlers (consistent with codebase convention where no existing inspect handlers have tests), the test runner completes with zero failures.
- Required Evidence: Test runner output showing completion with exit code 0.

## Cross-Repo Coordination Notes

- `hlx inspect netsuite` POSTs to `POST /api/inspect/{repoId}/netsuite` — this route is registered in helix-global-server's `api.ts` at line 263.
- `hlx run` POSTs to `POST /api/inspect/{repoId}/run` — this route is registered in helix-global-server's `api.ts` at line 264.
- The CLI reads `nsDefaultEnv` from `/tmp/helix-inspect/manifest.json` — this field is written by helix-global-server's `configureInspectionForStep` during sandbox provisioning.
- Both CLI handlers use the existing `HELIX_INSPECT_TOKEN` env var for Bearer auth in-sandbox.
- The helix-global-server implementation should be verified first since the CLI depends on server endpoints for end-to-end functionality, but the CLI can be built and type-checked independently.

## Success Metrics

1. TypeScript typecheck passes (CHK-01)
2. Build succeeds with compiled output (CHK-02)
3. Handler files correctly exported and router-wired (CHK-03)
4. CLI help text includes both new commands (CHK-04)
5. Tests pass (CHK-05)

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (BLD-693 + RSH-636 Research Report) | Primary specification | Two CLI subcommands, --env as plain parameter |
| diagnosis/diagnosis-statement.md (cli) | Implementation completeness | All 4 success criteria verified; code is in place |
| diagnosis/apl.json (cli) | Answered CLI structure questions | hxFetch basePath works, --env as body param |
| scout/scout-summary.md (cli) | CLI architecture analysis | Switch-based routing, hxFetch client, flag utilities, zero runtime deps |
| scout/reference-map.json (cli) | File map with handler patterns | db.ts/logs.ts templates, exact locations |
| product/product.md | User scenarios | SCN-01 through SCN-13 define command signatures and expected outcomes |
| tech-research/tech-research.md (cli) | Architecture decisions | AD-1 (separate files), AD-2 (run top-level), AD-3 (--env body param), AD-4 (manifest default) |
| repo-guidance.json | Repo intent | helix-cli = secondary target |
