# Diagnosis Statement — helix-cli

## Problem Summary

Accept PLAY as a valid `--mode` value in CLI ticket creation, replacing EXECUTE. Smallest change surface of all repos — 3-5 files with string replacements.

## Root Cause Analysis

PLAY is not recognized by the CLI. VALID_MODES contains EXECUTE which has zero production usage. Replace with PLAY.

### MVP-1 Changes

| File | Change |
|------|--------|
| `src/tickets/create.ts` | Replace EXECUTE with PLAY in VALID_MODES (line 13) + help text (line 17) |
| `src/tickets/index.ts` | Replace EXECUTE with PLAY in usage text (line 21) + help text (line 73) |
| `src/docs/cli-content.ts` | Replace EXECUTE with PLAY in mode table (line 109), example (line 247), description (line 250) |
| `skill-content/SKILL.md` | Update mode references |
| `skill-content/references/commands.md` | Update --mode docs |

### Deployment Note

Server deploys first. CLI sends mode in POST body to server API. If CLI sends `--mode PLAY` before server recognizes PLAY, the server Zod validation rejects it. Coordinate deployment.

### CLI MVP Levels

- **MVP-1:** Replace EXECUTE with PLAY. Only level that touches CLI.
- **Deferred:** Play-specific subcommands (`hlx plays list`, `hlx plays run`) — future tickets.

## Evidence Summary

| Evidence | Finding |
|----------|---------|
| `create.ts:13` | VALID_MODES = ['AUTO', 'BUILD', 'FIX', 'RESEARCH', 'EXECUTE'] |
| `create.ts:17` | Help text shows 5 modes |
| `create.ts:82` | Mode normalized to uppercase |
| `index.ts:21,73` | Two additional mode list locations |
| `cli-content.ts:109,247,250` | Mode in docs content |
| Runtime DB (prior run) | EXECUTE=0/872 tickets — no backward compat concern |

## Success Criteria

1. `hlx tickets create --mode PLAY` succeeds (server deployed first)
2. `hlx tickets create --mode EXECUTE` rejected by CLI validation
3. Help text shows PLAY not EXECUTE
4. Quality gates pass (build, typecheck, test)

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (CLI) | File map | VALID_MODES array; case-insensitive validation |
| scout/scout-summary.md (CLI) | Analysis | 3-4 files, smallest surface |
| Previous diagnosis artifacts | Detailed file/line mapping | index.ts and cli-content.ts references |
| ticket.md point 1 | Spec | 'replaces execute' |
| create.ts | Verified source | Exact VALID_MODES values confirmed |
