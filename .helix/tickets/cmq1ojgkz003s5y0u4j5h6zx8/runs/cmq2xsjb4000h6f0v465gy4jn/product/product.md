# Product Specification — MVP NetSuite Play Mode

## Problem Statement

Helix users describe operations they want performed in NetSuite — batch invoicing, vendor bill reconciliation, inventory adjustments — but have no way to express these as governed, repeatable, previewable automations. The EXECUTE mode exists in the schema but has never been used (0 of 852 production tickets). Users are stuck: either they do the work manually in NetSuite, or they resort to ad-hoc scripts with no preview, no audit trail, and no safety net.

The missing capability is a structured way to go from "I want to do X in NetSuite" to a composed, validated, re-runnable automation — without requiring users to build agents or write queries.

## Product Vision

**Play mode** replaces EXECUTE as a ticket mode where the user describes intent and Helix generates the automation. A Play is three composed steps:

1. **Map** — gather data (agent-generated SuiteQL, grounded by a sample, with enforced JSON output shape)
2. **Reduce** — transform data (agent-generated logic, grounded by a sample, with enforced JSON output shape)
3. **Output/Effects** — act on results (deterministic script: record writes, API calls, emails)

A Play is **created once** (via the normal Helix ticket system) and **executed many times**. The user reviews and approves — they don't author queries or scripts. Shape enforcement at every step boundary means the pipeline is composable, measurable, and monitorable.

## Users

| User | Need |
|------|------|
| **NetSuite operators** (accountants, ops, finance) | Run governed, repeatable actions on NetSuite records without writing code |
| **NetSuite admins** | Review, audit, and approve automations before they touch production |
| **Helix platform users** | Create automations by describing intent, not by building agents |

## Use Cases

1. **Batch invoice creation** — query open sales orders matching criteria, compute invoice amounts, create invoices
2. **Vendor bill reconciliation** — pull vendor bills and POs, match and flag discrepancies, update status fields
3. **Inventory adjustments** — query stock levels, calculate adjustments, write adjustment records
4. **Reporting with action** — gather data across record types, reshape for business logic, trigger downstream effects

## Core Workflow

### What is a Play?

A Play is a 3-step composed pipeline. The user describes what they want. Helix generates the machinery.

**Map (Gather)** — Agent generates a SuiteQL query from a prompt that includes a sample query. The query runs read-only in sandbox. The output is structured JSON validated against a declared shape before passing downstream.

**Reduce (Transform)** — Agent transforms the Map output using a prompt that includes a sample transformation. Still read-only. The output is validated against its declared shape.

**Output/Effects (Act)** — A deterministic, authored script (not agent-generated) that acts on the shaped Reduce output. This is where writes happen. Previewed as a dry-run before committing.

### Key decisions (from ticket discussion consensus)

- **Agent-generated first.** Map and Reduce prompts include sample queries/transformations as grounding examples. Static authored queries come in V2 via a "promote a proven query" mechanic.
- **Shape enforcement, not implementation enforcement.** Each step declares a JSON output shape. The agent can generate whatever it wants — but the result must conform before the next step runs.
- **Creation vs. execution.** A Play is designed once via the ticket system. Helix generates the three parts from the ticket description. The Play is then executed many times against real data.
- **The user reviews, not builds.** If users had to author prompts, samples, and scripts themselves, you'd have a DIY agent builder — a different product. Helix figures out the SuiteQL, the transformation, and the script skeleton. The user approves.
- **Canonical examples co-develop with the Play.** The agent drafts a query, ns-gm generates matching sandbox records, the Play runs against them, both refine until convergence. The examples are the Play's proof of correctness.

## Essential Features (MVP)

Five progressive levels. Each delivers independent user value and builds on the previous.

### MVP-1: Mode Scaffolding

**User gets:** The ability to create and manage Play tickets through the normal Helix flow.

- PLAY added as a ticket mode, replacing unused EXECUTE
- Available only for NetSuite organizations (same gating pattern)
- Requires manual mode selection (never auto-assigned)
- Play icon, label ("Play"), color, and filter in all UI surfaces (web + CLI)
- PLY- short ID prefix, `play` branch segment
- CLI accepts `hlx tickets create --mode PLAY`
- EXECUTE removed from all user-facing surfaces (kept in DB enum only for Postgres safety)

### MVP-2: Play Definition

**User gets:** A structured 3-step Play generated from their ticket description.

- PlayDefinition data model storing the pipeline: Map (prompt + sample + output shape), Reduce (prompt + sample + output shape), Output/Effects (script)
- Play linked to its originating ticket
- Helix ticket workflow generates the three parts from the ticket description
- Play lifecycle: draft, validated, active
- CRUD operations on play definitions

### MVP-3: Read-Only Preview

**User gets:** Real sandbox data flowing through their pipeline with shape validation at every boundary.

- Map: agent generates SuiteQL from prompt + sample, executes in sandbox via NS-GM, validates output against JSON shape
- Reduce: agent transforms Map output, validates against JSON shape
- Results displayed step-by-step to the user
- Shape validation: clear pass/fail at each step transition
- Users see real data, not hypothetical samples — zero writes to NetSuite

### MVP-4: Sandbox Execution + Canonical Examples

**User gets:** Full end-to-end Play execution in sandbox, with proof it works.

- Complete 3-step pipeline execution in sandbox including Output/Effects script
- Canonical example co-development loop: agent drafts query, ns-gm generates matching sandbox records, Play runs against them, both refine until convergence
- Dry-run output preview: show exactly what would be written before committing
- 3-5 canonical examples per Play (happy path + edge cases)
- The Play isn't "done" until proven against its canonical examples

### MVP-5: Production Execution with Governance

**User gets:** Plays running against production data with full safety controls.

- Before-image capture of records before any write
- Write-operation audit trail (who approved, what changed, before/after state)
- Idempotency prevention (no double-submit)
- Human approval mandatory for irreversible actions (emails, external API calls, payment captures)
- Concurrency/drift detection before undo
- Governance envelope on the NS-GM RESTlet chokepoint

## Features Explicitly Out of Scope (MVP)

| Feature | Rationale |
|---------|-----------|
| Static (hand-authored) Map/Reduce queries | Agent-generated first. Static authoring comes in V2 via "promote a proven query" |
| Separate play builder UI | Play creation stays within the Helix ticket system — no new authoring surface |
| Triggered/scheduled plays | Requires circuit-breaker limits, pre-approved bounds, Tier-3 approval at design time |
| Rollback engine | Requires atomic-inverse library curation per record type — heavy lift, deferred |
| Tier-2 promotion flywheel | Needs success-count tracking, cross-account annotation, review workflow |
| Multi-platform support | Play mode is NetSuite-only for now |
| Canonical examples as platform primitive | The co-development loop applies beyond plays (Build, Fix) but scoped to Play for MVP |
| Playbook convergence | BLD-677 playbook infra is designed but not merged; convergence is a later concern |
| Cross-play composition | One Play's output feeding another Play's input — deferred |

## Success Criteria

### MVP-1: Mode Scaffolding
- User can create a PLAY ticket via web UI, CLI, and MCP tools
- PLAY restricted to NetSuite orgs; non-NetSuite orgs get a clear validation error
- PLAY tickets display correct icon and "Play" label throughout UI
- Mode classifier never auto-assigns PLAY
- PLY- prefix on short IDs
- EXECUTE no longer visible in any user-facing surface
- All type checks, lint, and tests pass

### MVP-2: Play Definition
- A Play ticket stores a structured 3-step definition (Map, Reduce, Output/Effects)
- Each step includes its prompt, sample, and output shape
- Plays can be created, read, updated, and listed per ticket
- Play lifecycle status tracks correctly

### MVP-3: Read-Only Preview
- Users see real SuiteQL results from sandbox for the Map step
- Users see transformed data from the Reduce step
- Output shape validation reports pass/fail at each step boundary
- Zero writes to NetSuite occur during preview

### MVP-4: Sandbox Execution + Canonical Examples
- Full pipeline runs end-to-end in sandbox including Output/Effects
- Canonical examples generated and stored alongside the Play
- Users see a dry-run of intended writes before committing
- Play marked validated only after canonical examples pass

### MVP-5: Production Execution with Governance
- Every write has a before-image and audit trail
- Duplicate submissions prevented
- Irreversible actions require explicit human approval
- All operations logged with full provenance

## User Scenarios

[SCN-01] Create a Play ticket via web UI
- Precondition: User is logged in to a NetSuite-platform organization
- Action: User creates a new ticket, selects Play mode, describes the desired operation
- Expected Outcome: Ticket is created with PLAY mode, PLY-prefixed short ID, and play icon visible in the ticket list

[SCN-02] Create a Play ticket via CLI
- Precondition: User has Helix CLI installed, authenticated to a NetSuite org
- Action: User runs `hlx tickets create --mode PLAY` with a description
- Expected Outcome: CLI creates a PLAY ticket and displays the PLY-prefixed ticket ID

[SCN-03] Play mode rejected for non-NetSuite org
- Precondition: User is on a non-NetSuite organization
- Action: User attempts to create a ticket with PLAY mode
- Expected Outcome: Clear error message — PLAY mode is only available for NetSuite organizations

[SCN-04] EXECUTE no longer visible
- Precondition: User is on a NetSuite organization
- Action: User opens the ticket creation mode picker
- Expected Outcome: Modes show AUTO, BUILD, FIX, RESEARCH, PLAY. EXECUTE does not appear

[SCN-05] Review a generated Play definition
- Precondition: Helix has generated a Play definition from a PLAY ticket
- Action: User opens the Play ticket and reviews the 3-step definition
- Expected Outcome: User sees Map prompt + sample + shape, Reduce prompt + sample + shape, and Output/Effects script clearly presented

[SCN-06] Preview Map step results in sandbox
- Precondition: A Play definition exists with a valid Map step
- Action: User triggers a preview of the Map step
- Expected Outcome: Real SuiteQL results from sandbox are displayed. Output shape validation shows pass or fail

[SCN-07] Preview Reduce step results
- Precondition: Map step previewed successfully
- Action: User triggers a preview of the Reduce step
- Expected Outcome: Transformed data displayed. Shape validation shows pass or fail. No writes to NetSuite

[SCN-08] Run full Play in sandbox
- Precondition: Map and Reduce previews pass shape validation
- Action: User triggers full sandbox execution including Output/Effects
- Expected Outcome: All three steps execute in sequence. User sees actual output/effects results. Sandbox records created or modified are shown

[SCN-09] View canonical examples
- Precondition: A Play has been validated with canonical examples
- Action: User views the Play's canonical examples
- Expected Outcome: 3-5 example inputs and their actual sandbox outputs displayed, including happy path and edge cases

[SCN-10] Dry-run Output/Effects before commit
- Precondition: Map and Reduce produced valid shaped output
- Action: User requests a dry-run of the Output/Effects step
- Expected Outcome: User sees what records would be created/modified and what calls would be made — nothing is actually written

[SCN-11] Execute a Play in production
- Precondition: Play validated in sandbox, user has production access
- Action: User triggers production execution
- Expected Outcome: Play runs against production data. All operations logged with before/after images. Results displayed

[SCN-12] Approve an irreversible action
- Precondition: Play's Output/Effects includes an irreversible action (email, external API call)
- Action: System presents the action for human approval
- Expected Outcome: Action does not execute until explicitly approved. Approval is logged

[SCN-13] View execution audit trail
- Precondition: A Play has been executed at least once
- Action: User views execution history
- Expected Outcome: Every run shown with timestamps, step progression, data at each boundary, writes performed, and who approved

## Key Design Principles

1. **Describe, don't build.** Users express intent. Helix generates the automation. Reviewing is the user's job, not authoring.
2. **Shape contracts at every boundary.** The JSON output shape is the enforced contract between steps. The agent is free to generate any implementation that satisfies it.
3. **Progressive trust.** Map and Reduce are fully previewable (read-only). Output/Effects gets a dry-run. Production gets governance. Trust scales with risk.
4. **Created once, executed many.** A Play is a design-time artifact validated once. It runs repeatedly with full logging each time.
5. **Everything is logged.** Every step's inputs, generated queries/scripts, outputs, shape validation results, and effects are captured.
6. **Sandbox first.** A Play is proven against canonical examples in sandbox before any production execution.

## Scope & Constraints

- **NetSuite only.** Play mode gated to NetSuite organizations at the platform config level.
- **Manual selection only.** PLAY is never auto-assigned by the mode classifier.
- **Sandbox first.** All Play development and validation in sandbox before production.
- **Deploy ordering.** Server deploys before CLI — the CLI sends mode to the server, which validates against platform config.
- **Schema migration note.** Production DB has a PLAYBOOK_CHECK enum value not in the local Prisma schema. Migration must account for this desync with conditional SQL.
- **NS-GM is the chokepoint.** All NetSuite operations flow through the NS-GM RESTlet. Governance for writes is added at this layer.
- **Four repos involved.** helix-global-server (primary — schema, API, orchestrator, RESTlet), helix-global-client (UI mode + preview), helix-cli (mode flag), library (context only).

## Future Considerations

- **Static query promotion.** "Lock in" a proven agent-generated query as a static, versioned artifact. V2 authoring story.
- **Canonical examples as platform primitive.** The co-development loop applies beyond Plays — to Build and Fix modes too. Play is the first consumer.
- **Triggered/scheduled plays.** Cron or event-driven execution with circuit-breakers and pre-approved bounds.
- **Playbook convergence.** BLD-677 playbook infrastructure shares governance patterns with Plays. Convergence is a later architectural concern.
- **Cross-play composition.** Pipelines of pipelines — one Play's output feeding another Play's input.
- **BLD-634 convergence.** Direct-to-production approval gates share infrastructure with Play effect approval.

## Open Questions / Risks

| # | Question | Status |
|---|----------|--------|
| 1 | **ns-gm depth for canonical examples** — Can ns-gm generate records with correct relationships (invoice + customer + terms + line items) or only flat records? | Open — feasibility unknown |
| 2 | **Sandbox SuiteQL fidelity** — Does sandbox schema match production closely enough that proven queries reliably work live? | Open — needs per-account verification |
| 3 | **Agent-generated query quality** — Will agents produce SuiteQL that matches real schemas well enough to earn user trust? | Risk — mitigated by sample grounding + shape enforcement |
| 4 | **Output/Effects script authoring** — Who writes the deterministic script for step 3? Helix generates a skeleton, but how much editing is needed? | Open |
| 5 | **PLAYBOOK_CHECK schema desync** — Production DB enum has a value not in local Prisma schema. Migration must handle both states. | Known — conditional migration strategy identified |
| 6 | **Convergence signal** — How does Helix know when canonical examples and Play logic are "solid enough"? What stops the agentic loop? | Open |
| 7 | **User-event script side effects** — NetSuite UE scripts fire on record.save() and may introduce unpredictable side effects. Account-dependent. | Risk — mitigated by sandbox-first approach |
| 8 | **REVERSALVOIDING preference** — Void semantics differ per account. Must check at runtime. | Known — runtime check required |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Description) | Primary scope definition | Play = 3-step pipeline; canonical examples; full logging; replaces Execute |
| ticket.md (Discussion — full thread) | Evolved Play definition consensus | Agent-generated first; enforced JSON shapes; creation vs execution split; user reviews not builds; canonical examples co-develop with logic |
| ticket.md (Research Report RSH-702) | Feasibility assessment | Conditional Go; 6 reusable, 9 net-new; NS-GM raw pipe; 3-tier reversibility; Tier-3 requires human approval |
| scout/scout-summary.md (library) | Spec hub role | RSH-702 + RSH-411 provide design constraints; no code changes in library |
| scout/scout-summary.md (helix-global-server) | Server analysis + runtime evidence | EXECUTE=0/852; PLAYBOOK_CHECK desync; NS-GM raw pipe; natural 5-level MVP tiers |
| scout/scout-summary.md (helix-global-client) | Client mode analysis | TicketMode const; ExecuteIcon play-triangle; platform gating; approval system reusable |
| scout/scout-summary.md (helix-cli) | CLI analysis | 3 files; VALID_MODES array; thin client delegates to server |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server root cause + MVP decomposition | 5 MVP levels; migration strategy; PlayDefinition/PlayRun/PlayStepResult models; file-level change map |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client change plan | L1=12 files; L2/L3 deferred; approval system reusable |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change plan | 3 files; server-first deploy ordering |
| repo-guidance.json | Repo intent classification | library=context; server/client/cli=target |
