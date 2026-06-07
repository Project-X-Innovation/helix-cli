# Ticket Context

- ticket_id: cmq0bp77n00slk70ubccb2uxb
- short_id: BLD-673
- run_id: cmq0bp78000sqk70uydv5sruh
- run_branch: helix/build/BLD-673-egress-lockdown-sprites-host-agent-enforcement
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Egress Lockdown ④ — Sprites Host Agent enforcement

## Description
# Egress Lockdown ④ — Sprites Host Agent enforcement

Implements the sprites half of the egress lockdown (design RSH-648 / verified record RSH-667). The `@fly/sprites` SDK has **no** network method, so policy is set via direct REST. All gated by `sandboxEgressEnforce`. Server-only; client + CLI attached for end-to-end testing per convention.

## Changes (helix-global-server)
1. Add `setSpriteNetworkPolicy(spriteName, allow)` helper (next to `host-agent-service.ts`'s existing `SPRITES_API_BASE` fetch pattern):
   `POST ${SPRITES_API_BASE}/v1/sprites/${name}/policy/network` (singular `policy` — VERIFIED; `policies/network` 404s), `Authorization: Bearer ${config.spritesToken}`, body `{ rules: renderSpriteNetworkRules(allow) }`. POST → 204, applies immediately.
2. In `provisionSprite` (`host-agent-service.ts`): when flag on, set the **setup** policy after `createSprite` (so fnm/clone/npm installs run under the setup allowlist), then POST the **runtime** policy **immediately before `createRunnerService`** (which starts the agent loop). The runner then runs locked.

## Verified facts to rely on
Sprites blocks by DNS (`Could not resolve host`) AND blocks raw-IP (connect fail) — no bypass; loopback exempt; default (no rules) = allow-all, so a default-deny requires the trailing `*:deny` rule.

## Acceptance
- Flag-on Host Agent session provisions and runs; the runner reaches anthropic / Context7 / SERVER_URL host / NetSuite; github/npm/arbitrary hosts blocked.
- Flag-off unchanged.

*Depends on ③ (shared policy module + patterns settled); may run parallel to ③ in practice.*

## Referenced Tickets

1 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### RSH-667: Sandbox Egress Lockdown — Live Verification & Verified Allowlists
- Mode: RESEARCH | Status: QUEUED
- Completed runs: 1 (run-1)
- Materialized files: 14 artifacts
- Path: `.helix-refs/RSH-667/`
- Manifest: `.helix-refs/RSH-667/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSH-648: Layered Egress Allowlist for Helix Sandboxes (Org-Level)</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif; background:#f5f5f5; color:#1a1a2e; line-height:1.6;">

  <!-- Header -->
  <header style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); color:#fff; padding:48px 24px 40px; text-align:center;">
    <div style="max-width:900px; margin:0 auto;">
      <div style="display:inline-block; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:6px; padding:4px 14px; font-size:13px; letter-spacing:1px; margin-bottom:16px;">RESEARCH REPORT</div>
      <h1 style="margin:12px 0 8px; font-size:32px; font-weight:700; line-height:1.2;">Layered Egress Allowlist for Helix Sandboxes</h1>
      <p style="margin:0 0 8px; font-size:16px; opacity:0.85;">Org-Level Self-Service with Default-Deny</p>
      <div style="margin-top:16px; display:flex; justify-content:center; gap:16px; flex-wrap:wrap; font-size:13px; opacity:0.75;">
        <span>RSH-648</span>
        <span>|</span>
        <span>June 2026</span>
        <span>|</span>
        <span>Builds on RSH-637, RSH-647</span>
      </div>
    </div>
  </header>

  <!-- Navigation -->
  <nav style="position:sticky; top:0; z-index:100; background:#1a1a2e; border-bottom:2px solid #0f3460; padding:0; overflow-x:auto; white-space:nowrap;">
    <div style="max-width:900px; margin:0 auto; display:flex; gap:0; font-size:13px;">
      <a href="#executive-summary" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent; transition:all 0.2s;">Summary</a>
      <a href="#threat-model-and-motivation" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Threat Model</a>
      <a href="#current-state-analysis" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Current State</a>
      <a href="#the-layered-allowlist-model" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Layers</a>
      <a href="#zone-model-and-scoping" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Zones</a>
      <a href="#provisioning-vs-runtime-phase-separation" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Phases</a>
      <a href="#org-additions-data-model" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Data Model</a>
      <a href="#domain-validation-rules" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Validation</a>
      <a href="#permissions-and-access-control" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Permissions</a>
      <a href="#audit-trail" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Audit</a>
      <a href="#settings-ux-design" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">UX</a>
      <a href="#backend-rendering" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Rendering</a>
      <a href="#effective-policy-computation" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Policy</a>
      <a href="#ticket-level-escalation-designed-for-future" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Escalation</a>
      <a href="#dev-ticket-breakdown" style="color:rgba(255,255,255,0.8); text-decoration:none; padding:10px 14px; border-bottom:2px solid transparent;">Dev Plan</a>
    </div>
  </nav>

  <!-- Main Content -->
  <main style="max-width:900px; margin:0 auto; padding:32px 24px 64px; background:#fff; min-height:100vh;">

    <!-- Executive Summary -->
    <section id="executive-summary" style="margin-bottom:48px;">
      <h2 id="executive-summary" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Executive Summary</h2>

      <div style="background:linear-gradient(135deg,#fff5f5 0%,#fff0f0 100%); border-left:4px solid #e53e3e; border-radius:0 8px 8px 0; padding:16px 20px; margin-bottom:20px;">
        <p style="margin:0; font-weight:600; color:#c53030;">The Problem</p>
        <p style="margin:8px 0 0;">Every Helix sandbox currently runs with <strong>unrestricted egress</strong>. A prompt-injected agent can supply its own credentials and push cloned private source code to any reachable host. Helix holding no outbound token does not prevent this &mdash; only network unreachability does. Today there are <strong>zero</strong> egress controls: no network policy at sandbox creation, no runtime policy changes, no egress database tables, and no related logs.</p>
      </div>

      <div style="background:linear-gradient(135deg,#f0fff4 0%,#e6ffed 100%); border-left:4px solid #38a169; border-radius:0 8px 8px 0; padding:16px 20px; margin-bottom:20px;">
        <p style="margin:0; font-weight:600; color:#276749;">The Solution</p>
        <p style="margin:8px 0 0;">A <strong>four-layer union allowlist</strong> with <strong>default-deny</strong> semantics. Every sandbox starts locked down; every network opening is a consciously-owned, audited decision. Org administrators gain self-service control over additional domains, within strict guardrails that prevent overly-broad entries.</p>
      </div>

      <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:20px;">
        <div style="flex:1; min-width:140px; background:#edf2f7; border-radius:8px; padding:16px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#0f3460;">19</div>
          <div style="font-size:13px; color:#4a5568;">Organizations</div>
        </div>
        <div style="flex:1; min-width:140px; background:#edf2f7; border-radius:8px; padding:16px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#0f3460;">12</div>
          <div style="font-size:13px; color:#4a5568;">Admin Users</div>
        </div>
        <div style="flex:1; min-width:140px; background:#edf2f7; border-radius:8px; padding:16px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#e53e3e;">0</div>
          <div style="font-size:13px; color:#4a5568;">Egress Controls</div>
        </div>
        <div style="flex:1; min-width:140px; background:#edf2f7; border-radius:8px; padding:16px; text-align:center;">
          <div style="font-size:28px; font-weight:700; color:#0f3460;">4</div>
          <div style="font-size:13px; color:#4a5568;">Allowlist Layers</div>
        </div>
      </div>

      <p style="margin:0 0 12px;">This design is built <strong>once on the unified sandbox abstraction</strong> (RSH-647) so both sandbox backends &mdash; Vercel workflow agents and sprites Host Agent &mdash; inherit it without per-backend code. It extends the zone model and domain allowlist established by RSH-637 with a new org-level self-service layer, phase-separated provisioning, and strict validation guardrails.</p>

      <div style="background:#edf2f7; border-radius:8px; padding:16px; margin-top:16px;">
        <p style="margin:0 0 8px; font-weight:600; font-size:14px;">Key Design Decisions</p>
        <ul style="margin:0; padding-left:20px; font-size:14px;">
          <li><strong>Default-deny:</strong> Anything not in the union allowlist is blocked</li>
          <li><strong>Four layers:</strong> Built-in + Helix-global (code) + Org additions (DB) + Ticket escalation (future)</li>
          <li><strong>Phase separation:</strong> github.com allowed at provisioning only; blocked at runtime</li>
          <li><strong>Zone invariant:</strong> Org additions apply to warm/cold zones only; hot zone stays locked</li>
          <li><strong>Informed opt-in:</strong> Every domain addition explicitly warns about code exfiltration risk</li>
        </ul>
      </div>
    </section>

    <!-- Threat Model & Motivation -->
    <section id="threat-model-and-motivation" style="margin-bottom:48px;">
      <h2 id="threat-model-and-motivation" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Threat Model &amp; Motivation</h2>

      <h3 id="why-default-deny-matters" style="font-size:18px; font-weight:600; color:#16213e; margin-bottom:12px;">Why Default-Deny Matters</h3>

      <p>Helix sandboxes clone <strong>private source code</strong> into an environment where AI agents execute. This makes the sandbox a high-value target. The threat model centers on <strong>code exfiltration via prompt injection</strong>:</p>

      <div style="background:#fffbeb; border:1px solid #f6e05e; border-radius:8px; padding:16px 20px; margin:16px 0;">
        <p style="margin:0 0 8px; font-weight:600; color:#975a16;">Prompt Injection Exfiltration Scenario</p>
        <ol style="margin:0; padding-left:20px; font-size:14px;">
          <li>Attacker plants a prompt injection payload in a file the agent reads (e.g., a README, a dependency config, or a code comment)</li>
          <li>The injected prompt instructs the agent to push the cloned repo to an attacker-controlled GitHub account using an <strong>attacker-supplied PAT</strong></li>
          <li>Helix holds no outbound GitHub token &mdash; but the agent can <em>supply its own credential</em> from the injection</li>
          <li>If <code>github.com</code> is reachable, the push succeeds. The private source is exfiltrated.</li>
        </ol>
      </div>

      <p><strong>Helix holding no token does not prevent this.</strong> Any reachable host that can <em>ingest</em> data is a potential exfiltration channel. The only thing that stops exfiltration is the host <strong>not being reachable</strong>. Therefore:</p>

      <div style="background:#ebf8ff; border-left:4px solid #3182ce; border-radius:0 8px 8px 0; padding:16px 20px; margin:16px 0;">
        <p style="margin:0; font-size:15px;"><strong>Principle:</strong> Egress must be <strong>minimal-by-default</strong>, and every opening is a consciously-owned, audited code-exfiltration channel.</p>
      </div>

      <h3 id="egress-controls-hosts-tokens-control-repos" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Egress Controls Hosts; Tokens Control Repos</h3>

      <p>A critical architectural principle is the <strong>separation of network-level and credential-level controls</strong>:</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Control Layer</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Mechanism</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Visibility</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Controls</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">Network (Egress)</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">SNI / DNS filtering</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Hostname only (inside TLS)</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Which <em>hosts</em> are reachable</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">Credential (Token)</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Scoped GitHub App tokens</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">owner/repo path</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Which <em>repos</em> are accessible</td>
          </tr>
        </tbody>
      </table>

      <p>Per-repo network enforcement is <strong>not achievable at the firewall</strong>. SNI/DNS see only the hostname (<code>github.com</code>), never the <code>owner/repo</code> path (inside TLS). &ldquo;Allow only certain repos&rdquo; is a <strong>credential-scoping concern</strong> (scoped GitHub App installation token limited to ticket repos, read-only). True per-repo network enforcement would require a programmable MITM proxy &mdash; neither sandbox provider offers it natively.</p>

      <h3 id="the-ten-egress-channels" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Exfiltration Channels</h3>

      <p>RSH-637 identified 10 categories of egress channels. Each domain added to the allowlist potentially opens one or more of these channels:</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">#</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Channel</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Example</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Risk Level</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fff5f5;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">1</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Git push to attacker repo</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>github.com</code> with attacker PAT</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#e53e3e; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">CRITICAL</span></td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">2</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">HTTP POST to attacker endpoint</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>evil.com/exfil</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#e53e3e; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">CRITICAL</span></td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">3</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">DNS exfiltration (data in queries)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Encoded data in DNS lookups</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#dd6b20; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">HIGH</span></td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">4</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Package registry upload</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>npm publish</code> with attacker token</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#dd6b20; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">HIGH</span></td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">5</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Cloud storage upload</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">S3, GCS with attacker creds</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#dd6b20; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">HIGH</span></td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">6</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Email relay</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">SMTP to external mail server</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">7</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Webhook/API callback</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Slack, Discord webhook POST</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">8</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">SSH/tunnel</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">SSH to attacker server</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">9</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Browser-based exfil</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Navigate to attacker page</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">10</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Covert channel (timing/size)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Encoding data in request patterns</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#a0aec0; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">LOW</span></td></tr>
        </tbody>
      </table>

      <p>Default-deny egress neutralizes channels 1, 2, 4&ndash;9 entirely. Channel 3 (DNS exfiltration) is mitigated at the DNS level by sprites and partially by Vercel&rsquo;s SNI enforcement. Channel 10 (covert channels) is low-bandwidth and impractical for source code exfiltration.</p>
    </section>

    <!-- Current State Analysis -->
    <section id="current-state-analysis" style="margin-bottom:48px;">
      <h2 id="current-state-analysis" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Current State Analysis</h2>

      <div style="background:#fff5f5; border:1px solid #feb2b2; border-radius:8px; padding:16px 20px; margin-bottom:20px;">
        <p style="margin:0; font-weight:600; color:#c53030;">Production Status: No Egress Controls</p>
        <p style="margin:8px 0 0; font-size:14px;">Confirmed via runtime inspection on June 3, 2026 against the production database.</p>
      </div>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Metric</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Value</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Organizations in production</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">19</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Runtime inspection (Organization table)</td></tr>
          <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;">Total users</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">40</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Runtime inspection (User table)</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Admin users (isAdmin=true)</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">12</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Runtime inspection (User table)</td></tr>
          <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;">Non-admin users</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">28</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Derived (40 - 12)</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Database tables (public schema)</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">23</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Runtime inspection (information_schema)</td></tr>
          <tr style="background:#fff5f5;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Egress/network/allowlist tables</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700; color:#e53e3e;">0</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Runtime inspection (ILIKE search)</td></tr>
          <tr style="background:#fff5f5;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Calls to updateNetworkPolicy</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700; color:#e53e3e;">0</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Static code analysis (grep)</td></tr>
          <tr style="background:#fff5f5;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Network policy params in sandbox creation</td><td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700; color:#e53e3e;">0</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">sandbox-runtime.ts:39-60</td></tr>
        </tbody>
      </table>

      <h3 id="research-foundations" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Research Foundations</h3>

      <p>This design builds on two completed research tickets:</p>

      <div style="display:flex; gap:16px; flex-wrap:wrap; margin:16px 0;">
        <div style="flex:1; min-width:280px; background:#f0fff4; border:1px solid #c6f6d5; border-radius:8px; padding:16px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="background:#38a169; color:#fff; padding:2px 10px; border-radius:4px; font-size:12px; font-weight:600;">RSH-637</span>
            <span style="font-weight:600; font-size:14px;">Egress Access</span>
          </div>
          <ul style="margin:0; padding-left:18px; font-size:13px; color:#2d3748;">
            <li>Zone model: hot / warm / cold</li>
            <li>11-domain starting allowlist</li>
            <li>Per-step <code>configureNetworkPolicyForStep()</code></li>
            <li>Deploy-gated code constants for platform allowlist</li>
            <li>10 egress channel taxonomy</li>
          </ul>
        </div>
        <div style="flex:1; min-width:280px; background:#ebf8ff; border:1px solid #bee3f8; border-radius:8px; padding:16px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="background:#3182ce; color:#fff; padding:2px 10px; border-radius:4px; font-size:12px; font-weight:600;">RSH-647</span>
            <span style="font-weight:600; font-size:14px;">Unified Sandbox Abstraction</span>
          </div>
          <ul style="margin:0; padding-left:18px; font-size:13px; color:#2d3748;">
            <li><code>HelixSandbox</code> interface with adapter pattern</li>
            <li><code>setNetworkPolicy(NetworkPolicyInput)</code> slot</li>
            <li><code>NetworkPolicyInput = { allowedDomains, tier? }</code></li>
            <li>Single variable: <code>persistent: true | false</code></li>
            <li>Cross-cutting payoff: network policy shareable</li>
          </ul>
        </div>
      </div>

      <h3 id="code-insertion-points" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Code Insertion Points</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">File</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Location</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>sandbox-runtime.ts:39-60</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">createVercelSandboxParams()</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Provision-phase policy insertion</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>orchestrator.ts:1841-1844</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">beforeStepComposed()</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Runtime policy per-step hook</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>credentials.ts:1-15</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Zone classification map</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Zone to environment mapping</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>middleware.ts:83-90</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAdmin middleware</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Admin-only endpoint gating</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>prisma/schema.prisma:175-233</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Organization model</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">FK target for new egress tables</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>inspection-audit-service.ts</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">logInspectionQuery()</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Fire-and-forget audit pattern</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>env.ts:148</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">config.webOrigin</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix server hostname for spoof detection</td></tr>
        </tbody>
      </table>
    </section>

    <!-- The Layered Allowlist Model -->
    <section id="the-layered-allowlist-model" style="margin-bottom:48px;">
      <h2 id="the-layered-allowlist-model" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">The Layered Allowlist Model</h2>

      <p>The effective egress policy for any sandbox step is the <strong>union of all applicable layers</strong>. Default-deny means anything not in the union is blocked. Layers are additive &mdash; they can only <em>open</em> access, never restrict what a lower layer grants.</p>

      <div style="background:#edf2f7; border-radius:8px; padding:16px 20px; margin:16px 0; font-family:monospace; font-size:14px;">
        <p style="margin:0 0 4px; font-weight:600; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:13px; color:#4a5568;">Effective Policy Formula</p>
        <code>effectivePolicy(zone, orgId, ticketId?) =<br>
        &nbsp;&nbsp;builtInDefault[zone]<br>
        &nbsp;&nbsp;&cup; helixGlobal[zone]<br>
        &nbsp;&nbsp;&cup; (zone &isin; {warm, cold} ? orgAdditions(orgId) : &empty;)<br>
        &nbsp;&nbsp;&cup; (zone &isin; {warm, cold} &amp;&amp; ticketId ? ticketEscalation(ticketId) : &empty;) &nbsp;// future</code>
      </div>

      <h3 id="four-layers-defined" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Four Layers Defined</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Layer</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Storage</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Mutability</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Zone Scope</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Owner</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f0fff4;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">1. Built-in Default</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Deploy-gated code constant</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">Code deploy</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Hot + Warm/Cold</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Platform engineering</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">2. Helix-Global</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Deploy-gated code constant</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">Code deploy</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Hot + Warm/Cold</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Platform engineering</td>
          </tr>
          <tr style="background:#ebf8ff;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">3. Org Additions</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Database (OrganizationEgressRule)</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#bee3f8; color:#2b6cb0; padding:2px 8px; border-radius:4px; font-size:11px;">Self-service API</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Warm/Cold ONLY</strong></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Org administrators</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600; color:#718096;">4. Ticket Escalation <span style="font-size:11px; font-weight:400;">(deferred)</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; color:#718096;">Future: ephemeral DB entries</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#e2e8f0; color:#718096; padding:2px 8px; border-radius:4px; font-size:11px;">Human-approved</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; color:#718096;">Warm/Cold ONLY</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; color:#718096;">Agent + human approval</td>
          </tr>
        </tbody>
      </table>

      <h3 id="layer-rationale" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Why Four Layers (Not Two or One)</h3>

      <p>The separation of layers matches real ownership boundaries:</p>
      <ul style="font-size:14px;">
        <li><strong>Built-in defaults</strong> are immutable platform minimums &mdash; the absolute minimum for any sandbox to function (Anthropic inference + Helix server)</li>
        <li><strong>Helix-global additions</strong> are platform team decisions that apply cross-org (npm, Context7) &mdash; separate from built-in so they can be reasoned about and audited independently</li>
        <li><strong>Org additions</strong> are customer self-service &mdash; the new system this design introduces</li>
        <li><strong>Ticket-level escalation</strong> is agent-initiated with human approval &mdash; designed for future without requiring model rework</li>
      </ul>

      <p>A flat single-layer allowlist would conflate all of these ownership boundaries. A two-layer model (platform + org) would conflate built-in defaults with helix-global additions, and provide no clear extensibility path for ticket-level escalation.</p>

      <h3 id="default-deny-semantics" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Default-Deny Semantics</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:16px 20px; margin:16px 0; font-size:14px;">
        <p style="margin:0 0 8px; color:#68d391; font-weight:600;">Rule: If a domain is not in the effective policy union, it is BLOCKED.</p>
        <p style="margin:0; font-size:13px; color:#a0aec0;">There is no &ldquo;deny list&rdquo; &mdash; the entire internet is denied by default. The allowlist is the exhaustive list of reachable hosts. This inverts the typical web-browser security model and is essential for code-exfiltration prevention.</p>
      </div>
    </section>

    <!-- Zone Model & Scoping -->
    <section id="zone-model-and-scoping" style="margin-bottom:48px;">
      <h2 id="zone-model-and-scoping" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Zone Model &amp; Scoping</h2>

      <p>The zone model, established by RSH-637, classifies each workflow step into one of three security zones based on the sensitivity of the data accessed. The existing <code>credentials.ts</code> mapping (lines 1&ndash;15) already classifies steps for credential routing &mdash; the same classification drives network policy.</p>

      <h3 id="zone-classification" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Zone Classification of Steps</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Zone</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Steps</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Credential Mapping</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Security Posture</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fff5f5;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;"><span style="background:#e53e3e; color:#fff; padding:2px 10px; border-radius:4px; font-size:12px;">HOT</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><code>scout</code>, <code>diagnosis</code></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">PRODUCTION</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Maximum restriction &mdash; prod data access</td>
          </tr>
          <tr style="background:#fffbeb;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;"><span style="background:#dd6b20; color:#fff; padding:2px 10px; border-radius:4px; font-size:12px;">WARM</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><code>product</code>, <code>tech-research</code>, <code>implementation-plan</code>, <code>implementation</code>, <code>code-review</code>, <code>verification</code>, <code>preview-config</code></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">SANDBOX</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Moderate &mdash; code execution, package install</td>
          </tr>
          <tr style="background:#f0fff4;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;"><span style="background:#38a169; color:#fff; padding:2px 10px; border-radius:4px; font-size:12px;">COLD</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><em>Human-reviewed full access</em></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">N/A</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Relaxed &mdash; human oversight</td>
          </tr>
        </tbody>
      </table>

      <h3 id="per-zone-effective-policy" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Per-Zone Effective Policy</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Zone</th>
            <th style="padding:10px 12px; text-align:center; border:1px solid #2d3748;">Built-in Default</th>
            <th style="padding:10px 12px; text-align:center; border:1px solid #2d3748;">Helix-Global</th>
            <th style="padding:10px 12px; text-align:center; border:1px solid #2d3748;">Org Additions</th>
            <th style="padding:10px 12px; text-align:center; border:1px solid #2d3748;">Ticket Escalation (future)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fff5f5;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">Hot</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center; background:#fff5f5;"><span style="color:#e53e3e; font-weight:700;">NO</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center; background:#fff5f5;"><span style="color:#e53e3e; font-weight:700;">NO</span></td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">Warm</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center; color:#718096;">Yes (future)</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">Cold</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#38a169; font-weight:700;">Yes</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; text-align:center; color:#718096;">Yes (future)</td>
          </tr>
        </tbody>
      </table>

      <div style="background:#fff5f5; border-left:4px solid #e53e3e; border-radius:0 8px 8px 0; padding:16px 20px; margin:16px 0;">
        <p style="margin:0; font-weight:700; color:#c53030;">Security Invariant: Hot Zone Exclusion</p>
        <p style="margin:8px 0 0; font-size:14px;">Org additions are <strong>NEVER</strong> included in hot zone policy. This is a security invariant encoded in <code>computeEffectivePolicy()</code>, not a configurable option. Hot zone steps (scout, diagnosis) access production data and must stay locked to the absolute minimum: Anthropic API for inference and Helix server for coordination.</p>
      </div>
    </section>

    <!-- Provisioning vs Runtime Phase Separation -->
    <section id="provisioning-vs-runtime-phase-separation" style="margin-bottom:48px;">
      <h2 id="provisioning-vs-runtime-phase-separation" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Provisioning vs. Runtime Phase Separation</h2>

      <p>The sandbox lifecycle has two distinct network-policy phases. This separation is the key defense against github.com-based code exfiltration at runtime.</p>

      <h3 id="two-phase-policy-model" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Two-Phase Policy Model</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Attribute</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Provision Phase</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Runtime Phase</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">When applied</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Sandbox creation (before clone)</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Each step transition (via <code>beforeStepComposed</code>)</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">Insertion point</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><code>createVercelSandboxParams()</code></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><code>configureNetworkPolicyForStep()</code></td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">github.com</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">ALLOWED</span> (for clone)</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#fed7d7; color:#9b2c2c; padding:2px 8px; border-radius:4px; font-size:11px;">BLOCKED</span></td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">Org additions</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#fed7d7; color:#9b2c2c; padding:2px 8px; border-radius:4px; font-size:11px;">NOT APPLIED</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">APPLIED</span> (warm/cold only)</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:600;">Policy source</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Static, deploy-gated constant</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Dynamic (computed from layers + zone)</td>
          </tr>
        </tbody>
      </table>

      <h3 id="provision-phase-allowlist" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Provision-Phase Allowlist</h3>

      <p>The provision-phase allowlist is static and deploy-gated. It enables repository cloning and nothing else:</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Domain</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>github.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Git clone (HTTPS)</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.github.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">GitHub API (clone auth)</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.githubusercontent.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">GitHub content delivery</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.anthropic.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Claude inference API</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><em>Helix server domain</em></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix coordination</td></tr>
        </tbody>
      </table>

      <div style="background:#fffbeb; border-left:4px solid #dd6b20; border-radius:0 8px 8px 0; padding:16px 20px; margin:16px 0;">
        <p style="margin:0; font-weight:600; color:#975a16;">RSH-637 Override Notice</p>
        <p style="margin:8px 0 0; font-size:14px;">RSH-637 originally included <code>github.com</code> in the warm zone allowlist. This design <strong>overrides that decision</strong>: <code>github.com</code> is allowed at provision only and is explicitly <strong>excluded from all runtime zones</strong>. The Host Agent does no git network ops after the clone, so runtime <code>github.com</code> reachability only adds an exfiltration path.</p>
      </div>

      <h3 id="why-phase-separation-works" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Why Phase Separation Works</h3>

      <p>Two phases map naturally to the existing code structure:</p>
      <ol style="font-size:14px;">
        <li><strong>Provision phase</strong>: Sandbox creation in <code>sandbox-runtime.ts</code> applies provision-phase policy &mdash; before any agent code runs</li>
        <li><strong>Runtime transition</strong>: The first call to <code>configureNetworkPolicyForStep()</code> in <code>beforeStepComposed()</code> replaces the provision policy with the runtime policy &mdash; github.com is removed, and org additions may be included (warm/cold only)</li>
      </ol>

      <p>Org additions do <strong>NOT</strong> apply during provisioning because provisioning happens before any org-configured agent behavior. The provision-phase allowlist is a pure platform constant.</p>
    </section>

    <!-- Org-Additions Data Model -->
    <section id="org-additions-data-model" style="margin-bottom:48px;">
      <h2 id="org-additions-data-model" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Org-Additions Data Model</h2>

      <p>The org-additions layer introduces two new database tables, following the established Prisma FK pattern used by <code>InferenceEndpoint</code>, <code>InspectionApiKey</code>, <code>SdfCredential</code>, and <code>NsGmCredential</code> &mdash; all of which use dedicated tables with <code>organizationId</code> FK rather than adding columns to the Organization model (which already has 60+ fields).</p>

      <h3 id="organizationegressrule-table" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">OrganizationEgressRule Table</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>model OrganizationEgressRule {
  id               String       @id @default(cuid())
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id])
  domainPattern    String       // e.g., "*.theircompany.com" or "api.theircompany.com"
  description      String?      // optional user-provided reason
  enabled          Boolean      @default(true)
  createdById      String
  createdBy        User         @relation("egressRuleCreatedBy", fields: [createdById], references: [id])
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@unique([organizationId, domainPattern])
  @@index([organizationId])
}</code></pre>
      </div>

      <h4 id="field-descriptions" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">Field Descriptions</h4>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Field</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Type</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>id</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">String (CUID)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Primary key, auto-generated</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>organizationId</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">String (FK)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Foreign key to Organization table</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>domainPattern</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">String</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Validated domain pattern: FQDN (<code>api.example.com</code>) or bounded wildcard (<code>*.example.com</code>)</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>description</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">String? (optional)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">User-provided reason for the addition (e.g., &ldquo;Internal package registry&rdquo;)</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>enabled</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Boolean (default: true)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Supports soft-disable without losing entry or audit history</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>createdById</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">String (FK)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Foreign key to the admin User who created the entry</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>createdAt</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">DateTime</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Auto-set timestamp of creation</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>updatedAt</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">DateTime</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Auto-updated timestamp</td></tr>
        </tbody>
      </table>

      <h4 id="schema-design-decisions" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">Key Schema Design Decisions</h4>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Decision</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Rationale</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;"><code>@@unique([organizationId, domainPattern])</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Prevents duplicate entries per org. An org cannot add the same domain twice.</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">No <code>zoneScope</code> column</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Org additions always apply to warm/cold only (never hot). This is a security invariant enforced by the policy computation, not per-entry configuration. Adding per-entry zone scoping is unnecessary complexity and opens a vector for misconfiguration.</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;"><code>enabled</code> field</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Supports soft-disable without deleting the entry. Admin can toggle off access without losing audit history or needing to re-enter the domain later.</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;"><code>createdById</code> FK</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Links to the admin who added the entry for audit and accountability.</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">No soft-delete</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Use <code>enabled: false</code> for disabling; hard-delete with audit log entry for removal. Simpler than tombstones; EgressAuditLog captures the full history.</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">No encryption</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Domain patterns are not secrets. Unlike credentials (GitHub PATs, API keys), domain patterns are visible in the settings UI and would be enumerable by inspecting network traffic.</td></tr>
        </tbody>
      </table>

      <h3 id="egressauditlog-table" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">EgressAuditLog Table</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>model EgressAuditLog {
  id               String   @id @default(cuid())
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id])
  action           String   // "RULE_ADDED" | "RULE_REMOVED" | "RULE_ENABLED" | "RULE_DISABLED"
  domainPattern    String
  actorId          String
  actor            User     @relation(fields: [actorId], references: [id])
  metadata         String?  @db.Text // JSON for additional context
  createdAt        DateTime @default(now())

  @@index([organizationId])
  @@index([organizationId, createdAt])
}</code></pre>
      </div>

      <h4 id="why-a-dedicated-audit-table" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">Why a Dedicated Audit Table (Not InspectionAuditLog)</h4>

      <p>The existing <code>InspectionAuditLog</code> is typed to <code>InspectionCredentialType</code> (DATABASE/LOGS/API) and keyed to <code>repositoryId</code>. Egress events are org-scoped with fundamentally different fields (action, domain, zone scope vs. credential type, repo, query). A dedicated table avoids type contortion and keeps the audit trail cleanly queryable. The fire-and-forget logging pattern from <code>logInspectionQuery()</code> in <code>inspection-audit-service.ts</code> is reused for the implementation.</p>
    </section>

    <!-- Domain Validation Rules -->
    <section id="domain-validation-rules" style="margin-bottom:48px;">
      <h2 id="domain-validation-rules" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Domain Validation Rules</h2>

      <p>Server-side validation is the <strong>security boundary</strong>. Client-side validation is UX feedback only &mdash; it provides immediate error messages but can never be trusted. All 9 rules below are enforced server-side; the client mirrors them for responsiveness.</p>

      <h3 id="validation-rules-v1-through-v9" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Validation Rules V-1 through V-9</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:12px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Rule</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Pattern</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Example Rejected</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Rationale</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fff5f5;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-1: No bare TLDs</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Wildcard with only TLD after <code>*.</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.com</code>, <code>*.org</code>, <code>*.net</code>, <code>*.io</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Overly broad; covers millions of domains</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-2: No universal wildcard</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Literal <code>*</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Allows all egress; defeats default-deny entirely</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-3: No raw IP addresses</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">IPv4 or IPv6 literals</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>192.168.1.1</code>, <code>::1</code>, <code>10.0.0.0</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">IPs bypass domain-level controls; SNI is domain-based</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-4: No wide CIDRs</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">CIDR notation (reject all)</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>10.0.0.0/8</code>, <code>0.0.0.0/0</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Org additions are domain-only; CIDRs are platform-managed</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-5: No Helix-server spoofs</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Matches <code>config.webOrigin</code> hostname</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>helix-app.example.com</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Already in built-in allowlist; user addition could mask policy changes</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-6: No Anthropic API spoofs</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Matches <code>api.anthropic.com</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.anthropic.com</code>, <code>*.anthropic.com</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Already in built-in allowlist; prevents redundancy</td>
          </tr>
          <tr style="background:#f0fff4;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-7: Bounded wildcards only</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Wildcard must have registered domain + TLD</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.co.uk</code> (rejected); <code>*.theircompany.com</code> (OK)</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Ensures meaningful organizational scope</td>
          </tr>
          <tr style="background:#f0fff4;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-8: Valid FQDN format</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Syntactically valid hostname or wildcard</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>not a domain</code>, <code>http://example.com</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Protocol prefixes, paths, ports not allowed</td>
          </tr>
          <tr style="background:#ebf8ff;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:600;">V-9: Max entries per org</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Configurable limit (recommended: 50)</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">51st entry rejected</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Prevents policy bloat; bounds policy-rendering latency</td>
          </tr>
        </tbody>
      </table>

      <h3 id="bounded-wildcard-validation-algorithm" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Bounded Wildcard Validation Algorithm</h3>

      <div style="background:#edf2f7; border-radius:8px; padding:16px 20px; margin:16px 0;">
        <ol style="margin:0; padding-left:20px; font-size:14px;">
          <li><strong>Check wildcard prefix:</strong> If starts with <code>*.</code>, strip prefix, validate remainder as a valid domain with at least 2 labels (SLD + TLD).</li>
          <li><strong>Reject bare TLDs:</strong> Reject if remainder is just a TLD (V-1) or a known two-part TLD (<code>co.uk</code>, <code>com.au</code>, <code>co.jp</code>, <code>com.br</code>, etc.).</li>
          <li><strong>Check reserved patterns:</strong> Reject if remainder matches Helix server hostname (V-5) or Anthropic domains (V-6).</li>
          <li><strong>Plain FQDN:</strong> If does NOT start with <code>*.</code>, validate as a plain FQDN with standard hostname rules.</li>
          <li><strong>Reject all else:</strong> Reject any pattern containing IPs, CIDRs, protocols, ports, or paths (V-3, V-4, V-8).</li>
        </ol>
      </div>

      <div style="background:#ebf8ff; border-left:4px solid #3182ce; border-radius:0 8px 8px 0; padding:16px 20px; margin:16px 0;">
        <p style="margin:0; font-weight:600; color:#2b6cb0;">TLD Suffix List Note</p>
        <p style="margin:8px 0 0; font-size:14px;">Accurate V-7 validation requires knowing two-part TLDs (<code>co.uk</code>, <code>com.au</code>, etc.). A static list of common two-part TLDs is sufficient for MVP. For comprehensive coverage, consider using a public suffix list library (e.g., <code>psl</code> npm package) in a later iteration.</p>
      </div>
    </section>

    <!-- Permissions & Access Control -->
    <section id="permissions-and-access-control" style="margin-bottom:48px;">
      <h2 id="permissions-and-access-control" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Permissions &amp; Access Control</h2>

      <p>Egress rule management is restricted to <strong>org administrators only</strong> using the existing <code>requireAdmin</code> middleware (<code>middleware.ts:83-90</code>), which checks the <code>user.isAdmin</code> boolean flag. With 12 admins across 40 total users (30% admin ratio), this is sufficient for the current scale.</p>

      <h3 id="admin-only-endpoints" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Admin-Only Endpoints</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Method</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Path</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Auth</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #2d3748;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">GET</span></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>/api/v1/settings/egress-rules</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAuth + requireAdmin</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">List org&rsquo;s egress rules</td>
          </tr>
          <tr>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#bee3f8; color:#2b6cb0; padding:2px 8px; border-radius:4px; font-size:11px;">POST</span></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>/api/v1/settings/egress-rules</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAuth + requireAdmin</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Add a new egress rule (validated)</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#fed7d7; color:#9b2c2c; padding:2px 8px; border-radius:4px; font-size:11px;">DELETE</span></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>/api/v1/settings/egress-rules/:ruleId</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAuth + requireAdmin</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Remove an egress rule</td>
          </tr>
          <tr>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#fefcbf; color:#975a16; padding:2px 8px; border-radius:4px; font-size:11px;">PATCH</span></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>/api/v1/settings/egress-rules/:ruleId</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAuth + requireAdmin</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">Toggle enabled/disabled</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">GET</span></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>/api/v1/settings/egress-rules/audit</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAuth + requireAdmin</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">List audit log entries (paginated)</td>
          </tr>
          <tr>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">GET</span></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>/api/v1/settings/egress-rules/built-in</code></td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">requireAuth</td>
            <td style="padding:8px 10px; border:1px solid #e2e8f0;">List built-in + helix-global domains (read-only)</td>
          </tr>
        </tbody>
      </table>

      <p style="font-size:14px;">The read-only built-in endpoint (<code>/built-in</code>) uses <code>requireAuth</code> only (not <code>requireAdmin</code>) because the built-in domain list is not sensitive &mdash; it is public platform configuration. All other endpoints require admin access to prevent information leakage about the org&rsquo;s egress posture.</p>

      <div style="background:#edf2f7; border-radius:8px; padding:16px 20px; margin:16px 0;">
        <p style="margin:0; font-weight:600; font-size:14px;">Future: Per-Org Admin Roles</p>
        <p style="margin:8px 0 0; font-size:13px;">The current global <code>isAdmin</code> flag suffices for 12 admins across 19 orgs. A future enhancement could introduce an <code>OrganizationRole</code> enum (ADMIN/MEMBER) for finer-grained per-org permissions. The egress endpoint middleware would then check org-specific admin status rather than global.</p>
      </div>
    </section>

    <!-- Audit Trail -->
    <section id="audit-trail" style="margin-bottom:48px;">
      <h2 id="audit-trail" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Audit Trail</h2>

      <p>Every mutation to egress rules is recorded as a security event. The audit trail is <strong>append-only</strong> and uses a <strong>fire-and-forget</strong> logging pattern (matching the existing <code>logInspectionQuery()</code> pattern from <code>inspection-audit-service.ts</code>) so that audit logging never blocks the user-facing operation.</p>

      <h3 id="audit-event-types" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Audit Event Types</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Action</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Trigger</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Data Captured</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f0fff4;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">RULE_ADDED</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Admin adds a domain pattern</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">domainPattern, actorId, organizationId, metadata (description)</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#fed7d7; color:#9b2c2c; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">RULE_REMOVED</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Admin hard-deletes a domain pattern</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">domainPattern, actorId, organizationId</td>
          </tr>
          <tr style="background:#f0fff4;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#c6f6d5; color:#276749; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">RULE_ENABLED</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Admin re-enables a disabled rule</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">domainPattern, actorId, organizationId</td>
          </tr>
          <tr style="background:#fffbeb;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#fefcbf; color:#975a16; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600;">RULE_DISABLED</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Admin disables a rule without deleting</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">domainPattern, actorId, organizationId</td>
          </tr>
        </tbody>
      </table>

      <h3 id="logging-pattern" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Logging Pattern</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>// Fire-and-forget: audit log write does not block the response
async function logEgressAudit(params: {
  organizationId: string;
  action: 'RULE_ADDED' | 'RULE_REMOVED' | 'RULE_ENABLED' | 'RULE_DISABLED';
  domainPattern: string;
  actorId: string;
  metadata?: Record&lt;string, unknown&gt;;
}): Promise&lt;void&gt; {
  // Non-blocking: errors are logged but do not propagate
  prisma.egressAuditLog.create({
    data: {
      organizationId: params.organizationId,
      action: params.action,
      domainPattern: params.domainPattern,
      actorId: params.actorId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  }).catch((err) =&gt; {
    console.error('Failed to write egress audit log:', err);
  });
}</code></pre>
      </div>

      <p style="font-size:14px;">Every POST, DELETE, and PATCH handler for egress rules calls <code>logEgressAudit()</code> <strong>before returning</strong> the response. The audit write is fire-and-forget: it does not block the response, and any write failure is logged to application logs but does not fail the user operation.</p>
    </section>

    <!-- Settings UX Design -->
    <section id="settings-ux-design" style="margin-bottom:48px;">
      <h2 id="settings-ux-design" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Settings UX Design</h2>

      <p>The egress allowlist management UI is a new <strong>&ldquo;Security&rdquo; tab</strong> in the settings page, the 7th tab. It is entirely hidden for non-admin users via the existing <code>useIsAdmin()</code> hook from <code>platform.ts</code>.</p>

      <h3 id="tab-placement-and-visibility" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Tab Placement and Visibility</h3>

      <div style="background:#edf2f7; border-radius:8px; padding:16px 20px; margin:16px 0;">
        <p style="margin:0 0 8px; font-weight:600; font-size:14px;">Settings Page Tab Order</p>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          <span style="background:#fff; border:1px solid #cbd5e0; padding:6px 12px; border-radius:4px; font-size:13px;">General</span>
          <span style="background:#fff; border:1px solid #cbd5e0; padding:6px 12px; border-radius:4px; font-size:13px;">Repositories</span>
          <span style="background:#fff; border:1px solid #cbd5e0; padding:6px 12px; border-radius:4px; font-size:13px;">Team</span>
          <span style="background:#fff; border:1px solid #cbd5e0; padding:6px 12px; border-radius:4px; font-size:13px;">Integrations</span>
          <span style="background:#fff; border:1px solid #cbd5e0; padding:6px 12px; border-radius:4px; font-size:13px;">Deployments</span>
          <span style="background:#fff; border:1px solid #cbd5e0; padding:6px 12px; border-radius:4px; font-size:13px;">NetSuite</span>
          <span style="background:#0f3460; color:#fff; border:1px solid #0f3460; padding:6px 12px; border-radius:4px; font-size:13px; font-weight:600;">Security</span>
          <span style="font-size:12px; color:#718096; padding:6px 0;">(admin-only)</span>
        </div>
      </div>

      <p style="font-size:14px;">The Security tab is registered in the <code>TabId</code> union type and conditionally rendered using the same pattern used for other admin-gated tabs. The <code>useIsAdmin()</code> hook from <code>platform.ts</code> controls visibility.</p>

      <h3 id="tab-layout-and-sections" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Tab Layout and Sections</h3>

      <p>The Security tab contains three visual sections, displayed vertically:</p>

      <div style="border:2px solid #e2e8f0; border-radius:8px; margin:16px 0; overflow:hidden;">
        <!-- Section 1: Built-in domains -->
        <div style="padding:16px 20px; border-bottom:1px solid #e2e8f0; background:#f7fafc;">
          <h4 style="margin:0 0 8px; font-size:15px; color:#2d3748;">1. Platform Domains (Read-Only)</h4>
          <p style="margin:0; font-size:13px; color:#4a5568;">Displays built-in default and helix-global domains. Not editable by org admins. Provides transparency about what the platform already allows.</p>
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:4px; padding:12px; margin-top:8px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f7fafc;"><code>api.anthropic.com</code> <span style="color:#718096;">Claude inference</span></div>
            <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f7fafc;"><code>registry.npmjs.org</code> <span style="color:#718096;">npm packages</span></div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;"><code>...</code> <span style="color:#718096;">+ more</span></div>
          </div>
        </div>

        <!-- Section 2: Org additions -->
        <div style="padding:16px 20px; border-bottom:1px solid #e2e8f0;">
          <h4 style="margin:0 0 8px; font-size:15px; color:#2d3748;">2. Organization Egress Rules (Editable)</h4>
          <p style="margin:0; font-size:13px; color:#4a5568;">Admin-managed domain list. Follows the integrations tab CRUD pattern: add/edit/delete with list display.</p>

          <div style="background:#fffbeb; border:1px solid #f6e05e; border-radius:6px; padding:12px 16px; margin:12px 0;">
            <p style="margin:0; font-size:13px; color:#975a16; font-weight:600;">Informed Opt-In Warning</p>
            <p style="margin:4px 0 0; font-size:12px; color:#975a16;">Adding this domain means Helix agents will be able to send data to it, including source code from your repositories. Only add domains you trust.</p>
          </div>

          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:4px; padding:12px; margin-top:8px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #f7fafc;">
              <div><code>*.theircompany.com</code> <span style="color:#718096; font-size:12px;">Internal registry</span></div>
              <div style="display:flex; gap:6px;">
                <span style="background:#c6f6d5; color:#276749; padding:2px 8px; border-radius:4px; font-size:11px;">Enabled</span>
                <span style="color:#718096; font-size:11px;">admin@org &middot; 2d ago</span>
              </div>
            </div>
          </div>

          <div style="margin-top:12px; padding:12px; background:#f7fafc; border-radius:4px;">
            <p style="margin:0 0 8px; font-size:13px; font-weight:600;">Add Domain</p>
            <div style="display:flex; gap:8px;">
              <div style="flex:1; background:#fff; border:1px solid #cbd5e0; border-radius:4px; padding:6px 10px; font-size:13px; color:#a0aec0;">*.example.com</div>
              <div style="background:#0f3460; color:#fff; padding:6px 16px; border-radius:4px; font-size:13px; font-weight:600;">Add</div>
            </div>
          </div>
        </div>

        <!-- Section 3: Audit trail -->
        <div style="padding:16px 20px; background:#f7fafc;">
          <h4 style="margin:0 0 8px; font-size:15px; color:#2d3748;">3. Audit Trail</h4>
          <p style="margin:0; font-size:13px; color:#4a5568;">Chronological log of all egress changes. Paginated. Read-only display of EgressAuditLog entries.</p>
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:4px; padding:12px; margin-top:8px; font-size:12px;">
            <div style="display:flex; gap:8px; padding:4px 0; border-bottom:1px solid #f7fafc; align-items:center;">
              <span style="background:#c6f6d5; color:#276749; padding:1px 6px; border-radius:3px; font-size:10px;">ADDED</span>
              <code>*.theircompany.com</code>
              <span style="color:#718096;">by admin@org</span>
              <span style="color:#a0aec0;">Jun 2, 2026</span>
            </div>
            <div style="display:flex; gap:8px; padding:4px 0; align-items:center;">
              <span style="background:#fed7d7; color:#9b2c2c; padding:1px 6px; border-radius:3px; font-size:10px;">REMOVED</span>
              <code>api.old-vendor.com</code>
              <span style="color:#718096;">by admin@org</span>
              <span style="color:#a0aec0;">May 28, 2026</span>
            </div>
          </div>
        </div>
      </div>

      <h3 id="ux-interaction-flow" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">UX Interaction Flow</h3>

      <ol style="font-size:14px;">
        <li><strong>Admin navigates</strong> to Settings &rarr; Security tab</li>
        <li><strong>Views</strong> platform domains (read-only) and current org rules</li>
        <li><strong>Clicks &ldquo;Add Domain&rdquo;</strong> &mdash; input field with optional description</li>
        <li><strong>Client-side validation</strong> provides immediate feedback (mirrors V-1 through V-9)</li>
        <li><strong>Informed opt-in warning</strong> is prominently displayed before submission</li>
        <li><strong>Submits</strong> &mdash; server-side validation is the security boundary</li>
        <li><strong>Success</strong>: domain appears in list; audit entry created</li>
        <li><strong>Rejection</strong>: clear error message explaining which validation rule failed</li>
      </ol>
    </section>

    <!-- Backend Rendering -->
    <section id="backend-rendering" style="margin-bottom:48px;">
      <h2 id="backend-rendering" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Backend Rendering</h2>

      <p>The logical domain-allowlist model is expressed once and rendered to each sandbox backend via the unified abstraction&rsquo;s <code>setNetworkPolicy()</code> interface slot (RSH-647). Each adapter translates the logical model to its backend-specific API.</p>

      <h3 id="logical-model" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Logical Model</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>interface NetworkPolicyInput {
  allowedDomains: string[];  // Union of applicable layers
  tier?: 'hot' | 'warm' | 'cold';
}

// Called on the unified sandbox interface
sandbox.setNetworkPolicy({
  allowedDomains: computeEffectivePolicy(zone, orgId),
  tier: zone,
});</code></pre>
      </div>

      <h3 id="vercel-rendering" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Vercel Rendering <span style="background:#c6f6d5; color:#276749; padding:2px 10px; border-radius:4px; font-size:12px; margin-left:8px;">Validated via Context7</span></h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>// Vercel REST API: POST /v2/sandboxes/sessions/{sessionId}/network-policy
// SDK: sandbox.updateNetworkPolicy()
{
  mode: "custom",
  allowedDomains: ["api.anthropic.com", "*.example.com"],
  allowedCIDRs: [],     // platform-managed only
  deniedCIDRs: [],      // platform-managed only
}</code></pre>
      </div>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Feature</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Vercel Behavior</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Enforcement level</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">SNI-based (TLS Server Name Indication)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 docs</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">Modes</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>custom</code>, <code>open</code> (allow-all), <code>closed</code> (deny-all)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 docs</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Wildcard support</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.example.com</code> matches all subdomains</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 docs (confirmed)</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">Update semantics</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Full replacement (overwrites previous policy)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 docs</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Live update</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Can update running sessions without restart</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 docs</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">Header injection</td><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>injectionRules</code> available (future credential brokering use)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 docs</td></tr>
        </tbody>
      </table>

      <h3 id="sprites-rendering" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Sprites Rendering <span style="background:#fed7d7; color:#9b2c2c; padding:2px 10px; border-radius:4px; font-size:12px; margin-left:8px;">Unvalidated</span></h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>// POST /v1/sprites/{name}/policy/network
// DNS-level enforcement
// Exact API shape unvalidated -- must be confirmed before implementation
{
  allowedDomains: ["api.anthropic.com", "*.example.com"]  // assumed shape
}</code></pre>
      </div>

      <div style="background:#fff5f5; border-left:4px solid #e53e3e; border-radius:0 8px 8px 0; padding:16px 20px; margin:16px 0;">
        <p style="margin:0; font-weight:600; color:#c53030;">Implementation Risk: Sprites API Unvalidated</p>
        <p style="margin:8px 0 0; font-size:14px;">The sprites network policy API (<code>POST /v1/sprites/{name}/policy/network</code>) has <strong>never been called</strong> from the Helix codebase. The <code>@fly/sprites</code> SDK (<code>sprites/client.ts</code>) has no network policy methods. The API shape shown above is <em>assumed</em> and must be validated against actual sprites/Fly documentation before implementation. The adapter must handle potential wildcard semantics differences between Vercel SNI matching and sprites DNS matching.</p>
      </div>

      <h3 id="wildcard-semantics-divergence-risk" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Wildcard Semantics Divergence Risk</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Aspect</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Vercel (SNI)</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Sprites (DNS)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Matching layer</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">TLS ClientHello (hostname)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">DNS resolution (before connection)</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.example.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Matches <code>sub.example.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Should match (unconfirmed)</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Multi-level wildcards</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Unconfirmed for <code>a.b.example.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Unconfirmed</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">Punycode</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Unknown</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Unknown</td></tr>
        </tbody>
      </table>

      <p style="font-size:14px;">For standard wildcard patterns (<code>*.example.com</code>), both SNI and DNS approaches should produce equivalent results. Edge cases (multi-level wildcards, punycode domains) need validation during implementation. The adapter layer absorbs any normalization differences &mdash; this is a core benefit of the RSH-647 abstraction.</p>
    </section>

    <!-- Effective Policy Computation -->
    <section id="effective-policy-computation" style="margin-bottom:48px;">
      <h2 id="effective-policy-computation" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Effective Policy Computation</h2>

      <h3 id="computeeffectivepolicy-function" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">computeEffectivePolicy() Function</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>/**
 * Compute the effective egress policy for a given zone and organization.
 * Returns a flat array of allowed domain patterns.
 *
 * Hot zone: built-in + helix-global only (org additions EXCLUDED)
 * Warm/Cold: built-in + helix-global + enabled org additions
 */
async function computeEffectivePolicy(
  zone: 'hot' | 'warm' | 'cold',
  orgId: string
): Promise&lt;string[]&gt; {
  // Layers 1-2: deploy-gated code constants
  const domains = new Set&lt;string&gt;([
    ...BUILT_IN_DEFAULT[zone],
    ...HELIX_GLOBAL[zone],
  ]);

  // Layer 3: org additions (warm/cold only - SECURITY INVARIANT)
  if (zone !== 'hot') {
    const orgRules = await prisma.organizationEgressRule.findMany({
      where: { organizationId: orgId, enabled: true },
      select: { domainPattern: true },
    });
    for (const rule of orgRules) {
      domains.add(rule.domainPattern);
    }
  }

  // Layer 4 (future): ticket-level escalation would be added here
  // if (zone !== 'hot' &amp;&amp; ticketId) { ... }

  return Array.from(domains);
}</code></pre>
      </div>

      <h3 id="configurenetworkpolicyforstep-function" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">configureNetworkPolicyForStep() Integration</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>/**
 * Apply network policy for a specific step.
 * Called from beforeStepComposed() in orchestrator.ts.
 */
async function configureNetworkPolicyForStep(
  sandbox: HelixSandbox,
  stepId: string,
  orgId: string
): Promise&lt;void&gt; {
  // Resolve zone from step ID (using credentials.ts pattern)
  const zone = resolveZone(stepId); // 'hot' | 'warm' | 'cold'

  // Compute effective policy for this zone + org
  const allowedDomains = await computeEffectivePolicy(zone, orgId);

  // Apply via unified abstraction
  await sandbox.setNetworkPolicy({
    allowedDomains,
    tier: zone,
  });
}</code></pre>
      </div>

      <h3 id="caching-consideration" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Caching Consideration</h3>

      <p>Org rules can be cached per-org for the duration of a workflow run. Rules change infrequently (admin action), and staleness within a single workflow run is acceptable. A simple in-memory cache with workflow-scoped lifetime avoids per-step DB queries.</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Operation</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Expected Latency</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Frequency</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Policy computation (union)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">&lt;5ms</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Once per step transition (~5&ndash;8 per workflow)</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">Network policy update (Vercel)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">&lt;500ms</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Once per step transition</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;">Network policy update (sprites)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Unknown</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Once per step transition</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;">Org rule CRUD</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">&lt;100ms</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Infrequent (admin action)</td></tr>
        </tbody>
      </table>
    </section>

    <!-- Ticket-Level Escalation (Designed-for-Future) -->
    <section id="ticket-level-escalation-designed-for-future" style="margin-bottom:48px;">
      <h2 id="ticket-level-escalation-designed-for-future" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Ticket-Level Escalation <span style="background:#edf2f7; color:#718096; padding:4px 12px; border-radius:4px; font-size:14px; font-weight:400; margin-left:8px;">Designed-for-Future</span></h2>

      <div style="background:#ebf8ff; border-left:4px solid #3182ce; border-radius:0 8px 8px 0; padding:16px 20px; margin-bottom:20px;">
        <p style="margin:0; font-weight:600; color:#2b6cb0;">This layer is NOT built in the current ticket. It is designed for future extensibility.</p>
        <p style="margin:8px 0 0; font-size:14px;">The four-layer model and union computation naturally accommodate this layer without rework. No current schema changes are needed.</p>
      </div>

      <h3 id="future-data-model" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Future TicketEgressEscalation Table</h3>

      <div style="background:#edf2f7; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6; color:#4a5568;"><code>// Future table -- NOT part of current implementation
model TicketEgressEscalation {
  id               String   @id @default(cuid())
  ticketId         String
  ticket           Ticket   @relation(fields: [ticketId], references: [id])
  domainPattern    String
  status           String   // "PENDING" | "APPROVED" | "DENIED" | "EXPIRED"
  reason           String   // Agent's justification for the request
  requestedById    String   // Agent context identifier
  approvedById     String?  // Admin who approved (null if pending/denied)
  approvedBy       User?    @relation(fields: [approvedById], references: [id])
  expiresAt        DateTime // Auto-expire when ticket completes
  createdAt        DateTime @default(now())

  @@index([ticketId, status])
}</code></pre>
      </div>

      <h3 id="escalation-flow" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Escalation Flow (Future)</h3>

      <ol style="font-size:14px;">
        <li><strong>Agent encounters blocked domain</strong> &mdash; e.g., needs to reach <code>api.vendor.com</code> for a task</li>
        <li><strong>Agent creates escalation request</strong> &mdash; <code>TicketEgressEscalation</code> with <code>status: PENDING</code></li>
        <li><strong>Human admin reviews</strong> &mdash; notification in Helix UI; admin approves or denies</li>
        <li><strong>If approved:</strong> entry included in union computation for this ticket&rsquo;s sandbox only</li>
        <li><strong>Auto-expires:</strong> entry becomes <code>EXPIRED</code> when the ticket completes</li>
      </ol>

      <h3 id="union-computation-extension" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Union Computation Extension</h3>

      <p style="font-size:14px;">The <code>computeEffectivePolicy()</code> function signature already takes an optional <code>ticketId</code> parameter. The fourth layer adds entries only when <code>ticketId</code> is provided and <code>status = APPROVED</code> and <code>expiresAt &gt; now()</code>. This is a localized addition to the existing function &mdash; no other part of the system needs to change.</p>
    </section>

    <!-- Dev Ticket Breakdown -->
    <section id="dev-ticket-breakdown" style="margin-bottom:48px;">
      <h2 id="dev-ticket-breakdown" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Dev Ticket Breakdown</h2>

      <p>The following implementation tasks are derived from this design, ordered by dependency. Each task is scoped to be implementable independently once its dependencies are met.</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">#</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Task</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Repo</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Dependencies</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Scope</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f0fff4;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">A</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Prisma schema + migration</strong><br><span style="font-size:12px; color:#4a5568;">Add OrganizationEgressRule and EgressAuditLog tables; run migration</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">None</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Schema + migration file</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">B</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Egress service + validation</strong><br><span style="font-size:12px; color:#4a5568;">Domain validation logic (V-1 through V-9); CRUD operations on OrganizationEgressRule</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">A</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Service + validation module</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">C</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>API endpoints</strong><br><span style="font-size:12px; color:#4a5568;">6 REST endpoints with requireAdmin middleware, Zod validation</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">A, B</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Routes + handlers</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">D</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Policy computation + orchestrator integration</strong><br><span style="font-size:12px; color:#4a5568;">computeEffectivePolicy(); configureNetworkPolicyForStep() in beforeStepComposed(); provision-phase policy</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">A, RSH-647</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Policy engine + orchestrator hook</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">E</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Audit trail service</strong><br><span style="font-size:12px; color:#4a5568;">logEgressAudit() fire-and-forget function; integration with CRUD handlers</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">A</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Audit service module</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">F</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Client Security tab</strong><br><span style="font-size:12px; color:#4a5568;">New Security tab with platform domains, org rules CRUD, audit trail; admin-only via useIsAdmin()</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-client</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">C</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">React components + API hooks</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">G</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Integration tests</strong><br><span style="font-size:12px; color:#4a5568;">Validation rules, policy computation, zone exclusion invariant, phase separation</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">B, D, E</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Test suite</td>
          </tr>
        </tbody>
      </table>

      <h3 id="dependency-graph" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Dependency Graph</h3>

      <div style="background:#edf2f7; border-radius:8px; padding:20px; margin:16px 0; font-family:monospace; font-size:14px; text-align:center;">
        <pre style="margin:0; display:inline-block; text-align:left;">A (Schema + Migration)
├── B (Egress Service + Validation)
│   └── C (API Endpoints)
│       └── F (Client Security Tab)
├── D (Policy Computation + Orchestrator) ← also requires RSH-647
├── E (Audit Trail Service)
└── G (Integration Tests) ← requires B, D, E</pre>
      </div>

      <h3 id="implementation-order-recommendation" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Recommended Implementation Order</h3>

      <ol style="font-size:14px;">
        <li><strong>Phase 1 (Foundation):</strong> A → B → E (schema, validation, audit &mdash; no external dependencies)</li>
        <li><strong>Phase 2 (API):</strong> C (endpoints that wire everything together)</li>
        <li><strong>Phase 3 (Orchestrator):</strong> D (requires RSH-647 unified abstraction to be implemented)</li>
        <li><strong>Phase 4 (Client):</strong> F (client UI after API is stable)</li>
        <li><strong>Phase 5 (Testing):</strong> G (integration tests after all pieces are in place)</li>
      </ol>
    </section>

    <!-- Open Questions & Risks -->
    <section id="open-questions-and-risks" style="margin-bottom:48px;">
      <h2 id="open-questions-and-risks" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Open Questions &amp; Risks</h2>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">#</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Question / Risk</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Impact</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Mitigation</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fff5f5;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">1</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Sprites network policy API is unvalidated. SDK has no network policy methods.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#dd6b20; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Validate before sprites adapter implementation. Adapter layer absorbs differences.</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">2</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Wildcard matching may differ between Vercel SNI and sprites DNS.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#dd6b20; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Test with real wildcards on both backends during implementation.</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">3</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">TLD suffix list for V-7 validation needs maintenance. Static list may miss exotic TLDs.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">LOW</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Start with static list of common two-part TLDs; migrate to <code>psl</code> library later.</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">4</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Max entries per org (50) is a tuning parameter. May need adjustment based on real usage.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">LOW</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Make configurable; start with 50; monitor usage.</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">5</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">RSH-637 override: github.com moved from warm zone runtime to provision-only.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">LOW</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Explicit override in this design. Implementation must update the warm zone constant.</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">6</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Non-GitHub source platforms (GitLab, Bitbucket) may need provision-phase support.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#ecc94b; color:#744210; padding:2px 8px; border-radius:4px; font-size:11px;">LOW</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Provision-phase allowlist is a code constant; extend when needed.</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">7</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Open web browsing incompatible with private code in the same sandbox.</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;"><span style="background:#dd6b20; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px;">MEDIUM</span></td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Requires phase-separated context without private repo. Out of scope; document as future work.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Appendices -->
    <section id="appendices" style="margin-bottom:48px;">
      <h2 id="appendices" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Appendices</h2>

      <h3 id="appendix-a-full-domain-lists" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Appendix A: Full Domain Lists</h3>

      <h4 id="provision-phase-domains" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">Provision-Phase Domains</h4>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#2d3748; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Domain</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Purpose</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #4a5568;">Layer</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>github.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Git clone (HTTPS)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Provision-only</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.github.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">GitHub API (clone auth)</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Provision-only</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.githubusercontent.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">GitHub content CDN</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Provision-only</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.anthropic.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Claude inference</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Built-in default</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><em>[Helix server domain]</em></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix coordination</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Built-in default</td></tr>
        </tbody>
      </table>

      <h4 id="hot-zone-runtime-domains" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">Hot Zone Runtime Domains (Minimal)</h4>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#e53e3e; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #c53030;">Domain</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #c53030;">Purpose</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #c53030;">Layer</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#fff5f5;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.anthropic.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Claude inference</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Built-in default</td></tr>
          <tr style="background:#fff5f5;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><em>[Helix server domain]</em></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix coordination</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Built-in default</td></tr>
        </tbody>
      </table>
      <p style="font-size:13px; color:#718096;"><strong>No org additions. No ticket escalation. No github.com.</strong> This is the tightest possible egress for production-data steps.</p>

      <h4 id="warmcold-zone-runtime-domains" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">Warm/Cold Zone Runtime Domains</h4>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#dd6b20; color:#fff;">
            <th style="padding:8px 10px; text-align:left; border:1px solid #c05621;">Domain</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #c05621;">Purpose</th>
            <th style="padding:8px 10px; text-align:left; border:1px solid #c05621;">Layer</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>api.anthropic.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Claude inference</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Built-in default</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><em>[Helix server domain]</em></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix coordination</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Built-in default</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>registry.npmjs.org</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">npm packages</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix-global</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.npmjs.org</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">npm CDN</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix-global</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.npmjs.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">npm alternate CDN</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix-global</td></tr>
          <tr><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>context7.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 MCP server</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix-global</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><code>*.context7.com</code></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Context7 subdomains</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Helix-global</td></tr>
          <tr style="background:#ebf8ff;"><td style="padding:8px 10px; border:1px solid #e2e8f0;"><em>[org additions]</em></td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Org-specific domains</td><td style="padding:8px 10px; border:1px solid #e2e8f0;">Org additions (DB)</td></tr>
        </tbody>
      </table>

      <h3 id="appendix-b-prisma-migration-sql-preview" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Appendix B: Prisma Migration SQL Preview</h3>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:12px; line-height:1.5;"><code>-- CreateTable: OrganizationEgressRule
CREATE TABLE "OrganizationEgressRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "domainPattern" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationEgressRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable: EgressAuditLog
CREATE TABLE "EgressAuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "domainPattern" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EgressAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationEgressRule_organizationId_idx"
    ON "OrganizationEgressRule"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationEgressRule_organizationId_domainPattern_key"
    ON "OrganizationEgressRule"("organizationId", "domainPattern");

-- CreateIndex
CREATE INDEX "EgressAuditLog_organizationId_idx"
    ON "EgressAuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "EgressAuditLog_organizationId_createdAt_idx"
    ON "EgressAuditLog"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrganizationEgressRule"
    ADD CONSTRAINT "OrganizationEgressRule_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEgressRule"
    ADD CONSTRAINT "OrganizationEgressRule_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EgressAuditLog"
    ADD CONSTRAINT "EgressAuditLog_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EgressAuditLog"
    ADD CONSTRAINT "EgressAuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;</code></pre>
      </div>

      <h3 id="appendix-c-api-endpoint-schemas" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Appendix C: API Endpoint Schemas</h3>

      <h4 id="post-egress-rules-request" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">POST /api/v1/settings/egress-rules (Request Body)</h4>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>// Zod schema
const createEgressRuleSchema = z.object({
  domainPattern: z.string()
    .min(1, "Domain pattern is required")
    .max(253, "Domain pattern too long"),
  description: z.string().max(500).optional(),
});

// Request body
{
  "domainPattern": "*.theircompany.com",
  "description": "Internal package registry"
}

// Response (201 Created)
{
  "id": "clxyz...",
  "organizationId": "clorg...",
  "domainPattern": "*.theircompany.com",
  "description": "Internal package registry",
  "enabled": true,
  "createdById": "cluser...",
  "createdAt": "2026-06-03T00:00:00.000Z",
  "updatedAt": "2026-06-03T00:00:00.000Z"
}

// Error response (400 Bad Request)
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "rule": "V-1",
    "message": "Bare TLDs like *.com are not permitted. Use a bounded wildcard like *.yourcompany.com instead."
  }
}</code></pre>
      </div>

      <h4 id="patch-egress-rules-request" style="font-size:16px; font-weight:600; color:#16213e; margin:20px 0 12px;">PATCH /api/v1/settings/egress-rules/:ruleId (Toggle)</h4>

      <div style="background:#1a1a2e; color:#e2e8f0; border-radius:8px; padding:20px; margin:16px 0; overflow-x:auto;">
        <pre style="margin:0; font-size:13px; line-height:1.6;"><code>// Request body
{ "enabled": false }

// Response (200 OK)
{ "id": "clxyz...", "enabled": false, ... }</code></pre>
      </div>

      <h3 id="appendix-d-design-principles-summary" style="font-size:18px; font-weight:600; color:#16213e; margin:24px 0 12px;">Appendix D: Design Principles Summary</h3>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">#</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Principle</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Implication</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">1</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Egress controls hosts; tokens control repos</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Network-level and credential-level controls are complementary, not interchangeable</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">2</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Every opening is an exfil channel</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Additions are security-significant decisions, not convenience settings</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">3</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Phase separation</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Provisioning and runtime have distinct allowlists</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">4</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Zone immutability</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Hot zone is not extensible by org additions or ticket escalation</td>
          </tr>
          <tr style="background:#f7fafc;">
            <td style="padding:10px 12px; border:1px solid #e2e8f0; font-weight:700;">5</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Server-side validation is the security boundary</td>
            <td style="padding:10px 12px; border:1px solid #e2e8f0;">Client-side validation is UX feedback only; all enforcement is server-side</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Methodology & Data Sources -->
    <section id="methodology-and-data-sources" style="margin-bottom:48px;">
      <h2 id="methodology-and-data-sources" style="font-size:24px; font-weight:700; color:#1a1a2e; border-bottom:3px solid #0f3460; padding-bottom:8px; margin-bottom:20px;">Methodology &amp; Data Sources</h2>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">
        <thead>
          <tr style="background:#1a1a2e; color:#fff;">
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Source</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">Type</th>
            <th style="padding:10px 12px; text-align:left; border:1px solid #2d3748;">What It Contributed</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">RSH-637 (Egress Access report)</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Prior research</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Zone model, 11-domain allowlist, egress channel taxonomy, deploy-gated constants</td></tr>
          <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;">RSH-647 (Unified Sandbox Abstraction report)</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Prior research</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">HelixSandbox interface, setNetworkPolicy slot, adapter pattern, NetworkPolicyInput type</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Runtime inspection (production DB)</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Live data (June 3, 2026)</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">19 orgs, 12 admins, 40 users, 23 tables, 0 egress tables</td></tr>
          <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-server source code</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Static analysis</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Insertion points, schema patterns, middleware, audit logging pattern</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">helix-global-client source code</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Static analysis</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Settings page structure, tab pattern, admin gating, CRUD UX</td></tr>
          <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;">Context7 (Vercel Sandbox API docs)</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">API validation</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Confirmed updateNetworkPolicy shape, wildcard support, modes, full replacement</td></tr>
          <tr style="background:#f7fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;">Tech research (RSH-648)</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Design synthesis</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">9 architecture decisions, 6 technical decisions, 6 technical checks</td></tr>
        </tbody>
      </table>
    </section>

  </main>

  <!-- Footer -->
  <footer style="background:#1a1a2e; color:rgba(255,255,255,0.6); text-align:center; padding:24px; font-size:13px;">
    <p style="margin:0;">RSH-648 &middot; Layered Egress Allowlist for Helix Sandboxes &middot; June 2026</p>
    <p style="margin:4px 0 0;">project-x-innovation-library</p>
  </footer>

</body>
</html>

## Attachments
- (none)
