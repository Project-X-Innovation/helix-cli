# Implementation Plan: Resume PAUSED Goals — helix-cli

## Overview

Add `hlx goals resume <goalId>` command to the CLI. The command POSTs to `/api/goals/:id/resume` with an empty body and displays a confirmation message. Follows the `terminate.ts` pattern: parse goalId from args, POST to endpoint, display result. Also updates CLI docs in `cli-content.ts`.

Cross-repo note: This depends on the server's `POST /goals/:id/resume` endpoint (helix-global-server). The server returns `{ ok: true }`.

## Implementation Principles

- Follow existing `terminate.ts` one-file-per-command pattern.
- Resume command has no flags (unlike terminate which has `--verdict`).
- Display simple confirmation with goalId (server returns `{ ok: true }`, not the full goal).
- Update CLI docs to include the new command.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Create `resume.ts` command file | New `src/goals/resume.ts` |
| 2 | Add resume case to goals switch | Modified `src/goals/index.ts` |
| 3 | Update CLI docs | Modified `src/docs/cli-content.ts` |
| 4 | Run quality gates | typecheck + build pass |

## Detailed Implementation Steps

### Step 1: Create `src/goals/resume.ts` command file

**Goal**: Create the resume command following the terminate.ts pattern.

**What to Build**:
- Create a new file `src/goals/resume.ts`.
- Pattern (follows terminate.ts structure but simpler — no flags):
  ```
  import type { HxConfig } from "../lib/config.js";
  import { hxFetch } from "../lib/http.js";
  import { parseApiError } from "./utils.js";

  export async function cmdGoalsResume(config: HxConfig, goalId: string): Promise<void> {
    try {
      await hxFetch(config, `/goals/${goalId}/resume`, {
        method: "POST",
        body: {},
        basePath: "/api",
      });
    } catch (error) {
      console.error(`Error: ${parseApiError(error)}`);
      process.exit(1);
    }

    console.log(`Goal resumed successfully.`);
    console.log(`  ID: ${goalId}`);
  }
  ```
- No flags needed — goalId is the only argument.
- Simple confirmation output since server returns `{ ok: true }` (not the full goal object).

**Verification (AI Agent Runs)**:
- `ls src/goals/resume.ts` — file exists.
- `npm run typecheck` — no type errors.

**Success Criteria**:
- `src/goals/resume.ts` exports `cmdGoalsResume(config, goalId)`.
- POSTs to `/goals/${goalId}/resume` with empty body via `hxFetch`.
- Handles errors with `parseApiError` and `process.exit(1)`.
- Displays confirmation on success.

### Step 2: Add resume case to `src/goals/index.ts` switch

**Goal**: Wire the new command into the goals command router.

**What to Build**:
- Add import at the top: `import { cmdGoalsResume } from "./resume.js";`
- Update the usage string (line 11-14) to include resume:
  `hlx goals resume <goalId>`
- Add new case after `terminate` case (around line 68) in the switch:
  ```
  case "resume": {
    if (isHelpRequested(rest)) {
      console.log("Usage: hlx goals resume <goalId>");
      process.exit(0);
    }
    const goalId = rest[0];
    if (!goalId || goalId.startsWith("--")) {
      console.error("Error: <goalId> is required. Usage: hlx goals resume <goalId>");
      process.exit(1);
    }
    await cmdGoalsResume(config, goalId);
    break;
  }
  ```
- Follows exact pattern of the `terminate` case (lines 57-68): help check, goalId validation, command call.

**Verification (AI Agent Runs)**:
- `grep -n "resume" src/goals/index.ts` — case exists.
- `npm run typecheck` — no type errors.

**Success Criteria**:
- `resume` case added to switch statement.
- Usage string includes `hlx goals resume <goalId>`.
- goalId validation follows terminate pattern.
- Import added for `cmdGoalsResume`.

### Step 3: Update CLI docs in `src/docs/cli-content.ts`

**Goal**: Document the new resume command in the CLI help content.

**What to Build**:
- In the Goals command table (around line 140, after the terminate row), add:
  `| \`hlx goals resume <goalId>\` | Resume a paused Goal |`
- After the `hlx goals terminate` flags section (around line 171), add a new section:
  ```
  **`hlx goals resume`:**

  No flags required. Resumes a paused Goal, re-triggering evaluation.
  ```
- In the examples section (around line 319, after the terminate example), add:
  ```
  ### Resume a paused Goal

  ```bash
  hlx goals resume <goalId>
  ```

  Resumes evaluation for a Goal in PAUSED status.
  ```

**Verification (AI Agent Runs)**:
- `grep -n "resume" src/docs/cli-content.ts` — docs updated.
- `npm run typecheck` — no type errors.

**Success Criteria**:
- Goals command table includes resume entry.
- Resume section with usage description exists.
- Example section includes resume example.

### Step 4: Run quality gates

**Goal**: Ensure all quality gates pass.

**What to Build**: Nothing new — run validation commands.

**Verification (AI Agent Runs)**:
- `npm run typecheck` — zero errors.
- `npm run build` — succeeds.

**Success Criteria**:
- Both quality gate commands pass with zero errors.

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|-----------|--------|-----------------|----------------|
| Node.js + npm installed | available | Dev environment | CHK-01, CHK-02, CHK-03 |
| CLI dependencies installed (`npm install`) | available | package.json exists | CHK-01, CHK-02, CHK-03 |
| .env file written with HELIX_API_KEY and HELIX_URL | available | Dev setup config provides env contents | CHK-03 |
| Server resume endpoint available at HELIX_URL | available | HELIX_URL points to staging server | CHK-03 |

### Required Checks

[CHK-01] TypeScript type check passes.
- Action: Run `npm run typecheck` in helix-cli root.
- Expected Outcome: Command exits with code 0, zero type errors.
- Required Evidence: `npm run typecheck` command output showing zero errors.

[CHK-02] CLI builds successfully.
- Action: Run `npm run build` in helix-cli root.
- Expected Outcome: Build completes with zero errors. TypeScript compiles all files including new `resume.ts`.
- Required Evidence: `npm run build` command output showing successful completion.

[CHK-03] Resume command executes and reaches the server endpoint.
- Action: Write .env file with the provided HELIX_API_KEY and HELIX_URL. Run `npm run build` then execute `node dist/index.js goals resume nonexistent-goal-id`.
- Expected Outcome: The command attempts to POST to the server and displays an error (404 or auth error), confirming the command is wired up, the HTTP call is made, and error handling works.
- Required Evidence: Command output showing the error message from `parseApiError` (not a crash or unhandled exception).

[CHK-04] CLI docs include resume command.
- Action: Run `node dist/index.js goals --help` to display the goals usage string.
- Expected Outcome: The usage output includes `hlx goals resume <goalId>` as one of the listed subcommands.
- Required Evidence: Command output showing the goals usage string with the resume subcommand listed.

## Success Metrics

- `hlx goals resume <goalId>` command parses arguments and POSTs to the server.
- CLI docs updated with resume command and example.
- All quality gates pass: typecheck, build.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (cli) | Ticket context | User wants pause/resume; CLI needs resume command |
| diagnosis/diagnosis-statement.md (cli) | Root cause | No resume command; terminate.ts is pattern; switch needs new case |
| diagnosis/apl.json (cli) | CLI diagnosis | 4 goals subcommands; terminate.ts POST pattern |
| product/product.md (cli) | Requirements | `hlx goals resume <goalId>` command, updated docs |
| scout/scout-summary.md (cli) | CLI analysis | goals/index.ts switch, terminate.ts pattern, cli-content.ts docs |
| scout/reference-map.json (cli) | File mapping | 4 relevant files identified |
| tech-research/tech-research.md (cli) | Architecture decisions | Option A: new resume.ts; no flags; simple confirmation output |
| src/goals/terminate.ts | Pattern source | hxFetch POST, parseApiError, console output format |
| src/goals/index.ts | Switch structure | help check, goalId validation, command dispatch pattern |
| src/docs/cli-content.ts:130-319 | Docs structure | Goals table, flags sections, examples section format |
