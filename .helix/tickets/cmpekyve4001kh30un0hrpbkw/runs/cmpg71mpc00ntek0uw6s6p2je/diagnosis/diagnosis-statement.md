# Diagnosis Statement — helix-cli (Tertiary Target)

## Problem Summary

The Goals feature requires CLI support via a new `hlx goals` command family. Since Goals are a separate entity from Tickets (user decision), the CLI needs new commands rather than modifications to the existing `hlx tickets` commands. This is tertiary scope — dependent on the server API being available first.

## Root Cause Analysis

Greenfield — zero Goal-related code in CLI. New `src/goals/` directory needed with:
- `index.ts` — subcommand router (mirrors `src/tickets/index.ts` pattern)
- `create.ts` — create a goal with title, description, maxChildren
- `list.ts` — list goals with status filtering
- `get.ts` — get goal details including roadmap, previews, evaluation history
- `terminate.ts` — terminate a goal (complete or fail)

**VALID_MODES stays unchanged** at `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']` (create.ts line 13). Goals are not a ticket mode.

Register new `goals` family in `src/index.ts` top-level router alongside existing families: tickets, inspect, comments, library, skill, org, login, token, update.

## Evidence Summary

- VALID_MODES: exactly 5 values at create.ts line 13 — unchanged
- Command families in src/index.ts: tickets, inspect, comments, library, skill, org, login, token, update
- src/tickets/index.ts: ~150 lines — subcommand router pattern reference
- Quality gates: build (tsc), typecheck (tsc --noEmit), test (tsc + node --test)
- Zero Goal-related code exists

## Success Criteria

1. `hlx goals create` creates a goal via server API
2. `hlx goals list` lists goals with optional status filter
3. `hlx goals get <goalId>` shows goal details including child tickets, roadmap, previews
4. `hlx goals terminate <goalId>` terminates a goal
5. Passes typecheck and build quality gates

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-488) | Section 4.2 CLI impact spec | Goals need command family, not VALID_MODES update |
| Continuation context (user decisions) | Entity model decision | Goals are separate entity — new command family needed |
| scout/reference-map.json (CLI) | Current CLI structure | VALID_MODES at line 13, command family registration |
| scout/scout-summary.md (CLI) | Scope assessment | 4-5 new files, depends on server API |
