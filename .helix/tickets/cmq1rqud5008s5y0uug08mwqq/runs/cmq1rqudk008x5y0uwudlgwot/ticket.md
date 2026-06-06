# Ticket Context

- ticket_id: cmq1rqud5008s5y0uug08mwqq
- short_id: FIX-712
- run_id: cmq1rqudk008x5y0uwudlgwot
- run_branch: helix/fix/FIX-712-missing-run-fix-and-other-bugs
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Missing Run Fix And other bugs

## Description
Build ticket to implement research from RSH-706.

#FIX-699 



Double check all the issues in both reports.



Take a step back, what is the architectural issues here?

How can we fix this in a responsible manner so that we don't have many more edge cases?



Take a step back and let's solve all of them



I don't need a very complicated report.



Just explain the concepts clearly like an expert teacher and outline the solution

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Run Lifecycle Bug Analysis — RSH-706</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#1a1a2e; background:#f8f9fa; line-height:1.6;">

<!-- ====================================================================== -->
<!-- HEADER -->
<!-- ====================================================================== -->
<header style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); color:#fff; padding:48px 24px 40px;">
  <div style="max-width:900px; margin:0 auto;">
    <p style="margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:2px; color:#e94560;">Research Report</p>
    <h1 id="run-lifecycle-bug-analysis" style="margin:0 0 12px; font-size:32px; font-weight:700; line-height:1.2;">Run Lifecycle Bug Analysis</h1>
    <p style="margin:0 0 24px; font-size:18px; color:#c4c4d4;">Two bugs, one root cause, three files to fix</p>
    <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:14px;">
      <span style="background:rgba(233,69,96,0.15); border:1px solid rgba(233,69,96,0.3); border-radius:6px; padding:4px 12px;">RSH-706</span>
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:4px 12px;">References: FIX-699</span>
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:4px 12px;">June 6, 2026</span>
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:4px 12px;">Repo: helix-global-server</span>
    </div>
  </div>
</header>

<main style="max-width:900px; margin:0 auto; padding:32px 24px 64px;">

<!-- ====================================================================== -->
<!-- TABLE OF CONTENTS -->
<!-- ====================================================================== -->
<nav style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px 28px; margin-bottom:36px;">
  <h2 id="contents" style="margin:0 0 14px; font-size:15px; text-transform:uppercase; letter-spacing:1px; color:#666;">Contents</h2>
  <ol style="margin:0; padding-left:20px; columns:2; column-gap:32px; font-size:15px;">
    <li style="margin-bottom:6px;"><a href="#executive-summary" style="color:#0f3460; text-decoration:none;">Executive Summary</a></li>
    <li style="margin-bottom:6px;"><a href="#the-core-problem" style="color:#0f3460; text-decoration:none;">The Core Problem</a></li>
    <li style="margin-bottom:6px;"><a href="#bug-1-no-completed-run-found" style="color:#0f3460; text-decoration:none;">Bug 1: "No Completed Run Found"</a></li>
    <li style="margin-bottom:6px;"><a href="#bug-2-failed-while-running" style="color:#0f3460; text-decoration:none;">Bug 2: "Failed" While Running</a></li>
    <li style="margin-bottom:6px;"><a href="#how-fix-699-relates" style="color:#0f3460; text-decoration:none;">How FIX-699 Relates</a></li>
    <li style="margin-bottom:6px;"><a href="#the-solution" style="color:#0f3460; text-decoration:none;">The Solution</a></li>
    <li style="margin-bottom:6px;"><a href="#impact-and-risk" style="color:#0f3460; text-decoration:none;">Impact &amp; Risk</a></li>
    <li style="margin-bottom:6px;"><a href="#evidence-and-data-sources" style="color:#0f3460; text-decoration:none;">Evidence &amp; Data Sources</a></li>
  </ol>
</nav>

<!-- ====================================================================== -->
<!-- 1. EXECUTIVE SUMMARY -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="executive-summary" style="font-size:24px; border-bottom:3px solid #e94560; padding-bottom:8px; margin-bottom:20px;">1. Executive Summary</h2>

  <div style="background:#fff; border-left:4px solid #e94560; border-radius:0 10px 10px 0; padding:20px 24px; margin-bottom:20px;">
    <p style="margin:0 0 12px; font-size:15px;">Two production bugs are causing user confusion in the Helix staging pipeline. <strong>Bug 1</strong> permanently blocks a staging merge with <em>"No completed run found for this ticket."</em> <strong>Bug 2</strong> displays a <em>"Failed"</em> badge on a ticket while a newer run is actively running.</p>
    <p style="margin:0; font-size:15px;">Both bugs share a single architectural root cause: <strong>the server assumes each ticket has one run, but 42% of tickets have multiple runs.</strong> The fix targets <strong>3 files in helix-global-server</strong> with additive guards only &mdash; no schema changes, no client changes, no new dependencies.</p>
  </div>

  <!-- Key metrics -->
  <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
    <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:16px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#0f3460;">846</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Total Tickets</div>
    </div>
    <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:16px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#f0a500;">354</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Multi-Run Tickets (42%)</div>
    </div>
    <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:16px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#e94560;">3</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Files to Fix</div>
    </div>
    <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:16px; text-align:center;">
      <div style="font-size:28px; font-weight:700; color:#27ae60;">LOW</div>
      <div style="font-size:13px; color:#666; margin-top:4px;">Fix Risk</div>
    </div>
  </div>

  <p style="margin:0; font-size:14px; color:#888;">Data source: Production database via Helix Inspect, queried June 6, 2026.</p>
</section>

<!-- ====================================================================== -->
<!-- 2. THE CORE PROBLEM -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="the-core-problem" style="font-size:24px; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">2. The Core Problem: Single-Run Assumption</h2>

  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px; margin-bottom:24px;">
    <p style="margin:0 0 16px; font-size:15px;">Think of a ticket like a job order, and each run like an attempt to complete that job. Originally, the system was built expecting <strong>one attempt per job</strong>. When the attempt finishes, the system stamps the job with the result: "succeeded," "failed," or "needs credentials."</p>

    <p style="margin:0 0 16px; font-size:15px;">But in practice, jobs often need <strong>multiple attempts</strong>: a rerun after a failure, a continuation after providing credentials, a conflict resolution run after a merge conflict. In production, <strong>42% of all tickets have gone through more than one run</strong> (354 out of 846).</p>

    <div style="background:#fff8e1; border:1px solid #f0a500; border-radius:8px; padding:16px 20px; margin-bottom:16px;">
      <p style="margin:0; font-size:15px;"><strong style="color:#e65100;">The problem:</strong> When multiple attempts exist, the code still acts as if there's only one. It doesn't ask "is another attempt already in progress?" before updating the job status, and it doesn't check "is this attempt actually finished successfully?" before sending it to the merge queue.</p>
    </div>

    <p style="margin:0; font-size:15px;">This single-run assumption creates <strong>two distinct failure modes</strong>, depending on which part of the system encounters the multi-run situation:</p>
  </div>

  <!-- Visual: Two failure paths -->
  <div style="display:flex; flex-wrap:wrap; gap:16px;">
    <div style="flex:1; min-width:280px; background:#fff4f4; border:1px solid #e94560; border-radius:10px; padding:20px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="background:#ffebee; color:#c62828; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">BUG 1</span>
        <span style="font-weight:600; font-size:15px;">The Approval Pipeline</span>
      </div>
      <p style="margin:0; font-size:14px;">When a ticket is approved, the system grabs the latest run <em>regardless of its status</em> and sends it to the merge queue. If that run isn't finished successfully, the queue processor rejects it &mdash; permanently.</p>
    </div>
    <div style="flex:1; min-width:280px; background:#fff8e1; border:1px solid #f0a500; border-radius:10px; padding:20px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="background:#fff3e0; color:#e65100; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">BUG 2</span>
        <span style="font-weight:600; font-size:15px;">The Status Update</span>
      </div>
      <p style="margin:0; font-size:14px;">When any run finishes, it blindly stamps the ticket with its own result. If an older run fails while a newer one is running, the ticket gets stamped "Failed" even though work is actively in progress.</p>
    </div>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 3. BUG 1: "NO COMPLETED RUN FOUND" -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="bug-1-no-completed-run-found" style="font-size:24px; border-bottom:3px solid #e94560; padding-bottom:8px; margin-bottom:20px;">3. Bug 1: "No Completed Run Found"</h2>

  <!-- What the user sees -->
  <h3 id="bug-1-what-the-user-sees" style="font-size:18px; color:#0f3460; margin-bottom:12px;">What the User Sees</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-size:15px;">After approving a ticket, the Merge &amp; Deploy section shows:</p>
    <ul style="margin:0 0 12px; padding-left:20px;">
      <li>A red <span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:13px; font-weight:600;">Merge failed</span> badge</li>
      <li>Error: <em>"No completed run found for this ticket."</em></li>
      <li>A note: <em>"This error may require investigation."</em></li>
      <li>A <span style="background:#009688; color:#fff; padding:2px 8px; border-radius:4px; font-size:13px;">Re-queue for Staging</span> button as the only way forward</li>
    </ul>
    <p style="margin:0; font-size:14px; color:#666;">The user approved the ticket expecting it to merge automatically. Instead, it's stuck and requires manual intervention.</p>
  </div>

  <!-- Why it happens -->
  <h3 id="bug-1-why-it-happens" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Why It Happens (Step by Step)</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px; margin-bottom:24px; overflow-x:auto;">
    <div style="font-family:'Courier New',monospace; font-size:13px; line-height:2; white-space:pre; color:#333;"><span style="color:#0f3460; font-weight:700;">Step 1: Approval</span>
  User approves ticket BLD-700
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 2: Auto-Enqueue</span>  <span style="color:#e94560; font-weight:600;">[GAP: No status filter]</span>
  approval-controller.ts:67-71
  findFirst({ ticketId, orderBy: createdAt desc })
  --&gt; Returns Run 1 (NEEDS_CREDENTIALS) <span style="color:#e94560;">// any status accepted!</span>
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 3: Enqueue</span>  <span style="color:#e94560; font-weight:600;">[GAP: No run status check]</span>
  staging-queue-service.ts:74-79
  Checks: ticket exists? <span style="color:#27ae60;">YES</span>  run exists? <span style="color:#27ae60;">YES</span>  duplicate? <span style="color:#27ae60;">NO</span>
  Does NOT check: is the run actually finished successfully?
      |
      v
<span style="color:#0f3460; font-weight:700;">Step 4: Queue Processor</span>  <span style="color:#27ae60;">[Works correctly]</span>
  staging-queue-processor.ts:112-121
  Looks for a run with SUCCEEDED, MERGED, or UNVERIFIED status
  --&gt; Returns NULL (Run 1 is NEEDS_CREDENTIALS)
      |
      v
<span style="color:#e94560; font-weight:700;">Step 5: PERMANENT Failure</span>
  "No completed run found for this ticket."
  --&gt; Requires manual Re-queue</div>
  </div>

  <!-- Code evidence -->
  <h3 id="bug-1-code-evidence" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Code Evidence</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">

    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">Gap 1 &mdash; approval-controller.ts:67-71</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 20px;"><code>const latestRun = await prisma.sandboxRun.findFirst({
  where: { ticketId: result.approvalRequest.ticketId },
  orderBy: { createdAt: "desc" },
  select: { id: true },  <span style="color:#e94560;">// no status filter &mdash; accepts ANY run status</span>
});</code></pre>

    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">Gap 2 &mdash; staging-queue-service.ts:74-79</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0;"><code>const run = await tx.sandboxRun.findFirst({
  where: { id: runId, ticketId },
  select: { id: true },  <span style="color:#e94560;">// does not select status, no status validation</span>
});
if (!run) {
  throw new HttpError(404, "Run not found for this ticket.");
}
<span style="color:#e94560;">// No check: is run.status in SUCCEEDED/MERGED/UNVERIFIED?</span></code></pre>
  </div>

  <!-- Production example -->
  <h3 id="bug-1-production-example" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Production Example: BLD-700</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:12px; overflow-x:auto;">
    <p style="margin:0 0 12px; font-size:13px; color:#888;">Ticket: BLD-700 | ID: <code>cmq1bwxah003v2u0ukh1lqcrc</code> | Current status: <span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">DEPLOYED</span> (resolved via manual retry)</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Time (UTC)</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Event</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">19:40</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 created</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">21:26</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 finished</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px;">NEEDS_CREDENTIALS</span></td>
        </tr>
        <tr style="background:#fff4f4;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">~22:40</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><strong style="color:#e94560;">User approves ticket &rarr; auto-enqueue grabs Run 1</strong></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:12px;">PERMANENT FAILURE</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">22:44</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 created (continuation)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">23:20</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 finished</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">SUCCEEDED</span></td>
        </tr>
        <tr style="background:#e8f5e9;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">00:03</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Manual re-queue &rarr; Run 3 (merge) completed</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">MERGED</span></td>
        </tr>
      </tbody>
    </table>
    <p style="margin:12px 0 0; font-size:13px; color:#888;">The approval should have waited for a terminal-success run. Instead it grabbed the NEEDS_CREDENTIALS run, which the queue processor correctly rejected.</p>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 4. BUG 2: "FAILED" WHILE RUNNING -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="bug-2-failed-while-running" style="font-size:24px; border-bottom:3px solid #f0a500; padding-bottom:8px; margin-bottom:20px;">4. Bug 2: "Failed" While Running</h2>

  <!-- What the user sees -->
  <h3 id="bug-2-what-the-user-sees" style="font-size:18px; color:#0f3460; margin-bottom:12px;">What the User Sees</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-size:15px;">The ticket detail page shows contradictory information:</p>
    <ul style="margin:0; padding-left:20px;">
      <li>Status badge: <span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:13px; font-weight:600;">Failed</span></li>
      <li>Pipeline section: <span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:13px;">Running</span> (with an active spinner)</li>
    </ul>
    <p style="margin:12px 0 0; font-size:14px; color:#666;">The user sees "Failed" but the pipeline is clearly active. This erodes trust in the status system.</p>
  </div>

  <!-- Why it happens -->
  <h3 id="bug-2-why-it-happens" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Why It Happens</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:24px; margin-bottom:24px;">
    <p style="margin:0 0 16px; font-size:15px;">Every time a run finishes, one of five <code>markRun*</code> functions in <code>run-store.ts</code> fires. Each one does two things in a single database transaction:</p>
    <ol style="margin:0 0 16px; padding-left:20px;">
      <li>Updates the <strong>run</strong> record with its final status (correct)</li>
      <li>Updates the <strong>ticket</strong> record with the same status (problematic)</li>
    </ol>
    <p style="margin:0 0 16px; font-size:15px;">Step 2 is <strong>unconditional</strong> &mdash; it doesn't check whether another run is already in progress. So when an older run fails while a newer run is actively running, the ticket gets stamped "Failed" even though work is still happening.</p>

    <div style="background:#fff8e1; border:1px solid #f0a500; border-radius:8px; padding:14px 18px; font-size:14px;">
      <strong style="color:#e65100;">Think of it this way:</strong> Imagine a factory floor with two workers on the same job. Worker A gives up and stamps the job card "FAILED." But Worker B is still working and making progress. A manager walks by, sees the "FAILED" stamp, and gets confused &mdash; why does it say failed when work is clearly happening?
    </div>
  </div>

  <!-- The five functions -->
  <h3 id="bug-2-the-five-markrun-functions" style="font-size:18px; color:#0f3460; margin-bottom:12px;">The Five <code>markRun*</code> Functions</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px; overflow-x:auto;">
    <p style="margin:0 0 12px; font-size:14px;">All five follow the identical pattern in <code>run-store.ts</code>:</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Function</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Lines</th>
          <th style="text-align:left; padding:8px 12px; border-bottom:2px solid #ddd;">Sets ticket.status to</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#fff4f4;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunFailed</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">323-339</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px; font-size:12px;">FAILED</span></td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunSucceeded</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">351-378</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-size:12px;">SANDBOX_READY</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunUnverified</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">388-405</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 6px; border-radius:4px; font-size:12px;">UNVERIFIED</span></td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunNeedsCredentials</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">415-432</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 6px; border-radius:4px; font-size:12px;">NEEDS_CREDENTIALS</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><code>markRunImpossibleSpec</code></td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">442-459</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px; font-size:12px;">IMPOSSIBLE_SPEC</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Code evidence -->
  <h3 id="bug-2-code-evidence" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Code Evidence</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 8px; font-weight:600; font-size:14px; color:#666;">run-store.ts:323-339 &mdash; markRunFailed (representative of all five)</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0;"><code>await prisma.$transaction([
  prisma.sandboxRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      errorMessage: truncate(errorMessage, 2000),
      finishedAt: new Date(),
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

  <!-- Client defensive override -->
  <h3 id="bug-2-client-workaround" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Client-Side Workaround (Partial)</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-size:14px;">The client (<code>format.ts:63-80</code>) has a defensive override that tries to show the active run status instead of the stale ticket status. However, this workaround is unreliable because:</p>
    <ul style="margin:0; padding-left:20px; font-size:14px;">
      <li><strong>Polling gaps:</strong> Between the failure and the next data refresh, the UI shows the stale "Failed" status</li>
      <li><strong>Race conditions:</strong> If the client hasn't re-fetched since the new run started, it still sees the old run</li>
      <li><strong>Ticket list view:</strong> May not include the run data needed for the override</li>
    </ul>
    <p style="margin:12px 0 0; font-size:14px; color:#666;">The right fix is server-side: don't write wrong data in the first place.</p>
  </div>

  <!-- Production example -->
  <h3 id="bug-2-production-example" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Production Example: BLD-679</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:12px; overflow-x:auto;">
    <p style="margin:0 0 12px; font-size:13px; color:#888;">Ticket: BLD-679 | ID: <code>cmq0bwger00trk70ucyy82w2v</code> | Current status: <span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">PREVIEW_READY</span> (eventually resolved, 6 runs total)</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Time (UTC)</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Event</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">02:52</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 created</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">20:50</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 1 finished &rarr; SUCCEEDED</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">SUCCEEDED</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">22:52</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 2 (merge run) &rarr; MERGED</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">MERGED</span></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">23:04</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 3 (conflict resolution) created</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">QUEUED</span></td>
        </tr>
        <tr style="background:#fff4f4;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">23:14</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><strong style="color:#e94560;">Run 3 FAILED &rarr; markRunFailed sets ticket.status = FAILED</strong></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#ffebee; color:#c62828; padding:2px 8px; border-radius:4px; font-size:12px;">FAILED</span></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">23:45</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 4 (rerun) started &mdash; <strong>but ticket still shows "Failed"</strong></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px;">RUNNING</span></td>
        </tr>
        <tr style="background:#e8f5e9;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:13px;">01:09</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Run 4 finished &rarr; SUCCEEDED (self-corrects)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">SUCCEEDED</span></td>
        </tr>
      </tbody>
    </table>
    <p style="margin:12px 0 0; font-size:13px; color:#888;">The "Failed" badge was shown for ~30 minutes (23:14 to ~23:45) while Run 4 was starting. The bug is transient but confusing &mdash; users can't trust the status badge.</p>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 5. HOW FIX-699 RELATES -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="how-fix-699-relates" style="font-size:24px; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">5. How FIX-699 Relates</h2>

  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 16px; font-size:15px;">FIX-699 (<em>"Says failed but a minute ago said succeeded"</em>) fixed a <strong>different manifestation</strong> of the same multi-run gap: a missing WAITING guard for ticket dependency chains in <code>ticket-service.ts</code>. It does NOT address the two bugs in this report.</p>

    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Aspect</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">FIX-699</th>
          <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">RSH-706 (This Report)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Symptom</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">"Failed" after showing "succeeded" (dependency chain)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">"No run found" (Bug 1) + "Failed while running" (Bug 2)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Root cause</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Missing WAITING guard for dependency chains</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Missing run status filter + unconditional ticket status overwrite</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Fix location</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>ticket-service.ts</code></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>run-store.ts</code>, <code>approval-controller.ts</code>, <code>staging-queue-service.ts</code></td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Status</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">Fixed</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#fff3e0; color:#e65100; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">Fix Recommended</span></td>
        </tr>
      </tbody>
    </table>

    <div style="background:#e8f0fe; border:1px solid #90caf9; border-radius:8px; padding:14px 18px; margin-top:16px; font-size:14px;">
      <strong style="color:#1565c0;">Key insight:</strong> FIX-699, Bug 1, and Bug 2 are all symptoms of the same architectural gap &mdash; the server-side code was designed for single-run tickets. FIX-699 patched one manifestation in <code>ticket-service.ts</code>. The two bugs in this report are separate manifestations in different files.
    </div>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 6. THE SOLUTION -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="the-solution" style="font-size:24px; border-bottom:3px solid #27ae60; padding-bottom:8px; margin-bottom:20px;">6. The Solution</h2>

  <div style="background:#eaf7ea; border-left:4px solid #27ae60; border-radius:0 10px 10px 0; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0; font-size:15px;">Three targeted changes in <strong>helix-global-server</strong>, using a <strong>defense-in-depth</strong> strategy. Each change is an additive guard &mdash; no existing behavior is removed, no schema changes, no new dependencies.</p>
  </div>

  <!-- Fix 1 -->
  <h3 id="fix-1-approval-controller" style="font-size:18px; color:#27ae60; margin-bottom:12px;">Fix 1: Filter Runs at the Source</h3>
  <div style="background:#fff; border:1px solid #c8e6c9; border-radius:10px; padding:20px 24px; margin-bottom:20px;">
    <p style="margin:0 0 4px; font-size:14px; color:#666;">File: <code>approval-controller.ts</code> &mdash; line 68</p>
    <p style="margin:0 0 16px; font-size:15px;">Add a <strong>status filter</strong> to the <code>findFirst</code> query so it only selects runs that have actually completed successfully:</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 12px;"><code><span style="color:#98c379;">// BEFORE: accepts any run status</span>
const latestRun = await prisma.sandboxRun.findFirst({
  where: { ticketId: result.approvalRequest.ticketId },
  orderBy: { createdAt: "desc" },
  select: { id: true },
});

<span style="color:#98c379;">// AFTER: only terminal-success runs</span>
const latestRun = await prisma.sandboxRun.findFirst({
  where: {
    ticketId: result.approvalRequest.ticketId,
    <span style="color:#27ae60; font-weight:600;">status: { in: ["SUCCEEDED", "MERGED", "UNVERIFIED"] },</span>
  },
  orderBy: { createdAt: "desc" },
  select: { id: true },
});</code></pre>
    <p style="margin:0; font-size:14px; color:#2e7d32;"><strong>Behavior:</strong> If no terminal-success run exists, the existing <code>if (latestRun)</code> guard skips auto-enqueue. The approval itself still succeeds &mdash; only the enqueue is skipped.</p>
  </div>

  <!-- Fix 2 -->
  <h3 id="fix-2-staging-queue-service" style="font-size:18px; color:#27ae60; margin-bottom:12px;">Fix 2: Validate at the Trust Boundary</h3>
  <div style="background:#fff; border:1px solid #c8e6c9; border-radius:10px; padding:20px 24px; margin-bottom:20px;">
    <p style="margin:0 0 4px; font-size:14px; color:#666;">File: <code>staging-queue-service.ts</code> &mdash; lines 74-79</p>
    <p style="margin:0 0 16px; font-size:15px;">Expand the run query to also select <code>status</code>, then validate it before proceeding:</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 12px;"><code><span style="color:#98c379;">// Select status in addition to id</span>
const run = await tx.sandboxRun.findFirst({
  where: { id: runId, ticketId },
  select: { id: true, <span style="color:#27ae60; font-weight:600;">status: true</span> },
});
if (!run) throw new HttpError(404, "Run not found.");

<span style="color:#27ae60; font-weight:600;">// NEW: Validate run is in a terminal-success status</span>
<span style="color:#27ae60; font-weight:600;">const TERMINAL_SUCCESS = ["SUCCEEDED", "MERGED", "UNVERIFIED"];</span>
<span style="color:#27ae60; font-weight:600;">if (!TERMINAL_SUCCESS.includes(run.status)) {</span>
<span style="color:#27ae60; font-weight:600;">  throw new HttpError(422, `Run is not in a completed-success status (current: ${run.status}).`);</span>
<span style="color:#27ae60; font-weight:600;">}</span></code></pre>
    <p style="margin:0; font-size:14px; color:#2e7d32;"><strong>Why both Fix 1 and Fix 2?</strong> Fix 1 prevents bad input at the most common source (approval auto-enqueue). Fix 2 protects all callers, including the manual <em>"Re-queue for Staging"</em> button which bypasses the approval controller.</p>
  </div>

  <!-- Fix 3 -->
  <h3 id="fix-3-run-store" style="font-size:18px; color:#27ae60; margin-bottom:12px;">Fix 3: Guard the Ticket Status Update</h3>
  <div style="background:#fff; border:1px solid #c8e6c9; border-radius:10px; padding:20px 24px; margin-bottom:20px;">
    <p style="margin:0 0 4px; font-size:14px; color:#666;">File: <code>run-store.ts</code> &mdash; all 5 markRun* functions (lines 323-459)</p>
    <p style="margin:0 0 16px; font-size:15px;">Convert from <strong>batched</strong> transactions to <strong>interactive</strong> transactions, with a guard that checks for other active runs before updating the ticket status:</p>
    <pre style="background:#282c34; color:#abb2bf; padding:16px; border-radius:8px; overflow-x:auto; font-size:13px; line-height:1.5; margin:0 0 12px;"><code><span style="color:#98c379;">// Helper: are there other runs still in progress for this ticket?</span>
<span style="color:#c678dd;">const</span> ACTIVE_RUN_STATUSES = [<span style="color:#98c379;">"QUEUED"</span>, <span style="color:#98c379;">"MERGING"</span>, <span style="color:#98c379;">"RUNNING"</span>, <span style="color:#98c379;">"VERIFYING"</span>];

<span style="color:#c678dd;">async function</span> <span style="color:#61afef;">hasOtherActiveRun</span>(tx, ticketId, excludeRunId) {
  <span style="color:#c678dd;">const</span> active = <span style="color:#c678dd;">await</span> tx.sandboxRun.findFirst({
    where: {
      ticketId,
      id: { not: excludeRunId },
      status: { in: ACTIVE_RUN_STATUSES },
    },
    select: { id: <span style="color:#d19a66;">true</span> },
  });
  <span style="color:#c678dd;">return</span> active !== <span style="color:#d19a66;">null</span>;
}

<span style="color:#98c379;">// BEFORE (batched, unconditional):</span>
await prisma.$transaction([
  prisma.sandboxRun.update({ ... }),
  prisma.ticket.update({ status: "FAILED" }),
]);

<span style="color:#98c379;">// AFTER (interactive, conditional):</span>
await prisma.$transaction(async (tx) =&gt; {
  <span style="color:#98c379;">// Always update the run status</span>
  await tx.sandboxRun.update({ ... });

  <span style="color:#98c379;">// Only update ticket status if no other run is active</span>
  <span style="color:#c678dd;">if</span> (!(await hasOtherActiveRun(tx, ticketId, runId))) {
    await tx.ticket.update({ status: "FAILED" });
  }
});</code></pre>
    <div style="background:#e8f0fe; border:1px solid #90caf9; border-radius:8px; padding:14px 18px; margin-top:12px; font-size:14px;">
      <strong style="color:#1565c0;">Why interactive transactions?</strong> The guard (checking for active runs) and the update (writing ticket status) must happen atomically &mdash; in the same database transaction. If you checked first and then updated separately, another run could start between the check and the update (a TOCTOU race). Interactive transactions (<code>$transaction(async (tx) =&gt; {...})</code>) solve this, and the codebase already uses 14+ of them.
    </div>
  </div>

  <!-- Single-run safety note -->
  <div style="background:#eaf7ea; border:1px solid #27ae60; border-radius:10px; padding:16px 20px; margin-bottom:12px; font-size:14px;">
    <strong style="color:#27ae60;">Single-run tickets are unaffected.</strong> For the 58% of tickets with only one run, the <code>hasOtherActiveRun</code> check finds no other runs and proceeds normally &mdash; identical behavior to today.
  </div>
</section>

<!-- ====================================================================== -->
<!-- 7. IMPACT & RISK -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="impact-and-risk" style="font-size:24px; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">7. Impact &amp; Risk</h2>

  <!-- Severity -->
  <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
    <div style="flex:1; min-width:260px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="background:#ffebee; color:#c62828; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">HIGH</span>
        <span style="font-weight:600;">Bug 1 Severity</span>
      </div>
      <ul style="margin:0; padding-left:18px; font-size:14px;">
        <li>PERMANENT failure blocks the merge pipeline</li>
        <li>Requires manual admin intervention</li>
        <li>User approved expecting auto-merge; sees failure instead</li>
      </ul>
    </div>
    <div style="flex:1; min-width:260px; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="background:#fff3e0; color:#e65100; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">MEDIUM</span>
        <span style="font-weight:600;">Bug 2 Severity</span>
      </div>
      <ul style="margin:0; padding-left:18px; font-size:14px;">
        <li>Self-corrects after the next data refresh</li>
        <li>No manual intervention required</li>
        <li>Erodes user trust in status reporting</li>
      </ul>
    </div>
  </div>

  <!-- Risk assessment -->
  <div style="background:#eaf7ea; border:1px solid #27ae60; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <span style="background:#e8f5e9; color:#2e7d32; padding:4px 12px; border-radius:6px; font-size:13px; font-weight:700;">LOW RISK FIX</span>
    </div>
    <ul style="margin:0; padding-left:20px; font-size:14px;">
      <li><strong>Additive guards only:</strong> No behavior is removed. Single-run tickets work identically.</li>
      <li><strong>No schema changes:</strong> Uses existing status enums and models as-is.</li>
      <li><strong>Server-side only:</strong> No client deployment coordination needed.</li>
      <li><strong>Established patterns:</strong> Interactive transactions are already used 14+ times in the codebase. The <code>ACTIVE_RUN_STATUSES</code> set matches the client's existing definition.</li>
      <li><strong>Negligible performance impact:</strong> One additional indexed <code>findFirst</code> query per run completion inside existing transactions. Typical ticket has 1-5 runs.</li>
    </ul>
  </div>

  <!-- Scope summary -->
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; overflow-x:auto;">
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
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">helix-global-server only</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Files to change</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>run-store.ts</code>, <code>approval-controller.ts</code>, <code>staging-queue-service.ts</code></td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Files unchanged</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;"><code>staging-queue-processor.ts</code> (already correct), all client files, schema</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Schema changes</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">None</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">New dependencies</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">None</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Client changes</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">None</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ====================================================================== -->
<!-- 8. EVIDENCE & DATA SOURCES -->
<!-- ====================================================================== -->
<section style="margin-bottom:44px;">
  <h2 id="evidence-and-data-sources" style="font-size:24px; border-bottom:3px solid #666; padding-bottom:8px; margin-bottom:20px;">8. Evidence &amp; Data Sources</h2>

  <!-- Code verification -->
  <h3 id="code-verification" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Code Verification</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px; overflow-x:auto;">
    <p style="margin:0 0 12px; font-size:14px;">All code claims were verified against the helix-global-server source code on June 6, 2026:</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">File</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Key Lines</th>
          <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Claim Verified</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>approval-controller.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">67-71</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">findFirst has no status filter in where clause</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>staging-queue-service.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">74-79</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">Run query selects only <code>{id: true}</code>, no status validation</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>staging-queue-processor.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">19-23</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">TERMINAL_SUCCESS_STATUSES correctly defined (no fix needed)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>run-store.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">323-339</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">markRunFailed uses batched $transaction with unconditional ticket.update</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>run-store.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">351-378</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">markRunSucceeded uses batched $transaction with unconditional ticket.update</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>run-store.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">388-405</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">markRunUnverified uses batched $transaction with unconditional ticket.update</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>run-store.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">415-432</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">markRunNeedsCredentials uses batched $transaction with unconditional ticket.update</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code>run-store.ts</code></td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">442-459</td>
          <td style="padding:8px 10px; border-bottom:1px solid #eee;">markRunImpossibleSpec uses batched $transaction with unconditional ticket.update</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Production data -->
  <h3 id="production-data" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Production Data</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px; margin-bottom:24px;">
    <p style="margin:0 0 12px; font-size:14px;">All statistics queried from the helix-global-server production database on June 6, 2026 via Helix Inspect (read-only runtime inspection).</p>
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
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Total tickets</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">846</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Tickets with multiple runs</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">354 (42%)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Total staging queue items</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">67</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">All queue items merged</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">67 (100%)</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">Active PERMANENT failures</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">0</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">BLD-700 current status</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;"><span style="background:#e8f5e9; color:#2e7d32; padding:2px 8px; border-radius:4px; font-size:12px;">DEPLOYED</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">BLD-679 current status</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;"><span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:4px; font-size:12px;">PREVIEW_READY</span></td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:10px 12px; border-bottom:1px solid #eee;">BLD-679 total runs</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">6</td>
          <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px;">Production DB (June 6, 2026)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Prior research -->
  <h3 id="prior-research" style="font-size:18px; color:#0f3460; margin-bottom:12px;">Prior Research</h3>
  <div style="background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:20px 24px;">
    <p style="margin:0; font-size:14px;">This report builds on the RSH-705 research report (June 6, 2026) which performed the initial root cause analysis. All claims have been re-verified against current source code and refreshed with current production data. The RSH-705 data (800 tickets, 354 multi-run) has been updated with the latest count (846 tickets, 354 multi-run).</p>
  </div>
</section>

</main>

<!-- ====================================================================== -->
<!-- FOOTER -->
<!-- ====================================================================== -->
<footer style="background:#1a1a2e; color:#c4c4d4; padding:24px; text-align:center; font-size:13px;">
  <p style="margin:0;">RSH-706 &mdash; Run Lifecycle Bug Analysis &mdash; Generated June 6, 2026</p>
  <p style="margin:4px 0 0; color:#666;">helix-global-server &middot; Verified against production database and source code</p>
</footer>

</body>
</html>

## Attachments
- (none)
