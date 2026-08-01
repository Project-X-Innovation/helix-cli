# Scout Summary — helix-cli

## Problem

Accept PLAY as a valid `--mode` value when creating tickets via the CLI. Smallest change surface of the four repos — the CLI validates mode strings locally and delegates platform enforcement (NetSuite-only) to the server API.

## Analysis Summary

### What Exists Today

`src/tickets/create.ts` defines:
- `VALID_MODES = ["AUTO", "BUILD", "FIX", "RESEARCH", "EXECUTE"] as const` (line 13)
- Help text: `--mode <AUTO|BUILD|FIX|RESEARCH|EXECUTE>` (line 17)
- Mode normalization: case-insensitive, uppercased (line 82)
- Mode validation: checked against VALID_MODES, error if invalid (lines 83-86)
- Mode sent to server API in POST body (line 147)

Platform restrictions (NETSUITE-only for PLAY) are enforced server-side. The CLI just validates the string.

### Changes Needed

**Foundation level**: Add "PLAY" to VALID_MODES and update help text. That's it for basic mode support.

**Documentation**: `skill-content/SKILL.md` and `skill-content/references/commands.md` reference valid modes and need updating.

**Future levels**: Play-specific CLI commands (run a play, check play status) could be added at later MVP levels but are not needed initially.

### Quality Gates

- Build: `npm run build` (tsc)
- Typecheck: `npm run typecheck` (tsc --noEmit)
- Test: `npm run test` (compile + node test runner)

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/tickets/create.ts` | VALID_MODES + help text — add PLAY |
| `src/tickets/continue.ts` | --dry-run flag — possible play preview leverage |
| `skill-content/SKILL.md` | Skill docs — update mode list |
| `skill-content/references/commands.md` | Command reference — update --mode docs |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md Description | Ticket definition | Plays replace execute; created via ticket system |
| src/tickets/create.ts | Current mode handling | VALID_MODES has 5 values; case-insensitive; server-side platform enforcement |
| skill-content/SKILL.md | Skill documentation | References valid modes in help text |
| repo-guidance.json | Cross-repo intent | CLI is target with smallest surface — deploy after server |
