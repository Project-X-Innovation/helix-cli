# Implementation Actual — BLD-556: hlx library show --full

## Summary of Changes

Added a `--full` flag to `hlx library show` that prints the full markdown body of a library item after the existing TOC output. The content was already fetched by the handler (`item.content`) but only headings were printed. The change gates a `console.log(item.content)` call behind `hasFlag(args, '--full')`, following the established flag pattern used by 7+ other commands. Four files were changed; no new API calls, dependencies, or architectural changes were needed.

## Files Changed

| File | Why Changed | Review Hotspot |
|------|-------------|----------------|
| `src/library/show.ts` | Added `hasFlag` import, renamed `_args` to `args`, added conditional `--full` body printing after the TOC loop | Core logic change — the new `if (hasFlag(args, '--full'))` block after line 65 is the primary feature |
| `src/library/index.ts` | Updated `hlx library show --help` output to include `[--full]` in usage and a flag description | Help text only |
| `src/index.ts` | Updated top-level `hlx --help` usage line for library show to include `[--full]` | Usage text only |
| `skill-content/references/commands.md` | Updated `### hlx library show` section with `[--full]` in code block and a flag table | Documentation only |

## Steps Executed

### Step 1: Add --full flag logic to show handler
- Added `import { hasFlag } from "../lib/flags.js";` at line 2 of `src/library/show.ts`
- Renamed `_args` to `args` in the `cmdShow` function signature (line 24)
- Added conditional block after the for-loop (lines 67-70):
  ```typescript
  if (hasFlag(args, '--full')) {
    console.log('\n---\n');
    console.log(item.content);
  }
  ```
- The existing null guard at lines 28-30 returns early before both the TOC and the new block — no additional null handling needed.

### Step 2: Update show help text
- Modified `src/library/index.ts` lines 39-44: changed single-line help to multi-line template literal with:
  - Usage line: `hlx library show <ref> [--full]`
  - Description of the command
  - Flags section with `--full` described

### Step 3: Update top-level usage text
- Modified `src/index.ts` line 55: added `[--full]` to the library show usage line
- Alignment maintained with surrounding lines

### Step 4: Update skill documentation
- Modified `skill-content/references/commands.md` lines 300-312:
  - Updated code block to `hlx library show <ref> [--full]`
  - Added flag table with `--full` described
  - Preserved existing description and reference info

### Step 5: Build and verify
- `npm run build` (tsc) completed with zero errors
- `npm test` completed: 63 tests pass, 0 failures

## Verification Commands Run + Outcomes

| Command | Outcome |
|---------|---------|
| `npm run build` | tsc exits code 0, no errors |
| `npm test` | 63 pass, 0 fail, 0 skip |
| `node dist/index.js library show --help` | Output includes `[--full]` and flag description |
| `node dist/index.js --help` | Usage line for library show includes `[--full]` |
| `HELIX_API_KEY=... HELIX_URL=... node dist/index.js library list` | HTTP 401 Unauthorized — staging API rejects credentials |

## Test/Build Results

- **Build**: `tsc` exits with code 0 — TypeScript compiles cleanly with zero errors
- **Tests**: 63 tests pass across 22 suites — all existing tests (flags, resolve-ticket, skill, update) pass with zero failures
- **No new tests added**: No existing test files for library commands; adding test infrastructure is out of scope per tech-research TD-6

## Deviations from Plan

None. All five implementation steps were executed exactly as specified in the plan.

## Known Limitations / Follow-ups

1. **CHK-05 and CHK-06 blocked**: Live CLI execution against the staging API returns HTTP 401 Unauthorized. The provided `HELIX_API_KEY` is rejected. This prevents runtime verification of default-output-unchanged (CHK-05) and full-body-output (CHK-06). The code changes are correct per static analysis and compilation.
2. **Stretch goals deferred**: `--body-only` and `--out <path>` are not implemented per product spec and plan.
3. **No library test coverage**: No test files exist under `src/library/` — this is a pre-existing gap, not introduced by this change.

## Spec Deviations

- **SCN-04** (Full body matches API content) — Could not verify at runtime due to staging API 401. The implementation directly prints `item.content` which is the same field returned by the API, so content match is guaranteed by design.
- **SCN-05** (Handle item with null content gracefully) — Could not verify at runtime due to staging API 401. The existing null guard at lines 28-30 returns early with "No content available." before the `--full` block is reached, so null content is handled safely by design.

All other scenarios (SCN-01 through SCN-03) are verified through static checks: the code structure ensures TOC prints first, the `--full` block adds body after it, and help text documents the flag.

## Verification Plan Results

| Check ID | Outcome | Evidence |
|----------|---------|----------|
| CHK-01 | **pass** | `npm run build` — tsc exits with code 0, zero type errors |
| CHK-02 | **pass** | `npm test` — 63 tests pass, 0 failures across 22 suites |
| CHK-03 | **pass** | `node dist/index.js library show --help` output includes `[--full]` in usage line and "Include the full markdown body after the TOC" in flags section |
| CHK-04 | **pass** | `skill-content/references/commands.md` lines 303 and 308-310 show updated code block with `[--full]` and flag table with `--full` described |
| CHK-05 | **blocked** | Staging API returns HTTP 401 Unauthorized when running `node dist/index.js library list` with provided HELIX_API_KEY/HELIX_URL. Cannot verify default output is unchanged at runtime. Code inspection confirms the new block is conditional on `--full` and does not affect default path. |
| CHK-06 | **blocked** | Same 401 blocker as CHK-05. Cannot run `node dist/index.js library show <ref> --full` against live API. Code inspection confirms the block prints separator + `item.content` when `--full` is passed. |

Self-verification is partially blocked: 4 of 6 checks pass, 2 checks blocked by staging API authentication failure (environment issue, not code issue).

## APL Statement Reference

Implementation complete. All four files modified per plan: show.ts gains --full flag logic using the established hasFlag() pattern, library/index.ts and src/index.ts gain updated help/usage text, commands.md gains flag documentation. TypeScript compiles cleanly, all 63 existing tests pass. Live CLI verification (CHK-05, CHK-06) blocked by staging API 401 Unauthorized — environment issue, not code issue. No new dependencies, no new API calls, no existing behavior altered.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem statement and acceptance criteria | Four acceptance criteria: --full prints body, default unchanged, help updated, skill docs updated |
| implementation-plan/implementation-plan.md | Step-by-step implementation instructions and verification plan | 5 implementation steps, 6 verification checks, 4 files to modify |
| implementation-plan/apl.json | Plan answers and evidence | 5 atomic steps; CHK-05/CHK-06 require live API; staging API availability unknown |
| diagnosis/diagnosis-statement.md | Root cause and evidence map | Deliberate design omission at line 62; _args param ready; no new API calls needed |
| product/product.md | Product spec with scenarios | SCN-01 through SCN-05 defined; stretch goals out of scope |
| tech-research/tech-research.md | Architecture decisions and patterns | Option A (hasFlag pattern) chosen; TOC-then-body output; separator `\n---\n` |
| scout/reference-map.json | File inventory and key facts | Content already fetched at show.ts:24; _args unused; hasFlag pattern at 7+ sites |
| repo-guidance.json | Repo intent classification | helix-cli is sole target repo; no cross-repo changes |
| src/library/show.ts | Direct inspection before edit | Confirmed _args param, null guard, TOC-only loop, content in memory |
| src/library/index.ts | Direct inspection before edit | Help text at line 39; rest args passed to cmdShow |
| src/index.ts | Direct inspection before edit | Usage text at line 55 for library show |
| src/lib/flags.ts | Direct inspection | hasFlag is `args.includes(flag)` — established pattern |
| skill-content/references/commands.md | Direct inspection before edit | Lines 300-308 documented show without flags; nearby sections show flag table pattern |
