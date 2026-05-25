# Diagnosis: Goals Polish & Final (helix-cli)

## Problem Summary

The CLI Goals namespace is functionally complete and production-ready (~380 lines, 5 files, 4 commands). Two minor code quality improvements are recommended for consistency and DRY.

## Root Cause Analysis

The CLI Goals implementation is solid. Two polish items:

1. **Duplicate error parsing**: `create.ts:68-79` and `terminate.ts:31-43` contain identical error response parsing logic (try JSON.parse on error body, catch and fallback). Should be extracted to a shared utility function.

2. **Inconsistent ID display**: `list.ts` uses `id.slice(0, 8) + "..."` for goal IDs in output, while `get.ts` prefers the `shortId` field with fallback to abbreviated ID. The codebase convention (seen in client's ticket display) favors `shortId` when available.

### Not a problem:

- **No --status filter validation**: `list.ts` passes the --status flag directly to the API. This is acceptable since the server validates via Zod and returns a clear error. Client-side pre-validation is optional polish.
- **No CLI tests**: Scout confirmed no test files for goal commands. This appears consistent with other CLI command test patterns in the repo.

## Evidence Summary

| Finding | Evidence Source | Confidence |
|---------|---------------|------------|
| Duplicate error parsing | create.ts:68-79 and terminate.ts:31-43 (scout full read) | High |
| Inconsistent ID display | list.ts vs get.ts comparison (scout analysis) | High |
| VALID_MODES unchanged | src/tickets/create.ts:13 confirmed 5 values (scout verified) | High |
| Documentation complete | cli-content.ts:133-172 and 287-319 (scout read) | High |

## Success Criteria

1. Error parsing logic extracted to shared utility and reused in create.ts and terminate.ts
2. Consistent ID display format across list.ts and get.ts
3. No changes to command behavior or output format

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (CLI) | Pre-analyzed file inventory | Identified 9 files, confirmed DRY violation and ID inconsistency |
| scout/scout-summary.md (CLI) | Prioritized analysis | CLI code rated ~7.5/10 quality; 2 minor improvements |
| ticket.md (Research Report RSH-534 Section 8) | CLI specification | Commands match spec; VALID_MODES correctly unchanged |
