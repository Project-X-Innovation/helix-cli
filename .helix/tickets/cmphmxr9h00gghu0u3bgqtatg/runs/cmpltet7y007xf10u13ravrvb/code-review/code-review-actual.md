# Code Review: Goals Polish & Final (helix-cli)

## Review Scope

Reviewed the CLI DRY refactoring: extraction of shared `parseApiError` utility from `create.ts` and `terminate.ts` into new `utils.ts`. Also verified the `list.ts` ID display decision.

## Files Reviewed

| File | Review Result |
|------|---------------|
| `src/goals/utils.ts` | **NEW** - Verified: exports `parseApiError(error: unknown): string`. Correctly handles Error instances, non-Error values, em-dash delimited HTTP error format, and JSON parse failures. Well-documented with JSDoc. |
| `src/goals/create.ts` | Verified: imports `parseApiError` from `./utils.js` (line 5). Uses it at line 68 in catch block. No duplicate error parsing logic remains. |
| `src/goals/terminate.ts` | Verified: imports `parseApiError` from `./utils.js` (line 4). Uses it at line 32 in catch block. No duplicate error parsing logic remains. |

## Missed Requirements & Issues Found

### Requirements gaps
None. The shared error parsing utility is correctly extracted and both consumers updated.

### Correctness/behavior issues
None. The `parseApiError` function correctly:
- Handles `Error` instances via `instanceof` check
- Falls back to `String(error)` for non-Error values
- Parses the `hxFetch` error format (`HTTP <status> — <JSON body>`)
- Extracts `.error` field from parsed JSON body
- Falls through to raw message on JSON parse failure

### Regression risks
None. The error parsing logic was duplicated verbatim between both files. Extraction into a shared utility preserves identical behavior.

### Code quality/robustness
Clean implementation. The function handles all edge cases and has clear JSDoc documentation explaining the expected error format.

### Verification/test gaps
No CLI tests exist in this repo (documented as out of scope in product spec).

## Changes Made by Code Review

No code changes were needed. The implementation is correct.

## Remaining Risks / Deferred Items

1. **No CLI test coverage**: No test pattern exists for CLI commands. This is documented as out of scope for this ticket.
2. **list.ts ID display**: Left as `slice(0, 8)` since Goals lack `shortId` in the API response. Correct decision.

## Verification Impact Notes

No verification plan checks are affected:
- **[CHK-01]**: Valid (typecheck passes, confirmed by code review)
- **[CHK-02]**: Valid (build passes, confirmed by code review)

## APL Statement Reference

CLI refactoring verified correct: parseApiError utility properly extracted to utils.ts. Both create.ts and terminate.ts updated to use shared utility. list.ts ID display correctly left as-is (Goals lack shortId). No issues found, no code changes needed. Typecheck passes.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| implementation/implementation-actual.md (CLI) | Scope map for review | Three files changed, list.ts left as-is |
| implementation/apl.json (CLI) | Implementation claims to verify | Shared utility created, consumers updated |
| utils.ts (direct read) | Verify new utility | Correct error parsing with all edge cases handled |
| create.ts (direct read) | Verify import and usage | parseApiError imported and used at line 68 |
| terminate.ts (direct read) | Verify import and usage | parseApiError imported and used at line 32 |
| repo-guidance.json | Repo intent | CLI is tertiary target with minor DRY improvements |
