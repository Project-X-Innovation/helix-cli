# Scout Summary — RSH-606: helix-cli Feature Gaps

## Problem

Map the helix-cli's current capabilities and feature gaps to support identification of the most important new feature to build.

## Analysis Summary

The CLI is the most mature tool in the stack for its scope — inspection, ticket management, and goal commands are well-structured. Key observations:

- **Goal commands** exist but the backend Goal table doesn't exist in production, making them non-functional.
- **No notification commands** — users cannot manage notifications from the CLI.
- **No analytics commands** — no way to check usage, cost, or team metrics from the command line.
- **Inspection is strong** — db, logs, and api commands are well-implemented with proper error handling.
- **CLI has auto-update** capability, reducing maintenance friction.

The CLI is primarily a power-user and agent tool. Its gaps mirror the server's gaps (no external notifications, no analytics surfacing).

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/commands/inspect/index.ts` | Mature inspection feature |
| `src/commands/tickets/index.ts` | Core ticket management |
| `src/commands/goals/index.ts` | Goal commands (backend missing) |
| `src/commands/comments/index.ts` | Comment management |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| CLI source code | Map command coverage | Inspection mature, goals non-functional in prod, no notifications/analytics |
| package.json | Check version and dependencies | v1.3.4, TypeScript, Node.js 18+ |
| Production DB | Verify backend support | Goal table does not exist, confirming CLI goals are non-functional |
