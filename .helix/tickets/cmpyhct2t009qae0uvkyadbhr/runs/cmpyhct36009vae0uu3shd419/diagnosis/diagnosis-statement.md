# Diagnosis Statement

## Problem Summary

The CLI has 5 goals subcommands (create, list, get, terminate, resume) always available with no feature-flag gating. Commands hit the server API directly. If the server starts rejecting goal requests when the feature is disabled, the CLI would surface raw HTTP errors with no graceful handling.

## Root Cause Analysis

No feature-flag mechanism exists in the CLI codebase. The CLI configuration (`src/lib/config.ts`) uses env vars for connection settings only (HELIX_API_KEY, HELIX_URL). Goals commands dispatch unconditionally from `src/goals/index.ts:20` via `src/index.ts:124-127`. The shared error utility (`src/goals/utils.ts`) parses generic errors with no feature-flag awareness.

The CLI is a thin API client — it should react to server responses rather than maintaining independent feature-flag state. When the server returns 404 for goal endpoints (due to `GOALS_ENABLED=false`), the CLI needs to catch that and display a user-friendly message.

## Evidence Summary

| Evidence | Location | Finding |
|----------|----------|---------|
| Goals routing | `src/index.ts:124-127` | hlx goals always routed to runGoals |
| Goals dispatcher | `src/goals/index.ts:20` | Dispatches all 5 subcommands unconditionally |
| CLI config | `src/lib/config.ts` | No feature flag env vars |
| Error handling | `src/goals/utils.ts` | Generic error parsing, no feature-flag handling |
| Goals documentation | `src/docs/cli-content.ts:133-176` | Full docs for all goals commands |

## Success Criteria

1. When server returns 404 for goal endpoints, CLI displays "Goals feature is not enabled" instead of raw error.
2. Goals commands remain in CLI help/docs (they are available when the server has them enabled).
3. `npm run build`, `npm run typecheck`, `npm run test` pass.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope the feature flag request | Single server env var; CLI is part of "everywhere" |
| scout/reference-map.json (cli) | Map CLI goals commands and error handling | 5 commands always available, no feature flag patterns |
| scout/scout-summary.md (cli) | Cross-repo analysis overview | No feature-flag mechanism in CLI |
| src/goals/index.ts | Verify goals entry point | runGoals dispatches unconditionally |
| src/index.ts | Verify main CLI routing | hlx goals always routed |
| src/lib/config.ts | Check for existing feature flag config | No feature flag env vars |
| src/goals/utils.ts | Check error handling | Generic error parsing only |
