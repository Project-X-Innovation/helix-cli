# Diagnosis Statement — helix-cli

## Problem Summary

Add GOAL as a valid ticket mode in the Helix CLI so users can create Goal tickets via `hlx tickets create --mode GOAL`.

## Root Cause Analysis

The CLI's VALID_MODES array at `src/tickets/create.ts` line 13 defines 5 accepted modes: AUTO, BUILD, FIX, RESEARCH, EXECUTE. GOAL is not among them, and 3 usage/documentation strings reference the mode list. This is a straightforward addition — no structural changes needed.

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| VALID_MODES array | `src/tickets/create.ts` line 13 | 5 values, no GOAL |
| Mode validation | `src/tickets/create.ts` lines 79-88 | Uppercase normalization + includes check — handles new values automatically |
| Request body construction | `src/tickets/create.ts` line 147 | Mode conditionally included — no structural change needed |
| Usage strings | `create.ts` line 17, `index.ts`, `cli-content.ts` | 3 locations listing valid modes for help text |

## Success Criteria

1. `hlx tickets create --mode GOAL` is accepted without error.
2. `hlx tickets create --mode goal` (lowercase) is accepted (uppercase normalization).
3. Help text and documentation list GOAL as a valid mode.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-488) | Primary specification | Section 4.2: CLI change is adding GOAL to VALID_MODES |
| scout/reference-map.json (helix-cli) | File-level change map | 1 code change + 3 doc string updates; no structural changes |
| scout/scout-summary.md (helix-cli) | Analysis summary | Minimal change scope confirmed |
