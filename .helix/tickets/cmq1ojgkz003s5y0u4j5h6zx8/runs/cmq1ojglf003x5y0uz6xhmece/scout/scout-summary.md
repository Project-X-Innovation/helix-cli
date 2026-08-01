# Scout Summary — helix-cli

## Problem

The CLI must support MVP Play mode by accepting PLAY as a valid --mode value in ticket creation. This is the smallest change surface of the four repos.

## Analysis Summary

**Mode flag surface**: The VALID_MODES array (create.ts line 13) is a string literal tuple of 5 values. The --mode flag (lines 79-88) normalizes input to uppercase and validates against this array. Help text (line 17) documents the options inline. Adding PLAY requires updating the array, help text, and any corresponding type.

**Minimal change**: The CLI is a thin client — it validates mode locally then passes it to the server API. The server enforces platform-specific mode restrictions. The CLI change is adding one value to a string tuple.

**Quality gates**: tsc (build), tsc --noEmit (typecheck), tsc + node --test (test). No linter configured.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/tickets/create.ts` | VALID_MODES array, --mode flag, help text |
| `src/tickets/continue.ts` | --dry-run preview (context only, unlikely to change) |
| `package.json` | Build/test/typecheck scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-702 research report) | Reuse audit identifies CLI as extensible | --mode EXECUTE extends to --mode PLAY pattern |
| src/tickets/create.ts | Verify VALID_MODES and --mode flag | 5-value string tuple; uppercase normalization; mode is optional |
