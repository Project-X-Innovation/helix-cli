# Scout Summary — helix-cli

## Problem

The Goals feature may require CLI changes. Since Goals are a separate entity (user decision), the CLI needs a new `hlx goals` command family (create, list, get, terminate) rather than adding GOAL to VALID_MODES. CLI is tertiary scope — depends on server API first.

## Analysis Summary

### Current CLI Structure

Pure TypeScript ES module application (no runtime dependencies beyond Node 18+). Command families: tickets, inspect, comments, library, skill, org, login, token, update.

Ticket creation uses `VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]` (line 13 of `src/tickets/create.ts`). Mode is optional, normalized to uppercase, validated against the array, and sent to `POST /api/tickets`. Since Goals are a separate entity, VALID_MODES stays unchanged.

### Impact Assessment

**Separate entity approach (user-decided)**: New `src/goals/` directory mirroring `src/tickets/` pattern. Commands: create, list, get, terminate. Register `hlx goals` in `src/index.ts`. Approximately 4-5 new files.

### No Existing Goal Code

Zero matches for goal/Goal/GOAL in the entire CLI codebase — fully greenfield.

## Relevant Files

| File | Lines | Role |
|------|-------|------|
| `src/tickets/create.ts` | 185 | VALID_MODES (line 13), mode validation pattern |
| `src/tickets/index.ts` | ~150 | Subcommand router pattern |
| `src/index.ts` | — | Top-level command family registration |
| `package.json` | — | Build: tsc. Test: tsc + node --test. Typecheck: tsc --noEmit |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-488) | Section 4.2 specifies CLI impact | CLI needs goals command family, not VALID_MODES update |
| Continuation context (user decisions) | User wants separate Goal entity | Goals are separate from tickets — new command family needed |
| src/tickets/create.ts | Current VALID_MODES | 5 modes at line 13, stays unchanged |
| src/index.ts | Command family structure | Pattern for registering new 'goals' top-level command |
| repo-guidance.json | Repo intent | CLI is tertiary target, depends on server API |
