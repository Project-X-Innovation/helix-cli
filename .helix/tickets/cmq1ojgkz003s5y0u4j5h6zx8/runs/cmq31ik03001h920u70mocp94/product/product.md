# Product Specification — MVP NetSuite Play Mode (helix-cli)

## Problem Statement

The Helix CLI accepts five ticket modes: AUTO, BUILD, FIX, RESEARCH, and EXECUTE. EXECUTE has zero production usage (0 of 872 tickets). Users need to be able to create Play tickets from the CLI, replacing EXECUTE with PLAY as a valid mode string.

## Product Vision

Accept **PLAY** as a valid `--mode` value when creating tickets via the CLI. The CLI validates mode strings locally and delegates platform enforcement (NetSuite-only gating) to the server API. This is the smallest change surface across all repos.

## Users

- **Helix CLI users** who create tickets via `hlx tickets create --mode PLAY`
- **Helix skill users** (Claude Code, etc.) where the CLI is invoked programmatically

## Use Cases

1. **Create a Play ticket from CLI** — User runs `hlx tickets create --mode PLAY` with a description
2. **See valid modes in help** — `hlx tickets create --help` shows PLAY as a valid mode option

## Core Workflow

1. User runs `hlx tickets create --mode PLAY --description "..."` 
2. CLI validates PLAY against VALID_MODES (local validation)
3. CLI sends `mode: "PLAY"` in POST body to server API
4. Server enforces platform gating (NetSuite-only)

## Essential Features — MVP Levels

### MVP-1: Mode String Update (this ticket)

- Replace EXECUTE with PLAY in VALID_MODES array
- Update help text to show PLAY instead of EXECUTE
- Update documentation content (skill docs, command reference)
- Case-insensitive validation preserved (play, Play, PLAY all work)

### Future Levels (deferred)

- Play-specific CLI subcommands (`hlx plays list`, `hlx plays run`, `hlx plays status`)
- Play execution trigger from CLI

## Features Explicitly Out of Scope (MVP)

| Feature | Why deferred |
|---------|-------------|
| Play-specific subcommands | Future tickets; not needed for mode selection |
| Play execution from CLI | Requires server MVP-3/4 orchestration first |
| Play status/monitoring | Requires server execution models first |

## Success Criteria

### MVP-1
1. `hlx tickets create --mode PLAY` succeeds (with server deployed first)
2. `hlx tickets create --mode EXECUTE` rejected by CLI validation
3. Help text shows PLAY, not EXECUTE
4. Mode is case-insensitive (play, Play, PLAY all accepted)
5. Quality gates pass (build, typecheck, test)

## User Scenarios

[SCN-01] Create a Play ticket via CLI
- Precondition: User has the Helix CLI installed and authenticated; server is deployed with PLAY support
- Action: User runs `hlx tickets create --mode PLAY --description "monthly invoice reconciliation"`
- Expected Outcome: Ticket created successfully with Play mode

[SCN-02] CLI rejects EXECUTE mode
- Precondition: CLI updated with PLAY replacing EXECUTE
- Action: User runs `hlx tickets create --mode EXECUTE`
- Expected Outcome: CLI rejects with error listing valid modes (AUTO, BUILD, FIX, RESEARCH, PLAY)

[SCN-03] CLI help shows PLAY as valid mode
- Precondition: CLI is updated
- Action: User runs `hlx tickets create --help`
- Expected Outcome: Help text lists PLAY (not EXECUTE) in the mode options

[SCN-04] Case-insensitive mode input
- Precondition: CLI is updated
- Action: User runs `hlx tickets create --mode play`
- Expected Outcome: Mode is normalized to PLAY and accepted

## Key Design Principles

1. **Thin client** — CLI validates mode strings locally; platform enforcement is server-side
2. **Backward compatible** — EXECUTE removal is safe (0 production usage confirmed via runtime)
3. **Deploy after server** — Server must recognize PLAY before CLI sends it

## Scope and Constraints

- **Deployment order**: Server must deploy first; CLI sends mode in POST body to server API
- **3-5 files changed**: VALID_MODES, help text, docs content
- **No new commands**: Only the existing `create` command is updated

## Future Considerations

- Play-specific subcommands (`hlx plays list`, `hlx plays run`)
- Play status and monitoring commands
- Play template creation from CLI

## Open Questions / Risks

| # | Question / Risk | Context |
|---|----------------|---------|
| 1 | Deployment coordination — if CLI deploys before server, `--mode PLAY` is rejected by server Zod validation | Server must deploy first |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (description) | Primary spec | Plays replace EXECUTE; created via ticket system |
| scout/scout-summary.md (CLI) | CLI analysis | 3-5 files; VALID_MODES array; case-insensitive; server enforces platform |
| diagnosis/diagnosis-statement.md (CLI) | CLI changes | Replace EXECUTE with PLAY in 3-5 files; deploy after server |
| repo-guidance.json | Cross-repo intent | CLI is target with smallest surface |
