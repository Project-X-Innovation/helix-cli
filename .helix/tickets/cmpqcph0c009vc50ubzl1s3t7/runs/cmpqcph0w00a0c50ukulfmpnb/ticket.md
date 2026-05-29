# Ticket Context

- ticket_id: cmpqcph0c009vc50ubzl1s3t7
- short_id: FIX-627
- run_id: cmpqcph0w00a0c50ukulfmpnb
- run_branch: helix/fix/FIX-627-implement-goals-go-into-pause-then-when-i-click
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Implement: Goals go into pause then when I click resume, go into evaluating and then do nothing, go back into pause.

## Description
One thing, Let's not defer the logging 

Structured logging for goal lifecycle events — Production logs show zero entries; structured logging would improve debuggability

Let's do that now too



Build ticket to implement research from RSH-626.

Goals go into pause then when I click resume, go into evaluating and then do nothing, go back into pause.



Goals should run on their own, evaluating, spinning up tickets, evaluating, spinning up tickets, evaluating, spinning up tickets unless I click pause or unless I click Needs Approval. It should just go. It shouldn't get queued. It shouldn't get anything. It should just go through that.

- Run the first ticket.
- Go into evaluation.
- Get the next ticket.
- Show the previews, show the roadmap.
- Get the ticket, do research if necessary, evaluate, get the next ticket, evaluate.

 It should just go automatically unless, of course, I click Needs Approval. I haven't and look at the two goals that I have. They just keep getting stuck. They don't go anywhere. No further tickets are being produced. They just go back into pause and that's it. Not only should it not get paused. First of all right now there are two problems:

1. It goes into pause.
2. It doesn't make another ticket.

  y vision for it is that it should just keep spawning off tickets. There should be previews, there should be assessments, but it should just continuously spin up tickets.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RSH-626: Goal Autonomous Lifecycle Bug &mdash; Root Cause Analysis</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background: #f8f9fc; line-height: 1.6;">

  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #ffffff; padding: 48px 32px 40px; border-bottom: 4px solid #e94560;">
    <div style="max-width: 960px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="background: #e94560; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 4px; letter-spacing: 0.5px;">RESEARCH REPORT</span>
        <span style="background: rgba(255,255,255,0.15); color: #ccc; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 4px;">RSH-626</span>
      </div>
      <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Goal Autonomous Lifecycle Bug</h1>
      <p style="margin: 0; font-size: 16px; color: #a0aec0; max-width: 720px;">Root cause analysis of why goals silently stall in PAUSED state and fail to spawn child tickets. Two compounding defects identified in a single server-side file.</p>
      <div style="margin-top: 20px; display: flex; gap: 24px; font-size: 13px; color: #a0aec0;">
        <span>Date: May 29, 2026</span>
        <span>Target: helix-global-server</span>
        <span>File: goal-service.ts</span>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div style="max-width: 960px; margin: 0 auto; padding: 40px 32px;">

    <!-- Table of Contents -->
    <nav style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px 28px; margin-bottom: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
      <h2 id="table-of-contents" style="margin: 0 0 16px; font-size: 18px; color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 8px;">Table of Contents</h2>
      <ol style="margin: 0; padding-left: 20px; columns: 2; column-gap: 32px;">
        <li style="margin-bottom: 6px;"><a href="#executive-summary" style="color: #0f3460; text-decoration: none;">Executive Summary</a></li>
        <li style="margin-bottom: 6px;"><a href="#problem-statement" style="color: #0f3460; text-decoration: none;">Problem Statement</a></li>
        <li style="margin-bottom: 6px;"><a href="#system-architecture" style="color: #0f3460; text-decoration: none;">System Architecture</a></li>
        <li style="margin-bottom: 6px;"><a href="#root-cause-analysis" style="color: #0f3460; text-decoration: none;">Root Cause Analysis</a></li>
        <li style="margin-bottom: 6px;"><a href="#evidence-summary" style="color: #0f3460; text-decoration: none;">Evidence Summary</a></li>
        <li style="margin-bottom: 6px;"><a href="#recommended-fix" style="color: #0f3460; text-decoration: none;">Recommended Fix</a></li>
        <li style="margin-bottom: 6px;"><a href="#risk-assessment" style="color: #0f3460; text-decoration: none;">Risk Assessment</a></li>
        <li style="margin-bottom: 6px;"><a href="#appendix-code-references" style="color: #0f3460; text-decoration: none;">Appendix: Code References</a></li>
      </ol>
    </nav>

    <!-- Section 1: Executive Summary -->
    <section style="margin-bottom: 48px;">
      <h2 id="executive-summary" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">1. Executive Summary</h2>

      <div style="background: linear-gradient(135deg, #fff5f5 0%, #fff 100%); border-left: 4px solid #e94560; border-radius: 0 8px 8px 0; padding: 20px 24px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.7;">
          Goals are designed to operate as an autonomous engine &mdash; continuously evaluating progress and spawning child tickets without manual intervention. Instead, <strong>goals silently stall in PAUSED state</strong> and <strong>no new child tickets are produced</strong> after the initial setup. This investigation identified <strong>two compounding defects</strong> in a single server-side file (<code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">helix-global-server/src/services/goal-service.ts</code>) that together break the autonomous lifecycle:
        </p>
      </div>

      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; background: #fff; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="background: #e94560; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px;">BUG 1</span>
            <strong style="color: #c53030; font-size: 14px;">Run-Start Gap</strong>
          </div>
          <p style="margin: 0; font-size: 14px; color: #4a5568;">Child tickets are created but their sandbox runs are <strong>never started</strong>. They sit in QUEUED status forever, breaking the evaluate &rarr; spawn &rarr; complete &rarr; evaluate cycle.</p>
        </div>

        <div style="flex: 1; min-width: 280px; background: #fff; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="background: #e94560; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px;">BUG 2</span>
            <strong style="color: #c53030; font-size: 14px;">Catch-All PAUSED</strong>
          </div>
          <p style="margin: 0; font-size: 14px; color: #4a5568;">Any error during evaluation silently transitions the goal to PAUSED with <strong>no error information</strong> surfaced to the user. No evaluation-level retry exists.</p>
        </div>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #4a5568;">Both bugs must be fixed together &mdash; fixing either one alone does not restore autonomous operation. The fix is contained to a single file with no schema migrations required. Production data confirms: <strong>2 goals exist, each with exactly 1 child ticket</strong> (the initial RESEARCH setup), zero additional children spawned, and all setup runs completed successfully.</p>
    </section>

    <!-- Section 2: Problem Statement -->
    <section style="margin-bottom: 48px;">
      <h2 id="problem-statement" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">2. Problem Statement</h2>

      <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; color: #2d3748;">User-Reported Symptoms</h3>
        <blockquote style="margin: 0; padding: 16px 20px; background: #fff; border-left: 3px solid #a0aec0; border-radius: 0 6px 6px 0; font-style: italic; color: #4a5568;">
          "Goals go into pause then when I click resume, go into evaluating and then do nothing, go back into pause."
        </blockquote>
      </div>

      <p style="font-size: 15px; color: #2d3748;">The user reports two distinct symptoms:</p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 12px 16px; background: #1a1a2e; color: #fff; border-radius: 6px 0 0 0;">#</th>
            <th style="text-align: left; padding: 12px 16px; background: #1a1a2e; color: #fff;">Symptom</th>
            <th style="text-align: left; padding: 12px 16px; background: #1a1a2e; color: #fff; border-radius: 0 6px 0 0;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #fff;">
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #e94560;">1</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Unexpected PAUSED State</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">Goals transition to PAUSED without the user clicking Pause. Clicking Resume briefly shows EVALUATING then silently reverts to PAUSED.</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #e94560;">2</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">No Further Tickets</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">After the initial setup RESEARCH ticket, no additional child tickets are produced. The expected behavior is continuous ticket spawning.</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 20px 24px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; color: #2b6cb0;">Expected Behavior</h3>
        <blockquote style="margin: 0; padding: 16px 20px; background: #fff; border-left: 3px solid #3182ce; border-radius: 0 6px 6px 0; font-style: italic; color: #4a5568;">
          "Goals should run on their own, evaluating, spinning up tickets, evaluating, spinning up tickets&hellip; unless I click pause or unless I click Needs Approval. It should just go."
        </blockquote>
        <p style="margin: 12px 0 0; font-size: 14px; color: #2b6cb0;">The user expects a fully autonomous cycle: evaluate &rarr; spawn ticket &rarr; ticket runs &rarr; ticket completes &rarr; evaluate again. No manual intervention should be required.</p>
      </div>
    </section>

    <!-- Section 3: System Architecture -->
    <section style="margin-bottom: 48px;">
      <h2 id="system-architecture" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">3. System Architecture</h2>

      <h3 id="state-machine" style="font-size: 18px; color: #2d3748; margin-bottom: 16px;">3.1 Goal State Machine</h3>

      <p style="font-size: 14px; color: #4a5568; margin-bottom: 16px;">The goal lifecycle is implemented as a state machine with <strong>9 states</strong> defined in the <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">GoalStatus</code> Prisma enum (<code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">prisma/schema.prisma</code> line 155):</p>

      <!-- State Machine Diagram (text-based) -->
      <div style="background: #1a1a2e; color: #e2e8f0; border-radius: 8px; padding: 24px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; overflow-x: auto; margin-bottom: 24px;">
        <pre style="margin: 0; white-space: pre; color: #e2e8f0;">
  DRAFT &rarr; QUEUED &rarr; [setup ticket created]
                   &darr;
            Child ticket completes
                   &darr;
             EVALUATING  &larr;&larr;&larr;&larr;&larr;&larr;&larr;&larr;&larr;&larr;&larr;+
                   &darr;                          |
          +--------+--------+                 |
          &darr;                 &darr;                 |
   verdict="next_ticket"  verdict="complete"  |
          &darr;                 &darr;                 |
   requireApproval?     COMPLETED             |
     &darr;         &darr;                              |
    yes        no                             |
     &darr;         &darr;                              |
  PENDING     spawn child &rarr; ACTIVE           |
  APPROVAL       &darr;           &darr;               |
     &darr;          run starts   child completes  |
   approve       &darr;           &darr;               |
     &darr;          child runs   resolveGoalParent|
   spawn &rarr; ACTIVE  &darr;           &darr;               |
                   +&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;&rarr;+

  Error in evaluateGoal &rarr; PAUSED (catch-all)
  User clicks Resume    &rarr; EVALUATING (re-enters loop)
        </pre>
      </div>

      <h3 id="core-workflow" style="font-size: 18px; color: #2d3748; margin-bottom: 16px;">3.2 Core Autonomous Workflow</h3>

      <ol style="font-size: 14px; color: #4a5568; padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong>Create Goal</strong> &mdash; <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">createGoal()</code> creates the goal (DRAFT &rarr; QUEUED) and spawns a setup RESEARCH ticket.</li>
        <li style="margin-bottom: 8px;"><strong>Setup Ticket Runs</strong> &mdash; The RESEARCH ticket's sandbox run executes and completes.</li>
        <li style="margin-bottom: 8px;"><strong>Trigger Evaluation</strong> &mdash; <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">resolveGoalParent()</code> detects child completion and fires <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">evaluateGoal()</code> asynchronously.</li>
        <li style="margin-bottom: 8px;"><strong>AI Evaluation</strong> &mdash; <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">evaluateGoal()</code> runs a dual-phase AI pipeline: <strong>Assessor</strong> (7-question protocol) then <strong>Decider</strong> (verdict + proposal).</li>
        <li style="margin-bottom: 8px;"><strong>Spawn Next Child</strong> &mdash; On verdict <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">"next_ticket"</code>, <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">spawnGoalChild()</code> creates and starts the next ticket.</li>
        <li style="margin-bottom: 8px;"><strong>Repeat</strong> &mdash; When the child ticket completes, step 3 fires again. This cycle continues until verdict <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">"complete"</code> or user intervention.</li>
      </ol>

      <h3 id="key-files" style="font-size: 18px; color: #2d3748; margin-top: 28px; margin-bottom: 16px;">3.3 Key Files</h3>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff; border-radius: 6px 0 0 0;">File</th>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff; border-radius: 0 6px 0 0;">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/services/goal-service.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Core goal logic: state machine, <code>evaluateGoal</code>, <code>resumeGoal</code>, <code>spawnGoalChild</code>, <code>resolveGoalParent</code></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/services/goal-schemas.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Zod schemas for Assessor/Decider AI output validation</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/controllers/goal-controller.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">HTTP handlers for all goal API endpoints (resume, approve, reject)</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/helix-workflow/orchestrator.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Calls <code>resolveGoalParent</code> when child tickets reach terminal status (lines 1556, 2907)</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/services/ticket-service.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code>createTicketForOrganization</code> (creates QUEUED runs) and <code>startQueuedRunForTicketInOrganization</code> (starts them)</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/services/transcript-service.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Reference pattern: correctly calls both create + start after ticket creation</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">src/services/goal-service.test.ts</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Tests for evaluateGoal, resolveGoalParent, resumeGoal</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px;"><code style="font-size: 12px;">prisma/schema.prisma</code></td>
            <td style="padding: 10px 14px;">Goal model, GoalEvaluation model, GoalStatus enum (9 states)</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Section 4: Root Cause Analysis -->
    <section style="margin-bottom: 48px;">
      <h2 id="root-cause-analysis" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">4. Root Cause Analysis</h2>

      <!-- Bug 1 -->
      <div style="background: #fff; border: 2px solid #fc8181; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="background: #e94560; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 4px;">BUG 1</span>
          <h3 id="bug-1-run-start-gap" style="margin: 0; font-size: 20px; color: #c53030;">Run-Start Gap in spawnGoalChild and createGoal</h3>
        </div>
        <p style="margin: 0 0 4px; font-size: 12px; color: #718096;">Confidence: <span style="color: #38a169; font-weight: 700;">DEFINITIVE</span> &mdash; Confirmed from code inspection and production database evidence</p>

        <p style="margin: 16px 0; font-size: 14px; color: #4a5568;">
          <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">spawnGoalChild</code> (lines 143&ndash;176) creates child tickets by calling <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">createTicketForOrganization</code>, but <strong>never calls <code style="background: #fff5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px; color: #c53030;">startQueuedRunForTicketInOrganization</code></strong>. The function is not even imported in <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">goal-service.ts</code>.
        </p>

        <p style="margin: 0 0 16px; font-size: 14px; color: #4a5568;">
          The <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">ticket-service.ts</code> explicitly documents this contract at line 979:
        </p>

        <div style="background: #1a1a2e; border-radius: 6px; padding: 16px 20px; margin-bottom: 16px;">
          <code style="color: #a0aec0; font-size: 13px;">// Callers are responsible for starting the run when appropriate</code>
        </div>

        <p style="margin: 0 0 16px; font-size: 14px; color: #4a5568;"><strong>Consequence chain:</strong></p>
        <ol style="font-size: 14px; color: #4a5568; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 6px;">Child tickets are created with QUEUED sandbox runs that sit idle forever</li>
          <li style="margin-bottom: 6px;">Since child tickets never run, they never complete</li>
          <li style="margin-bottom: 6px;">Since they never complete, <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">resolveGoalParent</code> is never triggered by the orchestrator</li>
          <li style="margin-bottom: 6px;">The autonomous evaluate &rarr; spawn &rarr; complete &rarr; evaluate cycle is <strong>fundamentally broken</strong></li>
        </ol>

        <div style="margin-top: 16px; background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 6px; padding: 14px 18px;">
          <p style="margin: 0; font-size: 13px; color: #276749;"><strong>Same gap exists in:</strong></p>
          <ul style="margin: 8px 0 0; padding-left: 18px; font-size: 13px; color: #276749;">
            <li><code>createGoal</code> (lines 127&ndash;136): Setup RESEARCH ticket created but not started</li>
            <li><code>approveProposal</code> (line 766): Calls <code>spawnGoalChild</code> &mdash; inherits the gap</li>
          </ul>
        </div>

        <div style="margin-top: 16px; background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 6px; padding: 14px 18px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #2b6cb0;"><strong>Contrast with correct patterns in the codebase:</strong></p>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #2b6cb0;">
            <li><code>transcript-service.ts</code> line 6: Imports both <code>createTicketForOrganization</code> and <code>startQueuedRunForTicketInOrganization</code></li>
            <li><code>transcript-service.ts</code> line 510: Calls <code>startQueuedRunForTicketInOrganization</code> after ticket creation</li>
            <li><code>create-ticket.tsx</code> lines 198&ndash;207: Client calls <code>POST /tickets/:id/run</code> after creation</li>
          </ul>
        </div>
      </div>

      <!-- Bug 2 -->
      <div style="background: #fff; border: 2px solid #fc8181; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="background: #e94560; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 4px;">BUG 2</span>
          <h3 id="bug-2-catch-all-paused" style="margin: 0; font-size: 20px; color: #c53030;">Catch-All Error &rarr; PAUSED in evaluateGoal</h3>
        </div>
        <p style="margin: 0 0 4px; font-size: 12px; color: #718096;">Confidence: <span style="color: #38a169; font-weight: 700;">CONFIRMED</span> &mdash; from code inspection; specific triggering error unknown</p>

        <p style="margin: 16px 0; font-size: 14px; color: #4a5568;">
          <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">evaluateGoal</code> (lines 676&ndash;691) catches <strong>all</strong> exceptions and transitions the goal to PAUSED with only a <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">console.error</code> log. This includes:
        </p>

        <ul style="font-size: 14px; color: #4a5568; padding-left: 20px; margin: 0 0 16px;">
          <li style="margin-bottom: 4px;">AI query failures (timeout at 90s, rate limits, SDK subprocess errors)</li>
          <li style="margin-bottom: 4px;">Zod schema validation failures (strict enum matching on Assessor/Decider output)</li>
          <li style="margin-bottom: 4px;">Database errors</li>
          <li style="margin-bottom: 4px;">Any other runtime exception</li>
        </ul>

        <p style="margin: 0 0 16px; font-size: 14px; color: #4a5568;">
          The function uses <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">query()</code> from <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">@anthropic-ai/claude-agent-sdk</code> which spawns a subprocess. If this subprocess fails, the error is caught by the outer handler and the goal <strong>silently transitions to PAUSED</strong>.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px; background: #fff5f5; border-radius: 6px; padding: 14px 18px;">
            <p style="margin: 0; font-size: 13px; color: #c53030;"><strong>No error info surfaced</strong> &mdash; The UI only sees the status change from EVALUATING to PAUSED with zero explanation.</p>
          </div>
          <div style="flex: 1; min-width: 200px; background: #fff5f5; border-radius: 6px; padding: 14px 18px;">
            <p style="margin: 0; font-size: 13px; color: #c53030;"><strong>No evaluation-level retry</strong> &mdash; Per-phase retries exist (2 retries each), but if the overall function fails, the user must manually click Resume.</p>
          </div>
          <div style="flex: 1; min-width: 200px; background: #fff5f5; border-radius: 6px; padding: 14px 18px;">
            <p style="margin: 0; font-size: 13px; color: #c53030;"><strong>Fire-and-forget pattern</strong> &mdash; <code>resumeGoal</code> calls <code>void evaluateGoal().catch()</code>; the HTTP response returns before failure occurs.</p>
          </div>
        </div>
      </div>

      <!-- Compounding Effect -->
      <div style="background: #fffaf0; border: 2px solid #ed8936; border-radius: 8px; padding: 24px;">
        <h3 id="how-the-bugs-compound" style="margin: 0 0 16px; font-size: 18px; color: #c05621;">How Both Bugs Compound</h3>

        <p style="margin: 0 0 16px; font-size: 14px; color: #4a5568;">Neither bug alone is sufficient to explain the full symptom set. Both must be fixed together:</p>

        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 280px; background: #fff; border-radius: 6px; padding: 16px; border: 1px solid #fbd38d;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #c05621;">If only Bug 2 is fixed (evaluation succeeds):</p>
            <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #4a5568;">
              <li>evaluateGoal produces verdict "next_ticket"</li>
              <li>spawnGoalChild creates a child ticket (but doesn't start its run &mdash; Bug 1)</li>
              <li>Goal transitions to ACTIVE</li>
              <li>Child ticket sits in QUEUED forever</li>
              <li>resolveGoalParent is never triggered</li>
              <li style="color: #c53030; font-weight: 700;">Goal stuck at ACTIVE &mdash; no further evaluations</li>
            </ol>
          </div>
          <div style="flex: 1; min-width: 280px; background: #fff; border-radius: 6px; padding: 16px; border: 1px solid #fbd38d;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #c05621;">If only Bug 1 is fixed (runs start):</p>
            <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #4a5568;">
              <li>evaluateGoal fails &rarr; PAUSED (Bug 2)</li>
              <li>User clicks Resume &rarr; evaluateGoal fails &rarr; PAUSED</li>
              <li style="color: #c53030; font-weight: 700;">Infinite loop &mdash; no child tickets ever spawned</li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Evidence Summary -->
    <section style="margin-bottom: 48px;">
      <h2 id="evidence-summary" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">5. Evidence Summary</h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff; border-radius: 6px 0 0 0;">Evidence Type</th>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff;">Source</th>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff;">Finding</th>
            <th style="text-align: center; padding: 10px 14px; background: #1a1a2e; color: #fff; border-radius: 0 6px 0 0;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: Import Statement</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">goal-service.ts</code> line 6</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code>startQueuedRunForTicketInOrganization</code> is NOT imported</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fed7d7; color: #c53030; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">CONFIRMED</span></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: spawnGoalChild</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">goal-service.ts</code> lines 143&ndash;176</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Calls <code>createTicketForOrganization</code> only &mdash; no run start</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fed7d7; color: #c53030; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">CONFIRMED</span></td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: createGoal</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">goal-service.ts</code> lines 127&ndash;136</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Creates setup ticket without starting run</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fed7d7; color: #c53030; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">CONFIRMED</span></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: evaluateGoal catch</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">goal-service.ts</code> lines 676&ndash;691</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Catch-all transitions to PAUSED on any error</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fed7d7; color: #c53030; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">CONFIRMED</span></td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: resumeGoal</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">goal-service.ts</code> line 829</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Fire-and-forget: <code>void evaluateGoal().catch()</code></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fefcbf; color: #975a16; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">NOTED</span></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: ticket-service contract</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">ticket-service.ts</code> line 979</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">"Callers are responsible for starting the run when appropriate"</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #c6f6d5; color: #276749; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">REFERENCE</span></td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: Correct pattern</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">transcript-service.ts</code> line 510</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Calls <code>startQueuedRunForTicketInOrganization</code> after ticket creation</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #c6f6d5; color: #276749; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">REFERENCE</span></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Code: Client correct pattern</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">create-ticket.tsx</code> lines 198&ndash;207</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Client calls <code>POST /tickets/:id/run</code> after creation</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #c6f6d5; color: #276749; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">REFERENCE</span></td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Production DB: Tickets</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Ticket table query (runtime inspection)</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">2 goals, each with 1 child (RESEARCH setup, status REPORT_READY), 0 additional children</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fed7d7; color: #c53030; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">CONFIRMED</span></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Production DB: Sandbox Runs</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">SandboxRun table query</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">All setup ticket runs SUCCEEDED (likely started manually by user)</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #c6f6d5; color: #276749; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">CONFIRMED</span></td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Production Logs</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">BetterStack log queries</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Zero goal-related log entries despite <code>console.error</code> in code</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fefcbf; color: #975a16; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">ANOMALOUS</span></td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Production DB: Goal table</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Direct query</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Permission denied &mdash; cannot confirm current goal statuses</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #e2e8f0; color: #4a5568; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">BLOCKED</span></td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px;">Production DB: GoalEvaluation</td>
            <td style="padding: 10px 14px; font-weight: 600;">Direct query</td>
            <td style="padding: 10px 14px;">Permission denied &mdash; cannot confirm if any evaluations were stored</td>
            <td style="padding: 10px 14px; text-align: center;"><span style="background: #e2e8f0; color: #4a5568; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">BLOCKED</span></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 20px; background: #fffaf0; border: 1px solid #fbd38d; border-radius: 8px; padding: 16px 20px;">
        <p style="margin: 0; font-size: 13px; color: #975a16;">
          <strong>Note on production data freshness:</strong> Runtime queries were executed on May 29, 2026. The two goal-related tickets were created on May 27, 2026 (goal IDs: <code>cmpncxgp3000y3y0tsdwhd8gc</code> and <code>cmpop9ymd000t4s0un7lmvq93</code>). Both setup tickets show REPORT_READY status with SUCCEEDED sandbox runs, confirming the setup phase completed but no further children were spawned.
        </p>
      </div>
    </section>

    <!-- Section 6: Recommended Fix -->
    <section style="margin-bottom: 48px;">
      <h2 id="recommended-fix" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">6. Recommended Fix</h2>

      <p style="font-size: 15px; color: #2d3748; margin-bottom: 20px;">All changes are contained to a single file: <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 14px;">helix-global-server/src/services/goal-service.ts</code>. No schema migrations, client changes, or new dependencies are required.</p>

      <!-- Fix 1 -->
      <div style="background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 20px 24px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="background: #38a169; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 4px;">FIX 1</span>
          <h3 id="fix-1-close-the-run-start-gap" style="margin: 0; font-size: 17px; color: #276749;">Close the Run-Start Gap</h3>
        </div>

        <ol style="font-size: 14px; color: #4a5568; padding-left: 20px;">
          <li style="margin-bottom: 10px;">
            <strong>Import <code>startQueuedRunForTicketInOrganization</code></strong> in <code>goal-service.ts</code> line 6:
            <div style="background: #1a1a2e; border-radius: 6px; padding: 12px 16px; margin-top: 8px;">
              <code style="color: #c6f6d5; font-size: 13px;">import { createTicketForOrganization, startQueuedRunForTicketInOrganization } from "./ticket-service.js";</code>
            </div>
          </li>
          <li style="margin-bottom: 10px;">
            <strong>In <code>spawnGoalChild</code></strong> (line 166): Capture the result of <code>createTicketForOrganization</code>, call <code>startQueuedRunForTicketInOrganization(result.ticket.id, goal.organizationId)</code>, then return the result.
          </li>
          <li style="margin-bottom: 10px;">
            <strong>In <code>createGoal</code></strong> (line 127): Capture the result of <code>createTicketForOrganization</code>, call <code>startQueuedRunForTicketInOrganization(created.ticket.id, organizationId)</code>.
          </li>
          <li style="margin-bottom: 10px;">
            <strong><code>approveProposal</code></strong> (line 766) calls <code>spawnGoalChild</code> &mdash; automatically fixed once <code>spawnGoalChild</code> is updated.
          </li>
        </ol>

        <p style="margin: 0; font-size: 13px; color: #276749;"><strong>Pattern reference:</strong> This matches the established pattern in <code>transcript-service.ts</code> (line 6 imports both functions, line 510 calls start after create).</p>
      </div>

      <!-- Fix 2 -->
      <div style="background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 20px 24px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="background: #38a169; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 4px;">FIX 2</span>
          <h3 id="fix-2-replace-catch-all-with-error-rec" style="margin: 0; font-size: 17px; color: #276749;">Replace Catch-All with Error-Recording Block</h3>
        </div>

        <p style="font-size: 14px; color: #4a5568; margin-bottom: 12px;">In the catch block (lines 676&ndash;691), before the PAUSED transition, create a <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">GoalEvaluation</code> record with <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">verdict='error'</code> and error details:</p>

        <div style="background: #1a1a2e; border-radius: 6px; padding: 16px 20px; margin-bottom: 12px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code>} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`[evaluateGoal] Evaluation failed for Goal ${goalId}: ${errorMsg}`);

  // Record error in GoalEvaluation for user visibility
  try {
    await prisma.goalEvaluation.create({
      data: {
        goalId,
        triggerTicketId: triggerTicketId ?? null,  // locally-scoped variable
        assessmentArtifact: { error: errorMsg, phase: "evaluation_failed" },
        deciderOutput: { error: errorMsg, errorType: "evaluation_failed" },
        verdict: "error",
      },
    });
  } catch (_evalErr) {
    console.error(`[evaluateGoal] Failed to record error evaluation: ${_evalErr}`);
  }

  // Still transition to PAUSED (recoverable)
  try {
    await prisma.goal.update({
      where: { id: goalId },
      data: { status: GoalStatus.PAUSED },
    });
  } catch (updateError) { /* ... */ }
}</code></pre>
        </div>

        <p style="margin: 0; font-size: 13px; color: #276749;"><strong>Pattern reference:</strong> This extends the existing Decider-failure pattern (lines 588&ndash;603) which already stores <code>verdict='error'</code> with error details. The client already queries GoalEvaluations for goal detail views, so error records become visible immediately.</p>
      </div>

      <!-- What's NOT Changed -->
      <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px;">
        <h3 id="whats-not-changed" style="margin: 0 0 12px; font-size: 16px; color: #2d3748;">What Is NOT Changed (by design)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px 12px; background: #edf2f7; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="text-align: left; padding: 8px 12px; background: #edf2f7; border-bottom: 2px solid #e2e8f0;">Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Evaluation-level retry</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Duplicate-ticket risk; per-phase retries (2 each) are sufficient for MVP</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Fire-and-forget async pattern</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Intentional for long-running evaluations; concurrency guardrails deferred</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Database schema / migrations</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Existing GoalEvaluation model already supports error recording</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Client-side code</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Client correctly reflects server state; no UI changes needed</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">AI prompts / Zod schemas</td>
              <td style="padding: 8px 12px;">Evaluation content is not the issue; lifecycle mechanics are</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Test Changes -->
      <div style="background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 20px 24px; margin-top: 20px;">
        <h3 id="required-test-changes" style="margin: 0 0 12px; font-size: 16px; color: #2b6cb0;">Required Test Changes</h3>
        <p style="margin: 0 0 8px; font-size: 14px; color: #4a5568;">
          The test file <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">goal-service.test.ts</code> uses <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">t.mock.module()</code> to mock <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">./ticket-service.js</code>. All three test describe blocks (evaluateGoal, resolveGoalParent, resumeGoal) must be updated:
        </p>
        <ol style="font-size: 14px; color: #4a5568; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 6px;">Add <code>startQueuedRunForTicketInOrganization</code> to the mock module's <code>namedExports</code></li>
          <li style="margin-bottom: 6px;">Create a trackable mock delegate (e.g., <code>mockStartRun</code>) for assertion</li>
          <li style="margin-bottom: 6px;">Optionally add test cases verifying the function is called with the correct <code>ticketId</code> and <code>organizationId</code></li>
        </ol>
      </div>
    </section>

    <!-- Section 7: Risk Assessment -->
    <section style="margin-bottom: 48px;">
      <h2 id="risk-assessment" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">7. Risk Assessment</h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff; border-radius: 6px 0 0 0;">#</th>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff;">Risk / Open Question</th>
            <th style="text-align: center; padding: 10px 14px; background: #1a1a2e; color: #fff;">Impact</th>
            <th style="text-align: left; padding: 10px 14px; background: #1a1a2e; color: #fff; border-radius: 0 6px 0 0;">Status / Mitigation</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">1</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><strong>Specific evaluateGoal error unknown.</strong> Production logs contain zero goal-related entries. Goal/GoalEvaluation DB tables return permission denied.</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fefcbf; color: #975a16; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">MEDIUM</span></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Fix is error-type-agnostic. Error recording (Fix 2) will make future errors visible.</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">2</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><strong>How is the initial setup ticket currently started?</strong> Code doesn't start it, yet production shows setup runs SUCCEEDED.</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fefcbf; color: #975a16; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">MEDIUM</span></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Likely started manually by user via ticket detail page. Fix 1 will auto-start setup tickets, matching expected behavior.</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">3</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><strong>Concurrent evaluateGoal invocations.</strong> Fire-and-forget pattern has no concurrency guard.</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #c6f6d5; color: #276749; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">LOW</span></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Deferred to future hardening ticket. Existing behavior is unchanged.</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">4</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><strong>AI model schema validation reliability.</strong> Zod validation failures exhaust retry budget and trigger PAUSED.</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="background: #fefcbf; color: #975a16; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">MEDIUM</span></td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Error recording (Fix 2) will make schema failures visible rather than silent.</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 14px; font-weight: 700;">5</td>
            <td style="padding: 10px 14px;"><strong>maxChildren limit.</strong> Reaching this limit triggers PAUSED by design, but the reason is not visible to the user.</td>
            <td style="padding: 10px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">LOW</span></td>
            <td style="padding: 10px 14px;">Deferred. Could add a GoalEvaluation record for maxChildren in a future ticket.</td>
          </tr>
        </tbody>
      </table>

      <!-- Deferred Items -->
      <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin-top: 20px;">
        <h3 id="deferred-to-future-tickets" style="margin: 0 0 12px; font-size: 16px; color: #2d3748;">Deferred to Future Tickets</h3>
        <ul style="font-size: 14px; color: #4a5568; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 6px;"><strong>Evaluation-level retry with idempotency guards</strong> &mdash; Duplicate-ticket risk requires careful design</li>
          <li style="margin-bottom: 6px;"><strong>Concurrency guardrails for fire-and-forget evaluateGoal</strong> &mdash; No protection against concurrent evaluations of the same goal</li>
          <li style="margin-bottom: 6px;"><strong>Structured logging for goal lifecycle events</strong> &mdash; Production logs show zero entries; structured logging would improve debuggability</li>
          <li style="margin-bottom: 6px;"><strong>Error surfacing UI on client</strong> &mdash; Client already queries GoalEvaluations; follow-up enhancement</li>
          <li style="margin-bottom: 6px;"><strong>Explicit pauseGoal endpoint</strong> &mdash; No user-initiated pause endpoint exists currently</li>
        </ul>
      </div>
    </section>

    <!-- Section 8: Appendix: Code References -->
    <section style="margin-bottom: 48px;">
      <h2 id="appendix-code-references" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">8. Appendix: Code References</h2>

      <p style="font-size: 14px; color: #4a5568; margin-bottom: 20px;">All code references below are from the <code style="background: #f0f0f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">helix-global-server</code> repository, verified against the current codebase as of May 29, 2026.</p>

      <!-- Code Reference A: Import Statement -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">A. Import Statement &mdash; Missing startQueuedRunForTicketInOrganization</span>
          <code style="font-size: 12px; color: #718096;">goal-service.ts line 6</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #718096;">1</span>  <span style="color: #c792ea;">import</span> { GoalStatus } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"@prisma/client"</span>;
<span style="color: #718096;">2</span>  <span style="color: #c792ea;">import</span> { query } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"@anthropic-ai/claude-agent-sdk"</span>;
<span style="color: #718096;">3</span>  <span style="color: #c792ea;">import</span> { prisma } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"../db/prisma.js"</span>;
<span style="color: #718096;">4</span>  <span style="color: #c792ea;">import</span> { config } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"../config/env.js"</span>;
<span style="color: #718096;">5</span>  <span style="color: #c792ea;">import</span> { HttpError } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"../http/errors.js"</span>;
<span style="color: #f07178;">6</span>  <span style="color: #c792ea;">import</span> { createTicketForOrganization } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"./ticket-service.js"</span>;  <span style="color: #f07178;">// &lt;-- Missing startQueuedRunForTicketInOrganization</span></code></pre>
        </div>
      </div>

      <!-- Code Reference B: spawnGoalChild -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">B. spawnGoalChild &mdash; Creates ticket without starting run</span>
          <code style="font-size: 12px; color: #718096;">goal-service.ts lines 143&ndash;176</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #718096;">143</span>  <span style="color: #c792ea;">export const</span> spawnGoalChild = <span style="color: #c792ea;">async</span> (
<span style="color: #718096;">...</span>
<span style="color: #f07178;">166</span>  <span style="color: #c792ea;">return</span> createTicketForOrganization({  <span style="color: #f07178;">// &lt;-- Returns directly, no run start</span>
<span style="color: #718096;">167</span>    organizationId: goal.organizationId,
<span style="color: #718096;">168</span>    reporterUserId: goal.reporterUserId,
<span style="color: #718096;">169</span>    title: proposal.title,
<span style="color: #718096;">170</span>    description: proposal.description,
<span style="color: #718096;">171</span>    mode: proposal.mode,
<span style="color: #718096;">172</span>    goalId: goal.id,
<span style="color: #718096;">173</span>    childType: proposal.childType,
<span style="color: #718096;">174</span>    repositoryIds: goal.repositoryIds,
<span style="color: #718096;">175</span>  });
<span style="color: #718096;">176</span>  };</code></pre>
        </div>
      </div>

      <!-- Code Reference C: createGoal -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">C. createGoal &mdash; Setup ticket created without starting run</span>
          <code style="font-size: 12px; color: #718096;">goal-service.ts lines 126&ndash;136</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #718096;">126</span>  <span style="color: #546e7a;">// Spawn RESEARCH setup ticket after transaction completes</span>
<span style="color: #f07178;">127</span>  <span style="color: #c792ea;">await</span> createTicketForOrganization({  <span style="color: #f07178;">// &lt;-- No startQueuedRun call follows</span>
<span style="color: #718096;">128</span>    organizationId,
<span style="color: #718096;">129</span>    reporterUserId: userId,
<span style="color: #718096;">130</span>    title: <span style="color: #c3e88d;">`Goal Setup: ${goal.title}`</span>,
<span style="color: #718096;">131</span>    description: goal.description,
<span style="color: #718096;">132</span>    mode: <span style="color: #c3e88d;">"RESEARCH"</span>,
<span style="color: #718096;">133</span>    goalId: goal.id,
<span style="color: #718096;">134</span>    repositoryIds: data.repositoryIds,
<span style="color: #718096;">135</span>    implementFromTicketId: data.implementFromTicketId,
<span style="color: #718096;">136</span>  });</code></pre>
        </div>
      </div>

      <!-- Code Reference D: evaluateGoal Catch Block -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">D. evaluateGoal Catch Block &mdash; Silent transition to PAUSED</span>
          <code style="font-size: 12px; color: #718096;">goal-service.ts lines 676&ndash;691</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #f07178;">676</span>  } <span style="color: #c792ea;">catch</span> (error) {
<span style="color: #718096;">677</span>    <span style="color: #546e7a;">// Graceful degradation: PAUSED (recoverable), not FAILED (terminal)</span>
<span style="color: #718096;">678</span>    console.error(
<span style="color: #718096;">679</span>      <span style="color: #c3e88d;">`[evaluateGoal] Evaluation failed for Goal ${goalId}: ${...}`</span>
<span style="color: #718096;">680</span>    );
<span style="color: #718096;">681</span>    <span style="color: #c792ea;">try</span> {
<span style="color: #f07178;">682</span>      <span style="color: #c792ea;">await</span> prisma.goal.update({
<span style="color: #f07178;">683</span>        where: { id: goalId },
<span style="color: #f07178;">684</span>        data: { status: GoalStatus.PAUSED },  <span style="color: #f07178;">// &lt;-- Silent PAUSED, no error recorded</span>
<span style="color: #718096;">685</span>      });
<span style="color: #718096;">...</span>
<span style="color: #718096;">691</span>  }</code></pre>
        </div>
      </div>

      <!-- Code Reference E: Correct Pattern -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">E. Correct Pattern &mdash; transcript-service.ts</span>
          <code style="font-size: 12px; color: #718096;">transcript-service.ts lines 6, 509&ndash;510</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #718096;">6</span>   <span style="color: #c792ea;">import</span> { createTicketForOrganization, <span style="color: #c6f6d5;">startQueuedRunForTicketInOrganization</span> } <span style="color: #c792ea;">from</span> <span style="color: #c3e88d;">"./ticket-service.js"</span>;
<span style="color: #718096;">...</span>
<span style="color: #718096;">509</span>  <span style="color: #546e7a;">// Transcript-created tickets have no attachments, so start the run immediately</span>
<span style="color: #c6f6d5;">510</span>  <span style="color: #c792ea;">await</span> <span style="color: #c6f6d5;">startQueuedRunForTicketInOrganization</span>(created.ticket.id, input.organizationId);</code></pre>
        </div>
      </div>

      <!-- Code Reference F: resumeGoal Fire-and-Forget -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">F. resumeGoal &mdash; Fire-and-Forget Pattern</span>
          <code style="font-size: 12px; color: #718096;">goal-service.ts lines 807&ndash;834</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #718096;">807</span>  <span style="color: #c792ea;">export const</span> resumeGoal = <span style="color: #c792ea;">async</span> (goalId, organizationId) => {
<span style="color: #718096;">...</span>
<span style="color: #718096;">824</span>    <span style="color: #c792ea;">await</span> prisma.goal.update({
<span style="color: #718096;">825</span>      where: { id: goal.id },
<span style="color: #718096;">826</span>      data: { status: GoalStatus.EVALUATING },
<span style="color: #718096;">827</span>    });
<span style="color: #718096;">828</span>
<span style="color: #f07178;">829</span>    <span style="color: #c792ea;">void</span> evaluateGoal(goalId).catch((err) => {  <span style="color: #f07178;">// &lt;-- Fire-and-forget; HTTP returns before this completes</span>
<span style="color: #718096;">830</span>      console.error(<span style="color: #c3e88d;">`[resumeGoal] evaluateGoal failed...`</span>);
<span style="color: #718096;">831</span>    });
<span style="color: #718096;">832</span>  };</code></pre>
        </div>
      </div>

      <!-- Code Reference G: Decider Failure Pattern (reference for Fix 2) -->
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 14px; color: #2d3748;">G. Existing Error Pattern &mdash; Decider Failure (reference for Fix 2)</span>
          <code style="font-size: 12px; color: #718096;">goal-service.ts lines 588&ndash;603</code>
        </div>
        <div style="background: #1a1a2e; padding: 16px 20px; overflow-x: auto;">
          <pre style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;"><code><span style="color: #718096;">588</span>    } <span style="color: #c792ea;">catch</span> (deciderErr) {
<span style="color: #718096;">589</span>      <span style="color: #546e7a;">// Store partial GoalEvaluation preserving Assessor work</span>
<span style="color: #718096;">590</span>      <span style="color: #c792ea;">const</span> errorMsg = deciderErr <span style="color: #c792ea;">instanceof</span> Error ? deciderErr.message : String(deciderErr);
<span style="color: #718096;">591</span>
<span style="color: #c6f6d5;">592</span>      <span style="color: #c792ea;">await</span> prisma.goalEvaluation.create({
<span style="color: #718096;">593</span>        data: {
<span style="color: #718096;">594</span>          goalId,
<span style="color: #718096;">595</span>          triggerTicketId,
<span style="color: #718096;">596</span>          assessmentArtifact: JSON.parse(JSON.stringify(assessmentArtifact)),
<span style="color: #718096;">597</span>          deciderOutput: JSON.parse(JSON.stringify({ error: errorMsg })),
<span style="color: #c6f6d5;">598</span>          verdict: <span style="color: #c3e88d;">"error"</span>,  <span style="color: #546e7a;">// &lt;-- Existing pattern: verdict='error' with error details</span>
<span style="color: #718096;">599</span>        },
<span style="color: #718096;">600</span>      });
<span style="color: #718096;">601</span>
<span style="color: #718096;">603</span>      <span style="color: #c792ea;">throw</span> deciderErr; <span style="color: #546e7a;">// Re-throw for outer catch</span>
<span style="color: #718096;">604</span>    }</code></pre>
        </div>
      </div>
    </section>

    <!-- Data Sources & Methodology -->
    <section style="margin-bottom: 48px;">
      <h2 id="data-sources-and-methodology" style="font-size: 24px; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">Data Sources &amp; Methodology</h2>

      <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px 12px; background: #edf2f7; border-bottom: 2px solid #e2e8f0;">Source</th>
              <th style="text-align: left; padding: 8px 12px; background: #edf2f7; border-bottom: 2px solid #e2e8f0;">Method</th>
              <th style="text-align: left; padding: 8px 12px; background: #edf2f7; border-bottom: 2px solid #e2e8f0;">Coverage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Source code</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Direct file read with line-number verification</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">goal-service.ts (full file), ticket-service.ts (key functions), transcript-service.ts (imports + line 510), create-ticket.tsx (lines 198-207), goal-schemas.ts, orchestrator.ts (resolveGoalParent calls)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Production database</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Runtime inspection SQL queries via hlx CLI</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Ticket table (accessible), SandboxRun table (accessible), Goal table (permission denied), GoalEvaluation table (permission denied)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Production logs</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">BetterStack ClickHouse queries via hlx CLI</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Multiple query patterns: 'goal', 'Goal', 'evaluateGoal', 'PAUSED', specific goal IDs &mdash; all returned empty</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">Workflow artifacts</td>
              <td style="padding: 8px 12px;">Read prior scout, diagnosis, product, and tech-research artifacts</td>
              <td style="padding: 8px 12px;">All artifacts from helix-global-server and helix-global-client run roots</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Footer -->
    <footer style="border-top: 2px solid #e2e8f0; padding-top: 24px; margin-top: 48px;">
      <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">
        RSH-626 &mdash; Goal Autonomous Lifecycle Bug Research Report &mdash; Generated May 29, 2026 &mdash; Helix Research
      </p>
    </footer>

  </div>
</body>
</html>

## Attachments
- (none)
