# Scout Summary — helix-cli

## Problem

The Goals feature may require CLI changes depending on the entity model decision. If Goals are a separate entity (user-preferred direction), a new `hlx goals` command family is needed. If Goals are a TicketMode, only `VALID_MODES` in `create.ts` needs updating. CLI is tertiary scope.

## Analysis Summary

### Current CLI Structure

Pure TypeScript application (no runtime dependencies). Command families: tickets, inspect, comments, library, skill, org, login, token, update.

Ticket creation uses `VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]` (line 13 of `src/tickets/create.ts`). Mode is optional, normalized to uppercase, validated against the array, and sent to `POST /api/tickets`.

### Impact Assessment

- **Minimal (TicketMode approach)**: Add `"GOAL"` to VALID_MODES array (line 13), update help text (line 17).
- **Moderate (separate entity approach)**: New `src/goals/` directory mirroring `src/tickets/` pattern. Commands: create, list, get, terminate. Register `hlx goals` in `src/index.ts`.

### No Existing Goal Code

Zero matches for goal/Goal/GOAL in the entire codebase — fully greenfield.

## Relevant Files

| File | Role |
|------|------|
| `src/tickets/create.ts` | VALID_MODES (line 13), mode validation, ticket creation |
| `src/tickets/index.ts` | Subcommand router pattern |
| `src/index.ts` | Top-level command family registration |
| `package.json` | Build: tsc. Test: tsc + node --test |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-488) | Section 4.2 specifies CLI impact | CLI change scope depends on entity model decision |
| Continuation context (user decisions) | User wants separate Goal entity | If separate entity, CLI needs goals command family, not just VALID_MODES update |
| src/tickets/create.ts | Current VALID_MODES | 5 modes at line 13, no GOAL |
| src/index.ts | Command family structure | Pattern for registering new top-level commands |
