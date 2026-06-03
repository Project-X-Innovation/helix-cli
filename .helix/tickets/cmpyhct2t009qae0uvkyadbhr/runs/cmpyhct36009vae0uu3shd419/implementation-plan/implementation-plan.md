# Implementation Plan — Goals Feature Flag (helix-cli)

## Overview

Add a try/catch wrapper in the `runGoals` function to catch 404 errors from the server when Goals is disabled and display a user-friendly message instead of raw HTTP errors. This is purely reactive — the CLI does not maintain feature flag state.

**Cross-repo dependency**: The server (helix-global-server) must be implemented first — it returns the 404 responses that this CLI catches.

## Implementation Principles

- Server is the single source of truth — no CLI-side feature flag env vars.
- Reactive error handling: catch server 404 responses, display clean message.
- Keep goals commands visible in help/docs regardless of server flag state.
- No changes to existing command logic or shared HTTP client.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| L1 | Add try/catch wrapper in `runGoals` | Error handling for feature-disabled responses |
| L2 | Run quality gates | Build, typecheck, tests pass |

## Detailed Implementation Steps

### Step L1: Add try/catch wrapper in `runGoals`

**Goal**: Catch errors from goals commands (especially 404 from disabled feature) and display user-friendly messages.

**What to Build**:
- In `src/goals/index.ts`:
  - Import `parseApiError` from `./utils.js`.
  - Wrap the `switch` statement body (lines 28-89) in a `try/catch` block.
  - In the `catch` block:
    - Use `parseApiError(error)` to extract the clean error message.
    - Print it with `console.error(\`Error: \${parseApiError(error)}\`)`.
    - Call `process.exit(1)`.
  - This wrapper catches errors from `list.ts` and `get.ts` (which lack local try/catch blocks). Commands with existing local catch blocks (`create.ts`, `terminate.ts`, `resume.ts`) will catch their own errors first via `process.exit(1)` in their catch blocks, so the wrapper only fires for commands without local error handling.

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmpyhct36009vae0uu3shd419/helix-cli
npx tsc --noEmit
```

**Success Criteria**:
- `runGoals` wraps the switch statement in try/catch.
- The catch block uses `parseApiError` to extract and display the error message.
- TypeScript compiles without errors.

---

### Step L2: Run quality gates

**Goal**: Confirm all quality gates pass after the changes.

**What to Build**: No code changes. Run all quality gate commands.

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmpyhct36009vae0uu3shd419/helix-cli
npm run typecheck && npm run test
```

**Success Criteria**:
- `npm run typecheck` passes.
- `npm run test` passes.

---

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js + npm installed | available | Dev environment | CHK-01 through CHK-03 |
| CLI npm dependencies installed (`npm install`) | available | package.json exists | CHK-01 through CHK-03 |
| CLI `.env` with `HELIX_API_KEY` and `HELIX_URL` | available | Dev setup config provides these | CHK-03 |
| Server (helix-global-server) running with `GOALS_ENABLED=false` | unknown | Staging server may not have changes deployed yet | CHK-03 |

### Required Checks

[CHK-01] TypeScript compilation passes
- Action: Run `npm run typecheck` in the helix-cli directory.
- Expected Outcome: Command exits with code 0, no type errors.
- Required Evidence: Full command output showing successful compilation.

[CHK-02] Tests pass
- Action: Run `npm run test` in the helix-cli directory.
- Expected Outcome: All existing tests pass.
- Required Evidence: Full test output showing all tests pass.

[CHK-03] CLI displays friendly error when Goals is disabled
- Action: Set `HELIX_URL` to the staging server (`https://helix-global-server-staging-3tl6o.ondigitalocean.app`) and `HELIX_API_KEY` from dev setup config in `.env`. Build the CLI with `npm run build`. Run `node dist/index.js goals list`.
- Expected Outcome: If the server has `GOALS_ENABLED=false`, the CLI displays a message containing "Goals feature is not available" (not a raw HTTP error like `HTTP 404 Not Found — {"error":...}`). If the server has `GOALS_ENABLED=true`, the CLI returns the goals list normally.
- Required Evidence: Full CLI output showing either the friendly error message or the normal goals list response.

## Success Metrics

1. `runGoals` wraps the switch statement in try/catch with `parseApiError`.
2. When server returns 404 for goals, CLI shows clean error message.
3. All quality gates pass (`typecheck`, `test`).
4. No changes to existing command files or shared HTTP client.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope and intent | CLI must handle disabled Goals gracefully |
| scout/scout-summary.md (cli) | Map CLI goals surface | 5 commands, no feature flag mechanism |
| scout/reference-map.json (cli) | Detailed file-level facts | runGoals dispatches 5 commands; parseApiError in utils.ts |
| diagnosis/diagnosis-statement.md (cli) | Root cause | No feature flag handling; raw HTTP errors surfaced |
| product/product.md | Product requirements | SCN-06: CLI shows friendly message when disabled |
| tech-research/tech-research.md (cli) | Architecture decisions | Wrapper try/catch in runGoals; reactive error handling |
| repo-guidance.json | Repo roles | CLI must gracefully handle 404 responses |
| src/goals/index.ts (direct read) | Verify dispatch structure | runGoals switch at lines 28-89; no try/catch wrapper |
| src/goals/utils.ts (direct read) | Verify error utility | parseApiError extracts .error from JSON body |
