# Diagnosis Statement — helix-cli: Playbook Check Commands

## Problem Summary

The CLI has zero playbook-related code. Two new commands are needed: `hlx playbook check <rule-ref>` (trigger + poll to completion) and `hlx playbook checks <rule-ref>` (list history). The polling pattern is entirely new to the CLI — no existing command waits for an async result.

## Root Cause Analysis

This is new feature work, not a bug. The CLI needs:

1. **New command group** — A `src/playbook/` directory with index.ts (router), check.ts (trigger + poll), and checks.ts (list history), following the goals/ pattern.
2. **Dispatcher entry** — A `playbook` case in `src/index.ts` L81-156 switch statement.
3. **Polling loop** — New behavior for the CLI: POST to trigger, then repeatedly GET the check status until terminal state. No existing pattern to copy.
4. **Output formatting** — Display interpretation, counts (compliant/violating/total), compliance rate, and examples in console output. Support `--json` flag.

## Evidence Summary

| Evidence | Finding |
|----------|---------|
| `src/index.ts` L81-156 | Command dispatcher; no playbook case exists |
| `src/goals/index.ts` | Best reference pattern for command group router |
| `src/goals/get.ts` | Pattern for single-resource display with --json |
| `src/goals/list.ts` | Pattern for list display with padEnd alignment |
| `src/tickets/rerun.ts` | Trigger-only pattern (no polling) |
| `src/lib/http.ts` | hxFetch with basePath: '/api', retries, auth |
| `src/lib/flags.ts` | Flag parsing utilities (getFlag, hasFlag, getPositionalArgs) |
| `src/lib/resolve-ticket.ts` | Reference resolution pattern |
| `package.json` | build: tsc, typecheck: tsc --noEmit, test: node --test |

## Success Criteria

1. `hlx playbook check <rule-ref>` triggers a check via POST, polls via GET until terminal state, and prints interpretation + counts + examples.
2. `hlx playbook checks <rule-ref>` lists check history for a rule, newest first.
3. Both commands support `--json` for machine-readable output.
4. Error handling follows parseApiError pattern.
5. Polling has reasonable interval and timeout defaults.
6. TypeScript compiles cleanly (`tsc --noEmit`).

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (CLI) | File inventory | No existing playbook code; goals/ as reference; no polling exists |
| scout/scout-summary.md (CLI) | Analysis summary | New command group, new polling pattern, hxFetch with basePath: '/api' |
| ticket.md | Primary specification | CLI must trigger + poll check, list history, print interpretation/counts/examples |
| src/index.ts | CLI entry point | Command dispatch via switch; playbook case needed |
| src/goals/index.ts | Command group pattern | Switch-based routing with help, error handling |
| src/lib/http.ts | HTTP client | hxFetch for all API calls |
| package.json | Quality gates | build: tsc, typecheck: tsc --noEmit |
