# Diagnosis Statement — helix-cli

## Problem Summary

The CLI must accept PLAY as a valid `--mode` value in ticket creation, replacing EXECUTE. This is a 2-file change — the smallest implementation surface of all four repos.

## Root Cause Analysis

The CLI is a thin client that validates mode strings locally then sends them to the server API. The server enforces platform restrictions (NETSUITE-only for PLAY). The CLI change is replacing one string in a const tuple and updating help text in two files.

Current state:
- `VALID_MODES` at `create.ts:13`: `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE']`
- Help text at `create.ts:17`: `--mode <AUTO|BUILD|FIX|RESEARCH|EXECUTE>`
- Docs at `cli-content.ts:109`: mode list includes EXECUTE

Target state:
- `VALID_MODES`: `['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'PLAY']`
- Help text: `--mode <AUTO|BUILD|FIX|RESEARCH|PLAY>`
- Docs: mode list shows PLAY

**Deploy ordering**: Server must deploy first. If CLI sends `mode: "PLAY"` before the server recognizes PLAY in platformConfig.allowedModes, the server returns 400.

**MVP levels for CLI:**
- **L1**: Replace EXECUTE with PLAY in VALID_MODES and docs. 2 files.
- **L2/L3**: Future play-specific subcommands (`hlx plays list`, `hlx plays preview`, `hlx plays run`) — deferred.

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| VALID_MODES | `src/tickets/create.ts:13` | 5-value const tuple including EXECUTE |
| Help text | `create.ts:17` | Inline mode documentation shows EXECUTE |
| Mode validation | `create.ts:79-88` | Uppercase normalize + includes() check |
| Mode send | `create.ts:147` | POST /api/tickets with mode in body |
| Docs | `src/docs/cli-content.ts:109` | Mode table shows EXECUTE |
| EXECUTE usage | Production DB (runtime-verified) | Zero EXECUTE tickets — no backward-compat needed |

## Success Criteria

1. `hlx tickets create --mode PLAY ...` sends `mode: "PLAY"` to server successfully
2. `hlx tickets create --mode EXECUTE ...` produces validation error
3. Help text shows PLAY instead of EXECUTE
4. CLI docs (cli-content.ts) show PLAY
5. `npm run typecheck` and `npm run build` pass

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md items 1-7 | MVP scope | CLI supports play creation via --mode PLAY |
| scout/reference-map.json (cli) | File inventory | 4 files identified; 2 need changes |
| scout/scout-summary.md (cli) | CLI mode analysis | Thin client; server enforces platform restrictions |
| src/tickets/create.ts:13,17 | Verify mode flag | VALID_MODES tuple; help text inline |
| src/docs/cli-content.ts:109 | Verify docs | Mode table with EXECUTE |
