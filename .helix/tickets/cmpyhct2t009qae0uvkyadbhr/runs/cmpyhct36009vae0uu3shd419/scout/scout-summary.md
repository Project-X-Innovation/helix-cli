# Scout Summary — helix-cli

## Problem

The CLI has 5 fully implemented goals subcommands (create, list, get, terminate, resume) with no feature-flag gating. Commands are always available and hit the server API directly. If the server starts rejecting goals requests when the feature is disabled, the CLI would surface raw HTTP errors with no graceful handling.

## Analysis Summary

**Goals command surface (always available):**
- Entry point: src/index.ts:124-127 routes `hlx goals` to `runGoals`
- Router: src/goals/index.ts:20 dispatches subcommands via switch statement
- 5 subcommands: create, list, get, terminate, resume — each in its own file under src/goals/
- Shared utility: src/goals/utils.ts for error parsing
- Documentation: src/docs/cli-content.ts:133-176 with full usage for all goals commands

**Feature flag patterns: none.** No existing feature flag mechanism in the CLI codebase. Configuration uses env vars for connection (HELIX_API_KEY, HELIX_URL) with no feature toggles.

**Server dependency:** All goals commands make HTTP calls to the server API. The CLI has no independent state about which features are available. If the server rejects requests, the CLI must handle that error path.

**Quality gates:** `npm run build` (tsc), `npm run typecheck` (tsc --noEmit), `npm run test` (tsc + node --test)

## Relevant Files

| File | Role |
|------|------|
| `src/goals/index.ts` | Goals command router — dispatches subcommands (92 lines) |
| `src/goals/create.ts` | Create goal command |
| `src/goals/list.ts` | List goals command |
| `src/goals/get.ts` | Get goal detail command |
| `src/goals/terminate.ts` | Terminate goal command |
| `src/goals/resume.ts` | Resume goal command |
| `src/goals/utils.ts` | Shared error parsing utility |
| `src/index.ts` | Main CLI entry — routes hlx goals (lines 124-127) |
| `src/docs/cli-content.ts` | Goals command documentation (lines 133-176) |
| `src/lib/config.ts` | CLI config — no feature flag env vars |
| `package.json` | Quality gate scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand scope — feature flag across client-server everywhere | CLI is part of "everywhere" surface |
| src/goals/index.ts | Map CLI goals entry point | runGoals dispatches 5 subcommands with no feature-flag check |
| src/index.ts | Verify CLI routing | hlx goals always routes to runGoals |
| src/lib/config.ts | Check for existing feature flag config | No feature flag env vars in CLI |
| src/docs/cli-content.ts | Check goals documentation | Full docs for all goals commands (lines 133-176) |
