# Ticket Context

- ticket_id: cmq3cz65u003lb70ugtutr8mn
- short_id: FIX-746
- run_id: cmq3cz668003qb70u7l2929kv
- run_branch: helix/fix/FIX-746-playbook-basic-flow-async-check-example-results
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook Basic Flow | Async Check | Example Results| Helix's interpretation

## Description
There is still no indication that there have been previous checks. If you can see that there were some successful checks, I see a ticket floating around, which is weird but I don't see any actual results.



I click Check again, I see some circles. I leave the page, I come back. I just see the old error message. I don't see any indication that there's another check. Every time I click it, it creates another ticket and that's kind of silly.



I also see nowhere Helix's interpretation. Why don't I see the interpretation anywhere? Why don't they see examples? What's going on with this? 

Look at the previous deployment of this Playbook Basic Flow. It still is not where it needs to go. 



Take a step back. Think about what would make a very beautiful, smooth, slick feature. What would be a beautiful UX

Find all the missing parts, put together all the missing pieces, and let's get this going



And don't guess please. Make sure everything works. Verify things end to end. In the pictures there should be pictures of results. It should be clear that when you leave and come back it's already being checked. I should see Helix's interpretation. Show me the pictures I need to know, nothing more and nothing less. You need to wait until it finishes running. That's fine. Take the time you need.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Playbook Basic Flow &mdash; RSH-727</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 40px 24px; background-color: #f8f9fc;">

<h1 id="playbook-basic-flow" style="font-size: 2em; color: #0f172a; border-bottom: 4px solid #6366f1; padding-bottom: 12px; margin-bottom: 8px;">Playbook Basic Flow</h1>

<p style="font-style: italic; color: #64748b; font-size: 1.05em; margin-bottom: 6px;">RSH-727 &mdash; June 6, 2026</p>
<p style="color: #64748b; font-size: 0.95em; margin-bottom: 24px;">Research analysis of the playbook rule-checking workflow. This report diagnoses why playbook checks require painful manual steps, maps the existing async infrastructure, and delivers a targeted implementation plan across two repositories to make rules and verification inseparable.</p>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- TABLE OF CONTENTS -->
<h2 id="contents" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">Contents</h2>

<ol style="margin: 16px 0; padding-left: 24px; line-height: 2.2;">
<li><a href="#executive-summary" style="color: #6366f1; text-decoration: none;">Executive Summary</a></li>
<li><a href="#problem-statement" style="color: #6366f1; text-decoration: none;">Problem Statement</a></li>
<li><a href="#current-architecture" style="color: #6366f1; text-decoration: none;">Current Architecture</a></li>
<li><a href="#root-cause-analysis" style="color: #6366f1; text-decoration: none;">Root Cause Analysis</a></li>
<li><a href="#architecture-decisions" style="color: #6366f1; text-decoration: none;">Architecture Decisions</a></li>
<li><a href="#implementation-plan-server" style="color: #6366f1; text-decoration: none;">Implementation Plan &mdash; Server</a></li>
<li><a href="#implementation-plan-client" style="color: #6366f1; text-decoration: none;">Implementation Plan &mdash; Client</a></li>
<li><a href="#cross-repo-coordination" style="color: #6366f1; text-decoration: none;">Cross-Repo Coordination</a></li>
<li><a href="#user-scenarios" style="color: #6366f1; text-decoration: none;">User Scenarios</a></li>
<li><a href="#verification-plan" style="color: #6366f1; text-decoration: none;">Verification Plan</a></li>
<li><a href="#risk-assessment" style="color: #6366f1; text-decoration: none;">Risk Assessment</a></li>
<li><a href="#future-considerations" style="color: #6366f1; text-decoration: none;">Future Considerations</a></li>
<li><a href="#evidence-sources" style="color: #6366f1; text-decoration: none;">Evidence Sources</a></li>
</ol>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- EXECUTIVE SUMMARY -->
<!-- ============================================================ -->
<h2 id="executive-summary" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">1. Executive Summary</h2>

<p>Bottom line: <strong>the async infrastructure is already sound.</strong> The playbook feature has a fully functional fire-and-forget check execution pipeline, result ingestion, and polling mechanism. The problem is purely orchestration &mdash; <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createRule</code> and <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">updateRule</code> never call the existing <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck</code> function &mdash; and the UI doesn&rsquo;t surface the results that already exist.</p>

<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #166534;">Key Finding</p>
<p style="margin: 0; color: #15803d;">Six targeted changes across 5 files in 2 repos fix the entire workflow. No new dependencies. No schema migrations. No changes to the existing check engine.</p>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.95em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Area</th>
<th style="padding: 10px 12px; text-align: center; border: 1px solid #334155;">Status</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Impact</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Async check infrastructure</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 10px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.85em;">SOUND</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Fire-and-forget execution, result ingestion, polling &mdash; all working correctly</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Auto-check on create</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 10px; border-radius: 4px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.85em;">MISSING</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">createRule returns immediately without triggering any check</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Auto-check on edit</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 10px; border-radius: 4px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.85em;">MISSING</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">updateRule handles fields but never calls createCheck</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Post-create navigation</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 10px; border-radius: 4px; background: #fef3c7; color: #92400e; font-weight: 600; font-size: 0.85em;">WRONG TARGET</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Navigates to list page instead of detail page where progress shows</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">List page check status</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 10px; border-radius: 4px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.85em;">HARDCODED</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">&ldquo;Last Check&rdquo; column always displays &ldquo;never&rdquo; regardless of actual data</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Check persistence</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 10px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.85em;">SOUND</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">latestCheckId persists server-side; detail page fallback works on return</td>
</tr>
</tbody>
</table>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- PROBLEM STATEMENT -->
<!-- ============================================================ -->
<h2 id="problem-statement" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">2. Problem Statement</h2>

<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 16px 0;">
<p style="margin: 0 0 12px 0; font-weight: 700; color: #991b1b; font-size: 1.05em;">User Report (verbatim)</p>
<blockquote style="margin: 0; padding: 12px 16px; border-left: 3px solid #f87171; background: #fff5f5; border-radius: 0 6px 6px 0; color: #7f1d1d; font-style: italic;">
&ldquo;I created a rule. The rule got saved. I went in, I hit check. It started checking. I navigated out and I came back and it&rsquo;s like it never happened.&rdquo;
</blockquote>
</div>

<p>The user identifies three fundamental problems:</p>

<ol>
<li><strong>Manual check trigger</strong> &mdash; Creating or editing a rule does nothing. The user must separately click &ldquo;Check&rdquo; on the detail page. There is no concept of a rule without verification.</li>
<li><strong>Synchronous waiting</strong> &mdash; Checks take several minutes but the UI demands the user stay on the page. Navigating away loses visibility of check progress.</li>
<li><strong>No at-a-glance status</strong> &mdash; The rule list page always shows &ldquo;never&rdquo; for the Last Check column, even when checks exist and have completed.</li>
</ol>

<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
<p style="margin: 0 0 4px 0; font-weight: 700; color: #1e40af;">Design Principle</p>
<p style="margin: 0; color: #1d4ed8;">&ldquo;There is no such thing as a rule without verifying, without checking.&rdquo; Rules and checks are inseparable. Auto-check is the default, not an optional step.</p>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- CURRENT ARCHITECTURE -->
<!-- ============================================================ -->
<h2 id="current-architecture" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">3. Current Architecture</h2>

<h3 id="server-side-stack" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Server Stack</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.95em;">
<tbody>
<tr style="background: #f8fafc;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600; width: 35%;">Runtime</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Node.js + Express</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">ORM</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Prisma 6.19.2 (file-based migrations)</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Data Model</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">PlaybookRule</code> (with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code>, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">checks[]</code> relation) &rarr; <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">PlaybookRuleCheck</code></td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">API Surface</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">8 playbook routes in <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">api.ts</code> (L480-488)</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Check Engine</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Fire-and-forget: RUNNING row &rarr; PLAYBOOK_CHECK ticket &rarr; <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">void startQueuedRunForTicketInOrganization</code></td>
</tr>
</tbody>
</table>

<h3 id="client-side-stack" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Client Stack</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.95em;">
<tbody>
<tr style="background: #f8fafc;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600; width: 35%;">Framework</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">React 19 + TypeScript strict + Vite 7</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Data Fetching</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">TanStack Query 5 with <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">queryOptions</code> pattern</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Routing</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">React Router v7 (<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">useNavigate</code>, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">useParams</code>)</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Styling</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Tailwind CSS v4</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Polling</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbookCheckQueryOptions</code> &mdash; 5s refetch while RUNNING, stops on terminal</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">Resilience</td>
<td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">displayCheckId = activeCheckId ?? rule.latestCheckId</code> (playbook-detail.tsx:43)</td>
</tr>
</tbody>
</table>

<h3 id="what-already-works" style="font-size: 1.2em; color: #334155; margin-top: 24px;">What Already Works</h3>

<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
<ul style="margin: 0; padding-left: 20px;">
<li><strong>Async execution</strong> &mdash; <code style="background: #dcfce7; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck</code> creates a RUNNING row, spawns a PLAYBOOK_CHECK ticket, and fire-and-forget starts the run. The backend async pattern is correct.</li>
<li><strong>Result ingestion</strong> &mdash; <code style="background: #dcfce7; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">tryIngestPlaybookCheckResult</code> processes results post-run and updates <code style="background: #dcfce7; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code> on the rule.</li>
<li><strong>Error handling</strong> &mdash; Checks are never stuck in RUNNING &mdash; failures are caught and marked ERROR.</li>
<li><strong>Polling</strong> &mdash; 5s interval while RUNNING, stops on terminal states (PASS/FAIL/ERROR).</li>
<li><strong>Navigation resilience</strong> &mdash; <code style="background: #dcfce7; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code> is server-persisted; completed checks are always visible on return.</li>
<li><strong>Non-NetSuite guard</strong> &mdash; GENERAL orgs get an ERROR check record, not a crash.</li>
</ul>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- ROOT CAUSE ANALYSIS -->
<!-- ============================================================ -->
<h2 id="root-cause-analysis" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">4. Root Cause Analysis</h2>

<h3 id="server-root-causes" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Server-Side Root Causes</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.95em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">ID</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Root Cause</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Evidence</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">RC-S1</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createRule</code> does not trigger a check</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbook-service.ts:36-49</code> &mdash; creates the rule in DRAFT status and returns immediately. No reference to <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck</code> anywhere in the function.</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">RC-S2</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">updateRule</code> does not trigger a check</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbook-service.ts:55-85</code> &mdash; handles summary, domain, and status updates but never calls <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck</code>.</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">RC-S3</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">List endpoint returns no check data</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbook-service.ts:11-16</code> &mdash; <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">findMany</code> returns rule fields only, no check relations included.</td>
</tr>
</tbody>
</table>

<h3 id="client-root-causes" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Client-Side Root Causes</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.95em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">ID</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Root Cause</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Evidence</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">RC-C1</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Create navigates to list, not detail</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbook.ts:39</code> &mdash; <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">navigate("/playbook")</code> goes to list page where check progress is invisible.</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">RC-C2</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Update mutation has no check awareness</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbook.ts:60-62</code> &mdash; only invalidates rules query. However, existing invalidation + remount cycle handles this naturally (no change needed).</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">RC-C3</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">&ldquo;Last Check&rdquo; is hardcoded to &ldquo;never&rdquo;</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">playbook.tsx:152</code> &mdash; renders a static <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">&lt;span&gt;never&lt;/span&gt;</code> for every row, ignoring all check data.</td>
</tr>
</tbody>
</table>

<h3 id="the-gap" style="font-size: 1.2em; color: #334155; margin-top: 24px;">The Gap Visualized</h3>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0;">
<p style="margin: 0 0 12px 0; font-weight: 600; color: #334155;">Current Flow (broken)</p>
<div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.85em; line-height: 1.6; color: #475569;">
<p style="margin: 4px 0;">Create Rule &rarr; Save to DB &rarr; Return <code style="background: #fef2f2; padding: 2px 6px; border-radius: 3px; color: #991b1b;">{ rule }</code> &rarr; Navigate to <code style="background: #fef2f2; padding: 2px 6px; border-radius: 3px; color: #991b1b;">/playbook</code> (list)</p>
<p style="margin: 4px 0; color: #94a3b8;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &uarr; No check triggered. &ldquo;never&rdquo; forever.</p>
</div>
<p style="margin: 16px 0 12px 0; font-weight: 600; color: #334155;">Target Flow (fixed)</p>
<div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.85em; line-height: 1.6; color: #475569;">
<p style="margin: 4px 0;">Create Rule &rarr; Save to DB &rarr; <span style="color: #16a34a; font-weight: 600;">createCheck()</span> &rarr; <span style="color: #16a34a; font-weight: 600;">set latestCheckId</span> &rarr; Return <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 3px; color: #166534;">{ rule, check }</code> &rarr; Navigate to <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 3px; color: #166534;">/playbook/{id}</code> (detail)</p>
<p style="margin: 4px 0; color: #94a3b8;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &uarr; Check runs async. User sees spinner. Returns later &rarr; results visible.</p>
</div>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- ARCHITECTURE DECISIONS -->
<!-- ============================================================ -->
<h2 id="architecture-decisions" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">5. Architecture Decisions</h2>

<p>Six architecture decisions shape the implementation. Each was evaluated against alternatives with clear rejection rationale.</p>

<!-- Decision 1 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #eef2ff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
<p style="margin: 0; font-weight: 700; color: #3730a3;">Decision 1: Server-side auto-check trigger</p>
</div>
<div style="padding: 16px 20px;">
<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
<thead>
<tr style="background: #f8fafc;">
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Option</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Approach</th>
<th style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0;">Verdict</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Rationale</th>
</tr>
</thead>
<tbody>
<tr style="background: #f0fdf4;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600;">A</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Server-side: <code style="background: #dcfce7; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">createRule/updateRule</code> call <code style="background: #dcfce7; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">createCheck</code> internally</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">CHOSEN</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Robust &mdash; no browser dependency. Atomic &mdash; rule and check logically coupled. Aligns with &ldquo;inseparable&rdquo; principle.</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600;">B</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Client-side chaining after mutation success</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.8em;">REJECTED</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Fragile &mdash; browser close between calls loses the check. Race conditions with navigation. Violates &ldquo;always async&rdquo; principle.</td>
</tr>
</tbody>
</table>
</div>
</div>

<!-- Decision 2 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #eef2ff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
<p style="margin: 0; font-weight: 700; color: #3730a3;">Decision 2: List enrichment strategy</p>
</div>
<div style="padding: 16px 20px;">
<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
<thead>
<tr style="background: #f8fafc;">
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Option</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Approach</th>
<th style="padding: 8px 10px; text-align: center; border: 1px solid #e2e8f0;">Verdict</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Rationale</th>
</tr>
</thead>
<tbody>
<tr style="background: #f0fdf4;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600;">A</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Prisma <code style="background: #dcfce7; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">include</code> with <code style="background: #dcfce7; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">checks: { take: 1, orderBy: { createdAt: 'desc' } }</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">CHOSEN</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Single query. No schema migration. Existing index on <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">ruleId</code> ensures efficiency.</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600;">B</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Add <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">@relation</code> on latestCheckId</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.8em;">REJECTED</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Requires schema migration (out of scope).</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600;">C</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Separate batch-fetch per rule</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.8em;">REJECTED</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">N+1 query pattern; unnecessary complexity.</td>
</tr>
</tbody>
</table>
</div>
</div>

<!-- Decision 3 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #eef2ff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
<p style="margin: 0; font-weight: 700; color: #3730a3;">Decision 3: latestCheckId timing</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 8px 0;">Set <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code> immediately when the check is created, not when it completes.</p>
<p style="margin: 0;"><strong>Why:</strong> The detail page&rsquo;s fallback <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">displayCheckId = activeCheckId ?? rule.latestCheckId</code> needs to pick up the RUNNING check on first navigation. <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">tryIngestPlaybookCheckResult</code> will overwrite with the same check ID on completion &mdash; no conflict.</p>
</div>
</div>

<!-- Decision 4 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #eef2ff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
<p style="margin: 0; font-weight: 700; color: #3730a3;">Decision 4: Content-change-only re-check</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 8px 0;">Only trigger auto-check when <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">summary</code> or <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">domain</code> actually changes. Status-only transitions (DRAFT &rarr; ACTIVE) do not trigger a check.</p>
<p style="margin: 0;"><strong>Why:</strong> The existing rule is already fetched at the start of <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">updateRule</code> (L60-64), so field comparison is straightforward and avoids wasteful checks.</p>
</div>
</div>

<!-- Decision 5 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #eef2ff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
<p style="margin: 0; font-weight: 700; color: #3730a3;">Decision 5: Navigate to detail page after create</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 8px 0;">Change <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">navigate("/playbook")</code> to <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">navigate(`/playbook/${data.rule.id}`)</code>.</p>
<p style="margin: 0;"><strong>Why:</strong> The detail page has the polling mechanism and check progress display. The list page has no real-time updates. This aligns with progressive disclosure &mdash; list for summary, detail for live progress.</p>
</div>
</div>

<!-- Decision 6 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #eef2ff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
<p style="margin: 0; font-weight: 700; color: #3730a3;">Decision 6: No list-page polling</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 8px 0;">The list page shows check status at fetch time (30s staleTime). No active polling for RUNNING checks.</p>
<p style="margin: 0;"><strong>Why:</strong> Progressive disclosure &mdash; list shows snapshot status; detail page provides real-time progress. Adding list polling increases server load for marginal benefit. Users interested in a specific check&rsquo;s progress click into the detail page.</p>
</div>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- IMPLEMENTATION PLAN - SERVER -->
<!-- ============================================================ -->
<h2 id="implementation-plan-server" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">6. Implementation Plan &mdash; Server</h2>

<p><strong>Repository:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">helix-global-server</code> &nbsp;|&nbsp; <strong>Files changed:</strong> 2 &nbsp;|&nbsp; <strong>Schema migrations:</strong> None</p>

<!-- Step 1 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 1: Add auto-check to <code style="color: #a5b4fc;">createRule</code></p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/services/playbook-service.ts</code> (L36-49)</p>
<p style="margin: 0 0 12px 0;"><strong>Changes:</strong></p>
<ul style="margin: 0; padding-left: 20px;">
<li>Add <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">userId: string</code> as a third parameter</li>
<li>After <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">prisma.playbookRule.create()</code>, call <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck(orgId, rule.id, userId)</code></li>
<li>Update rule&rsquo;s <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code> to the check&rsquo;s ID</li>
<li>Return <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">{ rule: updatedRule, check }</code> instead of just the rule</li>
</ul>
<p style="margin: 12px 0 0 0; font-size: 0.9em; color: #64748b;"><strong>Note:</strong> The existing <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck</code> handles all cases internally &mdash; NetSuite orgs get a RUNNING check with fire-and-forget execution; non-NetSuite orgs get an immediate ERROR check record.</p>
</div>
</div>

<!-- Step 2 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 2: Add auto-check to <code style="color: #a5b4fc;">updateRule</code> on content change</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/services/playbook-service.ts</code> (L55-85)</p>
<p style="margin: 0 0 12px 0;"><strong>Changes:</strong></p>
<ul style="margin: 0; padding-left: 20px;">
<li>Add <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">userId: string</code> as a fourth parameter</li>
<li>After update, detect content change: compare <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">existing.summary</code> vs <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">data.summary</code> and <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">existing.domain</code> vs <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">data.domain</code></li>
<li>If content changed &rarr; call <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createCheck()</code>, update <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code>, return <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">{ rule, check }</code></li>
<li>If status-only change &rarr; return <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">{ rule }</code> (no check triggered)</li>
</ul>
</div>
</div>

<!-- Step 3 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 3: Enrich <code style="color: #a5b4fc;">listRules</code> with latest check data</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/services/playbook-service.ts</code> (L11-16)</p>
<p style="margin: 0 0 12px 0;"><strong>Change:</strong> Add Prisma <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">include</code> to the <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">findMany</code> query:</p>
<pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 0.85em; line-height: 1.5; margin: 12px 0;"><code>include: {
  checks: {
    take: 1,
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, checkedAt: true }
  }
}</code></pre>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">Uses existing <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">@@index([ruleId])</code> on PlaybookRuleCheck (schema.prisma:1312) for efficient lookup.</p>
</div>
</div>

<!-- Step 4 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 4: Update controllers</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/controllers/playbook-controller.ts</code></p>
<table style="width: 100%; border-collapse: collapse; font-size: 0.9em; margin: 12px 0;">
<thead>
<tr style="background: #f8fafc;">
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Handler</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Change</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">createRule</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Pass <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">auth.user.id</code>; return <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">{ rule, check }</code></td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">updateRule</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Pass <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">auth.user.id</code>; return <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">{ rule, check? }</code></td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">listRules</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Map <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">checks[0]</code> to <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 2px; font-size: 0.9em;">latestCheck</code> on each rule</td>
</tr>
</tbody>
</table>
<p style="margin: 8px 0 0 0; font-size: 0.9em; color: #64748b;"><strong>Unchanged:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">triggerCheck</code>, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">getPlaybookCheck</code>, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">listPlaybookChecks</code>, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">getRule</code>, <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">deleteRule</code></p>
</div>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- IMPLEMENTATION PLAN - CLIENT -->
<!-- ============================================================ -->
<h2 id="implementation-plan-client" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">7. Implementation Plan &mdash; Client</h2>

<p><strong>Repository:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">helix-global-client</code> &nbsp;|&nbsp; <strong>Files changed:</strong> 3 &nbsp;|&nbsp; <strong>New dependencies:</strong> None</p>

<!-- Client Step 1 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 1: Update types for enriched API responses</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/types/api.ts</code></p>
<ul style="margin: 0; padding-left: 20px;">
<li>Add <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheck?: { id: string; status: PlaybookCheckStatus; checkedAt: string | null } | null</code> to <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">PlaybookRule</code></li>
<li>Add <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">check?: PlaybookRuleCheck</code> to <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">PlaybookRuleResponse</code></li>
</ul>
<p style="margin: 12px 0 0 0; font-size: 0.9em; color: #64748b;">Additive, backward-compatible changes. Existing code continues to work unchanged.</p>
</div>
</div>

<!-- Client Step 2 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 2: Navigate to detail page after create</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/api/playbook.ts</code> (L39)</p>
<p style="margin: 0 0 8px 0;"><strong>Change:</strong> One-line fix in <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">useCreatePlaybookRule</code>:</p>
<pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 0.85em; line-height: 1.5; margin: 12px 0;"><code><span style="color: #f87171;">- navigate("/playbook");</span>
<span style="color: #4ade80;">+ navigate(`/playbook/${data.rule.id}`);</span></code></pre>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">The <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">onSuccess</code> callback receives <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">data</code> (a <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">PlaybookRuleResponse</code>) so <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">data.rule.id</code> is always available.</p>
</div>
</div>

<!-- Client Step 3 -->
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
<div style="background: #1e293b; padding: 10px 20px;">
<p style="margin: 0; color: white; font-weight: 600;">Step 3: Dynamic check status on list page</p>
</div>
<div style="padding: 16px 20px;">
<p style="margin: 0 0 12px 0;"><strong>File:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/routes/playbook.tsx</code> (L152)</p>
<p style="margin: 0 0 8px 0;"><strong>Replace:</strong> The hardcoded <code style="background: #fef2f2; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">&lt;span&gt;never&lt;/span&gt;</code> with conditional rendering:</p>
<table style="width: 100%; border-collapse: collapse; font-size: 0.9em; margin: 12px 0;">
<thead>
<tr style="background: #f8fafc;">
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Condition</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Display</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Style</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">latestCheck</code> is null</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-style: italic; color: #9ca3af;">never</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">text-xs text-neutral-400 italic (same as current)</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">status === "RUNNING"</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><span style="color: #6366f1;">Running...</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">text-xs text-indigo-500 with subtle animation</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">status === "PASS"</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><span style="color: #16a34a; font-weight: 600;">Pass</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">text-xs text-emerald-600 font-medium</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">status === "FAIL"</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><span style="color: #d97706; font-weight: 600;">Fail</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">text-xs text-amber-600 font-medium</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">status === "ERROR"</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><span style="color: #dc2626; font-weight: 600;">Error</span></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">text-xs text-red-600 font-medium</td>
</tr>
</tbody>
</table>
</div>
</div>

<h3 id="update-mutation-no-changes" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Update Mutation &mdash; No Behavioral Changes Needed</h3>

<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #1e40af;">Why this works automatically</p>
<p style="margin: 0; color: #1d4ed8; font-size: 0.95em;">When <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">useUpdatePlaybookRule</code> succeeds, its <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">onSuccess</code> already invalidates the rules query. This triggers a refetch. Since the server now sets <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code> during <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">updateRule</code>, the refetched rule has the correct <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">latestCheckId</code>. The <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">RuleForm</code> remounts (<code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">key={rule.updatedAt}</code>), resetting <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">activeCheckId</code> to null, but <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">displayCheckId = null ?? rule.latestCheckId</code> picks up the new check. Polling begins automatically.</p>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- CROSS-REPO COORDINATION -->
<!-- ============================================================ -->
<h2 id="cross-repo-coordination" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">8. Cross-Repo Coordination</h2>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0;">
<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
<thead>
<tr style="background: #f8fafc;">
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Client Change</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Server Dependency</th>
<th style="padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0;">Backward Compatible?</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">latestCheck</code> on <code style="font-size: 0.9em;">PlaybookRule</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Server enriched list endpoint (Step 3)</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">YES</span> &mdash; optional field, renders &ldquo;never&rdquo; when absent</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Navigate to <code style="font-size: 0.9em;">/playbook/{id}</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Server sets <code style="font-size: 0.9em;">latestCheckId</code> immediately (Step 1)</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">YES</span> &mdash; detail page works without auto-check</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">check</code> on <code style="font-size: 0.9em;">PlaybookRuleResponse</code></td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Server enriched create/update responses (Steps 1-2)</td>
<td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">YES</span> &mdash; optional field, not consumed in client behavior</td>
</tr>
</tbody>
</table>
</div>

<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0;">
<p style="margin: 0; font-weight: 700; color: #166534;">All client changes are backward-compatible. Either repo can be deployed first without breaking the other.</p>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- USER SCENARIOS -->
<!-- ============================================================ -->
<h2 id="user-scenarios" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">9. User Scenarios</h2>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0; overflow: hidden;">
<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">ID</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Scenario</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Expected Outcome</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-01</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Auto-check fires on new rule creation</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Rule saved &rarr; navigated to detail page &rarr; check-in-progress indicator visible immediately</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-02</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Auto-check fires on rule edit</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Summary/domain change &rarr; new check starts &rarr; detail page shows check-in-progress</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-03</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Check results persist across navigation</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Navigate away &rarr; return later &rarr; completed results displayed via <code style="font-size: 0.9em;">latestCheckId</code> fallback</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-04</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Rule list shows latest check status</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Each row shows actual status (Pass/Fail/Running/Error) and timestamp instead of &ldquo;never&rdquo;</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-05</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Manual recheck still works</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">User clicks Recheck on detail page &rarr; new check starts &rarr; replaces previous results</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-06</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Check in progress visible on list page</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Rule with auto-check running shows &ldquo;Running&rdquo; indicator in Last Check column</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">SCN-07</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Non-NetSuite org gets immediate error status</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Rule saved &rarr; check created with ERROR status &rarr; system doesn&rsquo;t crash</td>
</tr>
</tbody>
</table>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- VERIFICATION PLAN -->
<!-- ============================================================ -->
<h2 id="verification-plan" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">10. Verification Plan</h2>

<h3 id="server-verification" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Server Checks</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Check</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Action</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Expected</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-01</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">npm run typecheck</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Exit 0, no TypeScript errors</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-02</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">npm run lint</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Exit 0, no linting errors</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-03</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">POST /playbook/rules</code> with auth</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Response 201 with <code style="font-size: 0.9em;">{ rule, check }</code>; rule.latestCheckId non-null; check.status is RUNNING or ERROR</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-04</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">GET /playbook/rules</code> with auth</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Rules array with <code style="font-size: 0.9em;">latestCheck</code> on each rule (id, status, checkedAt)</td>
</tr>
</tbody>
</table>

<h3 id="client-verification" style="font-size: 1.2em; color: #334155; margin-top: 24px;">Client Checks</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Check</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Action</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Expected</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-01</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">npm run typecheck</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Exit 0, no TypeScript errors</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-02</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">npm run lint</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Exit 0, no linting errors</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-03</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Create rule via browser</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Navigates to <code style="font-size: 0.9em;">/playbook/{id}</code> (detail page), not <code style="font-size: 0.9em;">/playbook</code> (list page)</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; white-space: nowrap;">CHK-04</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">View rule list page</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Checked rules show status indicators (Running/Pass/Fail/Error); unchecked show &ldquo;never&rdquo;</td>
</tr>
</tbody>
</table>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- RISK ASSESSMENT -->
<!-- ============================================================ -->
<h2 id="risk-assessment" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">11. Risk Assessment</h2>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">#</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Risk</th>
<th style="padding: 10px 12px; text-align: center; border: 1px solid #334155;">Severity</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Mitigation</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;">1</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Queue contention from rapid rule creation</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #fef3c7; color: #92400e; font-weight: 600; font-size: 0.8em;">LOW</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">NetSuite runs are org-level queued. Users create rules individually. No mitigation needed for MVP.</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;">2</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Stale RUNNING status on list page</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">MINIMAL</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">List refreshes at 30s staleTime. Users click into detail for real-time. Progressive disclosure by design.</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;">3</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">latestCheckId semantic change (RUNNING vs terminal)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">MINIMAL</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">tryIngestPlaybookCheckResult</code> overwrites with the same check ID on completion &mdash; no conflict.</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;">4</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">createRule API latency increase</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">MINIMAL</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Adds ~2 DB operations (check row + rule update). Run starts fire-and-forget. Expected &lt;100ms additional.</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;">5</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">No production usage data available</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #fef3c7; color: #92400e; font-weight: 600; font-size: 0.8em;">NOTED</span></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Runtime inspection of PlaybookRule/PlaybookRuleCheck tables was denied. No recent playbook logs found. Feature has low/no production usage.</td>
</tr>
</tbody>
</table>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- FUTURE CONSIDERATIONS -->
<!-- ============================================================ -->
<h2 id="future-considerations" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">12. Future Considerations</h2>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">Real-time notifications</p>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">Replace 5s polling with WebSocket/SSE for check completion push notifications. Reduces server load and improves UX latency.</p>
</div>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">List page polling</p>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">Add conditional <code style="font-size: 0.9em;">refetchInterval</code> to list query when any rule has a RUNNING check. Not needed for MVP.</p>
</div>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">Debounce rapid edits</p>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">Cancel previous RUNNING check before starting a new one if user saves multiple rapid edits. Reduces queue pressure.</p>
</div>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">Check history</p>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">View all past checks for a rule, not just the latest. Enable trend analysis and regression detection.</p>
</div>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">Batch operations</p>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">Re-check all rules at once. Bulk status view for compliance reporting across all playbook rules.</p>
</div>

<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
<p style="margin: 0 0 8px 0; font-weight: 700; color: #334155;">Dashboard summary</p>
<p style="margin: 0; font-size: 0.9em; color: #64748b;">Org-level compliance dashboard showing aggregate pass/fail rates across all playbook rules.</p>
</div>

</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- COMPLETE FILE CHANGE MAP -->
<!-- ============================================================ -->
<h2 id="file-change-map" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">Complete File Change Map</h2>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Repo</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">File</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Change</th>
<th style="padding: 10px 12px; text-align: center; border: 1px solid #334155;">Risk</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;" rowspan="2">helix-global-server</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/services/playbook-service.ts</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Auto-check in createRule/updateRule; enrich listRules</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">LOW</span></td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/controllers/playbook-controller.ts</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Pass userId; map responses</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">LOW</span></td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;" rowspan="3">helix-global-client</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/types/api.ts</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Add latestCheck and check optional fields</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">LOW</span></td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/api/playbook.ts</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">One-line navigation change</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">LOW</span></td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em;">src/routes/playbook.tsx</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Replace hardcoded &ldquo;never&rdquo; with dynamic status</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 0.8em;">LOW</span></td>
</tr>
</tbody>
</table>

<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
<p style="margin: 0; font-weight: 700; color: #166534;">Total: 5 files changed across 2 repos. Zero new dependencies. Zero schema migrations. Zero changes to existing check infrastructure.</p>
</div>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<!-- ============================================================ -->
<!-- EVIDENCE SOURCES -->
<!-- ============================================================ -->
<h2 id="evidence-sources" style="font-size: 1.5em; color: #1e293b; margin-top: 40px; padding: 8px 0; border-left: 4px solid #6366f1; padding-left: 12px;">13. Evidence Sources</h2>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9em;">
<thead>
<tr style="background: #1e293b; color: white;">
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Source</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Type</th>
<th style="padding: 10px 12px; text-align: left; border: 1px solid #334155;">Key Finding</th>
</tr>
</thead>
<tbody>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">playbook-service.ts</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Source code (server)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">createRule (L36-49) and updateRule (L55-85) never call createCheck; createCheck (L110-185) is fire-and-forget</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">playbook-controller.ts</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Source code (server)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">auth.user.id available via getRequiredOrgAuth; response shapes are { rule } only</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">prisma/schema.prisma</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Schema (server)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">PlaybookRule has latestCheckId and checks[] relation; ruleId index exists on checks</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">playbook.ts</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Source code (client)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">useCreatePlaybookRule navigates to /playbook (L39); existing query invalidation pattern</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">playbook.tsx</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Source code (client)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Hardcoded &ldquo;never&rdquo; at L152; no dynamic check data</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">playbook-detail.tsx</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Source code (client)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">displayCheckId fallback works (L43); key={rule.updatedAt} forces remount (L368); polling at 5s</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><code style="font-size: 0.9em;">api.ts</code></td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Types (client)</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">PlaybookRule has latestCheckId but no check details; PlaybookRuleResponse is { rule } only</td>
</tr>
<tr style="background: #f8fafc;">
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Runtime Inspection</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Database/Logs</td>
<td style="padding: 10px 12px; border: 1px solid #e2e8f0;">Permission denied for PlaybookRule tables. No recent playbook logs &mdash; feature has low/no production usage.</td>
</tr>
</tbody>
</table>

<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 32px 0;">

<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
<p style="margin: 0; font-size: 0.85em; color: #94a3b8;">RSH-727 &mdash; Playbook Basic Flow &mdash; Research Report &mdash; Generated June 6, 2026</p>
</div>

</body>
</html>

## Attachments
- (none)
