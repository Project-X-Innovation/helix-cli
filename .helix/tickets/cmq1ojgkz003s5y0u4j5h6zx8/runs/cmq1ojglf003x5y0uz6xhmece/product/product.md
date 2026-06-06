# Product: MVP NetSuite Play Mode

## Problem Statement

Helix has no mode for governed, previewable, auditable NetSuite record-level operations. The existing EXECUTE mode was designed for SDF code deployment, not direct record CRUD — and has never been used (0 out of 846 production tickets). Users who need to perform composable NetSuite operations (query data, transform it, create/update records) have no structured way to do so within the Helix ticket system.

The RSH-702 feasibility report confirms conditional feasibility for a Play mode, identifying 6 reusable infrastructure components and 9 net-new capabilities. MVP focuses on the mode scaffolding: making PLAY a first-class ticket mode so plays can be created, routed, and processed through the existing Helix workflow.

## Product Vision

A **Play** is a composable sequence of:
- **SuiteQL queries** (map) — read data from NetSuite
- **Agent prompts, read-only scripts, or further agent calls** (reduce) — transform the data
- **Outputs/effects** (apply) — CRUD on records, external API calls, emails, or messages

Plays run first in sandbox with canonical examples. Read-only steps (queries, transforms) are fully previewable. Write effects require explicit human approval. Everything is logged and monitored end-to-end.

MVP establishes the mode scaffolding so users can create PLAY tickets through the normal Helix ticket system (web UI, CLI, MCP tools). The governance engine, rollback capabilities, and advanced preview are future work building on this foundation.

## Users

- **Helix operators** who need to perform structured NetSuite record operations (create invoices, update fields, void transactions) with safety and auditability
- **NetSuite administrators** who want composable, repeatable operational workflows with sandbox validation before production execution

## Use Cases

1. Create a PLAY ticket to define a governed NetSuite record operation
2. View PLAY tickets alongside other ticket modes in the dashboard
3. Select PLAY mode when creating tickets for NetSuite organizations
4. Use the CLI to create PLAY tickets with `--mode PLAY`

## Core Workflow

1. User creates a new ticket and selects **Play** mode (web UI, CLI, or MCP)
2. System validates that PLAY is only available for NetSuite-platform organizations
3. Ticket receives a PLY-prefix short ID and enters the Helix workflow
4. Ticket flows through the standard Helix workflow steps (scout, diagnosis, etc.) with PLAY-appropriate step selection
5. PLAY is never auto-classified — it must be explicitly selected by the user

## Essential Features (MVP)

1. **PLAY as a first-class TicketMode** — new Prisma enum value, recognized across the full mode system
2. **NetSuite-only restriction** — PLAY is available only for NetSuite-platform organizations (same constraint as EXECUTE had)
3. **Explicit-only mode selection** — PLAY is never auto-assigned by the mode classifier; users must choose it intentionally
4. **ID prefix and branch segment** — PLAY tickets get a `PLY-` short ID prefix and `play` branch segment
5. **Step selection for PLAY** — PLAY mode resolves appropriate workflow steps (excluding SDF deploy, preview-config, demo)
6. **UI mode selection** — Play mode appears in the ticket creation mode picker with a play-triangle icon and "Play" label
7. **CLI support** — `--mode PLAY` accepted in ticket creation
8. **MCP tool support** — create-ticket and update-ticket MCP tools accept PLAY
9. **EXECUTE retirement** — EXECUTE removed from all user-facing surfaces (UI, CLI, API validation, platform config) while kept in DB enum for safety

## Features Explicitly Out of Scope (MVP)

- NS-GM RESTlet governance envelope (before-image capture, operation-type tagging, write audit logging)
- Rollback engine and inverse library
- Forward log and idempotency keys
- Production dry-run preview (in-memory projection, transform-chain preview)
- Write-operation audit model (extending InspectionAuditLog)
- Concurrency/drift detection via dateLastModified
- Play composition editor UI
- Execution log viewer UI
- Triggered/automated play execution (Rung 2)
- Tier-2 promotion flywheel
- New Prisma models (PlayExecution, ForwardLog, BeforeImage)
- Quarantined-save or draft state mechanisms

## Success Criteria

1. A user can create a PLAY ticket via web UI, CLI (`--mode PLAY`), or MCP tools
2. PLAY is restricted to NetSuite-platform organizations; non-NetSuite orgs get a validation error
3. PLAY tickets display the correct icon and "Play" label throughout the UI
4. PLAY is never auto-classified by the mode classifier
5. PLAY tickets receive a PLY-prefixed short ID (e.g., PLY-42)
6. EXECUTE no longer appears in any user-facing surface (mode picker, CLI help, MCP schemas)
7. All existing tests, type checks, and lint pass with the PLAY additions
8. PLAY tickets flow through the Helix workflow with appropriate step selection

## User Scenarios

[SCN-01] Create a Play ticket via web UI
- Precondition: User is logged in to a NetSuite-platform organization
- Action: User clicks "New Ticket", selects Play mode from the mode picker, enters a title and description, and submits
- Expected Outcome: A new ticket is created with PLAY mode, showing a PLY-prefixed short ID and play-triangle icon in the ticket list

[SCN-02] Create a Play ticket via CLI
- Precondition: User has the Helix CLI installed and authenticated
- Action: User runs `hlx tickets create --mode PLAY --title "Create monthly invoices"`
- Expected Outcome: The CLI accepts the command, creates a PLAY ticket, and displays the PLY-prefixed ticket ID

[SCN-03] Play mode restricted to NetSuite organizations
- Precondition: User is logged in to a non-NetSuite organization
- Action: User attempts to create a ticket with PLAY mode
- Expected Outcome: The system rejects the request with a clear error indicating PLAY mode is only available for NetSuite organizations

[SCN-04] View a Play ticket in the ticket detail view
- Precondition: A PLAY ticket exists in the system
- Action: User navigates to the ticket detail page
- Expected Outcome: The ticket displays the play-triangle icon, "Play" label, and all standard ticket information

[SCN-05] Play mode not auto-assigned
- Precondition: User creates a ticket with mode set to AUTO
- Action: The mode classifier processes the ticket
- Expected Outcome: The classifier assigns BUILD, FIX, or RESEARCH — never PLAY. PLAY requires explicit user selection

[SCN-06] Execute mode no longer visible
- Precondition: User is logged in to a NetSuite-platform organization
- Action: User opens the ticket creation mode picker
- Expected Outcome: The mode picker shows AUTO, BUILD, FIX, and Play. EXECUTE does not appear

[SCN-07] Play ticket appears in pending approval list
- Precondition: A PLAY ticket reaches the approval stage
- Action: A reviewer views the pending approvals list
- Expected Outcome: The PLAY ticket appears with the play-triangle icon and correct mode label

[SCN-08] Create a Play ticket via MCP tools
- Precondition: MCP client is connected to the Helix server
- Action: Client calls the create-ticket MCP tool with `mode: "PLAY"`
- Expected Outcome: The MCP tool accepts PLAY as a valid mode value and creates the ticket

[SCN-09] CLI help shows Play mode
- Precondition: User has the Helix CLI installed
- Action: User runs the help command for ticket creation
- Expected Outcome: Help text lists PLAY as a valid mode option and does not list EXECUTE

[SCN-10] Play ticket gets correct branch name
- Precondition: A PLAY ticket is created
- Action: The system generates the branch name for the ticket
- Expected Outcome: The branch name contains the `play` segment (e.g., `helix/play/PLY-42-...`)

## Key Design Principles

- **Scaffolding first**: MVP establishes the mode system foundation. Governance, preview, and execution engine are layered on in follow-up tickets
- **Replace, don't accumulate**: EXECUTE is retired from all surfaces (zero usage), not preserved alongside PLAY
- **NetSuite-only by design**: PLAY is platform-specific, enforced at both API and UI levels
- **Explicit intent**: PLAY is never auto-assigned — users must consciously opt into governed record operations
- **Reuse existing patterns**: Approval gates, credential management, audit patterns, and platform config all extend naturally to support PLAY

## Scope & Constraints

- **Three repos changed**: helix-global-server (heaviest — Prisma migration + ~10 files), helix-global-client (~5 files), helix-cli (1 file)
- **Library is context-only**: Contains RSH-702 research report and RSH-411 playbook design as specifications; no code changes
- **Prisma migration required**: `ALTER TYPE "TicketMode" ADD VALUE 'PLAY'` — non-blocking, no data migration needed
- **Concurrent development**: BLD-679 (playbook-ui-polish) is actively deploying; no schema conflict expected since it's UI polish, not schema changes
- **EXECUTE kept in DB**: The enum value remains in PostgreSQL for safety but is hidden from all application surfaces

## Future Considerations

- **Governance envelope** (RSH-702 Condition 1): Before-image capture and write audit logging on the NS-GM RESTlet before any production writes
- **Play composition UI**: Editor for defining play steps (SuiteQL queries, transforms, effects) with input/output measurement
- **Sandbox canonical examples**: Running plays against sample data in sandbox with actual output display (ticket description item 3)
- **Preview for read-only steps**: Everything besides outputs/effects is read-only and previewable (ticket description item 4)
- **Output/effect preview**: Strategy for previewing or demonstrating comfort with write effects (ticket description item 5)
- **Execution engine**: Actually running play operations through the NS-GM RESTlet with governance
- **Rollback and inverse library**: Per-operation undo capability based on the 3-tier reversibility model from RSH-702
- **Triggered automation**: Rung 2 scheduled/event-driven play execution with circuit-breaker limits

## Open Questions / Risks

| # | Question / Risk | Status |
|---|----------------|--------|
| 1 | Whether PLAY step selection should mirror BUILD (minus SDF deploy) or have its own unique step set | Diagnosis recommends excluding SDF deploy, preview-config, and demo — needs confirmation during implementation |
| 2 | Exact PLY prefix — should it be PLY or PLAY or another abbreviation? | Diagnosis proposes PLY; final choice during implementation |
| 3 | Concurrent migration ordering with BLD-679 if it introduces schema changes | Low risk — BLD-679 is UI polish, no schema conflict observed. Timestamp-based Prisma migration ordering handles this |
| 4 | Whether EXECUTE should be kept as a ModeIcon fallback for any edge-case historical rendering | Zero EXECUTE tickets exist; diagnosis says no backward-compat needed but implementation should verify |
| 5 | How Play mode interacts with the environment resolution (sandbox vs production credentials) | Currently all non-scout/diagnosis steps route to SANDBOX — suitable for MVP sandbox-only scope |
| 6 | BLD-634 (direct production deploy) convergence with Play mode approval gates | BLD-634 artifacts not accessible for analysis; directToProductionEnabled flag exists but deep adjacency is unknown |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (RSH-702 research report) | Primary specification for Play mode | CONDITIONAL GO; 3 dry-run mechanisms; 12 action-inverse pairs; 6 reusable + 9 net-new components; NS-GM RESTlet is the governance chokepoint |
| scout/scout-summary.md (library) | Specification hub context | Library provides RSH-702 and RSH-411 design constraints; no code changes needed |
| scout/scout-summary.md (helix-global-server) | Server mode system surface area | TicketMode threads through 11+ files; EXECUTE unused (0 tickets); NS-GM governance gap identified |
| scout/scout-summary.md (helix-global-client) | Client mode system mapping | TicketMode mirrors server; ExecuteIcon play-triangle fits PLAY semantics; approval infrastructure reusable |
| scout/scout-summary.md (helix-cli) | CLI change surface | Single-file change (VALID_MODES array + help text); thin client delegates enforcement to server |
| scout/reference-map.json (library) | File inventory and unknowns | 2 key files (RSH-411, RSH-702); BLD-677 artifacts not materialized |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause and migration strategy | Add PLAY to enum; keep EXECUTE in DB; ~10 files changed; MVP is mode scaffolding only |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client change plan | Replace EXECUTE with PLAY across 5 files; reuse ExecuteIcon play-triangle; no new UI components |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change plan | Replace EXECUTE with PLAY in VALID_MODES; single-file change |
| diagnosis/apl.json (helix-global-server) | Detailed Q&A on scope decisions | MVP = scaffolding only; 9 net-new capabilities deferred; EXECUTE retirement safe (0 usage) |
| diagnosis/apl.json (helix-global-client) | Client design decisions | Reuse play-triangle icon; PLAY replaces EXECUTE in all labels; no new UI elements for MVP |
| diagnosis/apl.json (helix-cli) | CLI design decisions | Replace EXECUTE with PLAY in VALID_MODES; no new subcommands for MVP |
| repo-guidance.json | Repo intent classification | library=context, server=target (heaviest), client=target (moderate), cli=target (minimal) |
