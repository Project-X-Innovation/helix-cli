# Diagnosis Statement — helix-cli

## Problem Summary

The CLI must accept PLAY as a valid `--mode` value, replacing EXECUTE. Smallest change surface — 3 files with string replacements.

## Root Cause Analysis

PLAY is not recognized by the CLI. VALID_MODES contains EXECUTE which has zero production usage. Replace with PLAY.

### Files Requiring Changes

| File | Change | Lines |
|------|--------|-------|
| `src/tickets/create.ts` | Replace EXECUTE with PLAY in VALID_MODES + help text | 13, 17 |
| `src/tickets/index.ts` | Replace EXECUTE with PLAY in usage text + help text | 21, 73 |
| `src/docs/cli-content.ts` | Replace EXECUTE with PLAY in mode table + examples | 109, 247, 250 |

### Deploy Ordering

Server deploys first. CLI sends mode to POST /api/tickets. If CLI sends PLAY before server recognizes it, server returns 400.

### CLI MVP Levels

**MVP-1:** Replace EXECUTE with PLAY in 3 files. Only level needed for this ticket.

**Deferred:** Play-specific subcommands (`hlx plays list`, `hlx plays preview`, `hlx plays run`).

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| VALID_MODES | create.ts:13 | ['AUTO','BUILD','FIX','RESEARCH','EXECUTE'] |
| Help text | create.ts:17 | --mode options inline |
| Mode validation | create.ts:79-87 | Uppercase normalize + includes check |
| Usage text | index.ts:21,73 | Two mode list locations |
| Docs content | cli-content.ts:109,247,250 | Mode table, example, description |
| EXECUTE usage | Runtime DB (server) | 0/872 tickets — no backward compat |

## Success Criteria

1. `hlx tickets create --mode PLAY` succeeds (server deployed first)
2. `hlx tickets create --mode EXECUTE` rejected
3. Help text shows PLAY not EXECUTE
4. `npm run typecheck && npm run build` pass

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (cli) | File inventory | 3 files with line numbers |
| scout/scout-summary.md (cli) | CLI analysis | Thin client; server enforces platform |
| ticket.md (Description) | Requirements | Play replaces Execute |
| Runtime DB (server) | EXECUTE usage | 0 tickets — safe to replace |
