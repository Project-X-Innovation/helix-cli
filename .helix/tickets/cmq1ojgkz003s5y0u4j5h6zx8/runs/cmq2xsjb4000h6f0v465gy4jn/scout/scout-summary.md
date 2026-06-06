# Scout Summary — helix-cli

## Problem

The CLI must accept PLAY as a valid `--mode` value in ticket creation. The CLI is a thin client — it validates mode strings locally and delegates platform restrictions to the server API. Smallest change surface of the four repos.

## Analysis Summary

### L1 — Mode Wire-Up
Two changes in `src/tickets/create.ts`:
1. Add `"PLAY"` to the `VALID_MODES` array (line 13)
2. Update help text to include PLAY in `--mode` flag options (line 17)

Mode validation is case-insensitive (normalized to uppercase at line 82). Platform enforcement (NETSUITE-only) is server-side, so no gating logic needed in the CLI.

### L3+ — Play-Specific CLI Commands
At higher MVP levels, the CLI might need:
- Play execution commands (run a play by ID)
- Play status/monitoring commands
- Play definition inspection

These are future considerations. L1 is the only change needed now.

### Documentation
The CLI bundles skill documentation (`skill-content/SKILL.md`, `skill-content/references/commands.md`) that references valid modes. L1 should update these to include PLAY.

### Quality Gates
- Build: `npm run build` (tsc)
- Typecheck: `npm run typecheck`
- Test: `npm run test` (compile + node test runner)

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/tickets/create.ts` | VALID_MODES + help text — add PLAY (L1) |
| `src/tickets/index.ts` | Ticket subcommand dispatcher (context) |
| `src/tickets/continue.ts` | Ticket continuation — possible play behavior (L3+) |
| `skill-content/SKILL.md` | Skill documentation — update mode list (L1) |
| `skill-content/references/commands.md` | Command reference — update --mode docs (L1) |
| `package.json` | Build/test/typecheck scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Description) | Ticket definition | Plays replace execute; created via ticket system |
| src/tickets/create.ts | Current mode validation | VALID_MODES has 5 values; case-insensitive; server-side platform enforcement |
| skill-content/SKILL.md | Bundled skill docs | References valid modes — needs update |
| skill-content/references/commands.md | CLI reference | --mode flag documentation |
