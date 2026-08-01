# Diagnosis Statement — helix-cli

## Problem Summary

The CLI must accept PLAY as a valid `--mode` value in ticket creation, replacing EXECUTE. This is a single-file change to the VALID_MODES array and help text.

## Root Cause Analysis

The CLI is a thin client that validates mode locally then passes it to the server API. The server enforces platform-specific mode restrictions. The CLI change is replacing one string literal in a tuple and updating the corresponding help text.

Current state:
- `VALID_MODES` at `create.ts` line 13: `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']`
- Help text at line 17: documents `[--mode <AUTO|BUILD|FIX|RESEARCH|EXECUTE>]`

Target state:
- `VALID_MODES`: `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'PLAY']`
- Help text: `[--mode <AUTO|BUILD|FIX|RESEARCH|PLAY>]`

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| VALID_MODES | `src/tickets/create.ts` line 13 | 5-value string tuple including EXECUTE |
| Help text | `create.ts` line 17 | Inline mode documentation |
| Mode validation | `create.ts` lines 79-88 | Uppercase normalization + array check |
| No EXECUTE usage | Production DB query | Zero EXECUTE tickets — no backward-compat for scripts |

## Success Criteria

1. **PLAY accepted**: `hlx tickets create --mode PLAY ...` sends `mode: "PLAY"` to server.
2. **EXECUTE rejected**: `hlx tickets create --mode EXECUTE ...` produces a validation error.
3. **Help text updated**: Help output shows PLAY instead of EXECUTE.
4. **Type check passes**: `npm run typecheck` succeeds.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-702 research report) | Primary specification | CLI mode flag is extensible; PLAY replaces EXECUTE |
| scout/reference-map.json (helix-cli) | File inventory | 3 files identified; only create.ts needs changes |
| scout/scout-summary.md (helix-cli) | Analysis of CLI mode system | VALID_MODES is a string tuple; minimal change surface |
| src/tickets/create.ts | Verify mode flag implementation | VALID_MODES at line 13; help text at line 17 |
| Production DB (runtime inspection) | Confirm zero EXECUTE usage | No backward-compat needed for --mode EXECUTE |
