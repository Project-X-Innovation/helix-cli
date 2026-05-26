# Tech Research: Goals Polish & Final (helix-cli)

## Technology Foundation

- **Runtime**: Node.js + TypeScript
- **Build**: `tsc` (TypeScript compiler)
- **Pattern**: Command files in `src/goals/` (index.ts, create.ts, list.ts, get.ts, terminate.ts)
- **Scope**: Two minor DRY/consistency improvements -- tertiary priority

## Architecture Decisions

### Decision 1: Shared Error Parsing Utility

**Options considered:**
- **(A) New `src/goals/utils.ts`**: Colocated with goals commands. Clear scope. Easy to find.
- **(B) New `src/utils.ts` at CLI root**: More general location. But the error parsing pattern may be goals-specific; other CLI commands may not need it.
- **(C) Inline deduplication (export from create.ts, import in terminate.ts)**: Creates dependency between sibling command files.

**Chosen: (A) `src/goals/utils.ts`**

**Rationale**: The duplicated error parsing logic exists in `create.ts:68-79` and `terminate.ts:31-43`. Both are in `src/goals/`. A `utils.ts` in the same directory keeps the utility colocated with its consumers. If other CLI commands later need the same pattern, it can be promoted to `src/utils.ts`. The utility function signature: `function parseApiError(error: unknown): string` -- extracts message from JSON error body with try/catch fallback.

### Decision 2: Consistent ID Display Format

**Options considered:**
- **(A) Align list.ts to use shortId like get.ts**: `get.ts` prefers the `shortId` field with fallback to abbreviated ID. This matches the client convention where `formatShortId()` generates readable IDs.
- **(B) Align get.ts to use raw slice like list.ts**: Simpler but loses the human-readable shortId format.
- **(C) Leave inconsistent**: Not acceptable for a polish ticket.

**Chosen: (A) Align list.ts to use shortId**

**Rationale**: The `get.ts` command uses `shortId` (a formatted field like "BLD-42") with fallback to `id.slice(0, 8) + "..."`. This is the better pattern because shortId is meaningful to users. `list.ts` currently uses `id.slice(0, 8) + "..."` which shows a raw cuid fragment. Aligning to shortId depends on whether the list API response includes `shortId` -- if not, the fallback `id.slice(0, 8)` remains. The GoalListItem API response should be checked during implementation; if shortId is absent, the implementation should use the available fields.

## Core API/Methods

| Method | File | Change |
|---|---|---|
| `parseApiError()` | New `src/goals/utils.ts` | Extract shared error parsing from create.ts and terminate.ts |
| ID display | `src/goals/list.ts` | Use shortId field when available, fallback to slice |

## Technical Decisions (Rejected Alternatives)

| Decision | Rejected | Why Rejected |
|---|---|---|
| Shared utility location | `src/utils.ts` root | Over-generalized for a goals-specific pattern |
| Shared utility location | Export from create.ts | Creates coupling between sibling commands |
| ID display | Align get.ts to use raw slice | Loses meaningful shortId format |

## Technical Checks

[TCK-01] Error parsing extracted to shared utility
- Decision Reference: "New `src/goals/utils.ts` with parseApiError function"
  (from Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `src/goals/utils.ts` exports a `parseApiError` function. `create.ts` and `terminate.ts` import and call this function instead of duplicating the try/JSON.parse/catch pattern.

[TCK-02] Consistent ID display across list and get commands
- Decision Reference: "Align list.ts to use shortId like get.ts"
  (from Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: `list.ts` uses `shortId` field (or equivalent) for goal ID display, consistent with `get.ts` approach. Raw `id.slice(0, 8)` is only used as fallback.

## Cross-Platform Considerations

Not applicable -- Node.js CLI tool.

## Performance Expectations

No performance impact -- these are code quality refactors with identical runtime behavior.

## Dependencies

No new dependencies. Both changes are internal refactoring.

## Deferred to Round 2

- **CLI test coverage**: No existing test pattern for CLI goal commands.
- **`--status` filter client-side validation**: Server Zod validation already catches invalid values.
- **Help text deduplication in index.ts**: Minor, not user-impacting.

## Summary Table

| Area | Decision | Complexity |
|---|---|---|
| Shared error parsing | New `src/goals/utils.ts` | Very Low |
| Consistent ID display | Align list.ts to shortId pattern | Very Low |

## APL Statement Reference

See `tech-research/apl.json` for the investigation trail.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|---|---|---|
| diagnosis/diagnosis-statement.md (CLI) | Validated two polish items | Duplicate error parsing and inconsistent ID display; both minor code quality fixes |
| diagnosis/apl.json (CLI) | Investigation evidence | create.ts:68-79 and terminate.ts:31-43 have identical patterns; list.ts vs get.ts ID mismatch |
| product/product.md (CLI) | Scoped requirement and success criteria | Two internal refactors with no behavior change; tertiary priority |
| scout/reference-map.json (CLI) | File inventory | 9 files; create.ts and terminate.ts identified as DRY violation; list.ts and get.ts for ID inconsistency |
