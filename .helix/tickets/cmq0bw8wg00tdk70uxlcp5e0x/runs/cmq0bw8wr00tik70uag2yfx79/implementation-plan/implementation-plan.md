# Implementation Plan — helix-cli: Playbook Check CLI Commands

## Overview

Add `hlx playbook check <ruleId>` and `hlx playbook checks <ruleId>` CLI commands. The `check` command triggers a playbook check via POST, then polls GET until terminal state, printing interpretation, counts, compliance rate, and examples. The `checks` command lists check history newest first. This is the first polling pattern in the CLI. All API communication uses `hxFetch` with `basePath: "/api"`. Depends on server endpoints from the helix-global-server plan.

## Implementation Principles

- **Follow existing patterns**: Command group structure follows `src/goals/` (index.ts router, individual command files).
- **Minimal additions**: Three new files (`src/playbook/index.ts`, `check.ts`, `checks.ts`) plus one dispatcher entry in `src/index.ts`.
- **Consistent UX**: Use `--json` flag for machine-readable output, `parseApiError` for error messages, padEnd for alignment.
- **Simple polling**: Fixed 5-second interval, 10-minute timeout. No exponential backoff needed for 1-5 minute check durations.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Create playbook command group router | New `src/playbook/index.ts` |
| 2 | Create check trigger + poll command | New `src/playbook/check.ts` |
| 3 | Create checks history list command | New `src/playbook/checks.ts` |
| 4 | Register playbook in CLI dispatcher | Updated `src/index.ts` |
| 5 | Quality gates | TypeScript compiles |

## Detailed Implementation Steps

### Step 1: Create Playbook Command Group Router

**Goal**: Create the playbook subcommand router following the goals/ pattern.

**What to Build**:

Create `src/playbook/index.ts`:
- Import `HxConfig` from `../lib/config.js`.
- Import `isHelpRequested` from `../lib/flags.js`.
- Import `cmdPlaybookCheck` from `./check.js`.
- Import `cmdPlaybookChecks` from `./checks.js`.
- Define `playbookUsage(exitCode)` function showing:
  ```
  Usage:
    hlx playbook check <ruleId> [--json]    Trigger a compliance check and poll to completion
    hlx playbook checks <ruleId> [--json]   List check history for a rule
  ```
- Export `runPlaybook(config, args)` function:
  - Extract `subcommand = args[0]`, `rest = args.slice(1)`.
  - If no subcommand or help requested, call `playbookUsage(0)`.
  - Switch on subcommand:
    - `"check"`: validate ruleId arg (first positional, required), call `cmdPlaybookCheck(config, ruleId, rest.slice(1))`.
    - `"checks"`: validate ruleId arg, call `cmdPlaybookChecks(config, ruleId, rest.slice(1))`.
    - Default: print `Unknown playbook command: ${subcommand}`, call `playbookUsage()`.
  - Wrap in try/catch using `parseApiError`.

- Also create a small utility for error parsing. Either import `parseApiError` from `../goals/utils.js` (if it's a generic utility), or duplicate the small function locally. Based on the goals/ pattern, import from goals/utils.

**Verification (AI Agent Runs)**:
```bash
test -f src/playbook/index.ts && echo "exists"
npx tsc --noEmit
```

**Success Criteria**:
- `src/playbook/index.ts` exports `runPlaybook`.
- Dispatches `check` and `checks` subcommands.
- Shows help text for `--help` or no subcommand.
- Error handling follows `parseApiError` pattern.

---

### Step 2: Create Check Trigger + Poll Command

**Goal**: Implement `hlx playbook check <ruleId>` — trigger a check, poll to completion, print result.

**What to Build**:

Create `src/playbook/check.ts`:
- Import `hxFetch` from `../lib/http.js`.
- Import `hasFlag` from `../lib/flags.js`.
- Export `cmdPlaybookCheck(config, ruleId, args)`:

1. **Trigger**: POST to `/playbook/rules/${ruleId}/check` via `hxFetch(config, ...)` with `{ method: "POST", basePath: "/api" }`.
   - Parse response JSON: `{ check }`.
   - Print `"Check started: ${check.id}"`.
   - If check.status is already terminal (ERROR), print result and exit.

2. **Poll loop**:
   - Set `POLL_INTERVAL = 5000` (5 seconds), `MAX_POLLS = 120` (10 minutes).
   - Loop: `await new Promise(r => setTimeout(r, POLL_INTERVAL))`.
   - GET `/playbook/rules/${ruleId}/checks/${check.id}` with `{ basePath: "/api" }`.
   - Parse response: `{ check: updatedCheck }`.
   - If `updatedCheck.status` is terminal (`PASS`, `FAIL`, `ERROR`): break.
   - Print progress dot or status on each poll.

3. **Display result**:
   - If `--json` flag: `console.log(JSON.stringify(check, null, 2))` and exit.
   - Otherwise print formatted output:
     - `Status: ${check.status}`
     - `Interpretation: ${check.interpretation}`
     - `Compliance Rate: ${check.complianceRate}%`
     - `Counts: ${JSON.stringify(check.counts)}`
     - `Compliant Examples: ${check.compliantExamples?.length ?? 0}`
     - `Violating Examples: ${check.violatingExamples?.length ?? 0}`
     - If ERROR: print `Error: ${check.error}`

4. **Timeout**: If loop exhausts without terminal state, print warning with last status.

5. **Exit code**: 0 for PASS, 1 for FAIL or ERROR (useful for CI).

**Verification (AI Agent Runs)**:
```bash
test -f src/playbook/check.ts && echo "exists"
npx tsc --noEmit
```

**Success Criteria**:
- `src/playbook/check.ts` exports `cmdPlaybookCheck`.
- POST trigger + GET polling loop with 5s interval and 10-minute timeout.
- Terminal states: PASS, FAIL, ERROR.
- Formatted output includes interpretation, counts, compliance rate, examples count.
- `--json` flag prints raw JSON.
- TypeScript compiles.

---

### Step 3: Create Checks History List Command

**Goal**: Implement `hlx playbook checks <ruleId>` — list check history for a rule.

**What to Build**:

Create `src/playbook/checks.ts`:
- Import `hxFetch` from `../lib/http.js`.
- Import `hasFlag` from `../lib/flags.js`.
- Export `cmdPlaybookChecks(config, ruleId, args)`:

1. GET `/playbook/rules/${ruleId}/checks` via `hxFetch(config, ...)` with `{ basePath: "/api" }`.
2. Parse response: `{ checks }`.
3. If `--json` flag: `console.log(JSON.stringify(checks, null, 2))` and exit.
4. Otherwise print formatted table:
   - Header: `ID | Status | Compliance Rate | Checked At`
   - For each check: `${check.id.slice(0,8)}... | ${check.status.padEnd(6)} | ${check.complianceRate ?? '-'}% | ${check.checkedAt ?? check.createdAt}`
5. If no checks: print `"No checks found for this rule."`.

**Verification (AI Agent Runs)**:
```bash
test -f src/playbook/checks.ts && echo "exists"
npx tsc --noEmit
```

**Success Criteria**:
- `src/playbook/checks.ts` exports `cmdPlaybookChecks`.
- Fetches and displays check history.
- `--json` support.
- Handles empty list gracefully.
- TypeScript compiles.

---

### Step 4: Register Playbook in CLI Dispatcher

**Goal**: Add the `playbook` case to the main command dispatcher.

**What to Build**:

In `src/index.ts`:

1. Add import at the top (after existing imports around L14):
   ```typescript
   import { runPlaybook } from "./playbook/index.js";
   ```

2. Add case in the switch statement (after the `goals` case around L128):
   ```typescript
   case "playbook": {
     const config = configOrHelp(args.slice(1));
     await runPlaybook(config, args.slice(1));
     break;
   }
   ```

3. Update the `usage()` function help text to include:
   ```
   hlx playbook check <ruleId>     Trigger a compliance check and poll
   hlx playbook checks <ruleId>    List check history
   ```

**Verification (AI Agent Runs)**:
```bash
grep "playbook" src/index.ts
npx tsc --noEmit
```

**Success Criteria**:
- `playbook` case added to switch statement in `src/index.ts`.
- Import added for `runPlaybook`.
- Usage text updated.
- TypeScript compiles.

---

### Step 5: Quality Gates

**Goal**: Confirm all quality gates pass.

**What to Build**: No code changes — validation only.

**Verification (AI Agent Runs)**:
```bash
npx tsc --noEmit
```

**Success Criteria**:
- TypeScript compiles without errors (tsc --noEmit exits 0).
- Note: CLI has no lint script in package.json; only typecheck is available.

---

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js >= 18 runtime | available | package.json engines field | CHK-01 through CHK-04 |
| npm dependencies installed (`npm install`) | available | Run `npm install` in helix-cli root | CHK-01 through CHK-04 |
| Server check endpoints deployed/running | unknown | Depends on helix-global-server implementation being complete and the dev server running | CHK-03, CHK-04 |
| `.env` file written with dev setup values | available | Dev setup config provides HELIX_API_KEY and HELIX_URL | CHK-03, CHK-04 |
| An existing playbook rule on the staging server | unknown | Need a rule ID from GET /api/playbook/rules on the staging server | CHK-03, CHK-04 |

### Required Checks

[CHK-01] TypeScript compiles without errors
- Action: Run `npx tsc --noEmit` from the helix-cli root.
- Expected Outcome: Exit code 0, no type errors.
- Required Evidence: Command output showing clean compilation.

[CHK-02] All required files exist with correct exports
- Action: Verify that `src/playbook/index.ts`, `src/playbook/check.ts`, and `src/playbook/checks.ts` exist. Verify that `src/index.ts` has the `playbook` case in its switch statement and the import for `runPlaybook`.
- Expected Outcome: Three new files exist. `index.ts` exports `runPlaybook`, `check.ts` exports `cmdPlaybookCheck`, `checks.ts` exports `cmdPlaybookChecks`. The main dispatcher has the `playbook` case.
- Required Evidence: File listings and grep output showing exports and the dispatcher case.

[CHK-03] hlx playbook check triggers a check via the API
- Action: Write the `.env` file with dev setup values (HELIX_API_KEY, HELIX_URL). Build the CLI with `npm run build`. Identify a rule ID (via `node dist/index.js playbook checks` or the server API). Run `node dist/index.js playbook check <ruleId>` to trigger a check.
- Expected Outcome: The CLI prints "Check started: <checkId>" and begins polling. If the server is running and the run completes, it prints the check result (status, interpretation, counts). If the server is unavailable, the command fails with a clear API error.
- Required Evidence: Command output showing the trigger confirmation and either the polling progress + result, or a clear API error message.

[CHK-04] hlx playbook checks lists check history
- Action: Using the same environment from CHK-03, run `node dist/index.js playbook checks <ruleId>`.
- Expected Outcome: The CLI prints a formatted table of check history for the rule (ID, status, compliance rate, checked-at), or "No checks found" if the rule has no checks. With `--json`, prints raw JSON.
- Required Evidence: Command output showing the check list or empty-state message.

## Success Metrics

1. Three new files created in `src/playbook/` (index.ts, check.ts, checks.ts).
2. `playbook` case registered in `src/index.ts` dispatcher with help text.
3. `check` command implements POST trigger + GET polling loop with 5s interval and 10min timeout.
4. `checks` command lists history newest first with formatted output.
5. Both commands support `--json` flag.
6. TypeScript compiles without errors.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | CLI commands: hlx playbook check (trigger + poll), hlx playbook checks (list history) |
| scout/scout-summary.md (CLI) | Gap analysis | No playbook code exists; goals/ as reference pattern; no polling pattern |
| scout/reference-map.json (CLI) | File inventory | 11 files mapped; goals/ router pattern; hxFetch with basePath: '/api' |
| diagnosis/diagnosis-statement.md (CLI) | Root cause analysis | New command group, first polling pattern, follows goals/ structure |
| diagnosis/apl.json (CLI) | Design Q&A | Command structure, polling approach (5s/10min), rule-ref as raw ID |
| product/product.md | Product requirements | CLI scenarios (SCN-07, SCN-08): trigger+poll and list history |
| tech-research/tech-research.md | Architecture decisions | CLI polling (5s interval, 10min timeout, fixed loop), command group structure, rule-ref as raw ID |
| repo-guidance.json | Repo change intent | cli=target |
| src/index.ts L0-161 | CLI entry point | Command dispatch pattern; configOrHelp; usage function |
| src/goals/index.ts | Command group pattern | Switch-based routing, help, parseApiError, subcommand dispatch |
| src/goals/get.ts (from scout) | Display pattern | --json flag, formatted output |
| src/lib/http.ts (from scout) | HTTP client | hxFetch with basePath: '/api', auth, retries |
| package.json | Quality gates | typecheck: tsc --noEmit (no lint script) |
