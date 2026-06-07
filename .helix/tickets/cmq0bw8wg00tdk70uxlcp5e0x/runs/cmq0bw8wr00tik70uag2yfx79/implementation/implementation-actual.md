# Implementation Actual — helix-cli: Playbook Check CLI Commands

## Summary of Changes

Implemented the CLI playbook command group with two subcommands: `hlx playbook check <ruleId>` (trigger + poll to completion) and `hlx playbook checks <ruleId>` (list check history). Created three new files in `src/playbook/` following the goals/ command group pattern, and registered the `playbook` case in the main dispatcher with updated usage text.

## Files Changed

| File | Why Changed | Shared/Review Hotspot |
|------|-------------|----------------------|
| `src/playbook/index.ts` (NEW) | Playbook command group router — dispatches check and checks subcommands | New file — follows goals/index.ts pattern |
| `src/playbook/check.ts` (NEW) | check trigger + poll command — POST trigger, GET poll loop (5s/10min), result display | First polling pattern in CLI — new behavior |
| `src/playbook/checks.ts` (NEW) | checks history list command — GET check history, formatted table output | New file |
| `src/index.ts` | Added playbook case to command dispatcher switch + import + usage text | CLI entry point — new command registered |

## Steps Executed

### Step 1: Create Playbook Command Group Router
- Created `src/playbook/index.ts` with `runPlaybook(config, args)` function.
- Dispatches `check` and `checks` subcommands via switch statement.
- Shows help text for --help or no subcommand.
- Uses `parseApiError` from goals/utils.ts for error handling.

### Step 2: Create Check Trigger + Poll Command
- Created `src/playbook/check.ts` with `cmdPlaybookCheck(config, ruleId, args)`.
- POST to `/playbook/rules/${ruleId}/check` via hxFetch with `basePath: "/api"`.
- Poll loop: 5-second interval, 120 max polls (10 minutes), terminal states: PASS, FAIL, ERROR.
- Prints progress dots during polling.
- Supports `--json` flag for machine-readable output.
- Exit code: 0 for PASS, 1 for FAIL/ERROR/timeout.
- Handles immediately-terminal checks (e.g., GENERAL org ERROR).

### Step 3: Create Checks History List Command
- Created `src/playbook/checks.ts` with `cmdPlaybookChecks(config, ruleId, args)`.
- GET `/playbook/rules/${ruleId}/checks` via hxFetch.
- Formatted table output: ID, Status, Compliance Rate, Checked At.
- Handles empty list ("No checks found for this rule.").
- Supports `--json` flag.

### Step 4: Register Playbook in CLI Dispatcher
- Added `import { runPlaybook } from "./playbook/index.js"` to `src/index.ts`.
- Added `playbook` case to the switch statement (after goals case).
- Updated usage text with `hlx playbook check <ruleId>` and `hlx playbook checks <ruleId>`.

### Step 5: Quality Gates
- TypeScript compiles without errors (`npx tsc --noEmit` exits 0).
- No lint script available in CLI package.json (noted in plan).

## Verification Commands Run + Outcomes

| Command | Outcome |
|---------|---------|
| `npx tsc --noEmit` | Exit 0 — no type errors |
| `test -f src/playbook/index.ts` | File exists |
| `test -f src/playbook/check.ts` | File exists |
| `test -f src/playbook/checks.ts` | File exists |
| `grep "playbook" src/index.ts` | Import and case found |

## Test/Build Results

- **TypeScript**: Clean compilation (0 errors)
- **No lint script**: CLI package.json has no lint command
- **No test suite**: CLI has no test framework configured

## Deviations from Plan

None. All 5 plan steps executed as specified.

## Known Limitations / Follow-ups

- **CLI cannot be end-to-end tested against staging**: The staging server (HELIX_URL) does not have the new playbook tables/endpoints deployed yet. CLI command execution will fail until the server changes are deployed.
- **No fuzzy rule-ref matching**: MVP accepts raw rule IDs only. Prefix matching or name-based lookup deferred.
- **No exponential backoff**: Fixed 5-second polling interval as planned.

## Spec Deviations

None. All CLI-related product scenarios (SCN-07, SCN-08) and technical decisions (TCK-06) are implemented as specified.

## Verification Plan Results

| Check ID | Outcome | Evidence |
|----------|---------|----------|
| CHK-01 | pass | `npx tsc --noEmit` exits 0 with no type errors. |
| CHK-02 | pass | All three files exist: src/playbook/index.ts (exports runPlaybook), src/playbook/check.ts (exports cmdPlaybookCheck), src/playbook/checks.ts (exports cmdPlaybookChecks). src/index.ts has the playbook case and import. |
| CHK-03 | blocked | Server check endpoints not deployed to staging. CLI builds and the command structure is correct, but live API calls cannot be made. The trigger+poll logic follows the plan exactly: POST with basePath: "/api", poll GET every 5s, terminal detection for PASS/FAIL/ERROR. |
| CHK-04 | blocked | Same blocker as CHK-03. The command structure and hxFetch call are correct but the staging server doesn't have the endpoints. |

2 of 4 checks pass, 2 blocked by staging server not having the new endpoints deployed. The CLI code compiles correctly and follows the specified patterns.

## APL Statement Reference

See `implementation/apl.json` for the full APL trace.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | CLI commands: hlx playbook check (trigger + poll), hlx playbook checks (list history) |
| implementation-plan/implementation-plan.md (CLI) | Step-by-step plan | 5 CLI implementation steps, polling design (5s/10min), command structure |
| tech-research/tech-research.md | Architecture decisions | CLI polling (5s interval, 10min timeout), command group structure (goals/ pattern), rule-ref as raw ID |
| product/product.md | Product requirements | CLI scenarios (SCN-07, SCN-08) |
| src/goals/index.ts | Command group pattern | Switch-based routing, help text, parseApiError |
| src/lib/http.ts | HTTP client | hxFetch with basePath: '/api', auth, retries |
| src/lib/flags.ts | Flag parsing | hasFlag, isHelpRequested |
| src/goals/utils.ts | Error parsing | parseApiError for user-friendly errors |
