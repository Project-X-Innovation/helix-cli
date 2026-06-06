# Diagnosis Statement — helix-cli

## Problem Summary

Replace EXECUTE with PLAY in CLI mode validation and documentation. The CLI accepts a `--mode` flag for ticket creation that validates against a VALID_MODES string array. Usage help strings and documentation content reference EXECUTE and must be updated to PLAY.

## Root Cause Analysis

This is the lightest change surface across the three target repos. VALID_MODES is a plain `string[]` constant, not typed against the server-side TicketMode enum, so it can be updated independently.

**Change surface**: 4 source files + 1 markdown file. No test changes.

**Key implementation considerations:**

1. **VALID_MODES** (create.ts:13): Replace `"EXECUTE"` with `"PLAY"` in the array.

2. **Usage help strings** (create.ts:17, index.ts:21,73): Replace `EXECUTE` with `PLAY` in the `--mode` option documentation shown to users.

3. **CLI documentation** (cli-content.ts:109,250): Mode table and example text reference EXECUTE. Replace with PLAY.

4. **Skill content markdown** (commands.md:119,128): Command signature and mode flag table reference EXECUTE. Replace with PLAY. Unknown whether this file is auto-generated — if so, it may be overwritten.

5. **No test changes**: None of the 6 existing test files reference EXECUTE or test mode validation.

## Evidence Summary

- **VALID_MODES**: `["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"]` at create.ts:13 (confirmed by probe)
- **Usage strings**: 3 strings across create.ts:17 and index.ts:21,73 show EXECUTE in mode option list (confirmed by probe)
- **No test coverage**: Scout confirmed 0 test files reference EXECUTE
- **Independent typing**: VALID_MODES is `string[]`, not typed against server TicketMode

## Success Criteria

1. `hlx tickets create --mode PLAY` is accepted
2. `hlx tickets create --mode EXECUTE` is rejected
3. All help/usage text shows PLAY instead of EXECUTE
4. Quality gates pass: `tsc`, `tsc --noEmit`, `node --test`

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-707) | Primary specification listing 2 CLI files | create.ts and cli-content.ts identified; actual scope is 4 source + 1 markdown |
| scout/reference-map.json (CLI) | File inventory with line numbers | 4 source files + 1 markdown; no test changes needed |
| scout/scout-summary.md (CLI) | Analysis summary | VALID_MODES is plain string array; independently updatable |
| src/tickets/create.ts:13 | Verify VALID_MODES content | Simple string array includes EXECUTE |
| src/tickets/index.ts:21,73 | Verify usage strings | 2 additional EXECUTE references not in research report |
