# Code Review — BLD-556: hlx library show --full

## Review Scope

Reviewed all four files changed by the implementation against the ticket acceptance criteria, product spec (product/product.md), implementation plan, tech research decisions, and diagnosis root cause. Expanded review to surrounding code: the `hasFlag` utility (`src/lib/flags.ts`), the library item ref extraction (`src/lib/resolve-library-item.ts`), the skill show command (`src/skill/show.ts`), and the skill overview (`skill-content/SKILL.md`).

## Files Reviewed

| File | Review Focus | Verdict |
|------|-------------|---------|
| `src/library/show.ts` | Core `--full` flag logic, null guard, TOC/body ordering, `hasFlag` import, `_args` rename | Correct |
| `src/library/index.ts` | Help text update, `[--full]` in usage, flag description | Correct |
| `src/index.ts` | Top-level usage text, `[--full]` mention, alignment | Correct |
| `skill-content/references/commands.md` | `[--full]` in code block, flag table, description preserved | Correct |
| `src/lib/flags.ts` | `hasFlag` implementation: `args.includes(flag)` | Verified, used correctly |
| `src/lib/resolve-library-item.ts` | `extractLibraryItemRef` skips `--full` via `!a.startsWith("-")` filter | No contamination risk |
| `src/skill/show.ts` | `hlx skill show` prints only SKILL.md | Verified |
| `skill-content/SKILL.md` | High-level overview; defers flag details to commands.md via link | Consistent with all other commands |

## Missed Requirements & Issues Found

### Requirements gaps

None. All four acceptance criteria are satisfied:

1. **`--full` prints body**: `hasFlag(args, '--full')` gates `console.log(item.content)` after the TOC loop (show.ts:67-70). The content printed is the same `item.content` field returned by the API.
2. **Default output unchanged**: The new block is fully conditional on `--full`. Without the flag, execution falls through with no change to output.
3. **Help text updated**: `hlx library show --help` outputs `Usage: hlx library show <ref> [--full]` and a flags section with `--full` described. Verified by running `node dist/index.js library show --help`.
4. **Skill docs updated**: `skill-content/references/commands.md` lines 300-311 include `[--full]` in the code block and a flag table. SKILL.md defers flag details to commands.md (consistent with all other commands).

### Correctness/behavior issues

None found. Specific checks performed:

- **Flag contamination**: `extractLibraryItemRef(rest)` uses `args.find(a => !a.startsWith("-"))` to find the positional ref, correctly skipping `--full`.
- **Null content**: The guard at show.ts:28-30 (`if (!item.content)`) returns early before both the TOC loop and the `--full` block. Empty string `""` is also caught by this guard.
- **Separator format**: `console.log('\n---\n')` produces a properly padded markdown horizontal rule between the TOC and body sections.
- **Output ordering**: The `--full` conditional is placed after the for-loop (line 67), ensuring TOC always prints first.

### Regression risks

None. The change is purely additive:
- No modifications to the existing TOC rendering loop (lines 44-65)
- No changes to API call logic
- No changes to the `hasFlag` utility
- No changes to `resolve-library-item.ts`

### Code quality/robustness

No issues. The implementation follows the established `hasFlag` pattern used by 7+ other commands. The change is minimal (~4 lines of logic).

### Verification/test gaps

Pre-existing: No test files exist under `src/library/`. The `hasFlag` utility itself is tested in `src/lib/flags.test.ts`. Adding library command tests is deferred per tech research TD-6 and product spec.

## Changes Made by Code Review

None. No issues requiring code fixes were found.

## Remaining Risks / Deferred Items

1. **CHK-05 and CHK-06 blocked**: Live CLI runtime verification is blocked by staging API 401 Unauthorized. The code is correct per static analysis and compilation, but full end-to-end validation against a live API could not be performed by either implementation or code review.
2. **Stretch goals deferred**: `--body-only` and `--out <path>` are not implemented (per product spec, out of scope for MVP).
3. **No library test coverage**: Pre-existing gap. No test infrastructure exists for library commands.

## Verification Impact Notes

No code changes were made by code review. All verification checks from the implementation plan remain valid:

| Check ID | Status | Notes |
|----------|--------|-------|
| CHK-01 | Valid | TypeScript compilation verified by code review: `tsc` exits 0 |
| CHK-02 | Valid | Tests verified by code review: 63 pass, 0 fail |
| CHK-03 | Valid | Help output verified by code review: `node dist/index.js library show --help` includes `[--full]` |
| CHK-04 | Valid | commands.md verified by code review: code block and flag table present |
| CHK-05 | Valid (blocked) | Blocked by staging API 401 — environment issue, not code issue |
| CHK-06 | Valid (blocked) | Blocked by staging API 401 — environment issue, not code issue |

## APL Statement Reference

Code review complete. All four changed files reviewed against ticket requirements, product spec, and implementation plan. No issues found. The implementation correctly adds a `--full` flag to `cmdShow` using the established `hasFlag()` pattern, printing the full markdown body after the TOC when the flag is set. Default behavior is unchanged. Help text and skill documentation are updated. TypeScript compiles cleanly (0 errors), all 63 tests pass. No code changes made by review.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary acceptance criteria | Four criteria: --full prints body, default unchanged, help updated, skill docs updated |
| product/product.md | Refined requirements with scenarios | SCN-01 through SCN-05; stretch goals out of scope; success criteria match ticket |
| implementation-plan/implementation-plan.md | Step-by-step plan with verification checks | 5 steps, 6 checks, 4 files; CHK-05/CHK-06 depend on staging API |
| implementation/implementation-actual.md | Implementation scope map | 4 files changed; CHK-05/CHK-06 blocked by staging 401; no deviations from plan |
| implementation/apl.json | Implementation answers with evidence | All files modified per plan; flag correctly gates body; 4/6 checks pass |
| diagnosis/diagnosis-statement.md | Root cause and evidence | Deliberate design omission; content already in memory; _args param ready |
| tech-research/tech-research.md | Architecture decisions | Option A (hasFlag); TOC-then-body; separator `\n---\n`; stretch goals deferred |
| repo-guidance.json | Repo intent | helix-cli is sole target repo |
| src/library/show.ts | Primary implementation file | Verified: import, rename, conditional block, null guard, loop unchanged |
| src/library/index.ts | Help text file | Verified: multi-line help with [--full] and description |
| src/index.ts | Usage text file | Verified: usage line includes [--full] |
| skill-content/references/commands.md | Skill documentation | Verified: code block and flag table with --full |
| src/lib/flags.ts | Flag utility | Verified: hasFlag is args.includes(flag) |
| src/lib/resolve-library-item.ts | Ref extraction | Verified: --full flag skipped by !a.startsWith("-") filter |
| src/skill/show.ts | Skill show command | Verified: only prints SKILL.md |
| skill-content/SKILL.md | Skill overview | Verified: defers flag details to commands.md |
