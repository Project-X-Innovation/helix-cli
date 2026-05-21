# Diagnosis Statement — helix-cli (Tertiary Target)

## Problem Summary

The Goals feature requires CLI support via a new `hlx goals` command family. Since Goals are a separate entity from Tickets (user decision), the CLI needs new commands rather than modifications to the existing `hlx tickets` commands. This is tertiary scope — dependent on the server API being available first.

## Root Cause Analysis

No Goal-related CLI code exists. The CLI currently supports: tickets (create, list, get), inspect, comments, library, skill, org, login, token, update. Goals as a separate entity require a new command family.

### Current CLI State

- **VALID_MODES**: 5 values at create.ts line 13 (AUTO, BUILD, FIX, RESEARCH, EXECUTE) — unchanged since Goals are not a TicketMode
- **Command structure**: src/index.ts registers families; each family has a directory with subcommand files
- **Dependencies**: Pure TypeScript, no runtime deps; build via tsc
- **Quality gates**: build (tsc), typecheck (tsc --noEmit), test (tsc + node --test)

### Scope of CLI Changes

| Change | Location | Description |
|--------|----------|-------------|
| Register goals family | src/index.ts | Add 'goals' to top-level command routing |
| New src/goals/ directory | src/goals/ | Command family directory |
| hlx goals create | src/goals/create.ts | Title, description, maxChildren; calls POST /api/goals |
| hlx goals list | src/goals/list.ts | Active goals for org; calls GET /api/goals |
| hlx goals get | src/goals/get.ts | Goal detail with children, evaluations; calls GET /api/goals/:id |
| hlx goals terminate | src/goals/terminate.ts | Mark complete or failed; calls POST /api/goals/:id/terminate |

## Evidence Summary

- **VALID_MODES verified**: 5 values, no modification needed
- **No Goal code exists**: Zero matches for 'goal', 'Goal', 'GOAL' in src/
- **Command pattern established**: tickets family at src/tickets/ provides structural reference

## Success Criteria

1. New `hlx goals` command family with create, list, get, terminate subcommands
2. VALID_MODES unchanged — Goals are separate entity
3. Passes build (tsc) and typecheck (tsc --noEmit)
4. Follows existing CLI patterns (arg parsing, validation, API calls, output formatting)

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-488 Research Report) | CLI requirements | Section 4.2: mentions CLI adding GOAL to VALID_MODES — but that's for TicketMode approach; separate entity needs new commands |
| Continuation context (user decisions) | Entity model decision | Separate Goal entity means new command family, not VALID_MODES modification |
| scout/reference-map.json (cli) | Current CLI structure | VALID_MODES at line 13; no Goal code; command family pattern |
