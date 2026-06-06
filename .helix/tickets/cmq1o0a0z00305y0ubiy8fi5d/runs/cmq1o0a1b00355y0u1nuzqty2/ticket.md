# Ticket Context

- ticket_id: cmq1o0a0z00305y0ubiy8fi5d
- short_id: RSH-706
- run_id: cmq1o0a1b00355y0u1nuzqty2
- run_branch: helix/research/RSH-706-implement-more-bugs
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Implement: More bugs

## Description
#FIX-699 



Double check all the issues in both reports.



Take a step back, what is the architectural issues here?

How can we fix this in a responsible manner so that we don't have many more edge cases?



Take a step back and let's solve all of them



I don't need a very complicated report.



Just explain the concepts clearly like an expert teacher and outline the solution

## Referenced Tickets

1 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### FIX-699: Says failed but a minute ago said succeeded.
- Mode: FIX | Status: PREVIEW_READY
- Completed runs: 1 (run-1)
- Materialized files: 1 artifacts
- Path: `.helix-refs/FIX-699/`
- Manifest: `.helix-refs/FIX-699/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Run Lifecycle Bug Analysis — RSH-705</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#1a1a2e; background:#f8f9fa; line-height:1.6;">

<!-- ====================================================================== -->
<!-- HEADER -->
<!-- ====================================================================== -->
<header style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); color:#fff; padding:48px 24px 40px;">
  <div style="max-width:960px; margin:0 auto;">
    <p style="margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:2px; color:#e94560;">Research Report</p>
    <h1 id="run-lifecycle-bug-analysis" style="margin:0 0 12px; font-size:32px; font-weight:700; line-height:1.2;">Run Lifecycle Bug Analysis</h1>
    <p style="margin:0 0 24px; font-size:18px; color:#c4c4d4;">Two production bugs in the Helix staging merge pipeline and ticket status management</p>
    <div style="display:flex; flex-wrap:wrap; gap:16px; font-size:14px;">
      <span style="background:rgba(233,69,96,0.15); border:1px solid rgba(233,69,96,0.3); border-radius:6px; padding:4px 12px;">RSH-705</span>
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:4px 12px;">References: FIX-699</span>
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:4px 12px;">June 6, 2026</span>
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:4px 12px;">Repos: helix-global-server, helix-global-client</span>
    </div>
  </div>
</header>

<main style="max-width:960px; margin:0 auto; padding:32px 24px 64px;">

<!-- ====================================================================== -->
<!-- TABLE OF CONTENTS -->
<!-- ====================================================================== -->
<nav style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px 28px; margin-bottom:36px;">
  <h2 id="table-of-contents" style="margin:0 0 16px; font-size:16px; text-transform:uppercase; letter-spacing:1px; color:#666;">Table of Contents</h2>
  <ol style="margin:0; padding-left:20px; columns:2; column-gap:32px; font-size:15px;">
    <li style="margin-bottom:6px;"><a href="#executive-summary" style="color:#0f3460; text-decoration:none;">Executive Summary</a></li>
    <li style="margin-bottom:6px;"><a href="#bug-1-no-completed-run-found" style="color:#0f3460; text-decoration:none;">Bug 1: "No Completed Run Found"</a></li>
    <li style="margin-bottom:6px;"><a href="#bug-2-failed-while-running" style="color:#0f3460; text-decoration:none;">Bug 2: "Failed" While Running</a></li>
    <li style="margin-bottom:6px;"><a href="#cross-cutting-pattern-analysis" style="color:#0f3460; text-decoration:none;">Cross-Cutting Pattern Analysis</a></li>
    <li style="margin-bottom:6px;"><a href="#impact-assessment" style="color:#0f3460; text-decoration:none;">Impact Assessment</a></li>
    <li style="margin-bottom:6px;"><a href="#recommended-fixes" style="color:#0f3460; text-decoration:none;">Recommended Fixes</a></li>
    <li style="margin-bottom:6px;"><a href="#future-considerations" style="color:#0f3460; text-decoration:none;">Future Considerations</a></li>
    <li style="margin-bottom:6px;"><a href="#evidence-appendix" style="color:#0f3460; text-decoration:none;">Evidence Appendix</a></li>
    <li style="margin-bottom:6px;"><a href="#data-sources-and-methodology" style="color:#0f3460; text-decoration:none;">Data Sources &amp; Methodology</a></li>
  </ol>
</nav>

<!-- ====================================================================== -->
<!-- 1. EXECUTIVE SUMMARY -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="executive-summary" style="font-size:24px; border-bottom:3px solid #e94560; padding-bottom:8px; margin-bottom:20px;">1. Executive Summary</h2>

  <div style="background:#fff; border-left:4px solid #e94560; border-radius:0 10px 10px 0; padding:20px 24px; margin-bottom:20px;">
    <p style="margin:0 0 12px; font-size:15px;">Two distinct production bugs in the Helix platform's run lifecycle management are causing user confusion and requiring manual intervention. Both bugs stem from a common architectural gap: the server-side run lifecycle logic was designed for single-run tickets but does not correctly handle multi-run scenarios (reruns, conflict resolution runs, continuation runs).</p>
    <p style="margin:0; font-size:15px;"><strong>Bug 1</strong> causes a permanent staging merge failure ("No completed run found for this ticket") when a ticket is approved while its latest run is in a non-terminal status like NEEDS_CREDENTIALS. <strong>Bug 2</strong> causes the ticket status badge to display "Failed" while a newer run is actively running, because the failing run's completion handler unconditionally overwrites the ticket status.</p>
  </div>

  <!-- Impact summary cards -->
  <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
    <div style="flex:1; min-width:200px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#e94560;">67</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Total Staging Queue Items</div>
    </div>
    <div style="flex:1; min-width:200px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#f0a500;">354</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Multi-Run Tickets</div>
    </div>
    <div style="flex:1; min-width:200px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#0f3460;">800</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Total Tickets</div>
    </div>
    <div style="flex:1; min-width:200px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#27ae60;">0</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Active PERMANENT Failures</div>
    </div>
  </div>

  <div style="background:#eaf7ea; border:1px solid #27ae60; border-radius:10px; padding:16px 20px; font-size:14px;">
    <strong style="color:#27ae60;">Status:</strong> Root causes identified. Fix approaches defined. No code changes included in this research report — recommended fixes are specified for a follow-up implementation ticket. Changes would be confined to <strong>helix-global-server</strong> only (3 files, no schema changes).
  </div>
</section>

<!-- ====================================================================== -->
<!-- 2. BUG 1: "NO COMPLETED RUN FOUND" -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="bug-1-no-completed-run-found" style="font-size:24px; border-bottom:3px solid #e94560; padding-bottom:8px; margin-bottom:20px;">2. Bug 1: "No Completed Run Found"</h2>

  <!-- 2a. User Experience -->
  <h3 id="bug-1-user-experience" style="font-size:18px; color:#0f3460; margin-bottom:12px;">2a. User Experience</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px;">The user (Nate) reported: <em>"No run found." Well clearly there was a second run that disappeared. We saw it ready. I approved it and then the run somehow disappeared.</em></p>
    <p style="margin:0 0 16px;">On the ticket detail page (Screenshot 1), the <strong>Merge &amp; Deploy</strong> section shows:</p>
    <ul style="margin:0 0 16px; padding-left:20px;">
      <li>Both repos (helix-global-client, helix-global-server) marked <span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:13px; font-weight:600;">Mergeable</span> with PRs opened</li>
      <li>A red <span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:13px; font-weight:600;">Merge failed</span> badge</li>
      <li>Error message in red: <em>"No completed run found for this ticket."</em></li>
      <li>Note: <em>"This error may require investigation."</em></li>
      <li><em>Retried 1 time</em> with a <span style="background:#009688; color:#fff; padding:4px 12px; border-radius:6px; font-size:13px;">Re-queue for Staging</span> button</li>
    </ul>
    <p style="margin:0; font-size:14px; color:#666;">Screenshot reference: <code>Screenshot_20260605_200929_Chrome.jpg</code> — captured at 20:09 local time (BLD-700 ticket detail, Details &amp; Artifacts tab)</p>
  </div>

  <!-- 2b. Technical Flow Diagram -->
  <h3 id="bug-1-technical-flow" style="font-size:18px; color:#0f3460; margin-bottom:12px;">2b. Technical Flow</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px; margin-bottom:24px; overflow-x:auto;">
    <div style="font-family:'Courier New',monospace; font-size:13px; line-height:1.8; white-space:pre; color:#333;">
<span style="color:#0f3460; font-weight:700;">Step 1: Approval</span>
  User approves ticket BLD-700
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 2: Auto-Enqueue</span>  <span style="color:#e94560;">[BUG: No status filter]</span>
  approval-controller.ts:67-71
  findFirst({ ticketId, orderBy: createdAt desc })
  --> Returns Run 1 (NEEDS_CREDENTIALS) <span style="color:#e94560;">// any status accepted!</span>
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 3: Enqueue Validation</span>  <span style="color:#e94560;">[BUG: No run status check]</span>
  staging-queue-service.ts:40-136
  Checks: ticket exists <span style="color:#27ae60;">YES</span>, run exists <span style="color:#27ae60;">YES</span>, duplicate <span style="color:#27ae60;">NO</span>
  Does NOT check: run.status is terminal-success
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 4: Queue Processing</span>
  staging-queue-processor.ts:112-121
  findLatestTerminalRun({ status IN (SUCCEEDED, MERGED, UNVERIFIED) })
  --> Returns NULL (no qualifying run exists)
      |
      v
<span style="color:#e94560; font-weight:700;">Step 5: PERMANENT Failure</span>
  staging-queue-processor.ts:167-171
  Sets failureType = "PERMANENT"
  errorMessage = "No completed run found for this ticket."
  --> Requires manual "Re-queue for Staging"
    </div>
  </div>

  <!-- 2c. Production Timeline -->
  <h3 id="bug-1-production-timeline" style="font-size:18px; color:#0f3460; margin-bottom:12px;">2c. Production Timeline (BLD-700)</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px; overflow-x:auto;">
    <p style="margin:0 0 4px; font-size:13px; color:#888;">Ticket: BLD-700 | ID: <code>cmq1bwxah003v2u0ukh1lqcrc</code> | Current status: <span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">DEPLOYED</span></p>
    <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:12px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd; white-space:nowrap;">Timestamp (UTC)</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Event</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Entity</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 19:40:28</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 created</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1bwxaw</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 21:26:58</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 finished</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1bwxaw</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px;">NEEDS_CREDENTIALS</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">~22:40</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="color:#e94560; font-weight:600;">User approves ticket; auto-enqueue fires</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Queue item</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">~22:40</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="color:#e94560; font-weight:600;">Queue processor: no terminal run found</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Queue item</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:12px;">PERMANENT FAILURE</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 22:44:58</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 created (continuation)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1ii6mn</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:20:03</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 finished</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1ii6mn</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">SUCCEEDED</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">~23:20+</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Manual re-queue (retryCount=2)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Queue item</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#e8f5e9;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-06 00:03:53</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 3 (merge run) completed</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1kxepn</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">MERGED</span></td>
        </tr>
      </tbody>
    </table>
    <p style="margin:12px 0 0; font-size:13px; color:#888;">Source: Production database query on 2026-06-06. The staging queue item record for this ticket has been cleaned up after successful merge (no longer present in DB), but the run timeline and scout-captured queue item data confirm the sequence.</p>
  </div>

  <!-- 2d. Root Cause -->
  <h3 id="bug-1-root-cause" style="font-size:18px; color:#0f3460; margin-bottom:12px;">2d. Root Cause</h3>
  <div style="background:#fff4f4; border:1px solid #e94560; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-weight:600; color:#c62828;">Two validation gaps in the approval-to-staging pipeline:</p>
    <ol style="margin:0; padding-left:20px;">
      <li style="margin-bottom:12px;">
        <strong>Gap 1 — approval-controller.ts:67-71:</strong> The <code>findFirst</code> query fetches the latest run by <code>createdAt desc</code> with <strong>no status filter</strong>. Any run — including NEEDS_CREDENTIALS, FAILED, or INTERRUPTED — can be selected and passed to <code>enqueueForStaging</code>.
      </li>
      <li style="margin-bottom:0;">
        <strong>Gap 2 — staging-queue-service.ts:63-132:</strong> The <code>enqueueForStaging</code> function validates ticket existence, run existence, duplicate queue items, and peer approval — but does <strong>not validate that the run is in a terminal-success status</strong> (SUCCEEDED, MERGED, or UNVERIFIED).
      </li>
    </ol>
  </div>

  <!-- 2e. Code Evidence -->
  <h3 id="bug-1-code-evidence" style="font-size:18px; color:#0f3460; margin-bottom:12px;">2e. Code Evidence</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">approval-controller.ts:67-71 — No status filter on run query</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 20px;"><code>const latestRun = await prisma.sandboxRun.findFirst({
  where: { ticketId: result.approvalRequest.ticketId },
  orderBy: { createdAt: "desc" },
  select: { id: true },  <span style="color:#e94560;">// no status filter — accepts ANY run status</span>
});</code></pre>

    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">staging-queue-service.ts:74-79 — Run fetch without status selection or check</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 20px;"><code>const run = await tx.sandboxRun.findFirst({
  where: { id: runId, ticketId },
  select: { id: true },  <span style="color:#e94560;">// does not select status, no status validation</span>
});</code></pre>

    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">staging-queue-processor.ts:19-23, 112-121 — Correct terminal status filter (works as intended)</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0;"><code>const TERMINAL_SUCCESS_STATUSES: ReadonlySet&lt;string&gt; = new Set([
  SandboxRunStatus.SUCCEEDED,
  SandboxRunStatus.MERGED,
  SandboxRunStatus.UNVERIFIED,
]);

async function findLatestTerminalRun(ticketId: string) {
  return prisma.sandboxRun.findFirst({
    where: {
      ticketId,
      status: { in: [SandboxRunStatus.SUCCEEDED, SandboxRunStatus.MERGED,
                      SandboxRunStatus.UNVERIFIED] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
}</code></pre>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 3. BUG 2: "FAILED" WHILE RUNNING -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="bug-2-failed-while-running" style="font-size:24px; border-bottom:3px solid #f0a500; padding-bottom:8px; margin-bottom:20px;">3. Bug 2: "Failed" While Running</h2>

  <!-- 3a. User Experience -->
  <h3 id="bug-2-user-experience" style="font-size:18px; color:#0f3460; margin-bottom:12px;">3a. User Experience</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px;">Nate reported: <em>"Look at this other one where it shows failed but I see there's another run happening while we speak."</em></p>
    <p style="margin:0 0 16px;">On the ticket detail page (Screenshot 2), the user sees contradictory information:</p>
    <ul style="margin:0 0 16px; padding-left:20px;">
      <li>Ticket header shows <strong>BLD-679</strong> "Playbook UI polish and flair"</li>
      <li>Status badge at top: <span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:13px; font-weight:600;">Failed</span></li>
      <li>Pipeline section shows <span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:13px;">Queued</span> (completed) and <span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:13px;">Running</span> (active spinner)</li>
      <li><em>"2 runs"</em> and <em>"3 repositories"</em> shown</li>
    </ul>
    <p style="margin:0; font-size:14px; color:#666;">Screenshot reference: <code>Screenshot_20260605_200838_Chrome.jpg</code> — captured at 20:08 local time (BLD-679 ticket detail page)</p>
  </div>

  <!-- 3b. Technical Flow -->
  <h3 id="bug-2-technical-flow" style="font-size:18px; color:#0f3460; margin-bottom:12px;">3b. Technical Flow</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px; margin-bottom:24px; overflow-x:auto;">
    <div style="font-family:'Courier New',monospace; font-size:13px; line-height:1.8; white-space:pre; color:#333;">
<span style="color:#0f3460; font-weight:700;">Step 1: Run N fails</span>
  Run 3 (conflict resolution) completes with FAILED status
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 2: markRunFailed fires</span>  <span style="color:#e94560;">[BUG: Unconditional overwrite]</span>
  run-store.ts:323-339
  prisma.$transaction([
    sandboxRun.update({ status: "FAILED" }),
    ticket.update({ status: "FAILED" })  <span style="color:#e94560;">// no check for other runs!</span>
  ])
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 3: Newer run already active</span>
  Run 4 (rerun) is already RUNNING since 23:45 UTC
  But ticket.status was just overwritten to FAILED
      |
      v
<span style="color:#e94560; font-weight:700;">Step 4: Stale display</span>
  Client shows ticket.status = FAILED (badge)
  Pipeline shows currentRun = RUNNING (accurate)
  --> Contradictory display until next data refresh
    </div>
  </div>

  <!-- 3c. Production Timeline -->
  <h3 id="bug-2-production-timeline" style="font-size:18px; color:#0f3460; margin-bottom:12px;">3c. Production Timeline (BLD-679)</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px; overflow-x:auto;">
    <p style="margin:0 0 4px; font-size:13px; color:#888;">Ticket: BLD-679 | ID: <code>cmq0bwger00trk70ucyy82w2v</code> | Current status: <span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">RUNNING</span> (Run 4 still active)</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:12px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd; white-space:nowrap;">Timestamp (UTC)</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Event</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Entity</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 02:52:20</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 created</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq0bwgf3</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 20:50:58</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 finished</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq0bwgf3</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">SUCCEEDED</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 22:52:29</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 created (merge run)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1irux4</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:00:51</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 finished</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1irux4</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">MERGED</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:00:00</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Staging queue item (conflict resolution)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1j1iuz</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:04:35</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 3 created (conflict resolution run)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1j7eo2</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fff4f4;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:14:42</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="color:#e94560; font-weight:600;">Run 3 FAILED &rarr; markRunFailed sets ticket.status = FAILED</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1j7eo2</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:12px;">FAILED</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:14:44</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Queue item marked FAILED (conflict resolution failed)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1j1iuz</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:12px;">CONFLICT_RESOLUTION_FAILED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">2026-06-05 23:45:37</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 4 created (rerun)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code style="font-size:12px;">cmq1ko689</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px;">RUNNING</span></td>
        </tr>
        <tr style="background:#fff8e1;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; white-space:nowrap; font-family:monospace; font-size:13px;">~00:08 local</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="color:#f0a500; font-weight:600;">Screenshot captured: "Failed" badge + "Running" pipeline</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">UI state</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:12px;">FAILED</span> badge shown</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:12px 0 0; font-size:13px; color:#888;">Source: Production database query on 2026-06-06. Ticket status eventually self-corrected to RUNNING (current DB state confirms <code>status = RUNNING</code>). The window of incorrect "Failed" display lasted from Run 3's failure (23:14 UTC) until the client's next data refresh after Run 4 started (23:45 UTC).</p>
  </div>

  <!-- 3d. Root Cause -->
  <h3 id="bug-2-root-cause" style="font-size:18px; color:#0f3460; margin-bottom:12px;">3d. Root Cause</h3>
  <div style="background:#fff4f4; border:1px solid #e94560; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 16px; font-weight:600; color:#c62828;">All five <code>markRun*</code> functions in <code>run-store.ts</code> unconditionally set ticket status based on the completing run, with no awareness of other concurrent runs:</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Function</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Lines</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Sets ticket.status to</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Transaction Type</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#fff4f4;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunFailed</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">323-339</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px; font-size:12px;">FAILED</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Batched</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunSucceeded</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">351-378</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-size:12px;">SANDBOX_READY</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Batched</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunUnverified</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">388-405</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 6px; border-radius:4px; font-size:12px;">UNVERIFIED</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Batched</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunNeedsCredentials</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">415-432</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 6px; border-radius:4px; font-size:12px;">NEEDS_CREDENTIALS</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Batched</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunImpossibleSpec</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">442-459</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px; font-size:12px;">IMPOSSIBLE_SPEC</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Batched</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:16px 0 0; font-size:14px;">All use <strong>batched Prisma transactions</strong> (<code>$transaction([op1, op2])</code>) which execute both operations unconditionally. There is no opportunity to check for concurrent runs between the run status update and the ticket status update.</p>
  </div>

  <!-- 3e. Client-Side Interaction -->
  <h3 id="bug-2-client-side-interaction" style="font-size:18px; color:#0f3460; margin-bottom:12px;">3e. Client-Side Interaction</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px;">The client has a <strong>defensive override mechanism</strong> in <code>format.ts:63-80</code> that partially compensates for this server-side bug:</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 16px;"><code>const ACTIVE_RUN_STATUSES = new Set(["QUEUED", "MERGING", "RUNNING", "VERIFYING"]);

function getDisplayEffectiveTicketStatus(ticket, latestRunStatus) {
  <span style="color:#98c379;">// If the latest run is active, show run status instead of ticket status</span>
  if (latestRunStatus && ACTIVE_RUN_STATUSES.has(latestRunStatus)) {
    return latestRunStatus;  <span style="color:#98c379;">// Override stale ticket.status</span>
  }
  <span style="color:#98c379;">// Secondary fallback for ticket.status=FAILED + displayStatus=RUNNING</span>
  if (ticket.status === "FAILED" && displayStatus === "RUNNING") {
    return displayStatus;
  }
  ...
}</code></pre>
    <p style="margin:0 0 8px; font-weight:600;">Why the override may not trigger:</p>
    <ul style="margin:0; padding-left:20px;">
      <li><strong>Server-side race:</strong> <code>markRunFailed</code> sets <code>ticket.status = FAILED</code> atomically. If the client hasn't re-fetched since the new run started, <code>currentRun</code> still points to the failed run.</li>
      <li><strong>No real-time push:</strong> The client relies on polling or manual refetch. Between the failure and the next poll, the UI shows stale status.</li>
      <li><strong>Ticket list vs. detail:</strong> The ticket list view may use a different query/response shape that doesn't include <code>currentRun.status</code>, so the override may not apply there.</li>
    </ul>
  </div>

  <!-- 3f. Code Evidence -->
  <h3 id="bug-2-code-evidence" style="font-size:18px; color:#0f3460; margin-bottom:12px;">3f. Code Evidence</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">run-store.ts:323-339 — markRunFailed unconditional ticket.status overwrite</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0;"><code>await prisma.$transaction([
  prisma.sandboxRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      errorMessage: truncate(errorMessage, 2000),
      finishedAt: new Date(),
      ...(effectiveSummary ? { runSummary: effectiveSummary } : {}),
    },
  }),
  prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "FAILED",  <span style="color:#e94560;">// Unconditional! No check for other active runs</span>
    },
  }),
]);</code></pre>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 4. CROSS-CUTTING PATTERN ANALYSIS -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="cross-cutting-pattern-analysis" style="font-size:24px; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">4. Cross-Cutting Pattern Analysis</h2>

  <!-- 4a. The Unconditional Pattern -->
  <h3 id="the-unconditional-ticket-status-update-pattern" style="font-size:18px; color:#0f3460; margin-bottom:12px;">4a. The Unconditional Ticket Status Update Pattern</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px;">All five <code>markRun*</code> functions follow the identical pattern:</p>
    <ol style="margin:0 0 16px; padding-left:20px;">
      <li>Update the <code>SandboxRun</code> record with a terminal status</li>
      <li>Update the <code>Ticket</code> record with a corresponding status</li>
      <li>Both in a single batched Prisma transaction</li>
    </ol>
    <p style="margin:0 0 12px;">This pattern implicitly assumes each ticket has exactly one active run. When a ticket has multiple runs (reruns, conflict resolution runs, continuations), the last run to complete "wins" the ticket status — regardless of whether a newer run has already started.</p>
    <div style="background:#fff8e1; border:1px solid #f0a500; border-radius:8px; padding:12px 16px; font-size:14px;">
      <strong style="color:#e65100;">Core issue:</strong> The run lifecycle was designed for a single-run-per-ticket model. As multi-run scenarios became common (44% of tickets have more than one run — 354 of 800 total tickets), this assumption became a class of bugs rather than a theoretical edge case.
    </div>
  </div>

  <!-- 4b. Relationship to FIX-699 -->
  <h3 id="relationship-to-fix-699" style="font-size:18px; color:#0f3460; margin-bottom:12px;">4b. Relationship to FIX-699</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px;">FIX-699 (<em>"Says failed but a minute ago said succeeded"</em>) addressed a related but distinct manifestation of multi-run lifecycle gaps:</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Aspect</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">FIX-699</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">RSH-705 (This Report)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Reported symptom</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Ticket showed "failed" after showing "succeeded"</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Two bugs: "No run found" + "Failed while running"</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Root cause</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Missing WAITING guard for ticket dependency chains</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Missing run status validation at enqueue + unconditional ticket status overwrite</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Fix applied</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">WAITING guard in <code>ticket-service.ts</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Not yet applied (this is a research report)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">File changed</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>ticket-service.ts</code> only</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Recommended: <code>run-store.ts</code>, <code>approval-controller.ts</code>, <code>staging-queue-service.ts</code></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Shared pattern</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;" colspan="2">Both are manifestations of the broader multi-run lifecycle awareness gap — the server doesn't account for multiple concurrent runs when updating ticket status.</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:12px 0 0; font-size:14px;">FIX-699's WAITING guard (verified passing with 352 tests, all 7 scenarios confirmed) does <strong>not</strong> address the unconditional ticket status update pattern (Bug 2 in this report) or the missing run status validation at enqueue time (Bug 1).</p>
  </div>

  <!-- 4c. Multi-run lifecycle gaps -->
  <h3 id="multi-run-ticket-lifecycle-gaps" style="font-size:18px; color:#0f3460; margin-bottom:12px;">4c. Multi-Run Ticket Lifecycle Gaps as a Class of Bugs</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px;">These bugs are not isolated incidents — they represent a <strong>class of failures</strong> that occur whenever:</p>
    <ul style="margin:0 0 16px; padding-left:20px;">
      <li>A ticket transitions through multiple runs (44% of tickets in production)</li>
      <li>An older run completes (succeeds or fails) while a newer run is in progress</li>
      <li>The system references a specific run without validating its current state</li>
    </ul>
    <p style="margin:0;">As the platform grows and multi-run scenarios become more common (conflict resolution, manual reruns, credential-retry continuations), this class of bugs will increase in frequency unless the underlying single-run assumption is addressed.</p>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 5. IMPACT ASSESSMENT -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="impact-assessment" style="font-size:24px; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">5. Impact Assessment</h2>

  <!-- 5a. Frequency -->
  <h3 id="frequency" style="font-size:18px; color:#0f3460; margin-bottom:12px;">5a. Frequency</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Metric</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Value</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Source</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Total staging queue items</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">67</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (2026-06-06)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Successfully merged</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">66</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Currently failed</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">1 (CONFLICT_RESOLUTION_FAILED)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Active PERMANENT failures</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">0 (BLD-700 was resolved via manual retry)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Total tickets</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">800</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Tickets with multiple runs</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">354 (44%)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 5b. Severity -->
  <h3 id="severity" style="font-size:18px; color:#0f3460; margin-bottom:12px;">5b. Severity</h3>
  <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
    <div style="flex:1; min-width:260px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="background:#ffebee; color:#c62828; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">HIGH</span>
        <span style="font-weight:600;">Bug 1</span>
      </div>
      <ul style="margin:0; padding-left:18px; font-size:14px;">
        <li>PERMANENT failure blocks merge pipeline entirely</li>
        <li>Requires manual admin intervention (Re-queue button)</li>
        <li>User confusion: approved ticket appears stuck</li>
        <li>Low frequency but high impact per occurrence</li>
      </ul>
    </div>
    <div style="flex:1; min-width:260px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="background:#fff3e0; color:#e65100; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">MEDIUM</span>
        <span style="font-weight:600;">Bug 2</span>
      </div>
      <ul style="margin:0; padding-left:18px; font-size:14px;">
        <li>Self-corrects after client re-fetches data</li>
        <li>No manual intervention needed</li>
        <li>Erodes user trust in status reporting</li>
        <li>Potentially higher frequency (44% of tickets are multi-run)</li>
      </ul>
    </div>
  </div>

  <!-- 5c. Affected Roles -->
  <h3 id="affected-user-roles" style="font-size:18px; color:#0f3460; margin-bottom:12px;">5c. Affected User Roles</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Role</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Bug 1 Impact</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Bug 2 Impact</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Approvers</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Approve ticket expecting auto-merge; see permanent failure instead</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Not directly affected</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Ticket owners</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Must manually re-queue after run completes</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">See "Failed" badge while run is active; confusion and lost trust</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Platform admins</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Must investigate PERMANENT failures; manual queue management</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Receive support inquiries about status discrepancies</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 6. RECOMMENDED FIXES -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="recommended-fixes" style="font-size:24px; border-bottom:3px solid #27ae60; padding-bottom:8px; margin-bottom:20px;">6. Recommended Fixes</h2>

  <!-- 6a. Bug 1 fix -->
  <h3 id="bug-1-fix-defense-in-depth" style="font-size:18px; color:#0f3460; margin-bottom:12px;">6a. Bug 1 Fix: Defense-in-Depth Run Status Validation</h3>
  <div style="background:#eaf7ea; border:1px solid #27ae60; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-weight:600; color:#2e7d32;">Strategy: Validate at two levels — source (approval controller) and boundary (enqueue service).</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
      <thead>
        <tr style="background:rgba(39,174,96,0.1);">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #c8e6c9;">Location</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #c8e6c9;">Change</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #c8e6c9;">Behavior</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e8f5e9;"><code>approval-controller.ts:68</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8f5e9;">Add <code>status: { in: ['SUCCEEDED', 'MERGED', 'UNVERIFIED'] }</code> to findFirst where clause</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8f5e9;">If no terminal-success run exists, skip enqueue silently. Approval itself still succeeds.</td>
        </tr>
        <tr style="background:rgba(39,174,96,0.05);">
          <td style="padding:10px 12px; border-bottom:1px solid #e8f5e9;"><code>staging-queue-service.ts:74-79</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8f5e9;">Select <code>status</code> in run query; throw <code>HttpError(422)</code> if run status not in terminal-success set</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8f5e9;">Protects all callers including the client "Re-queue for Staging" button.</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0; font-size:14px; color:#2e7d32;"><strong>Why both:</strong> The approval controller is the most common path (prevents bad input at source). The enqueue service is the trust boundary (protects against any caller passing a non-terminal run).</p>
  </div>

  <!-- 6b. Bug 2 fix -->
  <h3 id="bug-2-fix-newer-active-run-guard" style="font-size:18px; color:#0f3460; margin-bottom:12px;">6b. Bug 2 Fix: Shared <code>hasOtherActiveRun</code> Guard</h3>
  <div style="background:#eaf7ea; border:1px solid #27ae60; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-weight:600; color:#2e7d32;">Strategy: Guard all five markRun* functions with a shared helper that checks for concurrent active runs.</p>
    <p style="margin:0 0 12px;">New shared helper:</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 16px;"><code><span style="color:#c678dd;">const</span> ACTIVE_RUN_STATUSES = [<span style="color:#98c379;">"QUEUED"</span>, <span style="color:#98c379;">"MERGING"</span>, <span style="color:#98c379;">"RUNNING"</span>, <span style="color:#98c379;">"VERIFYING"</span>];

<span style="color:#c678dd;">async function</span> <span style="color:#61afef;">hasOtherActiveRun</span>(tx, ticketId, excludeRunId): <span style="color:#c678dd;">Promise</span>&lt;<span style="color:#e5c07b;">boolean</span>&gt; {
  <span style="color:#c678dd;">const</span> activeRun = <span style="color:#c678dd;">await</span> tx.sandboxRun.findFirst({
    where: {
      ticketId,
      id: { not: excludeRunId },
      status: { in: ACTIVE_RUN_STATUSES },
    },
    select: { id: <span style="color:#d19a66;">true</span> },
  });
  <span style="color:#c678dd;">return</span> activeRun !== <span style="color:#d19a66;">null</span>;
}</code></pre>
    <p style="margin:0 0 12px;">Each <code>markRun*</code> function would be converted from batched to interactive Prisma transactions:</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 16px;"><code><span style="color:#c678dd;">await</span> prisma.<span style="color:#61afef;">$transaction</span>(<span style="color:#c678dd;">async</span> (tx) =&gt; {
  <span style="color:#c678dd;">await</span> tx.sandboxRun.update({ ... });  <span style="color:#98c379;">// Always update the run</span>

  <span style="color:#c678dd;">const</span> otherActive = <span style="color:#c678dd;">await</span> hasOtherActiveRun(tx, ticketId, runId);
  <span style="color:#c678dd;">if</span> (!otherActive) {
    <span style="color:#c678dd;">await</span> tx.ticket.update({ status: <span style="color:#98c379;">"FAILED"</span> });  <span style="color:#98c379;">// Conditional!</span>
  }
});</code></pre>
    <p style="margin:0; font-size:14px; color:#2e7d32;"><strong>Active statuses</strong> (QUEUED, MERGING, RUNNING, VERIFYING) align with the client's <code>ACTIVE_RUN_STATUSES</code> in <code>format.ts:63</code>, ensuring server and client agree on what constitutes an "active" run.</p>
  </div>

  <!-- 6c. Scope -->
  <h3 id="fix-scope" style="font-size:18px; color:#0f3460; margin-bottom:12px;">6c. Scope</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Aspect</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Detail</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Repository</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><strong>helix-global-server only</strong></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Files changed</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>run-store.ts</code>, <code>approval-controller.ts</code>, <code>staging-queue-service.ts</code></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Files unchanged</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>staging-queue-processor.ts</code> (already correct), all client files</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Schema changes</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">None</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">New dependencies</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">None</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 6d. Risk Assessment -->
  <h3 id="risk-assessment" style="font-size:18px; color:#0f3460; margin-bottom:12px;">6d. Risk Assessment</h3>
  <div style="background:#eaf7ea; border:1px solid #27ae60; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <span style="background:#e8f5e9; color:#2e7d32; padding:4px 12px; border-radius:6px; font-size:13px; font-weight:700;">LOW RISK</span>
    </div>
    <ul style="margin:0; padding-left:20px; font-size:14px;">
      <li><strong>Additive guards only:</strong> No existing behavior is removed. Single-run tickets follow the same code path (the guard check finds no other active runs and proceeds normally).</li>
      <li><strong>No schema changes:</strong> Uses existing status enums and models.</li>
      <li><strong>Server-side only:</strong> No client deployment coordination needed.</li>
      <li><strong>Performance impact:</strong> Negligible. One additional indexed <code>findFirst</code> query per run completion inside existing transactions. Typical ticket has 1-5 runs.</li>
      <li><strong>Existing test suite:</strong> 352 tests pass (verified in FIX-699). New tests would be additive for the guard logic.</li>
    </ul>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 7. FUTURE CONSIDERATIONS -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="future-considerations" style="font-size:24px; border-bottom:3px solid #666; padding-bottom:8px; margin-bottom:20px;">7. Future Considerations</h2>

  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:16px;">
    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:16px;">
      <span style="background:#e3f2fd; color:#1565c0; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700; white-space:nowrap;">PRIORITY 1</span>
      <div>
        <p style="margin:0 0 4px; font-weight:600;">Unified "Reconcile Ticket Status" Function</p>
        <p style="margin:0; font-size:14px; color:#555;">Replace all per-function ticket status updates with a single reconciliation function that examines <em>all</em> runs for a ticket and derives the correct ticket status. This would be a single source of truth, eliminating the entire class of multi-run status bugs rather than guarding individual functions.</p>
      </div>
    </div>
    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:16px;">
      <span style="background:#e8f5e9; color:#2e7d32; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700; white-space:nowrap;">PRIORITY 2</span>
      <div>
        <p style="margin:0 0 4px; font-weight:600;">Real-Time Status Push</p>
        <p style="margin:0; font-size:14px; color:#555;">Replace client polling with server-push (WebSocket or SSE events) for ticket status changes. This would eliminate the stale-display window entirely, making the client's defensive override unnecessary.</p>
      </div>
    </div>
    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:16px;">
      <span style="background:#fff3e0; color:#e65100; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700; white-space:nowrap;">PRIORITY 3</span>
      <div>
        <p style="margin:0 0 4px; font-weight:600;">Staging Queue Failure Type Improvement</p>
        <p style="margin:0; font-size:14px; color:#555;">Make "no terminal run found" a <strong>retryable</strong> failure (instead of PERMANENT) when runs are still in progress, allowing the queue processor to auto-retry after the run completes. The current fix prevents the bad enqueue from happening, but this change would add resilience for edge cases.</p>
      </div>
    </div>
    <div style="display:flex; gap:12px; align-items:flex-start;">
      <span style="background:#f5f5f5; color:#666; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700; white-space:nowrap;">PRIORITY 4</span>
      <div>
        <p style="margin:0 0 4px; font-weight:600;">Ticket List Status Audit</p>
        <p style="margin:0; font-size:14px; color:#555;">Verify whether the ticket list view uses the same <code>getDisplayEffectiveTicketStatus</code> logic as the detail page. If not, the ticket list may show stale statuses even after the server-side fix. This is unconfirmed and remains an open question.</p>
      </div>
    </div>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 8. EVIDENCE APPENDIX -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="evidence-appendix" style="font-size:24px; border-bottom:3px solid #666; padding-bottom:8px; margin-bottom:20px;">8. Evidence Appendix</h2>

  <!-- A. Screenshot References -->
  <h3 id="appendix-a-screenshot-references" style="font-size:18px; color:#0f3460; margin-bottom:12px;">A. Screenshot References</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Screenshot</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Filename</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Screenshot 1 (Bug 1)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;"><code>Screenshot_20260605_200929_Chrome.jpg</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Ticket BLD-700 "Run Details" dialog, Details &amp; Artifacts tab. Shows Merge &amp; Deploy section with "Merge failed" badge, error "No completed run found for this ticket", "Retried 1 time" counter, and "Re-queue for Staging" button. Both repos show as Mergeable with PRs opened.</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Screenshot 2 (Bug 2)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;"><code>Screenshot_20260605_200838_Chrome.jpg</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Ticket BLD-679 "Playbook UI polish and flair" detail page. Shows red "Failed" badge at top with Pipeline section showing Queued (complete) and Running (active spinner). Notes "2 runs" and "3 repositories". Depends on BLD-678 (Preview ready).</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- B. Production Database Query Results -->
  <h3 id="appendix-b-production-database-query-results" style="font-size:18px; color:#0f3460; margin-bottom:12px;">B. Production Database Query Results</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-size:14px; color:#666;">All queries executed against the helix-global-server production database on 2026-06-06 via Helix Inspect (read-only runtime inspection).</p>

    <p style="margin:16px 0 8px; font-weight:600;">BLD-700 Run Timeline (Ticket <code>cmq1bwxah003v2u0ukh1lqcrc</code>):</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Run ID</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Status</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Created</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Finished</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Parent</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1bwxaw</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:1px 6px; border-radius:3px; font-size:11px;">NEEDS_CREDENTIALS</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 19:40:28</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 21:26:58</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">null</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1ii6mn</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:11px;">SUCCEEDED</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 22:44:58</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:20:03</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">cmq1bwxaw</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1kxepn</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:11px;">MERGED</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:52:48</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-06 00:03:53</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">cmq1ii6mn</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:24px 0 8px; font-weight:600;">BLD-679 Run Timeline (Ticket <code>cmq0bwger00trk70ucyy82w2v</code>):</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Run ID</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Status</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Created</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Finished</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Parent</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq0bwgf3</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:11px;">SUCCEEDED</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 02:52:20</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 20:50:58</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">null</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1irux4</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:11px;">MERGED</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 22:52:29</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:00:51</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">cmq0bwgf3</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1j7eo2</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:1px 6px; border-radius:3px; font-size:11px;">FAILED</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:04:35</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:14:42</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">cmq1irux4</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1ko689</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:1px 6px; border-radius:3px; font-size:11px;">RUNNING</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:45:37</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">null (still active)</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">cmq1j7eo2</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:24px 0 8px; font-weight:600;">BLD-679 Staging Queue Item:</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Status</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Failure Type</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Error Message</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Created</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1j1iuz</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:1px 6px; border-radius:3px; font-size:11px;">FAILED</span></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">CONFLICT_RESOLUTION_FAILED</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Agent-assisted merge failed. Manual resolution required.</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">2026-06-05 23:00:00</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:24px 0 8px; font-weight:600;">Current Ticket Statuses:</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Ticket</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Number</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Mode</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Current Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq1bwxah003v2u0ukh1lqcrc</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">BLD-700</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">BUILD</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:11px;">DEPLOYED</span> (resolved via manual retry)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-family:monospace;">cmq0bwger00trk70ucyy82w2v</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">BLD-679</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">BUILD</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:1px 6px; border-radius:3px; font-size:11px;">RUNNING</span> (Run 4 still active)</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:24px 0 8px; font-weight:600;">Aggregate Staging Queue Statistics:</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Metric</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Total queue items</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">67</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">MERGED</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">66</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">FAILED (CONFLICT_RESOLUTION_FAILED)</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">1</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">PERMANENT failures remaining</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">0</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Total tickets in system</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">800</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Tickets with multiple runs</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">354 (44%)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- C. Code File Index -->
  <h3 id="appendix-c-code-file-index" style="font-size:18px; color:#0f3460; margin-bottom:12px;">C. Code File Index</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">File</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Repo</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Key Lines</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Relevance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>src/controllers/approval-controller.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">server</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">67-71</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Bug 1: No status filter on run query</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>src/services/staging-queue-service.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">server</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">40-136, 74-79</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Bug 1: No run status validation in enqueue</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>src/services/staging-queue-processor.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">server</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">19-23, 112-121, 165-172</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Bug 1: Terminal status filter (correct behavior)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>src/helix-workflow/orchestrator/run-store.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">server</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">290-460</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Bug 2: All markRun* functions with unconditional ticket updates</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>src/services/ticket-service.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">server</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">1071-1189</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Context: createRerunForTicketInOrganization sets QUEUED</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>prisma/schema.prisma</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">server</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">enums</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">SandboxRunStatus, TicketStatus definitions</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>src/lib/format.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">client</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">63-80</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Client defensive override (ACTIVE_RUN_STATUSES)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- D. Prior Ticket Summary -->
  <h3 id="appendix-d-prior-ticket-fix-699-summary" style="font-size:18px; color:#0f3460; margin-bottom:12px;">D. Prior Ticket (FIX-699) Summary</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tbody>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600; width:30%;">Ticket</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">FIX-699: "Says failed but a minute ago said succeeded."</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600;">Status</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">PREVIEW_READY</span> (1 run, SUCCEEDED)</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600;">Problem addressed</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Ticket BLD-680: chain resolution bug where a ticket in a dependency chain showed "failed" after showing "succeeded"</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600;">Fix applied</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Added WAITING guard in <code>ticket-service.ts</code> (function <code>startQueuedRunForTicketInOrganization</code>) to prevent runs from starting on WAITING tickets. Returns HTTP 409 with reason <code>TICKET_WAITING</code>.</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600;">Verification result</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">All 8 CHK checks pass, all 5 TCK checks pass, all 7 SCN scenarios pass. 352 tests pass, 0 failures.</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600;">What FIX-699 did NOT fix</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">The unconditional <code>ticket.status</code> update pattern in <code>markRun*</code> functions (Bug 2 of this report). The missing run status validation at enqueue time (Bug 1 of this report). These are distinct failure modes from the same multi-run lifecycle awareness gap.</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 9. DATA SOURCES & METHODOLOGY -->
<!-- ====================================================================== -->
<section style="margin-bottom:40px;">
  <h2 id="data-sources-and-methodology" style="font-size:24px; border-bottom:3px solid #666; padding-bottom:8px; margin-bottom:20px;">9. Data Sources &amp; Methodology</h2>

  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <h4 style="margin:0 0 12px; font-size:16px;">Investigation Approach</h4>
    <p style="margin:0 0 16px; font-size:14px;">This report was produced through a multi-phase investigation combining static code analysis, production database inspection, and visual evidence review. No code changes were made; this is a read-only research report.</p>

    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Data Source</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Method</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Evidence Produced</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Production Database</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Read-only SQL queries via Helix Inspect runtime inspection</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run timelines, staging queue items, ticket statuses, aggregate statistics</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Source Code (helix-global-server)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Direct file reads with line-level inspection</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Code evidence for root cause analysis, function signatures, transaction patterns</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Source Code (helix-global-client)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Direct file reads</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Client defensive logic analysis, ACTIVE_RUN_STATUSES alignment</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">User Screenshots</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Visual inspection of two attached screenshots</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">User-visible symptoms for both bugs</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Prior Ticket (FIX-699)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Artifact review (manifest, verification report)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Scope boundary between FIX-699 and current bugs</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Scout Analysis</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Multi-repo code exploration with runtime DB probes</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Initial evidence map, file-level relevance, production DB facts</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Diagnosis</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Root cause analysis with evidence table</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Confirmed root causes, fix scope, success criteria</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Tech Research</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Architecture decision analysis, options evaluation</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Recommended fix strategies (defense-in-depth, shared helper)</td>
        </tr>
      </tbody>
    </table>

    <h4 style="margin:24px 0 12px; font-size:16px;">Confidence Levels</h4>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Claim</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Confidence</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Basis</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Bug 1 root cause (missing status filter)</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">Confirmed</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Direct code read + production DB evidence</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Bug 2 root cause (unconditional overwrite)</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">Confirmed</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Direct code read + production DB timeline + screenshot timing</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Bug 2 frequency in production</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px;">Unknown</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Only 1 instance observed; pattern affects 44% of tickets but race condition window is narrow</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Client override effectiveness on ticket list</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px;">Unknown</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Ticket list view may not include currentRun.status in its response shape</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Recommended fixes (risk level)</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">High confidence</span></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">Additive guards only; no behavior removed; tested patterns (interactive transactions) already used in codebase</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ====================================================================== -->
<!-- FOOTER -->
<!-- ====================================================================== -->
<footer style="border-top:2px solid #e0e0e0; padding-top:24px; margin-top:40px; font-size:13px; color:#888;">
  <p style="margin:0 0 8px;">Generated by Helix Research Agent | RSH-705 | June 6, 2026</p>
  <p style="margin:0;">Repositories analyzed: helix-global-server (primary), helix-global-client (context). No code changes produced.</p>
</footer>

</main>
</body>
</html>

## Attachments
- (none)
