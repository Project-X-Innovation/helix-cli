# Scout Summary: Goals Polish & Final (helix-cli)

## Problem

The CLI Goals namespace (`hlx goals create/list/get/terminate`) is fully implemented across 5 command files with documentation. This ticket requires verifying code quality and identifying any polish needs in the CLI layer.

## Analysis Summary

The CLI Goals code is **solid and production-ready** (quality ~7.5/10) with good error handling, proper flag validation, and clean output formatting. Polish areas are minor:

### Polish Areas

1. **Duplicate error parsing**: Error response parsing logic is duplicated between `create.ts` (lines 68-79) and `terminate.ts` (lines 31-43). Both parse JSON error bodies from backend responses with identical try/catch/fallback patterns. Could be extracted to a shared utility.

2. **Inconsistent ID display**: `list.ts` uses `id.slice(0, 8) + "..."` while `get.ts` prefers `shortId` field with fallback to abbreviated ID. Should use consistent approach.

3. **No status filter validation**: `list.ts` passes `--status` value directly to the API without validating against allowed GoalStatus values. Invalid status values will produce unhelpful API errors instead of descriptive CLI errors.

4. **No CLI tests**: No test files found for goal commands (though this may be consistent with other CLI command test patterns).

### Code Quality Observations

- Clean command routing pattern in index.ts with per-subcommand help text
- Proper required flag validation with helpful error messages
- Thorough create command: flag validation, repo name resolution, max-children range check
- Both human-readable and --json output modes supported
- Documentation is comprehensive in cli-content.ts with flags and worked examples
- VALID_MODES unchanged at 5 values (correctly no GOAL mode added)

## Relevant Files

| File | Lines | Role |
|------|-------|------|
| src/goals/index.ts | 76 | Command router with help text |
| src/goals/create.ts | 90 | Create goal with validation |
| src/goals/list.ts | 60 | List goals with filtering |
| src/goals/get.ts | 99 | Get goal detail |
| src/goals/terminate.ts | 55 | Terminate with verdict validation |
| src/docs/cli-content.ts | 133-172, 287-319 | Documentation and examples |
| src/index.ts | 124-128 | Command registration |
| src/tickets/create.ts | line 13 | VALID_MODES (unchanged) |
| package.json | scripts | build/typecheck/test commands |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-534) | Primary specification | Section 8 (CLI Support) defines expected commands, flags, and constraints. Section 8.4 confirms VALID_MODES unchanged. |
| src/goals/*.ts (full reads) | Code quality assessment | 5 files totaling ~380 lines. Solid implementation with minor duplicate code and inconsistency issues. |
| src/docs/cli-content.ts | Documentation verification | Comprehensive documentation with worked examples covering all 4 commands. |
| src/tickets/create.ts | VALID_MODES constraint | Confirmed 5 values unchanged at line 13 per research report requirement. |
