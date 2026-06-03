# Ticket Context

- ticket_id: cmpx9gkpl00h2k70ukmiyesmk
- short_id: FIX-645
- run_id: cmpx9gkq100h7k70uqbo334y5
- run_branch: helix/fix/FIX-645-host-agent-loop-placement-parity-workstream-b
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Host Agent: loop placement parity (Workstream B)

## Description
# Host Agent — Loop Placement Parity (Workstream B of RSH-640)

Implement **Workstream B** of the RSH-640 development plan: relocate the agent reasoning loop out of the helix-global-server process (the trust anchor) into the disposable sprite, mirroring how the orchestrator runs its step agents inside the Vercel sandbox. **Depends on Workstream A** (credentials & lifecycle).

Primary repo: **helix-global-server**. helix-cli and helix-global-client included for end-to-end testing; the plan expects no changes in them.

## Validate FIRST (open questions — do before building on them)
- **OQ-5:** Does a sprite support a long-lived Node process? The in-sprite runner depends on it. Validate before implementing B1.
- **OQ-7:** Is the sprite inbound-addressable for HTTP comment delivery? If not, use the file-watch fallback (control plane writes a payload file the runner watches).

## Scope (per RSH-640 §5)
- **B1 — In-sprite runner:** long-lived Node process deployed at provision; hosts the live Claude session (Agent SDK v2, with v1 `query(resume)` fallback); endpoints `/comment`, `/health`, `/token-refresh`; shared-secret auth.
- **B2 — MCP tools via `execFile(binary, args)` (FLAW-01, 02):** reimplement the 5 tools with structured `child_process.execFile` so shell injection is structurally impossible.
- **B3 — Comment delivery (HTTP push):** control plane pushes new `@Helix` comments to the runner; file-watch fallback per OQ-7.
- **B4 — Error sanitization (FLAW-10):** strip temp paths, stack traces, token fragments from tool errors before they reach the LLM.
- **B5 — Comment boundary markers (FLAW-09):** wrap user comment content in `<user_comment>…</user_comment>` with adversarial-input instructions (defense-in-depth; residual risk accepted).
- **B6 — Control-plane refactor:** `host-agent-service.ts` provisions + deploys runner + manages lifecycle remotely; **no longer runs `query()` in-process**.

## AMENDMENT to the RSH-640 plan
- **DROP the git subcommand allowlist** that the plan listed under B2 for FLAW-04. Rationale: the runner holds **no GitHub token**, so authenticated git to org repos cannot happen; and `node -e`/`npx` remain available, so a subcommand allowlist is redundant and gives false confidence. FLAW-04 (git-as-exfil to other hosts) is handled **structurally** by the no-token model plus the sprite egress allowlist (separate follow-on ticket). **Keep git available for local inspection** (`log`/`diff`/`show`/`status`/`blame`).

## CRITICAL invariant (must hold)
- The agent runner's environment **never contains** the org PAT / `GITHUB_TOKEN`. All token-bearing git ops occur at provision time (Workstream A) and are scrubbed **before** the runner launches; token and runner never coexist on the box; no token-bearing git op runs while the runner is live.

## Acceptance criteria
- Agent loop no longer executes in the helix-global-server process; tool calls and inference run inside the sprite.
- `printenv` (or equivalent) in the runner shows **no** GitHub token.
- Shell-metacharacter inputs to tools cannot inject (execFile, no shell).
- Comment round-trip (`@Helix` → runner → reply) works within latency target; live session persists across comments; crash recovery resumes via session id.
- Tests T4 (multi-instance), T6 (comment delivery & session), T7 (runner security) from RSH-640 §9 pass.

## Out of scope
Sprite egress network policy (separate follow-on, uses `POST /v1/sprites/{name}/policy/network`), FLAW-08 rate limiter (deferred).

Staging first; do not push to main directly.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RSH-640: Host Agent Security Parity Development Plan</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color:#1a1a2e; line-height:1.6; background:#f8f9fa;">

<div style="max-width:960px; margin:0 auto; padding:24px 20px;">

<!-- Header -->
<div style="background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color:#fff; padding:32px; border-radius:12px; margin-bottom:32px;">
  <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:16px;">
    <span style="background:#457b9d; color:#fff; padding:4px 12px; border-radius:20px; font-size:13px; font-weight:600;">RESEARCH</span>
    <span style="background:#2a9d8f; color:#fff; padding:4px 12px; border-radius:20px; font-size:13px; font-weight:600;">PLAN &mdash; NOT DEPLOYED</span>
    <span style="background:rgba(255,255,255,0.15); color:#fff; padding:4px 12px; border-radius:20px; font-size:13px;">RSH-640</span>
  </div>
  <h1 style="margin:0 0 12px 0; font-size:28px; font-weight:700; line-height:1.3;">Development Plan: Host Agent Security Parity with the Vercel Orchestrator</h1>
  <p style="margin:0; color:#a8dadc; font-size:15px;">
    A sequenced, file-level development plan to bring the Host Agent to credential, lifecycle, and architectural parity with the orchestrator's proven patterns.
  </p>
  <div style="margin-top:16px; display:flex; flex-wrap:wrap; gap:16px; font-size:13px; color:#a8dadc;">
    <span>June 2026</span>
    <span>&bull;</span>
    <span>Related: <strong style="color:#fff;">RSH-607</strong> (Security Audit), <strong style="color:#fff;">BLD-577</strong> (Host Agent Build)</span>
  </div>
</div>

<!-- Key Metrics Bar -->
<div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:32px;">
  <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; text-align:center;">
    <div style="font-size:28px; font-weight:700; color:#e63946;">11</div>
    <div style="font-size:12px; color:#666; text-transform:uppercase; letter-spacing:0.5px;">Flaws Addressed</div>
  </div>
  <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; text-align:center;">
    <div style="font-size:28px; font-weight:700; color:#457b9d;">2</div>
    <div style="font-size:12px; color:#666; text-transform:uppercase; letter-spacing:0.5px;">Workstreams</div>
  </div>
  <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; text-align:center;">
    <div style="font-size:28px; font-weight:700; color:#2a9d8f;">9</div>
    <div style="font-size:12px; color:#666; text-transform:uppercase; letter-spacing:0.5px;">Architecture Decisions</div>
  </div>
  <div style="flex:1; min-width:140px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:16px; text-align:center;">
    <div style="font-size:28px; font-weight:700; color:#6c5ce7;">16+</div>
    <div style="font-size:12px; color:#666; text-transform:uppercase; letter-spacing:0.5px;">Files Changed</div>
  </div>
</div>

<!-- Table of Contents -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:24px; margin-bottom:32px;">
  <h2 id="table-of-contents" style="margin:0 0 16px 0; font-size:18px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">Table of Contents</h2>
  <ol style="margin:0; padding-left:24px; columns:2; column-gap:32px;">
    <li style="margin-bottom:6px;"><a href="#executive-summary" style="color:#457b9d; text-decoration:none;">Executive Summary</a></li>
    <li style="margin-bottom:6px;"><a href="#target-architecture" style="color:#457b9d; text-decoration:none;">Target Architecture</a></li>
    <li style="margin-bottom:6px;"><a href="#flaw-to-remediation-traceability" style="color:#457b9d; text-decoration:none;">Flaw-to-Remediation Traceability</a></li>
    <li style="margin-bottom:6px;"><a href="#workstream-a-credentials-and-lifecycle-parity" style="color:#457b9d; text-decoration:none;">Workstream A: Credentials &amp; Lifecycle</a></li>
    <li style="margin-bottom:6px;"><a href="#workstream-b-loop-placement-parity" style="color:#457b9d; text-decoration:none;">Workstream B: Loop Placement</a></li>
    <li style="margin-bottom:6px;"><a href="#file-level-change-list" style="color:#457b9d; text-decoration:none;">File-Level Change List</a></li>
    <li style="margin-bottom:6px;"><a href="#schema-and-migration-plan" style="color:#457b9d; text-decoration:none;">Schema &amp; Migration Plan</a></li>
    <li style="margin-bottom:6px;"><a href="#session-persistence-model-specification" style="color:#457b9d; text-decoration:none;">Session/Persistence Model</a></li>
    <li style="margin-bottom:6px;"><a href="#test-plan" style="color:#457b9d; text-decoration:none;">Test Plan</a></li>
    <li style="margin-bottom:6px;"><a href="#rollout-plan" style="color:#457b9d; text-decoration:none;">Rollout Plan</a></li>
    <li style="margin-bottom:6px;"><a href="#open-questions-and-risks" style="color:#457b9d; text-decoration:none;">Open Questions &amp; Risks</a></li>
    <li style="margin-bottom:6px;"><a href="#evidence-summary-and-methodology" style="color:#457b9d; text-decoration:none;">Evidence Summary &amp; Methodology</a></li>
  </ol>
</div>

<!-- ============================================ -->
<!-- Section 1: Executive Summary -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="executive-summary" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">1. Executive Summary</h2>

  <p>The Host Agent (built in <strong>BLD-577</strong>, gated behind <code style="background:#f4f5f9; padding:2px 6px; border-radius:4px; font-size:13px;">HOST_AGENT_ENABLED=false</code>, <strong>not deployed to production</strong>) is a persistent, sprite-backed Claude agent per ticket. A pre-deployment security audit (<strong>RSH-607</strong>) identified <strong>11 security flaws</strong> &mdash; 8 brand new and 2 worsened &mdash; representing a regression from patterns the team already built, tested, and deployed in the Vercel-sandbox orchestrator.</p>

  <!-- Root Cause Callout -->
  <div style="background:#fff3cd; border-left:4px solid #ffc107; padding:16px 20px; border-radius:0 8px 8px 0; margin:20px 0;">
    <strong style="color:#856404;">Root Cause:</strong> All 11 flaws trace to a single architectural decision in BLD-577 &mdash; running the agent reasoning loop inside the <em>trust anchor</em> (the helix-global-server process that holds the DB connection, org-PAT decryption keys, and key-minting capability) with direct credential access, rather than porting the orchestrator's proven isolation model.
  </div>

  <h3 style="margin:20px 0 12px 0; font-size:16px; color:#457b9d;">Solution: Two Workstreams</h3>

  <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
    <div style="flex:1; min-width:280px; background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:16px;">
      <div style="font-weight:700; color:#457b9d; margin-bottom:8px;">Workstream A &mdash; Credentials &amp; Lifecycle</div>
      <ul style="margin:0; padding-left:18px; font-size:14px;">
        <li>GIT_ASKPASS credential isolation (FLAW-03)</li>
        <li>Scoped inspection keys + deny-empty-scope (FLAW-05)</li>
        <li>Hard TTL, retry teardown, GC sweep (FLAW-06)</li>
        <li>Dedicated agent identity (FLAW-07)</li>
        <li>Session status enum (FLAW-11)</li>
      </ul>
      <div style="margin-top:12px; padding:6px 12px; background:#2a9d8f; color:#fff; border-radius:4px; font-size:12px; font-weight:600; display:inline-block;">INDEPENDENTLY SHIPPABLE</div>
    </div>
    <div style="flex:1; min-width:280px; background:#f5f0ff; border:1px solid #c4b5e3; border-radius:8px; padding:16px;">
      <div style="font-weight:700; color:#6c5ce7; margin-bottom:8px;">Workstream B &mdash; Loop Placement</div>
      <ul style="margin:0; padding-left:18px; font-size:14px;">
        <li>In-sprite runner with live Claude session</li>
        <li>Local execFile-based MCP tools (FLAW-01, 02)</li>
        <li>Git subcommand allowlist (FLAW-04)</li>
        <li>HTTP comment delivery into live session</li>
        <li>Error sanitization (FLAW-10) &amp; boundary markers (FLAW-09)</li>
      </ul>
      <div style="margin-top:12px; padding:6px 12px; background:#e17055; color:#fff; border-radius:4px; font-size:12px; font-weight:600; display:inline-block;">DEPENDS ON WORKSTREAM A</div>
    </div>
  </div>

  <h3 style="margin:20px 0 12px 0; font-size:16px; color:#457b9d;">Cross-Repo Scope</h3>
  <table style="width:100%; border-collapse:collapse; font-size:14px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Repository</th>
        <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Role</th>
        <th style="text-align:left; padding:10px 12px; border-bottom:2px solid #ddd;">Change Scope</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">helix-global-server</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#e63946; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">PRIMARY TARGET</span></td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;">~90% of all changes: provisioning, runner, MCP tools, credentials, lifecycle, schema, middleware</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">helix-cli</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#a8a8a8; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">CONTEXT</span></td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;">Likely no changes &mdash; CLI is agnostic to where it runs; token scoping is server-side</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">helix-global-client</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;"><span style="background:#a8a8a8; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">CONTEXT</span></td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;">Likely no changes &mdash; all 7 rendering sites already handle <code style="background:#f4f5f9; padding:2px 4px; border-radius:3px; font-size:12px;">isAgentAuthored</code> correctly</td>
      </tr>
    </tbody>
  </table>

  <h3 style="margin:20px 0 12px 0; font-size:16px; color:#457b9d;">Key Outcomes</h3>
  <ul style="font-size:14px;">
    <li><strong>10 of 11 flaws addressed</strong> with concrete remediations; 1 deferred (FLAW-08: pre-existing in-memory rate limiter, not a regression)</li>
    <li><strong>9 architecture decisions</strong> made with chosen options, rationale, and risks documented</li>
    <li><strong>Session model fully specified:</strong> comment delivery (HTTP push), crash recovery (session ID resume), token refresh (env file rotation)</li>
    <li><strong>Workstream A ships independently</strong>, reducing blast radius before B completes</li>
  </ul>
</div>

<!-- ============================================ -->
<!-- Section 2: Target Architecture -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="target-architecture" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">2. Target Architecture</h2>

  <h3 id="current-vs-target-comparison" style="margin:0 0 16px 0; font-size:18px; color:#457b9d;">Current vs. Target State</h3>

  <table style="width:100%; border-collapse:collapse; font-size:14px;">
    <thead>
      <tr style="background:#1a1a2e; color:#fff;">
        <th style="text-align:left; padding:10px 12px; width:18%;">Concern</th>
        <th style="text-align:left; padding:10px 12px; width:41%;">Current (Host Agent)</th>
        <th style="text-align:left; padding:10px 12px; width:41%;">Target (Parity)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Credentials</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#ffeaea;">PAT embedded in clone URL, persists in <code style="font-size:12px;">.git/config</code></td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#eaffea;">GIT_ASKPASS temp script, token per-command via env, scrubbed in finally block</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Commands</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#ffeaea;">Raw shell strings via <code style="font-size:12px;">sprite.exec()</code></td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#eaffea;">Structured <code style="font-size:12px;">execFile(binary, args)</code> &mdash; shell injection structurally impossible</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Scope</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#ffeaea;">Inspection key with empty <code style="font-size:12px;">repos[]</code> = org-wide access</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#eaffea;">Key scoped to ticket repos; empty scope = deny-all</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Lifecycle</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#ffeaea;">No TTL, fire-and-forget deletion, no GC</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#eaffea;">Hard TTL (1.5h), 2-attempt retry, periodic GC sweep, credential scrub before deletion</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Loop Placement</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#ffeaea;">Agent loop runs in the trust anchor (server process)</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#eaffea;">Agent loop runs in disposable sprite; server only provisions &amp; controls</td>
      </tr>
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:600;">Identity</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#ffeaea;">Comments impersonate ticket reporter</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; background:#eaffea;">Dedicated system/agent user, <code style="font-size:12px;">isAgentAuthored: true</code> preserved</td>
      </tr>
    </tbody>
  </table>

  <h3 id="session-model-overview" style="margin:24px 0 16px 0; font-size:18px; color:#457b9d;">Session Model Overview</h3>

  <p>The Claude session is <strong>held live</strong> in the long-running in-sprite runner for the ticket's active lifetime. It is <strong>not</strong> resumed per comment under normal operation.</p>

  <div style="display:flex; flex-wrap:wrap; gap:12px; margin:16px 0;">
    <div style="flex:1; min-width:200px; background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:14px;">
      <div style="font-weight:700; color:#457b9d; font-size:13px; margin-bottom:6px;">(a) Comment Delivery</div>
      <div style="font-size:13px;">HTTP push from control plane to runner&rsquo;s <code style="font-size:12px;">POST /comment</code> endpoint</div>
    </div>
    <div style="flex:1; min-width:200px; background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:14px;">
      <div style="font-weight:700; color:#457b9d; font-size:13px; margin-bottom:6px;">(b) Crash Recovery</div>
      <div style="font-size:13px;">Resume via persisted <code style="font-size:12px;">sessionId</code>; recovery-only, not normal flow</div>
    </div>
    <div style="flex:1; min-width:200px; background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:14px;">
      <div style="font-weight:700; color:#457b9d; font-size:13px; margin-bottom:6px;">(c) Token Refresh</div>
      <div style="font-size:13px;">Control plane writes new <code style="font-size:12px;">.helix-env</code> to sprite, notifies runner via <code style="font-size:12px;">POST /token-refresh</code></div>
    </div>
  </div>

  <h3 id="component-architecture" style="margin:24px 0 16px 0; font-size:18px; color:#457b9d;">Component Architecture</h3>

  <div style="background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:20px; font-family:'Courier New', monospace; font-size:13px; line-height:1.8; overflow-x:auto;">
<pre style="margin:0; white-space:pre-wrap;">
+--------------------------------------------------+
|  CONTROL PLANE (helix-global-server)              |
|  - Provisions sprite + deploys runner             |
|  - Injects scoped tokens via .helix-env           |
|  - Dispatches @Helix comments to runner           |
|  - Manages TTL, GC, token refresh                 |
|  - Receives agent replies via callback API        |
|  - Attributes comments under agent identity       |
+--------------------------------------------------+
            |                           ^
            | HTTP push to              | hlx comments post
            | POST /comment             | (callback API)
            v                           |
+--------------------------------------------------+
|  DISPOSABLE SPRITE (in-sprite runner)             |
|  - Long-lived Node.js process                     |
|  - Hosts live Claude session (v2 primary)         |
|  - MCP tools execute locally via execFile          |
|  - HTTP server: /comment, /health, /token-refresh |
|  - No durable broad credentials                   |
|  - Scoped inspection key via env                  |
+--------------------------------------------------+
            |
            | hlx inspect
            v
+--------------------------------------------------+
|  HELIX CLI (callback surface)                     |
|  - Auth via HELIX_INSPECT_TOKEN env var            |
|  - Agnostic to runner location                    |
|  - No code changes required                       |
+--------------------------------------------------+
</pre>
  </div>
</div>

<!-- ============================================ -->
<!-- Section 3: Flaw-to-Remediation Traceability -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="flaw-to-remediation-traceability" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">3. Flaw-to-Remediation Traceability</h2>

  <p>Every flaw identified in <strong>RSH-607</strong> is mapped to a concrete remediation in this plan or explicitly deferred with rationale. The baseline is the RSH-607 threat matrix (11 flaws: 4 CRITICAL, 2 HIGH, 5 MEDIUM).</p>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#1a1a2e; color:#fff;">
        <th style="text-align:left; padding:8px 10px;">Flaw</th>
        <th style="text-align:left; padding:8px 10px;">Name</th>
        <th style="text-align:center; padding:8px 10px;">Severity</th>
        <th style="text-align:left; padding:8px 10px;">Remediation</th>
        <th style="text-align:center; padding:8px 10px;">WS</th>
        <th style="text-align:center; padding:8px 10px;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#ffeaea;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-01</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Shell injection in exec_command</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#e63946; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">CRITICAL</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">child_process.execFile(binary, args)</code> in runner replaces raw shell; structurally prevents injection</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr style="background:#ffeaea;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-02</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Shell injection in run_helix_cli</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#e63946; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">CRITICAL</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">execFile("node", [hlxPath, ...args])</code> in runner; same structured command pattern</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr style="background:#ffeaea;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-03</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">PAT in git clone URL</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#e63946; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">CRITICAL</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">GIT_ASKPASS pattern ported from orchestrator (<code style="font-size:11px;">repositories.ts:173-221</code>); token per-command via env, never in URL</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr style="background:#ffeaea;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-04</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Git as exfiltration vector</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#e63946; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">CRITICAL</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Git subcommand allowlist (safe: status, log, diff, show, branch, checkout, rev-parse; deny: push, remote, config) + no durable credential reduces blast radius</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A+B</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr style="background:#fff8e1;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-05</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Unscoped API keys</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#e17055; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">HIGH</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Pass <code style="font-size:11px;">repos: ticketRepoIds</code> to <code style="font-size:11px;">generateInspectionApiKey()</code>; middleware denies empty scope as deny-all</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr style="background:#fff8e1;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-06</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Zombie sprites with credentials</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#e17055; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">HIGH</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Hard TTL (1.5h), 2-attempt retry on deletion, periodic GC sweep for orphaned sprites, credential scrub before deletion</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-07</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Agent identity impersonation</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#ffc107; color:#333; padding:2px 8px; border-radius:12px; font-size:11px;">MEDIUM</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Dedicated system/agent user ID for <code style="font-size:11px;">authorUserId</code>; <code style="font-size:11px;">isAgentAuthored: true</code> preserved for existing UI rendering</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr style="background:#f4f5f9;">
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-08</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">In-memory rate limiter</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#ffc107; color:#333; padding:2px 8px; border-radius:12px; font-size:11px;">MEDIUM</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Pre-existing in both the orchestrator and Host Agent. Not a regression; same limitation across both agent execution models.</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">N/A</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#a8a8a8; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">DEFERRED</span></td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-09</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Comment as raw prompt</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#ffc107; color:#333; padding:2px 8px; border-radius:12px; font-size:11px;">MEDIUM</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">&lt;user_comment&gt;</code> boundary markers in system prompt + blast radius reduction (loop in sprite). Accepted residual risk.</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-10</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Error message info leakage</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#ffc107; color:#333; padding:2px 8px; border-radius:12px; font-size:11px;">MEDIUM</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Strip sensitive values (paths, stack traces, token fragments) before returning to LLM context. Reference: <code style="font-size:11px;">suitecloud-tool-bridge.ts:82-96</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">FLAW-11</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Session status as plain text</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#ffc107; color:#333; padding:2px 8px; border-radius:12px; font-size:11px;">MEDIUM</span></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Convert from <code style="font-size:11px;">String</code> to Prisma enum <code style="font-size:11px;">HostAgentSessionStatus</code> with 5 values: PROVISIONING, ACTIVE, ERROR, TERMINATED, EXPIRED</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;"><span style="background:#2a9d8f; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">ADDRESSED</span></td>
      </tr>
    </tbody>
  </table>

  <div style="background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:14px; margin-top:16px; font-size:13px;">
    <strong>FLAW-08 deferral rationale:</strong> The in-memory rate limiter is a pre-existing limitation shared by both the orchestrator and Host Agent. It is not a regression introduced by the Host Agent. Fixing it requires a distributed rate-limiting infrastructure (e.g., Redis-based) that is beyond the scope of this parity plan. This is tracked as future work under egress phase-separation.
  </div>
</div>

<!-- ============================================ -->
<!-- Section 4: Workstream A -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="workstream-a-credentials-and-lifecycle-parity" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">4. Workstream A: Credentials &amp; Lifecycle Parity</h2>

  <div style="background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:14px; margin-bottom:20px; font-size:14px;">
    <strong>Workstream A is independently shippable.</strong> These changes port proven orchestrator patterns into the existing Host Agent architecture. They provide immediate security value by reducing the blast radius of all flaws &mdash; even with the loop still in the server process.
  </div>

  <!-- A1 -->
  <h3 id="a1-git-askpass-credential-pattern" style="margin:24px 0 12px 0; font-size:16px; color:#e63946;">A1: GIT_ASKPASS Credential Pattern (FLAW-03)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Current State</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts:501</code> &mdash; PAT embedded in clone URL: <code style="font-size:11px;">https://x-access-token:${orgPat}@github.com/...</code>. Token persists in <code style="font-size:11px;">.git/config</code> for the sprite's lifetime, readable by the agent's own tools.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Target State</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Write a temp askpass shell script to the sprite via <code style="font-size:12px;">sprite.exec()</code>. Set <code style="font-size:12px;">GIT_ASKPASS</code> env for the clone command. Delete the script in a finally block after clone completes (success or failure).</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Reference Pattern</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">orchestrator/repositories.ts:173-221</code> &mdash; Three auth session types (OrgPat, SystemToken, DeployKey), each creating a temp askpass script with <code style="font-size:12px;">scrubPaths</code> for cleanup. <code style="font-size:12px;">GIT_TERMINAL_PROMPT=0</code> prevents interactive prompts.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">New Type</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">SpriteAuthSession { cloneUrl: string, scrubPaths: string[], env: Record&lt;string, string&gt; }</code> &mdash; parallel to orchestrator's <code style="font-size:12px;">RepoGitAuthSession</code> (types.ts:21-25)</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Portability</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Proven: sprite file writes work at <code style="font-size:12px;">host-agent-service.ts:535-538</code> (<code style="font-size:11px;">.helix-env</code> write via <code style="font-size:11px;">sprite.exec</code>). Same mechanism writes the askpass script.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts</code> (provisioning logic), new <code style="font-size:12px;">src/services/host-agent/types.ts</code> (SpriteAuthSession type)</td>
    </tr>
  </table>

  <!-- A2 -->
  <h3 id="a2-scoped-inspection-keys" style="margin:24px 0 12px 0; font-size:16px; color:#e17055;">A2: Scoped Inspection Keys (FLAW-05)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Current State</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts:522</code> calls <code style="font-size:12px;">generateInspectionApiKey()</code> without <code style="font-size:12px;">repos</code> param. Default is empty array (<code style="font-size:12px;">inspection-api-key-service.ts:47</code>). <code style="font-size:12px;">middleware.ts:369-376</code> treats empty scope as grant-all.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Target State</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Pass ticket repository IDs to <code style="font-size:12px;">generateInspectionApiKey({ repos: ticketRepoIds })</code>. Middleware denies when <code style="font-size:12px;">inspectionRepos</code> is empty/undefined (one-line change at <code style="font-size:12px;">middleware.ts:369</code>).</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Infrastructure</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Already exists: <code style="font-size:12px;">InspectionApiKey</code> model has <code style="font-size:12px;">repos String[]</code> and <code style="font-size:12px;">expiresAt DateTime</code> (schema.prisma:669-687). The function already accepts optional <code style="font-size:12px;">repos?: string[]</code>. The fix is literally adding one parameter.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Risk</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><span style="background:#fff3cd; padding:2px 6px; border-radius:4px;">Deny-empty-scope affects ALL inspection API keys</span>, not just Host Agent ones. Must verify no other code path relies on empty-scope-means-all. Scout evidence: only the Host Agent omits repos.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts</code>, <code style="font-size:12px;">middleware.ts</code>, <code style="font-size:12px;">middleware.test.ts</code> (new tests for deny-empty-scope)</td>
    </tr>
  </table>

  <!-- A3 -->
  <h3 id="a3-sprite-lifecycle" style="margin:24px 0 12px 0; font-size:16px; color:#e17055;">A3: Sprite Lifecycle (FLAW-06)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">TTL</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Add <code style="font-size:12px;">expiresAt DateTime?</code> to <code style="font-size:12px;">HostAgentSession</code>. Default: 1.5 hours (matching orchestrator's <code style="font-size:12px;">vercelSandboxTimeoutMs = 5,400,000</code> at <code style="font-size:12px;">env.ts:168</code>). Configurable via new <code style="font-size:12px;">hostAgentSpriteTtlMs</code> in <code style="font-size:12px;">config/env.ts</code>.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Retry Teardown</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Wrap <code style="font-size:12px;">deleteSpriteByName</code> (<code style="font-size:12px;">sprites/client.ts:40-49</code>) with 2-attempt retry + exponential backoff, matching orchestrator's <code style="font-size:12px;">stopSandboxBestEffort</code> (<code style="font-size:12px;">orchestrator.ts:371-379</code>). Log failures with structured metric emission on final failure.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Credential Scrub</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">sprite.exec("rm -f /app/.helix-env /tmp/github-askpass-*.sh")</code> in a finally block before sprite deletion. Modeled on orchestrator's <code style="font-size:12px;">scrubTempFile()</code> (<code style="font-size:12px;">orchestrator.ts:362-369</code>).</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">GC Sweep</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Periodic sweep (10-min interval): query <code style="font-size:12px;">HostAgentSession</code> for <code style="font-size:12px;">expiresAt &lt; now()</code> AND status not <code style="font-size:12px;">TERMINATED</code>. For each match: scrub credentials, delete sprite, revoke inspection key, mark <code style="font-size:12px;">TERMINATED</code>. DB-based concurrency control (optimistic update via <code style="font-size:12px;">status</code> WHERE clause) prevents multi-instance double-delete.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">sprites/client.ts</code> (retry logic), <code style="font-size:12px;">host-agent-service.ts</code> (credential scrub, TTL), <code style="font-size:12px;">config/env.ts</code> (add <code style="font-size:11px;">hostAgentSpriteTtlMs</code>), new <code style="font-size:12px;">src/services/host-agent/gc.ts</code> (GC module)</td>
    </tr>
  </table>

  <!-- A4 -->
  <h3 id="a4-dedicated-agent-identity" style="margin:24px 0 12px 0; font-size:16px; color:#ffc107;">A4: Dedicated Agent Identity (FLAW-07)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Current State</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts:405, 619, 797</code> uses <code style="font-size:12px;">ticket.reporterUserId</code> as <code style="font-size:12px;">authorUserId</code>, impersonating the ticket reporter while setting <code style="font-size:12px;">isAgentAuthored: true</code>.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Target State</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Create/designate a system user (e.g., per-org or global) whose ID is used as <code style="font-size:12px;">authorUserId</code>. <code style="font-size:12px;">isAgentAuthored: true</code> preserved for UI compatibility.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Client Impact</td>
      <td style="padding:8px 12px; border:1px solid #eee;">None: all 7 rendering sites in helix-global-client use <code style="font-size:12px;">isAgentAuthored</code> to show "H" badge and "Helix" label. They ignore <code style="font-size:12px;">comment.author</code> when <code style="font-size:12px;">isAgentAuthored === true</code>. Confirmed across: CommentItem, DiscussionSection, LibraryCommentItem, Inbox, ActivityFeedSection, NotificationSidebar, NotificationToast.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts</code> (replace <code style="font-size:11px;">reporterUserId</code> at 3 locations), possibly a migration/seed for system user provisioning</td>
    </tr>
  </table>

  <!-- A5 -->
  <h3 id="a5-session-status-enum" style="margin:24px 0 12px 0; font-size:16px; color:#ffc107;">A5: Session Status Enum (FLAW-11)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Current State</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">status String @default("PROVISIONING")</code> &mdash; unconstrained, no DB-level validation</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Target State</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">status HostAgentSessionStatus @default(PROVISIONING)</code> with enum values: <code style="font-size:12px;">PROVISIONING</code>, <code style="font-size:12px;">ACTIVE</code>, <code style="font-size:12px;">ERROR</code>, <code style="font-size:12px;">TERMINATED</code>, <code style="font-size:12px;">EXPIRED</code></td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Precedent</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">InspectionApiKeyStatus</code> enum already exists (<code style="font-size:12px;">schema.prisma:669-687</code>) with <code style="font-size:12px;">ACTIVE</code>/<code style="font-size:12px;">REVOKED</code> values. Same pattern.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">prisma/schema.prisma</code> (add enum, update field type), migration file</td>
    </tr>
  </table>

  <!-- Internal ordering -->
  <div style="background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:16px; margin-top:16px;">
    <h4 style="margin:0 0 12px 0; font-size:14px; color:#1a1a2e;">Recommended Implementation Order within Workstream A</h4>
    <ol style="margin:0; padding-left:20px; font-size:14px;">
      <li style="margin-bottom:6px;"><strong>A2: Scoped inspection keys</strong> &mdash; Simplest, highest-impact single change (one parameter + one-line middleware fix)</li>
      <li style="margin-bottom:6px;"><strong>A5: Session status enum</strong> &mdash; Schema-only change, no runtime dependencies</li>
      <li style="margin-bottom:6px;"><strong>A4: Dedicated agent identity</strong> &mdash; Backend-only, 3 call sites</li>
      <li style="margin-bottom:6px;"><strong>A1: GIT_ASKPASS</strong> &mdash; Requires new type + provisioning refactor</li>
      <li style="margin-bottom:6px;"><strong>A3: Sprite lifecycle</strong> &mdash; Requires most infrastructure (TTL config, retry wrapper, GC module)</li>
    </ol>
  </div>
</div>

<!-- ============================================ -->
<!-- Section 5: Workstream B -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="workstream-b-loop-placement-parity" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #6c5ce7; padding-bottom:8px;">5. Workstream B: Loop Placement Parity</h2>

  <div style="background:#f5f0ff; border:1px solid #c4b5e3; border-radius:8px; padding:14px; margin-bottom:20px; font-size:14px;">
    <strong>Workstream B depends on Workstream A.</strong> It moves the agent reasoning loop from the trust anchor into the disposable sprite, mirroring how the orchestrator runs its step agents inside the Vercel sandbox. This eliminates the trust-boundary violations (FLAW-01, 02, 04, 09, 10) by ensuring the sprite holds no durable broad credential to reach or exfiltrate.
  </div>

  <!-- B1 -->
  <h3 id="b1-in-sprite-runner" style="margin:24px 0 12px 0; font-size:16px; color:#6c5ce7;">B1: In-Sprite Runner</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">New Module</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">src/services/host-agent/runner.ts</code></td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Purpose</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Long-lived Node.js process deployed to the sprite at provision time. Hosts the live Claude session via Agent SDK v2 (<code style="font-size:12px;">unstable_v2_createSession</code>), registers MCP tools, and runs the HTTP comment delivery server.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">HTTP Endpoints</td>
      <td style="padding:8px 12px; border:1px solid #eee;">
        <ul style="margin:4px 0; padding-left:16px; font-size:12px;">
          <li><code>POST /comment</code> &mdash; Receive new @Helix comments</li>
          <li><code>GET /health</code> &mdash; Liveness check for control plane monitoring</li>
          <li><code>POST /token-refresh</code> &mdash; Notification to re-read env file after token rotation</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Auth</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Shared secret injected at provision time, validated on all incoming HTTP requests</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Reference</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">step-executor/execute.ts:209-235</code> (env-injected secrets), <code style="font-size:12px;">runtime-assets.ts</code> (asset deployment to sandbox)</td>
    </tr>
  </table>

  <!-- B2 -->
  <h3 id="b2-mcp-tools-migration" style="margin:24px 0 12px 0; font-size:16px; color:#e63946;">B2: MCP Tools Migration (FLAW-01, 02)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">New Module</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">src/services/host-agent/tools.ts</code></td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Tools</td>
      <td style="padding:8px 12px; border:1px solid #eee;">5 tools reimplemented with <code style="font-size:12px;">child_process.execFile(binary, args)</code>:
        <ul style="margin:4px 0; padding-left:16px; font-size:12px;">
          <li><code>read_file</code>, <code>search_code</code>, <code>list_files</code> &mdash; already safe (use shellQuote)</li>
          <li><code>exec_command</code> &mdash; <strong>FLAW-01 fix:</strong> <code>execFile(binary, args)</code> replaces raw shell</li>
          <li><code>run_helix_cli</code> &mdash; <strong>FLAW-02 fix:</strong> <code>execFile("node", [hlxPath, ...args])</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Git Allowlist</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><strong>FLAW-04 defense-in-depth:</strong> When <code style="font-size:12px;">binary === "git"</code>, validate the first arg (subcommand) against an allowlist: <code style="font-size:11px;">status, log, diff, show, branch, checkout, rev-parse</code>. Deny: <code style="font-size:11px;">push, remote, config, clone, fetch</code> (and any not on allowlist).</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Reference</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">command-runtime.ts:63-110</code> (structured <code style="font-size:11px;">{cmd, args}</code> execution), <code style="font-size:12px;">sandbox-command.ts:5-36</code> (clean structured command wrapper)</td>
    </tr>
  </table>

  <!-- B3 -->
  <h3 id="b3-comment-delivery" style="margin:24px 0 12px 0; font-size:16px; color:#6c5ce7;">B3: Comment Delivery (HTTP Push)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Flow</td>
      <td style="padding:8px 12px; border:1px solid #eee;">
        <ol style="margin:4px 0; padding-left:16px; font-size:12px;">
          <li>User posts @Helix comment</li>
          <li><code>comment-controller.ts</code> dispatches to control plane handler</li>
          <li>Control plane sends HTTP request to <code>http://&lt;sprite-address&gt;:8080/comment</code></li>
          <li>Runner calls <code>session.send(prompt)</code>, processes <code>session.receive()</code></li>
          <li>Runner posts reply via <code>hlx comments post</code></li>
        </ol>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Fallback</td>
      <td style="padding:8px 12px; border:1px solid #eee;">If sprite networking is unavailable, use <code style="font-size:12px;">sprite.exec</code> to deliver the comment payload (e.g., write to a file the runner watches)</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Latency Target</td>
      <td style="padding:8px 12px; border:1px solid #eee;">&lt;500ms from comment creation to runner receipt</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">comment-controller.ts:124-150</code> (refactor dispatch), new <code style="font-size:12px;">src/services/host-agent/server.ts</code> (HTTP server in runner)</td>
    </tr>
  </table>

  <!-- B4 -->
  <h3 id="b4-error-sanitization" style="margin:24px 0 12px 0; font-size:16px; color:#ffc107;">B4: Error Sanitization (FLAW-10)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Action</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Strip sensitive values (file paths to temp scripts, stack traces, token fragments) from tool error messages before returning them to the LLM context.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Reference</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">suitecloud-tool-bridge.ts:82-96</code> &mdash; already implements credential redaction by stripping known sensitive patterns from error output before logging.</td>
    </tr>
  </table>

  <!-- B5 -->
  <h3 id="b5-comment-boundary-markers" style="margin:24px 0 12px 0; font-size:16px; color:#ffc107;">B5: Comment Boundary Markers (FLAW-09)</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Action</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Wrap user comment content in <code style="font-size:12px;">&lt;user_comment&gt;...&lt;/user_comment&gt;</code> structured markers in the system prompt, with explicit instructions that the content is user-provided and may contain adversarial instructions.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Note</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Defense-in-depth for prompt injection. <strong>Accepted residual risk:</strong> prompt injection is inherent to the feature; the primary mitigation is that a compromised sprite has limited blast radius.</td>
    </tr>
  </table>

  <!-- B6 -->
  <h3 id="b6-control-plane-refactor" style="margin:24px 0 12px 0; font-size:16px; color:#6c5ce7;">B6: Control Plane Refactor</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">Before</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts</code> provisions sprite, runs <code style="font-size:12px;">query()</code> loop in-process, handles comments in-process, uses <code style="font-size:12px;">sprite.exec()</code> for tool calls.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">After</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts</code> provisions sprite, deploys runner, injects tokens, manages lifecycle remotely. <strong>No longer runs <code style="font-size:12px;">query()</code> loop in-process.</strong> Comment dispatch sends to runner's HTTP endpoint instead of in-process handler.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Files Changed</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">host-agent-service.ts</code> (major refactor), <code style="font-size:12px;">comment-controller.ts</code> (dispatch to runner HTTP)</td>
    </tr>
  </table>

  <!-- Internal ordering -->
  <div style="background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:16px; margin-top:16px;">
    <h4 style="margin:0 0 12px 0; font-size:14px; color:#1a1a2e;">Recommended Implementation Order within Workstream B</h4>
    <ol style="margin:0; padding-left:20px; font-size:14px;">
      <li style="margin-bottom:6px;"><strong>B1: In-sprite runner</strong> &mdash; Foundation; must be validated before other B tasks</li>
      <li style="margin-bottom:6px;"><strong>B2: MCP tools migration</strong> &mdash; Core tools needed by the runner</li>
      <li style="margin-bottom:6px;"><strong>B4 + B5: Error sanitization + boundary markers</strong> &mdash; Defense-in-depth layers for the new tools</li>
      <li style="margin-bottom:6px;"><strong>B3: Comment delivery</strong> &mdash; Connects control plane to runner</li>
      <li style="margin-bottom:6px;"><strong>B6: Control plane refactor</strong> &mdash; Removes the in-process loop (final step)</li>
    </ol>
  </div>
</div>

<!-- ============================================ -->
<!-- Section 6: File-Level Change List -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="file-level-change-list" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">6. File-Level Change List</h2>

  <h3 id="helix-global-server-changes" style="margin:0 0 16px 0; font-size:18px; color:#e63946;">helix-global-server (Primary Target)</h3>

  <h4 style="margin:16px 0 8px 0; font-size:15px; color:#457b9d;">Modified Files</h4>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">File</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Changes</th>
        <th style="text-align:center; padding:8px 10px; border-bottom:2px solid #ddd;">WS</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent-service.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">GIT_ASKPASS provisioning, scoped inspection keys (<code style="font-size:11px;">repos</code> param), agent identity (<code style="font-size:11px;">authorUserId</code> at 3 sites), TTL setting, credential scrub before teardown, control-plane-only provisioning (remove in-process <code style="font-size:11px;">query()</code> loop)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A+B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/auth/middleware.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Deny-empty-scope: when <code style="font-size:11px;">inspectionRepos</code> is empty/undefined, reject instead of skip (line 369)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/auth/middleware.test.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">New tests for deny-empty-scope behavior</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/sprites/client.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Add 2-attempt retry with backoff to <code style="font-size:11px;">deleteSpriteByName</code>; structured metric on final failure</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/config/env.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Add <code style="font-size:11px;">hostAgentSpriteTtlMs</code> config (default 5,400,000ms = 1.5h)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/controllers/comment-controller.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Refactor dispatch to route @Helix comments to runner HTTP endpoint instead of in-process handler</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent-service.test.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Updated tests for all modified behaviors (credentials, scoping, identity, lifecycle)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A+B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">prisma/schema.prisma</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Add <code style="font-size:11px;">HostAgentSessionStatus</code> enum (5 values), change <code style="font-size:11px;">status</code> field type, add <code style="font-size:11px;">expiresAt DateTime?</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
    </tbody>
  </table>

  <h4 style="margin:20px 0 8px 0; font-size:15px; color:#457b9d;">New Files</h4>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">File</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Purpose</th>
        <th style="text-align:center; padding:8px 10px; border-bottom:2px solid #ddd;">WS</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent/runner.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">In-sprite runner entry point: creates Claude session, registers tools, starts HTTP server</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent/tools.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">MCP tools with <code style="font-size:11px;">execFile</code> structured execution + git subcommand allowlist</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent/session.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Session manager: v2 <code style="font-size:11px;">createSession</code>/<code style="font-size:11px;">send</code>/<code style="font-size:11px;">receive</code> abstraction with v1 resume fallback</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent/server.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">HTTP server for comment delivery (<code style="font-size:11px;">/comment</code>, <code style="font-size:11px;">/health</code>, <code style="font-size:11px;">/token-refresh</code>)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">B</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent/gc.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Garbage collection sweep for orphaned sprites with DB-based concurrency control</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">src/services/host-agent/types.ts</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">SpriteAuthSession</code> type, runner config types, comment delivery types</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">prisma/migrations/YYYYMMDD_host_agent_lifecycle/migration.sql</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Schema migration: add <code style="font-size:11px;">HostAgentSessionStatus</code> enum, convert <code style="font-size:11px;">status</code> column, add <code style="font-size:11px;">expiresAt</code></td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">A</td>
      </tr>
    </tbody>
  </table>

  <h3 id="helix-cli-assessment" style="margin:24px 0 12px 0; font-size:18px; color:#a8a8a8;">helix-cli (Likely No Changes)</h3>

  <div style="background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:16px; font-size:14px;">
    <p style="margin:0 0 8px 0;"><strong>Assessment:</strong> The CLI is agnostic to where it runs. No host-agent or sprite references exist in the CLI codebase.</p>
    <ul style="margin:0; padding-left:18px;">
      <li><strong>Token scoping</strong> is a server-side concern &mdash; the CLI just passes the token</li>
      <li><strong>Token refresh</strong> may be purely a control-plane concern if the runner re-reads env vars on each CLI invocation</li>
      <li><strong>Comment identity</strong> is server-determined from the auth token</li>
    </ul>
    <p style="margin:8px 0 0 0;"><strong>Potential:</strong> If the runner uses CLI commands, ensure <code style="font-size:12px;">HELIX_API_KEY</code> env var format is compatible. No code changes expected.</p>
  </div>

  <h3 id="helix-global-client-assessment" style="margin:24px 0 12px 0; font-size:18px; color:#a8a8a8;">helix-global-client (Likely No Changes)</h3>

  <div style="background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:16px; font-size:14px;">
    <p style="margin:0 0 8px 0;"><strong>Assessment:</strong> All 7 rendering sites already handle <code style="font-size:12px;">isAgentAuthored</code> correctly, showing "H" badge and "Helix" label for agent comments.</p>
    <ul style="margin:0; padding-left:18px;">
      <li><strong>FLAW-07 fix is backend-only:</strong> If the backend assigns a dedicated system user as <code style="font-size:12px;">comment.author</code> and keeps <code style="font-size:12px;">isAgentAuthored: true</code>, existing UI renders correctly</li>
      <li><strong>Potential minor change:</strong> <code style="font-size:12px;">Reporter</code> type update if the system user has a different shape (unlikely since Reporter has <code style="font-size:12px;">id, email, name</code>)</li>
    </ul>
    <p style="margin:8px 0 0 0;">Confirmed across: CommentItem, DiscussionSection, LibraryCommentItem, Inbox, ActivityFeedSection, NotificationSidebar, NotificationToast.</p>
  </div>
</div>

<!-- ============================================ -->
<!-- Section 7: Schema & Migration Plan -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="schema-and-migration-plan" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">7. Schema &amp; Migration Plan</h2>

  <h3 id="current-schema" style="margin:0 0 16px 0; font-size:18px; color:#457b9d;">Current Schema (HostAgentSession)</h3>

  <div style="background:#1a1a2e; color:#a8dadc; padding:16px 20px; border-radius:8px; font-family:'Courier New', monospace; font-size:13px; line-height:1.6; overflow-x:auto;">
<pre style="margin:0; color:#a8dadc;">model HostAgentSession {
  id                 String   @id @default(cuid())
  ticketId           String
  ticket             Ticket   @relation(...)
  orgId              String
  org                Org      @relation(...)
  spriteName         String
  claudeSessionId    String?
  inspectionApiKeyId String?
  inspectionApiKey   InspectionApiKey? @relation(...)
  <span style="color:#e63946;">status             String   @default("PROVISIONING")  // FLAW-11: unconstrained</span>
  <span style="color:#e63946;">// NO expiresAt field  // FLAW-06: no TTL</span>
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}</pre>
  </div>

  <h3 id="target-schema" style="margin:24px 0 16px 0; font-size:18px; color:#2a9d8f;">Target Schema</h3>

  <div style="background:#1a1a2e; color:#a8dadc; padding:16px 20px; border-radius:8px; font-family:'Courier New', monospace; font-size:13px; line-height:1.6; overflow-x:auto;">
<pre style="margin:0; color:#a8dadc;"><span style="color:#2a9d8f;">enum HostAgentSessionStatus {
  PROVISIONING
  ACTIVE
  ERROR
  TERMINATED
  EXPIRED        // NEW: for TTL-triggered termination
}</span>

model HostAgentSession {
  id                 String                    @id @default(cuid())
  ticketId           String
  ticket             Ticket                    @relation(...)
  orgId              String
  org                Org                       @relation(...)
  spriteName         String
  claudeSessionId    String?
  inspectionApiKeyId String?
  inspectionApiKey   InspectionApiKey?         @relation(...)
  <span style="color:#2a9d8f;">status             HostAgentSessionStatus    @default(PROVISIONING)  // enum</span>
  <span style="color:#2a9d8f;">expiresAt          DateTime?                                         // TTL</span>
  createdAt          DateTime                  @default(now())
  updatedAt          DateTime                  @updatedAt
}</pre>
  </div>

  <h3 id="migration-strategy" style="margin:24px 0 16px 0; font-size:18px; color:#457b9d;">Migration Strategy</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:20%; font-weight:600; background:#f4f5f9;">ORM</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Prisma <code style="font-size:12px;">@prisma/client@^6.19.2</code></td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Strategy</td>
      <td style="padding:8px 12px; border:1px solid #eee;">File-based migrations via <code style="font-size:12px;">prisma migrate deploy</code> (run by <code style="font-size:12px;">scripts/prisma-migrate-all.mjs</code> at build time)</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Existing Migrations</td>
      <td style="padding:8px 12px; border:1px solid #eee;">The <code style="font-size:12px;">prisma/migrations/</code> directory exists with 60+ existing migrations. The infrastructure is established.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Command</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px; background:#1a1a2e; color:#a8dadc; padding:4px 8px; border-radius:4px;">npx prisma migrate dev --name host-agent-lifecycle</code></td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Data Migration</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Existing String values ("PROVISIONING", "ACTIVE", "ERROR", "TERMINATED") map directly to enum values. Prisma handles the PostgreSQL enum creation and column type conversion automatically. New value <code style="font-size:12px;">EXPIRED</code> has no existing data.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f4f5f9;">Cross-Reference</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><code style="font-size:12px;">InspectionApiKey</code> model already has <code style="font-size:12px;">repos String[]</code>, <code style="font-size:12px;">expiresAt DateTime</code>, and <code style="font-size:12px;">InspectionApiKeyStatus</code> enum. The infrastructure for scoped, expirable keys with enum status is already established.</td>
    </tr>
  </table>

  <div style="background:#fff3cd; border-left:4px solid #ffc107; padding:16px 20px; border-radius:0 8px 8px 0; margin-top:16px; font-size:14px;">
    <strong style="color:#856404;">Note:</strong> The feature is gated (<code style="font-size:12px;">HOST_AGENT_ENABLED=false</code>) and not deployed. No production <code style="font-size:12px;">HostAgentSession</code> rows exist (confirmed via RSH-607 runtime inspection). The migration is safe to apply without data loss concerns.
  </div>
</div>

<!-- ============================================ -->
<!-- Section 8: Session/Persistence Model -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="session-persistence-model-specification" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">8. Session/Persistence Model Specification</h2>

  <p>The ticket requires the plan to fully specify three aspects of the session model. Each is detailed below with mechanism, flow, and failure handling.</p>

  <!-- (a) Comment Delivery -->
  <h3 id="comment-delivery" style="margin:24px 0 12px 0; font-size:18px; color:#457b9d;">(a) Comment Delivery</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:18%; font-weight:600; background:#f0f7ff;">Mechanism</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Control-plane HTTP push to runner at <code style="font-size:12px;">POST http://&lt;sprite-address&gt;:8080/comment</code></td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Flow</td>
      <td style="padding:8px 12px; border:1px solid #eee;">
        <ol style="margin:0; padding-left:16px; font-size:12px;">
          <li>User posts <code>@Helix</code> comment on ticket</li>
          <li><code>comment-controller.ts</code> identifies active <code>HostAgentSession</code></li>
          <li>Control plane sends comment payload to runner via HTTP POST</li>
          <li>Runner validates shared-secret authentication</li>
          <li>Runner calls <code>session.send(prompt)</code> with the comment text wrapped in <code>&lt;user_comment&gt;</code> markers</li>
          <li>Runner processes <code>session.receive()</code> stream, executing any tool calls</li>
          <li>Runner posts reply via <code>hlx comments post --ticket $TICKET_ID</code></li>
        </ol>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Authentication</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Shared secret generated at provision time, injected into runner's env as <code style="font-size:12px;">RUNNER_SECRET</code>. Runner validates <code style="font-size:12px;">Authorization: Bearer &lt;secret&gt;</code> on all incoming requests.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Fallback</td>
      <td style="padding:8px 12px; border:1px solid #eee;">If sprite networking is unavailable (unknown: whether sprites SDK exposes network address), fall back to <code style="font-size:12px;">sprite.exec</code> to deliver the comment payload to a file watched by the runner.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Latency Target</td>
      <td style="padding:8px 12px; border:1px solid #eee;">&lt;500ms from comment creation to runner receipt</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Failure Handling</td>
      <td style="padding:8px 12px; border:1px solid #eee;">If HTTP push fails (runner crashed, network timeout): mark session for health-check investigation. If runner is confirmed down, trigger crash recovery (see (b)).</td>
    </tr>
  </table>

  <!-- (b) Crash Recovery -->
  <h3 id="crash-recovery" style="margin:24px 0 12px 0; font-size:18px; color:#457b9d;">(b) Crash Recovery</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:18%; font-weight:600; background:#f0f7ff;">Detection</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Control plane health checks via <code style="font-size:12px;">GET /health</code> on the runner. The health endpoint is the primary liveness signal. Failed comment delivery attempts also trigger detection.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Mechanism</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Resume via persisted <code style="font-size:12px;">claudeSessionId</code> (already stored in <code style="font-size:12px;">HostAgentSession</code> model).</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Recovery Flow</td>
      <td style="padding:8px 12px; border:1px solid #eee;">
        <strong>Runner crash (sprite still alive):</strong>
        <ol style="margin:4px 0 8px 0; padding-left:16px; font-size:12px;">
          <li>Control plane detects runner down via failed health check</li>
          <li>Re-deploy runner process in existing sprite</li>
          <li>Runner starts with <code>unstable_v2_resumeSession(sessionId)</code> or <code>query({ resume: sessionId })</code></li>
          <li>Session continues with full conversation history</li>
        </ol>
        <strong>Sprite crash:</strong>
        <ol style="margin:4px 0; padding-left:16px; font-size:12px;">
          <li>Control plane detects sprite gone</li>
          <li>Create new sprite, clone repos, deploy runner</li>
          <li>Runner resumes session via <code>claudeSessionId</code></li>
          <li>Full re-provisioning with fresh scoped tokens</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Key Principle</td>
      <td style="padding:8px 12px; border:1px solid #eee;"><strong>Resume is the crash-recovery path, NOT the normal flow.</strong> Under normal operation, the live session stays active and comments are delivered into it without rebuilding context.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">SDK Paths</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Primary: <code style="font-size:12px;">unstable_v2_resumeSession(sessionId)</code> (Agent SDK v2, preview). Fallback: <code style="font-size:12px;">query({ resume: sessionId })</code> (Agent SDK v1, stable).</td>
    </tr>
  </table>

  <!-- (c) Token Refresh -->
  <h3 id="token-refresh" style="margin:24px 0 12px 0; font-size:18px; color:#457b9d;">(c) Token Refresh</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; width:18%; font-weight:600; background:#f0f7ff;">Mechanism</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Control plane writes new <code style="font-size:12px;">/app/.helix-env</code> file to sprite via <code style="font-size:12px;">sprite.exec()</code>, then calls <code style="font-size:12px;">POST /token-refresh</code> on the runner to notify it to re-read the env file.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Cadence</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Refresh at ~75% of token expiry. For a 1-hour inspection key (<code style="font-size:12px;">InspectionApiKey.expiresAt</code>), refresh at ~45 minutes.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Token Types</td>
      <td style="padding:8px 12px; border:1px solid #eee;">
        <ul style="margin:0; padding-left:16px; font-size:12px;">
          <li><strong>Inspection key:</strong> Short-lived, refreshed by control plane. Env var: <code>HELIX_INSPECT_TOKEN</code></li>
          <li><strong>GitHub PAT:</strong> Long-lived org PAT. Only present during clone via askpass script, NOT persisted &mdash; does not need refresh</li>
          <li><strong>Anthropic API key:</strong> Long-lived inference key. Present in env for the session duration. Same posture as orchestrator (accepted)</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Sprite TTL</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Hard maximum lifetime (1.5h default). When TTL expires, sprite is torn down and credentials scrubbed. If the ticket is still active, a new sprite is launched with fresh tokens and a new session.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Portability</td>
      <td style="padding:8px 12px; border:1px solid #eee;">Proven: <code style="font-size:12px;">host-agent-service.ts:535-538</code> already writes <code style="font-size:12px;">.helix-env</code> to the sprite. Overwriting with fresh tokens is the same operation.</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; border:1px solid #eee; font-weight:600; background:#f0f7ff;">Failure Handling</td>
      <td style="padding:8px 12px; border:1px solid #eee;">If token refresh fails (sprite unreachable): flag for health-check investigation. If inspection key expires before refresh, agent CLI commands fail gracefully; control plane re-provisions tokens. The runner does NOT crash on expired tokens &mdash; it reports a tool error.</td>
    </tr>
  </table>

  <!-- Session lifecycle diagram -->
  <h3 id="session-lifecycle" style="margin:24px 0 16px 0; font-size:18px; color:#457b9d;">Session Lifecycle</h3>

  <div style="background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:20px; font-family:'Courier New', monospace; font-size:13px; line-height:1.8; overflow-x:auto;">
<pre style="margin:0; white-space:pre-wrap;">
1. PROVISION
   Control plane creates sprite, clones repos, deploys runner
   Sets HostAgentSession.status = PROVISIONING
   Sets HostAgentSession.expiresAt = now() + hostAgentSpriteTtlMs

2. ACTIVATE
   Runner starts, creates Claude session (v2 createSession)
   Stores claudeSessionId in HostAgentSession
   Sets status = ACTIVE
   Starts HTTP server (:8080)

3. OPERATE (normal flow)
   @Helix comment -> control plane -> POST /comment -> runner
   session.send(prompt) -> session.receive() -> hlx comments post
   Token refresh at 75% expiry intervals

4a. TERMINATE (graceful)
    Session completes or no more comments
    Credential scrub (rm -f .helix-env, askpass scripts)
    Sprite deletion with 2-attempt retry
    Status = TERMINATED

4b. EXPIRE (TTL)
    expiresAt reached
    GC sweep or control plane detects expiry
    Same credential scrub + sprite deletion
    Status = EXPIRED
    If ticket still active: re-launch from step 1

4c. RECOVER (crash)
    Runner/sprite crash detected via health check
    Re-deploy runner (or new sprite if sprite crashed)
    Resume session via claudeSessionId
    Continue from step 3
</pre>
  </div>
</div>

<!-- ============================================ -->
<!-- Section 9: Test Plan -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="test-plan" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">9. Test Plan</h2>

  <p>The ticket requires test coverage for four specific areas: multi-instance behavior, credential-scrub verification, token refresh, and teardown/GC. These are expanded into 7 test categories with specific, implementable test scenarios.</p>

  <!-- T1 -->
  <h3 id="t1-credential-scrub-verification" style="margin:20px 0 12px 0; font-size:16px; color:#e63946;">T1: Credential Scrub Verification</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T1.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">After clone, no PAT appears in <code style="font-size:11px;">.git/config</code> or clone URLs (GIT_ASKPASS pattern)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T1.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Askpass script is deleted in finally block even on clone failure</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T1.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">.helix-env</code> is scrubbed before sprite deletion (rm -f in finally block)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T1.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Inspection key has <code style="font-size:11px;">repos[]</code> populated with ticket repo IDs (not empty)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T1.5</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">No sensitive values (tokens, PATs) in runner environment after initial setup</td></tr>
    </tbody>
  </table>

  <!-- T2 -->
  <h3 id="t2-lifecycle-and-teardown" style="margin:20px 0 12px 0; font-size:16px; color:#e17055;">T2: Lifecycle &amp; Teardown</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T2.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Sprite is deleted after session completes (status -> TERMINATED)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T2.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">First deletion failure triggers a retry with backoff (2-attempt pattern)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T2.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Credential scrub runs before sprite deletion (ordering guarantee)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T2.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">TTL enforcement: sprite terminated after <code style="font-size:11px;">expiresAt</code> (status -> EXPIRED)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T2.5</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Session status transitions: PROVISIONING -> ACTIVE -> TERMINATED/EXPIRED</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T2.6</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Inspection key revoked when session terminates</td></tr>
    </tbody>
  </table>

  <!-- T3 -->
  <h3 id="t3-garbage-collection" style="margin:20px 0 12px 0; font-size:16px; color:#e17055;">T3: Garbage Collection</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T3.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">GC sweep finds and processes expired sessions (<code style="font-size:11px;">expiresAt &lt; now()</code> AND status != TERMINATED)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T3.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">GC deletes sprites for expired sessions and revokes their inspection keys</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T3.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">GC marks terminated sessions as TERMINATED (or EXPIRED) in the database</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T3.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">GC handles sprite-already-gone gracefully (idempotent cleanup)</td></tr>
    </tbody>
  </table>

  <!-- T4 -->
  <h3 id="t4-multi-instance-behavior" style="margin:20px 0 12px 0; font-size:16px; color:#457b9d;">T4: Multi-Instance Behavior</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T4.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Concurrent Host Agent sessions for different tickets don't interfere</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T4.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">GC sweep doesn't delete sprites for active sessions in other instances</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T4.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">DB-based concurrency control (optimistic update WHERE clause) prevents double-delete</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T4.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Concurrent GC sweeps across multiple server instances are safe</td></tr>
    </tbody>
  </table>

  <!-- T5 -->
  <h3 id="t5-token-refresh" style="margin:20px 0 12px 0; font-size:16px; color:#457b9d;">T5: Token Refresh</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T5.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Env file rotation delivers new tokens to sprite (overwrite <code style="font-size:11px;">.helix-env</code>)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T5.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Runner re-reads env file after <code style="font-size:11px;">POST /token-refresh</code> notification</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T5.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Agent continues operating with refreshed tokens (no interruption)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T5.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Expired token causes graceful CLI error, not runner crash</td></tr>
    </tbody>
  </table>

  <!-- T6 -->
  <h3 id="t6-comment-delivery-and-session" style="margin:20px 0 12px 0; font-size:16px; color:#6c5ce7;">T6: Comment Delivery &amp; Session</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T6.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Comments delivered into live session via HTTP push (session.send)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T6.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Agent responds with full conversation history (no per-comment context rebuild)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T6.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Crash recovery resumes session via <code style="font-size:11px;">claudeSessionId</code></td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T6.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Agent comments attributed to system user (not <code style="font-size:11px;">reporterUserId</code>)</td></tr>
    </tbody>
  </table>

  <!-- T7 -->
  <h3 id="t7-runner-security" style="margin:20px 0 12px 0; font-size:16px; color:#e63946;">T7: Runner Security</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">ID</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Test Scenario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T7.1</td><td style="padding:6px 10px; border-bottom:1px solid #eee;"><code style="font-size:11px;">exec_command</code> uses <code style="font-size:11px;">execFile</code>, not shell strings (structurally prevents injection)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T7.2</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Git subcommand allowlist blocks <code style="font-size:11px;">push</code>, <code style="font-size:11px;">remote add</code>, <code style="font-size:11px;">config</code></td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T7.3</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Error messages sanitized before returning to LLM context (no paths, tokens, stack traces)</td></tr>
      <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">T7.4</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Comment content wrapped in <code style="font-size:11px;">&lt;user_comment&gt;</code> boundary markers</td></tr>
    </tbody>
  </table>

  <div style="background:#f0f7ff; border:1px solid #b8d4e3; border-radius:8px; padding:14px; margin-top:20px; font-size:13px;">
    <strong>Coverage summary:</strong> 7 test categories, <strong>28 specific test scenarios</strong> covering all 4 required areas: credential-scrub verification (T1), teardown/GC (T2, T3), multi-instance behavior (T4), and token refresh (T5). Additional categories T6 and T7 cover session delivery and runner-specific security.
  </div>
</div>

<!-- ============================================ -->
<!-- Section 10: Rollout Plan -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="rollout-plan" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">10. Rollout Plan</h2>

  <p>Phased enablement behind the <code style="background:#f4f5f9; padding:2px 6px; border-radius:4px; font-size:13px;">HOST_AGENT_ENABLED</code> feature gate.</p>

  <div style="display:flex; flex-direction:column; gap:0;">

    <!-- Phase 0 -->
    <div style="display:flex; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
      <div style="min-width:80px; text-align:center;">
        <div style="background:#a8a8a8; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">Phase 0</div>
      </div>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">Current State</div>
        <div style="font-size:14px;"><code style="font-size:12px;">HOST_AGENT_ENABLED=false</code> in all environments. Feature is gated. No production impact. Full remediation window.</div>
      </div>
    </div>

    <!-- Phase 1 -->
    <div style="display:flex; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
      <div style="min-width:80px; text-align:center;">
        <div style="background:#457b9d; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">Phase 1</div>
      </div>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">Workstream A Deployment</div>
        <div style="font-size:14px;">Deploy credential, lifecycle, and identity fixes. Feature <strong>remains gated</strong>. Validate with manual testing and unit tests. Validate: GIT_ASKPASS pattern, scoped keys, deny-empty-scope, TTL enforcement, retry teardown, credential scrub, agent identity, status enum.</div>
      </div>
    </div>

    <!-- Phase 2 -->
    <div style="display:flex; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
      <div style="min-width:80px; text-align:center;">
        <div style="background:#6c5ce7; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">Phase 2</div>
      </div>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">Workstream B Deployment</div>
        <div style="font-size:14px;">Deploy loop placement changes. Feature <strong>remains gated</strong>. Validate in-sprite runner with integration tests. Validate: runner startup, tool execution via execFile, comment delivery, session persistence, error sanitization, boundary markers.</div>
      </div>
    </div>

    <!-- Phase 3 -->
    <div style="display:flex; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
      <div style="min-width:80px; text-align:center;">
        <div style="background:#2a9d8f; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">Phase 3</div>
      </div>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">Internal Testing (Staging)</div>
        <div style="font-size:14px;">Enable <code style="font-size:12px;">HOST_AGENT_ENABLED=true</code> in staging. Run full test suite including multi-instance scenarios, GC sweep, token refresh, and crash recovery. Validate all 28 test scenarios from the test plan.</div>
      </div>
    </div>

    <!-- Phase 4 -->
    <div style="display:flex; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
      <div style="min-width:80px; text-align:center;">
        <div style="background:#e17055; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">Phase 4</div>
      </div>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">Limited Rollout (Production)</div>
        <div style="font-size:14px;">Enable for internal team orgs in production. Monitor for 1-2 weeks: sprite lifecycle metrics, GC success rate, teardown retry rate, credential scrub verification, session duration distribution.</div>
      </div>
    </div>

    <!-- Phase 5 -->
    <div style="display:flex; gap:16px; padding:16px 0;">
      <div style="min-width:80px; text-align:center;">
        <div style="background:#2a9d8f; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:700;">Phase 5</div>
      </div>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">General Availability</div>
        <div style="font-size:14px;">Enable for all orgs in production after internal validation period. Continue monitoring and alerting.</div>
      </div>
    </div>
  </div>

  <h3 id="monitoring-checkpoints" style="margin:24px 0 12px 0; font-size:16px; color:#457b9d;">Monitoring Checkpoints</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Metric</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Expected</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Rollback Trigger</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Active sprite count</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Bounded by active tickets</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Unbounded growth (zombie sprites)</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">GC success rate</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&gt;95% of expired sessions cleaned</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&lt;80% GC success for &gt;1 hour</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Teardown retry rate</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&lt;10% of teardowns need retry</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&gt;30% retry rate sustained</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Session duration p95</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&lt;TTL (1.5h)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Sessions exceeding TTL</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Credential exposure</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">0 incidents</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Any credential in .git/config or env detected</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Runner crash rate</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&lt;5% of sessions</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">&gt;20% crash rate sustained</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ============================================ -->
<!-- Section 11: Open Questions & Risks -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="open-questions-and-risks" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">11. Open Questions &amp; Risks</h2>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#1a1a2e; color:#fff;">
        <th style="text-align:left; padding:8px 10px;">ID</th>
        <th style="text-align:left; padding:8px 10px;">Question / Risk</th>
        <th style="text-align:left; padding:8px 10px;">Impact</th>
        <th style="text-align:left; padding:8px 10px;">Mitigation / Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-1</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Does <code style="font-size:11px;">sprite.execFile()</code> support passing environment variables?</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">GIT_ASKPASS needs env injection per-command</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#2a9d8f; color:#fff; padding:2px 6px; border-radius:12px; font-size:11px;">WORKAROUND</span> Write env to file, source in script (proven at <code style="font-size:11px;">host-agent-service.ts:535-538</code>)</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-2</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Agent SDK v2 (<code style="font-size:11px;">unstable_v2_createSession</code>) stability</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">API may change before implementation</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#457b9d; color:#fff; padding:2px 6px; border-radius:12px; font-size:11px;">MITIGATED</span> v1 <code style="font-size:11px;">query(resume)</code> fallback designed; session abstraction isolates SDK calls</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-3</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Token refresh for long-lived sprites</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">No refresh mechanism exists today</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#2a9d8f; color:#fff; padding:2px 6px; border-radius:12px; font-size:11px;">DESIGNED</span> Env file rotation + <code style="font-size:11px;">POST /token-refresh</code> endpoint (Section 8c)</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-4</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Prisma migration strategy</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Schema changes need migration files</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#2a9d8f; color:#fff; padding:2px 6px; border-radius:12px; font-size:11px;">RESOLVED</span> <code style="font-size:11px;">prisma/migrations/</code> dir exists with 60+ migrations; use <code style="font-size:11px;">prisma migrate dev</code></td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-5</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Sprites SDK long-running process support</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">In-sprite runner requires persistent Node.js process</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#ffc107; color:#333; padding:2px 6px; border-radius:12px; font-size:11px;">NEEDS VALIDATION</span> Must be validated during early Workstream B implementation</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-6</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Org PAT scope (repo, admin:org, etc.)</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Determines severity ceiling if PAT exposed</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#ffc107; color:#333; padding:2px 6px; border-radius:12px; font-size:11px;">OPEN</span> Affects residual risk assessment; does not block implementation</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-7</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Sprite networking for HTTP comment delivery</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Direct HTTP to runner requires addressable sprite</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#457b9d; color:#fff; padding:2px 6px; border-radius:12px; font-size:11px;">MITIGATED</span> Decided (HTTP push); <code style="font-size:11px;">sprite.exec</code> fallback if networking unavailable</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">OQ-8</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Multi-instance GC safety</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Concurrent GC sweeps could double-delete</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;"><span style="background:#2a9d8f; color:#fff; padding:2px 6px; border-radius:12px; font-size:11px;">DESIGNED</span> DB-based optimistic update (<code style="font-size:11px;">status</code> WHERE clause)</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ============================================ -->
<!-- Section 12: Evidence Summary & Methodology -->
<!-- ============================================ -->
<div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:28px; margin-bottom:24px;">
  <h2 id="evidence-summary-and-methodology" style="margin:0 0 20px 0; font-size:22px; color:#1a1a2e; border-bottom:2px solid #457b9d; padding-bottom:8px;">12. Evidence Summary &amp; Methodology</h2>

  <h3 id="methodology" style="margin:0 0 16px 0; font-size:18px; color:#457b9d;">Methodology</h3>

  <p style="font-size:14px;">This development plan was produced through a structured analysis pipeline:</p>

  <ol style="font-size:14px;">
    <li style="margin-bottom:8px;"><strong>Code Inspection (Scout)</strong> &mdash; Automated analysis of the Host Agent code (<code style="font-size:12px;">host-agent-service.ts</code>, ~850 lines), orchestrator reference patterns (6 modules), middleware, schema, and cross-repo rendering sites. 22 files mapped with security roles, 14 facts confirmed, 8 unknowns catalogued.</li>
    <li style="margin-bottom:8px;"><strong>Root Cause Analysis (Diagnosis)</strong> &mdash; Identified the single architectural decision (loop in trust anchor) cascading into all 11 flaws. Classified flaws into 3 categories: credential handling, trust boundary, lifecycle/identity. Assessed portability of 5 orchestrator patterns (4/5 portable).</li>
    <li style="margin-bottom:8px;"><strong>Product Scoping (Product)</strong> &mdash; Defined 7 success criteria, 11 user scenarios, feature boundaries, constraints, and 8 open questions. Established that the deliverable is a plan document, not implementation code.</li>
    <li style="margin-bottom:8px;"><strong>Architecture Decisions (Tech Research)</strong> &mdash; Made 9 architecture decisions with chosen options, rejected alternatives, rationale, and risk assessment. Verified Agent SDK v2 feasibility via Context7 documentation. Produced flaw-to-remediation traceability table.</li>
    <li style="margin-bottom:8px;"><strong>Runtime Inspection (Production)</strong> &mdash; Confirmed via RSH-607 that <code style="font-size:12px;">HostAgentSession</code> table is absent from production database (feature not deployed). Validated that Prisma migrations infrastructure exists.</li>
  </ol>

  <h3 id="data-sources" style="margin:24px 0 16px 0; font-size:18px; color:#457b9d;">Data Sources</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Source</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">What Was Extracted</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">RSH-607 (Security Audit)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">11 flaw definitions, severity levels, code locations, threat matrix, portability assessment (8 NEW, 2 CHANGED, 1 INHERITED)</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">BLD-577 (Host Agent Build)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">Original implementation decisions, feature gate configuration, MCP tool definitions</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Diagnosis Statement</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">Root cause analysis, flaw classification (3 categories), portability evidence (4/5 patterns), session model feasibility</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Tech Research</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">9 architecture decisions, 6 technical decisions, core API/method tables, flaw-to-remediation traceability, performance expectations</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Product Spec</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">7 success criteria, 11 user scenarios (SCN-01 through SCN-11), 5 key design principles, 8 open questions</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Scout (helix-global-server)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">22 files mapped with roles, flaw locations with line numbers, orchestrator reference patterns, schema analysis, quality gates</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Scout (helix-global-client)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">7 rendering sites with isAgentAuthored pattern, type definitions, impact assessment (no changes needed)</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Scout (helix-cli)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">CLI callback surface, auth model, impact assessment (no changes needed)</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Source Code (Direct)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">host-agent-service.ts, repositories.ts, orchestrator.ts, middleware.ts, sprites/client.ts, schema.prisma, command-runtime.ts, execute.ts, runtime-assets.ts, comment-controller.ts, config/env.ts, inspection-api-key-service.ts</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Context7 (SDK Docs)</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">Claude Agent SDK v2 session API: unstable_v2_createSession, session.send/receive, unstable_v2_resumeSession</td>
      </tr>
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">Runtime Inspection</td>
        <td style="padding:6px 10px; border-bottom:1px solid #eee;">HostAgentSession absence from production (confirmed via RSH-607), migration infrastructure validation</td>
      </tr>
    </tbody>
  </table>

  <h3 id="referenced-tickets" style="margin:24px 0 12px 0; font-size:18px; color:#457b9d;">Referenced Tickets</h3>

  <div style="display:flex; flex-wrap:wrap; gap:16px;">
    <div style="flex:1; min-width:280px; background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:16px;">
      <div style="font-weight:700; color:#457b9d; margin-bottom:6px;">RSH-607: Live Agents Security Measures</div>
      <div style="font-size:13px;">Pre-deployment security audit. 11 flaws identified across the Host Agent. This plan addresses all 11 flaws (10 directly, 1 deferred). The RSH-607 threat matrix is the baseline for the flaw-to-remediation traceability table.</div>
    </div>
    <div style="flex:1; min-width:280px; background:#f4f5f9; border:1px solid #ddd; border-radius:8px; padding:16px;">
      <div style="font-weight:700; color:#457b9d; margin-bottom:6px;">BLD-577: Final Live Host Agent</div>
      <div style="font-size:13px;">Original Host Agent implementation. Built the feature that this plan remediates. The single architectural decision (loop in trust anchor) that cascades into all 11 flaws was made in this ticket.</div>
    </div>
  </div>

  <h3 id="cross-repo-analysis" style="margin:24px 0 12px 0; font-size:18px; color:#457b9d;">Cross-Repo Analysis Results</h3>

  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <thead>
      <tr style="background:#f4f5f9;">
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Repository</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Role</th>
        <th style="text-align:left; padding:8px 10px; border-bottom:2px solid #ddd;">Evidence-Backed Assessment</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">helix-global-server</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Primary target</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Contains both target (Host Agent) and reference (orchestrator). All 11 flaw locations. 9 modified files + 7 new files + 1 migration.</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">helix-cli</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Context only</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Zero host-agent references in codebase. Auth via env vars (agnostic to runner location). Token scoping/refresh is server-side. No code changes.</td>
      </tr>
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:600;">helix-global-client</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">Context only</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">All 7 rendering sites use isAgentAuthored for agent comments. FLAW-07 fix is backend-only. No code changes needed.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Footer -->
<div style="text-align:center; padding:20px; color:#666; font-size:12px; border-top:1px solid #eee; margin-top:32px;">
  <p style="margin:0;">RSH-640 Development Plan &mdash; Generated June 2026</p>
  <p style="margin:4px 0 0 0;">Baseline: RSH-607 Security Audit | Reference: BLD-577 Host Agent Build | Scope: helix-global-server (primary), helix-cli, helix-global-client (context)</p>
</div>

</div>
</body>
</html>

## Attachments
- (none)
