# Implementation Actual: T7 -- CLI Goals Namespace

## Summary of Changes

Added a complete `hlx goals` CLI command namespace with 4 subcommands (create, list, get, terminate) to helix-cli. Created 5 new files in `src/goals/` and modified 2 existing files (`src/index.ts`, `src/docs/cli-content.ts`). All commands follow the established `src/tickets/` patterns exactly. Zero new dependencies added.

## Files Changed

| File | Why Changed | Review Hotspot |
|------|-------------|----------------|
| `src/goals/index.ts` (NEW) | Namespace router -- exports `runGoals`, dispatches 4 subcommands via switch | Public interface: `runGoals(config, args)` consumed by `src/index.ts` |
| `src/goals/create.ts` (NEW) | `hlx goals create` -- POST /api/goals with required/optional flags | Uses `resolveAllRepos` from shared `src/lib/resolve-repo.js` for --repos |
| `src/goals/list.ts` (NEW) | `hlx goals list` -- GET /api/goals with --status, --limit, --json | Client-side limit via `Array.slice(0, limit)` since server lacks pagination |
| `src/goals/get.ts` (NEW) | `hlx goals get` -- GET /api/goals/:id with detailed output and --json | Exports `printGoalDetail` for potential reuse; handles null roadmap/evaluation |
| `src/goals/terminate.ts` (NEW) | `hlx goals terminate` -- POST /api/goals/:id/terminate with --verdict | Validates verdict against `["complete", "failed"]` before API call |
| `src/index.ts` (MODIFIED) | Register `goals` case in main CLI switch; add import; add usage line | Cross-module: new `runGoals` import at line 11, case block at line 124, usage text |
| `src/docs/cli-content.ts` (MODIFIED) | Add Goals documentation section with command tables, flag tables, worked examples, and keyword | Documentation: Goals section at line 133, 5 worked examples, "goals" keyword at line 414 |

## Steps Executed

### Step 1: Create goals namespace directory and router
- Created `src/goals/` directory
- Created `src/goals/index.ts` with `runGoals` export, switch on subcommand, help text, goalId extraction for get/terminate
- Pattern: mirrors `src/tickets/index.ts` exactly

### Step 2: Implement `hlx goals create` command
- Created `src/goals/create.ts` with `cmdGoalsCreate` export
- Required flags: --title, --description (via `requireFlag`)
- Optional flags: --repos (resolved via `resolveAllRepos`), --max-children (parsed to int), --require-approval (boolean), --sprint
- POST /api/goals with `basePath: "/api"`
- Error handling follows `src/tickets/create.ts` pattern

### Step 3: Implement `hlx goals list` command
- Created `src/goals/list.ts` with `cmdGoalsList` export
- --status passed as query param to server
- --limit is client-side truncation (default 20)
- --json outputs `JSON.stringify(items, null, 2)`
- Table output: id-abbr, status (padEnd 18), child count, updated, title

### Step 4: Implement `hlx goals get` command
- Created `src/goals/get.ts` with `cmdGoalsGet` and `printGoalDetail` exports
- Detailed output: title, ID, status, max children, approval mode, children count, latest evaluation, child tickets, roadmap, description
- Handles null latestEvaluation, null roadmap, null childTickets gracefully (shows "none")
- --json outputs raw server response
- Description truncated at 500 chars

### Step 5: Implement `hlx goals terminate` command
- Created `src/goals/terminate.ts` with `cmdGoalsTerminate` export
- --verdict required via `requireFlag`, validated against `["complete", "failed"]`
- POST /api/goals/:id/terminate with `basePath: "/api"`
- Error handling follows create.ts pattern

### Step 6: Register goals namespace in main CLI router
- Added `import { runGoals } from "./goals/index.js"` at line 11
- Added `case "goals"` block at line 124 following tickets pattern
- Added `hlx goals create|list|get|terminate  Manage Goals` to usage text

### Step 7: Update CLI documentation
- Added `### Goals` section to Common Commands in `cli-content.ts` (after Tickets, before Inspect)
- 4-command table, 4 flag tables, 5 worked examples
- Added `"goals"` to keywords array

### Step 8: Run quality gates
- `npm run typecheck` -- exit 0, zero errors
- `npm run build` -- exit 0, `dist/goals/` contains 10 files
- VALID_MODES verified unchanged at line 13 of src/tickets/create.ts
- All imports use `.js` extensions
- No `require()` calls in goals files

## Verification Commands Run + Outcomes

| Command | Outcome |
|---------|---------|
| `npm run typecheck` | ✅ Exit 0, zero errors |
| `npm run build` | ✅ Exit 0, 10 files in dist/goals/ |
| `node dist/index.js goals --help` | ✅ Prints all 4 subcommands |
| `node dist/index.js goals create --help` | ✅ Prints create flags |
| `node dist/index.js goals list --help` | ✅ Prints list flags |
| `node dist/index.js goals get --help` | ✅ Prints get usage |
| `node dist/index.js goals terminate --help` | ✅ Prints terminate usage |
| `node dist/index.js --help` | ✅ Includes "hlx goals" line |
| `ls src/goals/` | ✅ 5 files: index.ts, create.ts, list.ts, get.ts, terminate.ts |
| `ls dist/goals/` | ✅ 10 files: .js + .d.ts for each |
| `grep VALID_MODES src/goals/` | ✅ No matches (unchanged) |
| `grep '^import' src/goals/*.ts` | ✅ All 18 imports use .js extensions |
| `grep 'require(' src/goals/` | ✅ No matches |
| `grep hxFetch src/goals/` | ✅ All 4 calls use basePath: '/api' |

## Test/Build Results

- **TypeScript typecheck**: PASS -- `tsc --noEmit` exits 0 with zero errors
- **Build**: PASS -- `tsc` exits 0, produces `dist/goals/` with all 10 expected files
- **CLI runtime**: PASS -- all 5 help commands (goals, create, list, get, terminate) produce correct output
- **No runtime tests exist** in helix-cli (package.json has no test script)

## Deviations from Plan

None. All 8 implementation steps were executed exactly as planned.

## Known Limitations / Follow-ups

- CLI commands cannot be tested against a live server without a valid API key. The dev setup .env contains a key that may be expired.
- `--limit` on list is client-side truncation; server does not support pagination for goals.
- No unit tests were added (helix-cli has no test framework configured).

## Spec Deviations

None. All product scenarios (SCN-01 through SCN-10) and tech-research decisions (TCK-01 through TCK-07) are implemented as specified. The code compiles and builds successfully. Runtime verification of API calls (SCN-01 through SCN-08) requires a valid API key and running server, but the CLI's code paths are structurally verified through typecheck, build, and help output.

## Verification Plan Results

| Check ID | Outcome | Evidence/Notes |
|----------|---------|----------------|
| CHK-01 | **pass** | `npm run typecheck` exits 0 with zero errors. All 5 new files and 2 modified files compile cleanly in strict mode. |
| CHK-02 | **pass** | `npm run build` exits 0. `dist/goals/` contains 10 files: create.d.ts, create.js, get.d.ts, get.js, index.d.ts, index.js, list.d.ts, list.js, terminate.d.ts, terminate.js |
| CHK-03 | **pass** | Line 13 of `src/tickets/create.ts` is exactly `const VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"] as const;`. grep for VALID_MODES in src/goals/ returns no matches. |
| CHK-04 | **pass** | `node dist/index.js goals --help` prints usage text listing all 4 subcommands (create, list, get, terminate) with descriptions and exit code 0. |
| CHK-05 | **pass** | `node dist/index.js goals create --help` prints usage showing all flags: --title, --description, --repos, --max-children, --require-approval, --sprint. |
| CHK-06 | **pass** | All 18 import statements in src/goals/*.ts use .js extensions. No require() calls found. No bare specifier imports to local files. |
| CHK-07 | **pass** | src/goals/index.ts exports `runGoals`, contains switch with cases for create, list, get, terminate, and default. Each case checks `isHelpRequested(rest)` before dispatching. |
| CHK-08 | **pass** | src/index.ts imports `runGoals` from `./goals/index.js` (line 11), has `case "goals"` at line 124 following tickets pattern, usage text includes `hlx goals create|list|get|terminate  Manage Goals`. |
| CHK-09 | **pass** | src/docs/cli-content.ts contains `### Goals` section (line 133) with command table, flag tables for create/list/get/terminate, and 5 worked examples. Keywords array includes `"goals"` at line 414. |
| CHK-10 | **pass** | All 4 hxFetch call sites in src/goals/ use `basePath: "/api"`. Endpoints: `/goals` (create POST, list GET), `/goals/${goalId}` (get GET), `/goals/${goalId}/terminate` (terminate POST). |

All 10 required checks pass.

## APL Statement Reference

T7 CLI Goals namespace fully implemented in helix-cli. 5 new files created in src/goals/ (index.ts, create.ts, list.ts, get.ts, terminate.ts), 2 files modified (src/index.ts, src/docs/cli-content.ts). All quality gates pass: typecheck (0 errors), build (success with dist/goals/), VALID_MODES unchanged, ES module conventions followed, all API calls use basePath '/api'. CLI help commands verified working.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report Section 8) | Primary specification for T7 CLI commands | 4 commands with exact flag specs; VALID_MODES unchanged; docs update required |
| helix-cli implementation-plan/implementation-plan.md | Step-by-step implementation guide | 8 steps with exact patterns, file paths, flag specs, verification checks |
| helix-cli implementation-plan/apl.json | Technical decisions and Q&A | Confirmed all API contracts, flag patterns, client-side limit, verdict validation |
| helix-cli diagnosis/diagnosis-statement.md | Root cause and scope | Greenfield additive feature; helix-cli only; 9 success criteria |
| helix-cli product/product.md | User scenarios and success criteria | 10 scenarios (SCN-01 through SCN-10); 7 success criteria; --json on list+get |
| repo-guidance.json | Repo intent classification | helix-cli=target, server=context, client=context |
| src/tickets/index.ts | Namespace router reference pattern | Switch on subcommand, isHelpRequested checks, help text format |
| src/tickets/create.ts | Create command reference pattern | requireFlag, getFlag, hasFlag, resolveAllRepos, POST body, error handling |
| src/tickets/list.ts | List command reference pattern | Query params, hasFlag --json, table output format, client-side filtering |
| src/tickets/get.ts | Get command reference pattern | printTicketDetail, formatted output, --json via hasFlag, type definitions |
| src/lib/flags.ts | Flag parsing API | getFlag, requireFlag, hasFlag, isHelpRequested -- all 5 utilities verified |
| src/lib/http.ts | HTTP client contract | hxFetch signature, basePath defaults to /api/inspect, need explicit /api |
| src/lib/resolve-repo.ts | Repo resolution | resolveAllRepos resolves names to IDs; used for optional --repos flag |
| src/docs/cli-content.ts | Documentation structure | Exported object with content markdown, command tables, keywords array |
| src/index.ts | Command registration pattern | Switch-based routing, configOrHelp, import pattern |
