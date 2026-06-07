# Ticket Context

- ticket_id: cmq3evx4p0072b70ulyy4s1d6
- short_id: BLD-748
- run_id: cmq3evx570077b70uhk83fz6r
- run_branch: helix/build/BLD-748-implement-more-bugs-missing-run
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Implement: More bugs. Missing run

## Description
Build ticket to implement research from RSH-743.

See images. Take a higher level perspective

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSH-743: Run Lookup Rejects Valid Runs During Merge &amp; Deploy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; background: #f8f9fa;">

  <!-- Header -->
  <header style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 40px 24px; border-bottom: 4px solid #e94560;">
    <div style="max-width: 960px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <span style="background: #e94560; color: white; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">BUG INVESTIGATION</span>
        <span style="background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">RSH-743</span>
        <span style="background: rgba(46, 204, 113, 0.25); color: #2ecc71; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">Research Complete</span>
      </div>
      <h1 id="title" style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; line-height: 1.3;">Run Lookup Rejects Valid Runs During Merge &amp; Deploy</h1>
      <p style="margin: 0; opacity: 0.7; font-size: 14px;">Date: 2026-06-07 &middot; Repository: helix-global-server &middot; Severity: High</p>
    </div>
  </header>

  <!-- Table of Contents -->
  <nav style="max-width: 960px; margin: 32px auto 0 auto; padding: 0 24px;">
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 28px;">
      <h2 id="table-of-contents" style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.5px;">Table of Contents</h2>
      <ol style="margin: 0; padding-left: 20px; columns: 2; column-gap: 32px;">
        <li style="margin-bottom: 6px;"><a href="#executive-summary" style="color: #0f3460; text-decoration: none;">Executive Summary</a></li>
        <li style="margin-bottom: 6px;"><a href="#bug-evidence" style="color: #0f3460; text-decoration: none;">Bug Evidence</a></li>
        <li style="margin-bottom: 6px;"><a href="#root-cause-analysis" style="color: #0f3460; text-decoration: none;">Root Cause Analysis</a></li>
        <li style="margin-bottom: 6px;"><a href="#production-evidence" style="color: #0f3460; text-decoration: none;">Production Evidence</a></li>
        <li style="margin-bottom: 6px;"><a href="#impact-analysis" style="color: #0f3460; text-decoration: none;">Impact Analysis</a></li>
        <li style="margin-bottom: 6px;"><a href="#recommended-fix" style="color: #0f3460; text-decoration: none;">Recommended Fix</a></li>
        <li style="margin-bottom: 6px;"><a href="#risk-assessment" style="color: #0f3460; text-decoration: none;">Risk Assessment</a></li>
        <li style="margin-bottom: 6px;"><a href="#appendix" style="color: #0f3460; text-decoration: none;">Appendix</a></li>
      </ol>
    </div>
  </nav>

  <!-- Main Content -->
  <main style="max-width: 960px; margin: 0 auto; padding: 32px 24px;">

    <!-- 1. Executive Summary -->
    <section style="margin-bottom: 48px;">
      <h2 id="executive-summary" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">1. Executive Summary</h2>

      <div style="background: #fff5f5; border-left: 4px solid #e94560; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #c0392b;">Two related bugs in the Merge &amp; Deploy flow cause valid, completed runs to be rejected by the server.</p>
        <p style="margin: 0; color: #555;">Both errors produce the message: <em>"Run X not found or is not the current run for this ticket"</em> &mdash; even though the referenced run exists, completed successfully, and belongs to the ticket.</p>
      </div>

      <p>The root cause is the <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findRunOrThrow</code> function in <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">src/services/shared/run-lookup.ts</code> (line 30), which enforces a fragile invariant: it only accepts a run ID that exactly matches the ticket's <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> (the most recently created run by <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">createdAt</code>, regardless of status). Any code that independently resolves a run ID &mdash; the client-side merge status panel or the server-side staging queue processor &mdash; will break when a newer run is created by automated conflict resolution.</p>

      <p>Two distinct error paths surface in production:</p>
      <ol>
        <li><strong>Client-side (Screenshot 1):</strong> The merge-status API returns HTTP 404 when the client sends <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">summaryLatestRun.id</code> (latest non-merge run) but the server's <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> has changed to a newer merge-resolution run.</li>
        <li><strong>Server-side (Screenshot 2):</strong> The staging queue processor finds the latest terminal (SUCCEEDED) run via <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findLatestTerminalRun</code>, but <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> has changed. After 3 retries, the merge is permanently marked FAILED.</li>
      </ol>

      <p>A secondary issue compounds the problem: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">walkthrough-service.ts</code> contains a duplicate copy of <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findRunOrThrow</code> (lines 68&ndash;76) with identical restrictive logic, instead of importing the shared version.</p>
    </section>

    <!-- 2. Bug Evidence -->
    <section style="margin-bottom: 48px;">
      <h2 id="bug-evidence" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">2. Bug Evidence</h2>

      <!-- Screenshot 1 -->
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
          <span style="background: #e94560; color: white; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">BUG 1</span>
          <h3 id="screenshot-1---client-side-api-404" style="margin: 0; font-size: 18px; font-weight: 600;">Screenshot 1 &mdash; Client-Side API 404</h3>
          <span style="color: #888; font-size: 13px;">(captured at 01:05)</span>
        </div>

        <p><strong>What the screenshot shows:</strong> The Run Details dialog on <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">lab.gethelix.ai/tickets/...</code>, on the "Details &amp; Artifacts" tab. The Merge &amp; Deploy section lists three repos (helix-global-client, helix-global-server, helix-cli) all showing "staging pending." Below the repo list, a red error banner reads:</p>

        <div style="background: #fff0f0; border: 1px solid #f5c6cb; border-radius: 6px; padding: 14px 18px; margin: 12px 0; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; color: #c0392b;">
          Unable to load merge status. Run cmq2vwyz100blbd0uejx7stbc not found or is not the current run for this ticket.
        </div>

        <p><strong>What happened:</strong> The client computed <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">summaryLatestRun</code> by filtering out <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">isMergeRun</code> entries (ticket-detail.tsx line 1504), resolving to run <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">cmq2vwyz100blbd0uejx7stbc</code> (a valid SUCCEEDED run). However, the server's <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> had changed to a newer merge-resolution run created by conflict resolution. The <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findRunOrThrow</code> function rejected the valid run ID with HTTP 404.</p>

        <p style="margin-bottom: 0;"><strong>Ticket ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">cmq2vwyyk00bfbd0u3dlfo0er</code> &nbsp;|&nbsp; <strong>Run ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">cmq2vwyz100blbd0uejx7stbc</code> (SUCCEEDED)</p>
      </div>

      <!-- Screenshot 2 -->
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
          <span style="background: #e94560; color: white; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">BUG 2</span>
          <h3 id="screenshot-2---server-side-queue-failure" style="margin: 0; font-size: 18px; font-weight: 600;">Screenshot 2 &mdash; Server-Side Queue Failure</h3>
          <span style="color: #888; font-size: 13px;">(captured at 00:37)</span>
        </div>

        <p><strong>What the screenshot shows:</strong> The Run Details dialog on the "Details &amp; Artifacts" tab. The Merge &amp; Deploy section shows three repos (helix-global-server, helix-global-client, helix-cli) all marked "Mergeable" with "PR opened" links. Below, a red <span style="background: #e94560; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">&#10007; Merge failed</span> badge appears, followed by the error:</p>

        <div style="background: #fff0f0; border: 1px solid #f5c6cb; border-radius: 6px; padding: 14px 18px; margin: 12px 0; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; color: #c0392b;">
          Merge error after 3 retries: Run cmq2vyc3j00c3bd0us0xydh86 not found or is not the current run for this ticket.
          <br>This error may require investigation.
          <br>Retried 3 times
        </div>

        <p><strong>What happened:</strong> The staging queue processor called <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findLatestTerminalRun</code> (staging-queue-processor.ts line 113&ndash;122) which returned run <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">cmq2vyc3j00c3bd0us0xydh86</code> (a SUCCEEDED run). This ID was passed to <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">mergeRunToStaging</code> &rarr; <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findRunOrThrow</code>, but <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> had already changed to a newer merge-resolution rerun. After 3 failed attempts, the queue item was permanently marked FAILED (line 356).</p>

        <p style="margin-bottom: 0;"><strong>Ticket ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">cmq0dmiyf00uak70u67kn26be</code> &nbsp;|&nbsp; <strong>Run ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">cmq2vyc3j00c3bd0us0xydh86</code> (SUCCEEDED)</p>
      </div>
    </section>

    <!-- 3. Root Cause Analysis -->
    <section style="margin-bottom: 48px;">
      <h2 id="root-cause-analysis" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">3. Root Cause Analysis</h2>

      <h3 id="the-findrunorthrow-function" style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">3.1 The <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;">findRunOrThrow</code> Function</h3>

      <p>Located at <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">src/services/shared/run-lookup.ts</code>, line 30. The function's own comment acknowledges the limitation:</p>

      <pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; line-height: 1.5; margin: 16px 0;"><code>/**
 * Retrieve the run matching `runId` from the ticket detail.
 * Currently only the `currentRun` is supported &mdash; if `runId` does not
 * match, throw an HTTP 404 error.
 */
export function findRunOrThrow(
  ticketDetail: { currentRun: RunLike | null; runs: Array&lt;{ id: string }&gt; },
  runId: string,
): RunLike {
  <span style="color: #f59e0b;">// Line 30 &mdash; THE BUG: only accepts currentRun.id</span>
  if (ticketDetail.currentRun &amp;&amp; ticketDetail.currentRun.id === runId) {
    return ticketDetail.currentRun;
  }
  throw new HttpError(404,
    `Run ${runId} not found or is not the current run for this ticket.`
  );
}</code></pre>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">Key insight: The function signature already accepts a <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">runs: Array&lt;{ id: string }&gt;</code> parameter but never uses it. The <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">runs</code> array was prepared for broader lookup but the implementation only checks <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">currentRun.id</code>.</p>
      </div>

      <h3 id="what-currentrun-means" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">3.2 What <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;">currentRun</code> Means</h3>

      <p>Defined in <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">src/services/ticket-service.ts</code>, line 2014:</p>

      <pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; line-height: 1.5; margin: 16px 0;"><code><span style="color: #94a3b8;">// ticket.sandboxRuns is ordered by createdAt DESC</span>
const latestRun = ticket.sandboxRuns[0] ?? null;  <span style="color: #f59e0b;">// &larr; ANY status</span></code></pre>

      <p><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> is simply the latest run by <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">createdAt DESC</code>, regardless of status. This means a QUEUED, RUNNING, or FAILED run will become <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code> and immediately invalidate any previously valid run ID.</p>

      <h3 id="error-path-1---client-merge-status-api" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">3.3 Error Path 1 &mdash; Client Merge-Status API</h3>

      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a2e;">Flow diagram:</p>
        <div style="font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; padding: 12px; background: #f8fafc; border-radius: 6px;">
          <span style="color: #0f3460;">Client</span>
          <span style="color: #888;"> &rarr; computes </span>
          <span style="color: #e94560;">summaryLatestRun</span>
          <span style="color: #888;"> (filters out isMergeRun) &rarr; calls </span>
          <span style="color: #0f3460;">GET /merge-status</span>
          <span style="color: #888;"> with old run ID &rarr; </span>
          <span style="color: #0f3460;">findRunOrThrow</span>
          <span style="color: #888;"> &rarr; </span>
          <span style="color: #e94560; font-weight: 600;">HTTP 404</span>
        </div>
      </div>

      <ul>
        <li><strong>ticket-detail.tsx line 1504:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">summaryLatestRun = ticketData.ticket.runs.filter(r =&gt; !r.isMergeRun)[0]</code></li>
        <li><strong>ticket-detail.tsx line 1588:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">mergeStatusQueryOptions(ticketId!, summaryLatestRun?.id ?? "")</code></li>
        <li>When conflict resolution creates a rerun with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">refreshFromStaging: true</code> (flagged <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">isMergeRun=true</code>), the client still uses the older non-merge run's ID &mdash; which no longer matches <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;">currentRun</code></li>
      </ul>

      <h3 id="error-path-2---staging-queue-processor" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">3.4 Error Path 2 &mdash; Staging Queue Processor</h3>

      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a2e;">Flow diagram:</p>
        <div style="font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; padding: 12px; background: #f8fafc; border-radius: 6px;">
          <span style="color: #0f3460;">Queue processor</span>
          <span style="color: #888;"> &rarr; </span>
          <span style="color: #e94560;">findLatestTerminalRun</span>
          <span style="color: #888;"> (SUCCEEDED/MERGED/UNVERIFIED) &rarr; </span>
          <span style="color: #0f3460;">mergeRunToStaging</span>
          <span style="color: #888;"> &rarr; </span>
          <span style="color: #0f3460;">findRunOrThrow</span>
          <span style="color: #888;"> &rarr; </span>
          <span style="color: #e94560; font-weight: 600;">HTTP 404</span>
          <span style="color: #888;"> &rarr; 3 retries &rarr; </span>
          <span style="color: #e94560; font-weight: 600;">FAILED</span>
        </div>
      </div>

      <p><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findLatestTerminalRun</code> (staging-queue-processor.ts lines 113&ndash;122) queries for the latest SUCCEEDED/MERGED/UNVERIFIED run &mdash; a valid completed run. But when conflict resolution creates a new run (line 262, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">createRerunForTicketInOrganization</code> with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">refreshFromStaging: true</code>), that new run becomes <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code>, causing the terminal run's ID to be rejected.</p>

      <pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; line-height: 1.5; margin: 16px 0;"><code><span style="color: #94a3b8;">// staging-queue-processor.ts lines 113-122</span>
async function findLatestTerminalRun(ticketId: string) {
  return prisma.sandboxRun.findFirst({
    where: {
      ticketId,
      status: { in: [
        SandboxRunStatus.SUCCEEDED,
        SandboxRunStatus.MERGED,
        SandboxRunStatus.UNVERIFIED
      ]},
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
}</code></pre>

      <h3 id="duplicate-code" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">3.5 Duplicate Code</h3>

      <p><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">walkthrough-service.ts</code> (lines 58&ndash;76) contains a duplicate <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">RunLike</code> type and <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findRunOrThrow</code> function with identical logic. This duplicate is called at lines 360 and 512 for walkthrough generation. It has the same restrictive <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun.id</code>-only check and would silently diverge from any fix applied to the shared version.</p>
    </section>

    <!-- 4. Production Evidence -->
    <section style="margin-bottom: 48px;">
      <h2 id="production-evidence" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">4. Production Evidence</h2>

      <p>The following data was queried from the production PostgreSQL database via Helix Inspect on 2026-06-07.</p>

      <h3 id="affected-runs" style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">4.1 Affected Runs</h3>
      <p>Both run IDs from the screenshots exist as valid SUCCEEDED runs:</p>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Run ID</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Status</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Created At</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Ticket ID</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Parent Run</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #f0fdf4;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;">cmq2vwyz1...ejx7stbc</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">SUCCEEDED</span></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">2026-06-06 21:48 UTC</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;">cmq2vwyyk...fo0er</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #888;">null (initial)</td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;">cmq2vyc3j...xydh86</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">SUCCEEDED</span></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">2026-06-06 21:49 UTC</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;">cmq0dmiyf...26be</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px;">cmq2r7gr6...x41g</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="currentrun-divergence-pattern" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">4.2 <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;">currentRun</code> Divergence Pattern</h3>
      <p>Both tickets later received MERGED-status resolution runs with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">refreshFromStaging: true</code> that became the new <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">currentRun</code>, confirming the divergence pattern:</p>

      <h4 style="font-size: 15px; font-weight: 600; margin-top: 20px; margin-bottom: 8px;">Ticket cmq2vwyyk... (Screenshot 1)</h4>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px;">
          <thead>
            <tr style="background: #334155; color: white;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Run ID</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Status</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Created At</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Config</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">cmq3c4z8f...niul</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">RUNNING</span></td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">06-07 05:22</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">resumed</td>
            </tr>
            <tr style="background: #fef3c7;">
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">cmq3ary62...y1o</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">MERGED</span></td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">06-07 04:44</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;"><span style="background: #fecaca; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-size: 11px;">refreshFromStaging: true</span></td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">cmq2vwyz1...stbc</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">SUCCEEDED</span></td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">06-06 21:48</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #888;">initial run</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 12px 0; font-size: 13px;">
        <strong>Divergence:</strong> At the time of Screenshot 1 (01:05 UTC), <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">currentRun</code> pointed to the merge-resolution run (cmq3ary62... MERGED, created 04:44). The client's <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">summaryLatestRun</code> resolved to cmq2vwyz1... (SUCCEEDED, created 21:48) &mdash; a valid run filtered out because of the <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">isMergeRun</code> flag.
      </div>

      <h4 style="font-size: 15px; font-weight: 600; margin-top: 20px; margin-bottom: 8px;">Ticket cmq0dmiyf... (Screenshot 2)</h4>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px;">
          <thead>
            <tr style="background: #334155; color: white;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Run ID</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Status</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Created At</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Config</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #fef3c7;">
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">cmq38ri5w...qhfw</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">MERGED</span></td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">06-07 03:47</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;"><span style="background: #fecaca; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-size: 11px;">refreshFromStaging: true</span></td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">cmq2vyc3j...dh86</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">SUCCEEDED</span></td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">06-06 21:49</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #888;">resumed verification</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">cmq2r7gr6...x41g</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">FAILED</span></td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">06-06 19:36</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;"><span style="background: #fecaca; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-size: 11px;">refreshFromStaging: true</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;" colspan="4" style="color: #888; font-size: 12px; text-align: center;">... 3 earlier runs (SUCCEEDED, FAILED, FAILED)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 12px 0; font-size: 13px;">
        <strong>Divergence:</strong> At the time of Screenshot 2 (00:37 UTC), <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">currentRun</code> pointed to the merge-resolution run (cmq38ri5w... MERGED, created 03:47). The staging queue processor's <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">findLatestTerminalRun</code> returned cmq2vyc3j... (SUCCEEDED, created 21:49). The IDs diverged &rarr; 404 &rarr; 3 retries &rarr; FAILED.
      </div>

      <h3 id="staging-queue-current-state" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">4.3 Staging Queue Current State</h3>
      <p>No staging queue items currently have error messages. The five most recent items all show <span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">MERGED</span> status, indicating the issues were self-resolved after eventual successful merge-resolution reruns caught up and completed.</p>

      <h3 id="log-evidence" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">4.4 Log Evidence</h3>
      <p>Production log queries for the "not found or is not the current run" error pattern returned no results in recent logs, consistent with the staging queue items having been cleaned up after eventual success. The errors are transient &mdash; they occur during the window between conflict resolution rerun creation and eventual merge completion &mdash; but cause user-visible failures and wasted retries during that window.</p>
    </section>

    <!-- 5. Impact Analysis -->
    <section style="margin-bottom: 48px;">
      <h2 id="impact-analysis" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">5. Impact Analysis</h2>

      <h3 id="affected-callsites" style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">5.1 Affected Callsites (8 total)</h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">#</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Caller</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">File</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Line</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #fff5f5;">
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">1</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">mergeRunToStaging</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">github-merge-service.ts</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">481</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">HIGH</span></td>
            </tr>
            <tr style="background: #fff5f5;">
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">2</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">mergeRunToMain</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">github-merge-service.ts</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">652</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">MED</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">3</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">getRunMergeStatus</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">github-merge-service.ts</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">883</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">HIGH</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">4</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">analyzeMergeRisk</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">merge-analysis-service.ts</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">411</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">MED</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">5</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">analyzeRefreshFromStaging</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">merge-analysis-service.ts</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">712</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">MED</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">6</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">performFocusedMerge</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">focused-merge-service.ts</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">91</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">MED</span></td>
            </tr>
            <tr style="background: #f5f3ff;">
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">7</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">generateWalkthrough</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">walkthrough-service.ts <span style="color: #7c3aed; font-size: 11px;">(duplicate)</span></td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">360</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">LOW</span></td>
            </tr>
            <tr style="background: #f5f3ff;">
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">8</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">fetchWalkthroughFileContents</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">walkthrough-service.ts <span style="color: #7c3aed; font-size: 11px;">(duplicate)</span></td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">512</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">LOW</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="user-visible-impact" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">5.2 User-Visible Impact</h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 16px 0;">
        <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 8px;">Merge Status Unavailable</div>
          <p style="margin: 0; font-size: 13px; color: #555;">Users see a red error banner on the Merge &amp; Deploy panel: "Unable to load merge status." The panel cannot show PR status, mergeability, or "Analyze for Staging" readiness. Users have no way to diagnose what's wrong.</p>
        </div>
        <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 8px;">Merge Permanently Fails</div>
          <p style="margin: 0; font-size: 13px; color: #555;">The staging queue processor exhausts 3 retries and marks the merge as FAILED. Users must manually click "Re-queue for Staging" and wait for the entire merge process to restart. Meanwhile, the ticket blocks the staging queue.</p>
        </div>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #0f3460; margin-bottom: 8px;">Self-Healing (Eventually)</div>
          <p style="margin: 0; font-size: 13px; color: #555;">The issues eventually resolve when a successful merge-resolution rerun catches up, becomes both <code style="font-size: 12px;">currentRun</code> and the latest terminal run, and the IDs converge again. This is why no currently failed queue items exist.</p>
        </div>
      </div>

      <h3 id="automated-process-impact" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">5.3 Automated Process Impact</h3>
      <p>The staging queue processor runs on a 5-second interval. When it hits the <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 14px;">findRunOrThrow</code> 404, it retries up to 3 times before permanently failing the queue item. During these retries (at minimum 15 seconds), the queue item blocks the processor from picking up other work. In the worst case, multiple tickets hit this bug simultaneously, creating a backlog of failed items that require manual re-queuing.</p>
    </section>

    <!-- 6. Recommended Fix -->
    <section style="margin-bottom: 48px;">
      <h2 id="recommended-fix" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">6. Recommended Fix</h2>

      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <p style="margin: 0; font-weight: 600; color: #166534;">Chosen approach: Make <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">findRunOrThrow</code> async and accept any run in the ticket's <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">runs</code> array, with a DB fallback for <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">changedRepos</code> resolution.</p>
      </div>

      <h3 id="approach-details" style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">6.1 Approach Details</h3>

      <ol style="padding-left: 20px;">
        <li style="margin-bottom: 12px;"><strong>Fast path preserved:</strong> Check <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">currentRun.id === runId</code> first. When it matches (the common case), return immediately with zero performance regression.</li>
        <li style="margin-bottom: 12px;"><strong>Ownership check:</strong> Verify <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">runId</code> exists in <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">ticketDetail.runs</code> (in-memory array, already loaded). This ensures the run belongs to the ticket &mdash; same security guarantee as before.</li>
        <li style="margin-bottom: 12px;"><strong>DB fallback:</strong> Query <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">SandboxRun</code> for the run's <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">runSummary</code> to extract <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">changedRepos</code> using <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">parseSandboxRunSummary</code>. If <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">changedRepos</code> is empty and <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">parentRunId</code> exists, walk the ancestor chain with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">collectChangedReposFromAncestorChain</code>.</li>
        <li style="margin-bottom: 12px;"><strong>Consolidation:</strong> Remove duplicate <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">findRunOrThrow</code> and <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">RunLike</code> type from <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">walkthrough-service.ts</code>. Import the shared version.</li>
        <li style="margin-bottom: 12px;"><strong>Error message:</strong> Change from <em>"not found or is not the current run"</em> to <em>"not found for this ticket"</em> &mdash; no longer leaking internal <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">currentRun</code> concept.</li>
        <li style="margin-bottom: 12px;"><strong>All callers:</strong> Add <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">await</code> to all 8 callsites.</li>
        <li style="margin-bottom: 0;"><strong>Tests:</strong> Update mocks for async signature in <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">merge-analysis-service.test.ts</code> and <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">github-merge-service-fallback.test.ts</code>.</li>
      </ol>

      <h3 id="new-function-pseudocode" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">6.2 New Function Pseudocode</h3>

      <pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; line-height: 1.5; margin: 16px 0;"><code><span style="color: #7dd3fc;">export async function</span> <span style="color: #fbbf24;">findRunOrThrow</span>(
  ticketDetail: { currentRun: RunLike | null; runs: Array&lt;{ id: string }&gt; },
  runId: string,
): <span style="color: #7dd3fc;">Promise</span>&lt;RunLike&gt; {
  <span style="color: #94a3b8;">// 1. Fast path: currentRun match (common case)</span>
  <span style="color: #c084fc;">if</span> (ticketDetail.currentRun?.id === runId) {
    <span style="color: #c084fc;">return</span> ticketDetail.currentRun;
  }

  <span style="color: #94a3b8;">// 2. Ownership check: verify run belongs to ticket</span>
  <span style="color: #c084fc;">if</span> (!ticketDetail.runs.some(r =&gt; r.id === runId)) {
    <span style="color: #c084fc;">throw new</span> HttpError(<span style="color: #fbbf24;">404</span>, <span style="color: #86efac;">`Run ${runId} not found for this ticket.`</span>);
  }

  <span style="color: #94a3b8;">// 3. DB fallback: resolve changedRepos from runSummary</span>
  <span style="color: #c084fc;">const</span> dbRun = <span style="color: #c084fc;">await</span> prisma.sandboxRun.findUnique({
    where: { id: runId },
    select: { runSummary: <span style="color: #fbbf24;">true</span>, parentRunId: <span style="color: #fbbf24;">true</span>, ticketId: <span style="color: #fbbf24;">true</span> },
  });

  <span style="color: #94a3b8;">// 4. Parse runSummary, extract changedRepos</span>
  <span style="color: #94a3b8;">// 5. If empty + parentRunId exists, walk ancestor chain</span>
  <span style="color: #94a3b8;">// 6. Return { id: runId, changedRepos }</span>
}</code></pre>

      <h3 id="options-considered-and-rejected" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">6.3 Options Considered &amp; Rejected</h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Option</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Description</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Why Rejected</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #f0fdf4;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">A. Async + DB fallback</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Accept any run in <code style="font-size: 12px;">runs</code> array; query DB for <code style="font-size: 12px;">changedRepos</code></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600;">CHOSEN</span></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">B. Preload <code style="font-size: 12px;">changedRepos</code> for all runs</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Expand <code style="font-size: 12px;">getTicketDetailForOrganization</code> to include <code style="font-size: 12px;">changedRepos</code> in all runs</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Expensive: parsing <code style="font-size: 12px;">runSummary</code> + ancestor chain walk for every run. Changes API payload size. Overkill for a rare path.</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">C. Move to callers</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Make callers handle <code style="font-size: 12px;">changedRepos</code> resolution themselves</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Duplicates logic across 8 callsites. Higher maintenance burden and divergence risk. Defeats the purpose of the shared utility.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="change-summary" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">6.4 Change Summary</h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Aspect</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Repos changed</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">helix-global-server only</td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Files changed</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><code style="font-size: 12px;">run-lookup.ts</code> (primary), <code style="font-size: 12px;">walkthrough-service.ts</code> (consolidation), + 4 caller files adding <code style="font-size: 12px;">await</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">New dependencies</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">None</td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Schema changes</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">None</td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">API changes</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">None (broadens accepted input; same response shape)</td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Breaking changes</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">None</td>
            </tr>
            <tr>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Risk level</td>
              <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600;">LOW</span> &mdash; permissive change that preserves fast path</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 7. Risk Assessment -->
    <section style="margin-bottom: 48px;">
      <h2 id="risk-assessment" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">7. Risk Assessment</h2>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <thead>
            <tr style="background: #1e293b; color: white;">
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Risk</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Severity</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Mitigation</th>
              <th style="padding: 10px 14px; text-align: left; font-weight: 600;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Race condition between <code style="font-size: 12px;">findLatestTerminalRun</code> and <code style="font-size: 12px;">getTicketDetailForOrganization</code></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">LOW</span></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Pre-existing design issue. The fix reduces exposure by accepting any valid run. Full fix would require transactional locking or using the queue item's stored <code style="font-size: 12px;">runId</code>.</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #888;">Deferred</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Manual rerun during merge</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">VERY LOW</span></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">The fix does not change merge ordering or concurrency. A manual rerun during merge would create a new run, but the fix now correctly handles the older run's ID.</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #888;">Acceptable</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">"No artifacts available" message</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">UNKNOWN</span></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Both screenshots show this message. It may be related to the run-lookup issue or a separate display bug. Requires separate investigation.</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #888;">Out of scope</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">The <code style="font-size: 12px;">currentRun</code> concept may need broader revisiting</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">LOW</span></td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">The fix addresses the immediate symptom without changing the <code style="font-size: 12px;">currentRun</code> model. Future features assuming a single "active" run may need further work.</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #888;">Deferred</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 8. Appendix -->
    <section style="margin-bottom: 48px;">
      <h2 id="appendix" style="font-size: 24px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 8px; margin-bottom: 20px;">8. Appendix</h2>

      <h3 id="full-list-of-affected-files" style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">A.1 Full List of Affected Files</h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <thead>
            <tr style="background: #334155; color: white;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">File Path</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Key Lines</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/shared/run-lookup.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">26&ndash;34</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Primary fix target: <code style="font-size: 12px;">findRunOrThrow</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/walkthrough-service.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">58&ndash;76, 360, 512</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Duplicate removal + import swap</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/github-merge-service.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">481, 652, 883</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">3 callsites: add <code style="font-size: 12px;">await</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/merge-analysis-service.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">411, 712</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">2 callsites: add <code style="font-size: 12px;">await</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/focused-merge-service.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">91</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">1 callsite: add <code style="font-size: 12px;">await</code></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/ticket-service.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">2012&ndash;2014</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Context: <code style="font-size: 12px;">currentRun</code> derivation (no changes)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/services/staging-queue-processor.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">113&ndash;122, 262, 356</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Context: <code style="font-size: 12px;">findLatestTerminalRun</code>, conflict resolution, error wrapping (no changes)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">src/controllers/ticket-controller.ts</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">441&ndash;446</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Context: <code style="font-size: 12px;">getMergeStatus</code> handler (no changes)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">prisma/schema.prisma</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">666&ndash;684</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Context: <code style="font-size: 12px;">StagingMergeQueueItem</code> model (no changes)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="currentrun-derivation-code-path" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">A.2 <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">currentRun</code> Derivation Code Path</h3>

      <pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; line-height: 1.5; margin: 16px 0;"><code><span style="color: #94a3b8;">// ticket-service.ts, line 2012-2014</span>
<span style="color: #7dd3fc;">export const</span> getTicketDetailForOrganization = <span style="color: #c084fc;">async</span> (ticketId, organizationId) =&gt; {
  <span style="color: #c084fc;">const</span> ticket = <span style="color: #c084fc;">await</span> findTicketOrThrow(ticketId, organizationId);
  <span style="color: #c084fc;">const</span> latestRun = ticket.sandboxRuns[<span style="color: #fbbf24;">0</span>] ?? <span style="color: #fbbf24;">null</span>;
  <span style="color: #94a3b8;">// sandboxRuns is ordered by createdAt DESC</span>
  <span style="color: #94a3b8;">// latestRun becomes currentRun — ANY status</span>
  ...
};</code></pre>

      <h3 id="staging-merge-queue-schema" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">A.3 Relevant Prisma Schema Excerpt</h3>

      <pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 13px; line-height: 1.5; margin: 16px 0;"><code><span style="color: #94a3b8;">// prisma/schema.prisma, lines 666-684</span>
<span style="color: #c084fc;">model</span> StagingMergeQueueItem {
  id             String   @id @default(cuid())
  ticketId       String
  <span style="color: #f59e0b;">runId</span>          String   <span style="color: #94a3b8;">// &larr; Stored but UNUSED by processor</span>
  organizationId String
  status         String   @default("QUEUED")
  errorMessage   String?
  retryCount     Int      @default(0)
  failureType    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  origin         String?
  ...
}</code></pre>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 12px 0; font-size: 13px;">
        <strong>Note:</strong> The <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">StagingMergeQueueItem</code> stores <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">runId</code> at enqueue time, but the processor ignores it and independently queries <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">findLatestTerminalRun</code>. Using the stored <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">runId</code> would eliminate the <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">findLatestTerminalRun</code> query entirely &mdash; a potential future optimization.
      </div>

      <h3 id="data-sources-and-methodology" style="font-size: 18px; font-weight: 600; margin-top: 28px; margin-bottom: 12px;">A.4 Data Sources &amp; Methodology</h3>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <thead>
            <tr style="background: #334155; color: white;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Source</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Type</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Production PostgreSQL (via Helix Inspect)</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Database query</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Confirmed run existence, status, timestamps, and divergence pattern</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">User-provided screenshots (2)</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Visual evidence</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Both error messages, UI state, timestamp context</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Source code inspection</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Static analysis</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Root cause in <code style="font-size: 12px;">run-lookup.ts</code>, error paths, caller mapping, duplicate detection</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Prisma schema</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Data model</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Confirmed existing columns (<code style="font-size: 12px;">runSummary</code>, <code style="font-size: 12px;">parentRunId</code>) support the fix</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Merge queue architecture docs</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Documentation</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">Confirmed conflict resolution flow and <code style="font-size: 12px;">refreshFromStaging</code> rerun pattern</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer style="background: #1e293b; color: rgba(255,255,255,0.6); padding: 24px; text-align: center; font-size: 13px;">
    <p style="margin: 0;">RSH-743 &middot; Research Report &middot; Generated 2026-06-07 &middot; helix-global-server</p>
  </footer>

</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-07T06:39:13.488Z) [Agent]: Understood — diving into this now. I'll have my take on it in a couple of minutes.
