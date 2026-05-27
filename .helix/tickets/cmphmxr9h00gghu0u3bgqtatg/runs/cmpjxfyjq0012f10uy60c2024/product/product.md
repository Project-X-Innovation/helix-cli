# Product: Goals Polish & Final (helix-cli)

## Problem Statement

The CLI Goals namespace (`hlx goals create/list/get/terminate`) is functionally complete (~380 lines, 5 files, 4 commands) and production-ready. Two minor code quality issues reduce maintainability: error response parsing logic is duplicated between `create.ts` and `terminate.ts`, and goal ID display format is inconsistent between `list.ts` (raw slice) and `get.ts` (shortId field).

## Product Vision

Clean up the two DRY/consistency issues in the CLI Goals commands so the code quality matches the standard set by the rest of the CLI codebase.

## Users

- **CLI operators**: Use `hlx goals` commands to create, list, inspect, and terminate goals from the command line.

## Use Cases

1. **Consistent error messages**: When a goal creation or termination fails, the error message format is identical regardless of which command was used.
2. **Consistent ID display**: Goal IDs in list output and detail output use the same formatting approach for readability.

## Core Workflow

No user-facing workflow changes. These are internal code quality improvements that maintain identical CLI behavior.

## Essential Features (MVP -- this ticket)

1. **Extract shared error parsing utility**: Move the duplicated error response parsing logic from `create.ts` (lines 68-79) and `terminate.ts` (lines 31-43) into a shared utility function.
2. **Consistent ID display**: Align `list.ts` to use the same ID formatting approach as `get.ts` (prefer `shortId` field when available).

## Features Explicitly Out of Scope (MVP)

- **CLI test coverage**: No existing test pattern for CLI goal commands; adding tests is post-launch.
- **`--status` filter client-side validation**: Server Zod validation already catches invalid values with clear errors.
- **Description truncation tuning**: The 500-char limit in `get.ts` is adequate.
- **Help text deduplication in index.ts**: Minor, not user-impacting.

## Success Criteria

1. Error parsing logic exists in one shared location and is called from both `create.ts` and `terminate.ts`.
2. Goal IDs display consistently across `list` and `get` commands.
3. No changes to command behavior, flags, or output format.

## User Scenarios

[SCN-01] Create a goal that fails with a server error
- Precondition: User runs `hlx goals create` with valid flags but the server returns an error
- Action: CLI attempts to create the goal and receives an error response
- Expected Outcome: Error message displays the parsed server error in the same format as a termination error would

[SCN-02] List goals and view a specific goal
- Precondition: Organization has goals
- Action: User runs `hlx goals list` then `hlx goals get <id>` for one of the listed goals
- Expected Outcome: The goal ID format in the list output is consistent with the ID format in the detail output

[SCN-03] Terminate a goal that fails with a server error
- Precondition: User runs `hlx goals terminate` with a valid goal ID and verdict but the server returns an error
- Action: CLI attempts to terminate and receives an error response
- Expected Outcome: Error message uses the same parsing and display format as a failed create command

## Key Design Principles

- **DRY**: Shared logic lives in one place.
- **Consistency**: Same data displays the same way across commands.
- **No behavior changes**: These are refactoring improvements only.

## Scope & Constraints

- **Two files changed, one file created**: `create.ts` and `terminate.ts` updated to call shared utility; new utility file created.
- **Tertiary priority**: CLI changes are the lowest priority of the three repos.
- **Cannot verify builds in sandbox**: node_modules not installed; typecheck must be verified via CI.

## Future Considerations

- CLI test coverage for goal commands
- Client-side `--status` filter validation with helpful error messages
- Pagination support for `hlx goals list`

## Open Questions / Risks

| # | Question/Risk | Context |
|---|---------------|---------|
| 1 | Is there an existing shared utility location for error parsing in the CLI? | Need to check if other CLI commands have similar patterns that could share the same utility |
| 2 | Does `shortId` exist on all Goal API responses (list vs detail)? | The list response (GoalListItem type) may not include shortId, which would affect the consistency fix |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-534, Section 8) | CLI specification | Commands match spec; VALID_MODES correctly unchanged at 5 values |
| scout/scout-summary.md (CLI) | CLI code quality assessment | Rated ~7.5/10; identified duplicate error parsing and inconsistent ID display |
| scout/reference-map.json (CLI) | File inventory and facts | 9 files mapped; confirmed DRY violation and ID inconsistency |
| diagnosis/diagnosis-statement.md (CLI) | Validated two polish items | Duplicate error parsing and inconsistent ID display; --status validation is not needed (server validates) |
| repo-guidance.json | Repo intent classification | CLI is a target repo with two minor improvements; tertiary priority |
