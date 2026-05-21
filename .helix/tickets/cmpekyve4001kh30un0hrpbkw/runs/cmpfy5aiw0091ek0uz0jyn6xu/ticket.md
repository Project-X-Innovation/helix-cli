# Ticket Context

- ticket_id: cmpekyve4001kh30un0hrpbkw
- short_id: RSH-534
- run_id: cmpfy5aiw0091ek0uz0jyn6xu
- run_branch: helix/research/RSH-534-goals-the-pm-agent-x-ralph-loop-implementation
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Goals: The pm agent x Ralph Loop | Implementation plan

## Description
Give me an implementation plan



To me it seems like goals can be their own thing. They don't need to be tickets

## Research Report

# Goals: The PM Agent x Ralph Loop

**Research Report -- RSH-488**
**Date**: May 20, 2026
**Status**: Revised
**Revision**: Design direction revision -- incorporating user design decisions (continuation 4)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What is a Goal?](#2-what-is-a-goal)
3. [The PM Agent](#3-the-pm-agent)
   - 3.1 Concept
   - 3.2 PM Agent Inputs
   - 3.3 Evaluation Protocol
   - 3.4 PM Agent Outputs
   - 3.5 Per-Ticket Evaluation Trigger
   - 3.6 PM Agent Calibration
   - 3.7 Worked Examples
   - 3.8 Prompt Architecture Concepts
   - 3.9 Edge Cases
   - 3.10 Safety Bounds & Autonomous Execution
4. [Implementation Reference](#4-implementation-reference)
5. [Phasing, Open Questions & Future Work](#5-phasing-open-questions--future-work)

---

## 1. Executive Summary

A Goal is the while-loop around tickets. It takes a high-level business objective -- "automate our RMA process," "build a reporting dashboard" -- and drives it to polished completion through a **PM agent** that evaluates, proposes, and iterates autonomously. After each child ticket completes, the PM agent evaluates the concrete result: Is it matching? Is there anything more to do? Does it need polish? Are all the boxes checked? Can something be added, fixed, or verified? If the objective is not yet met, the PM agent proposes the single most valuable next ticket, updates its living roadmap, generates preview forecasts of upcoming work, and spawns the ticket -- all without human approval by default. One ticket at a time, each decision made with full knowledge of what concretely exists.

Today, Helix is a ticket-in, result-out system. Each ticket is an independent MVP unit -- scoped, executed, and completed in isolation. There is no mechanism to coordinate multiple tickets toward a larger business objective, iterate toward polish, or bridge the gap between declarative business intent and imperative execution. Goals and the PM agent together transform Helix from a ticket executor into a goal-reacher -- an autonomous project manager that stacks MVPs in breadth, depth, polish, and verification until a business objective is truly done.

This checking approach is simpler and more reliable than predicting all needed work upfront. Decomposition -- breaking a goal into a plan of child tickets -- remains useful as an **advisory living roadmap**, thinking ahead about what might be needed. But it is not the orchestration driver. The real-time evaluation of what was actually built decides what happens next. As a compass, decomposition helps orient; as a GPS with turn-by-turn directions, it is too brittle. The beauty of having each ticket done already: you get to see it now, and decide what's next from concrete evidence.

The central design tension -- whether Goals should be a ticket type or a separate entity -- is an **open design question** explored in Section 2.2. Both approaches are viable. A GOAL TicketMode inherits existing lifecycle infrastructure; a separate Goal entity enables purpose-built UX for a fundamentally different experience. The tradeoffs are analyzed honestly; the implementation phase should prototype both and decide.

**Key decisions:**

| # | Decision | Recommendation |
|---|----------|---------------|
| 1 | Goal model | **Open design question** -- TicketMode reuses infrastructure; separate entity enables purpose-built UX. See Section 2.2 for analysis. |
| 2 | Primary mechanism | **PM agent evaluation** -- agent-driven evaluation after each child ticket; one at a time |
| 3 | Parent-child | **`parentTicketId` self-relation** (or Goal foreign key) -- designed from Goals' own requirements |
| 4 | Execution model | **Autonomous by default** -- PM agent evaluates, proposes, spawns without human gates. Safety from max 20 children, previews, living roadmap, manual termination |
| 5 | Visibility | **Preview tickets + living roadmap** -- non-binding forecasts of upcoming work; roadmap updated after every evaluation cycle |
| 6 | Decomposition role | **Advisory living roadmap** -- non-binding input to the PM agent, not the orchestration driver |
| 7 | Playbook dependency | **Core Goals are Playbook-independent**; Playbook-enhanced Goals require RSH-411 Phase 1 |

---

## 2. What is a Goal?

### 2.1 Background

This report builds on two prior research efforts:

- **RSH-411** (Business Rules & Playbook, 1,464 lines) recommended Goals as a ticket concept in Phase 2 of the Playbook rollout. Section 7: *"Goals do not belong in the Playbook. They should become a new ticket mode: GOAL."* Four arguments: Playbook stays clean (Goals are transient, rules are perpetual), Goals trace to outcomes through tickets, tickets already have lifecycle machinery, the ticket model gains purpose as a link from intent to implementation.

- **RSH-193** (Side Quests, 823 lines) explored parent-child concepts for ticket spawning. That research informed this design -- particularly the idea of a `parentTicketId` relation and child-ticket tracking -- but SideQuests have not been implemented. Goals design their own parent-child infrastructure from their own requirements.

Neither predecessor defined the Ralph Loop evaluation mechanism -- how the system iteratively evaluates whether a Goal's objective is met after each child ticket, using an agent-driven PM agent rather than waiting for all children to batch-complete. That is the central contribution of this report.

### 2.2 Design Decision: Entity Model

The ticket description surfaces a fundamental design tension: should Goals be a ticket type (a new TicketMode) or a separate entity that spawns and manages tickets? This is an **open design question** with legitimate arguments on both sides. The implementation phase should prototype both approaches.

**Option A: GOAL as TicketMode**

Goals are tickets that inherit all existing lifecycle infrastructure but with mode-specific behavior:

- **Infrastructure reuse.** Tickets already provide 15 statuses, assignment, discussion, artifacts, sprint association, notifications, and full client UI. A GOAL TicketMode reuses all of this.
- **RESEARCH mode precedent.** RESEARCH tickets use the same entity but skip implementation-focused steps and produce a report instead. GOAL tickets could follow the identical pattern: skip implementation/deployment steps, enter the PM agent evaluation loop. Different pipeline, same entity.
- **Single data model.** No new tables, no new CRUD layer. Adding GOAL as the sixth TicketMode value is a minimal schema change.

**Option B: Separate Goal Entity**

Goals are a purpose-built entity with their own table, API, and UI:

- **Fundamentally different experience.** A Goal's primary UX is seeing its child ticket tree, PM agent evaluation results, preview forecasts, and a living roadmap. A ticket's primary UX is seeing its implementation progress through the 9-step pipeline. These experiences are different enough that a separate entity may serve users better than overriding ticket views with goal-specific layouts.
- **CRUD cost is bounded.** With modern tooling and coding agents, building a Goal table with create/read/update endpoints is an hour of work, not a week. The infrastructure reuse argument carries less weight when the cost of building new infrastructure is genuinely low.
- **Clean extensibility.** Future concepts -- campaigns, initiatives, multi-goal programs -- can extend the Goal entity without further overloading the Ticket model.
- **No SideQuest constraint.** RSH-193's `parentTicketId` was designed as a Ticket self-relation, but SideQuests were never implemented. There is no existing infrastructure to be compatible with. A Goal entity can define its own relationship to tickets (a `goalId` foreign key on Ticket, or a junction table).

**Engaging the tradeoffs directly:**

1. *"A goal has a totally different experience."* This is true. The Goal experience is child-tree navigation, PM agent evaluation display, preview exploration, and roadmap tracking. The ticket experience is implementation progress through scout/diagnosis/product/implementation/verification/deployment. Shoehorning the Goal experience into ticket views requires extensive mode-specific overrides for most UI components.

2. *"CRUD cost is overhyped."* Also true. With modern code generation and coding agents, the incremental cost of a new table + basic API is bounded. The "3-5x implementation effort" estimate from prior iterations was overstated. The real question is not cost but coherence: does a separate entity make the system clearer or more complex?

3. *"RSH-193 compatibility is not evidence."* Correct. SideQuests were never implemented. Compatibility with a non-existent feature is not a design constraint.

**Recommendation:** Both paths are technically sound. The TicketMode approach minimizes initial implementation effort; the separate entity approach invests in a purpose-built experience. The strongest argument for TicketMode is the RESEARCH mode precedent -- it proves the pattern works for radically different pipelines on the same entity. The strongest argument for a separate entity is the UX divergence -- Goals are not just "tickets with a different pipeline" but a fundamentally different user experience centered on child management, evaluation, and previews. The implementation phase should build a quick prototype of both and decide based on the actual UX quality achieved.

### 2.3 Goal Lifecycle

A Goal's lifecycle is distinct from standard tickets. Where a BUILD ticket moves through implementation and deployment, a Goal moves through initial setup and then enters the PM agent's autonomous evaluation loop:

```
DRAFT --> QUEUED --> RUNNING (initial setup: scout/diagnosis/product)
                       |
                       v
            PM agent proposes first ticket
                       |
                       v
            Spawn first ticket autonomously
                       |
                       v
            SIDE_QUEST_PENDING (one child executing)
                       |
                  child completes
                       |
                       v
                  EVALUATING (PM agent runs)
                       |
                  +----+----+
                  |         |
             objective   objective
             NOT met     MET
                  |         |
                  v         v
         PM agent       REPORT_READY
         proposes       (Goal complete)
         next ticket,
         updates roadmap,
         generates previews
                  |
                  v
         Spawn ticket --> SIDE_QUEST_PENDING
                               |
                          (loop back to child completes)
```

The critical difference from a batch model: the Goal cycles between SIDE_QUEST_PENDING and EVALUATING after **each** child ticket. There is no waiting for all children to finish. Each evaluation is based on the concrete state of what was actually built so far. There is no human approval gate in the main loop -- the PM agent runs autonomously, with previews and the living roadmap providing visibility.

**Status mapping:**

| Status | Applies to Goals? | Meaning for Goals |
|--------|-------------------|-------------------|
| `QUEUED` | Yes | Waiting for setup pipeline |
| `RUNNING` | Yes | Initial setup executing (scout/diagnosis/product) |
| `SIDE_QUEST_PENDING` | Yes | Waiting for a child ticket to complete |
| `DRAFT` | Yes | Created but not yet submitted |
| `WAITING` | Yes | Waiting for `afterTicketId` predecessor |
| `FAILED` | Yes | Unrecoverable failure or operator terminated |
| **`EVALUATING`** | **Yes (new)** | Child completed; PM agent evaluating |
| `REPORT_READY` | Yes | Goal complete -- objective met |
| `IN_PROGRESS` | No | Implementation-specific |
| `MERGING`, `DEPLOYING`, `SANDBOX_READY`, `VERIFYING`, `PREVIEW_READY`, `STAGING_MERGED`, `DEPLOYED`, `UNVERIFIED` | No | Code/deployment states -- not applicable |

`EVALUATING` is the only new TicketStatus addition.

### 2.4 Goal Pipeline

Goals use a minimal initial setup pipeline, then enter the event-driven PM agent loop:

| Pipeline Step | Standard Ticket | RESEARCH Ticket | GOAL Ticket |
|---------------|----------------|-----------------|-------------|
| scout | Yes | Yes | Yes |
| diagnosis | Yes | Yes | Yes |
| product | Yes | Yes | Yes |
| tech-research | Yes | Yes | No |
| implementation-plan | Yes | No | No |
| implementation | Yes | No | No -- replaced by PM agent loop |
| code-review | Yes | No | No |
| verification | Yes | Yes | No -- verification per-child |
| preview-config | Yes | No | No |

After the 3-step setup (scout/diagnosis/product), the PM agent proposes the first child ticket and the autonomous evaluation loop begins. The PM agent loop is not a pipeline step -- it is event-driven, triggered by child completion.

### 2.5 Goal Fields

Whether Goals are a TicketMode or a separate entity, they carry these fields:

| Field | Goal Usage |
|-------|-----------|
| `title` | The Goal's objective statement |
| `description` | Detailed objective with success criteria |
| `mode` (if TicketMode) | `GOAL` |
| `status` | Goal-specific transitions (see above) |
| `maxChildren` | Configurable limit, default 20 |
| `afterTicketId` | Optional: sequence Goals or make a Goal depend on another ticket |
| `sprintId` | Optional: assign to a sprint for tracking |

Goal-specific metadata (`advisoryRoadmap` JSON, `previews` JSON) stored as artifacts for MVP, promoted to dedicated fields if query patterns demand it.

### 2.6 Relationship to SideQuests

RSH-193 explored parent-child concepts for SideQuests. That research informed Goals' design, but SideQuests have not been implemented. If SideQuests are implemented later, they may reuse Goals' parent-child infrastructure.

---

## 3. The PM Agent

### 3.1 Concept

The PM agent is the check-act-repeat mechanism that distinguishes Goals from simple ticket decomposition. The ticket description defines the core idea:

> "It's some kind of mechanism that lets you check to see if something is accomplished and then lets you do some set of actions if it is not."

> "The idea is that a goal is more than one ticket and it contains a mechanism for perfecting something. Tickets are MVPs by definition. Most of the time when I actually do something, it needs to be a polished finished project."

The PM agent transforms Helix's ticket execution from a one-shot model into an iterative refinement model. After **each** child ticket completes, the PM agent evaluates the full picture -- all completed work, current codebase state, the Goal's success criteria -- and makes a maximally informed decision about the single most valuable next action.

The user's key insight: *"You don't need to predict all the work ahead of time -- you just need to answer 'is there more to do?' after each step and propose the next one."* And: *"The beauty of having it done already: you get to see it now."*

The PM agent is architecturally distinct from the 9-step pipeline agents (scout, diagnosis, product, etc.). Those agents run within a ticket's pipeline. The PM agent is a **separate live agent** running its own evaluation loop -- a dual-agent architecture. The pipeline agents execute tickets; the PM agent manages the Goal. It evaluates progress, proposes the next ticket, updates the roadmap, and generates preview forecasts. "Checker" understates its role; it is a project manager agent.

This is the central mechanism from MVP -- not deferred to a future phase. Autonomous execution (Section 3.10) provides the operating model; the PM agent provides the intelligence.

The full Ralph Loop flow:

```
                    +-------------------------------------+
                    |          GOAL CREATED                |
                    |   (title + description +             |
                    |    success criteria)                  |
                    +----------------+--------------------+
                                     |
                                     v
                    +-------------------------------------+
                    |      INITIAL SETUP                   |
                    |   (scout -> diagnosis -> product)    |
                    |   [PM agent initializes roadmap]     |
                    +----------------+--------------------+
                                     |
                                     v
                    +-------------------------------------+
                    |   PM AGENT: First Proposal            |
                    |   (Evaluates objective, proposes     |
                    |    first MVP-scoped ticket)           |
                    +----------------+--------------------+
                                     |
                                     v
                    +-------------------------------------+
                    |      CHILD TICKET EXECUTES           |
                    |   (standard pipeline: BUILD, FIX,    |
                    |    RESEARCH, etc.)                    |
                    +----------------+--------------------+
                                     |
                                child completes
                                     |
                                     v
                    +-------------------------------------+
                    |      PM AGENT EVALUATES               |
                    |                                      |
                    |   1. Is it matching?                  |
                    |   2. Is there more to do?             |
                    |   3. Does it need polish?             |
                    |   4. Are all boxes checked?           |
                    |   5. Can something be added?          |
                    |   6. Can something be fixed?          |
                    |   7. Can something be verified?       |
                    +----------------+--------------------+
                                     |
                            +--------+--------+
                            |                 |
                       Objective          Objective
                       NOT met            MET
                            |                 |
                            v                 v
                    +--------------+  +--------------+
                    | Propose next |  |    GOAL      |
                    | ticket with  |  |   COMPLETE   |
                    | rationale    |  | (REPORT_READY)|
                    +--------------+  +--------------+
                            |
                            v
                    +------------------+
                    | Update roadmap   |
                    | Generate         |
                    | previews (2-3)   |
                    +--------+---------+
                             |
                             v
                    +--------------+
                    |   Check      |
                    |   bounds     |
                    | (max 20      |
                    |  children)   |
                    +------+-------+
                           |
                      within bounds?
                      +----+----+
                      |         |
                     Yes       No
                      |         |
                      v         v
               Spawn ticket   Pause for
               autonomously   human review
                     |
                     v
              SIDE_QUEST_PENDING
                     |
                (loop back to "child completes")
```

### 3.2 PM Agent Inputs

The PM agent receives four categories of structured context:

**1. Goal objective and success criteria.** From the Goal's `title` and `description`. This is the calibration anchor -- everything the PM agent evaluates is measured against these criteria.

**2. Completed children summary.** A structured table of all completed child tickets:

| Child | Title | Mode | Status | Key Changes / Artifacts |
|-------|-------|------|--------|------------------------|
| 1 | Basic approval flow | BUILD | DEPLOYED | Added approve/reject endpoints, status transitions, basic UI |
| 2 | Email notifications | BUILD | DEPLOYED | Notification service, templates, delivery queue |
| ... | ... | ... | ... | ... |

The PM agent evaluates the cumulative result of ALL completed children -- not just the most recently completed child. Each evaluation has full visibility into everything built so far.

**3. Current state assessment.** What actually exists in the codebase now, gathered through scout-like context collection on relevant repos. This is the concrete evidence the PM agent evaluates -- not a description of what was planned, but what was actually built.

**4. Living roadmap.** A living planning document, initialized at Goal creation or by the PM agent during the first evaluation, and **updated after every evaluation cycle**. The roadmap reflects what has been learned from completed tickets -- not a static one-time estimate but a continuously revised plan. It might say "we anticipated needing email notifications, but the first ticket revealed we need error handling first." The roadmap evolves as the PM agent gains information from each completed ticket.

Decomposition is useful as this kind of thinking-ahead -- *"you can do a decomposition as an estimate, kinda thinking ahead what needs to get here. That would be helpful."* But: *"as the definitive decider [...] just focusing on the measuring is much simpler."* The living roadmap serves the "helpful estimate" role while being continuously updated with reality. Every time the PM agent evaluates, every time it makes a decision, the roadmap is updated.

### 3.3 Evaluation Protocol

The PM agent asks seven structured questions, derived from the user's enumerated evaluation facets. These questions are answered against the concrete evidence of what was actually built:

| # | Question | User's Facet | What It Checks |
|---|----------|-------------|----------------|
| 1 | **Is it matching?** | "checking if it's matching" | Does what was built align with the stated objective? Heading in the right direction? |
| 2 | **Is there anything more to do?** | "checking if there's anything more to do" | Are there success criteria not yet addressed? Something obviously missing? |
| 3 | **Does it need polish?** | "checking if any polishing" / "can I polish it" | Quality gaps: error handling, loading states, input validation, UX, performance, edge cases? |
| 4 | **Are all boxes checked?** | "checking if all the boxes have been checked" | Every explicit criterion from the Goal description accounted for? |
| 5 | **Can something be added?** | "can I add something" | Missing breadth: capabilities or features the objective implies but no ticket has addressed? |
| 6 | **Can something be fixed?** | "can I fix something" | Defects or issues in what was already built? Something not working correctly? |
| 7 | **Can something be verified?** | "can I verify something" | Untested assumptions or behaviors? Something that should be validated before declaring done? |

The user's "checking if it's met" is the overall verdict -- the answer the PM agent reaches after working through all seven questions. "Can I polish it" overlaps Q3 (the user lists polish twice, reflecting its importance). The protocol maps all 9 of the user's facets.

The PM agent works through these questions systematically, referencing concrete artifacts and code changes from completed children. The protocol is exhaustive by design -- no question is skipped, ensuring systematic coverage.

**Protocol mechanics:**

- **Order matters for early termination thinking.** Q1 (matching) is checked first because misalignment invalidates everything else. Q2 (more to do) catches obvious gaps before diving into quality questions. Q3-Q7 refine once the basics are covered.
- **Each answer cites evidence.** The PM agent does not answer "yes" or "no" in the abstract -- it references specific child tickets, artifacts, or code changes. "Is it matching? Yes -- child #1 implemented the approval flow, which is the core of the objective" is acceptable. "Is it matching? Yes" without evidence is not.
- **The verdict follows the protocol.** The PM agent cannot declare "complete" if any question revealed an unaddressed gap. It cannot propose a next ticket without identifying which question motivates it. The protocol output feeds directly into the verdict logic.
- **Previews and roadmap provide transparency.** The PM agent's per-question answers, preview forecasts, and updated roadmap are all visible -- making its reasoning transparent and auditable without requiring per-ticket approval.

### 3.4 PM Agent Outputs

The PM agent produces exactly one of two verdicts, plus preview forecasts and a roadmap update when proposing the next ticket:

**Output A: Goal complete.**

```json
{
  "verdict": "complete",
  "rationale": "All 3 success criteria met: approval flow (child #1, #4), email notifications (child #2), admin dashboard (child #3). Edge cases handled (#4). Email delivery verified end-to-end (#5). No concrete improvement can be articulated.",
  "roadmap_update": {
    "completed_summary": "5 tickets: approval flow, email, dashboard, edge cases, verification. All criteria met.",
    "current_assessment": "Objective fully met. No remaining work identified.",
    "projected_remaining": []
  }
}
```

The rationale explicitly maps each success criterion to the child ticket that addressed it. Goal transitions to REPORT_READY.

**Output B: Proposed next ticket.**

```json
{
  "verdict": "next_ticket",
  "proposal": {
    "title": "Add email notifications for RMA approval requests",
    "description": "Implement notification service: send email when approval requested, when approved, when rejected. Include configurable templates and delivery queue.",
    "mode": "BUILD",
    "facet": "Can something be added?",
    "childType": "BREADTH",
    "rationale": "Approval flow (child #1) is working. Email notifications are the second success criterion and have not been addressed. This is the most valuable next action because it completes the user-facing communication loop."
  },
  "previews": [
    {
      "title": "Admin dashboard for tracking RMA requests",
      "description": "Dashboard showing all RMA requests with status, assigned approver, and timeline.",
      "facet": "Can something be added?",
      "childType": "BREADTH",
      "rationale": "Third success criterion. After email notifications, this completes the breadth coverage."
    },
    {
      "title": "Error handling for approval edge cases",
      "description": "Handle concurrent approvals, expired requests, and notification delivery failures.",
      "facet": "Can something be fixed?",
      "childType": "DEPTH",
      "rationale": "Once core features are complete, hardening for real-world edge cases."
    }
  ],
  "roadmap_update": {
    "completed_summary": "Child #1 delivered basic approval flow with status transitions.",
    "current_assessment": "1 of 3 success criteria addressed. Core mechanism working.",
    "projected_remaining": ["Email notifications (next)", "Admin dashboard", "Edge case hardening", "End-to-end verification"]
  }
}
```

**Child type classification.** The `childType` field classifies the proposed ticket into one of four types:

| Type | Maps to | Purpose |
|------|---------|---------|
| **BREADTH** | Q2, Q5 | New capabilities addressing unmet criteria |
| **DEPTH** | Q6 | Fixing or improving existing work |
| **POLISH** | Q3 | Quality refinements (UX, performance, edge cases) |
| **VERIFY** | Q7 | Validation, testing, confirming assumptions |

The `facet` field indicates which evaluation question motivated this ticket. The `childType` classification is derived from the facet but may differ when the PM agent judges the nature of the work differently than the question category suggests.

**Previews** are non-binding forecasts -- the PM agent's estimate of what the next 2-3 tickets might be. They change after every evaluation cycle as the PM agent gains information. They are not commitments; they are visibility. They replace human approval as the awareness mechanism: instead of reviewing every proposal before it runs, the operator sees what's coming and can intervene if the direction looks wrong.

### 3.5 Per-Ticket Evaluation Trigger

Evaluation fires after **each** child ticket completes, not after all children batch-complete. This is the fundamental architectural choice.

**Technical mechanism.** The per-ticket evaluation trigger extends the existing `resolveDependentTickets()` pattern (ticket-service.ts, line 1716). When a child ticket with a parent Goal completes, a `resolveGoalParent()` function checks if the parent is a Goal. If so, the Goal transitions to EVALUATING and the PM agent runs.

**Hook points.** The evaluation trigger fires at the same post-success hook points where `resolveDependentTickets()` is called (orchestrator.ts, lines 1504 and 2338). Goal evaluation piggybacks on existing completion infrastructure.

**Goal state cycling:**

```
SIDE_QUEST_PENDING (waiting for child)
        |
   child completes
        |
        v
   EVALUATING (PM agent runs)
        |
   +----+----+
   |         |
   v         v
Propose   REPORT_READY
next      (Goal complete)
ticket
   |
   v
Update roadmap, generate previews
   |
   v
Spawn ticket autonomously
   |
   v
SIDE_QUEST_PENDING (next child executing)
```

**Why per-ticket, not batch?**

- **Maximally informed decisions.** The PM agent sees ALL completed work before proposing the next ticket. No wasted effort from speculative parallelization.
- **Naturally adaptive.** If the first ticket reveals the approach is wrong, the next proposal adapts immediately.
- **Simpler reasoning.** The PM agent evaluates one new result against the full picture. Single-variable change.
- **LLM-aligned.** Current LLMs are strong at evaluating concrete state and making contextual next-step decisions. They are weaker at comprehensive upfront planning for novel projects.
- **Relaxable later.** Multi-ticket proposals can be introduced once confidence is established (see Section 3.10).
- **Consistent with the user's direction:** *"Adding another ticket one ticket at a time [...] seems like a more fruitful way to do things with the LLMs of today."*

### 3.6 PM Agent Calibration

The PM agent must navigate between two failure modes. Calibration is what makes the difference between a useful PM agent and an endlessly indecisive or prematurely satisfied one.

#### Over-Conservative: Always Finding More to Do

Subjective facets -- "can I polish it?" and "can I add something?" -- have no natural stopping point. There is always something that could hypothetically be improved. Risk: the PM agent endlessly proposes polish tickets, never declaring done.

**Mitigations:**

1. **Bias toward completion for subjective facets.** A concrete defect is worth fixing; a hypothetical improvement is not. The PM agent should require articulating a *specific, concrete* improvement before proposing a polish ticket. Vague "could be better" assessments should not generate proposals.

2. **Diminishing-returns heuristic.** If the last N tickets were all POLISH type and the PM agent cannot identify a concrete improvement with clear user-visible impact, declare done. Polish has diminishing returns -- the first polish ticket catches real issues; the fifth is probably bikeshedding.

3. **Anchor to stated criteria, not invented ones.** The "can I add something?" facet risks expanding scope beyond the original objective. The PM agent should propose additions only when they address a stated success criterion or an obvious functional gap -- not when they represent nice-to-haves nobody asked for.

#### Over-Permissive: Declaring Done Prematurely

Risk: the PM agent says "Goal complete" when success criteria are only partially addressed. This is the simpler failure mode to detect but potentially more damaging.

**Mitigations:**

1. **Explicit criterion mapping.** Before declaring complete, the PM agent must map each success criterion from the Goal description to concrete evidence: which child ticket addressed it, what artifact or code change demonstrates it. Any unmapped criterion triggers "more to do."

2. **The "all boxes checked" question (Q4).** This evaluation question specifically catches premature completion by requiring explicit accounting of every stated criterion.

3. **No skipping.** The protocol requires answering all 7 questions before reaching a verdict. An over-permissive PM agent that skips "is there more to do?" cannot survive the protocol.

#### The Calibration Anchor

The Goal description's success criteria serve as the objective anchor. Explicit criteria are binary: met or not. Implicit quality expectations (polish, robustness, UX quality) are where calibration matters. For implicit expectations, the PM agent should err toward "good enough" rather than "perfect."

Safety bounds (max children) and diminishing-returns heuristics provide automatic calibration. The operator can intervene via manual termination if calibration drifts -- but this is an exception, not the normal operating mode. The PM agent is designed to be autonomous; calibration is built into the protocol, not delegated to a human gate.

### 3.7 Worked Examples

Three scenarios demonstrate the PM agent evaluating real situations at different stages of Goal completion.

#### Example 1: First Child Completed

**Goal**: "Automate RMA approval process"
**Success criteria**: (1) Approval flow with approve/reject actions, (2) Email notifications at each step, (3) Admin dashboard for tracking.

**Child #1 completed**: BUILD ticket implementing basic approval flow -- approve/reject buttons, status transitions, basic detail page.

**PM agent evaluation:**

| Question | Assessment |
|----------|-----------|
| Is it matching? | Yes -- approval flow is the core of the objective. On track. |
| More to do? | Yes -- email notifications and admin dashboard not addressed. |
| Needs polish? | Not yet -- too early. Polish the approval flow after core functionality is complete. |
| All boxes checked? | 1 of 3 explicit criteria addressed. |
| Can something be added? | Yes -- email notifications are the next highest-value criterion. |
| Can something be fixed? | Nothing broken in current implementation. |
| Can something be verified? | Not yet -- verify end-to-end after more pieces are in place. |

**Output**: Propose BUILD ticket: "Add email notifications for RMA approval requests." childType: BREADTH. Facet: "Can something be added?" Rationale: approval flow working; email notifications are the second success criterion and highest-value next step.

**Previews**: (1) "Admin dashboard for tracking" (BREADTH), (2) "Error handling for edge cases" (DEPTH). **Roadmap update**: 1/3 criteria addressed; email next, then dashboard, then hardening and verification.

#### Example 2: Near Completion, Verification Question

**Goal**: same. **Children #1-4 completed**: approval flow, email notifications, admin dashboard, error handling for edge cases.

**PM agent evaluation:**

| Question | Assessment |
|----------|-----------|
| Is it matching? | Yes -- all three core areas implemented. |
| More to do? | Not obviously -- all stated criteria have implementations. |
| Needs polish? | Possible -- approval flow has no loading states on slow API calls. But this is a minor UX issue, not a functional gap. |
| All boxes checked? | All 3 explicit criteria addressed by children #1-3. |
| Can something be added? | Nothing critical missing. |
| Can something be fixed? | Nothing broken. |
| Can something be verified? | Email delivery has not been verified end-to-end. Notifications were built but never tested with a real SMTP configuration. |

**Output**: Propose BUILD ticket: "Verify end-to-end email delivery for RMA notifications." childType: VERIFY. Facet: "Can something be verified?" Rationale: all criteria implemented but email delivery is an untested assumption. Verification is more valuable than polish at this stage.

**Previews**: (1) "Final polish pass -- loading states and UX" (POLISH). **Roadmap update**: All criteria implemented; verification in progress; one polish pass may follow.

#### Example 3: Goal Complete

**Goal**: same. **Children #1-5 completed**: approval flow, email notifications, admin dashboard, error handling, email verification.

**PM agent evaluation:**

| Question | Assessment |
|----------|-----------|
| Is it matching? | Yes. |
| More to do? | No -- all criteria addressed and verified. |
| Needs polish? | No concrete, specific improvement can be articulated. Loading states would be nice but are not a stated criterion and the UX is functional. |
| All boxes checked? | All 3: approval flow (#1, #4), email (#2, #5), dashboard (#3). |
| Can something be added? | Nothing that addresses a stated criterion. |
| Can something be fixed? | Nothing broken. |
| Can something be verified? | All critical paths verified in #5. |

**Output**: `{ "verdict": "complete" }`. Rationale: All 3 success criteria have concrete implementations, edge cases handled (#4), email delivery verified end-to-end (#5). No concrete improvement can be articulated that addresses a stated criterion.

**Key calibration observation**: In Example 2, the PM agent chose verification over polish -- an objective gap (untested assumption) over a subjective one (loading states). In Example 3, the PM agent did not propose a polish ticket for loading states because it could not articulate a *specific, concrete* improvement tied to stated criteria. This is the diminishing-returns heuristic in action.

### 3.8 Prompt Architecture Concepts

This section defines the conceptual architecture of the PM agent prompt -- what it receives, what it produces, and how it manages context. Full prompt engineering is implementation detail; this is the specification.

**Structured input format.** The PM agent receives a structured context document, not a raw conversation. Four sections:

1. **Goal objective + criteria** (from Goal's `title` + `description`). Always present in full, regardless of child count. This is the evaluation anchor.
2. **Completed children summary** (table: title, mode, status, key artifacts/changes). Structured, not narrative. The PM agent can scan what was built without reading prose.
3. **Current state assessment** (what exists in the codebase now). Gathered through scout-like context collection. This is what the PM agent evaluates -- concrete reality, not planned intent.
4. **Living roadmap** (current plan state). The PM agent reads the roadmap to maintain continuity between evaluations, then writes an updated version as part of its output.

**Structured output format.** JSON with three components per evaluation:

```json
{
  "verdict": "complete" | "next_ticket",
  "evaluation": {
    "q1_matching": { "answer": "yes|no|partial", "evidence": "..." },
    "q2_more_to_do": { "answer": "...", "evidence": "..." },
    "q3_polish": { "answer": "...", "evidence": "..." },
    "q4_all_boxes": { "answer": "...", "evidence": "..." },
    "q5_add": { "answer": "...", "evidence": "..." },
    "q6_fix": { "answer": "...", "evidence": "..." },
    "q7_verify": { "answer": "...", "evidence": "..." }
  },
  "proposal": { "title": "...", "description": "...", "mode": "BUILD|FIX|RESEARCH|AUTO", "facet": "...", "childType": "BREADTH|DEPTH|POLISH|VERIFY", "rationale": "..." },
  "previews": [ { "title": "...", "description": "...", "facet": "...", "childType": "...", "rationale": "..." } ],
  "roadmap_update": { "completed_summary": "...", "current_assessment": "...", "projected_remaining": ["..."] }
}
```

The PM agent produces three things each cycle: (a) a verdict (complete, or next_ticket with proposal), (b) preview forecasts of 2-3 upcoming tickets, and (c) a roadmap update reflecting what was learned. Structured output prevents ambiguous natural-language responses and makes the verdict machine-parseable.

**Context window management.** As children accumulate, the full context grows. Strategy:

- **Summarize older children.** Children #1-N get brief one-line summaries (title, status, key outcome).
- **Keep the latest child in full detail.** The most recently completed child's artifacts, changes, and outcome are included fully -- this is what changed since the last evaluation.
- **Goal criteria always in full.** Success criteria are never summarized or truncated. They are the evaluation anchor.
- **Living roadmap carries forward.** The roadmap accumulates institutional knowledge across evaluations, reducing the need to re-derive context from old children.

This keeps the prompt size manageable even for Goals with 15-20 children while preserving the information needed for evaluation.

**Evaluation protocol enforcement.** The prompt requires the PM agent to explicitly answer all 7 evaluation questions before reaching a verdict. The output structure includes an `evaluation` field with answers to each question. This prevents the PM agent from jumping to a verdict without systematic coverage and creates an audit trail of the evaluation reasoning.

### 3.9 Edge Cases

#### Child Failure

When a child ticket fails, the Goal transitions to EVALUATING with failure context. The PM agent evaluates: should the failed work be retried (propose a new ticket for the same scope)? Should a different approach be tried? Should this work area be abandoned? A failed email notification ticket does not invalidate a working approval flow. The PM agent evaluates the failure in context and proposes the best next action.

A single child failure does not automatically fail the Goal, because the broader objective may still be achievable. The PM agent's evaluation determines whether to retry, pivot, or continue with other work. If multiple children fail consecutively on the same area, the PM agent should escalate by noting this in the roadmap and previews.

#### Ambiguous Objective

If the Goal description lacks clear success criteria, the PM agent will struggle with "all boxes checked" (Q4) because there are no boxes to check. The initial setup steps (scout/diagnosis/product) should surface this -- the product step should identify and refine success criteria. If criteria remain vague, the PM agent should be explicit: *"I cannot determine whether criterion X is met because it is not specific enough. Recommendation: clarify this criterion before proceeding."*

#### Operator Intervention

The PM agent runs autonomously, but the operator can intervene at any point:

- **Override a "complete" verdict.** The operator sees work the PM agent missed and adjusts the Goal description to continue.
- **Override a "not complete" verdict.** The operator decides the Goal is "good enough" and marks it complete manually.
- **Redirect the trajectory.** The operator reviews previews, sees a wrong direction, and updates the Goal's success criteria or roadmap. The PM agent adapts at the next evaluation.
- **Enable per-ticket approval mode.** For high-risk Goals, the operator can optionally enable approval for each proposal before it spawns.

Intervention is optional -- the system supports human input without requiring it. The PM agent is designed to be helpful autonomously; humans steer, they don't gatekeep.

#### Scope Creep

The "can I add something?" facet (Q5) risks expanding scope beyond the original objective. The PM agent should anchor proposals to the stated success criteria, not invent new requirements. If the Goal says "approval flow, email, dashboard" and the PM agent proposes "add a mobile app" -- that is scope creep, not breadth. The calibration rule applies: proposals must address a stated criterion or an obvious functional gap in a stated criterion, not create new criteria.

#### Stalled Goals

A Goal can stall if the PM agent reaches a state where it cannot find more work to do but also cannot confidently declare "complete." This means the evaluation protocol answers are ambiguous -- no clear gap, but no confident "all done" either. For MVP, this triggers a configurable idle timeout: if the PM agent cannot produce a clear verdict after evaluation, the Goal pauses with a "needs human review" flag. The operator decides whether to mark it complete or provide direction.

#### Competing Priorities Between Facets

When multiple evaluation questions reveal work to do, the PM agent must prioritize. The recommended priority order:

1. **Fixing broken things (Q6)** -- defects in existing work take priority over new work.
2. **Addressing unmet criteria (Q2, Q5)** -- breadth gaps that address stated success criteria.
3. **Verifying assumptions (Q7)** -- untested behaviors that could undermine completed work.
4. **Polish (Q3)** -- quality improvements, but only when concrete and specific.

This priority order reflects a bias toward correctness over completeness, and completeness over polish -- matching the natural sequence of building, verifying, then refining.

### 3.10 Safety Bounds & Autonomous Execution

The PM agent runs autonomously by default. A Goal can execute overnight -- the PM agent evaluates, proposes, spawns, and loops without requiring human approval for each ticket. This is not a V2 feature; it is the MVP operating model.

**Safety without human approval gates:**

| Safety Mechanism | How It Works |
|-----------------|-------------|
| **Max children bound** (20, configurable) | Hard limit on total tickets spawned. After 20, Goal pauses for human decision on whether to extend or complete. |
| **Preview visibility** | 2-3 non-binding forecast tickets visible at all times. Operator sees what's coming and can intervene if direction is wrong. |
| **Living roadmap** | Continuously updated plan visible to the operator. Drift from the original objective is visible in real time. |
| **Per-ticket scope** | Each child is an MVP-scoped ticket through the normal 9-step pipeline with its own verification. Bounded risk per iteration. |
| **Manual termination** | Operator can terminate the Goal at any point -- mark as REPORT_READY (complete) or FAILED. |
| **Evaluation audit trail** | Every PM agent evaluation with its 7-question protocol answers is recorded. Full transparency into the agent's reasoning. |

**Termination bounds:**

| Bound | Value | Rationale |
|-------|-------|-----------|
| Max total children | 20 (configurable per Goal) | Caps exposure. Each child is bounded work. |
| Max nesting depth | 1 for MVP | Goal -> child tickets only. Nested Goals deferred. |
| Idle timeout | Configurable | If PM agent cannot produce a clear verdict, pause for human review. |

**Optional human approval mode.** For high-risk Goals, the operator can enable per-ticket approval: the PM agent proposes, the operator reviews and approves/modifies/rejects before the ticket spawns. This is the opt-in exception, not the default.

**V2 capabilities.** V2 is not about introducing autonomy (already MVP) or reducing human gates (already removed). V2 extends the PM agent's capabilities:

- **Multi-ticket proposals**: When clearly parallel work is needed (server + client changes), the PM agent proposes both simultaneously.
- **Parallel execution**: Multiple children running concurrently, with the PM agent evaluating when any completes.
- **Predictive estimation**: Using completed Goal histories to estimate child count and timeline for new Goals.
- **Playbook-enhanced evaluation**: PM agent receives Playbook rules as additional evaluation context.

---

## 4. Implementation Reference

### 4.1 Parent-Child Design

Goals need to track their child tickets. A `parentTicketId` relation provides this -- a standard parent-child pattern designed from Goals' own requirements:

```
// If GOAL as TicketMode (Option A):
// On Ticket model
parentTicketId   String?
parentTicket     Ticket?    @relation("TicketParentChild", fields: [parentTicketId], references: [id])
childTickets     Ticket[]   @relation("TicketParentChild")
spawnedAtStep    String?
childType        String?    // BREADTH, DEPTH, POLISH, VERIFY

@@index([parentTicketId])

// If separate Goal entity (Option B):
// On Goal model: id, title, description, status, maxChildren, etc.
// On Ticket model: goalId String? @relation to Goal
// On Goal model: childTickets Ticket[] @relation
```

Both options require minimal schema additions. The TicketMode approach adds columns to the existing Ticket table; the separate entity approach adds a new Goal table with a foreign key on Ticket. Both are additive-only -- existing tickets are unaffected.

### 4.2 Cross-Repo Impact

#### helix-global-server (Primary)

**Schema changes** (prisma/schema.prisma):

| Change | Type | Details |
|--------|------|---------|
| `TicketMode.GOAL` (if TicketMode) | Enum addition | Sixth TicketMode value |
| `TicketStatus.EVALUATING` | Enum addition | New status for evaluation state |
| `parentTicketId` or `goalId` | New column | Parent-child relation (design depends on entity model) |
| `childType` | New column | `String?` -- BREADTH, DEPTH, POLISH, VERIFY |
| `@@index([parentTicketId])` | New index | Efficient child/parent lookups |

**Service layer** (src/services/ticket-service.ts):

| Function | Type | Details |
|----------|------|---------|
| `resolveGoalParent()` | New | Per-ticket evaluation trigger: when child completes, transition Goal to EVALUATING |
| `evaluateGoal()` | New | Run PM agent: gather context, invoke evaluation, process output |
| `spawnGoalChild()` | New | Create single child from PM agent proposal. Singular -- one ticket at a time |
| `validateGoalLimits()` | New | Check total children count against `maxChildren` (default 20) |

**API** (src/controllers/):

| Endpoint | Type | Details |
|----------|------|---------|
| `GET /goals/:id/previews` | New | Retrieve current PM agent preview forecasts |
| `GET /goals/:id/roadmap` | New | Retrieve current living roadmap state |
| `POST /goals/:id/terminate` | New | Operator terminates Goal (mark complete or failed) |
| `POST /goals/:id/override-approval` | New | Optional: enable/disable per-ticket approval mode |

#### helix-global-client (Secondary)

**Type extensions** (src/types/api.ts):
- Add `GOAL` to TicketMode (or Goal type if separate entity)
- Add `EVALUATING` to TicketStatus

**New views/components**:

| Component | Purpose |
|-----------|---------|
| Goal progress section | Child tree with status badges, type chips (BREADTH/DEPTH/POLISH/VERIFY), evaluation status |
| PM agent output display | Evaluation results with 7-question answers, current verdict, rationale |
| Preview panel | Non-binding forecast tickets with facet and childType labels |
| Living roadmap view | Current roadmap state with completed/projected sections |

**Styling**: New `--color-status-evaluating` OKLCH token, "EVALUATING" -> "Evaluating" label in format.ts.

#### helix-cli (Tertiary)

| File | Change |
|------|--------|
| `src/tickets/create.ts` (line 12) | Add `GOAL` to `VALID_MODES` array (if TicketMode approach) |

---

## 5. Phasing, Open Questions & Future Work

### 5.1 Phasing

Core Goals are **Playbook-independent** -- goal-met evaluation works from natural language objectives and concrete child outcomes, no Playbook rules needed. Recommended implementation sequence:

| Phase | What | Dependencies |
|-------|------|-------------|
| **1** | Goal infrastructure -- entity/TicketMode, EVALUATING status, parentTicketId/goalId, PM agent, per-ticket evaluation trigger, autonomous execution, preview output, living roadmap | None |
| **2** | Client UI -- Goal creation, PM agent output display, preview visualization, roadmap view, child tree navigation | Phase 1 server API |
| **3** | Playbook-enhanced evaluation, multi-ticket proposals, parallel execution, predictive estimation | RSH-411 Phase 1 |

**Critical phasing note:** The PM agent is **Phase 1 infrastructure**, not Phase 3. Agent-driven evaluation is the simpler mechanism the user wants explored first -- the "is it done? no? what's next?" loop. It is also what makes Goals useful: without the PM agent, a Goal is just a container. The PM agent is what makes the while-loop intelligent.

Phase 3 is about extending the PM agent's capabilities once the core loop is proven. Building the measuring first -- the ability to evaluate whether a goal is met -- is the foundation everything else depends on.

### 5.2 Playbook Integration

**Tier 1 (Playbook-independent):** Core Goals work without the Playbook. PM agent evaluation, per-ticket triggers, autonomous execution, previews, living roadmap -- all Playbook-independent. Can be implemented immediately.

**Tier 2 (Playbook-enhanced):** PM agent receives Playbook rules as additional evaluation context. Advisory roadmap can reference rules. Child tickets linked to rules via `PlaybookRuleTicket` junction (RSH-411 Section 11). Requires RSH-411 Phase 1 complete. Tier 2 is naturally Phase 3 work.

### 5.3 Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | **Entity model** -- TicketMode vs. separate Goal entity? | Open. Both analyzed in Section 2.2. Implementation phase should prototype both. |
| 2 | **PM agent invocation mechanism** -- Claude API call, background process, or sprite? | Open. The PM agent is architecturally distinct from pipeline agents; its runtime mechanism needs design. |
| 3 | **Preview lifecycle** -- When does a preview become the actual next ticket? | Open. Currently previews are replaced wholesale each cycle. Relationship between preview and spawned ticket is conceptual, not structural. |
| 4 | **Roadmap schema** -- Exact JSON structure for the living roadmap artifact? | Open. Current design specifies `completed_summary`, `current_assessment`, `projected_remaining`. May evolve. |
| 5 | **Nested Goals** -- Goals spawning sub-Goals? | Deferred to post-MVP. MVP is flat: Goal -> child tickets. |
| 6 | **Per-ticket evaluation + `/after` chains** -- How does evaluation interact with `afterTicketId` sequential dependencies? | Open. MVP assumes Goal children are independent. |
| 7 | **Cross-repo Goals** -- Goals coordinating children spanning multiple repos? | Partially addressed: children already support multi-repo. |
| 8 | **Retroactive Goal assignment** -- Attaching existing tickets to a Goal after creation? | Deferred. Simple technically but UX implications for evaluation. |

Note: PM agent prompt architecture (formerly an open question) is now addressed in Section 3.8. Calibration heuristics (formerly open) are addressed in Section 3.6. Sprint.goal field collision is resolved: Sprint.goal is a text description field for a sprint's theme, while GOAL is a TicketMode enum value -- different concepts with no technical collision.

### 5.4 Future Work

**Near-term (post-MVP):**
- Goal progress dashboard: aggregate view of all active Goals with progress indicators
- Goal-to-Goal dependency: sequence Goals using `afterTicketId` (already supported since Goals use ticket infrastructure)
- PM agent evaluation history: track what the PM agent assessed at each evaluation, for debugging and calibration
- PM agent calibration learning: using evaluation history and operator interventions to improve accuracy over time

**Medium-term (post-Playbook Phase 1):**
- Playbook-enhanced evaluation (Tier 2): PM agent receives Playbook rules as additional context
- Multi-ticket proposals: PM agent proposes multiple concurrent tickets when work is clearly parallel
- Parallel execution: multiple children running simultaneously
- Predictive estimation: using completed Goal histories to estimate child count for new Goals

**Long-term:**
- Nested Goals: Goals spawning sub-Goals for large multi-phase initiatives
- Goal graph visualization: interactive DAG showing Goal -> children with status and evaluation facets
- Speculative execution using preview infrastructure: start previewed tickets speculatively, abort if PM agent changes direction
- Cross-organization Goal patterns: templates for common business objectives

---

## Methodology & Data Sources

| Source | Purpose |
|--------|---------|
| RSH-488 ticket description | Feature requirements, stakeholder vision, design tension |
| RSH-488 continuation context (run 4) | Strategic redirection: checking-first; 9 evaluation facets; one-ticket-at-a-time; decomposition as guide not decider |
| RSH-488 run 2 per-section comments (16 comments) | **Primary input for this revision**: 6 specific user design decisions with THUMBS_UP/DOWN ratings |
| RSH-488 run 3 comments | User confirmation: "I feel like most of my comments on the last iteration were ignored" |
| RSH-411 report (library/reports/RSH-411/report.md) | GOAL concept recommendation, Playbook data model, phasing |
| RSH-193 report (.helix-refs/RSH-193/run-1/report.md) | Prior parent-child exploration, SideQuest concepts (not implemented) |
| helix-global-server/prisma/schema.prisma | Current TicketMode enum (5 values), TicketStatus enum (15 values), Ticket model |
| helix-global-server/src/services/ticket-service.ts | resolveDependentTickets (line 1716), extension point for Goal evaluation |
| helix-global-server/src/helix-workflow/orchestrator.ts | Completion hooks (lines 1504, 2338), RESEARCH mode filtering precedent |
| helix-global-client/src/types/api.ts | Client TicketMode/TicketStatus type definitions |
| helix-cli/src/tickets/create.ts | CLI VALID_MODES, --mode flag |
| Diagnosis, product, tech-research artifacts (run 4) | 6 unaddressed design decisions, success criteria, revision strategy |

---

*Report revised for Helix ticket RSH-488 "Goals: The PM Agent x Ralph Loop" -- May 2026*
*Revision: Design direction revision -- incorporating user design decisions (continuation 4)*

## Attachments
- (none)

## Discussion
- **Helix** (2026-05-20T22:28:46.159Z) [Agent]: I'm working on this, I'll get back to you when ready.
