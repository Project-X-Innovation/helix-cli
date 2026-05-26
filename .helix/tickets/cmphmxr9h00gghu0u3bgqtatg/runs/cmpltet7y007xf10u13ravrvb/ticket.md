# Ticket Context

- ticket_id: cmphmxr9h00gghu0u3bgqtatg
- short_id: BLD-590
- run_id: cmpltet7y007xf10u13ravrvb
- run_branch: helix/build/BLD-590-goals-polish-final
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Goals: Polish & Final

## Description
This is the final ticket for Goals.



Make it something beautiful. As beautiful as Darshan's soul



Polish it, verify everything works, that the UX is smooth and sleek, and that it is a work of art and beauty

## Research Report

# Goals & PM Agent (Ralph Loop) -- Implementation Plan

**Report**: RSH-534
**Date**: May 21, 2026
**Based on**: RSH-488 Research Report (revised, continuation 4)
**Revision**: Final -- separate Goal entity + dual-phase PM agent + setup ticket pattern + reliability story
**Scope**: helix-global-server (primary), helix-global-client (secondary), helix-cli (tertiary)

---

## Table of Contents

1. [Executive Summary & Architecture Decisions](#1-executive-summary--architecture-decisions)
2. [Schema & Migration Design](#2-schema--migration-design)
3. [Server Service Layer](#3-server-service-layer)
4. [PM Agent Dual-Phase Implementation](#4-pm-agent-dual-phase-implementation)
5. [API Endpoints](#5-api-endpoints)
6. [Orchestrator Integration](#6-orchestrator-integration)
7. [Client Architecture](#7-client-architecture)
8. [CLI Support](#8-cli-support)
9. [Implementation Phases & Cross-Repo Ordering](#9-implementation-phases--cross-repo-ordering)
10. [Safety, Edge Cases & Risk](#10-safety-edge-cases--risk)
11. [Reliability & Operational Model](#11-reliability--operational-model)
12. [Open Questions & Future Work](#12-open-questions--future-work)
13. [Implementation Tickets](#13-implementation-tickets)
14. [Production Ticket Creation](#14-production-ticket-creation)

**Appendices**:
- [A: Goal Lifecycle State Transition Diagram](#appendix-a-goal-lifecycle-state-transition-diagram)
- [B: PM Agent Output JSON Schemas](#appendix-b-pm-agent-output-json-schemas)
- [C: GoalEvaluation Table Schema](#appendix-c-goalevaluation-table-schema)
- [D: Zod Validation Schemas](#appendix-d-zod-validation-schemas)

---

## 1. Executive Summary & Architecture Decisions

### Feature Summary

Goals are the while-loop around tickets. A Goal takes a high-level business objective -- "automate our RMA process," "build a reporting dashboard" -- and drives it to polished completion through an autonomous **PM agent** that evaluates concrete results after each child ticket, proposes the single most valuable next action, and repeats -- one ticket at a time -- until the objective is truly done.

The PM agent operates as a **dual-phase system**: one phase (the **Assessor**) produces an objective evaluation artifact answering 7 structured questions against the current state, and a separate phase (the **Decider**) reads that artifact and makes the verdict -- complete, or propose the next ticket. This separation yields objectivity: assessment is decoupled from action, mirroring the proven diagnosis→product pattern in the codebase.

Goals are **not tickets**. They are a fundamentally different experience -- centered on child management, evaluation results, preview forecasts, and a living roadmap -- and they get their own dedicated entity, API, and UI. The Ticket UI remains the Ticket UI; the Goal UI is a totally different UI.

This transforms Helix from a ticket executor into a goal-reacher -- an autonomous project manager that stacks MVPs in breadth, depth, polish, and verification until a business objective is truly done.

### Resolved Architecture Decisions

Nine architecture decisions were resolved during technical research. These form the foundation of this implementation plan.

| # | Decision | Resolution | Key Rationale |
|---|----------|------------|---------------|
| 1 | **Entity model** | **Separate Goal table** (NOT TicketMode) | User directive: "Goals should have their own UI and I don't think it should be linked to the Ticket UI." The Goal experience (child-tree navigation, PM evaluation, previews, roadmap) is fundamentally different from the ticket experience (pipeline progress). TicketMode stays at 5 values (AUTO, BUILD, FIX, RESEARCH, EXECUTE). |
| 2 | **PM agent pattern** | **Dual-phase: Assessor + Decider** | User directive: "First produce an artifact and then a decision. One agent or aspect compares the artifact. The other agent or aspect makes the decision." Matches the proven Helix meta-pattern. Two sequential `query()` calls per evaluation cycle. |
| 3 | **Goal initialization** | **Setup ticket as first child** (RESEARCH mode) | Solves the "first-child cold start" gap. A RESEARCH-mode setup ticket runs scout/diagnosis/product through the standard orchestrator, producing rich context artifacts. When it completes, `resolveGoalParent()` fires and the PM agent's first evaluation uses those artifacts. Zero orchestrator modifications needed. |
| 4 | **Concurrency safety** | **Atomic `updateMany` WHERE** | `prisma.goal.updateMany({ where: { id, status: 'ACTIVE' }, data: { status: 'EVALUATING' } })` checking `count > 0`. Prevents TOCTOU race conditions on concurrent evaluations. Simplest Prisma-native solution. |
| 5 | **LLM output validation** | **Zod v4 schemas + defensive parser + retry-with-correction** | Zod schemas for both Assessor and Decider outputs. Markdown fence stripping → JSON.parse → z.safeParse(). On validation failure with retries remaining, re-invoke query() with error context. Max 2 retries, 90s timeout per call. |
| 6 | **Approval workflow** | **PENDING_APPROVAL state + approve/reject endpoints** | Complete workflow: Goal transitions to PENDING_APPROVAL when `requireApproval=true` and verdict is `next_ticket`. Proposal stored in GoalEvaluation. Approve endpoint spawns child; reject endpoint triggers re-evaluation. |
| 7 | **Goal status** | **GoalStatus enum** (9 values, separate from TicketStatus) | DRAFT, QUEUED, RUNNING, ACTIVE, EVALUATING, PENDING_APPROVAL, PAUSED, COMPLETED, FAILED. TicketStatus stays at 17 values unchanged. |
| 8 | **PM agent invocation** | **`query()` from `@anthropic-ai/claude-agent-sdk`** | Established pattern across 8 existing services. Single-turn evaluation; no sandbox or code execution needed. Model: `claude-sonnet-4-6`. |
| 9 | **Metadata storage** | **JSON columns (roadmap, previews) on Goal table** | Mutable per-cycle state. Direct read without joins. Atomic updates. Schema flexibility. Matches existing `SandboxRun.runSummary` and `SandboxRun.walkthroughData` patterns. |

### Discrepancy Corrections from Prior Reports

The RSH-488 research report and the prior version of this implementation plan contained factual inaccuracies. Verified against current `staging` HEAD:

| Claim | Correction |
|-------|-----------|
| SIDE_QUEST_PENDING is an existing TicketStatus | **Does not exist.** Now irrelevant -- GoalStatus.ACTIVE serves the waiting-for-child role. |
| TicketStatus has 15 values (RSH-488) | **17 values** verified at `prisma/schema.prisma:24-42`: QUEUED, RUNNING, MERGING, SANDBOX_READY, VERIFYING, DEPLOYING, PREVIEW_READY, REPORT_READY, STAGING_MERGED, IN_PROGRESS, DEPLOYED, FAILED, UNVERIFIED, WAITING, DRAFT, NEEDS_CREDENTIALS, IMPOSSIBLE_SPEC. |
| Prior RSH-534 listed CANCELLED and SIDE_QUEST_PENDING_DEPRECATED | **Neither exists.** The correct values include NEEDS_CREDENTIALS and IMPOSSIBLE_SPEC instead. |
| `createTicketForOrganization` at "line 755" | **Verified at line 646** in `ticket-service.ts` (current staging). |
| `resolveDependentTickets` at "line 1941" | **Verified at line 1724** in `ticket-service.ts` (current staging). |
| Orchestrator completion hooks at "line 1545 and 2661" | **Verified at lines 1544 and 2636** in `orchestrator.ts` (current staging). |
| `ticket-detail.tsx` ~2600 lines | **File does not exist at this path on current staging** (client uses different page structure). |
| TicketMode has 5 values | **Confirmed correct** at `prisma/schema.prisma:114-120`: AUTO, BUILD, FIX, RESEARCH, EXECUTE. |

### What the Prior RSH-534 Report Got Wrong

The prior version of this implementation plan (May 20-21, 2026) chose:
- **PM agent first run replaces pipeline** -- contradicted by the cold-start problem. The PM agent has no codebase access for its first evaluation; a setup ticket provides this context.
- Listed incorrect TicketStatus values (CANCELLED, SIDE_QUEST_PENDING_DEPRECATED instead of NEEDS_CREDENTIALS, IMPOSSIBLE_SPEC)
- Specified only 7 GoalStatus values -- missing QUEUED, RUNNING, and PENDING_APPROVAL
- Did not specify Zod schemas for LLM output validation
- Did not specify retry/timeout/backoff strategy
- Had no approve/reject endpoints for the approval workflow
- Did not address concurrent evaluation race conditions

This revision corrects all of these based on the tech-research architecture decisions and the user's code review feedback.

---

## 2. Schema & Migration Design

### 2.1 GoalStatus Enum (New -- 9 Values)

A new enum, completely separate from TicketStatus. TicketStatus remains at 17 values unchanged.

```prisma
enum GoalStatus {
  DRAFT              // Created but not yet started
  QUEUED             // Waiting for setup ticket to start executing
  RUNNING            // Setup ticket (scout/diagnosis/product) is executing
  ACTIVE             // A child ticket is executing
  EVALUATING         // PM agent running dual-phase evaluation after child completion
  PENDING_APPROVAL   // requireApproval mode: proposal waiting for operator review
  PAUSED             // Safety bound hit (max children) or stalled -- needs human review
  COMPLETED          // Objective met -- PM agent declared complete or operator terminated
  FAILED             // Unrecoverable failure or operator terminated as failed
}
```

**Status semantics:**

| Status | Meaning | Triggered By | Transitions To |
|--------|---------|--------------|----------------|
| `DRAFT` | Created, not yet started | Goal creation | QUEUED |
| `QUEUED` | Setup ticket waiting to start | Operator activates (or auto on create) | RUNNING |
| `RUNNING` | Setup ticket executing | Setup ticket starts running | ACTIVE (setup completes → first evaluation → first child spawned) |
| `ACTIVE` | A child ticket is running | Child ticket spawned | EVALUATING (child completes), PAUSED, COMPLETED, FAILED |
| `EVALUATING` | PM agent running dual-phase evaluation | Child ticket completes (success or failure) | ACTIVE (next child), COMPLETED, PENDING_APPROVAL, PAUSED, FAILED |
| `PENDING_APPROVAL` | Proposal awaiting operator review | requireApproval=true and verdict=next_ticket | ACTIVE (approved → child spawned), EVALUATING (rejected → re-evaluate) |
| `PAUSED` | Max children or stalled | Safety bound or idle timeout | ACTIVE (extended), COMPLETED, FAILED |
| `COMPLETED` | Objective fully met | PM agent verdict=complete, or operator terminates as complete | Terminal |
| `FAILED` | Terminated or unrecoverable | Operator terminates, or unrecoverable error | Terminal |

### 2.2 Goal Model (New Table)

```prisma
model Goal {
  id               String       @id @default(cuid())
  organizationId   String
  reporterUserId   String
  title            String
  description      String       @db.Text
  status           GoalStatus   @default(DRAFT)
  maxChildren      Int          @default(20)
  roadmap          Json?        // Living roadmap JSON, updated each evaluation cycle
  previews         Json?        // Preview forecasts JSON (2-3 tickets), updated each cycle
  requireApproval  Boolean      @default(false)
  repositoryIds    String[]     // Repositories for child tickets
  sprintId         String?

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  // Relations
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  reporterUser     User         @relation("GoalReporter", fields: [reporterUserId], references: [id])
  childTickets     Ticket[]     @relation("GoalChildren")
  evaluations      GoalEvaluation[]
  sprint           Sprint?      @relation(fields: [sprintId], references: [id])

  @@index([organizationId, updatedAt])
  @@index([organizationId, status])
}
```

**Field notes:**
- `description` uses `@db.Text` for long-form success criteria.
- `roadmap` and `previews` are JSON columns -- mutable state updated each evaluation cycle. Direct read without joins, atomic updates, schema flexibility. Matches existing pattern: `SandboxRun.runSummary`, `SandboxRun.proofUrls`, `SandboxRun.walkthroughData` (all `Json?`).
- `requireApproval` defaults to `false` -- autonomous by default, per-ticket approval is opt-in.
- `maxChildren` defaults to 20 -- configurable per Goal.
- `repositoryIds String[]` stores associated repository IDs for child ticket creation. Matches the `referencedTicketIds String[]` pattern on Ticket. Setup ticket and child tickets inherit these repos by default unless the Decider specifies otherwise.

### 2.3 GoalEvaluation Model (New Table -- Audit Trail)

```prisma
model GoalEvaluation {
  id                   String   @id @default(cuid())
  goalId               String
  triggerTicketId      String?  // Which child ticket triggered this evaluation (null for setup)
  assessmentArtifact   Json     // Phase 1 Assessor output: 7 questions with answers + evidence
  deciderOutput        Json     // Phase 2 Decider output: verdict + proposal + previews + roadmap
  verdict              String   // "complete" or "next_ticket" (denormalized for quick filtering)
  proposedTicketId     String?  // The child ticket that was spawned from this evaluation (if any)
  createdAt            DateTime @default(now())

  // Relations
  goal                 Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId, createdAt])
}
```

**Purpose**: Audit trail for every PM agent evaluation cycle. Each row captures:
- **Phase 1 output** (`assessmentArtifact`): The Assessor's structured 7-question evaluation
- **Phase 2 output** (`deciderOutput`): The Decider's verdict, proposal, previews, and roadmap update
- **Verdict** (denormalized): Quick filtering without JSON parsing
- **Trigger ticket**: Which child completion triggered this evaluation
- **Proposed ticket**: Which child was spawned (back-link for tracing)

This enables:
- Full auditability of PM agent reasoning at every step
- Debugging calibration issues (over-conservative vs over-permissive)
- Operator review of past evaluations
- Future calibration learning from evaluation history

### 2.4 Ticket Model Additions

Two optional columns added to the existing Ticket model. These are the **only** changes to the Ticket table.

```prisma
model Ticket {
  // ... existing fields unchanged ...

  // Goal relationship (new -- two columns only)
  goalId      String?     // FK to Goal -- null for non-Goal tickets
  childType   String?     // BREADTH, DEPTH, POLISH, or VERIFY -- null for non-Goal tickets
  goal        Goal?       @relation("GoalChildren", fields: [goalId], references: [id], onDelete: SetNull)

  @@index([goalId])       // New index for efficient Goal child lookups
  // ... existing indexes unchanged ...
}
```

**What is NOT changed on Ticket:**
- `TicketMode` enum: stays at 5 values (AUTO, BUILD, FIX, RESEARCH, EXECUTE). No GOAL added.
- `TicketStatus` enum: stays at 17 values. No EVALUATING, PENDING_APPROVAL, or any Goal-specific status added.
- No `parentTicketId`, `maxChildren`, `goalRoadmap`, or `goalPreviews` columns on Ticket.

### 2.5 Organization and User Model Additions

```prisma
model Organization {
  // ... existing relations ...
  goals        Goal[]     // New relation
}

model User {
  // ... existing relations ...
  reportedGoals Goal[]   @relation("GoalReporter")  // New relation
}
```

### 2.6 Migration Instructions

**Strategy**: File-based Prisma migrations. Confirmed by `scripts/prisma-migrate-all.mjs` which runs `prisma migrate deploy` at build time. 57 existing migration directories.

**Command**:
```bash
npx prisma migrate dev --name add_goals_pm_agent
```

**Expected SQL output:**
```sql
-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM (
  'DRAFT', 'QUEUED', 'RUNNING', 'ACTIVE', 'EVALUATING',
  'PENDING_APPROVAL', 'PAUSED', 'COMPLETED', 'FAILED'
);

-- CreateTable "Goal"
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'DRAFT',
    "maxChildren" INTEGER NOT NULL DEFAULT 20,
    "roadmap" JSONB,
    "previews" JSONB,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "repositoryIds" TEXT[],
    "sprintId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable "GoalEvaluation"
CREATE TABLE "GoalEvaluation" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "triggerTicketId" TEXT,
    "assessmentArtifact" JSONB NOT NULL,
    "deciderOutput" JSONB NOT NULL,
    "verdict" TEXT NOT NULL,
    "proposedTicketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalEvaluation_pkey" PRIMARY KEY ("id")
);

-- AlterTable (Ticket additions -- only two columns)
ALTER TABLE "Ticket" ADD COLUMN "goalId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "childType" TEXT;

-- CreateIndex
CREATE INDEX "Goal_organizationId_updatedAt_idx" ON "Goal"("organizationId", "updatedAt");
CREATE INDEX "Goal_organizationId_status_idx" ON "Goal"("organizationId", "status");
CREATE INDEX "GoalEvaluation_goalId_createdAt_idx" ON "GoalEvaluation"("goalId", "createdAt");
CREATE INDEX "Ticket_goalId_idx" ON "Ticket"("goalId");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_reporterUserId_fkey"
  FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_sprintId_fkey"
  FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoalEvaluation" ADD CONSTRAINT "GoalEvaluation_goalId_fkey"
  FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_goalId_fkey"
  FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

**Migration file must be committed.** The build pipeline runs `prisma migrate deploy` which expects migration files to exist.

---

## 3. Server Service Layer

### 3.1 New File: `src/services/goal-service.ts`

All Goal-related business logic lives in a new, dedicated service file. This follows the pattern of the existing `ticket-service.ts` but is a separate file because Goals are a separate entity.

### 3.2 Service Functions (10 functions)

#### `createGoal(organizationId, userId, data)`

**Purpose**: Create a new Goal record and spawn the setup ticket.

```typescript
async function createGoal(
  organizationId: string,
  userId: string,
  data: {
    title: string;
    description: string;
    maxChildren?: number;
    requireApproval?: boolean;
    repositoryIds?: string[];
    sprintId?: string;
  }
): Promise<Goal>
```

**Key logic:**
1. Insert Goal with status `DRAFT`
2. Transition to `QUEUED`
3. Spawn a setup ticket (RESEARCH mode) via `createTicketForOrganization()` (`ticket-service.ts:646`) with:
   - Title: `"Goal Setup: ${goal.title}"`
   - Description: Goal's full description + success criteria
   - Mode: RESEARCH (runs scout/diagnosis/product only, per `RESEARCH_EXCLUDED_STEPS` at `orchestrator.ts:1568`)
   - `goalId`: the new Goal's ID
   - `childType`: null (infrastructure ticket, not classified)
   - Repositories: Goal's `repositoryIds`
4. Goal transitions to `QUEUED` (waiting for setup ticket to start)

**Why a setup ticket?** This directly addresses the "first-child cold start" design gap: without codebase context, the PM agent's first proposal would be generic. The setup ticket runs scout/diagnosis/product through the standard orchestrator, producing rich context artifacts. When it completes, `resolveGoalParent()` fires at the existing completion hooks (`orchestrator.ts:1544` and `:2636`), and the PM agent's first evaluation uses those artifacts.

#### `evaluateGoal(goalId)`

**Purpose**: Orchestrate the dual-phase PM agent evaluation. This is the core Ralph Loop function.

```typescript
async function evaluateGoal(goalId: string): Promise<GoalEvaluation>
```

**Key logic:**
1. Load Goal with children (including their artifacts), latest evaluation, current roadmap
2. Assemble evaluation context (see Section 4.3)
3. **Phase 1**: Call `runAssessor(context)` -- produces structured 7-question evaluation artifact
4. Parse and validate Phase 1 output using `parseAssessorOutput()`
5. **Phase 2**: Call `runDecider(goal, evaluationArtifact)` -- produces verdict + proposal
6. Parse and validate Phase 2 output using `parseDeciderOutput()`
7. Store both results in GoalEvaluation record
8. Process verdict:
   - If `"next_ticket"`:
     - If `requireApproval` is true: transition Goal to `PENDING_APPROVAL`, return (wait for operator)
     - Check `validateGoalLimits(goalId)` -- if exceeded, transition to `PAUSED`, return
     - Call `spawnGoalChild(goalId, proposal)` -- creates child ticket
     - Update Goal's `roadmap` and `previews` JSON columns from Decider output
     - Transition Goal to `ACTIVE`
   - If `"complete"`:
     - Transition Goal to `COMPLETED`
     - Update roadmap with final state

**Error handling**: Wrap in try/catch. On failure after all retries exhausted, transition Goal to `PAUSED` with error context stored in roadmap (not FAILED -- transient errors are recoverable with human intervention).

#### `runAssessor(context)`

**Purpose**: Phase 1 of the dual-phase PM agent. Produces a structured evaluation artifact answering all 7 questions with evidence.

```typescript
async function runAssessor(context: GoalEvaluationContext): Promise<AssessorOutput>
```

**Key logic:**
1. Construct Assessor system prompt + structured context (see Section 4)
2. Call `query()` from `@anthropic-ai/claude-agent-sdk` with model `claude-sonnet-4-6`
3. Parse response: strip markdown fences → `JSON.parse()` → `AssessorOutputSchema.safeParse()`
4. On parse failure with retries remaining: re-invoke `query()` with the Zod error message appended
5. Return validated artifact

**Retry strategy**: See Section 11.1.

**Pattern reference**: Follows `query()` usage in `walkthrough-service.ts:197` and defensive parsing in `walkthrough-service.ts:228` (`parseCodeTourJson`).

#### `runDecider(goal, evaluationArtifact)`

**Purpose**: Phase 2 of the dual-phase PM agent. Reads the evaluation artifact and produces a verdict.

```typescript
async function runDecider(
  goal: Goal,
  evaluationArtifact: AssessorOutput
): Promise<DeciderOutput>
```

**Key logic:**
1. Construct Decider system prompt with goal objective + criteria and the Phase 1 artifact
2. Call `query()` from `@anthropic-ai/claude-agent-sdk` with model `claude-sonnet-4-6`
3. Parse response: strip markdown fences → `JSON.parse()` → `DeciderOutputSchema.safeParse()`
4. On parse failure with retries remaining: re-invoke `query()` with the Zod error message appended
5. Return verdict + proposal + previews + roadmap update

**Key constraint**: The Decider receives the Assessor's artifact as read-only input. It does not re-evaluate the 7 questions -- it reads the Assessor's answers and makes a decision based on them. This separation provides objectivity.

#### `parseAssessorOutput(rawText)`

**Purpose**: Defensive parsing of Phase 1 LLM output.

```typescript
function parseAssessorOutput(rawText: string): z.infer<typeof AssessorOutputSchema>
```

**Key logic:**
1. Strip markdown fences (```json...```) -- same technique as `parseCodeTourJson` in `walkthrough-service.ts:228`
2. `JSON.parse()` the cleaned text
3. `AssessorOutputSchema.safeParse()` for type-safe validation
4. If `success === false`: throw with formatted Zod error for retry context
5. Return `data`

#### `parseDeciderOutput(rawText)`

**Purpose**: Defensive parsing of Phase 2 LLM output. Same pattern as `parseAssessorOutput()` but uses `DeciderOutputSchema`.

#### `spawnGoalChild(goalId, proposal)`

**Purpose**: Create a single child ticket from the PM agent's proposal.

```typescript
async function spawnGoalChild(
  goalId: string,
  proposal: TicketProposal
): Promise<Ticket>
```

**Key logic:**
1. Load Goal to get organizationId, reporterUserId, repositoryIds
2. Call `createTicketForOrganization()` (`ticket-service.ts:646`) with:
   - `title`: from proposal
   - `description`: from proposal
   - `mode`: from proposal (BUILD, FIX, RESEARCH, EXECUTE, or AUTO)
   - `goalId`: the parent Goal's ID
   - `childType`: from proposal (BREADTH, DEPTH, POLISH, or VERIFY)
   - `organizationId`: from Goal
   - `reporterUserId`: from Goal
   - `repositoryIds`: from Goal (unless Decider specifies otherwise)
3. Update the GoalEvaluation record with `proposedTicketId`
4. Return the created ticket

**Reuses existing infrastructure**: `createTicketForOrganization()` handles validation, status initialization, predecessor logic, and all existing ticket creation behavior. No new ticket creation logic.

#### `resolveGoalParent(childTicketId, organizationId)`

**Purpose**: Completion trigger. When a child ticket completes, check if it belongs to a Goal, and if so, trigger evaluation.

```typescript
async function resolveGoalParent(
  childTicketId: string,
  organizationId: string
): Promise<void>
```

**Key logic:**
1. Query the completed ticket's `goalId`
2. If `goalId` is null, return immediately (not a Goal child)
3. **Atomic status transition**: `prisma.goal.updateMany({ where: { id: goalId, status: 'ACTIVE' }, data: { status: 'EVALUATING' } })` -- returns `{ count }`
4. If `count === 0`: another evaluation is already running (lost the race), return silently
5. If `count === 1`: we won the race, call `evaluateGoal(goalId)` asynchronously (non-blocking, fire-and-forget with error logging)

**Concurrency protection**: The atomic `updateMany` with `WHERE status = 'ACTIVE'` ensures exactly one concurrent caller proceeds. This addresses the TOCTOU race condition identified in the code review. The second concurrent call gets `count: 0` and aborts silently -- matching the fire-and-forget error handling of `resolveDependentTickets()` (`ticket-service.ts:1724-1760`).

**Error handling**: catch-and-log pattern. This function must never throw -- a Goal evaluation failure should not block the child ticket's completion.

```typescript
try {
  await resolveGoalParent(childTicketId, organizationId);
} catch (error) {
  console.error(`[resolveGoalParent] Failed for ticket ${childTicketId}:`, error);
}
```

#### `validateGoalLimits(goalId)`

**Purpose**: Check whether a Goal has reached its max children limit.

```typescript
async function validateGoalLimits(goalId: string): Promise<{ exceeded: boolean; current: number; max: number }>
```

**Key logic:**
1. Count child tickets: `prisma.ticket.count({ where: { goalId } })`
2. Load Goal's `maxChildren`
3. Return comparison result

#### `terminateGoal(goalId, verdict)`

**Purpose**: Operator-initiated termination of a Goal.

```typescript
async function terminateGoal(
  goalId: string,
  verdict: "complete" | "failed"
): Promise<Goal>
```

**Key logic:**
1. Load Goal, verify non-terminal status
2. If `verdict` = "complete": transition to `COMPLETED`
3. If `verdict` = "failed": transition to `FAILED`
4. No further child tickets will be spawned
5. Active children continue to completion but do not trigger further evaluation
6. Return updated Goal

#### `approveProposal(goalId, evaluationId)`

**Purpose**: Operator approves a proposal in PENDING_APPROVAL mode.

```typescript
async function approveProposal(
  goalId: string,
  evaluationId: string,
  modifications?: { title?: string; description?: string }
): Promise<Ticket>
```

**Key logic:**
1. Load Goal, verify status is `PENDING_APPROVAL`
2. Load GoalEvaluation by evaluationId, extract proposal from `deciderOutput`
3. If `modifications` provided, apply them to the proposal
4. Call `spawnGoalChild(goalId, proposal)` to create the child ticket
5. Transition Goal to `ACTIVE`
6. Return the created ticket

#### `rejectProposal(goalId, evaluationId, reason?)`

**Purpose**: Operator rejects a proposal in PENDING_APPROVAL mode.

```typescript
async function rejectProposal(
  goalId: string,
  evaluationId: string,
  reason?: string
): Promise<void>
```

**Key logic:**
1. Load Goal, verify status is `PENDING_APPROVAL`
2. Transition Goal to `EVALUATING`
3. Re-run `evaluateGoal(goalId)` with rejection context (reason + rejected proposal) included in the evaluation input
4. The PM agent produces a new proposal accounting for the rejection reason

---

## 4. PM Agent Dual-Phase Implementation

### 4.1 Architecture: Two Calls, Not One

The PM agent uses a **dual-phase pattern** with two sequential `query()` calls per evaluation cycle:

```
Phase 1: Assessor                    Phase 2: Decider
+----------------------------+       +----------------------------+
| Input:                     |       | Input:                     |
| - Goal objective + criteria|       | - Goal objective + criteria|
| - Completed children       | ----> | - Evaluation artifact      |
| - Current state            |       |   (from Phase 1)           |
| - Living roadmap           |       +----------------------------+
+----------------------------+       | Output:                    |
| Output:                    |       | - Verdict: complete or     |
| - Evaluation artifact      |       |   next_ticket              |
|   (7 questions answered    |       | - Proposal (if next)       |
|    with evidence)          |       | - Previews (2-3 forecasts) |
+----------------------------+       | - Roadmap update           |
                                     +----------------------------+
```

**Why two calls?**
1. **Objectivity**: The Assessor reports what it sees against the protocol without having a stake in the verdict. The Decider acts on evidence, not its own analysis.
2. **Auditability**: The evaluation artifact is a standalone record. The decision is traceable to specific evidence in the artifact.
3. **Independent calibration**: Assessor and Decider prompts can be tuned independently. Two tuning surfaces instead of one.
4. **Matches Helix patterns**: The agent pipeline already works this way -- diagnosis produces an artifact, product reads it and makes decisions.

### 4.2 Phase 1: Assessor

**Model**: `claude-sonnet-4-6` via `query()`

**Input structure** (4 sections):

**Section 1: Goal Objective & Criteria** (always included in full, never summarized)
```
GOAL OBJECTIVE:
Title: Automate RMA approval process
Description: Build a complete RMA approval system with:
1. Approval flow with approve/reject actions
2. Email notifications at each step
3. Admin dashboard for tracking requests
```

**Section 2: Completed Children Summary**
```
COMPLETED CHILDREN:
| # | Title | Mode | Status | Key Outcome |
|---|-------|------|--------|-------------|
| 1 | Goal Setup: Automate RMA | RESEARCH | REPORT_READY | Scout/diagnosis/product artifacts |
| 2 | Basic approval flow | BUILD | DEPLOYED | approve/reject endpoints, status transitions, basic UI |
| 3 | Email notifications | BUILD | DEPLOYED | notification service, templates, delivery queue |
```

For context window management:
- Children 1 through N-1: one-line summary (title, mode, status, key outcome)
- Child N (latest): full detail including artifacts, code changes, and verification results
- Setup ticket (child #1) is summarized after first evaluation -- its artifacts are already incorporated into the roadmap
- This keeps context manageable even at 20 children (estimated <6K tokens)

**Section 3: Current State Assessment**
```
CURRENT STATE:
[Summary of what actually exists based on completed children's artifacts]
```

Gathered from the most recent child's implementation artifacts and verification outcomes. This is what the Assessor evaluates -- concrete reality, not planned intent.

**Section 4: Living Roadmap** (from Goal's `roadmap` JSON column)
```
LIVING ROADMAP:
Completed: approval flow (child #2), email notifications (child #3)
Current assessment: 2 of 3 criteria addressed. Core mechanisms working.
Projected remaining: admin dashboard, edge case hardening, end-to-end verification
```

**Output schema** (AssessorOutput -- see Appendix D for Zod schema):

```json
{
  "q1_matching": {
    "answer": "yes",
    "evidence": "Child #2 implemented the approval flow with approve/reject endpoints. Child #3 added email notifications. Both align with stated criteria."
  },
  "q2_more_to_do": {
    "answer": "yes",
    "evidence": "Admin dashboard (criterion #3) has not been addressed by any child ticket."
  },
  "q3_polish": {
    "answer": "no",
    "evidence": "Too early for polish -- core breadth not yet complete."
  },
  "q4_all_boxes": {
    "answer": "partial",
    "evidence": "2 of 3 explicit criteria addressed. Admin dashboard remaining."
  },
  "q5_add": {
    "answer": "yes",
    "evidence": "Admin dashboard is the next unaddressed criterion."
  },
  "q6_fix": {
    "answer": "no",
    "evidence": "No defects identified in completed work."
  },
  "q7_verify": {
    "answer": "no",
    "evidence": "Premature -- verify after all breadth criteria are addressed."
  }
}
```

**Prompt requirements for the Assessor:**
- MUST answer all 7 questions -- no skipping
- MUST cite concrete evidence from completed children for each answer
- MUST reference specific child tickets, artifacts, or code changes
- MUST NOT make a verdict -- only report observations
- MUST NOT propose next actions -- only assess current state
- Output MUST be valid JSON matching the AssessorOutput schema

### 4.3 Phase 2: Decider

**Model**: `claude-sonnet-4-6` via `query()`

**Input structure** (2 sections):

**Section 1: Goal Objective & Criteria** (same as Assessor, always full)

**Section 2: Evaluation Artifact** (the complete Phase 1 output, passed verbatim)

**Output schema** (DeciderOutput -- see Appendix D for Zod schema):

```json
{
  "verdict": "next_ticket",
  "rationale": "2 of 3 criteria addressed. Admin dashboard is the most valuable next step.",
  "proposal": {
    "title": "Build admin dashboard for RMA request tracking",
    "description": "Dashboard showing all RMA requests with status, assigned approver, and timeline. Include filtering by status, search by request ID, and export capability.",
    "mode": "BUILD",
    "facet": "Can something be added?",
    "childType": "BREADTH",
    "rationale": "Criterion #3 (admin dashboard) is unaddressed. Both approval flow and email notifications are working. Dashboard is the most valuable next step to complete breadth coverage."
  },
  "previews": [
    {
      "title": "Error handling for approval edge cases",
      "description": "Handle concurrent approvals, expired requests, notification delivery failures.",
      "facet": "Can something be fixed?",
      "childType": "DEPTH",
      "rationale": "Once core features are complete, hardening for real-world edge cases."
    },
    {
      "title": "End-to-end email delivery verification",
      "description": "Verify notification delivery pipeline with real SMTP configuration.",
      "facet": "Can something be verified?",
      "childType": "VERIFY",
      "rationale": "Email delivery is an untested assumption that should be validated."
    }
  ],
  "roadmap_update": {
    "completed_summary": "Child #2 delivered approval flow. Child #3 delivered email notifications.",
    "current_assessment": "2 of 3 success criteria addressed. Core mechanisms working.",
    "projected_remaining": ["Admin dashboard (next)", "Edge case hardening", "End-to-end verification"]
  }
}
```

**Or, when the goal is complete:**

```json
{
  "verdict": "complete",
  "rationale": "All 3 success criteria met. Approval flow (#2, #5), email (#3, #6), dashboard (#4). Verified end-to-end.",
  "proposal": null,
  "previews": [],
  "roadmap_update": {
    "completed_summary": "6 tickets: setup, approval flow, email, dashboard, edge cases, verification.",
    "current_assessment": "Objective fully met. No remaining work identified.",
    "projected_remaining": []
  }
}
```

**Prompt requirements for the Decider:**
- MUST read and reference the evaluation artifact -- it cannot re-derive answers
- MUST produce exactly one verdict: `"complete"` or `"next_ticket"`
- If `"next_ticket"`: MUST provide a proposal with title, description, mode, facet, childType, and rationale
- If `"complete"`: MUST map each success criterion to the child ticket(s) that addressed it in the rationale
- MUST generate 2-3 preview forecasts when verdict is `"next_ticket"` (non-binding, for visibility)
- MUST update the roadmap with current state
- Output MUST be valid JSON matching the DeciderOutput schema

### 4.4 Calibration Guidelines

The PM agent must navigate between two failure modes:

#### Over-Conservative: Always Finding More to Do

**Mitigations:**
1. **Bias toward completion for subjective facets.** A concrete defect is worth fixing; a hypothetical improvement is not. The Decider should require a *specific, concrete* improvement before proposing a polish ticket. "Could be better" is not enough -- "the form has no loading state on the submit button, causing double-submits" is.
2. **Diminishing-returns heuristic.** If the last N tickets were all POLISH type and no concrete improvement with clear user-visible impact can be identified, declare done.
3. **Anchor to stated criteria, not invented ones.** The "can I add something?" facet risks scope creep. Proposals must address a stated criterion or an obvious functional gap -- not nice-to-haves nobody asked for.

#### Over-Permissive: Declaring Done Prematurely

**Mitigations:**
1. **Explicit criterion mapping.** Before declaring complete, the Decider must map each success criterion to concrete evidence: which child ticket addressed it. Unmapped criteria trigger "more to do."
2. **Q4 enforcement.** The "all boxes checked" question requires explicit accounting. The Decider cannot say "complete" if Q4 shows partial coverage.
3. **No skipping.** The Assessor answers all 7 questions. The Decider sees all 7 answers. Premature completion requires ignoring evidence, which is auditable.

#### Priority Order When Multiple Questions Reveal Work

When the Assessor identifies multiple areas needing work, the Decider prioritizes:

1. **Fix broken things (Q6)** -- defects in existing work take priority over new work
2. **Address unmet criteria (Q2, Q5)** -- breadth gaps for stated success criteria
3. **Verify assumptions (Q7)** -- untested behaviors that could undermine completed work
4. **Polish (Q3)** -- quality improvements, only when concrete and specific

This reflects a bias toward correctness over completeness, and completeness over polish.

### 4.5 The 7-Question Evaluation Protocol

| # | Question | What It Checks | Maps From (User's 9 Facets) |
|---|----------|----------------|----------------------------|
| 1 | **Is it matching?** | Does what was built align with the stated objective? | "checking if it's matching" |
| 2 | **Is there anything more to do?** | Are there success criteria not yet addressed? | "checking if there's anything more to do" |
| 3 | **Does it need polish?** | Quality gaps: error handling, loading states, UX, edge cases? | "checking if any polishing" / "can I polish it" |
| 4 | **Are all boxes checked?** | Every explicit criterion accounted for? | "checking if all the boxes have been checked" |
| 5 | **Can something be added?** | Missing breadth the objective implies but no ticket addressed? | "can I add something" |
| 6 | **Can something be fixed?** | Defects or issues in what was already built? | "can I fix something" |
| 7 | **Can something be verified?** | Untested assumptions or behaviors to validate? | "can I verify something" |

Q1 is checked first because misalignment invalidates everything else. Q2 catches obvious gaps before quality questions. Q3-Q7 refine once basics are covered. Each answer requires evidence citations.

### 4.6 Context Window Management

As children accumulate, context grows. Strategy to keep prompt size manageable:

| Context Section | At 1 Child | At 5 Children | At 10 Children | At 20 Children |
|----------------|------------|---------------|----------------|----------------|
| Goal criteria | ~200 tokens | ~200 tokens | ~200 tokens | ~200 tokens |
| Setup ticket summary | ~100 tokens | ~100 tokens | ~100 tokens | ~100 tokens |
| Older children (one-line each) | 0 | ~400 tokens | ~900 tokens | ~1,900 tokens |
| Latest child (full detail) | ~2K tokens | ~2K tokens | ~2K tokens | ~2K tokens |
| Living roadmap | ~200 tokens | ~400 tokens | ~500 tokens | ~800 tokens |
| **Total estimate** | **~2.5K** | **~3.1K** | **~3.7K** | **~5K** |

Key principles:
- Goal criteria are NEVER summarized or truncated. They are the evaluation anchor.
- Setup ticket artifacts are summarized after the first evaluation -- their key insights are incorporated into the roadmap.
- The living roadmap carries institutional memory forward, reducing the need to re-derive context from old children.

### 4.7 Worked Examples

Three scenarios demonstrating the PM agent at different stages:

#### Example 1: Setup Complete, First Real Child Proposed

**Goal**: "Automate RMA approval process" (3 criteria: approval flow, email, dashboard)
**After Setup Ticket** (scout/diagnosis/product completed):

Assessor output:
- Q1 Matching: Partial -- setup has gathered context but no implementation yet.
- Q2 More to do: Yes -- all 3 criteria unaddressed.
- Q3 Polish: Not applicable -- nothing built yet.
- Q4 All boxes: None of 3 criteria addressed.
- Q5 Add: Yes -- approval flow is the core criterion.
- Q6 Fix: Nothing to fix.
- Q7 Verify: Nothing to verify.

Decider output: Propose BUILD ticket "Implement basic RMA approval flow" (childType: BREADTH, facet: Q5). Rationale: approval flow is the core of the objective and the highest-value first implementation.

Previews: (1) "Email notifications for RMA approvals" (BREADTH), (2) "Admin dashboard for tracking" (BREADTH).

#### Example 2: Near Completion, Verification Needed

**After Children #1-5** (setup, approval flow, email, dashboard, edge cases):

Assessor output:
- Q1-Q5: All criteria have implementations.
- Q6: Nothing broken.
- Q7: Email delivery untested end-to-end.

Decider output: Propose VERIFY ticket "End-to-end email delivery verification" (childType: VERIFY, facet: Q7). Chose verification over polish (Q3 noted missing loading states but that is subjective).

#### Example 3: Goal Complete

**After Children #1-6** (all above + email verification):

Assessor output: All 7 questions indicate no remaining concrete work. Q3 notes loading states would be nice but cannot articulate a specific improvement tied to stated criteria.

Decider output: `verdict: "complete"`. Rationale maps each criterion to child tickets: approval flow (#2, #5), email (#3, #6), dashboard (#4).

---

## 5. API Endpoints

### 5.1 New Controller: `src/controllers/goal-controller.ts`

All Goal API endpoints live in a dedicated controller file, separate from `ticket-controller.ts`. Follows existing patterns: Zod request validation (`ticket-controller.ts:27-40`), organization context from auth middleware, consistent error handling.

### 5.2 Endpoint Specification

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `POST` | `/api/goals` | Create a Goal | `{ title, description, maxChildren?, requireApproval?, repositoryIds?, sprintId? }` | GoalDetail |
| `GET` | `/api/goals` | List Goals for org | Query: `status?`, `limit`, `offset` | GoalListItem[] |
| `GET` | `/api/goals/:id` | Get Goal detail | -- | GoalDetail (includes children, latest eval, roadmap, previews) |
| `PATCH` | `/api/goals/:id` | Update Goal | `{ title?, description?, maxChildren?, requireApproval? }` | GoalDetail |
| `POST` | `/api/goals/:id/terminate` | Terminate Goal | `{ verdict: "complete" \| "failed" }` | GoalDetail |
| `GET` | `/api/goals/:id/evaluations` | Get evaluation history | Query: `limit`, `offset` | GoalEvaluation[] |
| `GET` | `/api/goals/:id/evaluations/:evalId` | Get single evaluation | -- | GoalEvaluation |
| `POST` | `/api/goals/:id/evaluations/:evalId/approve` | Approve proposal (approval mode) | `{ modifications?: { title?, description? } }` | Ticket (spawned child) |
| `POST` | `/api/goals/:id/evaluations/:evalId/reject` | Reject proposal (approval mode) | `{ reason?: string }` | GoalDetail |
| `GET` | `/api/goals/:id/roadmap` | Get current roadmap | -- | GoalRoadmap |
| `GET` | `/api/goals/:id/previews` | Get preview forecasts | -- | GoalPreview[] |

Route registration in `api.ts` following the ticket route pattern (lines 330-352) and sprint route pattern (lines 413-419).

### 5.3 Request/Response Types

**GoalDetail** (GET /api/goals/:id response):
```typescript
{
  id: string;
  organizationId: string;
  reporterUserId: string;
  title: string;
  description: string;
  status: GoalStatus;
  maxChildren: number;
  requireApproval: boolean;
  repositoryIds: string[];
  roadmap: GoalRoadmap | null;
  previews: GoalPreview[] | null;
  childTickets: GoalChildTicket[];
  latestEvaluation: GoalEvaluation | null;
  sprintId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**GoalListItem** (GET /api/goals response items):
```typescript
{
  id: string;
  title: string;
  description: string; // truncated
  status: GoalStatus;
  childCount: number;
  latestVerdict: "complete" | "next_ticket" | null;
  createdAt: string;
  updatedAt: string;
}
```

**GoalChildTicket** (child reference within GoalDetail):
```typescript
{
  id: string;
  title: string;
  mode: TicketMode;
  status: TicketStatus;
  childType: "BREADTH" | "DEPTH" | "POLISH" | "VERIFY" | null; // null for setup ticket
  createdAt: string;
  updatedAt: string;
}
```

**GoalEvaluation** (evaluation record):
```typescript
{
  id: string;
  goalId: string;
  triggerTicketId: string | null; // null for initial setup evaluation
  assessmentArtifact: AssessorOutput;
  deciderOutput: DeciderOutput;
  verdict: "complete" | "next_ticket";
  proposedTicketId: string | null;
  createdAt: string;
}
```

**GoalRoadmap**:
```typescript
{
  completed_summary: string;
  current_assessment: string;
  projected_remaining: string[];
}
```

**GoalPreview**:
```typescript
{
  title: string;
  description: string;
  facet: string;
  childType: "BREADTH" | "DEPTH" | "POLISH" | "VERIFY";
  rationale: string;
}
```

**TicketProposal** (within DeciderOutput):
```typescript
{
  title: string;
  description: string;
  mode: "BUILD" | "FIX" | "RESEARCH" | "EXECUTE" | "AUTO";
  facet: string;
  childType: "BREADTH" | "DEPTH" | "POLISH" | "VERIFY";
  rationale: string;
}
```

### 5.4 Zod Validation Schemas (HTTP Request Validation)

```typescript
const CreateGoalSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  maxChildren: z.number().int().min(1).max(100).optional().default(20),
  requireApproval: z.boolean().optional().default(false),
  repositoryIds: z.array(z.string()).optional().default([]),
  sprintId: z.string().optional(),
});

const UpdateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  maxChildren: z.number().int().min(1).max(100).optional(),
  requireApproval: z.boolean().optional(),
});

const TerminateGoalSchema = z.object({
  verdict: z.enum(["complete", "failed"]),
});

const ApproveProposalSchema = z.object({
  modifications: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

const RejectProposalSchema = z.object({
  reason: z.string().optional(),
});
```

### 5.5 Auth & Authorization

All endpoints require organization membership (same as ticket endpoints). Auth middleware extracts `organizationId` from the JWT. Goal operations are scoped to the user's organization.

---

## 6. Orchestrator Integration

### 6.1 The Evaluation Trigger: resolveGoalParent()

When a child ticket completes, `resolveGoalParent()` fires alongside `resolveDependentTickets()` at the existing completion hooks.

### 6.2 Hook Points

`resolveGoalParent()` is called at both completion hook points in orchestrator.ts:

| Hook Point | Location | Context |
|------------|----------|---------|
| Clean merge early exit | `orchestrator.ts:1544` | When merge completes cleanly without further steps |
| Standard success path | `orchestrator.ts:2636` | Normal ticket completion after all pipeline steps |

These are the same hook points where `resolveDependentTickets()` (`ticket-service.ts:1724`) is already called. Goal evaluation piggybacks on existing completion infrastructure.

### 6.3 Integration Code Pattern

```typescript
// At each completion hook point (alongside existing resolveDependentTickets call):

// Existing (ticket-service.ts:1724):
try { await resolveDependentTickets(run.ticketId, run.organizationId); } catch (depErr) {
  logRun(run.id, `resolveDependentTickets failed: ${depErr instanceof Error ? depErr.message : String(depErr)}`);
}

// New (added alongside, not replacing):
try { await resolveGoalParent(run.ticketId, run.organizationId); } catch (goalErr) {
  logRun(run.id, `resolveGoalParent failed: ${goalErr instanceof Error ? goalErr.message : String(goalErr)}`);
}
```

### 6.4 resolveGoalParent() Logic Flow

```
Input: childTicketId, organizationId
    |
    v
Query ticket's goalId
    |
    +-- goalId is null? --> Return immediately (not a Goal child)
    |
    +-- goalId exists
        |
        v
    Atomic transition: updateMany WHERE id=goalId AND status='ACTIVE'
    SET status='EVALUATING'
        |
        +-- count === 0? --> Log info, return (race lost or unexpected state)
        |
        +-- count === 1 (we won the race)
            |
            v
        Call evaluateGoal(goalId) asynchronously
            |
            v
        (evaluateGoal handles the rest:
         Phase 1, Phase 2, spawn or complete)
```

### 6.5 Setup Ticket Integration

The setup ticket pattern (Architecture Decision 3) uses existing orchestrator infrastructure:

1. `createGoal()` calls `createTicketForOrganization()` with mode=RESEARCH
2. The orchestrator treats it as a standard RESEARCH ticket
3. `RESEARCH_EXCLUDED_STEPS` (`orchestrator.ts:1568`) excludes code-review and preview-config
4. The setup ticket runs: scout → diagnosis → product (3 steps)
5. On completion, both `resolveDependentTickets()` and `resolveGoalParent()` fire
6. `resolveGoalParent()` transitions Goal ACTIVE→EVALUATING and triggers the first PM agent evaluation
7. The PM agent uses the setup ticket's artifacts as rich initial context

**Setup ticket is visually distinguished**: childType is null (not BREADTH/DEPTH/POLISH/VERIFY) and title starts with "Goal Setup:". The client UI can display it differently in the child tree.

### 6.6 Child Failure Handling

When a child ticket fails:
1. The completion trigger still fires (failures also trigger completion hooks)
2. `resolveGoalParent()` still runs
3. The PM agent receives the failure context in its evaluation
4. The Assessor reports the failure against the 7 questions
5. The Decider decides: retry (propose same scope with different approach), pivot (propose different work), or continue (skip and address other criteria)
6. A single child failure does NOT automatically fail the Goal

Only unrecoverable errors (operator termination, repeated evaluation failures) transition the Goal to FAILED.

### 6.7 Goals Are a Separate Entity -- Not Tickets

Unlike TicketMode RESEARCH which uses `RESEARCH_EXCLUDED_STEPS` to filter pipeline steps, Goals are a separate entity and **do not flow through the ticket pipeline at all**. There is no `GOAL_EXCLUDED_STEPS` needed.

- The **setup ticket** (first child) runs through the standard RESEARCH pipeline -- it IS a ticket
- All other **child tickets** run through the standard pipeline -- they ARE tickets
- The **Goal entity** never enters the orchestrator -- it exists alongside, triggered by child completion hooks
- The orchestrator only interacts with Goals via `resolveGoalParent()` at completion hooks

---

## 7. Client Architecture

### 7.1 Design Principle: Complete Separation from Ticket UI

The Goal UI is a **separate experience** with its own routes, components, types, and styling. No changes are made to the existing ticket UI.

**Files NOT modified:**
- `src/pages/ticket-detail.tsx` -- ticket detail stays ticket detail
- `src/components/ticket-summary.tsx` -- ticket list stays ticket list
- `src/routes/create-ticket.tsx` -- ticket creation stays ticket creation
- `src/components/mode-icons.tsx` -- no GoalIcon needed in ticket views
- `src/components/status-badge.tsx` -- TicketStatus badges unchanged
- `src/types/api.ts` (TicketMode section) -- stays at 5 values
- `src/types/api.ts` (TicketStatus section) -- stays at 17 values

### 7.2 New Routes

Routes registered inside AppShell children (`App.tsx`), following existing lazy-loading pattern for code splitting:

```typescript
// Inside AppShell children array:
{ path: "goals", lazy: async () => { const { GoalListPage } = await import("./routes/goal-list"); return { Component: GoalListPage }; } },
{ path: "goals/new", lazy: async () => { const { CreateGoalPage } = await import("./routes/create-goal"); return { Component: CreateGoalPage }; } },
{ path: "goals/:goalId", lazy: async () => { const { GoalDetailPage } = await import("./routes/goal-detail"); return { Component: GoalDetailPage }; } },
```

Per Vercel React best practices: lazy-loaded routes for bundle splitting. Goal pages are separate bundles, not loaded until navigated to.

### 7.3 New Components (9+ components)

| Component | File | Purpose |
|-----------|------|---------|
| **GoalDetailPage** | `src/routes/goal-detail.tsx` | Main Goal detail page: objective, status badge, child tree, latest evaluation, previews, roadmap, operator controls |
| **GoalListPage** | `src/routes/goal-list.tsx` | Goal list with status badges, child count, latest verdict, progress indicators |
| **CreateGoalPage** | `src/routes/create-goal.tsx` | Goal creation form: title + description (success criteria) + repositories + optional max children |
| **GoalChildTree** | `src/components/goal-child-tree.tsx` | Ordered list of child tickets with TicketStatus badges, childType chips (BREADTH/DEPTH/POLISH/VERIFY), links to ticket detail |
| **GoalEvaluationDisplay** | `src/components/goal-evaluation-display.tsx` | PM agent evaluation: all 7-question answers with evidence, verdict badge, rationale, expandable |
| **GoalPreviewPanel** | `src/components/goal-preview-panel.tsx` | Non-binding forecast tickets (2-3) with facet and childType labels |
| **GoalRoadmapView** | `src/components/goal-roadmap-view.tsx` | Living roadmap: completed summary, current assessment, projected remaining |
| **GoalStatusBadge** | `src/components/goal-status-badge.tsx` | Status badge using GoalStatus-specific OKLCH colors |
| **GoalEvaluationHistory** | `src/components/goal-evaluation-history.tsx` | Past evaluations list: chronological with trigger ticket, verdict, expandable details |

### 7.4 GoalDetail Layout

The GoalDetailPage is the primary Goal experience:

```
+------------------------------------------+
| [GoalStatusBadge] Goal Title             |
| Description / Success Criteria            |
+------------------------------------------+
| CHILD TREE                                |
| [GoalChildTree]                           |
| - Setup: Goal Setup [RESEARCH] [DONE]    |
| - Child #1 [BUILD] [DEPLOYED] [BREADTH]  |
| - Child #2 [BUILD] [DEPLOYED] [BREADTH]  |
| - Child #3 [BUILD] [IN_PROGRESS] [DEPTH] |
+------------------------------------------+
| LATEST EVALUATION                         |
| [GoalEvaluationDisplay]                   |
| Q1: Is it matching? Yes -- ...            |
| Q2: More to do? Yes -- ...                |
| ...                                       |
| Verdict: [next_ticket] "Build dashboard"  |
+------------------------------------------+
| PREVIEW FORECASTS                         |
| [GoalPreviewPanel]                        |
| > Edge case handling [DEPTH]              |
| > E2E verification [VERIFY]              |
+------------------------------------------+
| LIVING ROADMAP                            |
| [GoalRoadmapView]                         |
| Completed: approval flow, email           |
| Assessment: 2/3 criteria met              |
| Remaining: dashboard, hardening, verify   |
+------------------------------------------+
| EVALUATION HISTORY                        |
| [GoalEvaluationHistory]                   |
| > Eval #1 (setup complete) [next_ticket]  |
| > Eval #2 (child #1) [next_ticket]        |
+------------------------------------------+
| CONTROLS                                  |
| [Terminate: Complete | Failed]            |
| [Toggle: Per-ticket approval]             |
+------------------------------------------+
```

### 7.5 New Types

Added to `src/types/api.ts` (extending existing file):

```typescript
// GoalStatus -- separate from TicketStatus (9 values)
export const GoalStatuses = {
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  ACTIVE: "ACTIVE",
  EVALUATING: "EVALUATING",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type GoalStatus = (typeof GoalStatuses)[keyof typeof GoalStatuses];

// Goal detail type
export interface GoalDetail {
  id: string;
  organizationId: string;
  reporterUserId: string;
  title: string;
  description: string;
  status: GoalStatus;
  maxChildren: number;
  requireApproval: boolean;
  repositoryIds: string[];
  roadmap: GoalRoadmap | null;
  previews: GoalPreview[] | null;
  childTickets: GoalChildTicket[];
  latestEvaluation: GoalEvaluation | null;
  sprintId: string | null;
  createdAt: string;
  updatedAt: string;
}

// GoalListItem for list views
export interface GoalListItem {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  childCount: number;
  latestVerdict: "complete" | "next_ticket" | null;
  createdAt: string;
  updatedAt: string;
}

// GoalEvaluation
export interface GoalEvaluation {
  id: string;
  goalId: string;
  triggerTicketId: string | null;
  assessmentArtifact: AssessorOutput;
  deciderOutput: DeciderOutput;
  verdict: "complete" | "next_ticket";
  proposedTicketId: string | null;
  createdAt: string;
}

// AssessorOutput (Phase 1)
export interface AssessorOutput {
  q1_matching: { answer: string; evidence: string };
  q2_more_to_do: { answer: string; evidence: string };
  q3_polish: { answer: string; evidence: string };
  q4_all_boxes: { answer: string; evidence: string };
  q5_add: { answer: string; evidence: string };
  q6_fix: { answer: string; evidence: string };
  q7_verify: { answer: string; evidence: string };
}

// DeciderOutput (Phase 2)
export interface DeciderOutput {
  verdict: "complete" | "next_ticket";
  rationale: string;
  proposal: TicketProposal | null;
  previews: GoalPreview[];
  roadmap_update: GoalRoadmap;
}

// GoalChildTicket
export interface GoalChildTicket {
  id: string;
  title: string;
  mode: TicketMode;
  status: TicketStatus;
  childType: "BREADTH" | "DEPTH" | "POLISH" | "VERIFY" | null;
  createdAt: string;
  updatedAt: string;
}

// GoalRoadmap
export interface GoalRoadmap {
  completed_summary: string;
  current_assessment: string;
  projected_remaining: string[];
}

// GoalPreview
export interface GoalPreview {
  title: string;
  description: string;
  facet: string;
  childType: "BREADTH" | "DEPTH" | "POLISH" | "VERIFY";
  rationale: string;
}

// TicketProposal
export interface TicketProposal {
  title: string;
  description: string;
  mode: "BUILD" | "FIX" | "RESEARCH" | "EXECUTE" | "AUTO";
  facet: string;
  childType: "BREADTH" | "DEPTH" | "POLISH" | "VERIFY";
  rationale: string;
}
```

Uses the `const-as-const` pattern consistent with existing `TicketModes` and `TicketStatuses` in api.ts.

### 7.6 Styling

#### GoalStatus Color Tokens (OKLCH)

New tokens in `src/index.css`, namespaced with `goal-` to stay separate from existing `--color-status-*` tokens:

```css
/* Goal status tokens -- separate namespace from ticket status */
--color-goal-draft: oklch(0.65 0.05 250);          /* Neutral gray-blue */
--color-goal-queued: oklch(0.70 0.12 260);          /* Light blue */
--color-goal-running: oklch(0.72 0.15 200);         /* Teal -- processing */
--color-goal-active: oklch(0.75 0.18 160);          /* Green-blue -- in progress */
--color-goal-evaluating: oklch(0.78 0.16 55);       /* Amber -- analyzing */
--color-goal-pending-approval: oklch(0.72 0.14 30); /* Orange -- attention needed */
--color-goal-paused: oklch(0.65 0.10 80);           /* Yellow-gray -- on hold */
--color-goal-completed: oklch(0.80 0.19 145);       /* Green -- success */
--color-goal-failed: oklch(0.60 0.22 25);           /* Red -- failure */
```

Tokens added to all three theme palettes (Stellar Teal, Cosmic Indigo, Solar Ember) plus accessibility modes, following the existing pattern in index.css lines 116-132.

#### Child Type Chip Colors

| childType | Color | Visual |
|-----------|-------|--------|
| BREADTH | Blue (`oklch(0.65 0.15 250)`) | Rounded chip with label |
| DEPTH | Purple (`oklch(0.60 0.18 300)`) | Rounded chip with label |
| POLISH | Amber (`oklch(0.75 0.15 85)`) | Rounded chip with label |
| VERIFY | Green (`oklch(0.65 0.18 145)`) | Rounded chip with label |

### 7.7 Data Fetching

TanStack Query hooks in new `src/api/goals.ts` file, following existing `tickets.ts` patterns (queryOptions factories + useMutation hooks):

| Hook | Pattern Source | Purpose |
|------|---------------|---------|
| `goalsQueryOptions()` | `ticketsQueryOptions()` | List goals with status filter |
| `goalQueryOptions(goalId)` | `ticketQueryOptions(ticketId)` | Single goal detail |
| `goalEvaluationsQueryOptions(goalId)` | `commentsQueryOptions(ticketId)` | Evaluation audit trail with refetchInterval |
| `useCreateGoal()` | `useCreateTicket()` | Create goal mutation |
| `useTerminateGoal(goalId)` | `useUpdateTicketStatus(ticketId)` | Terminate goal mutation |
| `useApproveProposal(goalId, evalId)` | `useStartTicketRun(ticketId)` | Approve proposal mutation |
| `useRejectProposal(goalId, evalId)` | Similar | Reject proposal mutation |

Active goals use `refetchInterval: 15_000` for polling evaluation progress (existing pattern: `commentsQueryOptions` uses `refetchInterval: 30_000` at `tickets.ts:490`).

### 7.8 Navigation

Goal navigation is a top-level entry point, separate from ticket navigation:

- **Sidebar/navbar**: "Goals" link alongside "Tickets"
- **Goal list** (`/goals`): Shows all organization goals
- **Goal detail** (`/goals/:id`): Full goal experience
- **Child ticket link**: Clicking a child in GoalChildTree opens the ticket detail (`/tickets/:id`). The ticket detail shows a "Part of Goal" breadcrumb linking back to the parent Goal (via `goalId` on the ticket).
- **Back to Goal**: From ticket detail, a small link/breadcrumb for tickets with a `goalId` links back to `/goals/:goalId`

Per Vercel React best practices: avoid re-render waterfalls by keeping Goal and Ticket queries independent.

### 7.9 Key Constraint: No Ticket UI Changes

To reiterate: the existing ticket UI is completely untouched. Goals do not modify any existing ticket functionality.

The only Ticket-related type change: adding `goalId` and `childType` to the Ticket type definition (for the "Part of Goal" breadcrumb display).

---

## 8. CLI Support

### 8.1 New Command Namespace: `hlx goals`

Goals get their own CLI namespace, separate from `hlx tickets`. This follows from the separate entity decision -- Goals are not tickets, so they don't use `hlx tickets create --mode GOAL`.

### 8.2 New Directory: `src/goals/`

| File | Command | Purpose |
|------|---------|---------|
| `src/goals/create.ts` | `hlx goals create` | Create a new Goal |
| `src/goals/list.ts` | `hlx goals list` | List Goals |
| `src/goals/get.ts` | `hlx goals get` | Get Goal detail |
| `src/goals/terminate.ts` | `hlx goals terminate` | Terminate a Goal |

### 8.3 Command Specifications

#### `hlx goals create`

```
Usage: hlx goals create --title <title> --description <description> [options]

Options:
  --title <title>           Goal title (required)
  --description <desc>      Goal description with success criteria (required)
  --max-children <n>        Maximum child tickets (default: 20)
  --require-approval        Enable per-ticket approval mode
  --sprint <sprintId>       Associate with a sprint
  --repos <repos...>        Repositories for child tickets

Example:
  hlx goals create --title "Automate RMA process" \
    --description "Build complete RMA approval with: 1) approval flow, 2) email notifications, 3) admin dashboard" \
    --max-children 15 \
    --repos helix-global-server helix-global-client
```

**API call**: `POST /api/goals`

#### `hlx goals list`

```
Usage: hlx goals list [options]

Options:
  --status <status>    Filter by GoalStatus (DRAFT, QUEUED, RUNNING, ACTIVE, EVALUATING, PENDING_APPROVAL, PAUSED, COMPLETED, FAILED)
  --limit <n>          Results per page (default: 20)

Example:
  hlx goals list --status ACTIVE
```

**API call**: `GET /api/goals`

#### `hlx goals get`

```
Usage: hlx goals get <goalId>

Example:
  hlx goals get clxyz123abc
```

**API call**: `GET /api/goals/:id`

Output includes: title, description, status, child count, latest evaluation verdict, roadmap summary, preview forecasts.

#### `hlx goals terminate`

```
Usage: hlx goals terminate <goalId> --verdict <complete|failed>

Options:
  --verdict <verdict>   "complete" or "failed" (required)

Example:
  hlx goals terminate clxyz123abc --verdict complete
```

**API call**: `POST /api/goals/:id/terminate`

### 8.4 Key Constraint: VALID_MODES Unchanged

`VALID_MODES` in `src/tickets/create.ts` (line 13) is **NOT modified**. It stays at 5 values: AUTO, BUILD, FIX, RESEARCH, EXECUTE. The command `hlx tickets create --mode GOAL` should NOT work -- Goals are created via `hlx goals create`.

### 8.5 Documentation Updates

`src/docs/cli-content.ts` should be updated to document the `hlx goals` namespace alongside existing `hlx tickets` documentation.

---

## 9. Implementation Phases & Cross-Repo Ordering

### 9.1 Six-Phase Implementation Sequence

| Phase | Repo | What | Depends On | Estimated Effort |
|-------|------|------|------------|------------------|
| **1** | helix-global-server | Schema + migration: Goal table, GoalEvaluation table, GoalStatus enum, goalId/childType on Ticket, repositoryIds on Goal | Nothing | 1 ticket |
| **2** | helix-global-server | Service plumbing: goal-service.ts with createGoal, resolveGoalParent, spawnGoalChild, validateGoalLimits, terminateGoal, approveProposal, rejectProposal | Phase 1 | 1 ticket |
| **3a** | helix-global-server | PM agent implementation: runAssessor, runDecider, parseAssessorOutput, parseDeciderOutput, evaluateGoal orchestration, Zod output schemas | Phase 2 | 2 tickets (prompts + parsers in one, evaluateGoal orchestration + calibration tests in another) |
| **3b** | helix-global-server | API + orchestrator: goal-controller.ts with 11 endpoints, resolveGoalParent at completion hooks | Phase 2 | 1 ticket |
| **4** | helix-global-client | Types + shared components: GoalStatus type, Goal API types, GoalStatusBadge, OKLCH tokens, TanStack Query hooks, API file | Phase 3b (server API must exist) | 1 ticket |
| **5** | helix-global-client | Routes + full components: GoalListPage, GoalDetailPage, CreateGoalPage, GoalChildTree, GoalEvaluationDisplay, GoalPreviewPanel, GoalRoadmapView, GoalEvaluationHistory | Phase 4 | 1-2 tickets |
| **6** | helix-cli | Goals namespace: create, list, get, terminate commands, documentation | Phase 3b (server API must exist) | 1 ticket |

**Total estimated**: 8-10 tickets across 6 phases.

**Phase 2 / 3a re-estimation note** (per user code review): The prior report estimated "all 8 service functions, 1-2 tickets" for Phase 2. This was unrealistic -- prompt-engineering two LLM agents + JSON contract + defensive parser + retry + calibration tests is the core project, not a single ticket. The revised estimate splits service plumbing (Phase 2, 1 ticket) from PM agent implementation (Phase 3a, 2 tickets), with calibration test fixtures explicitly in Phase 3a's Definition of Done.

### 9.2 Phase 3a: PM Agent Implementation -- Definition of Done

This is the critical phase. Its DoD includes:
1. Assessor and Decider prompts producing valid structured output
2. Zod schemas validating both outputs
3. Defensive parser with markdown fence stripping and retry-with-correction
4. `evaluateGoal()` orchestrating both phases end-to-end
5. **Calibration eval fixtures**: A set of test cases (3-5 scenarios at minimum) covering:
   - First evaluation after setup (cold start)
   - Mid-progress evaluation (partial criteria met)
   - Near-completion evaluation (all criteria met, should declare done)
   - Over-conservative scenario (should NOT propose unnecessary polish)
   - Child failure scenario (should propose corrective action)

### 9.3 Cross-Repo Coordination Notes

1. **Server must be complete before client or CLI.** Both client and CLI depend on the server API existing. Server phases 1-3b are the critical path.
2. **Phases 3a and 3b can run in parallel.** PM agent prompts/parsers and API endpoints are independent.
3. **Phases 4 and 6 can run in parallel.** Client type setup and CLI commands both depend on Phase 3b (server API) but do not depend on each other.
4. **Client types must match server response schemas.** The GoalDetail, GoalListItem, GoalEvaluation, etc. types on the client must exactly match the server's API response structure. Types are manually maintained (consistent with existing TicketMode/TicketStatus pattern). Auto-generation from Zod is deferred.
5. **CLI hits server API directly.** CLI commands are thin wrappers around API calls -- no business logic in the CLI.

### 9.4 Dependency Graph

```
Phase 1 (Schema)
    |
    v
Phase 2 (Service plumbing)
    |
    +------------------+
    |                  |
    v                  v
Phase 3a (PM agent)  Phase 3b (API + Orchestrator)
    |                  |
    |         +--------+---------+
    |         |                  |
    |         v                  v
    |     Phase 4 (Client)    Phase 6 (CLI)
    |         |
    |         v
    |     Phase 5 (Client UI)
    |
    v
(PM agent readiness feeds into Phase 3b integration testing)
```

---

## 10. Safety, Edge Cases & Risk

### 10.1 Safety Bounds

| Safety Mechanism | How It Works | Configurable? |
|-----------------|-------------|---------------|
| **Max children** (default 20) | Hard limit on total tickets spawned (including setup ticket). After max, Goal transitions to PAUSED for human decision. | Yes -- per Goal via `maxChildren` |
| **Manual termination** | Operator can terminate at any point: mark as COMPLETED or FAILED. | Always available |
| **Per-ticket approval mode** | Opt-in: PM agent proposes, operator reviews and approves/modifies/rejects before ticket spawns. PENDING_APPROVAL status. | Per Goal via `requireApproval` |
| **Preview visibility** | 2-3 forecast tickets visible after each evaluation. Operator sees direction without gatekeeping. | Always on |
| **Living roadmap** | Continuously updated plan visible to operator. Drift from original objective visible in real time. | Always on |
| **Evaluation audit trail** | Every PM agent evaluation (Assessor artifact + Decider output + verdict) stored in GoalEvaluation table. | Always on |
| **Per-ticket scope** | Each child is an MVP-scoped ticket through the normal pipeline with its own verification. Bounded risk per iteration. | Inherent |
| **Atomic concurrency guard** | `updateMany WHERE status='ACTIVE'` prevents duplicate evaluations from concurrent completions. | Built-in |

### 10.2 Edge Cases

#### Child Failure

When a child ticket fails:
- Goal transitions to EVALUATING (not FAILED)
- PM agent receives failure context in evaluation
- PM agent decides: retry (propose same scope, different approach), pivot (different work area), or continue (skip, address other criteria)
- Single failure does NOT fail the Goal
- Multiple consecutive failures on the same scope: PM agent should note this in roadmap and may recommend human review

#### Setup Ticket Failure

If the setup ticket (RESEARCH mode) fails:
- `resolveGoalParent()` fires with failure context
- PM agent evaluates with only the goal description (limited context)
- Options: retry setup (propose another RESEARCH ticket for context), or proceed with limited context
- If the PM agent cannot produce a useful evaluation: Goal transitions to PAUSED for human intervention

#### Ambiguous Objective

If Goal description lacks clear success criteria:
- PM agent's Assessor will struggle with Q4 ("all boxes checked") -- no boxes to check
- Decider should flag: "Cannot determine whether criterion X is met because it is not specific enough."
- Goal can be paused for human input
- **Design note**: Goals require richer descriptions than tickets. The description should include explicit, enumerated success criteria. This should be communicated in the Goal creation UI.

#### Scope Creep

The "can I add something?" facet (Q5) risks expanding scope:
- PM agent anchors proposals to stated success criteria, not invented requirements
- "Approval flow, email, dashboard" goal should NOT produce a "build mobile app" proposal
- Calibration rule: proposals must address a stated criterion or an obvious functional gap in a stated criterion

#### Stalled Goals

Goal stalls when PM agent cannot produce a clear verdict:
- Configurable idle timeout
- After timeout: Goal transitions to PAUSED with "needs human review" context
- Operator decides: mark complete, provide direction, or extend

#### Competing Priorities Between Facets

When multiple questions reveal work, priority order:
1. Fix broken (Q6) > 2. Unmet criteria (Q2, Q5) > 3. Verify (Q7) > 4. Polish (Q3)

#### Operator Intervention

Available at any time, not required:
- **Override "complete" verdict**: Adjust description, Goal continues
- **Override "not complete" verdict**: Mark complete manually
- **Redirect trajectory**: Update success criteria or roadmap
- **Enable approval mode**: Switch to per-ticket approval for remaining work
- **Extend max children**: Increase the limit when PAUSED at the boundary

---

## 11. Reliability & Operational Model

### 11.1 Retry / Timeout / Backoff Strategy

Each `query()` call (both Assessor and Decider) uses this concrete strategy:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max retries per call | 2 | Enough for format correction; more wastes cost |
| Timeout per call | 90 seconds | Longer than walkthrough-service's 60s due to larger prompts |
| Backoff between retries | 3s (1st retry), 10s (2nd retry) | Fast first retry for transient issues, slower second for load |
| **Transient (retry)** | Timeout, network error, malformed JSON, Zod validation failure | Correctable errors -- retry with error context in prompt |
| **Terminal (no retry)** | Content-filter block, auth error, rate limit after exhaustion | Won't fix with retry |
| All retries exhausted | Goal transitions to PAUSED with error context | Human review, not auto-fail |

On Zod validation failure, the retry prompt includes the Zod error message so the LLM can correct its output format. This is the "retry-with-correction loop" pattern.

### 11.2 LLM Output Parsing Pipeline

Both Assessor and Decider outputs go through the same defensive parsing pipeline:

```
Raw LLM response text
    |
    v
Strip markdown fences (```json ... ```)
    |
    v
JSON.parse()
    |
    +-- Parse error? --> Retry with "Your response was not valid JSON: {error}" in prompt
    |
    v
Zod schema.safeParse()
    |
    +-- Validation error? --> Retry with "Your JSON was parsed but failed validation: {zodError}" in prompt
    |
    v
Return typed output
```

This mirrors the `parseCodeTourJson` pattern in `walkthrough-service.ts:228` but adds Zod validation and retry-with-correction.

### 11.3 Latency Model

| Operation | Expected Duration | Notes |
|-----------|------------------|-------|
| Assessor `query()` call | 30-60s | ~5K token input, ~2K token output |
| Decider `query()` call | 20-40s | ~3K token input (goal + artifact), ~1K output |
| Parsing + validation | <1s | CPU-bound JSON/Zod |
| Child ticket spawn | <2s | Prisma insert + orchestrator enqueue |
| **Total evaluation cycle** | **60-120s** | End-to-end from child completion to next child queued |

At 20 children × 90s average per evaluation: ~30 minutes of PM agent time over the goal's lifetime. With child ticket execution between evaluations, total goal duration is hours to days. This is acceptable because:
- Goals are fundamentally async -- they run autonomously, not on a hot path
- The EVALUATING status badge communicates "PM agent is thinking" in the UI
- Previews and roadmap provide forward-looking context during evaluation

### 11.4 Cost Model

| Component | Per Evaluation | Per Goal (20 children) | Notes |
|-----------|---------------|----------------------|-------|
| Assessor input | ~5K tokens | ~100K tokens | Grows slowly with children due to summarization |
| Assessor output | ~2K tokens | ~40K tokens | 7 questions × ~300 tokens each |
| Decider input | ~3K tokens | ~60K tokens | Goal + artifact |
| Decider output | ~1K tokens | ~20K tokens | Verdict + proposal + previews |
| **Total tokens** | **~11K** | **~220K** | Upper bound |
| **Estimated cost** | **~$0.05-0.15** | **~$1-3** | At Sonnet 4.6 pricing |

Cost is bounded by maxChildren. The setup ticket adds one evaluation cycle. Total worst-case (20 evaluations): ~$3 per Goal. This is a fraction of the value delivered by autonomous multi-ticket execution.

### 11.5 Concurrent Evaluation Protection

The atomic `updateMany` pattern prevents TOCTOU races:

```typescript
// In resolveGoalParent():
const { count } = await prisma.goal.updateMany({
  where: { id: goalId, status: GoalStatus.ACTIVE },
  data: { status: GoalStatus.EVALUATING },
});

if (count === 0) {
  // Another completion already triggered evaluation, or goal is in unexpected state
  console.info(`[resolveGoalParent] Goal ${goalId} not in ACTIVE state, skipping evaluation`);
  return;
}

// count === 1: we won the race, proceed with evaluation
```

Race scenarios and outcomes:
- **Two children complete simultaneously**: First caller gets `count: 1` and evaluates. Second gets `count: 0` and silently exits. The evaluation sees both completed children.
- **Manual rerun + completion hook**: Same pattern -- only one caller proceeds.
- **Evaluation already running**: Goal is in EVALUATING, not ACTIVE -- `count: 0`, skip.

---

## 12. Open Questions & Future Work

### 12.1 Open Questions

| # | Question | Status | Impact |
|---|----------|--------|--------|
| 1 | **PM agent prompt engineering** | Open | Full prompt text for Assessor and Decider needs iterative tuning. Specification in Section 4 provides structure and constraints; exact wording is implementation detail in Phase 3a. |
| 2 | **Preview lifecycle** | Open | When does a preview become the actual next ticket? Currently previews are replaced wholesale each cycle. No structural relationship between preview and spawned ticket. |
| 3 | **Roadmap JSON schema evolution** | Open | Current: `completed_summary`, `current_assessment`, `projected_remaining`. May need additional fields. Start simple, evolve. |
| 4 | **Context window validation at scale** | Open | Estimated <6K tokens at 20 children, but real-world validation needed in Phase 3a. |
| 5 | **Goal UI navigation placement** | Open | Top-level sidebar entry? Separate tab? Route is `/goals` but navigation UX needs design in Phase 5. |
| 6 | **Goal creation flow UX** | Open | Simple form vs. guided wizard? How to help users write good success criteria? Phase 5 detail. |
| 7 | **Evaluation polling interval** | Open | Client polls at 15s during EVALUATING. Real-time via WebSocket is V2. |

### 12.2 Future Work

#### Near-Term (Post-MVP)
- **Goal progress dashboard**: Aggregate view of all active Goals with progress indicators
- **Goal-to-Goal dependency**: Sequence Goals using shared infrastructure
- **PM agent calibration learning**: Using evaluation history and operator interventions to improve accuracy
- **Real-time evaluation status**: WebSocket/SSE for live evaluation progress

#### Medium-Term (Post-Playbook Phase 1)
- **Playbook-enhanced evaluation**: PM agent receives Playbook rules as additional evaluation context (requires RSH-411)
- **Multi-ticket proposals**: PM agent proposes multiple concurrent tickets when work is clearly parallel
- **Parallel child execution**: Multiple children running simultaneously
- **Predictive estimation**: Using completed Goal histories to estimate child count and timeline
- **Auto-generated client types from server Zod schemas**: Eliminate manual type contract drift

#### Long-Term
- **Nested Goals**: Goals spawning sub-Goals for large multi-phase initiatives (max depth = 1 for MVP)
- **Goal graph visualization**: Interactive DAG showing Goal → children with status and evaluation facets
- **Speculative execution**: Start previewed tickets speculatively, abort if PM agent changes direction
- **Cross-organization Goal patterns**: Templates for common business objectives

---

## Appendix A: Goal Lifecycle State Transition Diagram

```
                    +------------------+
                    |      DRAFT       |
                    |  (Goal created)  |
                    +--------+---------+
                             |
                        Operator activates
                        (or auto on create)
                             |
                             v
                    +------------------+
                    |     QUEUED       |
                    | (Setup ticket    |
                    |  waiting to run) |
                    +--------+---------+
                             |
                     Setup ticket starts
                             |
                             v
                    +------------------+
                    |     RUNNING      |
                    | (Setup ticket    |
                    |  executing:      |
                    |  scout/diagnosis/|
                    |  product)        |
                    +--------+---------+
                             |
                     Setup ticket completes
                     → resolveGoalParent fires
                     → PM agent evaluates
                     → first child spawned
                             |
                             v
               +---->+------------------+
               |     |     ACTIVE       |
               |     | (Child ticket    |
               |     |  executing)      |
               |     +--------+---------+
               |              |
               |         Child completes
               |         (success or failure)
               |              |
               |              v
               |     +------------------+
               |     |   EVALUATING     |
               |     | (PM agent runs   |
               |     |  Phase 1 + 2)    |
               |     +--------+---------+
               |              |
               |     +--------+--------+---------+
               |     |                 |         |
               |  verdict:          verdict:  requireApproval
               |  next_ticket       complete  && next_ticket
               |     |                 |         |
               |     v                 v         v
               |  within          +---------+ +-----------------+
               |  limits?         |COMPLETED| |PENDING_APPROVAL |
               |  +---+---+       +---------+ +--------+--------+
               |  |       |                            |
               | Yes     No                    +-------+-------+
               |  |       |                    |               |
               |  |       v                 Approve          Reject
               |  |  +--------+             (spawn           (re-evaluate)
               |  |  | PAUSED |              child)             |
               +--+  +--------+                |               |
                  |                             v               v
            Spawn next child              (ACTIVE)        (EVALUATING)
                  |
                  v
            (back to ACTIVE)


    At any time, operator can:
    - Terminate as COMPLETED
    - Terminate as FAILED

                    +------------------+
                    |     FAILED       |
                    | (Operator        |
                    |  terminated or   |
                    |  unrecoverable)  |
                    +------------------+
```

**Valid transitions:**

| From | To | Trigger |
|------|----|---------|
| DRAFT | QUEUED | Activation (auto or manual) |
| QUEUED | RUNNING | Setup ticket starts executing |
| RUNNING | ACTIVE | Setup completes → first evaluation → first child spawned |
| RUNNING | FAILED | Setup fails unrecoverably |
| ACTIVE | EVALUATING | Child completes (atomic updateMany) |
| EVALUATING | ACTIVE | Next child spawned (no approval needed, within limits) |
| EVALUATING | COMPLETED | PM agent declares objective met |
| EVALUATING | PENDING_APPROVAL | requireApproval=true and verdict=next_ticket |
| EVALUATING | PAUSED | Max children reached or retries exhausted |
| EVALUATING | FAILED | Unrecoverable evaluation error |
| PENDING_APPROVAL | ACTIVE | Operator approves → child spawned |
| PENDING_APPROVAL | EVALUATING | Operator rejects → re-evaluate |
| PAUSED | ACTIVE | Operator extends limit or provides direction |
| PAUSED | COMPLETED | Operator marks complete |
| PAUSED | FAILED | Operator terminates |
| Any non-terminal | COMPLETED | Operator marks complete |
| Any non-terminal | FAILED | Operator terminates |

---

## Appendix B: PM Agent Output JSON Schemas

### B.1 AssessorOutput (Phase 1 -- Assessor Output)

```json
{
  "q1_matching": {
    "answer": "yes | no | partial",
    "evidence": "String citing specific child tickets, artifacts, or code changes"
  },
  "q2_more_to_do": {
    "answer": "yes | no",
    "evidence": "String identifying unaddressed criteria or confirming coverage"
  },
  "q3_polish": {
    "answer": "yes | no | not_yet",
    "evidence": "String identifying concrete quality gaps or explaining why too early/unnecessary"
  },
  "q4_all_boxes": {
    "answer": "all | partial | none",
    "evidence": "String mapping each success criterion to its addressing child ticket"
  },
  "q5_add": {
    "answer": "yes | no",
    "evidence": "String identifying missing breadth or confirming complete coverage"
  },
  "q6_fix": {
    "answer": "yes | no",
    "evidence": "String identifying defects or confirming no issues"
  },
  "q7_verify": {
    "answer": "yes | no | not_yet",
    "evidence": "String identifying untested assumptions or confirming verification"
  }
}
```

### B.2 DeciderOutput (Phase 2 -- Decider Output)

```json
{
  "verdict": "complete | next_ticket",
  "rationale": "String -- high-level reasoning for the verdict",
  "proposal": {
    "title": "String -- ticket title",
    "description": "String -- detailed ticket description",
    "mode": "BUILD | FIX | RESEARCH | EXECUTE | AUTO",
    "facet": "String -- which evaluation question motivated this (e.g., 'Can something be added?')",
    "childType": "BREADTH | DEPTH | POLISH | VERIFY",
    "rationale": "String -- why this is the most valuable next action"
  },
  "previews": [
    {
      "title": "String",
      "description": "String",
      "facet": "String",
      "childType": "BREADTH | DEPTH | POLISH | VERIFY",
      "rationale": "String"
    }
  ],
  "roadmap_update": {
    "completed_summary": "String -- what has been built so far",
    "current_assessment": "String -- where things stand against the objective",
    "projected_remaining": ["String -- anticipated next work items"]
  }
}
```

**Notes:**
- `proposal` is null when `verdict` = "complete"
- `previews` contains 2-3 items when `verdict` = "next_ticket", empty when "complete"
- `roadmap_update` is always present

---

## Appendix C: GoalEvaluation Table Schema

Full Prisma model with field descriptions:

```prisma
model GoalEvaluation {
  // Primary key
  id                   String   @id @default(cuid())

  // Parent Goal reference
  goalId               String   // FK to Goal.id

  // Which child ticket triggered this evaluation
  // null for the initial setup evaluation
  triggerTicketId      String?

  // Phase 1 output: the Assessor's structured evaluation artifact
  // Contains answers to all 7 questions with evidence citations
  // Schema: AssessorOutput (see Appendix B.1)
  assessmentArtifact   Json

  // Phase 2 output: the Decider's full output
  // Contains verdict, proposal, previews, roadmap_update
  // Schema: DeciderOutput (see Appendix B.2)
  deciderOutput        Json

  // Denormalized verdict for efficient filtering
  // "complete" = objective met
  // "next_ticket" = more work needed
  verdict              String

  // The child ticket spawned from this evaluation (if any)
  // Links evaluation to its spawned child for tracing
  proposedTicketId     String?

  // Timestamp
  createdAt            DateTime @default(now())

  // Relations
  goal                 Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)

  // Efficient lookup: all evaluations for a Goal in chronological order
  @@index([goalId, createdAt])
}
```

**Query patterns:**
- Get latest evaluation: `prisma.goalEvaluation.findFirst({ where: { goalId }, orderBy: { createdAt: 'desc' } })`
- Get full history: `prisma.goalEvaluation.findMany({ where: { goalId }, orderBy: { createdAt: 'asc' } })`
- Get evaluation triggered by specific child: `prisma.goalEvaluation.findFirst({ where: { goalId, triggerTicketId } })`

---

## Appendix D: Zod Validation Schemas

Server-side Zod v4 schemas for validating LLM outputs:

```typescript
import { z } from "zod";

// Phase 1: Assessor output -- structured answers to 7-question evaluation protocol
export const AssessorOutputSchema = z.object({
  q1_matching: z.object({
    answer: z.enum(["yes", "no", "partial"]),
    evidence: z.string().min(1),
  }),
  q2_more_to_do: z.object({
    answer: z.enum(["yes", "no", "partial"]),
    evidence: z.string().min(1),
  }),
  q3_polish: z.object({
    answer: z.enum(["yes", "no", "partial", "not_yet"]),
    evidence: z.string().min(1),
  }),
  q4_all_boxes: z.object({
    answer: z.enum(["all", "partial", "none"]),
    evidence: z.string().min(1),
  }),
  q5_add: z.object({
    answer: z.enum(["yes", "no"]),
    evidence: z.string().min(1),
  }),
  q6_fix: z.object({
    answer: z.enum(["yes", "no"]),
    evidence: z.string().min(1),
  }),
  q7_verify: z.object({
    answer: z.enum(["yes", "no", "not_yet"]),
    evidence: z.string().min(1),
  }),
});

// Phase 2: Decider output -- verdict + proposal + previews + roadmap update
export const DeciderOutputSchema = z.object({
  verdict: z.enum(["complete", "next_ticket"]),
  rationale: z.string().min(1),
  proposal: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    mode: z.enum(["BUILD", "FIX", "RESEARCH", "EXECUTE", "AUTO"]),
    facet: z.string().min(1),
    childType: z.enum(["BREADTH", "DEPTH", "POLISH", "VERIFY"]),
    rationale: z.string().min(1),
  }).nullable(),
  previews: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    facet: z.string().min(1),
    childType: z.enum(["BREADTH", "DEPTH", "POLISH", "VERIFY"]),
    rationale: z.string().min(1),
  })),
  roadmap_update: z.object({
    completed_summary: z.string(),
    current_assessment: z.string(),
    projected_remaining: z.array(z.string()),
  }),
});
```

**Usage in the defensive parser:**

```typescript
function parseAssessorOutput(rawText: string): z.infer<typeof AssessorOutputSchema> {
  // Step 1: Strip markdown fences
  const cleaned = rawText
    .replace(/^```(?:json)?\s*\n?/gm, "")
    .replace(/\n?```\s*$/gm, "")
    .trim();

  // Step 2: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`JSON parse failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Step 3: Validate with Zod
  const result = AssessorOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Zod validation failed: ${JSON.stringify(result.error.issues)}`);
  }

  return result.data;
}
```

---

## Product Scenarios Coverage

This section maps each of the 13 product scenarios (from product/product.md) to the report section(s) that address them:

| Scenario | Description | Addressed By |
|----------|-------------|-------------|
| SCN-01 | Create a new Goal | Section 5 (POST /api/goals), Section 7.3 (CreateGoalPage), Section 8 (hlx goals create) |
| SCN-02 | Goal completes setup and spawns first child | Section 3 (createGoal, evaluateGoal), Section 4.7 (Example 1), Section 6.5 (setup ticket integration) |
| SCN-03 | View PM agent evaluation after child completes | Section 4 (dual-phase output), Section 5 (GET evaluations), Section 7.3 (GoalEvaluationDisplay) |
| SCN-04 | PM agent proposes and spawns next child autonomously | Section 3 (spawnGoalChild, evaluateGoal), Section 4 (Decider), Section 6 (resolveGoalParent trigger) |
| SCN-05 | Goal reaches completion | Section 3 (evaluateGoal verdict=complete), Section 4.7 (Example 3), Appendix A (COMPLETED transition) |
| SCN-06 | View living roadmap and preview forecasts | Section 5 (GET roadmap, GET previews), Section 7.3 (GoalRoadmapView, GoalPreviewPanel) |
| SCN-07 | Manually terminate a Goal | Section 3 (terminateGoal), Section 5 (POST /terminate), Section 8 (hlx goals terminate) |
| SCN-08 | Max children safety bound triggers | Section 3 (validateGoalLimits), Section 10.1 (max children), Appendix A (PAUSED transition) |
| SCN-09 | PM agent handles child failure | Section 4.4 (calibration), Section 6.6 (child failure handling), Section 10.2 (edge case) |
| SCN-10 | Enable and use per-ticket approval mode | Section 3 (approveProposal, rejectProposal), Section 5 (approve/reject endpoints), Appendix A (PENDING_APPROVAL) |
| SCN-11 | Create a Goal via CLI | Section 8 (hlx goals create) |
| SCN-12 | Navigate between Goal and child ticket views | Section 7.3 (GoalChildTree), Section 7.4 (layout), Section 7.8 (navigation) |
| SCN-13 | View evaluation history for a Goal | Section 5 (GET evaluations), Section 7.3 (GoalEvaluationHistory), Appendix C (query patterns) |

---

## User Code Review Response

This section explicitly addresses each item from the user's code review (continuation context):

| # | User Feedback | How This Report Addresses It |
|---|--------------|------------------------------|
| 1 | Re-derive enum values and line-number references | Section 1 "Discrepancy Corrections" -- verified against current staging: 17 TicketStatus values (including NEEDS_CREDENTIALS and IMPOSSIBLE_SPEC), createTicketForOrganization at line 646, resolveDependentTickets at line 1724, completion hooks at 1544 and 2636 |
| 2 | Add Zod schemas for Assessor/Decider outputs | Appendix D -- full Zod v4 schemas (AssessorOutputSchema and DeciderOutputSchema) with defensive parser pattern |
| 3 | Spec the retry/timeout/concurrency story | Section 11.1 (concrete retry strategy table), Section 11.2 (parsing pipeline), Section 11.5 (atomic concurrency guard) |
| 4 | Spec the approval-mode workflow with approve/reject endpoints | Architecture Decision 6, Section 3 (approveProposal, rejectProposal functions), Section 5 (POST approve/reject endpoints), Appendix A (PENDING_APPROVAL transitions) |
| 5 | Add calibration evals to Phase 2's DoD | Section 9.2 -- Phase 3a DoD explicitly requires calibration eval fixtures (3-5 scenarios) |
| 6 | Decide first-child cold-start strategy | Architecture Decision 3 -- setup ticket (RESEARCH mode) as first child provides rich codebase context via scout/diagnosis/product. Cold start solved. |
| 7 | Re-estimate Phase 2 to 3-4 tickets | Section 9.1 -- Phase 2 split into service plumbing (1 ticket) and PM agent implementation (2 tickets in Phase 3a). Total 8-10 tickets across 6 phases. |

---

## Methodology & Data Sources

| Source | Purpose | Key Takeaway |
|--------|---------|--------------|
| RSH-488 Research Report (ticket.md) | Primary feature specification | 7-question evaluation protocol, per-ticket triggers, autonomous execution, lifecycle, entity model options |
| RSH-488 Continuation Context (ticket.md) | User design directives + code review | (1) Separate entity + UI decided. (2) Dual-phase PM agent decided. (3) 7 concrete gaps identified and addressed. |
| product/product.md (library) | Resolved product requirements | 14 essential MVP features, 13 user scenarios, separate Goal entity confirmed, dual-aspect PM agent confirmed |
| tech-research/tech-research.md (server) | Server architecture decisions | 9 decisions: separate Goal table, dual-phase PM agent, setup ticket pattern, atomic concurrency, Zod + retry, PENDING_APPROVAL workflow, GoalStatus 9-value enum, query() invocation, JSON columns |
| tech-research/tech-research.md (client) | Client architecture decisions | Separate Goal routes/components, GoalStatus type (9 values), goal-namespaced OKLCH tokens, 9+ new components, TanStack Query hooks, no ticket UI changes |
| diagnosis/diagnosis-statement.md (server) | Production evidence | 17 TicketStatus values verified, SIDE_QUEST_PENDING absent, no Goal infrastructure exists, completion hooks confirmed |
| diagnosis/diagnosis-statement.md (client) | Client evidence | const-as-const type patterns, OKLCH token patterns, 5 modes / 17 statuses |
| diagnosis/diagnosis-statement.md (CLI) | CLI evidence | 5 modes in VALID_MODES, no Goal references |
| scout/scout-summary.md (server) | Extension points | resolveDependentTickets at line 1724, query() in 8 services, createTicketForOrganization at line 646, RESEARCH_EXCLUDED_STEPS at line 1568 |
| scout/scout-summary.md (client) | Client patterns | RESEARCH mode precedent, type definition patterns, OKLCH tokens at index.css lines 116-132 |
| scout/scout-summary.md (CLI) | CLI patterns | VALID_MODES at line 13, doc string locations |
| scout/reference-map.json (server) | Production-verified facts | 5 modes, 17 statuses, 57 existing migrations, no Goal tables/columns |
| prisma/schema.prisma (direct read) | Ground-truth schema | TicketStatus 17 values (lines 24-42), TicketMode 5 values (lines 114-120) |
| orchestrator.ts (direct read) | Completion hooks | resolveDependentTickets at 1544/2636; RESEARCH_EXCLUDED_STEPS at 1568 |
| walkthrough-service.ts (pattern reference) | LLM invocation + parsing patterns | query() at line 197, parseCodeTourJson at line 228: fence strip, typeof guards |
| RSH-411 report (library) | Prior research | GOAL concept, Playbook data model -- confirmed Playbook-independent for MVP |
| RSH-193 report | Prior parent-child exploration | SideQuest concepts (not implemented) -- informed but not constraining |
| Prior RSH-534 report | Structural reference | Section structure useful; content replaced due to corrected architecture decisions |

---

---

## 13. Implementation Tickets

Seven tickets have been created and chained sequentially using `hlx tickets create --after` to implement the Goals feature end-to-end. Each ticket flows through Helix's 10-agent pipeline (scout, diagnosis, product, tech-research, implementation-plan, implementation, code-review, verification, preview-config, deployment), so descriptions focus on the important architectural decisions and constraints -- the agents will flesh out the rest.

### Ticket Chain

```
BLD-68 (QUEUED) --> BLD-69 (WAITING) --> BLD-70 (WAITING) --> BLD-71 (WAITING) --> BLD-72 (WAITING) --> BLD-73 (WAITING) --> BLD-74 (WAITING)
  T1 Schema          T2 Service          T3 PM Agent          T4 API/Orch         T5 Client Found.    T6 UI Pages          T7 CLI
```

| Ticket | Short ID | Title | Phase | Repo | Status |
|--------|----------|-------|-------|------|--------|
| **T1** | BLD-68 | [T1 Goal: Schema & Migration] Add Goal and GoalEvaluation tables | Phase 1 | helix-global-server | QUEUED |
| **T2** | BLD-69 | [T2 Goal: Service Layer] Goal service with CRUD and lifecycle functions | Phase 2 | helix-global-server | WAITING (after BLD-68) |
| **T3** | BLD-70 | [T3 Goal: PM Agent] Dual-phase Assessor + Decider with Zod validation and retry | Phase 3a | helix-global-server | WAITING (after BLD-69) |
| **T4** | BLD-71 | [T4 Goal: API & Orchestrator] Goal controller endpoints and completion hook triggers | Phase 3b | helix-global-server | WAITING (after BLD-70) |
| **T5** | BLD-72 | [T5 Goal: Client Foundation] Goal types, API hooks, status badges, and OKLCH tokens | Phase 4 | helix-global-client | WAITING (after BLD-71) |
| **T6** | BLD-73 | [T6 Goal: UI Pages] GoalList, GoalDetail, CreateGoal pages with all child components | Phase 5 | helix-global-client | WAITING (after BLD-72) |
| **T7** | BLD-74 | [T7 Goal: CLI] hlx goals create/list/get/terminate command namespace | Phase 6 | helix-cli | WAITING (after BLD-73) |

### T1: Schema & Migration (BLD-68)

**Goal**: Add the database foundation for Goals.

**Deliverables**:
- GoalStatus enum (9 values: DRAFT, QUEUED, RUNNING, ACTIVE, EVALUATING, PENDING_APPROVAL, PAUSED, COMPLETED, FAILED)
- Goal model with all fields (id, organizationId, reporterUserId, title, description, status, maxChildren, roadmap, previews, requireApproval, repositoryIds, sprintId, timestamps)
- GoalEvaluation model for audit trail (goalId, triggerTicketId, assessmentArtifact, deciderOutput, verdict, proposedTicketId)
- Two new nullable columns on Ticket: goalId (FK to Goal), childType (String)
- Organization.goals relation, User.reportedGoals relation
- Prisma migration file committed (`npx prisma migrate dev --name add_goals_pm_agent`)

**Key constraints**: TicketMode stays at 5 values. TicketStatus stays at 17 values. Only goalId and childType added to Ticket.

**Report reference**: Section 2 (Schema & Migration Design)

### T2: Service Layer Foundation (BLD-69)

**Goal**: Build the core Goal business logic service.

**Deliverables**: New `src/services/goal-service.ts` with 9+ functions:
- `createGoal()` -- Create Goal + auto-spawn RESEARCH setup ticket (solves cold-start problem)
- `spawnGoalChild()` -- Create child ticket from PM agent proposal using `createTicketForOrganization()`
- `resolveGoalParent()` -- Completion trigger with atomic `updateMany WHERE status='ACTIVE'` for race prevention
- `validateGoalLimits()` -- Check child count against maxChildren
- `terminateGoal()` -- Operator-initiated termination
- `approveProposal()` / `rejectProposal()` -- Approval workflow
- `listGoalsForOrganization()` / `getGoalDetail()` -- CRUD reads
- `evaluateGoal()` -- Stub for T3 to implement

**Key patterns**: sprint-service.ts for CRUD, resolveDependentTickets for completion trigger, createTicketForOrganization for child spawning

**Report reference**: Section 3 (Server Service Layer)

### T3: PM Agent Core (BLD-70)

**Goal**: Implement the dual-phase PM agent -- the intelligence at the heart of Goals.

**This is the most critical ticket.** The PM agent evaluates goal progress after each child ticket completes and decides what to do next.

**Deliverables**:
- `runAssessor()` -- Phase 1: query() call producing 7-question evaluation artifact with evidence
- `runDecider()` -- Phase 2: query() call reading assessment artifact and producing verdict + proposal + previews + roadmap
- `parseAssessorOutput()` / `parseDeciderOutput()` -- Defensive parsers: fence strip + JSON.parse + Zod safeParse
- `evaluateGoal()` -- Full orchestration: gather context, Assessor, validate, Decider, validate, store GoalEvaluation, process verdict
- `gatherEvaluationContext()` -- Context assembly with window management
- Zod schemas in `src/services/goal-schemas.ts` (AssessorOutputSchema, DeciderOutputSchema)
- Retry-with-correction: 90s timeout, max 2 retries, exponential backoff, Zod errors in correction prompt
- **3-5 calibration test fixtures** (first eval, mid-progress, near-completion, over-conservative, child failure)

**Key constraint**: Two separate query() calls, not one. Assessment decoupled from decision.

**Report reference**: Sections 4 (PM Agent), 11 (Reliability), Appendix D (Zod Schemas)

### T4: API & Orchestrator Integration (BLD-71)

**Goal**: Expose Goals via REST API and wire up the completion triggers.

**Deliverables**:
- New `src/controllers/goal-controller.ts` with 11 endpoints (see Section 5.2)
- Route registration in api.ts
- `resolveGoalParent()` call added at orchestrator.ts lines 1544 and 2636 (2 hook sites, ~4 lines total)
- Zod validation for all request bodies (CreateGoalSchema, UpdateGoalSchema, TerminateGoalSchema, ApproveProposalSchema, RejectProposalSchema)

**Key constraint**: Total orchestrator.ts change is ~4 lines at 2 sites. Goal evaluation is fire-and-forget from the hook.

**Report reference**: Sections 5 (API Endpoints), 6 (Orchestrator Integration)

### T5: Client Foundation (BLD-72)

**Goal**: Build the type system, API hooks, and styling foundation for the Goal UI.

**Deliverables**:
- GoalStatuses const object + GoalStatus type (9 values, const-as-const pattern)
- Goal interface types: GoalDetail, GoalListItem, GoalEvaluation, GoalRoadmap, GoalPreview, GoalChildTicket, TicketProposal, AssessorOutput, DeciderOutput
- TanStack Query hooks in `src/api/goals.ts`: queryOptions factories + useMutation hooks
- OKLCH status tokens in index.css (goal-namespaced, all 3 theme palettes)
- Child type chip colors (BREADTH blue, DEPTH purple, POLISH amber, VERIFY green)
- GoalStatusBadge component
- Goal display labels in format.ts

**Key constraint**: NO modifications to existing ticket types, UI, or status badges. erasableSyntaxOnly means const objects, not enum keyword.

**Report reference**: Section 7.5-7.6 (Types, Styling)

### T6: Goal UI Pages & Components (BLD-73)

**Goal**: Build the complete Goal user experience -- entirely separate from Ticket UI.

**Deliverables**:
- 3 routes in App.tsx (lazy-loaded): /goals, /goals/new, /goals/:goalId
- GoalListPage -- Goal list with status badges, child count, latest verdict
- CreateGoalPage -- Goal creation form with title, description, repos, max children
- GoalDetailPage -- Full detail: objective, child tree, evaluation display, previews, roadmap, controls
- GoalChildTree -- Ordered child tickets with status badges and childType chips
- GoalEvaluationDisplay -- 7-question answers with evidence (expandable accordion)
- GoalPreviewPanel -- 2-3 forecast tickets with facet labels
- GoalRoadmapView -- Completed summary, current assessment, projected remaining
- GoalEvaluationHistory -- Chronological evaluation audit trail
- GoalApprovalBanner -- Proposal review with approve/reject
- Goals NavItem in sidebar (app-shell.tsx)

**Key constraint**: NO changes to ticket-detail.tsx or any existing ticket components. All Goal pages lazy-loaded. No barrel files.

**Report reference**: Section 7 (Client Architecture)

### T7: CLI Goals Namespace (BLD-74)

**Goal**: Add `hlx goals` commands to the CLI.

**Deliverables**:
- New `src/goals/` directory with 4 command files
- `hlx goals create` -- Create Goal with title, description, repos, max-children, require-approval
- `hlx goals list` -- List Goals with status filter
- `hlx goals get` -- Get Goal detail with roadmap and previews
- `hlx goals terminate` -- Terminate Goal as complete or failed
- Command registration in src/index.ts
- Documentation in src/docs/cli-content.ts

**Key constraint**: VALID_MODES in src/tickets/create.ts is NOT modified. Goals are created via `hlx goals create`, not `hlx tickets create --mode GOAL`.

**Report reference**: Section 8 (CLI Support)

### Ticket Dependency Rationale

The linear chain (T1 → T2 → T3 → T4 → T5 → T6 → T7) is conservative but safe:

- **T1 → T2**: Service layer requires schema models to exist
- **T2 → T3**: PM agent functions build on service layer stubs
- **T3 → T4**: API endpoints call service functions including PM agent evaluation
- **T4 → T5**: Client types must match server API response schemas
- **T5 → T6**: UI pages depend on types, hooks, and styling
- **T6 → T7**: CLI is the last interface; all core functionality must be stable

**Parallelization opportunity**: In practice, T3 (PM agent) and T4 (API/orchestrator) could run in parallel since they depend on T2 but not each other. Similarly, T5/T6 (client) and T7 (CLI) could run in parallel since they depend on T4 but not each other. The linear chain was chosen because Helix's `/after` mechanism supports sequential ordering only, and the agents will handle each ticket's dependencies correctly given the descriptions.

### Environment Note

These tickets were created in the staging environment (PX Cracked org, `helix-global-server-staging` instance) with `BLD-` prefix. The `helix-global-client` and `helix-cli` repos are not registered in this staging org, so T5/T6/T7 were assigned to `helix-global-server` as the closest available repo. **When re-creating in the production environment**, T5 and T6 should target `helix-global-client` and T7 should target `helix-cli`.

---

---

## 14. Production Ticket Creation

### Ticket Creation Attempt -- Blocked

Ticket creation in production was attempted but **blocked by authentication failure**. Below is the full investigation and the exact CLI commands to execute once authentication is resolved.

### Root Cause of Blocker

The CLI was configured with the provided dev setup credentials and tested against the staging server:

```
HELIX_API_KEY=hxi_8cc66fe2b3d60052120e1f84069fb5653851dd534682f83073dada304a4437ef
HELIX_URL=https://helix-global-server-staging-3tl6o.ondigitalocean.app
```

**Failure evidence:**

| Test | Command | Result |
|------|---------|--------|
| Health check (no auth) | `curl https://helix-global-server-staging.../` | `{"message":"API is live 🚀"}` -- server is reachable |
| CLI inspect repos | `hlx inspect repos` | `HTTP 401 Unauthorized` |
| Direct API (X-API-Key header) | `curl -H "X-API-Key: hxi_..." .../api/inspect/repositories` | `HTTP 401 Unauthorized` |
| Direct API (Bearer header) | `curl -H "Authorization: Bearer hxi_..." .../api/tickets?limit=1` | `HTTP 401 Unauthorized` |

The staging server is reachable but the `hxi_` API key is expired or revoked. The CLI code (`src/lib/http.ts:53-54`) correctly sends `X-API-Key` for `hxi_` prefixed keys, so the header format is correct -- the key itself is the issue.

**Production server check:**

The runtime inspection token (JWT from `/tmp/helix-inspect/env.sh`) authenticates against the production server (`https://helix-global-server-n8k8s.ondigitalocean.app`) but has `"scope":"read"` and `"aud":"helix-inspect"` -- it only works for `/api/inspect/` endpoints and cannot create tickets.

| Test | Command | Result |
|------|---------|--------|
| Inspect repos (production) | `hlx inspect repos` (with inspect token) | `helix-global-server  cmmp6hf16000pjc0q6hkumgqa  [DATABASE, LOGS]` -- works |
| Ticket list (production) | `hlx tickets list --limit 1` (with inspect token) | `HTTP 401 Unauthorized` -- inspect scope is read-only |

**Additional constraint:** The production org only has `helix-global-server` registered. `helix-global-client` and `helix-cli` are not registered as repositories in the production environment's inspect manifest.

### Resolution Path

To create these tickets, the operator needs to:

1. **Generate a valid production API key** from the Helix UI (Settings > API Keys) for the production organization
2. **Register all 3 repos** in the production org if they aren't already registered (`helix-global-server`, `helix-global-client`, `helix-cli`)
3. **Run the commands below** using `hlx token add --token <new-key> --url https://helix-global-server-n8k8s.ondigitalocean.app`

### Exact CLI Commands

Once authenticated, run these 7 commands in sequence. Each subsequent ticket uses `--after` to chain to the previous one.

**T1: Schema & Migration**
```bash
hlx tickets create \
  --title "[T1 Goal: Schema & Migration] Add Goal and GoalEvaluation tables with GoalStatus enum" \
  --description "Add the database foundation for the Goals feature. This is a separate Goal entity -- NOT a TicketMode addition.

DELIVERABLES:
- GoalStatus enum (9 values: DRAFT, QUEUED, RUNNING, ACTIVE, EVALUATING, PENDING_APPROVAL, PAUSED, COMPLETED, FAILED) -- separate from TicketStatus which stays at 17 values
- Goal model: id, organizationId, reporterUserId, title, description (Text), status (GoalStatus default DRAFT), maxChildren (Int default 20), roadmap (Json?), previews (Json?), requireApproval (Boolean default false), repositoryIds (String[]), sprintId (String?), timestamps
- GoalEvaluation model: id, goalId, triggerTicketId (String?), assessmentArtifact (Json), deciderOutput (Json), verdict (String), proposedTicketId (String?), createdAt
- Two nullable columns on Ticket: goalId (FK to Goal, onDelete SetNull), childType (String?)
- Organization.goals relation, User.reportedGoals relation
- Indexes: Goal(organizationId, updatedAt), Goal(organizationId, status), GoalEvaluation(goalId, createdAt), Ticket(goalId)
- Prisma migration file committed (npx prisma migrate dev --name add_goals_pm_agent)

KEY CONSTRAINTS:
- TicketMode stays at 5 values (AUTO, BUILD, FIX, RESEARCH, EXECUTE) -- UNCHANGED
- TicketStatus stays at 17 values -- UNCHANGED
- Only goalId and childType added to Ticket table
- File-based migration strategy: migration files MUST be committed

REFERENCE: RSH-534 Implementation Plan, Section 2 (Schema & Migration Design)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD
```

**T2: Service Layer Foundation**
```bash
hlx tickets create \
  --title "[T2 Goal: Service Layer] Goal service with CRUD and lifecycle management" \
  --description "Build the core Goal business logic in a new src/services/goal-service.ts file. Follows sprint-service.ts pattern for non-ticket entity CRUD.

DELIVERABLES (10 functions):
1. createGoal() -- Create Goal + auto-spawn RESEARCH setup ticket via createTicketForOrganization() (ticket-service.ts:646). Setup ticket solves cold-start: runs scout/diagnosis/product to produce context artifacts for the PM agent's first evaluation. Title: 'Goal Setup: {goal.title}', childType: null
2. resolveGoalParent(childTicketId) -- Completion trigger. Query ticket's goalId; if present, atomic transition: prisma.goal.updateMany({ where: { id, status: 'ACTIVE' }, data: { status: 'EVALUATING' } }) checking count > 0 for race prevention. Fire-and-forget evaluateGoal() async. catch-and-log error handling (must never throw)
3. evaluateGoal(goalId) -- STUB for T3. Orchestrates dual-phase PM agent. For now, logs 'PM agent evaluation not yet implemented' and transitions Goal back to ACTIVE
4. spawnGoalChild(goalId, proposal) -- Create child ticket from PM agent proposal. Calls createTicketForOrganization() with goalId, childType, repos from Goal
5. validateGoalLimits(goalId) -- Count children, compare to maxChildren (default 20). If exceeded, transition to PAUSED
6. terminateGoal(goalId, outcome) -- Operator-initiated termination to COMPLETED or FAILED
7. approveProposal(goalId) -- Read pendingProposal from latest GoalEvaluation, spawn child, Goal -> ACTIVE
8. rejectProposal(goalId, feedback) -- Clear pending state, store feedback, Goal -> EVALUATING, re-trigger evaluation
9. listGoalsForOrganization(orgId, statusFilter?) -- Prisma findMany with includes, ordered by updatedAt desc
10. getGoalDetail(goalId) -- Goal + children (ordered) + latest evaluation + current roadmap + previews

KEY PATTERNS TO FOLLOW:
- sprint-service.ts for CRUD (195 lines, Prisma transactions, HttpError)
- resolveDependentTickets (ticket-service.ts:1724) for completion trigger pattern
- createTicketForOrganization (ticket-service.ts:646) for child ticket spawning

REFERENCE: RSH-534 Implementation Plan, Section 3 (Server Service Layer)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD \
  --after T1_SHORT_ID
```

**T3: PM Agent Core (Dual-Phase Assessor + Decider)**
```bash
hlx tickets create \
  --title "[T3 Goal: PM Agent] Dual-phase Assessor + Decider with Zod validation and retry" \
  --description "Implement the dual-phase PM agent -- the intelligence at the heart of Goals. This is the MOST CRITICAL ticket.

The PM agent follows the artifact-then-decision pattern: Phase 1 (Assessor) produces an objective evaluation, Phase 2 (Decider) reads it and decides. Two SEPARATE query() calls, NOT one combined call.

DELIVERABLES:
1. runAssessor(context) -- Phase 1 query() call. Produces structured 7-question evaluation artifact with evidence citations:
   - q1_matching (yes/no/partial + evidence): Does what was built align with the objective?
   - q2_more_to_do (yes/no/partial + evidence): Are there success criteria not yet addressed?
   - q3_polish (yes/no/partial/not_yet + evidence): Quality gaps?
   - q4_all_boxes (all/partial/none + evidence): Every explicit criterion accounted for?
   - q5_add (yes/no + evidence): Missing breadth?
   - q6_fix (yes/no + evidence): Defects in existing work?
   - q7_verify (yes/no/not_yet + evidence): Untested assumptions?

2. runDecider(goal, assessmentArtifact) -- Phase 2 query() call. Reads ONLY the assessment artifact + goal context. Produces:
   - verdict: 'complete' or 'next_ticket'
   - proposal: { title, description, mode, facet, childType (BREADTH/DEPTH/POLISH/VERIFY), rationale }
   - previews: 2-3 non-binding forecast tickets
   - roadmap_update: { completed_summary, current_assessment, projected_remaining }

3. Zod schemas in src/services/goal-schemas.ts (AssessorOutputSchema, DeciderOutputSchema) -- see RSH-534 Appendix D for full schemas

4. Defensive parsers (parseAssessorOutput, parseDeciderOutput): fence strip -> JSON.parse -> Zod safeParse

5. Retry-with-correction: on Zod validation failure, re-invoke query() with error messages as correction context

6. evaluateGoal(goalId) -- Full implementation replacing T2 stub: gather context, Assessor, validate, Decider, validate, store GoalEvaluation, process verdict

7. gatherEvaluationContext(goalId) -- Context assembly with window management:
   - Goal criteria: always in full (~200 tokens)
   - Latest child: full detail (~2K tokens)
   - Older children: summarized to title + status + one-line outcome (~100 each)
   - Living roadmap: full current version (~500 tokens)

RETRY/TIMEOUT STRATEGY:
- Per-call timeout: 90s (AbortController)
- Max retries per phase: 2 (3 total attempts per phase)
- Backoff: exponential 2s, 8s
- Terminal failures (do NOT retry): 401/403 auth, context-too-large, 3+ consecutive content-filter
- Transient failures (retry): malformed JSON, single timeout, 5xx, single content-filter
- Assessor all-retries-exhausted: Goal stays EVALUATING, error logged, idle timeout triggers PAUSED
- Decider all-retries-exhausted: Assessor artifact preserved in GoalEvaluation, next trigger retries Decider only

CALIBRATION GUIDELINES:
- Over-conservative mitigation: require concrete specific improvements before proposing polish. Diminishing returns heuristic.
- Over-permissive mitigation: explicit criterion mapping before declaring complete. No skipping protocol.
- Priority: fix broken (Q6) > unmet criteria (Q2,Q5) > verify (Q7) > polish (Q3)

MODEL: claude-sonnet-4-6 via query() from @anthropic-ai/claude-agent-sdk

REFERENCE: RSH-534 Implementation Plan, Sections 4 (PM Agent), 11 (Reliability), Appendix D (Zod Schemas)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD \
  --after T2_SHORT_ID
```

**T4: API & Orchestrator Integration**
```bash
hlx tickets create \
  --title "[T4 Goal: API & Orchestrator] Goal REST endpoints and completion hook triggers" \
  --description "Expose Goals via REST API and wire up the per-ticket evaluation trigger at orchestrator completion hooks.

DELIVERABLES:

1. New src/controllers/goal-controller.ts (11 endpoints, Zod validation):
   - POST /api/goals -- Create Goal (Zod: { title: string.min(1), description: string.min(1), maxChildren?: int.min(1).max(50), requireApproval?: boolean, repositoryIds?: string[] })
   - GET /api/goals -- List Goals (Query: status filter, limit, offset)
   - GET /api/goals/:id -- Goal detail (includes children, latest evaluation, roadmap, previews)
   - PATCH /api/goals/:id -- Update Goal (maxChildren, requireApproval, description)
   - POST /api/goals/:id/terminate -- Terminate (Zod: { outcome: 'completed' | 'failed' })
   - GET /api/goals/:id/evaluations -- Evaluation history (paginated)
   - GET /api/goals/:id/roadmap -- Current roadmap
   - GET /api/goals/:id/previews -- Preview forecasts
   - POST /api/goals/:id/proposals/approve -- Approve pending proposal (Zod: { modifications?: Record })
   - POST /api/goals/:id/proposals/reject -- Reject proposal (Zod: { feedback?: string })

2. Route registration in api.ts (after Sprint routes ~line 419)

3. resolveGoalParent() call at BOTH orchestrator completion hooks (~4 lines total at 2 sites):
   - After orchestrator.ts:1544 (clean merge early exit)
   - After orchestrator.ts:2636 (standard success path)
   Pattern: try { await resolveGoalParent(run.ticketId); } catch (err) { logRun(run.id, 'resolveGoalParent failed: ...'); }

KEY CONSTRAINTS:
- Total orchestrator.ts change is ~4 lines at 2 sites. Fire-and-forget pattern.
- Goal controller follows ticket-controller.ts pattern (Zod schemas, req.organizationId from auth middleware)
- No modifications to existing ticket endpoints

REFERENCE: RSH-534 Implementation Plan, Sections 5 (API Endpoints), 6 (Orchestrator Integration)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD \
  --after T3_SHORT_ID
```

**T5: Client Foundation**
```bash
hlx tickets create \
  --title "[T5 Goal: Client Foundation] Goal types, API hooks, status tokens, and badge components" \
  --description "Build the type system, API hooks, and styling foundation for the Goal UI. This is entirely greenfield -- NO modifications to existing ticket UI.

DELIVERABLES:

1. GoalStatus type (src/types/goal.ts or src/types/api.ts):
   - const-as-const pattern (NOT TypeScript enum -- erasableSyntaxOnly forbids enum keyword)
   - 9 values: DRAFT, QUEUED, RUNNING, ACTIVE, EVALUATING, PENDING_APPROVAL, PAUSED, COMPLETED, FAILED
   - Pattern: same as TicketStatus at api.ts lines 5-23

2. Goal interface types:
   - GoalDetail, GoalListItem, GoalEvaluation, GoalRoadmap, GoalPreview, GoalChildTicket, TicketProposal, AssessorOutput, DeciderOutput

3. TanStack Query hooks (src/api/goals.ts) following Sprint pattern (src/api/sprints.ts):
   - queryOptions factories: goalsQueryOptions, goalQueryOptions, goalEvaluationsQueryOptions, goalRoadmapQueryOptions, goalPreviewsQueryOptions
   - useMutation hooks: useCreateGoal, useTerminateGoal, useApproveProposal, useRejectProposal, useUpdateGoal
   - Query keys: ['goals', ...params]
   - Invalidation: invalidateQueries({ queryKey: ['goals'] }) on mutation success

4. OKLCH status tokens (index.css) -- goal-namespaced, all 3 theme palettes:
   - --color-goal-active: oklch(0.65 0.17 145) (green)
   - --color-goal-evaluating: oklch(0.68 0.17 280) (purple -- 'PM agent thinking')
   - --color-goal-pending-approval: oklch(0.72 0.16 75) (amber)
   - --color-goal-paused: oklch(0.70 0.015 260) (neutral)
   - --color-goal-completed: oklch(0.65 0.15 185) (teal)
   - Child type chips: BREADTH (blue), DEPTH (purple), POLISH (amber), VERIFY (green)

5. GoalStatusBadge component (src/components/goals/goal-status-badge.tsx)
6. Goal display labels in format.ts (goalStatusDisplayLabels map)

KEY CONSTRAINTS:
- NO modifications to ticket types, UI components, or status badges
- NO TypeScript enum keyword (use const-as-const)
- NO barrel files for Goal components (direct imports only per Vercel best practices)

REFERENCE: RSH-534 Implementation Plan, Section 7 (Client Architecture)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD \
  --after T4_SHORT_ID
```

**T6: Goal UI Pages & Components**
```bash
hlx tickets create \
  --title "[T6 Goal: UI Pages] GoalList, GoalDetail, CreateGoal with all child components" \
  --description "Build the complete Goal user experience -- entirely separate from the Ticket UI. The Goal UI is a totally different UI with a totally different need.

DELIVERABLES:

1. Three lazy-loaded routes in App.tsx (under ProtectedRoute > AppShell):
   - /goals -> GoalsListPage
   - /goals/new -> CreateGoalPage
   - /goals/:goalId -> GoalDetailPage

2. GoalsListPage (src/routes/goals-list.tsx):
   - Goal list with GoalStatusBadge, child count, latest verdict
   - Status filter, search
   - Link to create new Goal

3. CreateGoalPage (src/routes/create-goal.tsx):
   - Form: title, description (rich text with success criteria), repo selection, max children, require approval toggle
   - Uses useCreateGoal mutation

4. GoalDetailPage (src/routes/goal-detail.tsx) with child components:
   - GoalHeader: title, status badge, terminate/settings actions
   - GoalChildTree: ordered child tickets with status badges and childType chips (BREADTH/DEPTH/POLISH/VERIFY/SETUP)
   - GoalEvaluationDisplay: latest 7-question assessment with evidence (expandable accordion), verdict badge, rationale
   - GoalEvaluationHistory: chronological list of all evaluations
   - GoalPreviewPanel: 2-3 forecast tickets with facet and childType labels
   - GoalRoadmapView: completed summary, current assessment, projected remaining
   - GoalApprovalBanner: proposal review with approve/reject (visible in PENDING_APPROVAL state only)

5. Goals NavItem in sidebar (app-shell.tsx) -- between Home and Pipeline items

KEY CONSTRAINTS:
- NO changes to ticket-detail.tsx (2,921 lines) or any existing ticket components
- NO changes to existing ticket routes, dashboard, or board views
- All Goal pages lazy-loaded (bundle-dynamic-imports per Vercel best practices)
- No barrel files for Goal components (direct imports only)
- Components use cn() utility for Tailwind classes -- no CVA (not in codebase)
- Separate Suspense boundaries for independent data fetches

REFERENCE: RSH-534 Implementation Plan, Section 7 (Client Architecture)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD \
  --after T5_SHORT_ID
```

**T7: CLI Goals Namespace**
```bash
hlx tickets create \
  --title "[T7 Goal: CLI] hlx goals create/list/get/terminate command namespace" \
  --description "Add hlx goals command family to the CLI. Goals are separate entities with their own API -- NOT a ticket mode.

DELIVERABLES:

1. New src/goals/ directory (mirrors src/tickets/ pattern):
   - index.ts -- Router/dispatcher for goals subcommands
   - create.ts -- hlx goals create --title '...' --description '...' --repos name1,name2 [--max-children N] [--require-approval]
   - list.ts -- hlx goals list [--status ACTIVE|EVALUATING|...]
   - get.ts -- hlx goals get <goalId> (shows detail with roadmap and previews)
   - terminate.ts -- hlx goals terminate <goalId> [--outcome completed|failed]

2. Command registration in src/index.ts (new 'goals' case in switch)

3. Documentation in src/docs/cli-content.ts

4. Output format: structured text matching existing ticket list/detail conventions. Goal detail includes: goal ID, title, status, child count, latest evaluation verdict, roadmap summary.

KEY CONSTRAINTS:
- VALID_MODES in src/tickets/create.ts is NOT modified (stays at 5 values)
- hlx tickets create --mode GOAL should NOT work
- Goals created via hlx goals create, NOT hlx tickets create
- API calls go to /api/goals endpoints, not /api/tickets

REFERENCE: RSH-534 Implementation Plan, Section 8 (CLI Support)" \
  --repos helix-global-server,helix-global-client,helix-cli \
  --mode BUILD \
  --after T6_SHORT_ID
```

### Why Ticket Creation Is Blocked (Detailed)

Three independent issues prevent programmatic ticket creation in this environment:

**1. CLI API Key is Expired/Revoked**

The provided CLI API key (`hxi_8cc66fe2b3d60052120e1f84069fb5653851dd534682f83073dada304a4437ef`) returns `HTTP 401 Unauthorized` against the staging server (`helix-global-server-staging-3tl6o.ondigitalocean.app`). The server is reachable (root endpoint returns `{"message":"API is live 🚀"}`), so this is an authentication failure, not a connectivity issue. The `hxi_` prefix is correctly handled by the CLI's HTTP library (sent as `X-API-Key` header per `src/lib/http.ts:53-54`), meaning the key itself is the problem -- likely expired or revoked since it was last used.

**2. Inspect Token is Read-Only**

The runtime inspection token available at `/tmp/helix-inspect/env.sh` successfully authenticates against the production server (`helix-global-server-n8k8s.ondigitalocean.app`) for `/api/inspect/` endpoints. However, its JWT payload reveals `"scope":"read"` and `"aud":"helix-inspect"` -- it is explicitly scoped to read-only inspection operations. It returns `HTTP 401 Unauthorized` when used for `/api/tickets` or other non-inspect endpoints.

**3. Repository Registration Limitation**

The production org's inspect manifest (`/tmp/helix-inspect/manifest.json`) shows only `helix-global-server` (ID: `cmmp6hf16000pjc0q6hkumgqa`) as a registered repository. The user requested all 3 repos (`helix-global-server`, `helix-global-client`, `helix-cli`) for each ticket. `helix-global-client` and `helix-cli` may not be registered in the production org, which would cause `--repos helix-global-server,helix-global-client,helix-cli` to fail with a repo resolution error.

**Prior run context**: The prior run (which produced BLD-68 through BLD-74) successfully created tickets in the staging environment, but noted the same limitation: *"The helix-global-client and helix-cli repos are not registered in this staging org, so T5/T6/T7 were assigned to helix-global-server as the closest available repo."*

### To Execute This Ticket Chain

1. Obtain a valid production API key with ticket creation permissions
2. Ensure all 3 repos are registered in the org
3. Configure CLI: `hlx token add --token <key> --url <production-url>`
4. Run the 7 commands above in order, replacing `T1_SHORT_ID` through `T6_SHORT_ID` with the actual short IDs returned by each `create` command
5. Each `--after` flag chains the ticket to wait for the previous one

---

*Report produced for Helix ticket RSH-534 "Goals: The PM Agent x Ralph Loop | Implementation Plan"*
*Date: May 22, 2026*
*Revision: Final -- separate Goal entity + dual-phase PM agent + setup ticket + reliability story (user code review addressed) + implementation tickets added + production ticket creation section*

## Attachments
- (none)

## Discussion
- **Darshan** (2026-05-23T00:58:00.471Z): @Usher  🤣
- **Helix** (2026-05-24T05:00:33.505Z) [Agent]: I'm working on this, I'll get back to you when ready.
- **Helix** (2026-05-24T06:25:10.736Z) [Agent]: Your changes are ready! Updated 3 repositories.

![Verification Screenshot](/tickets/cmphmxr9h00gghu0u3bgqtatg/proof/0/image?runId=cmpjbhhgb004xjr0tlw4zzobr)

![Verification Screenshot](/tickets/cmphmxr9h00gghu0u3bgqtatg/proof/1/image?runId=cmpjbhhgb004xjr0tlw4zzobr)

![Verification Screenshot](/tickets/cmphmxr9h00gghu0u3bgqtatg/proof/2/image?runId=cmpjbhhgb004xjr0tlw4zzobr)

![Verification Screenshot](/tickets/cmphmxr9h00gghu0u3bgqtatg/proof/3/image?runId=cmpjbhhgb004xjr0tlw4zzobr)

![Verification Screenshot](/tickets/cmphmxr9h00gghu0u3bgqtatg/proof/4/image?runId=cmpjbhhgb004xjr0tlw4zzobr)
- **Helix** (2026-05-24T15:32:27.188Z) [Agent]: Your changes are ready! Updated 3 repositories.

## Continuation Context
Restore Goal/GoalEvaluation schema chunks dropped by bad staging-merge resolution.

ROOT CAUSE
The staging-into-feature-branch auto-merge in src/helix-workflow/git-ops.ts treats prisma/schema.prisma as an auto-resolvable generated file (AUTO_RESOLVE_PATTERNS at line 601-608 in git-ops.ts, matched by the /\.prisma$/ regex on line 605). When the merge conflicts on schema.prisma, the bot runs `git checkout --theirs schema.prisma` (line 650) — silently taking staging's side and discarding the feature branch's schema additions. Bot merge 7f835854e ("Merge origin/staging into BLD-590-goals-polish-final", 2026-05-24 15:24 UTC) wiped GoalStatus, Goal, GoalEvaluation, Ticket.goalId and Ticket.childType from schema.prisma while leaving src/services/goal-service.ts intact. Result: 42 tsc errors — goal-service.ts (35), ticket-service.ts (3), transcript-service.ts (2), ticket-controller.ts (2). Failed prod DigitalOcean deploy: 4d52eaec-c712-46c5-a8fe-24cb96124654 on commit 68da3f7 (PR #623 staging→main).

FIX — additive only
Do NOT revert main. HostAgentSession, DemoFeedback, agentTier, and related back-relations landed on main AFTER BLD-590 branched and must be preserved. Reference shape for the Goal-related additions: BLD-590's tip BEFORE the bad merge, commit 663cce007 in prisma/schema.prisma. Apply those Goal pieces additively onto current main.

In prisma/schema.prisma on main, add:

1. enum GoalStatus { DRAFT QUEUED RUNNING ACTIVE EVALUATING PENDING_APPROVAL PAUSED COMPLETED FAILED }

2. model Goal:
   - id String @id @default(cuid())
   - organizationId String
   - reporterUserId String
   - title String
   - description String @db.Text
   - status GoalStatus @default(DRAFT)
   - maxChildren Int @default(20)
   - roadmap Json?
   - previews Json?
   - requireApproval Boolean @default(false)
   - repositoryIds String[]
   - sprintId String?
   - createdAt DateTime @default(now())
   - updatedAt DateTime @updatedAt
   - organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
   - reporterUser User @relation("GoalReporter", fields: [reporterUserId], references: [id])
   - childTickets Ticket[] @relation("GoalChildren")
   - evaluations GoalEvaluation[]
   - sprint Sprint? @relation(fields: [sprintId], references: [id])
   - @@index([organizationId, updatedAt])
   - @@index([organizationId, status])

3. model GoalEvaluation:
   - id String @id @default(cuid())
   - goalId String
   - triggerTicketId String?
   - assessmentArtifact Json
   - deciderOutput Json
   - verdict String
   - proposedTicketId String?
   - createdAt DateTime @default(now())
   - goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)
   - @@index([goalId, createdAt])

4. On model Ticket, add three fields and one index:
   - goalId String?
   - childType String?
   - goal Goal? @relation("GoalChildren", fields: [goalId], references: [id], onDelete: SetNull)
   - @@index([goalId])

5. Add back-relations to existing models (do not touch any other fields on these models):
   - Sprint: goals Goal[]
   - Organization: goals Goal[]
   - User: goals Goal[] AND reportedGoals Goal[] @relation("GoalReporter")

MIGRATION
No new migration file is needed. prisma/migrations/20260523000000_add_goals_pm_agent/migration.sql is already on main and has NOT yet been applied to prod (only the sibling _add_demo_feedback ran). Once the schema fix above lands and tsc passes, the next successful deploy will run `prisma migrate deploy` and that migration applies cleanly.

VERIFICATION — browser-only against the preview deploy
Helix has no access to Git, prod, or shell. Verify exclusively by walking the UI. Each step proves a layer underneath (tsc compile → Prisma generate → migrate deploy → runtime API → DB FKs):

1. App boots. Open the preview URL, reach the authenticated home page. No 500, no blank screen, no red error banner.

2. Goals page reachable. Click into Goals from the main nav. The list renders (empty state OR existing goals) with no error toast and no stack trace. Proves goal-service.ts compiled, route handler runs, prisma.goal.findMany() succeeds — therefore the migration applied and the Prisma client knows the Goal model.

3. Create a Goal end-to-end. Click "New Goal" (or equivalent), fill in title and description, pick a repo if required, submit. The new Goal appears in the list with status DRAFT. Proves the write path, required-column types, and Goal_organizationId_fkey / Goal_reporterUserId_fkey.

4. Open the created Goal's detail page. The page renders showing title, description, status, and an empty children list. Proves read-with-relations and the "GoalChildren" named relation resolves at runtime.

5. Create a child ticket on the Goal. Use whatever child-ticket-creation flow exists on the Goal detail page. The new ticket appears linked to the Goal. Proves Ticket.goalId column with FK, Ticket.childType column, and the named relation works end-to-end.

6. Goal list reflects the child. Navigate back to the Goals list. The Goal's child count / status reflects the new ticket. Proves aggregations across the Goal↔Ticket relation.

7. Adjacent-feature regression checks. From the regular Tickets page, open one non-Goal ticket and view its detail. Open the live-host-agent session UI for a ticket (BLD-577 feature). Submit a thumbs-up on a demo scenario (DemoFeedback feature). All three flows must still work — proves the additive restoration did not break HostAgentSession, DemoFeedback, or general Ticket reads.

If steps 1–6 pass, every layer (build / Prisma client / migration / DB schema / FKs / runtime) is necessarily working. Step 7 is the regression safety net for the adjacent features that landed on main after BLD-590 branched.

OUT OF SCOPE
The auto-merge policy that caused this incident — helix-bot treating prisma/schema.prisma as an auto-resolvable generated file in src/helix-workflow/git-ops.ts (AUTO_RESOLVE_PATTERNS lines 601-608, resolution at lines 642-655) — needs its own separate ticket. Do NOT modify AUTO_RESOLVE_PATTERNS or the merge logic in this ticket.
