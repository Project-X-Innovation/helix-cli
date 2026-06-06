# Diagnosis Statement — helix-cli

## Problem Summary

The CLI must accept PLAY as a valid `--mode` value in ticket creation, replacing EXECUTE. This is the smallest change surface — 3 files, purely string replacements following existing patterns.

## Root Cause Analysis

PLAY is not recognized by the CLI. The VALID_MODES array contains EXECUTE which needs to be replaced with PLAY. Three files contain mode references.

### Files Requiring Changes

| File | Change | Lines |
|------|--------|-------|
| src/tickets/create.ts | Replace EXECUTE with PLAY in VALID_MODES + help text | 13, 17 |
| src/tickets/index.ts | Replace EXECUTE with PLAY in usage text + help text | 21, 73 |
| src/docs/cli-content.ts | Replace EXECUTE with PLAY in mode table + examples + descriptions | 109, 247, 250 |

### Deploy Ordering

Server must deploy first. The CLI sends mode to POST /api/tickets — if PLAY is sent before the server knows PLAY, the server rejects with 400 (mode not in platformConfig.allowedModes).

### CLI MVP Levels

**L1:** Replace EXECUTE with PLAY in 3 files. No new subcommands.
**L2/L3 (deferred):** Play-specific subcommands (`hlx plays list`, `hlx plays preview`, `hlx plays run`).

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| VALID_MODES | create.ts line 13 | ['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE'] as const |
| Help text | create.ts line 17 | Shows --mode options inline |
| Mode validation | create.ts lines 79-87 | Uppercase normalize + includes() check |
| Mode send | create.ts line 147 | POST body with mode field |
| Usage text | index.ts lines 21, 73 | Two locations reference mode list |
| Docs content | cli-content.ts lines 109, 247, 250 | Mode table, example, description |
| EXECUTE usage | Production DB | Zero tickets — no backward compat needed |

## Success Criteria

1. `hlx tickets create --mode PLAY` sends `mode: "PLAY"` to server successfully (server must be deployed first)
2. `hlx tickets create --mode EXECUTE` produces validation error
3. Help text shows PLAY instead of EXECUTE in all 3 files
4. `npm run typecheck` and `npm run build` pass

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (helix-cli) | File inventory with line references | 3 files with specific line numbers |
| scout/scout-summary.md (helix-cli) | CLI analysis | Thin client; server enforces platform restrictions |
| ticket.md (Description) | Ticket requirements | Play replaces Execute; normal ticket system |
| Previous diagnosis (prior run) | Deploy ordering insight | Server must deploy first |
