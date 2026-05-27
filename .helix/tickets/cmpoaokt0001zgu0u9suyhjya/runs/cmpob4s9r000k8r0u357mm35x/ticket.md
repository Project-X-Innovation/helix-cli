# Ticket Context

- ticket_id: cmpoaokt0001zgu0u9suyhjya
- short_id: BLD-615
- run_id: cmpob4s9r000k8r0u357mm35x
- run_branch: helix/build/BLD-615-implement-helix-evals-regression
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Implement: Helix Evals Regression

## Description
Build ticket to implement research from RSH-611.

I want a basic e2e crossed with evals regression suite



If you inspect you will see we have some 15 or so evals in the evals org (I'll add documentation too)



The idea is that the suite would use something like playwright to manually enter each ticket eval, assure it is "successful" (whatever that means) and function as a basic suite for regression of the whole app. I'm not currently concerned where this will run long term, for now you can assume it will be run by running npm run test in the regression suite, after already running the dev server and client



The priority is not to evaluate the quality of the agent, but to function as at least a regression test.



The fact is we release deployments several times a day and the velocity is too high to manage manually.



So do some research and think about how to accomplish this. Feel free to make your own suggestions. This is my suggestion: use the evals within an end-to-end test where you put in this content in the ticket and you wait till it finishes. How you wait is something for you to figure out as well because it can be an hour or two. I don't mind if evals run over 24 hours. That's okay for now. That's fine. 



Feel free to brainstorm better ways to do what I'm doing but this is one way. 



This idea is not quite eval. It's kind of using the eval's end-to-end test, regression test form to get the best of both worlds. 

Feel free, after brainstorming, to include a basic plan to get something up because even a minimal plan here helps us a lot. It keeps us at least from pushing things that are disasters and then feel free to stack on top improvements. 

And yes, I know many are failing, that's good, they will pass as we improve.



&nbsp;

&nbsp;

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RSH-611: Helix Evals Regression — UI-Driven Playwright Test Suite Blueprint</title>
<style>
  :root {
    --bg: #ffffff;
    --fg: #1a1a2e;
    --accent: #4361ee;
    --accent-light: #eef0ff;
    --success: #10b981;
    --success-bg: #ecfdf5;
    --fail: #ef4444;
    --fail-bg: #fef2f2;
    --warn: #f59e0b;
    --warn-bg: #fffbeb;
    --muted: #6b7280;
    --border: #e5e7eb;
    --code-bg: #f8f9fc;
    --code-border: #d1d5db;
    --heading-color: #111827;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    line-height: 1.7;
    color: var(--fg);
    background: var(--bg);
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
  h1 { font-size: 1.75rem; color: var(--heading-color); margin-bottom: 0.25rem; }
  h2 { font-size: 1.4rem; color: var(--heading-color); margin-top: 2.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid var(--accent); padding-bottom: 0.3rem; }
  h3 { font-size: 1.15rem; color: var(--heading-color); margin-top: 1.5rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1rem; color: var(--muted); margin-top: 1.2rem; margin-bottom: 0.4rem; }
  p { margin-bottom: 0.75rem; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  ul, ol { margin-bottom: 0.75rem; padding-left: 1.5rem; }
  li { margin-bottom: 0.3rem; }
  strong { color: var(--heading-color); }
  code {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.88em;
    background: var(--code-bg);
    border: 1px solid var(--code-border);
    border-radius: 3px;
    padding: 0.15em 0.35em;
  }
  pre {
    background: var(--code-bg);
    border: 1px solid var(--code-border);
    border-radius: 6px;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    line-height: 1.6;
  }
  pre code { background: none; border: none; padding: 0; font-size: inherit; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.9rem; }
  th, td { padding: 0.5rem 0.75rem; border: 1px solid var(--border); text-align: left; vertical-align: top; }
  th { background: var(--accent-light); font-weight: 600; color: var(--heading-color); }
  tr:nth-child(even) { background: #fafafa; }
  .badge { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; }
  .badge-pass { background: var(--success-bg); color: var(--success); }
  .badge-fail { background: var(--fail-bg); color: var(--fail); }
  .badge-poll { background: var(--warn-bg); color: var(--warn); }
  .badge-deferred { background: #f3f4f6; color: var(--muted); }
  .callout { border-left: 4px solid var(--accent); background: var(--accent-light); padding: 0.75rem 1rem; margin-bottom: 1rem; border-radius: 0 6px 6px 0; }
  .callout-warn { border-left-color: var(--warn); background: var(--warn-bg); }
  .callout-success { border-left-color: var(--success); background: var(--success-bg); }
  .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
  .toc { background: #f9fafb; border: 1px solid var(--border); border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0 2rem; }
  .toc ol { counter-reset: toc-counter; list-style: none; padding-left: 0; }
  .toc > ol > li { counter-increment: toc-counter; margin-bottom: 0.2rem; }
  .toc > ol > li::before { content: counter(toc-counter) ". "; font-weight: 600; color: var(--accent); }
  .toc ul { list-style: disc; padding-left: 1.5rem; margin-top: 0.2rem; margin-bottom: 0.4rem; }
  .diagram { background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 6px; padding: 1rem; font-family: monospace; font-size: 0.82rem; white-space: pre; overflow-x: auto; margin-bottom: 1rem; line-height: 1.5; }
  .file-tree { background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 6px; padding: 1rem 1.25rem; font-family: monospace; font-size: 0.85rem; margin-bottom: 1rem; line-height: 1.7; }
  hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
  footer { color: var(--muted); font-size: 0.8rem; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); }
</style>
</head>
<body>

<h1>RSH-611: Helix Evals Regression</h1>
<p class="meta">
  <strong>UI-Driven Playwright Test Suite Blueprint</strong> &mdash; Iteration 2<br>
  Ticket: RSH-611 &nbsp;|&nbsp; Date: May 27, 2026 &nbsp;|&nbsp; Source: NetSuite E2E Eval Sprint Deliverable (PDF, 22 pages)
</p>

<nav class="toc">
<strong>Table of Contents</strong>
<ol>
  <li><a href="#executive-summary">Executive Summary</a></li>
  <li><a href="#architecture-overview">Architecture Overview (Agent Role &amp; Passive Observer)</a></li>
  <li><a href="#playwright-ui-flow">Playwright UI Interaction Flow</a>
    <ul>
      <li><a href="#login-flow">Login</a></li>
      <li><a href="#ticket-creation-flow">Ticket Creation</a></li>
      <li><a href="#status-polling">Status Polling</a></li>
    </ul>
  </li>
  <li><a href="#two-phase-assertion">Verifying the N Result: Two-Phase Assertion Pattern</a></li>
  <li><a href="#terminal-classification">Terminal Status Classification</a></li>
  <li><a href="#eval-catalog">Eval Catalog (13 Active Evals)</a></li>
  <li><a href="#project-scaffolding">Project Scaffolding Blueprint</a></li>
  <li><a href="#expected-baseline">Expected Baseline Results</a></li>
  <li><a href="#risks-mitigations">Risks &amp; Mitigations</a></li>
  <li><a href="#future-enhancements">Future Enhancements</a></li>
  <li><a href="#appendix-sources">Appendix: Source File References</a></li>
  <li><a href="#appendix-eval-details">Appendix: Eval Details &amp; Failure Analysis</a></li>
</ol>
</nav>

<hr>

<!-- ================================================================== -->
<h2 id="executive-summary">1. Executive Summary</h2>

<p>Helix ships multiple deployments per day with no automated regression safety net. An eval catalog of 13 active tickets (from a sprint of 15 total) already exists, but no tooling runs them automatically through the UI or verifies their outcomes.</p>

<p>This report provides an actionable blueprint for building a <strong>Playwright-based UI regression test suite</strong> in the <code>helix-regression-testing</code> repo. The suite:</p>

<ul>
  <li><strong>Creates tickets through the real Helix UI</strong> &mdash; login page, ticket creation form with TipTap editor, "Create &amp; Run" button</li>
  <li><strong>Verifies the N result through the browser</strong> &mdash; polls the status badge on the ticket detail page until a terminal state appears</li>
  <li><strong>Enforces strict pass/fail criteria</strong> &mdash; only the 5 passing terminal states (Sandbox ready, Preview ready, Report ready, Deployed, Staging merged) count as PASS; the 4 failing terminal states (Failed, Unverified, Needs Credentials, Impossible Spec) cause the test to FAIL</li>
  <li><strong>Runs with a single command</strong> &mdash; <code>npm run test</code> after starting the dev server</li>
</ul>

<table>
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>Total evals defined</td><td>15</td></tr>
    <tr><td>Active evals (in suite)</td><td>13</td></tr>
    <tr><td>Deferred evals</td><td>2 (Evals 7, 14)</td></tr>
    <tr><td>Expected PASS (current baseline)</td><td>1 (Eval 1 &rarr; Sandbox ready)</td></tr>
    <tr><td>Expected FAIL (current baseline)</td><td>12 (failing terminal states)</td></tr>
    <tr><td>Per-eval timeout</td><td>2 hours</td></tr>
    <tr><td>Total suite time budget</td><td>24+ hours (acceptable)</td></tr>
  </tbody>
</table>

<div class="callout">
  <strong>Key principle:</strong> This is a <em>regression test</em>, not an eval quality tool. The 12 currently-failing evals are the expected baseline. The suite catches regressions &mdash; if Eval 1 (currently passing) starts failing after a deployment, that signals a regression.
</div>

<hr>

<!-- ================================================================== -->
<h2 id="architecture-overview">2. Architecture Overview</h2>

<h3>Agent Role vs. Playwright Role</h3>

<p>A common question is: <em>"In what role does the agent play?"</em> The answer: <strong>Playwright is not an agent.</strong></p>

<table>
  <thead><tr><th>Component</th><th>Role</th><th>What It Does</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Helix Agent</strong></td>
      <td>Server-side AI pipeline</td>
      <td>Processes tickets through steps (scout, diagnosis, implementation, verification, deployment). Runs autonomously on <code>helix-global-server</code> after ticket submission. Takes 30 min &ndash; 2 hours per eval.</td>
    </tr>
    <tr>
      <td><strong>Playwright</strong></td>
      <td>Browser automation / passive observer</td>
      <td>Drives the UI to submit tickets and read results. After clicking "Create &amp; Run", Playwright <strong>waits passively</strong> &mdash; it does not run, control, or accelerate the agent pipeline. It only reloads the page and reads the status badge.</td>
    </tr>
    <tr>
      <td><strong>Helix Client SPA</strong></td>
      <td>Browser application</td>
      <td>Renders login, ticket creation, and ticket detail pages. Displays the <code>StatusBadge</code> component that Playwright reads.</td>
    </tr>
  </tbody>
</table>

<h3>Interaction Sequence Diagram</h3>

<div class="diagram">  Playwright          Browser/SPA         Server API          Agent Pipeline
     |                    |                    |                    |
     |-- navigate /login -&gt;|                    |                    |
     |-- fill email ------&gt;|                    |                    |
     |-- fill password ---&gt;|                    |                    |
     |-- click Sign In ---&gt;|--- POST /login ---&gt;|                    |
     |                    |&lt;-- token + redirect-|                    |
     |-- save storageState |                    |                    |
     |                    |                    |                    |
     |== FOR EACH EVAL ============================================|
     |                    |                    |                    |
     |-- navigate /new ---&gt;|                    |                    |
     |-- fill title -----&gt;|                    |                    |
     |-- fill description &gt;|                    |                    |
     |-- click Create&amp;Run &gt;|--- POST /tickets -&gt;|                    |
     |                    |&lt;-- redirect /id ---|                    |
     |                    |                    |--- queue ticket ---&gt;|
     |                    |                    |                    |
     |  [PASSIVE WAIT - Playwright only polls]  |--- scout --------&gt;|
     |                    |                    |--- diagnose ------&gt;|
     |-- reload page ----&gt;|--- GET /ticket ---&gt;|--- implement ----&gt;|
     |&lt;-- read badge -----|&lt;-- status: Running-|--- verify -------&gt;|
     |   (not terminal,   |                    |--- deploy -------&gt;|
     |    wait 30s...)    |                    |                    |
     |                    |                    |                    |
     |-- reload page ----&gt;|--- GET /ticket ---&gt;|                    |
     |&lt;-- read badge -----|&lt;-- status: Done ---|                    |
     |   (TERMINAL!)      |                    |                    |
     |                    |                    |                    |
     |-- Phase 1: terminal found                                    |
     |-- Phase 2: assert passing label                              |
     |-- Report PASS or FAIL                                        |
     |                    |                    |                    |</div>

<div class="callout-success callout">
  <strong>Why this works as a regression test:</strong> If a code change breaks the agent pipeline, scout, implementation, or verification steps, the eval will fail to reach a passing terminal state. Playwright catches this by reading the final status from the UI. If a code change breaks the UI itself (routing, form rendering, status display), Playwright catches that too because the interaction will fail.
</div>

<hr>

<!-- ================================================================== -->
<h2 id="playwright-ui-flow">3. Playwright UI Interaction Flow</h2>

<h3 id="login-flow">3a. Login Flow</h3>

<p>The auth flow uses the proven pattern from <code>helix-global-client/e2e/auth.setup.ts</code>. It runs once as a Playwright setup project, and all subsequent tests reuse the saved <code>storageState</code>.</p>

<table>
  <thead><tr><th>Step</th><th>Selector / Action</th><th>Source Evidence</th></tr></thead>
  <tbody>
    <tr><td>Navigate to login</td><td><code>page.goto('/login')</code></td><td><code>auth.setup.ts:44</code></td></tr>
    <tr><td>Fill email</td><td><code>page.getByLabel(/email/i).fill(email)</code></td><td><code>auth.setup.ts:49</code></td></tr>
    <tr><td>Fill password</td><td><code>page.getByLabel(/password/i).fill(password)</code></td><td><code>auth.setup.ts:54</code></td></tr>
    <tr><td>Click submit</td><td><code>page.getByRole('button', { name: /sign in/i }).click()</code></td><td><code>auth.setup.ts:57</code></td></tr>
    <tr><td>Wait for redirect</td><td><code>page.waitForURL(/^(?!.*\/login)/, { timeout: 15_000 })</code></td><td><code>auth.setup.ts:60</code></td></tr>
    <tr><td>Verify token</td><td><code>localStorage.getItem('helix_access_token')</code></td><td><code>auth.setup.ts:63</code></td></tr>
    <tr><td>Save state</td><td><code>page.context().storageState({ path: authFile })</code></td><td><code>auth.setup.ts:70</code></td></tr>
  </tbody>
</table>

<pre><code>// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) =&gt; {
  const email = process.env.E2E_LOGIN_EMAIL ?? 'support@projectxinnovation.com';
  const password = process.env.E2E_LOGIN_PASSWORD;
  if (!password) throw new Error('E2E_LOGIN_PASSWORD env var required');

  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/^(?!.*\/login)/, { timeout: 15_000 });

  // Verify auth token was stored
  const token = await page.evaluate(() =&gt;
    localStorage.getItem('helix_access_token')
  );
  expect(token).toBeTruthy();

  // Save signed-in state for reuse across tests
  await page.context().storageState({ path: authFile });
});</code></pre>

<h3 id="ticket-creation-flow">3b. Ticket Creation Flow</h3>

<p>For each eval, Playwright navigates to the ticket creation form, fills the title and description, and submits.</p>

<table>
  <thead><tr><th>Step</th><th>Selector / Action</th><th>Source Evidence</th></tr></thead>
  <tbody>
    <tr><td>Navigate</td><td><code>page.goto('/tickets/new')</code></td><td>Route from <code>create-ticket.tsx</code></td></tr>
    <tr><td>Fill title</td><td><code>page.locator('#ticket-title').fill(evalTitle)</code></td><td><code>create-ticket.tsx:432</code> — <code>id="ticket-title"</code></td></tr>
    <tr><td>Fill description</td><td><code>page.locator('.tiptap').fill(evalDescription)</code></td><td><code>rich-text-editor.tsx:463</code> — TipTap <code>contenteditable</code> div with <code>.tiptap</code> class</td></tr>
    <tr><td>Submit</td><td><code>page.getByRole('button', { name: /create &amp; run/i }).click()</code></td><td><code>create-ticket.tsx:699</code> — button text "Create &amp; Run" when <code>saveMode === "run"</code></td></tr>
    <tr><td>Wait for redirect</td><td><code>page.waitForURL(/\/tickets\/[a-zA-Z0-9]+/)</code></td><td><code>create-ticket.tsx:370</code> — navigates to <code>/tickets/${data.ticket.id}</code></td></tr>
  </tbody>
</table>

<div class="callout-warn callout">
  <strong>TipTap Editor Fallback:</strong> Playwright's <code>fill()</code> supports <code>[contenteditable]</code> elements. If at runtime <code>fill()</code> does not sync TipTap/ProseMirror's internal document model, use the fallback: <code>page.locator('.tiptap').click()</code> then <code>page.keyboard.type(text)</code>. This is slower but guaranteed to work because each keystroke is processed by ProseMirror's input handlers.
</div>

<pre><code>// Ticket creation helper (from tests/helpers.ts)
async function createEvalTicket(
  page: Page,
  eval: EvalDefinition
): Promise&lt;string&gt; {
  await page.goto('/tickets/new');
  await page.waitForLoadState('networkidle');

  // Fill title
  await page.locator('#ticket-title').fill(eval.title);

  // Fill description (TipTap contenteditable)
  const editor = page.locator('.tiptap');
  try {
    await editor.fill(eval.description);
  } catch {
    // Fallback: click + type for TipTap compatibility
    await editor.click();
    await page.keyboard.type(eval.description);
  }

  // Submit
  await page.getByRole('button', { name: /create &amp; run/i }).click();

  // Wait for redirect to ticket detail page
  await page.waitForURL(/\/tickets\/[a-zA-Z0-9]+/, { timeout: 30_000 });

  return page.url();
}</code></pre>

<h3 id="status-polling">3c. Status Polling via Page Reload</h3>

<p>After ticket submission, Playwright enters a passive polling loop. Every 30 seconds, it reloads the page and reads the status badge text. This continues until a terminal label appears or the 2-hour timeout is reached.</p>

<p><strong>Why reload instead of relying on SPA auto-polling?</strong> The SPA only auto-polls for <code>RUNNING</code>/<code>MERGING</code> states (<code>ticket-detail.tsx:1469</code>). Other non-terminal states might not trigger auto-refresh. Page reload guarantees fresh server state regardless of SPA behavior.</p>

<p><strong>Status badge locator:</strong> <code>page.locator('span.rounded-full.text-xs.font-medium').first()</code></p>
<p>Source: <code>status-badge.tsx:30-50</code> renders a <code>&lt;span&gt;</code> with classes <code>inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium</code> plus status-specific classes. The <code>.first()</code> call targets the ticket-level badge (DOM order: first badge instance on the detail page at <code>ticket-detail.tsx:2066</code>).</p>

<hr>

<!-- ================================================================== -->
<h2 id="two-phase-assertion">4. Verifying the N Result: Two-Phase Assertion Pattern</h2>

<p>The "N result" is the terminal status that determines whether an eval passes or fails the regression test. Verifying it requires a <strong>two-phase pattern</strong> because we cannot predict which specific passing status an eval will reach &mdash; only that it should be one of the 5 passing labels.</p>

<h3>Phase 1: Poll Until Terminal</h3>

<p>Use Playwright's <code>expect.poll()</code> to repeatedly reload the page and read the status badge text. The callback returns <code>true</code> when the text matches <strong>any</strong> terminal label (passing OR failing). A closure variable captures the observed text for Phase 2.</p>

<h3>Phase 2: Assert Passing</h3>

<p>After Phase 1 resolves (terminal found), a separate <code>expect()</code> assertion checks that the captured status text is in the <code>PASSING_LABELS</code> set. If the status is a failing terminal label (e.g., "Failed"), this assertion fails — correctly failing the test.</p>

<h3>Behavior Matrix</h3>

<table>
  <thead><tr><th>Scenario</th><th>Phase 1 Result</th><th>Phase 2 Result</th><th>Test Outcome</th></tr></thead>
  <tbody>
    <tr>
      <td>Eval reaches "Sandbox ready"</td>
      <td><span class="badge badge-pass">Terminal found</span></td>
      <td>"Sandbox ready" is in PASSING set</td>
      <td><span class="badge badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td>Eval reaches "Failed"</td>
      <td><span class="badge badge-pass">Terminal found</span></td>
      <td>"Failed" is NOT in PASSING set</td>
      <td><span class="badge badge-fail">FAIL</span></td>
    </tr>
    <tr>
      <td>Eval reaches "Needs Credentials"</td>
      <td><span class="badge badge-pass">Terminal found</span></td>
      <td>"Needs Credentials" is NOT in PASSING set</td>
      <td><span class="badge badge-fail">FAIL</span></td>
    </tr>
    <tr>
      <td>Eval never reaches terminal (stuck in "Running")</td>
      <td><span class="badge badge-fail">Timeout (2h)</span></td>
      <td>Never reached</td>
      <td><span class="badge badge-fail">FAIL (timeout)</span></td>
    </tr>
  </tbody>
</table>

<h3>Complete Code Pattern</h3>

<pre><code>// tests/helpers.ts — Status label constants
export const PASSING_LABELS = [
  'Sandbox ready',
  'Preview ready',
  'Report ready',
  'Deployed',
  'Staging merged',
] as const;

export const FAILING_LABELS = [
  'Failed',
  'Unverified',
  'Needs Credentials',
  'Impossible Spec',
] as const;

export const TERMINAL_LABELS = [
  ...PASSING_LABELS,
  ...FAILING_LABELS,
] as const;

// Status badge locator
export const STATUS_BADGE_SELECTOR =
  'span.rounded-full.text-xs.font-medium';


// tests/evals.spec.ts — Two-phase assertion
import { test, expect, Page } from '@playwright/test';
import { EVAL_CATALOG, EvalDefinition } from './eval-catalog';
import {
  PASSING_LABELS,
  TERMINAL_LABELS,
  STATUS_BADGE_SELECTOR,
} from './helpers';

for (const evalDef of EVAL_CATALOG) {
  test(`Eval ${evalDef.id}: ${evalDef.name}`, async ({ page }) =&gt; {
    // Each eval may take up to 2 hours
    test.setTimeout(7_200_000);

    // --- Ticket Creation (UI-driven) ---
    await page.goto('/tickets/new');
    await page.waitForLoadState('networkidle');
    await page.locator('#ticket-title').fill(evalDef.title);

    const editor = page.locator('.tiptap');
    try {
      await editor.fill(evalDef.description);
    } catch {
      await editor.click();
      await page.keyboard.type(evalDef.description);
    }

    await page.getByRole('button', { name: /create &amp; run/i }).click();
    await page.waitForURL(/\/tickets\/[a-zA-Z0-9]+/, { timeout: 30_000 });

    // --- Phase 1: Poll until ANY terminal status ---
    let observedStatus = '';

    await expect.poll(async () =&gt; {
      await page.reload();
      const badge = page.locator(STATUS_BADGE_SELECTOR).first();
      const text = (await badge.textContent())?.trim() ?? '';
      observedStatus = text;
      return TERMINAL_LABELS.includes(text as any);
    }, {
      timeout: 7_200_000,   // 2 hours
      intervals: [30_000],  // poll every 30 seconds
      message: `Eval ${evalDef.id}: waiting for terminal status`
    }).toBeTruthy();

    // --- Phase 2: Assert the terminal status is PASSING ---
    expect(
      PASSING_LABELS.includes(observedStatus as any),
      `Eval ${evalDef.id} reached terminal status "${observedStatus}" `
      + `which is not a passing state. `
      + `Passing states: ${PASSING_LABELS.join(', ')}`
    ).toBe(true);
  });
}</code></pre>

<div class="callout">
  <strong>Why two phases?</strong> A single <code>expect.poll(() =&gt; status).toBe('Sandbox ready')</code> would time out on evals that correctly reach "Failed" &mdash; the test would wait 2 hours and report a timeout rather than a meaningful failure. The two-phase pattern lets us <em>detect</em> terminal status (Phase 1) and then <em>classify</em> it (Phase 2), producing clear failure messages like: <em>"Eval 5 reached terminal status 'Failed' which is not a passing state."</em>
</div>

<hr>

<!-- ================================================================== -->
<h2 id="terminal-classification">5. Terminal Status Classification</h2>

<p>Source: <code>helix-global-client/src/lib/format.ts:20-44</code> (<code>statusDisplayLabels</code> map) and <code>src/components/status-badge.tsx:4-28</code> (CSS classes).</p>

<h3>Passing Terminal States (Test PASS) &mdash; 5 values</h3>

<table>
  <thead><tr><th>Raw Status</th><th>Display Label</th><th>CSS Class</th><th>Source</th></tr></thead>
  <tbody>
    <tr><td><code>SANDBOX_READY</code></td><td><span class="badge badge-pass">Sandbox ready</span></td><td><code>text-status-succeeded</code></td><td><code>format.ts:23</code>, <code>status-badge.tsx:13</code></td></tr>
    <tr><td><code>PREVIEW_READY</code></td><td><span class="badge badge-pass">Preview ready</span></td><td><code>text-status-succeeded</code></td><td><code>format.ts:27</code>, <code>status-badge.tsx:14</code></td></tr>
    <tr><td><code>REPORT_READY</code></td><td><span class="badge badge-pass">Report ready</span></td><td><code>text-status-succeeded</code></td><td><code>format.ts:29</code>, <code>status-badge.tsx:16</code></td></tr>
    <tr><td><code>DEPLOYED</code></td><td><span class="badge badge-pass">Deployed</span></td><td><code>text-status-deployed</code></td><td><code>format.ts:31</code>, <code>status-badge.tsx:19</code></td></tr>
    <tr><td><code>STAGING_MERGED</code></td><td><span class="badge badge-pass">Staging merged</span></td><td><code>text-status-succeeded</code></td><td><code>format.ts:29</code>, <code>status-badge.tsx:17</code></td></tr>
  </tbody>
</table>

<h3>Failing Terminal States (Test FAIL) &mdash; 4 values</h3>

<table>
  <thead><tr><th>Raw Status</th><th>Display Label</th><th>CSS Class</th><th>Source</th></tr></thead>
  <tbody>
    <tr><td><code>FAILED</code></td><td><span class="badge badge-fail">Failed</span></td><td><code>text-status-failed</code></td><td><code>format.ts:32</code>, <code>status-badge.tsx:20</code></td></tr>
    <tr><td><code>UNVERIFIED</code></td><td><span class="badge badge-fail">Unverified</span></td><td><code>text-status-unverified</code></td><td><code>format.ts:33</code>, <code>status-badge.tsx:21</code></td></tr>
    <tr><td><code>NEEDS_CREDENTIALS</code></td><td><span class="badge badge-fail">Needs Credentials</span></td><td><code>text-status-needs-credentials</code></td><td><code>format.ts:42</code>, <code>status-badge.tsx:22</code></td></tr>
    <tr><td><code>IMPOSSIBLE_SPEC</code></td><td><span class="badge badge-fail">Impossible Spec</span></td><td><code>text-status-impossible-spec</code></td><td><code>format.ts:43</code>, <code>status-badge.tsx:23</code></td></tr>
  </tbody>
</table>

<h3>Non-Terminal States (Keep Polling) &mdash; 8 values</h3>

<table>
  <thead><tr><th>Raw Status</th><th>Display Label</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><code>QUEUED</code></td><td><span class="badge badge-poll">Awaiting run</span></td><td>Ticket submitted, waiting for agent slot</td></tr>
    <tr><td><code>RUNNING</code></td><td><span class="badge badge-poll">Running</span></td><td>Agent pipeline actively processing</td></tr>
    <tr><td><code>MERGING</code></td><td><span class="badge badge-poll">Merging</span></td><td>Code being merged to staging branch</td></tr>
    <tr><td><code>VERIFYING</code></td><td><span class="badge badge-poll">Verifying</span></td><td>Agent verifying implemented changes</td></tr>
    <tr><td><code>DEPLOYING</code></td><td><span class="badge badge-poll">Deploying</span></td><td>Deploying to NetSuite sandbox</td></tr>
    <tr><td><code>IN_PROGRESS</code></td><td><span class="badge badge-poll">In progress</span></td><td>General in-progress state</td></tr>
    <tr><td><code>WAITING</code></td><td><span class="badge badge-poll">Waiting</span></td><td>Waiting for external dependency</td></tr>
    <tr><td><code>DRAFT</code></td><td><span class="badge badge-poll">Draft</span></td><td>Ticket in draft (not yet submitted)</td></tr>
  </tbody>
</table>

<hr>

<!-- ================================================================== -->
<h2 id="eval-catalog">6. Eval Catalog (13 Active Evals)</h2>

<p>Source: NetSuite E2E Eval Sprint Deliverable PDF (attached to RSH-611), cross-referenced with <code>scout-summary.md</code>.</p>

<table>
  <thead><tr><th>Eval</th><th>Name</th><th>Type</th><th>Pre-check</th><th>Current Terminal</th><th>Expected Test</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Correct Customer SLA Tier Field</td><td>BUILD</td><td>No</td><td>SANDBOX_READY</td><td><span class="badge badge-pass">PASS</span></td></tr>
    <tr><td>2</td><td>Sales Manager Dashboard Search</td><td>BUILD</td><td>No</td><td>IMPOSSIBLE_SPEC</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>3</td><td>Sales Order Margin Review User Event</td><td>BUILD</td><td>No</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>4</td><td>Rolling Item Sales Snapshot</td><td>BUILD</td><td>No</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>5</td><td>Customer Escalation Custom Record</td><td>BUILD</td><td>No</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>6</td><td>Expense Report Approval Workflow</td><td>BUILD</td><td>No</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>8</td><td>Finance Invoice PDF Update</td><td>FIX</td><td>Yes</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>9</td><td>Admin Bulk Transaction Update Tool</td><td>FIX</td><td>Yes</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>10</td><td>Fix CSV-Only Sales Order User Event Failure</td><td>FIX</td><td>Yes</td><td>NEEDS_CREDENTIALS</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>11</td><td>Fix Warehouse Operations Suitelet Access</td><td>FIX</td><td>Yes</td><td>NEEDS_CREDENTIALS</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>12</td><td>Fix Sales Order User Event Execution Order</td><td>FIX</td><td>Yes</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>13</td><td>Margin Override Reason Role/State Visibility</td><td>FIX</td><td>Yes</td><td>FAILED</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>15</td><td>System X Shipment Status RESTlet</td><td>BUILD</td><td>No</td><td>Pending</td><td><span class="badge badge-deferred">TBD</span></td></tr>
  </tbody>
</table>

<h3>Deferred Evals</h3>

<table>
  <thead><tr><th>Eval</th><th>Reason Deferred</th></tr></thead>
  <tbody>
    <tr><td>7</td><td>Requires Canada subsidiary license exceeding current sandbox limit</td></tr>
    <tr><td>14</td><td>SPA baseline (SuitePromotions) not yet ready in sandbox</td></tr>
  </tbody>
</table>

<hr>

<!-- ================================================================== -->
<h2 id="project-scaffolding">7. Project Scaffolding Blueprint</h2>

<h3>File Structure</h3>

<div class="file-tree">helix-regression-testing/
├── package.json                    # Dependencies and npm scripts
├── playwright.config.ts            # 2-hour timeout, single worker, auth project
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Env var documentation
├── .gitignore                      # Ignore node_modules, playwright state, test results
├── tests/
│   ├── auth.setup.ts               # Login flow — saves storageState
│   ├── eval-catalog.ts             # 13 active evals as typed data
│   ├── helpers.ts                  # PASSING_LABELS, FAILING_LABELS, status badge locator
│   └── evals.spec.ts               # Main test — iterates catalog, two-phase assert
└── playwright/
    └── .auth/                      # Saved auth state (gitignored)
        └── user.json</div>

<h3>package.json</h3>

<pre><code>{
  "name": "helix-regression-testing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:report": "npx playwright show-report",
    "install-browsers": "npx playwright install chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "typescript": "^5.8.0"
  }
}</code></pre>

<h3>playwright.config.ts</h3>

<pre><code>import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 7_200_000,            // 2 hours per test
  globalTimeout: 0,              // No global timeout (24h+ is OK)
  fullyParallel: false,          // Serial execution
  workers: 1,                    // Single worker
  retries: 0,                    // No retries — failing is informative
  reporter: [
    ['html', { open: 'never' }],
    ['list'],                    // Console output per test
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Auth setup project — runs first
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Eval regression tests — depend on auth
    {
      name: 'eval-regression',
      testMatch: /evals\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});</code></pre>

<h3>tsconfig.json</h3>

<pre><code>{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["tests/**/*.ts"]
}</code></pre>

<h3>.env.example</h3>

<pre><code># Required
E2E_LOGIN_PASSWORD=your-password-here

# Optional (defaults shown)
E2E_LOGIN_EMAIL=support@projectxinnovation.com
BASE_URL=http://localhost:5173</code></pre>

<h3>tests/eval-catalog.ts (structure)</h3>

<pre><code>export interface EvalDefinition {
  /** Eval number (1-15) */
  id: number;
  /** Human-readable eval name */
  name: string;
  /** Ticket title to enter in the title field */
  title: string;
  /** Ticket description to enter in the TipTap editor */
  description: string;
  /** BUILD or FIX */
  type: 'BUILD' | 'FIX';
  /** Whether NetSuite pre-checks are required */
  preCheckRequired: boolean;
}

/**
 * 13 active evals from the NetSuite E2E Eval Sprint Deliverable.
 * Evals 7 and 14 are deferred.
 * Each eval's title and description are the exact text to be submitted
 * through the Helix ticket creation form.
 */
export const EVAL_CATALOG: EvalDefinition[] = [
  {
    id: 1,
    name: 'Correct Customer SLA Tier Field',
    title: 'Correct Customer SLA Tier Field',
    description: '/* Full eval ticket text from PDF ... */',
    type: 'BUILD',
    preCheckRequired: false,
  },
  // ... remaining 12 evals with their exact ticket text from the PDF
  // Each eval's description contains the full ticket text that would
  // be entered into the TipTap editor
];</code></pre>

<h3>tests/helpers.ts</h3>

<pre><code>import type { Page } from '@playwright/test';
import type { EvalDefinition } from './eval-catalog';

// --- Terminal status label sets ---
// Source: helix-global-client/src/lib/format.ts:20-44

export const PASSING_LABELS = [
  'Sandbox ready',
  'Preview ready',
  'Report ready',
  'Deployed',
  'Staging merged',
] as const;

export const FAILING_LABELS = [
  'Failed',
  'Unverified',
  'Needs Credentials',
  'Impossible Spec',
] as const;

export const TERMINAL_LABELS = [
  ...PASSING_LABELS,
  ...FAILING_LABELS,
] as const;

export const STATUS_BADGE_SELECTOR =
  'span.rounded-full.text-xs.font-medium';

/** Create an eval ticket through the UI and return the detail page URL */
export async function createEvalTicket(
  page: Page,
  evalDef: EvalDefinition,
): Promise&lt;string&gt; {
  await page.goto('/tickets/new');
  await page.waitForLoadState('networkidle');

  // Fill title
  await page.locator('#ticket-title').fill(evalDef.title);

  // Fill description (TipTap contenteditable)
  const editor = page.locator('.tiptap');
  try {
    await editor.fill(evalDef.description);
  } catch {
    // Fallback for TipTap/ProseMirror sync issues
    await editor.click();
    await page.keyboard.type(evalDef.description);
  }

  // Submit
  await page.getByRole('button', { name: /create &amp; run/i }).click();

  // Wait for redirect to ticket detail page
  await page.waitForURL(/\/tickets\/[a-zA-Z0-9]+/, { timeout: 30_000 });

  return page.url();
}

/** Check if the current page has been redirected to login (token expired) */
export async function isOnLoginPage(page: Page): Promise&lt;boolean&gt; {
  return page.url().includes('/login');
}

/** Re-authenticate if the session has expired */
export async function ensureAuthenticated(page: Page): Promise&lt;void&gt; {
  if (await isOnLoginPage(page)) {
    const email = process.env.E2E_LOGIN_EMAIL ?? 'support@projectxinnovation.com';
    const password = process.env.E2E_LOGIN_PASSWORD!;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 15_000 });
  }
}</code></pre>

<hr>

<!-- ================================================================== -->
<h2 id="expected-baseline">8. Expected Baseline Results</h2>

<p>When the suite is first run against the current platform state, the expected results are:</p>

<table>
  <thead><tr><th>Eval</th><th>Name</th><th>Expected Terminal Status</th><th>Test Outcome</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Correct Customer SLA Tier Field</td><td>SANDBOX_READY &rarr; "Sandbox ready"</td><td><span class="badge badge-pass">PASS</span></td></tr>
    <tr><td>2</td><td>Sales Manager Dashboard Search</td><td>IMPOSSIBLE_SPEC &rarr; "Impossible Spec"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>3</td><td>Sales Order Margin Review User Event</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>4</td><td>Rolling Item Sales Snapshot</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>5</td><td>Customer Escalation Custom Record</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>6</td><td>Expense Report Approval Workflow</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>8</td><td>Finance Invoice PDF Update</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>9</td><td>Admin Bulk Transaction Update Tool</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>10</td><td>Fix CSV-Only Sales Order UE Failure</td><td>NEEDS_CREDENTIALS &rarr; "Needs Credentials"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>11</td><td>Fix Warehouse Ops Suitelet Access</td><td>NEEDS_CREDENTIALS &rarr; "Needs Credentials"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>12</td><td>Fix Sales Order UE Execution Order</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>13</td><td>Margin Override Reason Visibility</td><td>FAILED &rarr; "Failed"</td><td><span class="badge badge-fail">FAIL</span></td></tr>
    <tr><td>15</td><td>System X Shipment Status RESTlet</td><td>Pending (TBD)</td><td><span class="badge badge-deferred">TBD</span></td></tr>
  </tbody>
</table>

<div class="callout">
  <strong>Baseline score: 1/13 PASS (7.7%).</strong> This is the expected starting point. As the platform improves, more evals will pass. The suite's primary value is detecting <em>regressions</em> &mdash; if Eval 1 stops passing after a deployment, that's the signal.
</div>

<hr>

<!-- ================================================================== -->
<h2 id="risks-mitigations">9. Risks &amp; Mitigations</h2>

<table>
  <thead><tr><th>#</th><th>Risk</th><th>Severity</th><th>Mitigation</th></tr></thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><strong>TipTap <code>fill()</code> doesn't sync editor state</strong> &mdash; ticket description may be empty after submission</td>
      <td>Medium</td>
      <td>Fallback to <code>click()</code> + <code>keyboard.type()</code>. The code pattern includes a try/catch with automatic fallback.</td>
    </tr>
    <tr>
      <td>2</td>
      <td><strong>Auth token expires during 24h suite run</strong> &mdash; later evals fail to create tickets</td>
      <td>Medium</td>
      <td>Per-eval re-auth guard: before each ticket creation, check if page was redirected to <code>/login</code>. If so, re-authenticate inline using <code>ensureAuthenticated()</code>.</td>
    </tr>
    <tr>
      <td>3</td>
      <td><strong>Status badge selector changes with UI updates</strong> &mdash; polling reads wrong element</td>
      <td>Medium</td>
      <td>Use the stable CSS class combination <code>rounded-full.text-xs.font-medium</code> (from the design system). Add a pre-flight check: if no matching element found, log and fail fast.</td>
    </tr>
    <tr>
      <td>4</td>
      <td><strong>Eval exceeds 2-hour timeout</strong> &mdash; test reports timeout instead of real failure</td>
      <td>Low</td>
      <td>2-hour timeout is generous for current eval processing times. Can be increased per-eval if needed. Log last observed status on timeout for debugging.</td>
    </tr>
    <tr>
      <td>5</td>
      <td><strong>Multiple StatusBadge components on detail page</strong> &mdash; wrong badge read</td>
      <td>Low</td>
      <td>Use <code>.first()</code> to target the ticket-level badge (first instance in DOM order, at <code>ticket-detail.tsx:2066</code>). Sub-run badges appear later in the DOM.</td>
    </tr>
    <tr>
      <td>6</td>
      <td><strong>Eval pre-checks missing in sandbox</strong> &mdash; FIX evals 8-13 fail for wrong reason</td>
      <td>Low</td>
      <td>Documented as expected baseline. These evals are expected to fail regardless. Pre-check automation is Phase 4 future work.</td>
    </tr>
    <tr>
      <td>7</td>
      <td><strong>Ticket accumulation over repeated runs</strong> &mdash; org fills with eval tickets</td>
      <td>Low</td>
      <td>Acceptable for MVP. Phase 2 adds post-run cleanup. Eval titles can include a run timestamp for identification.</td>
    </tr>
  </tbody>
</table>

<hr>

<!-- ================================================================== -->
<h2 id="future-enhancements">10. Future Enhancements</h2>

<table>
  <thead><tr><th>Phase</th><th>Enhancement</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>Phase 2</td><td><strong>Per-eval expected outcomes</strong></td><td>Track expected terminal status per eval (e.g., Eval 1 expects SANDBOX_READY). Distinguish "expected fail" from "new regression" in reporting.</td></tr>
    <tr><td>Phase 2</td><td><strong>Token refresh logic</strong></td><td>Proactively refresh auth token before each eval rather than detecting 401s reactively.</td></tr>
    <tr><td>Phase 2</td><td><strong>Ticket cleanup</strong></td><td>Delete eval tickets after suite completion to prevent accumulation in the org.</td></tr>
    <tr><td>Phase 2</td><td><strong>Enhanced error reporting</strong></td><td>Log last observed status and page screenshot on timeout. Capture server error messages if visible in UI.</td></tr>
    <tr><td>Phase 3</td><td><strong>CI/CD integration</strong></td><td>Run the suite nightly or on staging deploy triggers via GitHub Actions or similar.</td></tr>
    <tr><td>Phase 3</td><td><strong>Parallel execution</strong></td><td>Run evals concurrently across multiple workers once queue capacity allows. Reduces 26h suite to hours.</td></tr>
    <tr><td>Phase 3</td><td><strong>Selective eval runs</strong></td><td>Tag-based filtering: <code>npm run test -- --grep "Eval 1"</code> to run a subset.</td></tr>
    <tr><td>Phase 4</td><td><strong>Post-run NetSuite verification</strong></td><td>Extend tests to verify NetSuite artifacts (scripts, records) beyond terminal status.</td></tr>
  </tbody>
</table>

<hr>

<!-- ================================================================== -->
<h2 id="appendix-sources">11. Appendix: Source File References</h2>

<p>All selectors, status labels, and configuration values in this report are sourced from the Helix codebase. No <code>data-testid</code> attributes exist in the client; all selectors are semantic.</p>

<table>
  <thead><tr><th>File</th><th>Key Information</th></tr></thead>
  <tbody>
    <tr><td><code>helix-global-client/e2e/auth.setup.ts</code></td><td>Proven login flow: <code>getByLabel(/email/i)</code>, <code>getByLabel(/password/i)</code>, <code>getByRole('button', { name: /sign in/i })</code>, storageState save, token verification</td></tr>
    <tr><td><code>helix-global-client/playwright.config.ts</code></td><td>Reference config: <code>workers:1</code>, <code>fullyParallel:false</code>, auth project dependencies, <code>storageState</code> pattern</td></tr>
    <tr><td><code>helix-global-client/src/lib/format.ts:20-44</code></td><td>Authoritative <code>statusDisplayLabels</code> map: 23 status&rarr;label mappings. Source for all terminal label strings.</td></tr>
    <tr><td><code>helix-global-client/src/components/status-badge.tsx:4-28</code></td><td>StatusBadge CSS classes per status. Badge renders <code>&lt;span class="rounded-full text-xs font-medium ..."&gt;</code></td></tr>
    <tr><td><code>helix-global-client/src/routes/create-ticket.tsx:432,699</code></td><td>Ticket form: <code>id="ticket-title"</code> on title input (line 432); "Create &amp; Run" button text (line 699); redirect to <code>/tickets/:id</code> (line 370)</td></tr>
    <tr><td><code>helix-global-client/src/components/rich-text-editor.tsx:463</code></td><td>TipTap editor: <code>&lt;div class="tiptap ProseMirror" contenteditable="true"&gt;</code></td></tr>
    <tr><td><code>helix-global-client/src/routes/ticket-detail.tsx:1469,2066</code></td><td>SPA auto-polls for RUNNING/MERGING (30s refetchInterval). StatusBadge first instance at line 2066.</td></tr>
    <tr><td><code>helix-global-client/src/types/api.ts</code></td><td><code>TicketStatus</code> const object with 17 status values (not an enum due to <code>erasableSyntaxOnly</code>)</td></tr>
    <tr><td><code>helix-global-server/src/services/ticket-service.ts</code></td><td>Server-side <code>TERMINAL_RUN_STATUSES</code> set including <code>NEEDS_CREDENTIALS</code>, <code>IMPOSSIBLE_SPEC</code></td></tr>
    <tr><td><code>helix-global-client/e2e/helpers.ts</code></td><td>API helper: token from <code>localStorage</code>, Bearer header pattern</td></tr>
    <tr><td>Playwright documentation (Context7)</td><td>Confirmed: <code>expect.poll()</code> with <code>intervals</code>/<code>timeout</code>; <code>fill()</code> on <code>[contenteditable]</code>; <code>test.setTimeout()</code></td></tr>
  </tbody>
</table>

<hr>

<!-- ================================================================== -->
<h2 id="appendix-eval-details">12. Appendix: Eval Details &amp; Failure Analysis</h2>

<h3>Failure Taxonomy (from Eval Sprint)</h3>

<table>
  <thead><tr><th>Category</th><th>Evals Affected</th><th>Count</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>SDF Deployment/Validation Failure</td><td>4, 5, 6, 8, 12, 13</td><td>6</td><td>Native SuiteCloud deploy rejected objects that Helix static verification passed</td></tr>
    <tr><td>Spec/Requirement Gap</td><td>2, 3</td><td>2</td><td>Core functionality works but specific requirements not fully met</td></tr>
    <tr><td>Wrong-Target Implementation</td><td>10</td><td>1</td><td>Helix modified the wrong script entirely</td></tr>
    <tr><td>Undeployed Fix</td><td>11</td><td>1</td><td>Branch has correct fix but it was never deployed to sandbox</td></tr>
    <tr><td>Merge/Orchestration Failure</td><td>9</td><td>1</td><td>manifest.xml merge conflict blocked staging merge</td></tr>
  </tbody>
</table>

<h3>Key Insight: SDF Validation Gap</h3>

<p>6 of 11 failing evals (55%) failed because Helix's static verification passed objects that NetSuite's native SuiteCloud deployment later rejected. The eval sprint discovered that running <code>suitecloud project:validate --server</code> or <code>suitecloud project:deploy --dryrun</code> catches these exact errors. This is the single highest-impact improvement opportunity for the platform.</p>

<h3>Eval Detail Cards</h3>

<h4>Eval 1: Correct Customer SLA Tier Field <span class="badge badge-pass">PASS</span></h4>
<p><strong>Type:</strong> BUILD &nbsp;|&nbsp; <strong>Terminal:</strong> SANDBOX_READY<br>
The only eval that passed all checks. Custom field created on Customer record with SLA tier values (Gold/Silver/Bronze). Demonstrates Helix can successfully create custom fields on standard records.</p>

<h4>Eval 2: Sales Manager Dashboard Search <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> BUILD &nbsp;|&nbsp; <strong>Terminal:</strong> IMPOSSIBLE_SPEC<br>
Saved search was created but specific filtering and column requirements from the spec were not fully met. Core functionality works but spec gap caused failure classification.</p>

<h4>Eval 3: Sales Order Margin Review User Event <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> BUILD &nbsp;|&nbsp; <strong>Terminal:</strong> FAILED<br>
User Event script created and deployed but margin calculation logic and logging did not satisfy the spec. Static verification passed the script.</p>

<h4>Evals 4, 5, 6: SDF Deployment Failures <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> BUILD &nbsp;|&nbsp; <strong>Terminal:</strong> FAILED<br>
All three were rejected by native SuiteCloud deployment. Eval 4 (Rolling Item Sales Snapshot), Eval 5 (Customer Escalation Custom Record), Eval 6 (Expense Report Approval Workflow). Issues include script ID length &gt;40 chars, unsupported fields, and invalid field types.</p>

<h4>Eval 8: Finance Invoice PDF Update <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> FIX &nbsp;|&nbsp; <strong>Terminal:</strong> FAILED<br>
SDF rejected the PDF template metadata. Invalid PDF template metadata shape in the generated SDF object.</p>

<h4>Eval 9: Admin Bulk Transaction Update Tool <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> FIX &nbsp;|&nbsp; <strong>Terminal:</strong> FAILED<br>
Two issues: manifest.xml merge conflict from failed predecessor's /after chain, and runtime bug (missing type argument in SuiteScript API call).</p>

<h4>Eval 10: Fix CSV-Only Sales Order UE Failure <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> FIX &nbsp;|&nbsp; <strong>Terminal:</strong> NEEDS_CREDENTIALS<br>
Helix modified the wrong script entirely. Wrong-target implementation — a fundamental script-targeting accuracy issue.</p>

<h4>Eval 11: Fix Warehouse Operations Suitelet Access <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> FIX &nbsp;|&nbsp; <strong>Terminal:</strong> NEEDS_CREDENTIALS<br>
Branch contains the correct fix but it was never deployed to the sandbox. Undeployed fix issue.</p>

<h4>Evals 12, 13: SDF Deployment Failures <span class="badge badge-fail">FAIL</span></h4>
<p><strong>Type:</strong> FIX &nbsp;|&nbsp; <strong>Terminal:</strong> FAILED<br>
Eval 12 (execution order) used an unsupported <code>executionorder</code> field on scriptdeployment. Eval 13 (role/state visibility) had script ID length &gt;40 chars and invalid role/restriction values.</p>

<h4>Eval 15: System X Shipment Status RESTlet <span class="badge badge-deferred">Pending</span></h4>
<p><strong>Type:</strong> BUILD &nbsp;|&nbsp; <strong>Terminal:</strong> Pending<br>
Run had not completed at time of sprint deliverable. Will be included in regression suite and its baseline result determined on first run.</p>

<hr>

<footer>
  <p>Report generated on May 27, 2026 for RSH-611: Helix Evals Regression (Iteration 2).<br>
  Data sourced from: NetSuite E2E Eval Sprint Deliverable PDF, Helix platform source code (<code>helix-global-client</code>, <code>helix-global-server</code>), Playwright documentation, and prior workflow artifacts (scout, diagnosis, product, tech-research).</p>
</footer>

</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-05-27T16:55:56.495Z) [Agent]: I'm working on this, I'll get back to you when ready.
