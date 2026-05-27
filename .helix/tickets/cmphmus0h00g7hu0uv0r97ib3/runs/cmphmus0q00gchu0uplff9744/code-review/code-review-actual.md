# Code Review: T7 -- CLI Goals Namespace

## Review Scope

Reviewed the complete T7 implementation: 5 new files in `src/goals/` and 2 modified files (`src/index.ts`, `src/docs/cli-content.ts`) in helix-cli. Cross-referenced against the ticket's Research Report (Section 8: CLI Support, Section 13: T7 deliverables), the product spec (10 scenarios, 7 success criteria), the implementation plan (8 steps, 10 verification checks), and the server's actual goal-controller.ts response shapes.

## Files Reviewed

| File | Status | Verdict |
|------|--------|---------|
| `src/goals/index.ts` | NEW | Clean -- mirrors `src/tickets/index.ts` pattern exactly. Exports `runGoals`, switch on 4 subcommands, `isHelpRequested` checks, goalId extraction for get/terminate. |
| `src/goals/create.ts` | NEW | Clean -- required flags via `requireFlag`, optional flags via `getFlag`/`hasFlag`, repo resolution via `resolveAllRepos`, POST body with conditional spread, error handling with JSON extraction. |
| `src/goals/list.ts` | NEW | Clean -- `--status` as server-side query param, `--limit` as client-side truncation (default 20), `--json` output, table formatting with padEnd alignment. |
| `src/goals/get.ts` | NEW | Clean -- detailed formatted output with null-safe handling for latestEvaluation, roadmap, childTickets. Exports `printGoalDetail` for reuse. Description truncated at 500 chars. |
| `src/goals/terminate.ts` | NEW | Clean -- `VALID_VERDICTS` const, `requireFlag` for --verdict, pre-validation before API call, POST with error handling. |
| `src/index.ts` | MODIFIED | Clean -- `runGoals` import at line 11, `case "goals"` at line 124 following exact tickets pattern, usage text includes goals line. |
| `src/docs/cli-content.ts` | MODIFIED | Clean -- Goals section after Tickets with command table, 4 flag tables, 5 worked examples, `"goals"` keyword added. |
| `src/tickets/create.ts` | UNCHANGED | Verified VALID_MODES at line 13 remains `["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]`. No references to VALID_MODES in src/goals/. |
| `src/lib/flags.ts` | UNCHANGED | Reference -- verified all flag utilities (getFlag, requireFlag, hasFlag, isHelpRequested) used correctly in goals files. |
| `src/lib/http.ts` | UNCHANGED | Reference -- verified hxFetch signature, basePath defaults to `/api/inspect`, all goals calls explicitly use `basePath: "/api"`. |
| `src/lib/resolve-repo.ts` | UNCHANGED | Reference -- verified `resolveAllRepos` usage in create.ts matches tickets/create.ts pattern. |

## Missed Requirements & Issues Found

### Requirements Gaps

None. All T7 deliverables from the ticket specification (Section 8, Section 13) are implemented:
- 4 commands (create, list, get, terminate) with all specified flags
- Command registration in main router
- CLI documentation with command tables, flag tables, and worked examples
- VALID_MODES constraint preserved
- --json support on list and get (product spec SC-7)

### Correctness / Behavior Issues

None. Verified API response shape alignment against the actual server goal-controller.ts:
- `POST /api/goals` returns `{ goal: ... }` -- matches CLI's `CreateGoalResponse`
- `GET /api/goals` returns `{ items: [...] }` with Prisma `_count.childTickets` -- matches CLI's `GoalsListResponse` and `GoalListItem` types
- `GET /api/goals/:id` returns `{ goal: ... }` with `latestEvaluation` -- matches CLI's `GoalResponse`
- `POST /api/goals/:id/terminate` returns `{ goal: ... }` -- matches CLI's `TerminateGoalResponse`

### Regression Risks

None. The implementation is purely additive:
- No existing files modified besides src/index.ts (new case added) and src/docs/cli-content.ts (new section added)
- No changes to ticket commands, VALID_MODES, or shared utilities
- All new code in isolated src/goals/ directory

### Code Quality / Robustness

No issues warranting changes. Minor observation: `--limit` on `list` does not validate non-numeric input (e.g., `--limit abc` results in NaN, which causes the limit check `NaN > 0` to be false, so all items are shown). This is acceptable behavior and consistent with the overall CLI's approach to flag parsing.

### Verification / Test Gaps

No test framework exists in helix-cli (package.json has no test script). This is a pre-existing limitation, not introduced by this change. Runtime API testing requires a valid API key and running server, which is documented as a known limitation.

## Changes Made by Code Review

None. The implementation is correct, complete, and follows established patterns. No code fixes were needed.

## Remaining Risks / Deferred Items

1. **Server API availability**: CLI commands cannot be tested against a live server in this environment (API key is expired per ticket Section 14). The code paths are structurally verified through typecheck, build, and help output.
2. **No unit tests**: helix-cli has no test framework. This is a pre-existing gap.
3. **Client-side limit**: `--limit` on list is client-side truncation since the server lacks pagination for goals. This is by design per the tech-research decision TCK-04.

## Verification Impact Notes

All 10 verification checks from the implementation plan remain valid. No behavior or assumptions were changed by code review.

| Check ID | Status | Notes |
|----------|--------|-------|
| CHK-01 | Still valid | TypeScript typecheck verified passing |
| CHK-02 | Still valid | Build verified producing dist/goals/ with 10 files |
| CHK-03 | Still valid | VALID_MODES confirmed unchanged at line 13 |
| CHK-04 | Still valid | `goals --help` verified printing all 4 subcommands |
| CHK-05 | Still valid | `goals create --help` verified printing all flags |
| CHK-06 | Still valid | All 18 imports verified using .js extensions |
| CHK-07 | Still valid | Router switch verified with all 4 cases |
| CHK-08 | Still valid | Main router verified with goals case and import |
| CHK-09 | Still valid | Documentation verified with Goals section and keyword |
| CHK-10 | Still valid | All 4 hxFetch calls verified using basePath: '/api' |

## APL Statement Reference

Code review of T7 CLI Goals namespace in helix-cli found no issues requiring code changes. All 7 files (5 new, 2 modified) reviewed against ticket requirements, product spec, implementation plan, and actual server API response shapes. API contract alignment verified against server goal-controller.ts. Quality gates pass: typecheck (0 errors), build (success). All 10 verification checks remain valid.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Section 8, 13) | Primary T7 specification | 4 commands, exact flag specs, VALID_MODES constraint, docs update |
| implementation/implementation-actual.md (helix-cli) | Scope map for review | 5 new files, 2 modified files, 8 steps executed, 10 checks passed |
| implementation/apl.json (helix-cli) | Implementation Q&A evidence | Confirmed all files created, quality gates passed, patterns followed |
| implementation-plan/implementation-plan.md (helix-cli) | Step-by-step plan reference | 8 steps, verification plan with 10 checks, success metrics |
| product/product.md (helix-cli) | User scenarios and success criteria | 10 scenarios (SCN-01 to SCN-10), 7 success criteria verified |
| repo-guidance.json | Repo intent classification | helix-cli=target, server=context, client=context |
| Server goal-controller.ts (helix-global-server) | API response shape verification | Confirmed response wrapping: { goal }, { items }, _count.childTickets |
| src/tickets/index.ts, create.ts, list.ts (helix-cli) | Reference patterns | Verified goals/ files match established CLI patterns |
| src/lib/flags.ts, http.ts, resolve-repo.ts (helix-cli) | Shared utility verification | Confirmed correct usage of all shared utilities |
