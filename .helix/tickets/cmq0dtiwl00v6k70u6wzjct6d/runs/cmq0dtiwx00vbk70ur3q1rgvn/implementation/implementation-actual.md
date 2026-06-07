# Implementation Actual: CLI --json Flag (helix-cli)

## Summary of Changes

Added `--json` output flag to `hlx comments list` command for machine-parseable output including comment IDs. This enables the runner's comment polling loop to consume structured comment data.

## Files Changed

| File | Change | Shared/Review Hotspot |
|------|--------|----------------------|
| `src/comments/list.ts` | Added `--json` flag parsing (L18) and JSON output branch (L39-42). Default human-readable output unchanged. | CLI output format — consumed by runner polling loop |

## Steps Executed

| Plan Step | Status | Notes |
|-----------|--------|-------|
| 8. Add --json flag to CLI comments list | Complete | Flag parsed, JSON output with IDs |

## Verification Commands Run + Outcomes

| Command | Exit Code | Notes |
|---------|-----------|-------|
| `npx tsc --noEmit` | 0 | Zero type errors |
| `npm run build` | 0 | Build successful |
| `npm test` | 0 | 63 pass, 0 fail |

## Test/Build Results

63 tests, 22 suites, all pass. TypeScript clean. Build successful.

## Deviations from Plan

None.

## Known Limitations / Follow-ups

None.

## Spec Deviations

None.

## Verification Plan Results

| Check ID | Outcome | Evidence/Notes |
|----------|---------|---------------|
| CHK-09 | pass | `npx tsc --noEmit` and `npm run build` both exit 0 |
| CHK-10 | pass | `src/comments/list.ts` parses `--json` flag and outputs JSON.stringify(comments) including id field |

## APL Statement Reference

Added --json output flag to hlx comments list command. TypeScript clean, build successful, all 63 tests pass.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| implementation-plan/implementation-plan.md (helix-global-server) | Step 8 details | --json flag requirements |
| helix-cli/src/comments/list.ts (source) | Existing code patterns | --helix-only and --since flag patterns |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI pull readiness | --json flag is primary addition |
