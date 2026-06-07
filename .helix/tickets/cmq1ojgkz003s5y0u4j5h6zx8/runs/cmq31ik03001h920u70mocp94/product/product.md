# Product: MVP NetSuite Play Mode

## Problem Statement

Helix users can build scripts, fix bugs, and research NetSuite issues through the ticket system. But they cannot create **repeatable, composable automations** — describe an intent once, and run it many times with full visibility. The EXECUTE mode was designed for this but never shipped (zero usage across 872 production tickets). There is no way to go from "I want to find all overdue invoices and send summaries" to a working, auditable, repeatable pipeline without writing code.

## Product Vision

A **Play** is the automation primitive for Helix in NetSuite.

The user describes what they want in a Helix ticket. Helix generates a composable 3-step pipeline — gather data, transform it, act on it — where each step's output shape is enforced by code. The first two steps are read-only and fully previewable. The third step shows what it *would* do before doing it. Every execution is logged. The user reviews and approves rather than builds.

**One sentence:** Describe intent, get a reviewable automation that runs as many times as you need.

## Users

- **NetSuite administrators** who need repeatable operations (invoice processing, vendor bill creation, bulk record updates) without writing SuiteScript
- **Finance and ops teams** who need automation they can trust — visible at every step, auditable after every run
- **Existing Helix users** who already use the ticket system for build/fix/research and want to extend it to ongoing operations

## Use Cases

1. **Automate a recurring NetSuite operation** — "Find open invoices over 90 days, summarize by customer, create a credit hold flag" becomes a play that runs on demand
2. **Preview before committing** — See exactly what data will be gathered, how it will be transformed, and what records will be affected before anything changes
3. **Reuse without rebuilding** — A play created once for "monthly vendor bill reconciliation" runs every month with fresh data, same logic
4. **Audit what happened** — Every run logs the generated query, the transformation, and the output, so finance teams can trace exactly what Helix did and when

## Core Workflow

**Creation** (one-time, via Helix ticket):
User submits a Play ticket describing their intent. Helix generates the play's three parts automatically. The user reviews the generated play in sandbox.

**Execution** (many times):
User triggers the play. Map gathers data. Reduce transforms it. Output/Effects acts on it. Each step boundary enforces the expected shape. Everything is logged.

### Play Anatomy

A play has three composable steps:

| Step | What it does | How it works | Previewable? |
|------|-------------|--------------|-------------|
| **Map** | Gathers data | Agent prompt + sample SuiteQL; JSON output shape enforced by code | Fully -- read-only |
| **Reduce** | Transforms data | Agent prompt + sample transformation; JSON output shape enforced by code | Fully -- read-only |
| **Output/Effects** | Acts on results | Deterministic script (CRUD, API calls, messages) | Dry-run -- shows intended writes |

Shape enforcement at each boundary is the trust layer. Steps compose because outputs are guaranteed to match the next step's expected input.

## Essential Features -- MVP Levels

### MVP-1: Mode Scaffolding

Make Play selectable as a ticket mode.

- PLAY appears in the mode selector for NetSuite organizations
- EXECUTE removed from all surfaces (confirmed zero usage)
- PLY- short ID prefix; `play` branch naming convention
- Works end-to-end: server API, client UI, CLI

**User impact:** Users can create Play tickets. The mode exists and is wired up, but plays don't execute yet.

### MVP-2: Play Definition + Creation

Helix generates a play from a ticket description.

- New data model stores the 3-step play structure: prompts, samples, output schemas, and the effects script
- When a Play ticket's workflow runs, the agent generates all three parts from the ticket description
- Play definitions are retrievable and inspectable via API
- Workflow integration follows the existing research-mode branching pattern

**User impact:** Users describe what they want in a ticket, and Helix produces a structured 3-step play definition they can review.

### MVP-3: Play Execution + Preview

Run the pipeline end-to-end in sandbox.

- Map executes agent-generated SuiteQL in sandbox via NS-GM; output validated against declared schema
- Reduce transforms Map output; output validated against declared schema
- Output/Effects runs deterministic script with dry-run preview showing intended writes
- Shape validation at each boundary -- pipeline halts with clear error on mismatch
- Per-step results logged with inputs, outputs, timing, and validation status

**User impact:** Users can execute plays in sandbox, preview every step's output, and see exactly what would happen before committing any changes.

## Features Explicitly Out of Scope (MVP)

| Feature | Why deferred |
|---------|-------------|
| Canonical example generation | Platform-level primitive (not play-specific); separate research needed |
| Production governance | Before-image capture, rollback, idempotency, NS-GM governance wrapper -- significant infra work |
| Play builder UI | Creation stays in the ticket system; a separate builder is over-engineering at this stage |
| Static (authored) query mode | Start agent-generated only; users can "promote" working queries to static in a future version |
| Playbook convergence | Playbook rules (BLD-677/RSH-411) are architecturally separate; convergence deferred |
| Cross-play composition | Chaining plays where one's output feeds another's input is a V2 concern |
| Triggered/scheduled execution | Manual execution only for MVP |
| Multi-environment execution | Sandbox only; production requires governance (deferred) |

## Success Criteria

### MVP-1
- PLAY mode appears in the mode selector for NETSUITE orgs only
- PLAY mode does NOT appear for non-NETSUITE platforms
- EXECUTE is removed from all user-facing surfaces (UI, API, CLI)
- PLY- prefix is used for play ticket short IDs
- `hlx tickets create --mode PLAY` works from the CLI
- All quality gates pass across server, client, and CLI

### MVP-2
- A Play ticket's workflow produces a PlayDefinition with all three steps populated
- Each step includes: prompt, sample, output schema (Map/Reduce) or script (Output)
- Play definitions are retrievable by ticket ID via API
- Users can view the generated play before any execution

### MVP-3
- Map step runs SuiteQL in sandbox and produces output conforming to its declared schema
- Reduce step transforms Map output and produces output conforming to its declared schema
- Shape validation failure at any boundary halts the pipeline with a clear error message
- Output/Effects step shows a dry-run preview of intended writes before committing
- Every step execution is logged with inputs, outputs, duration, and validation status
- Users can view execution history for any play

## User Scenarios

[SCN-01] Create a Play ticket for a NetSuite org
- Precondition: User has a connected NETSUITE organization in Helix
- Action: User creates a new ticket, selects Play mode, and describes their intent (e.g., "find all open invoices over 90 days and flag the customer for credit hold")
- Expected Outcome: Ticket is created with PLY- prefix and Play mode badge; workflow begins generating the play definition

[SCN-02] Play mode is unavailable for non-NetSuite platforms
- Precondition: User has only non-NetSuite organizations connected
- Action: User opens the new ticket form and views available modes
- Expected Outcome: Play does not appear in the mode selector

[SCN-03] Create a Play ticket via CLI
- Precondition: User has the Helix CLI installed and authenticated
- Action: User runs `hlx tickets create --mode PLAY` with a description
- Expected Outcome: Ticket is created with Play mode and PLY- prefix; help text shows PLAY as a valid mode

[SCN-04] Helix generates a play definition from ticket description
- Precondition: User has created a Play ticket describing "reconcile vendor bills against purchase orders and flag mismatches"
- Action: Helix workflow processes the ticket
- Expected Outcome: A 3-step play definition is generated: Map step with SuiteQL to query vendor bills and POs, Reduce step to compare and identify mismatches, Output step with script to flag mismatched records -- each with prompt, sample, and output schema

[SCN-05] Review a generated play definition
- Precondition: Play definition has been generated from a ticket
- Action: User views the play definition via the ticket detail or API
- Expected Outcome: All three steps are visible with their prompts, sample queries/transformations, output schemas, and the effects script

[SCN-06] Execute a play and preview Map output
- Precondition: Play definition exists; sandbox NS-GM credentials configured
- Action: User triggers play execution in sandbox
- Expected Outcome: Map step runs SuiteQL against sandbox data; generated query and results are displayed; output is validated against the declared JSON schema

[SCN-07] Shape validation catches a bad output
- Precondition: Play is executing in sandbox
- Action: A step produces output that does not match its declared schema (e.g., missing required fields)
- Expected Outcome: Pipeline halts at the step boundary; error message shows expected vs. actual shape; subsequent steps do not execute

[SCN-08] View dry-run preview for Output/Effects
- Precondition: Map and Reduce steps have completed successfully
- Action: Output/Effects step runs in dry-run mode
- Expected Outcome: User sees exactly what records would be created, updated, or flagged -- without any writes being committed

[SCN-09] Execute a full play pipeline end-to-end
- Precondition: Play definition exists with all 3 steps; sandbox is configured
- Action: User runs the play from start to finish in sandbox
- Expected Outcome: Map -> Reduce -> Output executes sequentially; each step's output flows to the next; all results are logged with per-step inputs, outputs, timing, and validation status

[SCN-10] View play execution history
- Precondition: A play has been executed at least once
- Action: User views the play's run history
- Expected Outcome: Each run is listed with status, timestamp, and per-step results including inputs, outputs, duration, and shape validation outcomes

[SCN-11] EXECUTE mode is no longer accessible
- Precondition: EXECUTE mode previously existed in the system
- Action: User attempts to find or use Execute mode via UI, CLI, or API
- Expected Outcome: Execute mode is absent from all surfaces; PLAY has replaced it

[SCN-12] Re-run a play with fresh data
- Precondition: Play was previously executed successfully in sandbox
- Action: User triggers the same play again
- Expected Outcome: Play runs with the same definition but against current sandbox data; new run logged independently of previous runs

## Key Design Principles

1. **Intent in, automation out** -- Users describe what they want; Helix generates the how
2. **Shape enforcement is the trust layer** -- JSON schemas at step boundaries make plays composable, auditable, and debuggable
3. **Progressive trust** -- Preview Map and Reduce freely (read-only), dry-run Output (see what would change), then commit with confidence
4. **Agent-generated first, static later** -- Start with one mode; promote working patterns to static artifacts when ready
5. **Creation once, execution many** -- Clean separation between designing a play and running it
6. **Full auditability** -- Every generated query, every transformation, every output is logged and inspectable
7. **Effects are deterministic** -- The highest-stakes step (Output/Effects) is a script, not agent-generated, because predictability matters most where risk is highest

## Scope & Constraints

- **Platform:** NetSuite only (follows existing EXECUTE gating pattern)
- **Environment:** Sandbox execution only for all MVP levels; production requires governance (deferred)
- **NS-GM:** Used as the execution gateway in its current state; governance wrapper is a separate initiative
- **Deploy ordering:** Server must deploy before CLI (CLI sends mode strings to server API)
- **Schema sync:** Two Prisma migrations needed -- one to sync PLAYBOOK_CHECK (exists in production but not local schema), one to add PLAY
- **EXECUTE retention:** Value stays in the Postgres enum (cannot DROP enum values without recreating the type) but is removed from all application surfaces

## Future Considerations

- **Canonical examples** -- A platform-level primitive where ns-gm generates synthetic sandbox records; logic and examples co-develop in a feedback loop until outputs consistently pass. Applies to build and fix modes too, not just plays.
- **Production governance** -- Before-image capture, write audit logging, rollback via ordered forward-log with inverse replay, idempotency via externalId, concurrency detection via dateLastModified, NS-GM RESTlet governance wrapper
- **Static promotion** -- Users "lock in" a generated query or script that works well, converting it from agent-generated to a fixed, versioned artifact
- **Play composition** -- Chain plays where one's output feeds another's input
- **Triggered execution** -- Scheduled or event-driven play runs
- **Playbook convergence** -- Governance rules from the Playbook layer may eventually gate play execution

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|----------------|--------|
| 1 | How does the dry-run preview for Output/Effects work without a quarantined save or BEGIN...ROLLBACK in NetSuite? | Preview fidelity for effects step (SCN-08) |
| 2 | User-event scripts fire only on record.save() -- in-memory projection misses side effects | What users preview may differ from actual execution |
| 3 | Quality of agent-generated SuiteQL depends on the agent's understanding of the customer's NetSuite data model | Poor queries erode trust quickly; canonical examples (deferred) are the key mitigator |
| 4 | PLAYBOOK_CHECK exists in production but not in local schema -- migration ordering is delicate | Could block deployment if first migration fails |
| 5 | How much of the Output/Effects script can the agent help generate vs. what must be human-authored? | Affects creation time quality and user confidence |
| 6 | REVERSALVOIDING accounting preference changes void semantics per NetSuite account | Tier-1 reversibility is account-dependent (production governance concern) |
| 7 | Does the agent know enough about NetSuite record relationships to generate meaningful Map queries from a plain-language description? | Core product value depends on query quality |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md -- Description | Primary requirements | Play = 3-step pipeline; created via ticket; sandbox examples; full logging |
| ticket.md -- Discussion | Refined play anatomy through dialogue | Agent-generated Map/Reduce + sample + shape enforcement; deterministic Output; no play builder UI; canonical examples are platform-level |
| ticket.md -- Research Report (RSH-702) | Feasibility backdrop | 6 reusable infra components; NS-GM is raw gateway; 3-tier reversibility; conditional go |
| scout/scout-summary.md (server) | Server codebase analysis | 5 MVP levels identified; mode patterns; credential routing; 13+ relevant files |
| scout/scout-summary.md (client) | Client codebase analysis | Mode scaffolding across ~14 files; ExecuteIcon already renders play-triangle |
| scout/scout-summary.md (cli) | CLI codebase analysis | 3 files; thin client; server enforces platform |
| scout/reference-map.json (library) | Library context | Documentation-only repo; no code changes needed |
| diagnosis/diagnosis-statement.md (server) | Server diagnosis | 3 in-scope MVP levels; EXECUTE=0 confirmed via runtime; PLAYBOOK_CHECK desync; migration strategy |
| diagnosis/diagnosis-statement.md (client) | Client diagnosis | ~14 files for EXECUTE->PLAY rename; ExecuteIcon SVG is already a play triangle |
| diagnosis/diagnosis-statement.md (cli) | CLI diagnosis | 3 files; deploy after server |
