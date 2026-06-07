# Scout Summary — helix-cli

## Problem

Add `hlx playbook check <rule-ref>` to trigger a playbook check and poll to completion (printing interpretation, counts, and examples), and `hlx playbook checks <rule-ref>` to list check history. These commands communicate with the server's new playbook check API endpoints.

## Analysis Summary

### No Existing Playbook Code
The CLI has no playbook-related code. A new `src/playbook/` directory with index.ts (router), check.ts (trigger + poll), and checks.ts (list history) is needed, following the established command group pattern (goals/, tickets/).

### Command Pattern
The CLI uses a clear hierarchical structure: `src/index.ts` dispatches to command group routers (e.g., `goals/index.ts`), which dispatch to individual handlers. Each handler uses `hxFetch` with `basePath: "/api"` for API calls, supports `--json` for machine output, and uses `parseApiError` for error messages.

### New: Polling Pattern
No existing CLI command polls for async results. `tickets/rerun.ts` triggers a run and exits immediately. The `hlx playbook check` command needs to introduce a polling loop: POST to trigger, then repeatedly GET the check status endpoint until a terminal state is reached. This is new behavior for the CLI.

### API Client
`hxFetch` in `src/lib/http.ts` handles auth (API key or Bearer token), retries with backoff, and timeouts. It supports both GET and POST with JSON bodies. All new API calls will use this client.

### Output
The CLI formats output with console.log, padEnd() for alignment, and supports `--json` flags. The check result display needs to show interpretation, counts (compliant/violating/total), compliance rate, and optionally examples.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/index.ts` (L81-156) | Add 'playbook' case to command dispatcher |
| `src/goals/index.ts` | Reference pattern for command group router |
| `src/goals/get.ts` | Reference pattern for single-resource display |
| `src/goals/list.ts` | Reference pattern for list display |
| `src/tickets/rerun.ts` | Reference pattern for triggering async operations |
| `src/lib/http.ts` | hxFetch HTTP client for all API calls |
| `src/lib/flags.ts` | Flag parsing (getFlag, hasFlag, getPositionalArgs) |
| `src/lib/config.ts` | HxConfig type and config loading |
| `src/lib/resolve-ticket.ts` | Reference for user-ref resolution pattern |
| `src/goals/utils.ts` | parseApiError utility pattern |
| `package.json` | Build: tsc, test: node --test, typecheck: tsc --noEmit |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | CLI must trigger + poll check and list history |
| src/index.ts | Entry point | Command dispatch pattern with configOrHelp |
| src/goals/index.ts | Command group pattern | Switch-based routing with help, error handling |
| src/goals/get.ts | Display pattern | Fetch + formatted print with --json support |
| src/tickets/rerun.ts | Trigger pattern | POST to start async operation |
| src/lib/http.ts | HTTP client | hxFetch with basePath: "/api", retries, auth |
| src/lib/flags.ts | Argument parsing | Flag utilities for CLI arg handling |
| package.json | Quality gates | build: tsc, typecheck: tsc --noEmit, test: node --test |
