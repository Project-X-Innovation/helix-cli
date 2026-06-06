# Product Specification — Play Mode Foundation (L1)

## Problem Statement

When Helix generates a NetSuite automation (a query, transformation, or record operation), the user has no way to verify it matches their intent before it touches production data. Non-technical users cannot read SuiteQL or inspect logic directly. They need a concrete, visible proof that the automation does what they expect.

The broader vision is **canonical examples** — synthetic NetSuite records and expected outputs that demonstrate an automation's behavior. But the foundational prerequisite is a first-class ticket mode for composed record-level operations. Today, no such mode exists. The dead EXECUTE mode (0 of 854 production tickets, runtime-verified June 6, 2026) was designed for SDF code deployment and never adopted. There is no mode for preview-first, sandbox-first, composed record operations.

## Product Vision

Introduce **Play Mode** as a new first-class Helix ticket mode for NetSuite, replacing the dead EXECUTE mode. Play Mode is the foundation for a system where every Helix-generated automation can be proven correct via canonical examples before reaching production — giving users confidence that Helix understood their intent.

This ticket delivers **L1: Play Mode Foundation** — the pure plumbing that makes PLAY a valid, selectable, recognized mode across every Helix surface (web UI, CLI, MCP). L1 is a standalone deliverable that enables the compose-and-preview (L2) and run-and-monitor (L3) capabilities defined in the RSH-707 research report.

## Users

- **NetSuite administrators** — non-technical users who request automations and need to verify the results match their intent
- **Helix operators** — users creating and managing tickets via web UI, CLI, or MCP integrations

## Use Cases

1. **Create a Play ticket** — user selects Play mode when creating a ticket for a NetSuite record-level operation (as opposed to Build for SDF code or Research for investigation)
2. **See Play in the UI** — Play tickets show a distinct icon, label, and color in all views (list, detail, filter, picker)
3. **Create via CLI or MCP** — programmatic ticket creation accepts `mode: "PLAY"` and rejects `mode: "EXECUTE"`
4. **Platform restriction** — Play mode is available only for NetSuite organizations, not General or SMB platforms
5. **No accidental auto-assignment** — the mode classifier never auto-assigns Play; it must be explicitly chosen

## Core Workflow

1. User creates a ticket and selects **Play** as the mode (via web, CLI, or MCP)
2. System validates the mode is allowed for the user's organization platform (NetSuite only)
3. Ticket is created with a **PLY-** prefixed short ID and a `play/` branch type
4. Play ticket appears in all views with the correct icon, label, and green color
5. Orchestrator recognizes PLAY and skips SDF deploy phases (Play operates via NS-GM RESTlet, not SDF)

## Essential Features (MVP)

1. **PLAY as a first-class TicketMode** — added to the database enum alongside existing modes
2. **NetSuite-only restriction** — PLAY is allowed only for NetSuite organizations; other platforms get a clear error
3. **PLY- short ID prefix** — Play tickets use the `PLY-` prefix (e.g., PLY-42) for quick identification
4. **EXECUTE retirement from user-facing surfaces** — EXECUTE is removed from mode pickers, filters, validation schemas, CLI, and MCP tools (retained in DB enum for PostgreSQL parity)
5. **Orchestrator deploy guard integration** — PLAY tickets skip all SDF deploy phases
6. **Mode classifier exclusion** — the auto-classifier never assigns PLAY mode
7. **Consistent UI treatment** — Play icon (play-triangle SVG), "Play" label, green color across all components

## Features Explicitly Out of Scope (MVP)

- **Play step composition** (L2) — defining MAP/REDUCE/EFFECT step sequences
- **Sandbox preview execution** (L2) — running read-only steps against sandbox via NS-GM
- **Canonical example generation** (L2) — ns-gm generating synthetic sandbox records
- **PlayDefinition data model** (L2) — JSONB column for step definitions
- **Effect execution with governance** (L3) — production record operations with before/after images
- **Human approval flow** (L3) — explicit approval before Tier-3 irreversible operations
- **SSE real-time monitoring** (L3) — live step-by-step execution streaming
- **Audit trail** (L3) — ordered forward log with before/after images per step
- **Rollback engine** — inverse operations and compensating transactions
- **Idempotency keys** — preventing duplicate effect execution
- **Cross-account play templates** — reusable play definitions across organizations

## Success Criteria

1. User can create a PLAY ticket via web UI, CLI, and MCP — all three surfaces accept `mode: "PLAY"`
2. PLAY is restricted to NetSuite organizations — non-NetSuite orgs receive a clear error message
3. Play tickets display the PLY- prefix (e.g., `formatShortId("PLAY", 42)` returns "PLY-42")
4. Mode classifier never auto-assigns PLAY — ConcreteMode remains BUILD | FIX | RESEARCH
5. EXECUTE is gone from all user-facing surfaces — mode pickers, filters, MCP tools, CLI help text
6. PLAY tickets skip all three SDF deploy guards in the orchestrator
7. All quality gates pass across all three repos (typecheck, lint, tests)

## User Scenarios

[SCN-01] Create a Play ticket via web UI
- Precondition: User belongs to a NetSuite organization and is on the ticket creation page
- Action: User selects "Play" from the mode picker and submits the ticket
- Expected Outcome: Ticket is created with mode PLAY, a PLY-prefixed short ID, and appears in the ticket list with the Play icon and green color treatment

[SCN-02] Create a Play ticket via CLI
- Precondition: User has the Helix CLI installed and authenticated to a NetSuite organization
- Action: User runs `hlx tickets create --mode PLAY`
- Expected Outcome: Ticket is created successfully with mode PLAY and a PLY-prefixed short ID

[SCN-03] Create a Play ticket via MCP
- Precondition: MCP integration is configured for a NetSuite organization
- Action: External tool sends a create-ticket request with `mode: "PLAY"`
- Expected Outcome: API returns 201 with the created ticket showing mode PLAY

[SCN-04] Play mode rejected for non-NetSuite organization
- Precondition: User belongs to a General or SMB platform organization
- Action: User attempts to create a ticket with mode PLAY (via any surface)
- Expected Outcome: Request is rejected with a clear error indicating Play mode is only available for NetSuite organizations

[SCN-05] EXECUTE mode no longer selectable
- Precondition: User is on any ticket creation or mode selection surface
- Action: User looks for EXECUTE in the mode picker, CLI help, or MCP documentation
- Expected Outcome: EXECUTE does not appear as a selectable option on any surface

[SCN-06] Play ticket displays correctly in list view
- Precondition: A Play ticket exists in the system
- Action: User views the ticket list with no filters applied
- Expected Outcome: The Play ticket shows the Play icon (play-triangle), "Play" label, and green dot color, consistent with other mode treatments

[SCN-07] Filter tickets by Play mode
- Precondition: Multiple tickets exist with different modes including Play
- Action: User selects "Play" in the ticket filter bar
- Expected Outcome: Only Play mode tickets are shown in the filtered list

[SCN-08] Play ticket skips SDF deploy
- Precondition: A Play ticket is being processed by the orchestrator
- Action: Orchestrator evaluates deploy phases for the Play ticket
- Expected Outcome: All SDF deploy phases are skipped — Play operates via NS-GM RESTlet, not SDF code deployment

[SCN-09] Auto-classifier does not assign Play mode
- Precondition: User creates a ticket with mode AUTO, describing a record-level operation
- Action: The mode classifier analyzes the ticket to determine the concrete mode
- Expected Outcome: Classifier assigns BUILD, FIX, or RESEARCH — never PLAY. Play must be explicitly chosen by the user.

[SCN-10] Play ticket detail view shows correct mode
- Precondition: A Play ticket exists and user navigates to its detail page
- Action: User views the ticket detail page
- Expected Outcome: Mode is displayed as "Play" with the correct icon and color. Mode selector does not show EXECUTE.

## Key Design Principles

- **Preview First** — everything read-only is previewable; effects show projections with explicit limitation callouts (L2/L3 vision)
- **Sandbox First** — Plays run in sandbox with canonical examples before production (L2/L3 vision)
- **Explicit Intent** — Play mode must be explicitly chosen; effects never auto-execute
- **Log Everything** — every step's inputs and outputs are captured (L3 vision)
- **Incremental Delivery** — each level (L1, L2, L3) is independently useful, deployable, and testable

## Scope & Constraints

- **Three target repos**: helix-global-server (heaviest — Prisma migration, platform config, orchestrator, validation, tests), helix-global-client (~12 files replacing EXECUTE with PLAY), helix-cli (4 source files + 1 markdown)
- **library and helix-regression-testing**: context only, no code changes
- **EXECUTE retained in DB**: PostgreSQL does not support `ALTER TYPE DROP VALUE` — EXECUTE stays in the Prisma enum and exhaustive TypeScript Record maps but is removed from all application surfaces
- **Deploy order**: Server first, then CLI and Client (each independent after server)
- **No new data models in L1**: No new database tables, no new JSONB columns, no new API endpoints
- **NetSuite-only**: PLAY is added only to the NETSUITE platform config; GENERAL and SMB platforms are unchanged

## Future Considerations

- **L2: Compose & Preview** — PlayDefinition JSONB model, step editor UI, sandbox preview execution, canonical example generation via ns-gm
- **L3: Run & Monitor** — PlayExecution/PlayStepResult tables, governance envelope (before/after images), human approval for Tier-3 operations, SSE real-time monitoring
- **Rollback and reversibility** — inverse operation library based on RSH-702 reversibility tiers
- **Triggered automation** — scheduled or event-driven play execution
- **CLI play subcommands** — CLI support for compose/preview/run operations (L2/L3)

## Open Questions / Risks

| # | Question / Risk | Notes |
|---|----------------|-------|
| 1 | Which workflow steps should PLAY mode exclude? | RESEARCH excludes code-review, preview-config, demo. PLAYBOOK_CHECK excludes more. PLAY's exclusion set is a design decision for implementation. |
| 2 | Orchestrator deploy guard inconsistency at line 2606 | Uses `!isResearchMode` instead of `!isNonCodeMode`. Should this be fixed as part of adding `isPlayMode`? Risk of unintended behavior if left inconsistent. |
| 3 | Should goal-schemas DeciderOutput z.enum include PLAY? | Auto-classifier never returns EXECUTE, so semantics are similar. Implementation decision. |
| 4 | Is `skill-content/references/commands.md` (helix-cli) auto-generated? | If auto-generated, manual edits may be overwritten. |
| 5 | Canonical examples (L2) depend on ns-gm sandbox capabilities | Effectiveness of canonical examples depends on ns-gm's ability to generate realistic synthetic records. Not a risk for L1 but critical for the broader vision. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-725, library run root) | Ticket description and Research Report RSH-707 | Ticket frames canonical examples as the user-facing value; research report provides 3-level MVP spec (L1/L2/L3) with L1 as foundational plumbing |
| scout/scout-summary.md (helix-global-server) | Server-side file inventory and analysis | ~12 source files + 1 migration + 4 tests; deploy guard inconsistency at line 2606 identified |
| scout/scout-summary.md (helix-global-client) | Client-side file inventory and analysis | ~12 files; TicketMode is const object (not enum); play-triangle SVG reusable for PlayIcon |
| scout/scout-summary.md (helix-cli) | CLI file inventory and analysis | 4 source files + 1 markdown; VALID_MODES is plain string array; no test changes needed |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause and implementation surface | L1 is pure plumbing; EXECUTE dead (0/854 tickets); deploy guard inconsistency confirmed |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client change surface | Replace EXECUTE with PLAY across types, icons, platform config; PLAYBOOK_CHECK absent from client |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change surface | VALID_MODES is independently typed; no test changes needed |
| diagnosis/apl.json (helix-global-server) | Diagnosis questions and evidence | 5 questions answered with evidence; deploy guard structure confirmed |
| diagnosis/apl.json (helix-global-client) | Client diagnosis evidence | 3 questions answered; const object vs enum distinction confirmed |
| diagnosis/apl.json (helix-cli) | CLI diagnosis evidence | 2 questions answered; 0 test files reference EXECUTE |
| scout/reference-map.json (helix-global-server) | Detailed file-level change map | 14 files with line numbers; 4 unknowns about step exclusions and guard consistency |
| repo-guidance.json (library run root) | Repo intent classification | helix-global-server, helix-global-client, helix-cli as targets; library and helix-regression-testing as context |
| /tmp/helix-inspect/manifest.json | Runtime inspection availability | DATABASE and LOGS available for helix-global-server; not needed for product framing |
