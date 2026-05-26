# Implementation Plan: Goals Polish & Final (helix-cli)

## Overview

Two minor code quality improvements: extract duplicated error parsing logic into a shared utility, and align goal ID display format to consistently use `shortId` across `list` and `get` commands. No behavior changes -- these are internal DRY/consistency refactors. Tertiary priority.

## Implementation Principles

- **DRY**: Deduplicate identical error parsing from `create.ts:66-83` and `terminate.ts:30-47` into `src/goals/utils.ts`.
- **Consistency**: Align `list.ts` ID display to match `get.ts` approach (prefer `shortId` field when available).
- **No behavior changes**: External command output, flags, and error messages remain identical.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| C1 | Create shared error parsing utility | New `src/goals/utils.ts` |
| C2 | Update create.ts and terminate.ts to use shared utility | Modified `create.ts`, `terminate.ts` |
| C3 | Align list.ts ID display | Modified `list.ts` |
| C4 | Run quality gates | Typecheck + build pass |

## Detailed Implementation Steps

### Step C1: Create shared error parsing utility

**Goal**: Extract the duplicated error response parsing pattern into a reusable function.

**What to Build**:
- Create `src/goals/utils.ts` with a named export `parseApiError(error: unknown): string`.
- The function encapsulates the pattern from `create.ts:66-83` and `terminate.ts:30-47`:
  1. Convert error to string message (`error instanceof Error ? error.message : String(error)`)
  2. Find ` — ` dash separator in message
  3. Try `JSON.parse` on the portion after the dash
  4. If parsed object has `.error`, return that string
  5. Otherwise return the raw message
- The function returns the error string; it does NOT call `console.error` or `process.exit` -- those remain in the calling code to preserve current behavior.

**Verification (AI Agent Runs)**:
1. File exists at `src/goals/utils.ts`
2. Exports `parseApiError` function
3. `npm run typecheck` passes

**Success Criteria**: `parseApiError` is defined once in `utils.ts` and handles the full error extraction logic.

### Step C2: Update create.ts and terminate.ts to use shared utility

**Goal**: Replace duplicated error parsing blocks with calls to the shared utility.

**What to Build**:
- In `src/goals/create.ts` (lines ~66-83), replace the catch block's error parsing logic with:
  ```
  import { parseApiError } from "./utils.js";
  // In catch block:
  console.error(`Error: ${parseApiError(error)}`);
  process.exit(1);
  ```
- In `src/goals/terminate.ts` (lines ~30-47), apply the same replacement.
- Both files retain their `console.error` + `process.exit(1)` calls -- only the message extraction changes.

**Verification (AI Agent Runs)**:
1. `create.ts` imports from `./utils.js` and calls `parseApiError`
2. `terminate.ts` imports from `./utils.js` and calls `parseApiError`
3. Neither file contains the inline `JSON.parse` error extraction pattern
4. `npm run typecheck` passes

**Success Criteria**: The duplicate error parsing code is removed from both files, replaced by the shared import.

### Step C3: Align list.ts ID display format

**Goal**: Use consistent ID formatting across `list` and `get` commands.

**What to Build**:
- In `src/goals/list.ts` (line 54), the current code is `item.id.slice(0, 8) + "..."`.
- Check if the `GoalListItem` type (line 5-12) has access to a `shortId`-like field. The list API response may or may not include `shortId`.
- If `shortId` is available in the API response: update the type and use `item.shortId ?? item.id.slice(0, 8) + "..."`.
- If `shortId` is NOT in the list API response: note this as a known limitation and leave the current `slice` approach (since the server list endpoint may not return shortId for goals, and goals may not have a shortId pattern like tickets do).
- The `get.ts` command already handles this correctly with its fallback pattern.

**Verification (AI Agent Runs)**:
1. `list.ts` ID display uses `shortId` when available, or documents why it doesn't
2. `npm run typecheck` passes

**Success Criteria**: ID display format is consistent or documented as intentionally different due to API constraints.

### Step C4: Run quality gates

**Goal**: Verify no regressions.

**What to Build**: Nothing new.

**Verification (AI Agent Runs)**:
1. `npm run typecheck` (tsc --noEmit) passes
2. `npm run build` (tsc) passes

**Success Criteria**: Both commands exit 0.

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|---|---|---|---|
| node_modules installed | unknown | `npm install` required in helix-cli | [CHK-01], [CHK-02] |
| .env file written | available | Dev setup config provides HELIX_API_KEY and HELIX_URL | [CHK-02] |

### Required Checks

[CHK-01] TypeScript typecheck passes after refactoring
- Action: Run `npm run typecheck` in helix-cli root.
- Expected Outcome: Command exits with code 0 and no type errors.
- Required Evidence: Terminal output showing successful completion with exit code 0.

[CHK-02] Build succeeds
- Action: Run `npm run build` in helix-cli root.
- Expected Outcome: TypeScript compilation succeeds, producing output in dist/.
- Required Evidence: Terminal output showing successful build with exit code 0.

## Success Metrics

1. `src/goals/utils.ts` exists and exports `parseApiError`.
2. `create.ts` and `terminate.ts` import and use `parseApiError` instead of inline duplicate logic.
3. ID display in `list.ts` is consistent with `get.ts` (or documented as API-constrained).
4. Quality gates pass.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/diagnosis-statement.md (CLI) | Validated two polish items | Duplicate error parsing and inconsistent ID display; minor improvements |
| product/product.md (CLI) | Scoped requirements | Two internal refactors; no behavior changes; tertiary priority |
| tech-research/tech-research.md (CLI) | Implementation approach | New `src/goals/utils.ts` with `parseApiError`; align list.ts to shortId |
| scout/scout-summary.md (CLI) | Code quality assessment | CLI rated ~7.5/10; solid implementation with minor DRY issues |
| create.ts:66-83 (direct read) | Verified duplicate error pattern | Identical try/JSON.parse/catch with terminate.ts |
| terminate.ts:30-47 (direct read) | Verified duplicate error pattern | Identical pattern to create.ts |
| list.ts (direct read) | Verified ID display | Uses `item.id.slice(0, 8) + "..."` at line 54 |
| repo-guidance.json | Repo intent | CLI is target with two minor improvements; tertiary priority |
