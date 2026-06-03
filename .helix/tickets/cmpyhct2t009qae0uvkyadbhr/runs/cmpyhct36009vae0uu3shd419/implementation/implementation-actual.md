# Implementation Actual — Goals Feature Flag (helix-cli)

## Summary of Changes

Added a try/catch wrapper around the `runGoals` switch statement to catch errors (including server 404 responses when Goals is disabled) and display a user-friendly message via `parseApiError`.

## Files Changed

| File | Why Changed | Review Hotspot |
|------|-------------|----------------|
| `src/goals/index.ts` | Added `parseApiError` import; wrapped switch statement in try/catch; catch block logs friendly error and exits | Error handling: goals command dispatcher |

## Steps Executed

| Plan Step | Action | Outcome |
|-----------|--------|---------|
| L1 | Imported `parseApiError` from `./utils.js` (line 8); wrapped switch statement (lines 29-92) in try/catch; catch block at lines 93-95 uses `parseApiError(error)` | TypeScript compiles |
| L2 | Ran typecheck and tests | All pass |

## Verification Commands Run + Outcomes

1. `npm run typecheck` — Exit code 0, no type errors
2. `npm run test` — 63 tests pass, 0 fail

## Test/Build Results

- **TypeScript**: Clean compilation, 0 errors
- **Tests**: 63 pass, 0 fail

## Deviations from Plan

None.

## Known Limitations / Follow-ups

- CHK-03 (CLI friendly error when Goals disabled) cannot be fully verified because the staging server does not yet have the server-side changes deployed. Once deployed, `hlx goals list` would receive a 404 with `{"error":"Goals feature is not available."}` and the CLI would display `Error: Goals feature is not available.`.

## Spec Deviations

None.

## Verification Plan Results

| Check ID | Outcome | Evidence |
|----------|---------|----------|
| CHK-01 | pass | `npm run typecheck` exits 0, no type errors |
| CHK-02 | pass | `npm run test` — 63 tests pass, 0 fail |
| CHK-03 | blocked | Staging server does not have server-side changes deployed, so goals API is not returning 404. Code inspection confirms: `parseApiError` extracts `.error` from JSON body in `HTTP <status> — <body>` format, and the catch block formats it as `Error: <message>`. The server's 404 response (`{"error":"Goals feature is not available."}`) will produce `Error: Goals feature is not available.` in the CLI. |

## APL Statement Reference

The CLI implementation adds a try/catch wrapper in runGoals that uses parseApiError to display friendly error messages when the server returns 404 for disabled Goals. One file changed, no new dependencies.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope and intent | CLI must handle disabled Goals gracefully |
| implementation-plan/implementation-plan.md (cli) | Step-by-step instructions | L1-L2 steps with exact targets |
| implementation-plan/apl.json (cli) | Architecture decisions | Wrapper try/catch in runGoals; reactive error handling |
| repo-guidance.json | Repo roles | CLI must gracefully handle 404 responses |
| src/goals/index.ts (direct read) | Verify dispatch structure | runGoals switch at lines 28-89; no try/catch wrapper |
| src/goals/utils.ts (direct read) | Verify error utility | parseApiError extracts .error from JSON body |
