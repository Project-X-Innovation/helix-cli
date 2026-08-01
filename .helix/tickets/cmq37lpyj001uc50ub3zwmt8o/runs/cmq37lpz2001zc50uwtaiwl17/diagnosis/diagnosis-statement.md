# Diagnosis Statement

## Problem Summary

The helix-cli needs PLAY mode added to the VALID_MODES array, help text, and CLI documentation content, replacing EXECUTE. This is part of Level 1 of MVP NetSuite Play Mode.

## Root Cause Analysis

The CLI currently allows EXECUTE mode (which has 0 production tickets) but has no PLAY mode. VALID_MODES is a local const array that gates what mode values users can pass via `--mode`. Help text and docs reference EXECUTE. All must be updated for PLAY.

## Evidence Summary

- `src/tickets/create.ts:13`: VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]
- `src/tickets/create.ts:17`: Help text lists `--mode <AUTO|BUILD|FIX|RESEARCH|EXECUTE>`
- `src/tickets/index.ts:21,73`: Two usage strings reference mode options
- `src/docs/cli-content.ts:109,250`: Mode documentation text references EXECUTE
- CLI docs content is exported as a package export (`"./docs"` in package.json) and consumed by the client

## Success Criteria

1. `hlx tickets create --mode PLAY` is accepted by CLI validation
2. Help text shows PLAY instead of EXECUTE
3. CLI documentation content reflects PLAY
4. CLI passes typecheck and tests

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md Research Report | Primary spec for Level 1 | CLI needs VALID_MODES update and help text changes |
| scout/reference-map.json (CLI) | Identified files needing changes | 4 files; VALID_MODES is a local const |
| scout/scout-summary.md (CLI) | Confirmed scope | 3 files, 5 edit locations |
| src/tickets/create.ts | Verified mode handling | VALID_MODES at line 13, help text at line 17 |
