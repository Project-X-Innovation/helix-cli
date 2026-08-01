# Scout Summary — helix-cli

## Problem

The CLI must support MVP Play mode by accepting PLAY as a valid --mode value in ticket creation. This is the smallest change surface of the four repos — a thin client that validates mode strings locally and delegates platform restrictions to the server API.

## Analysis Summary

**L1 — Mode scaffolding (VALID_MODES update)**:

The entire change is in `src/tickets/create.ts`:
- Line 13: VALID_MODES array — replace EXECUTE with PLAY
- Line 17: Help text — update mode options display
- Lines 79-88: Mode validation normalizes to uppercase and checks includes()
- Line 147: Mode sent in POST body to `/api/tickets`

Plus `src/docs/cli-content.ts` line 109 for documentation.

The CLI has no platform-aware logic — it accepts any valid mode string and the server enforces PLAY is NetSuite-only. This means the CLI change is safe to deploy before or after the server change (server rejects unknown modes with 400).

**L2/L3 — Deferred**:

Future CLI extensions might include:
- `hlx plays list` — list play definitions
- `hlx plays preview <id>` — preview a play's read-only steps
- `hlx plays run <id>` — trigger play execution

These are out of MVP scope. The existing `hlx tickets create --mode PLAY` is sufficient for L1.

**Quality gates**: tsc (build), tsc --noEmit (typecheck), tsc + node --test (test). No linter configured. 6 test files exist but none test create.ts.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/tickets/create.ts` | VALID_MODES array, --mode flag, help text (L1) |
| `src/docs/cli-content.ts` | Mode documentation (L1) |
| `src/tickets/continue.ts` | --dry-run preview — mode-agnostic, no changes |
| `package.json` | Build/test/typecheck quality gates |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-702 research report) | Reuse audit identifies CLI as extensible | --mode EXECUTE extends to --mode PLAY pattern |
| src/tickets/create.ts | Verify VALID_MODES and mode validation | 5-value const tuple; uppercase normalize; mode optional |
| src/docs/cli-content.ts | Check documentation references | Line 109 documents mode values — must update |
