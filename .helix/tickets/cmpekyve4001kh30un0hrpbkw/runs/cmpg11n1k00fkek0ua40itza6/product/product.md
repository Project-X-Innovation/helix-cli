# Product: Goals & PM Agent (Ralph Loop)

## Problem Statement

Helix today is a ticket-in, result-out system. Each ticket executes an independent MVP unit in isolation. There is no mechanism to coordinate multiple tickets toward a larger business objective, iterate toward polish, or drive work from a high-level intent ("automate our RMA process") to polished completion. Users who need multi-ticket outcomes must manually create follow-up tickets, decide what to do next, and track whether their objective has been met. This creates a gap between what users actually want (a finished, polished result) and what Helix delivers (a single MVP per ticket).

## Product Vision

Introduce **Goals** as the while-loop around tickets. A Goal takes a high-level business objective and drives it to completion through a **PM agent** that autonomously evaluates progress after each child ticket completes, proposes the single most valuable next action, and spawns it -- one ticket at a time, each decision made with full knowledge of what concretely exists. Goals transform Helix from a ticket executor into a goal-reacher.

## Users

- **Helix operators**: Business users who submit high-level objectives and want polished, complete outcomes without manually managing iterative ticket creation.
- **System administrators**: Users who monitor Goal progress, review PM agent decisions, and intervene when needed (terminate, redirect, enable approval gates).

## Use Cases

1. **Multi-ticket business objectives**: User has an objective that requires more than one ticket to accomplish (e.g., "build a reporting dashboard with data ingestion, visualization, and export").
2. **Iterative polish**: User wants a result that goes beyond MVP -- hardened, verified, and polished through multiple passes.
3. **Autonomous overnight execution**: User submits a Goal and lets the PM agent iterate overnight without manual approval for each step.
4. **Visibility into planned work**: User wants to see what the PM agent plans to do next (previews) and how the overall plan has evolved (living roadmap).

## Core Workflow

1. User creates a Goal with a title (objective statement) and description (detailed criteria for success).
2. The system runs an initial setup (scout/diagnosis/product) to understand the objective.
3. The PM agent proposes the first child ticket and spawns it autonomously.
4. The child ticket executes through the standard pipeline (BUILD, FIX, RESEARCH, etc.).
5. When the child completes, the PM agent evaluates the full picture using 7 structured questions: Is it matching? Is there more to do? Does it need polish? Are all boxes checked? Can something be added? Can something be fixed? Can something be verified?
6. If the objective is not yet met, the PM agent proposes the next ticket, updates the living roadmap, generates 2-3 preview forecasts, and spawns the next child.
7. If the objective is met, the Goal completes. All success criteria mapped to concrete evidence.

## Essential Features (MVP)

1. **Goal creation**: Users can create Goals with an objective and success criteria.
2. **PM agent evaluation loop**: After each child ticket completes, the PM agent runs a 7-question evaluation protocol and produces a verdict (complete or next_ticket).
3. **Autonomous child spawning**: PM agent spawns the next child without human approval. One ticket at a time.
4. **EVALUATING status**: New status representing the state where the PM agent is running its evaluation.
5. **SIDE_QUEST_PENDING status**: Status representing a Goal waiting for its active child ticket to complete (note: does not currently exist in schema despite research report assumption).
6. **Parent-child ticket tracking**: Relation between a Goal and its child tickets, with child type classification (BREADTH, DEPTH, POLISH, VERIFY).
7. **Safety bounds**: Max 20 children (configurable), manual termination, idle timeout for stalled Goals.
8. **Preview forecasts**: PM agent outputs 2-3 non-binding forecast tickets each cycle, visible to the operator.
9. **Living roadmap**: Continuously updated plan reflecting what has been completed, current assessment, and projected remaining work.
10. **Pipeline filtering**: Goal mode executes only scout/diagnosis/product setup, then enters the PM agent loop (not the standard 9-step pipeline).
11. **Goal-specific UI**: Child tree view, PM agent evaluation display, preview panel, roadmap view.
12. **CLI support**: Users can create Goals via `hlx tickets create --mode GOAL`.
13. **Operator controls**: Terminate (mark complete or failed), optional per-ticket approval mode for high-risk Goals.

## Features Explicitly Out of Scope (MVP)

- **Nested Goals**: Goals spawning sub-Goals. MVP is flat (Goal -> child tickets only).
- **Multi-ticket proposals**: PM agent proposing more than one ticket at a time.
- **Parallel child execution**: Multiple children running concurrently. MVP is sequential.
- **Playbook-enhanced evaluation**: PM agent receiving Playbook rules as evaluation context (requires RSH-411 Phase 1).
- **Predictive estimation**: Using Goal history to estimate child count/timeline for new Goals.
- **Retroactive Goal assignment**: Attaching existing tickets to a Goal after creation.
- **Goal-to-Goal dependencies**: Sequencing Goals against each other.
- **Goal progress dashboard**: Aggregate view of all active Goals.

## Success Criteria

1. A user can create a Goal with a title and success criteria, and the system runs the initial setup pipeline (scout/diagnosis/product).
2. After setup, the PM agent proposes and spawns the first child ticket autonomously.
3. When a child ticket completes, the Goal transitions to EVALUATING and the PM agent runs the 7-question evaluation protocol, producing a structured verdict.
4. If the verdict is "next_ticket," the PM agent spawns the next child and the Goal cycles back to waiting. If "complete," the Goal finishes.
5. Preview forecasts (2-3 tickets) and living roadmap are updated each cycle and visible to the operator.
6. Safety bounds are enforced: a Goal with 20 children pauses for human decision; operator can terminate at any time.
7. A single child failure does not fail the Goal -- the PM agent evaluates the failure in context and decides the next action.
8. Goal mode is selectable in the client UI and CLI.

## User Scenarios

[SCN-01] Create a new Goal
- Precondition: User is logged in and has access to create tickets/goals
- Action: User creates a Goal with a title describing the business objective and a description containing success criteria
- Expected Outcome: The Goal is created and enters the initial setup pipeline (scout/diagnosis/product). The user sees the Goal in their list with a status indicating setup is in progress.

[SCN-02] PM agent proposes first child ticket after setup
- Precondition: A Goal has completed its initial setup pipeline
- Action: The PM agent evaluates the Goal objective and proposes the first child ticket
- Expected Outcome: A child ticket is created and begins executing. The Goal status reflects that a child is in progress. The user can see the child ticket linked to the Goal.

[SCN-03] PM agent evaluates after child completion
- Precondition: A Goal's child ticket has completed successfully
- Action: The system triggers the PM agent evaluation
- Expected Outcome: The Goal enters the EVALUATING state. The PM agent produces a structured evaluation answering all 7 questions, with a verdict of either "complete" or "next_ticket." The evaluation results are visible to the user.

[SCN-04] PM agent continues with next ticket
- Precondition: The PM agent has evaluated and determined the objective is not yet met
- Action: The PM agent proposes and spawns the next child ticket
- Expected Outcome: A new child ticket is created with a rationale explaining which evaluation question motivated it. The Goal returns to waiting status. Preview forecasts and roadmap are updated and visible.

[SCN-05] Goal completes when objective is met
- Precondition: The PM agent has evaluated and all 7 questions indicate the objective is fully met
- Action: The PM agent declares the Goal complete
- Expected Outcome: The Goal transitions to a completed state. The rationale maps each success criterion to the child ticket that addressed it. No further children are spawned.

[SCN-06] View preview forecasts
- Precondition: A Goal has at least one completed child and the PM agent has run an evaluation
- Action: User views the Goal's preview forecasts
- Expected Outcome: The user sees 2-3 non-binding forecast tickets showing what the PM agent anticipates doing next, each with a facet label and child type classification.

[SCN-07] View living roadmap
- Precondition: A Goal exists with at least one completed evaluation cycle
- Action: User views the Goal's living roadmap
- Expected Outcome: The user sees the current roadmap showing completed work summary, current assessment, and projected remaining work. The roadmap reflects updates from the most recent evaluation.

[SCN-08] Safety bound triggers at max children
- Precondition: A Goal has reached its configured maximum number of children (default 20)
- Action: The PM agent attempts to propose another child ticket
- Expected Outcome: The Goal pauses instead of spawning a new child. The user is notified that the max children limit has been reached and must decide whether to extend the limit or mark the Goal complete.

[SCN-09] Operator terminates a Goal
- Precondition: A Goal is active (in any non-terminal state)
- Action: The operator chooses to terminate the Goal, selecting either "complete" or "failed"
- Expected Outcome: The Goal transitions to the selected terminal state immediately. No further child tickets are spawned. Active children continue to completion but do not trigger further evaluation.

[SCN-10] PM agent handles child failure
- Precondition: A Goal's child ticket has failed
- Action: The system triggers the PM agent evaluation with failure context
- Expected Outcome: The Goal enters EVALUATING. The PM agent evaluates whether to retry the same scope, try a different approach, or continue with other work. The Goal does not automatically fail.

[SCN-11] Create Goal via CLI
- Precondition: User has the Helix CLI installed and authenticated
- Action: User runs `hlx tickets create --mode GOAL` with a title and description
- Expected Outcome: The Goal is created successfully. The CLI confirms creation and the Goal begins its setup pipeline.

[SCN-12] View child tree with type classification
- Precondition: A Goal has multiple completed children
- Action: User views the Goal detail page
- Expected Outcome: The user sees a child tree showing all children with their status, title, and type classification (BREADTH, DEPTH, POLISH, or VERIFY). The tree reflects the order of completion.

## Key Design Principles

1. **Evaluation-driven, not plan-driven**: The PM agent evaluates what was actually built after each child, rather than executing a predetermined plan. Decomposition serves as an advisory roadmap, not the orchestration driver.
2. **One ticket at a time**: The PM agent proposes and evaluates single tickets sequentially. This produces maximally informed decisions and is aligned with current LLM capabilities.
3. **Autonomous by default**: The PM agent runs without human approval gates. Safety comes from bounded scope (max children, per-ticket MVPs), transparency (previews, roadmap, audit trail), and manual termination -- not from gatekeeping.
4. **Bias toward completion**: The PM agent requires concrete, specific evidence before proposing additional work. Vague "could be better" assessments do not generate tickets. Anchor to stated criteria, not invented ones.
5. **Transparency over control**: Operators see what the PM agent is thinking (evaluation answers), planning (previews), and tracking (roadmap). Intervention is available but optional.

## Scope & Constraints

- **Entity model is an open design question**: Whether Goals are a new TicketMode or a separate database entity must be resolved before implementation. The user leans toward a separate entity ("goals can be their own thing. They don't need to be tickets"). The research report recommends prototyping both.
- **Three repos affected**: helix-global-server (primary -- schema, services, API), helix-global-client (secondary -- types, UI components), helix-cli (tertiary -- mode addition).
- **No Playbook dependency**: Core Goals work independently of the Playbook feature (RSH-411). Playbook-enhanced evaluation is explicitly post-MVP.
- **Schema migration required**: Any schema changes must include committed Prisma migration files (file-based migration strategy, 57 existing migrations).
- **SIDE_QUEST_PENDING does not exist**: The research report assumes this status exists, but it does not. Two new TicketStatus values are needed (EVALUATING and SIDE_QUEST_PENDING), not one.

## Future Considerations

- Goal progress dashboard: aggregate view of all active Goals
- Nested Goals: Goals spawning sub-Goals for large multi-phase initiatives
- Multi-ticket proposals and parallel child execution
- Playbook-enhanced evaluation (Tier 2, post-RSH-411)
- PM agent calibration learning from evaluation history and operator interventions
- Goal graph visualization (interactive DAG)

## Open Questions / Risks

| # | Question / Risk | Status |
|---|-----------------|--------|
| 1 | **Entity model**: TicketMode vs. separate Goal entity? User leans toward separate entity. Research report recommends prototyping both. Must be resolved before implementation. | Open |
| 2 | **PM agent invocation mechanism**: How is the PM agent invoked? Claude API call, background process, or sprite? Architecturally distinct from pipeline agents. | Open -- technical unknown |
| 3 | **Preview lifecycle**: When does a preview become the actual next ticket? Currently previews are replaced wholesale each cycle. | Open |
| 4 | **Roadmap schema**: Exact JSON structure for the living roadmap artifact? Current spec has `completed_summary`, `current_assessment`, `projected_remaining` -- may evolve. | Open |
| 5 | **SIDE_QUEST_PENDING discrepancy**: Research report states "EVALUATING is the only new TicketStatus addition" but SIDE_QUEST_PENDING is absent from schema/production. Two new statuses needed. | Identified by scout/diagnosis |
| 6 | **Per-ticket evaluation + `/after` chains**: How does evaluation interact with `afterTicketId` sequential dependencies? MVP assumes Goal children are independent. | Open |
| 7 | **PM agent calibration risk**: Over-conservative agent (endlessly proposing polish) or over-permissive agent (declaring done prematurely). Mitigations designed but untested. | Risk -- requires tuning |
| 8 | **Context window management**: As children accumulate (up to 20), the PM agent's input context grows. Summarization strategy specified but not validated. | Risk |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (all repos) | Primary specification via Research Report RSH-488 | Comprehensive Goals spec: lifecycle, PM agent 7-question evaluation protocol, parent-child design, cross-repo impact, phasing plan, open design questions |
| scout/scout-summary.md (helix-global-server) | Server-side change scope and extension points | resolveDependentTickets pattern at line 1724, completion hooks at lines 1544/2636, RESEARCH mode filtering precedent, SIDE_QUEST_PENDING discrepancy |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause analysis and evidence | Confirmed 17 statuses (not 15), no parent-child columns, two new statuses needed, Sprint.goal no collision |
| scout/scout-summary.md (helix-global-client) | Client-side change scope | 11 files, RESEARCH mode precedent for mode-specific rendering, type definition patterns |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client evidence summary | const-as-const type patterns, OKLCH color token pattern, platform config gating |
| scout/scout-summary.md (helix-cli) | CLI change scope | 1 code change (VALID_MODES) + 3 doc string updates |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI evidence summary | Minimal change: array element + help text updates |
| repo-guidance.json (library run root) | Repo intent mapping | helix-global-server primary target, helix-global-client secondary, helix-cli tertiary, library context-only |
