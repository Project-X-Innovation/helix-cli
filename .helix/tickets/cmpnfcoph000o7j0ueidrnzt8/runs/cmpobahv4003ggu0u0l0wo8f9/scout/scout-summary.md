# Scout Summary — helix-cli

## Problem

The CLI has no resume command for goals. The current goals subcommands are create, list, get, and terminate. To match the server's new resume endpoint, a `hlx goals resume <goalId>` command is needed.

## Analysis Summary

**Current goals commands** (src/goals/index.ts:8-14):
- `hlx goals create` — creates a new goal
- `hlx goals list` — lists goals with optional status filter
- `hlx goals get <goalId>` — shows goal detail
- `hlx goals terminate <goalId> --verdict <complete|failed>` — terminates goal

**terminate.ts as pattern** (src/goals/terminate.ts): Parses goalId from args, reads `--verdict` flag, POSTs to `/api/goals/:id/terminate`, and displays the result. A resume command would follow the same structure but POST to `/api/goals/:id/resume` with no body (or minimal body).

**Documentation** (src/docs/cli-content.ts): CLI help content includes goals section that would need the resume command added.

## Relevant Files

| File | Role |
|------|------|
| `src/goals/index.ts` | Goals command router — needs resume case in switch statement |
| `src/goals/terminate.ts` | Pattern for resume implementation |
| `src/goals/utils.ts` | Shared error parsing utility |
| `src/docs/cli-content.ts` | CLI documentation — needs resume command |
| `package.json` | Quality gates: typecheck, build, test |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Continuation context | User wants pause/resume functionality |
| src/goals/index.ts (full file) | Map CLI commands | 4 subcommands; no resume |
| src/goals/terminate.ts | Pattern reference | POST + display pattern for lifecycle action |
| package.json | Build commands | tsc, tsc --noEmit, node --test |
