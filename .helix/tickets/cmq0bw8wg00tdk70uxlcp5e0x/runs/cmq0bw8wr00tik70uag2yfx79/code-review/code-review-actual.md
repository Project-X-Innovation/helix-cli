# Code Review Actual -- helix-cli: Playbook Check CLI Commands

## Review Scope

Reviewed all 4 changed files (3 new, 1 modified) in helix-cli against ticket requirements, product spec (SCN-07, SCN-08), and CLI implementation plan. Expanded review into supporting code (lib/http.ts hxFetch, lib/flags.ts hasFlag/isHelpRequested, goals/utils.ts parseApiError).

## Files Reviewed

| File | Verdict | Notes |
|------|---------|-------|
| `src/playbook/index.ts` (NEW) | Pass | Follows goals/ pattern. Switch-based routing with help text, parseApiError error handling, ruleId validation. |
| `src/playbook/check.ts` (NEW) | Pass | POST trigger + GET poll with 5s interval, 120 max polls (10min). Terminal states PASS/FAIL/ERROR. --json flag. Exit code 0 for PASS, 1 otherwise. Handles immediately-terminal checks (GENERAL org ERROR). Timeout handling with clear message. |
| `src/playbook/checks.ts` (NEW) | Pass | GET history with formatted table (ID, Status, Compliance, Checked At). Handles empty list gracefully. --json flag. |
| `src/index.ts` | Pass | Import added at L17, playbook case at L133-136 using configOrHelp pattern, usage text updated with both commands. |

## Missed Requirements & Issues Found

### Requirements Gaps
None found. CLI implementation covers both SCN-07 (trigger + poll) and SCN-08 (list history).

### Correctness/Behavior Issues
None found. The polling loop, terminal state detection, API communication, and error handling are all correct.

### Regression Risks
None identified. All changes are additive (3 new files + 1 new switch case).

### Code Quality/Robustness
- The CLI correctly uses `basePath: "/api"` for all hxFetch calls, matching the server route prefix.
- Error propagation from hxFetch (network errors, HTTP errors) is handled by the try-catch in runPlaybook which calls parseApiError for user-friendly messages.
- The CheckRecord type in check.ts includes all fields from the server's PlaybookRuleCheck model.

### Verification/Test Gaps
- CLI has no test framework configured; no lint script in package.json. TypeScript compilation is the only quality gate.
- End-to-end testing blocked until server endpoints are deployed to staging.

## Changes Made by Code Review

No code changes were needed in helix-cli. All files pass review.

## Remaining Risks / Deferred Items

1. **End-to-end testing blocked**: CLI commands cannot be tested against live API until server changes are deployed.
2. **No fuzzy rule-ref matching**: MVP accepts raw rule IDs only.
3. **Fixed polling interval**: No exponential backoff. Acceptable for expected check durations (1-5 minutes).

## Verification Impact Notes

No CLI code changes made by code review. All verification checks remain valid.

## APL Statement Reference

See `code-review/apl.json` for the full APL trace.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | CLI scope: hlx playbook check (trigger + poll), hlx playbook checks (list history) |
| implementation/implementation-actual.md (CLI) | Scope map of changed files | 4 files (3 new, 1 modified) |
| implementation/apl.json (CLI) | Implementation Q&A | All 4 questions answered with evidence |
| implementation-plan/implementation-plan.md (CLI) | Planned steps and verification plan | 5 steps, 4 verification checks |
| product/product.md | Product requirements | SCN-07 (trigger+poll) and SCN-08 (list history) covered |
| src/lib/http.ts | HTTP client used by CLI | hxFetch with basePath, auth, retries, 30s timeout |
| src/goals/utils.ts | Error parsing | parseApiError extracts .error from JSON error responses |
