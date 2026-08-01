# Product: MVP NetSuite Play Mode — Level 1 "Speak the Language"

## Problem Statement

Helix builds, fixes, and researches — but it cannot run things. NetSuite users need operations that execute repeatedly against live data (e.g., matching invoices to payments weekly), not just one-time code deliverables. A broader "Play" concept — living, composed automations with a 3-phase pipeline (Ingress/Setup/Egress) — was designed to close this gap.

An EXECUTE mode was scaffolded early in the platform but never built out. Of 876 production tickets, zero have used EXECUTE. The platform literally cannot speak the vocabulary of the new play concept: there is no PLAY mode in the schema, no PLAY option in any UI or CLI surface, no PLY- prefix, and no play branch type.

Before any play authoring or execution logic can be built (Levels 2-5), the system must first recognize PLAY as a valid ticket mode across every surface.

## Product Vision

Level 1 makes the Helix ticket system "speak the language" of plays. A user on a NetSuite organization can select PLAY as a ticket mode when creating a ticket — in the web UI, the CLI, or the API. The unused EXECUTE mode disappears from all user-facing surfaces. This is the vocabulary foundation that all future play functionality (authoring, previewing, running, monitoring) will build on.

## Users

- **NetSuite organization members** who create Helix tickets via web UI or CLI. They gain a new PLAY mode option when creating tickets.
- **GENERAL and SMB organization members** are unaffected — PLAY is not available to them.
- **Helix platform developers** who will build play authoring and execution on top of this foundation in subsequent levels.

## Use Cases

1. A NetSuite user wants to create a ticket for a repeatable automation (e.g., weekly invoice matching). They need a mode that signals "this is an automation, not a code change."
2. A user filtering the ticket list wants to find play-type tickets quickly.
3. A CLI user creating a ticket programmatically needs `--mode PLAY` to work.
4. The system needs to prevent PLAY tickets from being auto-classified (plays are always intentional).
5. The system needs PLAY tickets to follow a non-code workflow path (skip code-review, preview-config, etc.).

## Core Workflow

1. User navigates to ticket creation (web UI or CLI).
2. User sees PLAY as a mode option (NetSuite orgs only).
3. User selects PLAY and submits the ticket.
4. System assigns a PLY-{n} short ID and creates a `helix/play/PLY-{n}-{slug}` branch.
5. Workflow treats PLAY as a non-code mode, excluding code-focused steps.

## Essential Features (MVP)

1. **PLAY mode in the data layer** — New `PLAY` value in the TicketMode enum with a database migration.
2. **PLY- ticket prefix and play branch naming** — PLAY tickets get PLY- prefixes and `play` branch types.
3. **API validation** — The ticket creation API accepts `PLAY` as a valid mode value.
4. **Platform gating** — PLAY is allowed only for NetSuite organizations; GENERAL and SMB are excluded.
5. **No auto-classification** — The mode classifier never assigns PLAY; it is user-selected only.
6. **Non-code workflow path** — PLAY is treated as a non-code mode in the workflow orchestrator, with appropriate step exclusions.
7. **Web UI mode selector** — PLAY appears in the mode selector with a dedicated icon and label.
8. **Web UI filter bar** — PLAY appears as a filterable mode option.
9. **CLI mode support** — `--mode PLAY` is accepted; help text updated.
10. **EXECUTE hidden from UI** — EXECUTE remains in the database schema (PostgreSQL constraint) but is removed from all user-facing selectors, help text, and documentation.

## Features Explicitly Out of Scope (MVP)

- **Play authoring/creation** (Level 2) — No play definition data model, no 3-phase pipeline generation.
- **Play execution/running** (Levels 3-5) — No Ingress/Setup/Egress pipeline runner.
- **Play preview or monitoring UI** — No data artifact viewing, no run history.
- **Shape enforcement/gates** — No shape validation logic.
- **Egress scripts or deterministic actions** — No record updates, email sends, or HTTP posts.
- **Canonical examples** — Explicitly deferred per stakeholder direction (PDF attachment).
- **Removing EXECUTE from Prisma enum** — PostgreSQL does not support easy enum value removal; EXECUTE stays in the schema.
- **Syncing client TicketMode with server for PLAYBOOK_CHECK** — Secondary concern, not part of this ticket's scope.

## Success Criteria

1. `PLAY` exists in the Prisma TicketMode enum with a deployed database migration.
2. Creating a PLAY ticket via API produces a `PLY-{n}` short ID and `helix/play/PLY-{n}-{slug}` branch.
3. PLAY appears in the web UI mode selector and filter bar for NetSuite organizations only.
4. PLAY does NOT appear for GENERAL or SMB organizations.
5. The mode classifier never auto-classifies a ticket as PLAY.
6. PLAY is treated as a non-code mode in the workflow orchestrator (code-review, preview-config, and other code-focused steps are excluded).
7. CLI accepts `--mode PLAY` and shows PLAY in help text.
8. All three repos (server, client, CLI) pass typecheck, lint, and tests.
9. EXECUTE is hidden from all user-facing mode selectors, help text, and documentation.

## User Scenarios

[SCN-01] Select PLAY mode when creating a ticket in web UI
- Precondition: User is logged in to a NetSuite organization and is on the ticket creation page
- Action: User clicks on the PLAY mode option in the mode selector
- Expected Outcome: PLAY mode is selected and highlighted; the ticket can be submitted with PLAY mode

[SCN-02] PLAY mode is hidden for non-NetSuite organizations
- Precondition: User is logged in to a GENERAL or SMB organization and is on the ticket creation page
- Action: User views the available mode options
- Expected Outcome: PLAY does not appear in the mode selector; only modes allowed for that platform are shown

[SCN-03] PLAY ticket receives PLY- prefix
- Precondition: User has submitted a new ticket with PLAY mode selected
- Action: System processes the ticket creation
- Expected Outcome: The ticket's short ID begins with `PLY-` (e.g., PLY-42) and the branch name follows the `helix/play/PLY-{n}-{slug}` pattern

[SCN-04] Filter tickets by PLAY mode
- Precondition: User is on the ticket list view and at least one PLAY ticket exists
- Action: User selects PLAY from the mode filter dropdown
- Expected Outcome: Only PLAY tickets are shown in the filtered list

[SCN-05] Create a PLAY ticket via CLI
- Precondition: User has the Helix CLI installed and is authenticated to a NetSuite organization
- Action: User runs `hlx tickets create --mode PLAY` with a valid ticket description
- Expected Outcome: A PLAY ticket is created successfully with a PLY- prefix

[SCN-06] CLI help text shows PLAY mode
- Precondition: User has the Helix CLI installed
- Action: User runs `hlx tickets create --help`
- Expected Outcome: Help text lists PLAY as an available mode option

[SCN-07] PLAY is never auto-classified
- Precondition: User creates a ticket with `--mode AUTO` and a description that could imply automation
- Action: System runs mode classification
- Expected Outcome: The ticket is classified as BUILD, FIX, or RESEARCH — never PLAY

[SCN-08] PLAY ticket follows non-code workflow path
- Precondition: A PLAY ticket has been created and begins processing
- Action: The workflow orchestrator selects steps for the ticket
- Expected Outcome: Code-focused steps (code-review, preview-config, etc.) are excluded from the workflow

[SCN-09] EXECUTE mode is no longer selectable
- Precondition: User is logged in to any organization and is on the ticket creation page
- Action: User views the available mode options
- Expected Outcome: EXECUTE does not appear in the mode selector

[SCN-10] PLAY ticket created via API with valid payload
- Precondition: API consumer sends a POST to the ticket creation endpoint with `mode: "PLAY"` for a NetSuite organization
- Action: Server validates and processes the request
- Expected Outcome: Ticket is created with PLAY mode, PLY- prefix, and 201 response

## Key Design Principles

1. **Vocabulary before machinery** — Establish the mode across all surfaces before building any play execution logic.
2. **Pattern replication** — PLAY follows the exact pattern used by PLAYBOOK_CHECK: Prisma enum addition, exhaustive Record maps, platform gating, Zod validation, step exclusion set.
3. **Least disruption** — EXECUTE stays in the schema but is removed from UI surfaces. No data migration needed for existing records.
4. **Platform-native gating** — PLAY is NetSuite-only because plays are NetSuite-native by design.

## Scope & Constraints

- **Three repos changed**: helix-global-server (primary — schema, API, workflow), helix-global-client (UI surfaces), helix-cli (CLI validation and help).
- **library repo**: No changes — documentation/ticket-tracking only.
- **Deploy order**: Server first (schema migration + API), then client and CLI.
- **PostgreSQL constraint**: Cannot remove EXECUTE from the enum; it remains in the schema but is hidden from all user-facing surfaces.
- **Client TicketMode sync gap**: The client's TicketMode const is manually maintained and already lacks PLAYBOOK_CHECK. This ticket adds PLAY; the PLAYBOOK_CHECK gap is a separate concern.

## Future Considerations

- **Level 2 — "Author the Play"**: Play data model with phase configurations, 3-phase definition generation from ticket description, play status lifecycle (DRAFT/READY).
- **Level 3 — "Watch It Think"**: Live play execution with Ingress/Setup phases, data artifact capture, shape gate enforcement.
- **Level 4 — "Prove It Works"**: Dry-run/preview of Egress phase, showing what would happen before committing.
- **Level 5 — "Run It Live"**: Full end-to-end play execution including deterministic Egress (NetSuite record updates, emails, HTTP posts), audit trail, monitoring.
- **Post-execution verification**: A fourth pipeline step where an agent confirms NetSuite updates were successful (mentioned in stakeholder PDF).
- **Promoting agent-generated artifacts**: Graduating proven queries/logic from agent-generated to locked-in static artifacts.

## Open Questions / Risks

| # | Question / Risk | Notes |
|---|----------------|-------|
| 1 | What specific steps should PLAY exclude in its step-exclusion set? | Level 1 can mirror PLAYBOOK_CHECK's exclusions or define its own. Needs decision during implementation. |
| 2 | Should client TicketMode also add PLAYBOOK_CHECK while adding PLAY? | Client is already out of sync with server (missing PLAYBOOK_CHECK). Adding it alongside PLAY is low-risk but technically a separate concern. |
| 3 | What icon should PLAY use? | ExecuteIcon is a play-button triangle SVG. PLAY needs a distinct icon to differentiate from the hidden EXECUTE. Design decision needed. |
| 4 | Migration timestamp sequencing | Latest migration is 20260607000000. PLAY migration needs a timestamp after this. Must coordinate with any other in-flight migrations. |
| 5 | EXECUTE mode in filter bar and ticket list | Existing EXECUTE filter option should be removed from UI, but if any EXECUTE tickets existed in DB they would become unfilterable. Risk is negligible (0 EXECUTE tickets exist). |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report) | Primary specification for the 5-level roadmap and Level 1 scope | Level 1 adds PLAY mode across all surfaces, replaces EXECUTE, NetSuite-only, user-selected only, PLY- prefix |
| PDF attachment (Untitled document) | Stakeholder vision for play anatomy | 3-phase pipeline (Ingress/Setup/Egress) with shape gates; canonical examples deferred; confirms Level 2+ scope |
| scout/scout-summary.md (server) | Identified server as primary target with all files needing changes | Prisma enum, exhaustive Record maps, platform gating, Zod validation, mode classifier, orchestrator, step exclusions |
| scout/scout-summary.md (client) | Identified client UI surfaces needing changes | TicketMode const, mode icons, mode selector, filter bar, platform config, format utilities, CLI docs content |
| scout/scout-summary.md (CLI) | Identified CLI files needing changes | VALID_MODES local const, help text at 3 locations, CLI docs content shared with client |
| scout/scout-summary.md (library) | Confirmed library needs no changes | Documentation/ticket-tracking repo only |
| diagnosis/diagnosis-statement.md (server) | Root cause and evidence for server changes | 8 files with precise line-level changes; PLAYBOOK_CHECK pattern confirmed; migration sequencing clarified |
| diagnosis/diagnosis-statement.md (client) | Root cause and evidence for client changes | 7 files; manually maintained TicketMode; executeMode capability pattern |
| diagnosis/diagnosis-statement.md (CLI) | Root cause and evidence for CLI changes | 4 files; VALID_MODES is a local const; CLI docs exported to client |
| repo-guidance.json | Repo intent classification | server=target, client=target, CLI=target, library=context |
