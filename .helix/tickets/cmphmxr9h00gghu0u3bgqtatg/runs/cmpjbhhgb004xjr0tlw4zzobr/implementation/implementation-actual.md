# Implementation Actual: Goals Polish & Final (helix-cli)

## Summary of Changes

Extracted duplicated error parsing logic from `create.ts` and `terminate.ts` into a new shared `utils.ts` utility. Both files now import and use `parseApiError` instead of maintaining identical inline error extraction blocks. The `list.ts` ID display was left as-is because goals don't have a `shortId` field in the API response.

## Files Changed

| File | Why Changed | Review Hotspot |
|------|-------------|----------------|
| `src/goals/utils.ts` | **NEW** - Created shared `parseApiError(error: unknown): string` function extracting the duplicated error parsing pattern | Shared utility; consumed by `create.ts` and `terminate.ts` |
| `src/goals/create.ts` | Added `import { parseApiError } from "./utils.js"` and replaced 15-line inline error parsing catch block with `console.error(\`Error: \${parseApiError(error)}\`)` | Error handling path |
| `src/goals/terminate.ts` | Added `import { parseApiError } from "./utils.js"` and replaced 15-line inline error parsing catch block with `console.error(\`Error: \${parseApiError(error)}\`)` | Error handling path |

## Steps Executed

| Plan Step | Status | Notes |
|-----------|--------|-------|
| C1: Create shared error parsing utility | **Implemented** | `src/goals/utils.ts` with `parseApiError` function |
| C2: Update create.ts and terminate.ts | **Implemented** | Both files import and use `parseApiError`, inline parsing removed |
| C3: Align list.ts ID display | **Not changed** | Goals lack `shortId` in API response; `slice(0, 8)` is the correct approach |
| C4: Quality gates | **Passed** | typecheck and build both exit 0 |

## Verification Commands Run + Outcomes

| Command | Exit Code | Notes |
|---------|-----------|-------|
| `npm run typecheck` | 0 | tsc --noEmit clean |
| `npm run build` | 0 | tsc compilation clean |

## Test/Build Results

- **Typecheck**: Pass (tsc --noEmit, exit 0)
- **Build**: Pass (tsc, exit 0)

## Deviations from Plan

1. **list.ts ID display left as-is**: The plan anticipated checking for `shortId` availability. After inspection, confirmed that goals use cuid IDs and the GoalListItem type lacks a `shortId` field. The `slice(0, 8) + "..."` approach is correct and matches the API constraint. This matches the plan's "if shortId is NOT available" fallback.

## Known Limitations / Follow-ups

- No CLI tests exist in this repo (no test pattern for CLI commands per product doc).
- The `list.ts` ID display could use `shortId` if the server's goal list endpoint were extended to include it in the future, but this is a V2 consideration.

## Spec Deviations

None.

## Verification Plan Results

| Check ID | Outcome | Evidence |
|---|---|---|
| [CHK-01] | **pass** | `npm run typecheck` exits 0 with no errors |
| [CHK-02] | **pass** | `npm run build` exits 0, TypeScript compilation succeeds |

All verification checks pass.

## APL Statement Reference

CLI refactoring complete: shared parseApiError utility extracted to utils.ts, both create.ts and terminate.ts updated. list.ts ID display left as-is (goals lack shortId). All quality gates pass.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| implementation-plan/implementation-plan.md (CLI) | 4-step CLI refactoring plan | Extract utils.ts, update consumers, align list.ts, quality gates |
| implementation-plan/apl.json (CLI) | Verified plan scope | Two DRY improvements, no behavior changes |
| diagnosis/diagnosis-statement.md (CLI) | Validated two polish items | Duplicate error parsing and inconsistent ID display |
| create.ts (direct read) | Verified duplicate error parsing pattern | Identical to terminate.ts catch block |
| terminate.ts (direct read) | Verified duplicate error parsing pattern | Identical to create.ts catch block |
| list.ts (direct read) | Checked for shortId availability | GoalListItem type lacks shortId |
| get.ts (direct read) | Reference for ID display pattern | Uses child.shortId for tickets but goal IDs are cuids |
| repo-guidance.json | Repo intent | CLI is target with two minor improvements |
