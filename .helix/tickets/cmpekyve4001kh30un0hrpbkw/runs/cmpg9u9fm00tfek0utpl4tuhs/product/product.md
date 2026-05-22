# Product: Goals & PM Agent (Ralph Loop)

## Problem Statement

Helix is a ticket-in, result-out system. Each ticket executes in isolation as an independent MVP unit. There is no mechanism to coordinate multiple tickets toward a larger business objective, iterate toward polish, or bridge the gap between a user's declarative intent ("automate our RMA process") and the series of incremental tickets needed to fully realize it. Users who need multi-ticket outcomes must manually create follow-up tickets, evaluate what was built, decide what comes next, and track whether their objective has been met. This makes users act as their own project manager between every step.

## Product Vision

Goals transform Helix from a ticket executor into a goal-reacher. A Goal takes a high-level business objective and drives it to polished completion through an autonomous **PM agent** that evaluates concrete results after each child ticket, proposes the single most valuable next action, and repeats — one ticket at a time — until the objective is truly done.

The PM agent operates as a dual-aspect system: an **Assessor** produces an objective evaluation artifact (answering 7 structured questions against concrete evidence), then a **Decider** reads that artifact and makes the decision (complete, or propose next ticket). This separation yields objectivity — assessment is decoupled from action, mirroring the existing diagnosis→product pattern in the codebase.

Goals are not tickets. They are a fundamentally different experience — centered on child management, evaluation results, preview forecasts, and a living roadmap — and they get their own dedicated entity, API, and UI.

## Users

- **Helix operators**: Users who define business objectives requiring more than one ticket. They want to state an objective, watch it get built iteratively, and intervene only when the direction is wrong — not for every intermediate decision.

## Use Cases

1. **Multi-ticket business objectives**: Operator wants to automate an RMA process (approval flow, email notifications, admin dashboard). This requires 3-5+ coordinated tickets, each building on the last.
2. **Polish beyond MVP**: A single ticket produces a functional MVP, but the operator wants hardening — error handling, edge cases, UX refinement. Goals drive iterative improvement until the result meets a quality bar.
3. **Autonomous iteration**: Operator sets an objective and lets the PM agent iterate without manual approval for each step. Reviews progress when convenient.
4. **Visibility without gatekeeping**: Preview forecasts and a living roadmap let the operator see what the PM agent plans to do next without needing to approve every action.

## Core Workflow

1. Operator creates a Goal (title + description with explicit success criteria).
2. Goal enters initial setup: scout → diagnosis → product (3-step pipeline produces context artifacts).
3. PM agent **Assessor** produces a structured evaluation artifact — answers 7 questions against current state, citing evidence from completed children and setup artifacts.
4. PM agent **Decider** reads the assessment artifact and decides:
   - Objective met → Goal completes.
   - More to do → Proposes next ticket with rationale, child type, and motivation facet.
5. If proposing: updates living roadmap, generates 2-3 preview forecasts of upcoming work.
6. Spawns a single child ticket autonomously.
7. Child ticket executes through standard pipeline (BUILD/FIX/RESEARCH).
8. Child completes → loop back to step 3.

Safety bounds: max 20 children (configurable), manual termination always available, evaluation audit trail recorded per cycle, preview visibility at all times.

## Essential Features (MVP)

1. **Separate Goal entity** — Goals are their own data model with a dedicated database table, own GoalStatus enum, CRUD API, and UI. Not a TicketMode on the Ticket table.
2. **GoalStatus lifecycle** — Own status enum: DRAFT, QUEUED, RUNNING, ACTIVE, EVALUATING, PENDING_APPROVAL, PAUSED, COMPLETED, FAILED.
3. **Goal-to-ticket relationship** — A `goalId` foreign key on Ticket links child tickets to their parent Goal, with `childType` classification (BREADTH, DEPTH, POLISH, VERIFY).
4. **Dual-aspect PM agent** — Assessor aspect produces a structured 7-question evaluation artifact; Decider aspect reads the artifact and produces verdict + proposal + previews + roadmap update. Two distinct LLM calls, not one.
5. **7-question evaluation protocol** — Is it matching? More to do? Needs polish? All boxes checked? Can something be added? Fixed? Verified? Each answer cites concrete evidence.
6. **Per-ticket evaluation trigger** — After each child ticket completes, the Goal transitions to EVALUATING and the PM agent runs. Piggybacks on existing completion hooks in the orchestrator. One child at a time.
7. **Evaluation audit trail** — Every evaluation cycle (assessment artifact + decider output + verdict) is persisted and queryable. Full transparency into PM agent reasoning.
8. **Autonomous execution** — PM agent proposes and spawns the next ticket without human approval by default.
9. **Living roadmap** — Continuously updated planning document reflecting what has been completed, current assessment, and projected remaining work. Updated every evaluation cycle.
10. **Preview forecasts** — 2-3 non-binding forecast tickets visible after each evaluation, showing what the PM agent anticipates next.
11. **Dedicated Goal UI** — Separate `/goals` routes and components: goal list, goal detail with child tree navigation, evaluation display (7 questions + evidence + verdict), preview panel, roadmap view. Not embedded in or linked to ticket views.
12. **Safety bounds** — Max children limit (default 20, configurable), PAUSED state when limit reached, manual termination to COMPLETED or FAILED at any time, idle timeout for stalled evaluations.
13. **Optional approval mode** — Operator can enable per-ticket approval: proposals enter PENDING_APPROVAL, with approve/reject endpoints. Opt-in exception, not default.
14. **CLI support** — `hlx goals create`, `hlx goals list`, `hlx goals get`, `hlx goals terminate` command family.

## Features Explicitly Out of Scope (MVP)

- **Nested Goals** — Goals spawning sub-Goals. MVP is flat: Goal → child tickets only.
- **Multi-ticket proposals** — PM agent proposes one ticket at a time. Parallel proposals are V2.
- **Parallel child execution** — One child at a time. Concurrent children are V2.
- **Playbook-enhanced evaluation** — Core Goals are Playbook-independent. Playbook integration requires RSH-411 Phase 1.
- **Predictive estimation** — Using historical Goal data to estimate child count and timeline.
- **Retroactive Goal assignment** — Attaching existing tickets to a Goal after creation.
- **Goal-to-Goal dependencies** — Sequencing Goals via dependency chains.
- **Speculative execution** — Starting previewed tickets before PM agent confirms direction.
- **Goal progress dashboard** — Aggregate view of all active Goals.
- **Ticket UI modifications** — The ticket UI is unchanged. Goal navigation is separate.

## Success Criteria

1. An operator can create a Goal with a title, description, and success criteria through both the Goal UI and CLI.
2. After initial setup (scout/diagnosis/product), the PM agent autonomously proposes and spawns the first child ticket.
3. After each child ticket completes, the PM agent runs the dual-aspect evaluation: Assessor produces a 7-question artifact, Decider reads it and produces a verdict — all visible in the Goal detail UI.
4. The Goal UI is a separate experience from the ticket UI — own routes, own pages, own components.
5. The PM agent correctly declares a Goal complete when all stated success criteria are met, mapping each to evidence.
6. Safety bounds prevent runaway execution: max children enforced, manual termination works, PAUSED state when limit reached, every evaluation persisted as audit record.
7. A single child failure does not fail the Goal — the PM agent evaluates the failure in context and proposes a corrective action.

## User Scenarios

[SCN-01] Create a new Goal
- Precondition: Operator is authenticated and on the Goals UI
- Action: Operator fills in a Goal title, description with success criteria, and submits
- Expected Outcome: A new Goal appears in the Goals list with QUEUED status, and the initial setup pipeline begins

[SCN-02] Goal completes setup and spawns first child
- Precondition: A Goal has been created and the initial setup pipeline (scout/diagnosis/product) has completed
- Action: The PM agent evaluates the Goal objective using setup artifacts and proposes the first child ticket
- Expected Outcome: A child ticket appears in the Goal's child tree with type classification. The Goal shows ACTIVE status.

[SCN-03] View PM agent evaluation after child completes
- Precondition: A Goal has a child ticket that just completed
- Action: Operator navigates to the Goal detail view
- Expected Outcome: The Goal shows the Assessor's evaluation artifact with answers to all 7 questions and evidence citations, plus the Decider's verdict and rationale

[SCN-04] PM agent proposes and spawns next child autonomously
- Precondition: A child ticket completed and the PM agent determined the objective is not yet met
- Action: The PM agent proposes a next ticket and spawns it without human intervention
- Expected Outcome: A new child ticket appears in the Goal's child tree with its type classification and motivation facet. The living roadmap and preview forecasts are updated.

[SCN-05] Goal reaches completion
- Precondition: Multiple children have completed and all success criteria are now met
- Action: The PM agent evaluates and the Decider determines all criteria are satisfied
- Expected Outcome: The Goal transitions to COMPLETED. The final evaluation maps each success criterion to the child ticket(s) that addressed it. No further children are spawned.

[SCN-06] View living roadmap and preview forecasts
- Precondition: A Goal is in progress with at least one completed evaluation cycle
- Action: Operator navigates to the Goal detail and views the roadmap section
- Expected Outcome: The roadmap shows completed work summary, current assessment, and projected remaining work. Preview forecasts show 2-3 anticipated next tickets with rationale and child type.

[SCN-07] Manually terminate a Goal
- Precondition: A Goal is in a non-terminal state (ACTIVE or EVALUATING)
- Action: Operator clicks terminate and selects "Mark Complete" or "Mark Failed"
- Expected Outcome: The Goal transitions to COMPLETED or FAILED. No further child tickets are spawned. Active children continue to completion but do not trigger further evaluation.

[SCN-08] Max children safety bound triggers
- Precondition: A Goal has spawned its configured maximum number of children (default 20) and the PM agent wants another
- Action: The PM agent attempts to propose child ticket beyond the limit
- Expected Outcome: The Goal enters PAUSED instead of spawning. The operator is notified and can extend the limit or terminate.

[SCN-09] PM agent handles child failure gracefully
- Precondition: A Goal has a child ticket that failed
- Action: The PM agent evaluates the failure in the context of the overall goal
- Expected Outcome: The evaluation artifact includes failure context. The PM agent proposes a corrective action (retry with different approach, continue with other work, or note inability). The Goal does not automatically fail.

[SCN-10] Enable and use per-ticket approval mode
- Precondition: Operator has a high-risk Goal where they want to review each proposal
- Action: Operator enables approval mode on the Goal; PM agent produces a proposal
- Expected Outcome: The Goal enters PENDING_APPROVAL. The proposal is visible. The operator can approve (spawns the ticket), modify, or reject (PM agent re-evaluates). The ticket is not spawned until approved.

[SCN-11] Create a Goal via CLI
- Precondition: Operator has the Helix CLI installed and authenticated
- Action: Operator runs `hlx goals create --title "Automate RMA process" --description "..."` with optional `--max-children 15`
- Expected Outcome: A new Goal is created and the operator receives confirmation with the Goal ID

[SCN-12] Navigate between Goal and child ticket views
- Precondition: A Goal has child tickets
- Action: Operator clicks a child ticket in the Goal's child tree
- Expected Outcome: The standard ticket detail view opens (separate page). The ticket shows a reference to its parent Goal. Goal UI and ticket UI remain distinct experiences.

[SCN-13] View evaluation history for a Goal
- Precondition: A Goal has had multiple evaluation cycles
- Action: Operator views the evaluation history in the Goal detail
- Expected Outcome: All past evaluations are listed chronologically, each showing the Assessor artifact, Decider output, verdict, and which child triggered it

## Key Design Principles

1. **Goals are not tickets** — Goals have a fundamentally different UX: child management, evaluation results, preview forecasts, and roadmap tracking. They get their own entity, API, and UI.
2. **Artifact-then-decision** — The PM agent first produces an objective assessment artifact, then a separate decision-making aspect reads that artifact and acts. Assessment is decoupled from action.
3. **One ticket at a time** — The PM agent evaluates after each child completes and proposes one next action. Maximally informed, naturally adaptive, simpler reasoning.
4. **Autonomous by default** — The PM agent runs without human approval gates. Safety comes from bounds, visibility, and the option to intervene — not from gatekeeping.
5. **Measuring over predicting** — The evaluation of what was actually built drives next actions. Decomposition is advisory (living roadmap), not the orchestration driver.
6. **Bias toward completion** — The PM agent requires concrete, specific evidence before proposing additional work. Vague "could be better" assessments do not generate tickets. Anchor to stated criteria, not invented ones.

## Scope & Constraints

- **Three repos with code changes**: helix-global-server (primary — schema, services, API, PM agent), helix-global-client (secondary — dedicated Goal UI), helix-cli (tertiary — `hlx goals` commands).
- **Greenfield**: Zero Goal tables, columns, statuses, or UI components exist today. Entirely additive.
- **Separate from TicketStatus**: Goals use their own GoalStatus enum. No modifications to the existing 17-value TicketStatus enum. Child tickets remain standard tickets with standard statuses.
- **TicketStatus has 17 values**: Verified against production. Includes NEEDS_CREDENTIALS and IMPOSSIBLE_SPEC (not listed in research report). SIDE_QUEST_PENDING does not exist and is not needed — GoalStatus.ACTIVE serves the waiting-for-child role.
- **Orchestrator coupled to Ticket via SandboxRun**: The initial setup pipeline (scout/diagnosis/product) needs to work within the existing orchestrator. A setup ticket pattern or similar integration approach is required.
- **Playbook-independent**: Core Goals do not depend on RSH-411 Playbook Phase 1.
- **Schema migration required**: Prisma file-based migration (58 existing migrations, `prisma migrate deploy` at build time).
- **Existing ticket UI and behavior unchanged**: Goals do not modify any existing ticket functionality.

## Future Considerations

- Nested Goals: Goals spawning sub-Goals for large multi-phase initiatives.
- Multi-ticket proposals and parallel child execution.
- Playbook-enhanced evaluation (PM agent receives Playbook rules as additional context, depends on RSH-411).
- Goal progress dashboard: aggregate view of all active Goals with progress indicators.
- PM agent calibration learning from evaluation history and operator interventions.
- Goal graph visualization: interactive DAG of Goal → children with evaluation facets.
- Cross-organization Goal patterns: templates for common business objectives.

## Open Questions / Risks

| # | Question / Risk | Status |
|---|-----------------|--------|
| 1 | **PM agent invocation mechanism** — How is the PM agent invoked? Claude API call within the request cycle, background job, or separate process? The PM agent is architecturally distinct from pipeline agents; its runtime mechanism needs design. | Open |
| 2 | **Setup ticket integration** — The orchestrator requires a ticketId (via SandboxRun). How does Goal initial setup (scout/diagnosis/product) integrate? A paired "setup ticket" or adapted orchestrator call is needed. | Open |
| 3 | **Dual-aspect prompt boundary** — Two separate Claude API calls (Assessor then Decider) or two structured prompts within one session? Separate calls are cleaner for auditability but double latency and cost. | Open |
| 4 | **LLM output robustness** — PM agent LLM calls will face malformed JSON, content-filter trips, and dropped fields in real use. Zod-validated parsing and retry-with-correction loops are needed (existing `walkthrough-service.ts` provides a defensive parsing reference but lacks Zod and retry). | Risk — must be addressed |
| 5 | **Retry / timeout / backoff strategy** — How many retries per LLM call, what backoff, what counts as terminal vs. transient failure, what timeout? Must be specified concretely, not as a verb. | Risk — must be addressed |
| 6 | **Concurrent evaluation race conditions** — Multiple child completions or manual reruns could trigger concurrent evaluations on the same Goal. Atomic status transitions (e.g., `UPDATE WHERE status='ACTIVE'` returning rowcount) needed to prevent clobber. | Risk — must be addressed |
| 7 | **Approval workflow completeness** — PENDING_APPROVAL state exists in the design, but the full workflow (where does the proposal live, approve/reject endpoints, what happens on reject) must be fully specified. | Risk — partially designed |
| 8 | **First-child cold start** — For the first evaluation (no completed children), the PM agent has only the goal description and setup artifacts. Goals may need richer descriptions than tickets to produce a good first proposal. | Risk — document requirement |
| 9 | **Cost per Goal** — Two LLM calls per evaluation × up to 20 evaluations = 40 LLM calls per Goal upper bound. At Sonnet-class pricing with ~5K-context evaluations, expect ~$1-3/goal floor. Worth monitoring. | Risk — informational |
| 10 | **PM agent calibration** — Over-conservative (endlessly proposing polish) or over-permissive (declaring done prematurely). Protocol mitigations designed but untested. Calibration eval fixtures should be part of PM agent implementation DoD. | Risk — requires tuning |
| 11 | **Context window management** — As children accumulate (up to 20), PM agent input context grows. Summarization strategy (older children summarized, latest child in full, criteria always in full) specified but not validated. | Risk |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md Research Report (RSH-488) | Primary specification for Goals & PM Agent | 7-question evaluation protocol, per-ticket triggers, autonomous execution, entity model analyzed, lifecycle and phasing defined |
| ticket.md Continuation Context (user code review) | User design directives that resolve open questions and identify design gaps | Separate entity decided, separate UI decided, dual-phase PM agent decided, 6 design gaps identified (LLM parsing, retry, races, approval workflow, cold start, cost) |
| ticket.md Description | Ticket intent | "Goals can be their own thing. They don't need to be tickets" |
| scout/scout-summary.md (helix-global-server) | Server-side verified state and extension points | 17 TicketStatus, 5 TicketMode, no Goal code exists, resolveDependentTickets at line 1724, completion hooks at 1544/2636, RESEARCH mode filtering precedent |
| diagnosis/diagnosis-statement.md (helix-global-server) | Corrected schema facts, service architecture, 6 design gaps confirmed | GoalStatus enum, GoalEvaluation model, goal-service.ts architecture, Zod validation needed, atomic transitions needed, PENDING_APPROVAL state needed |
| scout/reference-map.json (helix-global-server) | File locations and verified facts | createTicketForOrganization at line 646, callClaude/parseCodeTourJson patterns in walkthrough-service.ts, 58 existing migrations |
| scout/scout-summary.md (helix-global-client) | Client architecture and pattern files | React 19 + RR v7 + TanStack RQ v5 + Tailwind v4; 2,921-line ticket-detail.tsx NOT to modify; OKLCH token pattern |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client change scope and constraints | All greenfield Goal UI: routes, pages, components, API hooks, styling; no modifications to existing ticket UI |
| scout/scout-summary.md (helix-cli) | CLI structure and pattern | VALID_MODES unchanged; new `hlx goals` command family needed |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change scope | New src/goals/ directory; create, list, get, terminate subcommands |
| diagnosis/diagnosis-statement.md (library) | Prior implementation plan assessment | Prior RSH-534 report built on two rejected premises (TicketMode + single-call PM agent); full rewrite needed |
