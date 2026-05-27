# Product: Resume PAUSED Goals

## Problem Statement

Goals that automatically transition to PAUSED status become permanently stuck with no recovery path. A goal pauses when evaluation encounters an error or when the child-ticket limit is reached. Once PAUSED, the user's only options are Complete or Failed — both terminate the goal and discard remaining work. There is no way to resume evaluation.

The user's WhatsApp goal (from RSH-612) stopped progressing. The prior run on this branch fixed a QUEUED status gap, but the PAUSED dead-end remains: no resume endpoint exists on the server, no Resume button exists in the UI, and no resume command exists in the CLI.

## Product Vision

Users should be able to resume a paused goal with a single action, re-triggering evaluation from the goal's current state. Transient errors or capacity limits should be recoverable without recreating the goal from scratch.

## Users

- **Goal creators** — users who create goals and expect them to progress autonomously. When a goal pauses unexpectedly, they need a simple way to resume it.

## Use Cases

1. **Recover from evaluation errors** — A goal pauses because an AI evaluation call failed. The user resumes it and evaluation retries.
2. **Continue after capacity frees up** — A goal pauses at the child-ticket limit. After child tickets complete, the user resumes evaluation to continue.
3. **Pick up a stalled goal** — A long-running goal (e.g., WhatsApp integration) paused days ago. The user resumes it without losing prior progress.

## Core Workflow

1. User notices a goal is PAUSED (via web UI, CLI, or API).
2. User triggers Resume.
3. System validates the goal is PAUSED.
4. Goal transitions to EVALUATING; evaluation runs from current state.
5. Goal continues its normal lifecycle — producing tickets, awaiting approval, or completing.

## Essential Features (MVP)

1. **Server: `POST /goals/:id/resume` endpoint** — Validates PAUSED status, transitions to EVALUATING, fires evaluation async. Returns 409 if not PAUSED, 404 if not found.
2. **Web UI: Resume button on goal detail page** — Visible only when status is PAUSED. Sits in the existing Controls section.
3. **CLI: `hlx goals resume <goalId>` command** — Calls the resume endpoint and displays the result.

## Features Explicitly Out of Scope (MVP)

- **Manual pause** — Users cannot pause a running goal; pause is automatic only.
- **Automatic resume** — No auto-retry when child tickets complete on a paused goal.
- **Retry policies** — No configurable retry count or backoff for evaluation errors.
- **Max-children adjustment from resume flow** — Users can PATCH the goal separately; resume just re-evaluates.
- **Batch resume** — Resuming multiple goals at once.
- **Resume confirmation dialog** — Resume is low-risk (re-triggers evaluation); no confirmation needed.

## Success Criteria

1. A PAUSED goal can be resumed via web UI, CLI, or API.
2. After resume, the goal transitions to EVALUATING and evaluation proceeds.
3. Resuming a non-PAUSED goal returns 409 Conflict.
4. All three repos pass quality gates (typecheck, lint, build, tests).

## User Scenarios

[SCN-01] Resume a paused goal via web UI
- Precondition: User is viewing a goal detail page for a goal in PAUSED status
- Action: User clicks the Resume button in the Controls section
- Expected Outcome: The goal status changes from PAUSED. The Resume button disappears
  and the goal re-enters its evaluation lifecycle.

[SCN-02] Resume a paused goal via CLI
- Precondition: User has the Helix CLI and knows the goal ID of a PAUSED goal
- Action: User runs `hlx goals resume <goalId>`
- Expected Outcome: The CLI confirms the goal has been resumed and displays the updated
  goal status.

[SCN-03] Attempt to resume a non-paused goal
- Precondition: A goal is in ACTIVE or RUNNING status
- Action: User calls the resume endpoint (via API or CLI)
- Expected Outcome: The system returns a 409 error indicating the goal is not PAUSED.
  No state change occurs.

[SCN-04] Resume a goal paused due to evaluation error
- Precondition: A goal transitioned to PAUSED because evaluation failed
- Action: User resumes the goal
- Expected Outcome: Evaluation re-runs from the current state. If the transient error
  is resolved, the goal progresses normally.

[SCN-05] Resume a goal paused at max-children limit
- Precondition: A goal paused at its child-ticket limit. Some children have since completed.
- Action: User resumes the goal
- Expected Outcome: Evaluation re-runs, detects available capacity, and continues
  producing child tickets.

[SCN-06] Resume button hidden for terminal goals
- Precondition: User views a goal in COMPLETED or FAILED status
- Action: User looks at the goal detail Controls section
- Expected Outcome: No Resume button is shown.

[SCN-07] Resume button hidden for non-paused active goals
- Precondition: User views a goal in ACTIVE, RUNNING, or EVALUATING status
- Action: User looks at the goal detail Controls section
- Expected Outcome: No Resume button is shown. Normal controls remain.

## Key Design Principles

- **Follows existing patterns** — Resume mirrors rejectProposal: validate status, transition to EVALUATING, fire evaluateGoal async.
- **Minimal surface area** — One endpoint, one button, one CLI command. No new statuses or schema changes.
- **User-initiated only** — Resume is explicit, avoiding retry storms from automatic retries.

## Scope & Constraints

- **Three repos**: helix-global-server (endpoint + service + tests), helix-global-client (button + hook), helix-cli (command + docs).
- **No database migration**: PAUSED already exists in the GoalStatus enum.
- **Prior fix on branch**: QUEUED status gap fix is already merged on this branch.

## Future Considerations

- **Auto-resume on child completion** — Add PAUSED to `resolveGoalParent` filter so child completions auto-resume paused goals.
- **Manual pause** — Let users explicitly pause a running goal.
- **Pause reason display** — Show why a goal paused (error vs. capacity) to inform the resume decision.
- **Retry policies** — Configurable backoff for goals that repeatedly pause from evaluation errors.

## Open Questions / Risks

| # | Question / Risk | Notes |
|---|----------------|-------|
| 1 | What if the evaluation error recurs on resume? | Goal will pause again. No infinite loop since resume is user-initiated. |
| 2 | Should resume pre-check child count vs. max limit? | Evaluation already checks this (goal-service.ts:631-638). Resume just re-triggers evaluation. |
| 3 | Is the user's WhatsApp goal PAUSED or QUEUED? | Cannot verify — Goal table SELECT denied. The QUEUED fix may have resolved it, but the PAUSED gap exists regardless. |
| 4 | Should the Resume button have distinct styling? | Follow existing UI conventions; no special treatment needed beyond visibility gating on PAUSED status. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (server) | Ticket context and continuation context | User wants pause/resume to recover stuck WhatsApp goal |
| scout/scout-summary.md (server) | Server lifecycle analysis | No resume endpoint/service/controller; rejectProposal is closest pattern |
| scout/reference-map.json (server) | Server file mapping | PAUSED entry at lines 631-638 and 677-690; no exit except termination |
| diagnosis/diagnosis-statement.md (server) | Root cause and success criteria | PAUSED is one-way trap; resume follows rejectProposal pattern; no schema change |
| diagnosis/apl.json (server) | Diagnosis Q&A | Confirmed no resume function; pattern identified |
| scout/scout-summary.md (client) | Client analysis | No Resume button or hook; Controls has terminate + approval only |
| scout/reference-map.json (client) | Client file mapping | isTerminal at line 80; 6 mutation hooks, no resume |
| diagnosis/diagnosis-statement.md (client) | Client root cause | New useResumeGoal hook + Resume button needed |
| diagnosis/apl.json (client) | Client diagnosis | 15s polling auto-reflects status changes after resume |
| scout/scout-summary.md (cli) | CLI analysis | 4 goals subcommands; no resume; terminate.ts is pattern |
| diagnosis/diagnosis-statement.md (cli) | CLI root cause | New resume.ts + switch case + docs needed |
| repo-guidance.json (client) | Repo intent | All three repos are targets |
| .helix-refs/RSH-612/_manifest.json | Referenced ticket | WhatsApp goal setup research ticket context |
