# Scout Summary — helix-cli

## Problem

Add GOAL as a valid ticket mode in the Helix CLI so users can create Goal tickets via `hlx tickets create --mode GOAL`.

## Analysis Summary

**VALID_MODES (src/tickets/create.ts line 13):** Central constant defining accepted modes as a const array. Currently 5 values: AUTO, BUILD, FIX, RESEARCH, EXECUTE. Adding GOAL requires a single array element addition. Mode validation (lines 79-88) normalizes input to uppercase and checks with includes — no logic changes needed.

**Usage strings:** Three locations reference the valid mode list: create.ts usage (line 17), tickets/index.ts help text, and docs/cli-content.ts documentation. All must be updated to include GOAL.

**Other ticket commands:** get.ts returns mode in RelatedTicket type but handles arbitrary strings. list.ts does not filter by mode. No other commands need changes for basic GOAL support.

**Minimal change scope:** 1 code change (VALID_MODES array) + 3 documentation string updates. No structural or validation logic changes required.

## Relevant Files

| File | Lines | Relevance |
|------|-------|-----------|
| `src/tickets/create.ts` | 13, 17, 79-88, 147 | VALID_MODES array, usage string, mode validation, request body |
| `src/tickets/index.ts` | — | Help/usage text referencing valid modes |
| `src/docs/cli-content.ts` | — | CLI documentation export |
| `src/tickets/get.ts` | 10 | RelatedTicket type includes mode field |
| `package.json` | — | Build: tsc; Test: tsc && node --test |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-488) | Primary specification | Section 4.2: helix-cli change is adding GOAL to VALID_MODES in create.ts line 12 (actual line is 13) |
| src/tickets/create.ts | Verify VALID_MODES location and pattern | Line 13 const array, uppercase normalization, includes validation |
