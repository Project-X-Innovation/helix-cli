# Product: MVP NetSuite Play Mode

## Problem Statement

Helix users who need to perform NetSuite record-level operations — querying data, transforming it, creating invoices, updating fields, voiding transactions — have no structured, safe way to do this. The EXECUTE mode exists in name only (0 of 852 production tickets), because it was designed for SDF code deployment, not direct record operations.

Users resort to manual NetSuite work or ad-hoc scripts with no preview, no audit trail, no rollback, and no ability to compose steps or measure inputs and outputs. There is no path from "I want to create 50 invoices from these sales orders" to a governed, repeatable, previewable operation.

## Product Vision

A **Play** replaces EXECUTE as a first-class Helix ticket mode. A Play is a composed sequence of steps:

- **Map** — SuiteQL queries that read data from NetSuite
- **Reduce** — AI agent prompts, read-only scripts, or further agent calls that transform the data
- **Effect** — outputs that change state: CRUD on records, external API calls, emails, or messages

Each step's inputs and outputs are measurable and monitorable. Plays run first in sandbox with canonical examples. Everything besides effects is read-only and fully previewable. Effects require explicit approval. Everything is logged.

This ships as **three incremental MVP levels** — each level is usable on its own and builds on the previous:

| Level | What the user gets | Ticket items |
|-------|-------------------|--------------|
| **L1 — Play Mode** | Create Play tickets through Helix (web, CLI, MCP). PLAY replaces dead EXECUTE mode. | 1, 7-partial |
| **L2 — Compose & Preview** | Define play steps. Run read-only steps in sandbox with canonical examples. Preview query results and transform outputs. | 2, 3, 4 |
| **L3 — Run & Monitor** | Execute plays. Preview effects via in-memory projection. Full audit trail, monitoring, and governed output. | 5, 6, 7-full |

## Users

- **NetSuite operators** — need to perform structured record operations (batch invoicing, field updates, transaction voids) with safety, repeatability, and auditability
- **NetSuite administrators** — want composable workflows validated in sandbox before production, with clear visibility into what will change
- **Helix platform users** — interact with Play mode through ticket creation, preview panels, and run controls in web UI, CLI, and MCP

## Use Cases

1. **Create a governed operation** — user creates a Play ticket to define a multi-step NetSuite operation with composed map/reduce/effect steps
2. **Validate in sandbox first** — user runs a play against canonical sample data in sandbox and reviews actual outputs before approving production
3. **Preview before committing** — user sees SuiteQL results, transform outputs, and in-memory projections of effects before any record is touched
4. **Execute with confidence** — user runs a play with full logging, knowing every step's input/output is captured and monitored
5. **Demonstrate comfort on effects** — even irreversible effects show what will happen (projected record state, affected records, known side effects) before requiring human approval

## Core Workflow

### L1 — Play Mode

1. User creates a ticket and selects **Play** mode (web UI, CLI `--mode PLAY`, or MCP)
2. System validates PLAY is only available for NetSuite organizations
3. Ticket receives PLY-prefixed short ID (e.g., PLY-42) and enters Helix workflow
4. PLAY is never auto-classified — user must explicitly choose it

### L2 — Compose & Preview

5. User defines play steps: SuiteQL queries (map), agent/script transforms (reduce), and effect declarations
6. System runs read-only steps (map + reduce) in sandbox using canonical examples created via ns-gm
7. User reviews actual sandbox outputs — query results, transformed data — in a preview panel
8. Inputs and outputs of each step are captured and displayed

### L3 — Run & Monitor

9. System shows effect preview via in-memory projection (field values, sourced fields, transform chain output) with explicit limitations noted
10. User approves play execution; system executes through the NS-GM RESTlet with governance
11. Every operation is logged with ordered execution record: step, timestamp, inputs, outputs, result
12. User monitors execution progress and reviews the full audit trail

## Essential Features (MVP)

### L1 — Play Mode Foundation

1. **PLAY as first-class TicketMode** — Prisma enum, platform config, API validation, MCP tools, UI mode picker, CLI mode flag all recognize PLAY
2. **NetSuite-only restriction** — PLAY available only for NetSuite-platform orgs (enforced at API and UI)
3. **Explicit-only selection** — mode classifier never auto-assigns PLAY
4. **PLY prefix and play branch** — `PLY-` short ID, `play` branch segment
5. **EXECUTE retirement** — removed from all user-facing surfaces; kept in DB enum only
6. **Existing ticket logging** — standard Helix ticket lifecycle logging applies to PLAY tickets

### L2 — Play Composition & Sandbox Preview

7. **Play step model** — data model for composed steps (map/reduce/effect) with typed inputs and outputs
8. **Sandbox execution of read-only steps** — SuiteQL queries and transforms execute in sandbox via ns-gm
9. **Canonical examples** — sample inputs created via ns-gm to demonstrate play behavior (like playbook rules in BLD-677)
10. **Preview panel** — UI showing step-by-step outputs: query results, transformed data, step timing
11. **SDF deploy skip** — PLAY tickets bypass the SDF deploy phase (plays execute via NS-GM RESTlet, not SDF)

### L3 — Play Execution & Monitoring

12. **Effect preview via projection** — in-memory record build shows what the effect will produce (field values, sourced fields, line items) with explicit limitations (taxes/GL/UE scripts not previewed)
13. **Play execution** — user triggers execution; effects run through NS-GM RESTlet with governance envelope
14. **Human approval for effects** — all write effects require explicit human approval before execution
15. **Ordered execution log** — every operation logged with step ID, timestamp, record type, inputs, outputs, result
16. **Execution monitoring** — real-time visibility into play run progress and completed steps

## Features Explicitly Out of Scope (MVP)

- Rollback engine and inverse library (research complete in RSH-702; implementation deferred)
- Before-image capture and write-operation audit model (prerequisite for production writes; ships just-in-time with L3)
- Idempotency keys and double-submit prevention
- Concurrency/drift detection via dateLastModified
- Triggered/automated play execution (Rung 2 — cron/event-driven)
- Tier-2 to Tier-1 promotion flywheel
- Quarantined-save or draft state mechanisms
- Cross-account play sharing or templates
- Custom RESTlet governance beyond the NS-GM chokepoint

## Success Criteria

### L1

1. User can create a PLAY ticket via web UI, CLI, and MCP tools
2. PLAY restricted to NetSuite orgs; non-NetSuite orgs get a clear validation error
3. PLAY tickets display correct icon and "Play" label throughout the UI
4. Mode classifier never auto-assigns PLAY
5. PLAY tickets receive PLY-prefixed short ID
6. EXECUTE no longer appears in any user-facing surface
7. All type checks, lint, and tests pass

### L2

8. User can define a play with composed map/reduce/effect steps
9. Read-only steps execute in sandbox and return actual results
10. Canonical examples demonstrate play behavior with real sandbox data
11. Preview panel shows step inputs and outputs

### L3

12. Effects show in-memory projection with explicit limitation callouts
13. User can execute a play and see real-time progress
14. Every operation is logged with ordered execution record
15. Human approval is required before any effect executes

## User Scenarios

[SCN-01] Create a Play ticket via web UI
- Precondition: User is logged in to a NetSuite-platform organization
- Action: User clicks "New Ticket", selects Play mode from the mode picker, enters a title describing the operation, and submits
- Expected Outcome: A new ticket is created with PLAY mode, showing a PLY-prefixed short ID and play icon in the ticket list

[SCN-02] Create a Play ticket via CLI
- Precondition: User has the Helix CLI installed and authenticated to a NetSuite org
- Action: User runs `hlx tickets create --mode PLAY --title "Create monthly invoices from open SOs"`
- Expected Outcome: CLI creates a PLAY ticket and displays the PLY-prefixed ticket ID

[SCN-03] Play mode rejected for non-NetSuite org
- Precondition: User is logged in to a non-NetSuite organization
- Action: User attempts to create a ticket with PLAY mode
- Expected Outcome: System returns a clear error: PLAY mode is only available for NetSuite organizations

[SCN-04] EXECUTE mode no longer visible
- Precondition: User is logged in to a NetSuite organization
- Action: User opens the ticket creation mode picker
- Expected Outcome: Mode options show AUTO, BUILD, FIX, RESEARCH, and Play. EXECUTE does not appear anywhere

[SCN-05] Play ticket displays correctly in detail view
- Precondition: A PLAY ticket exists
- Action: User navigates to the ticket detail page
- Expected Outcome: Ticket shows play icon, "Play" label, PLY-prefixed ID, and all standard ticket fields

[SCN-06] Define play steps with map/reduce/effect composition
- Precondition: User has created a PLAY ticket
- Action: User defines play steps: a SuiteQL query to find open sales orders, an agent transform to compute invoice amounts, and an effect to create invoices
- Expected Outcome: Each step is saved with its type (map/reduce/effect) and the composition is visible in the play definition view

[SCN-07] Preview read-only steps in sandbox
- Precondition: User has defined a play with SuiteQL and transform steps, and canonical examples exist
- Action: User clicks preview to run read-only steps in sandbox
- Expected Outcome: Preview panel shows actual SuiteQL query results from sandbox and transformed output data, step by step

[SCN-08] Sandbox canonical examples demonstrate play behavior
- Precondition: User has defined a play for invoicing open sales orders
- Action: System runs the play against canonical sample data in sandbox via ns-gm
- Expected Outcome: User sees the sample input records, the query results, transform outputs, and what the effect would produce — all using real sandbox data

[SCN-09] Preview effect via in-memory projection
- Precondition: User has a play with an invoice creation effect step
- Action: User previews the effect step
- Expected Outcome: System shows the projected invoice record with computed field values, sourced fields, and line items. A clear note states: "Tax, GL impact, and user-event script effects are computed only on save and not shown in preview"

[SCN-10] Execute a play with human approval
- Precondition: User has previewed a play and is satisfied with the projected results
- Action: User clicks "Run" to execute the play
- Expected Outcome: System requires explicit human approval before executing effects. After approval, effects execute and results are shown in real time

[SCN-11] Monitor play execution in real time
- Precondition: User has approved and started play execution
- Action: User watches the execution panel
- Expected Outcome: Each step shows its status (pending, running, complete), timing, inputs consumed, and outputs produced. Errors are surfaced immediately with step context

[SCN-12] Review full execution audit trail
- Precondition: A play has completed execution
- Action: User views the execution log
- Expected Outcome: Ordered log shows every operation: step ID, timestamp, record type, record ID, inputs, outputs, and result. The complete trail is available for review

[SCN-13] Play mode not auto-assigned
- Precondition: User creates a ticket with mode set to AUTO describing a record operation task
- Action: Mode classifier processes the ticket
- Expected Outcome: Classifier assigns BUILD, FIX, or RESEARCH — never PLAY. PLAY requires explicit user selection

## Key Design Principles

- **Three levels, each useful alone**: L1 establishes the mode. L2 adds composition and sandbox preview. L3 adds execution. Each level is a standalone deliverable
- **Replace, don't accumulate**: EXECUTE is dead code (zero usage). PLAY replaces it, not supplements it
- **Preview is the safety net**: Everything read-only is previewable. Effects show projections with explicit limitation callouts. Comfort before commitment
- **Sandbox first, always**: Plays run in sandbox with canonical examples before any production execution is considered
- **Explicit intent for effects**: Write operations never auto-execute. Human approval is the hard boundary
- **Log everything**: Every step's inputs and outputs are captured. Full audit trail from creation through execution

## Scope & Constraints

- **Four repos in scope**: helix-global-server (heaviest — Prisma, API, orchestrator, RESTlet), helix-global-client (UI mode support, preview panel), helix-cli (mode flag), library (context only — research reports, no code changes)
- **L1 is pure plumbing**: ~12 server files, ~5 client files, ~2 CLI files. No new data models, no new UI routes
- **L2 requires new data models**: Play step definitions, step composition, canonical example storage. New Prisma models and new UI components
- **L3 requires governance**: Before-image capture, operation-type tagging, and write audit on the NS-GM RESTlet must exist before any production writes
- **Prisma migration**: L1 uses `ALTER TYPE ADD VALUE 'PLAY'` (safe, non-blocking). L2 adds new tables
- **Deploy ordering**: Server deploys before CLI for L1 (CLI sends mode string; server validates against platform config)
- **EXECUTE kept in DB enum**: Removing an enum value in Postgres requires type recreation — too risky. Application surfaces hide it

## Future Considerations

- **Rollback engine**: Per-operation undo using the 3-tier reversibility model from RSH-702 (12 action-inverse pairs identified)
- **Triggered automation (Rung 2)**: Scheduled or event-driven play execution with circuit-breaker limits
- **Tier-2 promotion flywheel**: Stable derived inverses graduate to the atomic-inverse library over time
- **Cross-account play templates**: Shareable play definitions adapted per account's user-event script profile
- **BLD-634 convergence**: Direct-to-production approval gates share infrastructure with Play mode effect approval

## Open Questions / Risks

| # | Question / Risk | Status |
|---|----------------|--------|
| 1 | How play steps are persisted — new Prisma models (PlayStep, PlayExecution) or embedded JSON in the ticket | L2 design decision; new models preferred for query and monitoring |
| 2 | How canonical examples are created and stored — ns-gm sandbox snapshots vs manually curated datasets | L2 design decision; ns-gm creation aligns with playbook pattern (BLD-677) |
| 3 | Exact UX for effect preview — how to communicate partial fidelity without eroding user trust | L3 design decision; research report recommends explicit limitation callouts |
| 4 | User-event script enumeration per record type — required before classifying actual reversibility tier | Account-dependent; RSH-411 inference pipeline provides enumeration mechanism |
| 5 | REVERSALVOIDING preference affects void semantics per account — must check at runtime | L3 implementation detail; `config.load()` check before any void |
| 6 | NS-GM RESTlet structural containment leak — SDF-deployed scripts run autonomously outside the governed channel | Accepted boundary; document as known limit. Focus governance on the chokepoint |
| 7 | Deploy ordering for L1 — server must recognize PLAY before CLI sends it | Low risk; server-first deploy sequence |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (description items 1-7) | Primary scope definition | 7 items map to 3 MVP levels; user wants multiple deliverable levels |
| ticket.md (continuation context) | User guidance override | "Multiple level MVPs" — each level must be a real deliverable, not scaffolding-only |
| ticket.md (RSH-702 research report) | Feasibility assessment and safety model | CONDITIONAL GO; 3 dry-run mechanisms; 12 action-inverse pairs; 6 reusable + 9 net-new; NS-GM chokepoint; 3 reversibility tiers |
| scout/scout-summary.md (helix-global-server) | Server mode threading surface | TicketMode threads 11+ files; EXECUTE unused (0/852 tickets); NS-GM governance gap; reusable infrastructure |
| scout/scout-summary.md (helix-global-client) | Client mode and UI surface | TicketMode mirrors server; ExecuteIcon is play-triangle SVG; approval infrastructure reusable |
| scout/scout-summary.md (helix-cli) | CLI change surface | Single-file VALID_MODES change; thin client delegates to server |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause and 3-level decomposition | L1=12 files + migration; L2=new models + orchestrator branching; L3=governance envelope |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client change plan per level | L1=5 files; L2=composition UI; L3=monitoring viewer |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change plan | L1=2 files; L2/L3=deferred subcommands |
| scout/reference-map.json (helix-global-server) | File inventory with production facts | 17 files identified; 0 EXECUTE tickets verified at runtime |
