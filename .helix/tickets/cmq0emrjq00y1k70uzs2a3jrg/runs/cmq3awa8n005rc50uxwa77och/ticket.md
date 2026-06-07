# Ticket Context

- ticket_id: cmq0emrjq00y1k70uzs2a3jrg
- short_id: BLD-693
- run_id: cmq3awa8n005rc50uxwa77och
- run_branch: helix/build/BLD-693-build-ns-gm-server-side-decomposition-hlx-inspect
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Build: ns-gm server-side decomposition — hlx inspect netsuite + hlx run

## Description
# Build: ns-gm server-side decomposition — `hlx inspect netsuite` + `hlx run`

Implement the ns-gm decomposition from **RSH-636** (plan of record). Two governed server-side surfaces replace the in-sandbox ns-gm CLI:

- **`hlx inspect netsuite`** — SuiteQL + NetSuite script logs. **Read-only by Helix construction** (`assertReadOnlyQuery` before any query reaches NetSuite), capped (200-row / 1MB), redacted, rate-limited, audited (`type: NETSUITE`). The read-only guarantee is account-independent — it does **not** depend on the NetSuite role.
- **`hlx run`** — **arbitrary SuiteScript**, *not* read-only. Ceiling = the account's NetSuite integration-user role (per-account, variable, **not** assumed read-only). Helix governance = cert stays server-side, output sanitized, every execution audited (`type: SUITESCRIPT`), rate-limited. Helix does not constrain the operation beyond that.

ns-gm becomes a **server-side engine** (`netsuite-proxy-service.ts`, OAuth2 M2M extracted from `ns-gm-credential-test-service.ts`, token cache), **not** an agent-invokable CLI and **not** shelled out server-side. `hlx` is the thin interface. Both surfaces ship together; the four sandbox-side ns-gm paths are removed **atomically** (flag flip `nsGmCli=false` + code removal) in the same release. Generic `hlx inspect db/logs/api` is unchanged. Prisma enum gains `NETSUITE` + `SUITESCRIPT`.

Follow RSH-636's Migration Scope and Architecture Decisions **with the three overrides below.** Re-ground all line numbers against current `main` (the FIX-644/645/650 host-agent relocation and the BLD-668→687 chains have all landed ahead of this).

## Override 1 — Environment is a plain parameter, NOT a token claim
**Reject RSH-636 AD-3's token-bound `nsEnv` JWT claim.** Do **not** add an `nsEnv` claim to `issueInspectionToken`/`verifyInspectionToken`, and do **not** treat environment selection as a cryptographically-enforced security boundary.

- Environment is a plain **`--env prod|sandbox`** parameter on the request.
- The existing per-step routing (`scout`/`diagnosis` → PRODUCTION, else → SANDBOX) stays as the **default**, but the caller may override it with `--env`.
- **The account's NetSuite role for the selected environment is the gate** — consistent with the trust model ("the role is the authoritative ceiling"). Cryptographic env enforcement is incoherent with that and is dropped.
- **Keep** the other half of AD-3: eliminate the silent cross-environment fallback — if the target environment's credential is unavailable, fail explicitly (HTTP 400). No silent fallback.

## Override 2 — Reconcile NetSuite egress with BLD-680 (don't leave dead allow-rules)
BLD-680 scoped the **sandbox** runtime egress to the org's own three NetSuite host-patterns (`{acct}.suitetalk`, `{acct}.restlets`, `{acct}.app`) because ns-gm ran *in the sandbox*. After this ticket, ns-gm RESTlet calls run **server-side** (the server is the trust anchor, open-egress), so the sandbox no longer calls `suitetalk`/`restlets`.

- Tighten the **sandbox** runtime NetSuite allowlist (the `netsuiteHostsForOrg` builder in `egress/policy.ts`) so it no longer grants `suitetalk`/`restlets` host-patterns to the sandbox.
- **Keep `{acct}.app.netsuite.com`** in the sandbox runtime allowlist — SDF (`object:list`/`project:deploy`) is separate from ns-gm, still runs in the sandbox, and needs it. Keep `system.netsuite.com` in SETUP only (unchanged).
- Net effect: the sandbox's NetSuite egress shrinks to SDF-only; the new server-side RESTlet egress needs no sandbox allowlist entry.

## Override 3 — Build on BLD-685's hardened inspection key
The `inspect netsuite` + `run` surfaces authenticate with the inspection token that **BLD-685** gave an `expiresAt` + rotate-on-wake lifecycle. Use that hardened, expiring, rotated key model. Do **not** reintroduce an unbounded/persisted `hxi_` key, and do not put any secret in argv/command strings/logs.

## Trust model (unchanged from RSH-636 §6)
NetSuite role = authoritative but per-account, variable, not guaranteed read-only. Helix-side governance stands alone: `inspect netsuite` safe-by-construction (account-independent); `run` role-bounded + cert-server-side + sanitized + audited. Advise customers to keep the prod integration role least-privilege / read-only, but treat that as defense-in-depth, never an assumption.

## Acceptance
- `hlx inspect netsuite` runs SuiteQL + logs through the full read-only pipeline (`assertReadOnlyQuery` + sanitize + cap + rate-limit + audit `NETSUITE`); a write-shaped SuiteQL is rejected.
- `hlx run` executes arbitrary SuiteScript server-side with **no** read-only check, but with sanitize + rate-limit + audit `SUITESCRIPT`; cert never enters the sandbox.
- `--env prod|sandbox` selects the environment; per-step default applies when omitted; unavailable target → HTTP 400 (no silent fallback); **no `nsEnv` JWT claim exists**.
- All four sandbox-side ns-gm paths are gone; `nsGmCli=false` for the NETSUITE platform; `platform-config.test.ts` updated.
- Sandbox runtime NetSuite egress = `{acct}.app.netsuite.com` only (no `suitetalk`/`restlets`); a real server-side ns-gm RESTlet call still succeeds; a real SDF op from the sandbox still succeeds.
- Prisma `InspectionCredentialType` has `NETSUITE` + `SUITESCRIPT`; migration applied.

## References
Implements **RSH-636**. Reconciles with **BLD-680** (account-scoped NetSuite egress), **BLD-685** (inspection-key hardening), **RSH-648/RSH-667** (egress design/verified record), **RSH-640** (security parity). Chained `--after FIX-687` so it lands on the fully-built egress + host-agent state.

## Referenced Tickets

2 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### BLD-680: Egress Lockdown ⑥ — Account-scoped NetSuite egress
- Mode: BUILD | Status: DEPLOYED
- Completed runs: 3 (run-1, run-2, run-3)
- Materialized files: 17 artifacts
- Path: `.helix-refs/BLD-680/`
- Manifest: `.helix-refs/BLD-680/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### BLD-685: Host Agent [5/7] - Credential hardening (short-lived key, rotate on wake)
- Mode: BUILD | Status: DEPLOYED
- Completed runs: 1 (run-1)
- Materialized files: 1 artifacts
- Path: `.helix-refs/BLD-685/`
- Manifest: `.helix-refs/BLD-685/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ns-gm Decomposition: Architecture &amp; Implementation Plan &mdash; RSH-636</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background-color: #f8f9fa; line-height: 1.6;">

<div style="max-width: 90%; margin: 0 auto; padding: 40px 20px;">

<!-- ============================================================== -->
<!-- REPORT HEADER -->
<!-- ============================================================== -->
<div style="border-bottom: 4px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 40px;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
    <span style="background: #1565c0; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Architecture &amp; Migration Plan</span>
    <span style="background: #1a1a2e; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">RSH-636</span>
    <span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">DECIDED</span>
  </div>
  <h1 id="ns-gm-decomposition-architecture-and-implementation" style="font-size: 32px; margin: 16px 0 8px 0; color: #1a1a2e; font-weight: 700;">ns-gm Decomposition: Architecture &amp; Implementation Plan</h1>
  <p style="font-size: 20px; color: #495057; margin: 0 0 8px 0;">Splitting ns-gm into Two Governed Server-Side Surfaces &mdash; <code style="background: #e9ecef; padding: 2px 8px; border-radius: 3px; font-size: 17px;">hlx inspect netsuite</code> &amp; <code style="background: #e9ecef; padding: 2px 8px; border-radius: 3px; font-size: 17px;">hlx run</code></p>
  <p style="font-size: 14px; color: #868e96; margin: 0;">June 2026 &middot; Prepared for Leadership &middot; Confidential &middot; Companion to RSH-633 Security Assessment</p>
</div>

<!-- ============================================================== -->
<!-- TABLE OF CONTENTS -->
<!-- ============================================================== -->
<div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 40px;">
  <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 16px 0; color: #495057; font-weight: 600;">Contents</h2>
  <div style="display: flex; gap: 40px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 280px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #1a1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Part I: The Migration</p>
      <ol style="margin: 0 0 20px 0; padding-left: 24px;">
        <li style="margin-bottom: 6px;"><a href="#executive-summary" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Executive Summary</a></li>
        <li style="margin-bottom: 6px;"><a href="#current-architecture" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Current Architecture</a></li>
        <li style="margin-bottom: 6px;"><a href="#proposed-architecture" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Proposed Architecture</a></li>
        <li style="margin-bottom: 6px;"><a href="#migration-scope" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Migration Scope</a></li>
      </ol>
    </div>
    <div style="flex: 1; min-width: 280px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #1565c0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Part II: Decisions &amp; Trade-offs</p>
      <ol start="5" style="margin: 0 0 20px 0; padding-left: 24px;">
        <li style="margin-bottom: 6px;"><a href="#architecture-decisions" style="color: #1565c0; text-decoration: none; font-weight: 500;">Architecture Decisions</a></li>
        <li style="margin-bottom: 6px;"><a href="#trust-model" style="color: #1565c0; text-decoration: none; font-weight: 500;">Trust Model</a></li>
        <li style="margin-bottom: 6px;"><a href="#pros-and-cons" style="color: #1565c0; text-decoration: none; font-weight: 500;">Pros and Cons</a></li>
      </ol>
    </div>
    <div style="flex: 1; min-width: 280px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #495057; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Part III: Execution</p>
      <ol start="8" style="margin: 0 0 0 0; padding-left: 24px;">
        <li style="margin-bottom: 6px;"><a href="#effort-estimate" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Effort Estimate</a></li>
        <li style="margin-bottom: 6px;"><a href="#implementation-roadmap" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Implementation Roadmap</a></li>
        <li style="margin-bottom: 6px;"><a href="#verification-and-success-criteria" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Verification &amp; Success Criteria</a></li>
        <li style="margin-bottom: 6px;"><a href="#open-questions-and-risks" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Open Questions &amp; Risks</a></li>
        <li style="margin-bottom: 6px;"><a href="#appendix-evidence-sources" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Appendix: Evidence Sources</a></li>
      </ol>
    </div>
  </div>
</div>


<!-- ============================================================== -->
<!-- PART I: THE MIGRATION -->
<!-- ============================================================== -->

<!-- ============================================================== -->
<!-- 1. EXECUTIVE SUMMARY -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="executive-summary" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">1. Executive Summary</h2>

  <div style="background: linear-gradient(135deg, #e3f2fd, #e8eaf6); border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">What This Report Answers</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">
      <strong>1.</strong> What would it look like to move ns-gm to the server and access it via <code style="background: #bbdefb; padding: 2px 6px; border-radius: 3px; font-size: 14px;">hlx inspect</code>?
      <strong>2.</strong> What are the pros and cons?
      <strong>3.</strong> What kind of effort would it take?
    </p>
  </div>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    This is a <strong>decomposition</strong>, not a relocation. The ns-gm CLI currently runs monolithically inside ephemeral sandboxes with direct production NetSuite access. This migration splits ns-gm into two pieces: (a) the <strong>interface</strong> moves to the <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 14px;">hlx</code> CLI, and (b) the <strong>NetSuite client logic</strong> &mdash; OAuth2 M2M cert auth, RESTlet invocation, SuiteQL execution &mdash; moves to a server-side module behind the existing inspection proxy. The ns-gm CLI is removed from sandboxes entirely.
  </p>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    The decomposition creates <strong>two agent-facing surfaces with distinct governance</strong>, split by security posture:
  </p>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;">
    <div style="flex: 1; min-width: 300px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #4caf50; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">READ-ONLY BY CONSTRUCTION</span>
      </div>
      <p style="margin: 0 0 8px 0; font-weight: 700; font-size: 16px; color: #343a40;"><code style="background: #d4edda; padding: 2px 8px; border-radius: 3px; font-size: 15px;">hlx inspect netsuite</code></p>
      <p style="margin: 0; font-size: 14px; color: #495057;">SuiteQL queries + NetSuite script logs. Safety guaranteed by Helix construction (SELECT-only validation, result caps, secret redaction, audit). This guarantee holds <strong>regardless of the account&rsquo;s NetSuite role configuration</strong> &mdash; account-independent.</p>
    </div>
    <div style="flex: 1; min-width: 300px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #e67e22; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">ROLE-BOUNDED + AUDITED</span>
      </div>
      <p style="margin: 0 0 8px 0; font-weight: 700; font-size: 16px; color: #343a40;"><code style="background: #ffeeba; padding: 2px 8px; border-radius: 3px; font-size: 15px;">hlx run</code></p>
      <p style="margin: 0; font-size: 14px; color: #495057;">Arbitrary SuiteScript execution. Ceiling delegated to the account&rsquo;s NetSuite role. Helix governance: cert stays server-side, output passes size-cap + secret-redaction, every run is audited. The NetSuite role is the authoritative ceiling but is <strong>per-account, variable, and NOT guaranteed</strong>.</p>
    </div>
  </div>

  <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Bottom Line</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">The migration extends an existing, proven architecture pattern &mdash; the inspection proxy already governs database, logs, and API access. Two repos are changed: <strong>helix-global-server</strong> (~12 files, medium effort) and <strong>helix-cli</strong> (~4 files, low effort). Zero client UI changes. Zero new dependencies. Estimated <strong>2&ndash;3 days</strong> development + testing. The OAuth2 M2M token exchange is already implemented server-side. The server builds the logic as a library/service; it does <strong>not</strong> shell out to the ns-gm CLI.</p>
  </div>

  <div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Relationship to RSH-633:</strong> The RSH-633 Security Assessment identified two changes that achieve 90% of the security value: (1) moving ns-gm server-side (this report), and (2) applying a domain allowlist via <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 13px;">sandbox.update({ networkPolicy })</code>. This report covers the first change in detail &mdash; architecture, code-level scope, effort, and trade-offs.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 2. CURRENT ARCHITECTURE -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="current-architecture" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">2. Current Architecture</h2>

  <h3 id="what-is-a-hot-sandbox" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">What Is a &ldquo;Hot&rdquo; Sandbox?</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    A &ldquo;hot&rdquo; sandbox is an ephemeral execution environment that has access to production data. In Helix&rsquo;s case, sandboxes running <strong>scout</strong> and <strong>diagnosis</strong> steps receive production NetSuite credentials, giving the agent read-only access to the entire NetSuite account. We call these &ldquo;hot&rdquo; because they hold live production data access, as opposed to &ldquo;cold&rdquo; sandboxes (implementation, verification, deploy steps) that only receive sandbox-environment credentials.
  </p>

  <h3 id="sandbox-lifecycle" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Sandbox Lifecycle</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 0; margin-bottom: 24px; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Phase</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Description</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Key Detail</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Creation</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">New Vercel Sandbox created per run</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Node.js 24, configurable vCPUs &amp; timeout</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Credential Loading</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Both PRODUCTION and SANDBOX ns-gm credentials pre-loaded at run start</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Cached in memory; selected per-step</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">PEM Injection</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Private key PEM written to <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 13px;">/tmp/nsgm-{runId}.pem</code></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">chmod 600 permissions; ns-gm configured via CLI</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Execution</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Agent runs with full Node.js stdlib and internet access</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">No network restrictions configured</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Destruction</td>
          <td style="padding: 10px 12px;">Best-effort credential scrubbing, then timeout-based sandbox destruction</td>
          <td style="padding: 10px 12px;">Credential cleanup catches errors silently</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="two-credential-channels" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">The Two Credential Channels</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    Understanding the security posture requires recognizing that there are <strong>two distinct paths</strong> for production data access, with very different security properties:
  </p>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;">
    <div style="flex: 1; min-width: 280px; background: #fff5f5; border: 2px solid #dc3545; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #dc3545; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">UNCONTROLLED</span>
        <span style="font-weight: 700; font-size: 16px; color: #343a40;">Channel A: ns-gm CLI</span>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 6px;"><strong>Direct</strong> production NetSuite access inside the sandbox</li>
        <li style="margin-bottom: 6px;"><strong>Agent controls</strong> the CLI &mdash; can issue arbitrary queries</li>
        <li style="margin-bottom: 6px;"><strong>No server-side mediation</strong> &mdash; bypasses all proxy controls</li>
        <li style="margin-bottom: 6px;">No rate limiting, no audit logging, no row limits</li>
        <li style="margin-bottom: 0;">No write-blocking or result sanitization</li>
      </ul>
    </div>
    <div style="flex: 1; min-width: 280px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #4caf50; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">CONTROLLED</span>
        <span style="font-weight: 700; font-size: 16px; color: #343a40;">Channel B: Inspection Proxy</span>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 6px;"><strong>Server-mediated</strong> &mdash; queries routed through Helix server</li>
        <li style="margin-bottom: 6px;"><strong>Credentials never leave</strong> the server process</li>
        <li style="margin-bottom: 6px;"><strong>Write-blocking</strong> (INSERT, UPDATE, DELETE blocked)</li>
        <li style="margin-bottom: 6px;">Rate limiting (60 req/60s), audit logging, result sanitization</li>
        <li style="margin-bottom: 0;">Row limits (200 rows), response size cap (1MB)</li>
      </ul>
    </div>
  </div>

  <h3 id="credential-routing" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Credential Routing Logic</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Step</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Environment</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Hot?</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">ns-gm Access Level</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Scout</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">PRODUCTION</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #dc3545;">Yes</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Full account read access via &ldquo;restlets&rdquo; scope</td>
        </tr>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Diagnosis</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">PRODUCTION</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #dc3545;">Yes</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Full account read access via &ldquo;restlets&rdquo; scope</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Implementation</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">SANDBOX</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; color: #868e96;">No</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Sandbox-only access</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Verification</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">SANDBOX</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; color: #868e96;">No</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Sandbox-only access</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Deploy</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">SANDBOX</span></td>
          <td style="padding: 10px 12px; text-align: center; color: #868e96;">No</td>
          <td style="padding: 10px 12px;">Sandbox-only access</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="current-architecture-flow" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Architecture Flow (Before)</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 12px;">
    <div style="font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; color: #343a40;">
      <div style="text-align: center; margin-bottom: 4px;">
        <span style="background: #e9ecef; padding: 6px 16px; border-radius: 4px; font-weight: 700;">Helix Global Server (Orchestrator)</span>
      </div>
      <div style="text-align: center; color: #868e96;">&darr; Creates sandbox &amp; injects PEM credentials &darr;</div>
      <div style="text-align: center; margin: 4px 0;">
        <span style="background: #fff3cd; padding: 6px 16px; border-radius: 4px; border: 1px solid #ffc107; font-weight: 700;">Vercel Sandbox (Ephemeral, Node.js 24)</span>
      </div>
      <div style="display: flex; justify-content: center; gap: 40px; margin-top: 8px; flex-wrap: wrap;">
        <div style="text-align: center;">
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #dc3545; color: white; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px;">ns-gm CLI (Direct &mdash; Uncontrolled)</div>
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #f8d7da; padding: 6px 12px; border-radius: 4px; border: 1px solid #dc3545; font-size: 12px;">NetSuite Production</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px;">hlx inspect db/logs/api (Mediated)</div>
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #d4edda; padding: 6px 12px; border-radius: 4px; border: 1px solid #4caf50; font-size: 12px;">DB / Logs / API via Server</div>
        </div>
      </div>
    </div>
  </div>
  <p style="font-size: 13px; color: #868e96; margin-bottom: 0; text-align: center;"><em>The ns-gm CLI path (red) bypasses all server-side controls that protect db/logs/api.</em></p>
</div>


<!-- ============================================================== -->
<!-- 3. PROPOSED ARCHITECTURE -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="proposed-architecture" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">3. Proposed Architecture</h2>

  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">What &ldquo;Hot&rdquo; Means After Migration</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">After server-side migration, a &ldquo;hot&rdquo; zone no longer means &ldquo;credentials inside the sandbox.&rdquo; It means the agent <strong>can request</strong> production data via the server-side proxy. The sandbox itself is credential-free. The hot zone&rsquo;s risk is bounded by the proxy&rsquo;s sanitization, rate limiting, and volume caps &mdash; not by unlimited CLI access.</p>
  </div>

  <h3 id="target-flow" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Target Flow</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
    <div style="font-family: 'Courier New', monospace; font-size: 13px; line-height: 2.0; color: #343a40;">
      <div style="text-align: center; margin-bottom: 4px;">
        <span style="background: #e9ecef; padding: 6px 16px; border-radius: 4px; font-weight: 700;">Vercel Sandbox (Credential-Free)</span>
      </div>
      <div style="text-align: center; color: #868e96;">&darr; Agent calls hlx inspect netsuite / hlx run &darr;</div>
      <div style="text-align: center; margin: 4px 0;">
        <span style="background: #bbdefb; padding: 6px 16px; border-radius: 4px; border: 1px solid #1565c0; font-weight: 700;">hlx CLI (HTTP POST with inspection token)</span>
      </div>
      <div style="text-align: center; color: #868e96;">&darr; Authenticated request to server &darr;</div>
      <div style="text-align: center; margin: 4px 0;">
        <span style="background: #4caf50; color: white; padding: 6px 16px; border-radius: 4px; font-weight: 700;">Helix Server &mdash; Inspection Proxy</span>
      </div>
      <div style="display: flex; justify-content: center; gap: 16px; margin-top: 4px; flex-wrap: wrap;">
        <span style="background: #d4edda; padding: 4px 10px; border-radius: 4px; border: 1px solid #4caf50; font-size: 11px;">Token Verify</span>
        <span style="background: #d4edda; padding: 4px 10px; border-radius: 4px; border: 1px solid #4caf50; font-size: 11px;">Rate Limit</span>
        <span style="background: #d4edda; padding: 4px 10px; border-radius: 4px; border: 1px solid #4caf50; font-size: 11px;">Read-Only Check*</span>
        <span style="background: #d4edda; padding: 4px 10px; border-radius: 4px; border: 1px solid #4caf50; font-size: 11px;">OAuth2 M2M</span>
        <span style="background: #d4edda; padding: 4px 10px; border-radius: 4px; border: 1px solid #4caf50; font-size: 11px;">Sanitize</span>
        <span style="background: #d4edda; padding: 4px 10px; border-radius: 4px; border: 1px solid #4caf50; font-size: 11px;">Audit</span>
      </div>
      <div style="text-align: center; color: #868e96; margin-top: 4px;">&darr; RESTlet call with Bearer token &darr;</div>
      <div style="text-align: center; margin: 4px 0;">
        <span style="background: #e9ecef; padding: 6px 16px; border-radius: 4px; font-weight: 700;">NetSuite RESTlet API</span>
      </div>
    </div>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #868e96; text-align: center;">* Read-Only Check applies to <code style="font-size: 11px;">hlx inspect netsuite</code> only, not <code style="font-size: 11px;">hlx run</code></p>
  </div>

  <h3 id="security-pipeline" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Security Pipeline Applied to All Queries</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Control</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">hlx inspect netsuite</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">hlx run</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Source</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Token authentication</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">middleware.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Write-blocking (SELECT-only)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #868e96;">No (by design)</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">assertReadOnlyQuery()</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Rate limiting (60 req/60s)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-rate-limiter.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Result sanitization (200 rows, 1MB)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-sanitizer.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Secret redaction (PEM, credentials, URLs)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-sanitizer.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Audit logging</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span> (NETSUITE)</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="color: #4caf50; font-weight: 700;">Yes</span> (SUITESCRIPT)</td>
          <td style="padding: 10px 12px;"><code style="font-size: 12px;">inspection-audit-service.ts</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="side-by-side-comparison" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Before vs After</h3>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;">
    <div style="flex: 1; min-width: 300px; background: #fff5f5; border: 2px solid #dc3545; border-radius: 8px; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-weight: 700; color: #dc3545; font-size: 15px;">Before (Current)</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 6px;">Production PEM keys written into sandbox filesystem</li>
        <li style="margin-bottom: 6px;">ns-gm CLI installed globally (<code style="font-size: 12px;">npm install -g ns-gm</code>)</li>
        <li style="margin-bottom: 6px;">Agent calls CLI directly &mdash; no server mediation</li>
        <li style="margin-bottom: 6px;">No write-blocking, rate limiting, sanitization, or audit</li>
        <li style="margin-bottom: 6px;">Silent credential fallback between environments</li>
        <li style="margin-bottom: 0;">Per-step ns-gm switching logic in orchestrator</li>
      </ul>
    </div>
    <div style="flex: 1; min-width: 300px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-weight: 700; color: #2e7d32; font-size: 15px;">After (Proposed)</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 6px;">Credentials stay server-side; sandbox is credential-free</li>
        <li style="margin-bottom: 6px;">No ns-gm CLI in sandbox; logic built as server-side service</li>
        <li style="margin-bottom: 6px;">Agent uses <code style="font-size: 12px;">hlx inspect netsuite</code> / <code style="font-size: 12px;">hlx run</code> via HTTP</li>
        <li style="margin-bottom: 6px;">Full security pipeline on every query (same as db/logs/api)</li>
        <li style="margin-bottom: 6px;">Explicit failure when credentials unavailable; no fallback</li>
        <li style="margin-bottom: 0;">Environment bound cryptographically via nsEnv token claim</li>
      </ul>
    </div>
  </div>

  <div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Architectural precedent:</strong> The host-agent on Sprites already demonstrates this exact pattern. <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 13px;">host-agent-service.ts</code> creates an MCP server with a <code style="font-size: 13px;">run_helix_cli</code> tool that routes <code style="font-size: 13px;">hlx inspect</code> commands through the server. The agent never touches production credentials directly. This is not a new pattern &mdash; it is an existing, proven architecture being extended to the workflow sandbox.</p>
  </div>
</div>


<!-- ============================================================== -->
<!-- 4. MIGRATION SCOPE -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="migration-scope" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">4. Migration Scope</h2>

  <h3 id="server-scope" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">helix-global-server (Primary Target &mdash; ~12 Files)</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Action</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">File</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Change Description</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #e8f5e9;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">NEW</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/services/netsuite-proxy-service.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">NetSuite client service: OAuth2 M2M token exchange (extracted from ns-gm-credential-test-service.ts), in-memory token cache (~50min TTL), three RESTlet invocation methods (SuiteQL, logs, arbitrary SuiteScript)</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/controllers/inspection-controller.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">New handlers: <code style="font-size: 11px;">postInspectNetsuite</code> (SuiteQL + logs with assertReadOnlyQuery), <code style="font-size: 11px;">postRunSuitescript</code> (arbitrary code, no read-only check)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/routes/api.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Register two new routes: <code style="font-size: 11px;">POST /inspect/:repoId/netsuite</code>, <code style="font-size: 11px;">POST /inspect/:repoId/run</code></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/auth/session.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Add <code style="font-size: 11px;">nsEnv</code> claim to <code style="font-size: 11px;">issueInspectionToken()</code> and <code style="font-size: 11px;">verifyInspectionToken()</code></td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/auth/middleware.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Add <code style="font-size: 11px;">nsEnv</code> to <code style="font-size: 11px;">InspectionAuthResult</code> type; propagate from verified token</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/helix-workflow/orchestrator.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Extend <code style="font-size: 11px;">configureInspectionForStep()</code> with nsEnv resolution and manifest enhancement. Remove <code style="font-size: 11px;">nsGmCredentialCache</code>, <code style="font-size: 11px;">switchNsGmForStep()</code>, <code style="font-size: 11px;">installNsGmCli()</code> call</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/helix-workflow/orchestrator/native-phase.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Remove <code style="font-size: 11px;">installNsGmCli()</code> and <code style="font-size: 11px;">runNsGmSetupAndValidateEnv()</code> function bodies</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">prisma/schema.prisma</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Add <code style="font-size: 11px;">NETSUITE</code> and <code style="font-size: 11px;">SUITESCRIPT</code> to <code style="font-size: 11px;">InspectionCredentialType</code> enum</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">NEW</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">prisma/migrations/*/migration.sql</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Prisma migration: <code style="font-size: 11px;">ALTER TYPE "InspectionCredentialType" ADD VALUE</code></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/lib/platform-config.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Set <code style="font-size: 11px;">nsGmCli: false</code> for NETSUITE platform</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; font-weight: 600;"><code style="font-size: 12px;">src/lib/platform-config.test.ts</code></td>
          <td style="padding: 8px 12px;">Update assertion: <code style="font-size: 11px;">nsGmCli: true</code> &rarr; <code style="font-size: 11px;">nsGmCli: false</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="cli-scope" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">helix-cli (Secondary Target &mdash; ~4 Files)</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Action</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">File</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Change Description</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #e8f5e9;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">NEW</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/inspect/netsuite.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Handler for <code style="font-size: 11px;">hlx inspect netsuite</code>: resolve repo &rarr; hxFetch POST &rarr; print JSON (~20 lines)</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">NEW</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/run/index.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Handler for <code style="font-size: 11px;">hlx run</code>: parse flags, resolve repo, hxFetch POST, print JSON</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">src/inspect/index.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Add <code style="font-size: 11px;">case "netsuite"</code> to inspect router switch + update help text</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; text-align: center;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">MOD</span></td>
          <td style="padding: 8px 12px; font-weight: 600;"><code style="font-size: 12px;">src/index.ts</code></td>
          <td style="padding: 8px 12px;">Add <code style="font-size: 11px;">case "run"</code> to main dispatcher + update usage</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="unchanged-repos" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Unchanged Repos</h3>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px;">
    <div style="flex: 1; min-width: 250px; background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #343a40;">helix-global-client</p>
      <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Zero changes.</strong> The existing NsGmCredential management UI (<code style="font-size: 12px;">netsuite-tab.tsx</code>) already handles per-org, per-environment credential configuration. Because the new server-side surfaces bridge to the existing <code style="font-size: 12px;">NsGmCredential</code> model (per-org), no new credential configuration UI is needed.</p>
    </div>
    <div style="flex: 1; min-width: 250px; background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #343a40;">library</p>
      <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Zero changes.</strong> Documentation/research repository. This report (RSH-636) and the RSH-633 security assessment live here, but no source code changes are needed.</p>
    </div>
  </div>

  <h3 id="four-sandbox-side-removals" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Four Sandbox-Side Removals (Atomic)</h3>

  <div style="background: #fff5f5; border: 1px solid #dc3545; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
    <p style="margin: 0 0 8px 0; font-weight: 700; color: #dc3545; font-size: 14px;">These removals must deploy atomically with the server surfaces. Partial deployment would leave agents without NetSuite access.</p>
  </div>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">Code Path</th>
          <th style="text-align: left; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">Location</th>
          <th style="text-align: left; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">What It Does</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">1</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">nsGmCredentialCache</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">orchestrator.ts:888-912</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Pre-loads PRODUCTION + SANDBOX credentials into Map</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">2</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">installNsGmCli()</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">orchestrator.ts:1408-1415</code>, <code style="font-size: 12px;">native-phase.ts:610-632</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">npm install -g ns-gm@1.0.5</code> in sandbox</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">3</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">switchNsGmForStep()</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">orchestrator.ts:1712-1787</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Writes PEM to <code style="font-size: 11px;">/tmp/nsgm-{runId}.pem</code>, runs ns-gm setup:ci/init/env</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; text-align: center; font-weight: 700;">4</td>
          <td style="padding: 8px 12px; font-weight: 600;"><code style="font-size: 12px;">runNsGmSetupAndValidateEnv()</code></td>
          <td style="padding: 8px 12px;"><code style="font-size: 12px;">native-phase.ts:439-523</code></td>
          <td style="padding: 8px 12px;">CLI setup commands inside sandbox</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Atomicity mechanism:</strong> All four paths are already guarded by the <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 13px;">platformConfig.workflow.nsGmCli</code> flag. Setting it to <code style="font-size: 13px;">false</code> in <code style="font-size: 13px;">platform-config.ts</code> disables all sandbox-side ns-gm paths simultaneously. The new server surfaces deploy in the same release.</p>
  </div>
</div>


<!-- ============================================================== -->
<!-- PART II: DECISIONS & TRADE-OFFS -->
<!-- ============================================================== -->

<div style="background: #1565c0; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 48px; text-align: center;">
  <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Part II</p>
  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700;">Decisions &amp; Trade-offs</p>
</div>


<!-- ============================================================== -->
<!-- 5. ARCHITECTURE DECISIONS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="architecture-decisions" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">5. Architecture Decisions</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    Ten key architecture decisions define the migration. Each card shows the decision, options considered, chosen approach, and key trade-off.
  </p>

  <!-- AD-1 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-1</span>
      <span style="font-weight: 700; font-size: 15px;">Route Structure: Both Surfaces Under /api/inspect/</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 13px;">POST /api/inspect/:repoId/netsuite</code> + <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 13px;">POST /api/inspect/:repoId/run</code></p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Rationale:</strong> Both surfaces share the same auth mechanism (inspection tokens), same middleware chain, and same auth validation. Governance differences (read-only check for inspect, none for run) are enforced in the handler layer. This avoids auth registration changes, CLI basePath overrides, or middleware duplication.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Auth simplicity vs semantic clarity (the &ldquo;inspect&rdquo; prefix hosts a write-capable surface)</p>
    </div>
  </div>

  <!-- AD-2 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-2</span>
      <span style="font-weight: 700; font-size: 15px;">Credential Model: Bridge NsGmCredential (Per-Org)</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> New handlers load credentials from existing <code style="font-size: 13px;">NsGmCredential</code> by orgId + environment, not via per-repo <code style="font-size: 13px;">RepositoryInspectionCredential</code></p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Rationale:</strong> NsGmCredential already stores all required data (accountId, clientId, certificateId, restletUrl, scope, encrypted privateKey) per org and environment. The existing settings UI manages these credentials. This yields <strong>zero client-side changes</strong>.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Zero client changes vs parallel credential-loading path (separate from per-repo loadDecryptedCredentialForType)</p>
    </div>
  </div>

  <!-- AD-3 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-3</span>
      <span style="font-weight: 700; font-size: 15px;">Environment Routing: nsEnv Token Claim (Cryptographic Enforcement)</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> Extend inspection token JWT with <code style="font-size: 13px;">nsEnv</code> claim set at issuance time per workflow step. Agent cannot forge or override the environment.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Routing logic preserved:</strong> <code style="font-size: 13px;">resolveNsGmCredentialEnvironmentForStep()</code> (scout/diagnosis &rarr; PRODUCTION, else &rarr; SANDBOX) moves into <code style="font-size: 13px;">configureInspectionForStep()</code>.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #dc3545;"><strong>Silent fallback eliminated:</strong> The current <code style="font-size: 13px;">switchNsGmForStep()</code> silently tries the other environment if the target is unavailable. After migration: explicit HTTP 400 failure. No silent fallback.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Cryptographic enforcement vs token complexity</p>
    </div>
  </div>

  <!-- AD-4 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-4</span>
      <span style="font-weight: 700; font-size: 15px;">OAuth2 Token Caching: In-Memory Map with 50min TTL</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> <code style="font-size: 13px;">Map&lt;string, { accessToken, expiresAt }&gt;</code> keyed by <code style="font-size: 13px;">${orgId}:${environment}</code>. 50min TTL with 5min safety buffer (tokens valid ~55min).</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Behavior:</strong> On 401 from RESTlet: evict cached token, retry once with fresh exchange. Periodic cleanup (5min) removes expired entries.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Simplicity (lost on restart, acceptable) vs cold-start latency (~1-2s for first query per org/env)</p>
    </div>
  </div>

  <!-- AD-5 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-5</span>
      <span style="font-weight: 700; font-size: 15px;">Inspect Endpoint: Single Endpoint with Type Discriminator</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> <code style="font-size: 13px;">POST /inspect/:repoId/netsuite</code> with body <code style="font-size: 13px;">{ type: 'query', query } | { type: 'logs', scriptId, ... }</code></p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Rationale:</strong> Mirrors the RESTlet&rsquo;s action-based dispatch. Both sub-modes share the same governance model (read-only by construction). Zod discriminated union validates the body.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Minimal routes vs slightly more complex Zod schema</p>
    </div>
  </div>

  <!-- AD-6 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #e67e22; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-6</span>
      <span style="font-weight: 700; font-size: 15px;">Run Endpoint: Arbitrary SuiteScript with Role-Bounded Governance</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> <code style="font-size: 13px;">POST /api/inspect/:repoId/run</code> with body <code style="font-size: 13px;">{ code: string, modules?: string[] }</code>. No <code style="font-size: 13px;">assertReadOnlyQuery</code>.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Trust model:</strong> The NetSuite role is the authoritative ceiling, but it is per-account, variable, and NOT guaranteed read-only. Helix governance: (a) credentials stay server-side, (b) output sanitized, (c) every execution audited with <code style="font-size: 13px;">SUITESCRIPT</code> type, (d) rate limited.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Role-bounded trust vs Helix-side constraint</p>
    </div>
  </div>

  <!-- AD-7 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-7</span>
      <span style="font-weight: 700; font-size: 15px;">NetSuite Client Service: Extract, Cache, and Invoke</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> New <code style="font-size: 13px;">netsuite-proxy-service.ts</code> with three exported functions: <code style="font-size: 13px;">executeNetsuiteQuery()</code>, <code style="font-size: 13px;">executeNetsuiteLogRetrieval()</code>, <code style="font-size: 13px;">executeNetsuiteScript()</code>.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Foundation:</strong> OAuth2 M2M token exchange extracted from <code style="font-size: 13px;">ns-gm-credential-test-service.ts</code> (already proven in production). PS256 JWT assertion via <code style="font-size: 13px;">jose</code> library. Built as a library/service, <strong>not</strong> shelling out to the ns-gm CLI.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Reuse proven code vs refactoring into a new module</p>
    </div>
  </div>

  <!-- AD-8 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-8</span>
      <span style="font-weight: 700; font-size: 15px;">Prisma Enum: Two Values &mdash; NETSUITE + SUITESCRIPT</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> Add both <code style="font-size: 13px;">NETSUITE</code> and <code style="font-size: 13px;">SUITESCRIPT</code> to <code style="font-size: 13px;">InspectionCredentialType</code> enum. Migration: trivial <code style="font-size: 13px;">ALTER TYPE ... ADD VALUE</code>.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Rationale:</strong> The two surfaces have fundamentally different governance models. Distinguishing them in audit is a security requirement: <code style="font-size: 13px;">NETSUITE</code> for safe reads vs <code style="font-size: 13px;">SUITESCRIPT</code> for arbitrary execution.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Audit granularity vs migration effort (trivial)</p>
    </div>
  </div>

  <!-- AD-9 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-9</span>
      <span style="font-weight: 700; font-size: 15px;">Manifest Enhancement: Add NETSUITE/SUITESCRIPT Types</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> In <code style="font-size: 13px;">configureInspectionForStep()</code>, check for NsGmCredential existence and add <code style="font-size: 13px;">NETSUITE</code> + <code style="font-size: 13px;">SUITESCRIPT</code> to each repo&rsquo;s <code style="font-size: 13px;">types</code> array in the manifest.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Rationale:</strong> The manifest is how agents discover available inspection types. Since NsGmCredential is per-org, every repo in the org is eligible.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Agent discovery vs manifest complexity</p>
    </div>
  </div>

  <!-- AD-10 -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #dc3545; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">AD-10</span>
      <span style="font-weight: 700; font-size: 15px;">Sandbox Removal: nsGmCli Flag Flip + Code Removal</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #343a40;"><strong>Chosen:</strong> Set <code style="font-size: 13px;">platformConfig.workflow.nsGmCli = false</code> for NETSUITE platform. All four sandbox-side paths are already guarded by this flag, so the flip is atomic.</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #495057;"><strong>Important:</strong> <code style="font-size: 13px;">credentials.nsGm</code> stays <code style="font-size: 13px;">true</code> &mdash; still needed for credential management and existence checks.</p>
      <p style="margin: 0; font-size: 13px; color: #868e96;"><strong>Trade-off:</strong> Atomic flag-based deployment vs staged rollout (flag is simpler and safer)</p>
    </div>
  </div>

  <!-- Summary Table -->
  <h3 id="decisions-summary-table" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Decision Summary</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Area</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Decision</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Key Trade-off</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Route structure</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Both under /api/inspect/</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Auth simplicity vs semantic clarity</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Credential model</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Bridge NsGmCredential per-org</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Zero client changes vs parallel credential path</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Environment routing</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Token-embedded nsEnv claim</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Cryptographic enforcement vs token complexity</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">OAuth2 caching</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">In-memory Map with 50min TTL</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Simplicity vs cold-start latency</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Inspect endpoint</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Single endpoint with type discriminator</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Minimal routes vs Zod complexity</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Run endpoint</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">No read-only check; role-bounded</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Role trust vs Helix constraint</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">NetSuite service</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Extract from credential-test-service</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code reuse vs new module</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Prisma enum</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">NETSUITE + SUITESCRIPT</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Audit granularity vs migration</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Manifest</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Add types when org has NsGm creds</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Discovery vs manifest complexity</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px;">Sandbox removal</td><td style="padding: 6px 12px;">nsGmCli flag flip + code removal</td><td style="padding: 6px 12px;">Atomic deployment vs staged rollout</td></tr>
      </tbody>
    </table>
  </div>
</div>


<!-- ============================================================== -->
<!-- 6. TRUST MODEL -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="trust-model" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">6. Trust Model</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    The trust model to encode: the NetSuite role is the authoritative ceiling, but it is per-account, variable, and NOT guaranteed (production read-only is best-practice and true today, not a platform invariant). Helix-side governance must stand on its own.
  </p>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;">
    <div style="flex: 1; min-width: 300px; background: white; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <span style="background: #4caf50; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">INSPECT</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">Safe by Construction</span>
      </div>
      <div style="background: #e8f5e9; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <p style="margin: 0; font-size: 13px; color: #343a40; font-weight: 600;">Helix-enforced guarantee (account-independent):</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #495057;">
          <li><code style="font-size: 12px;">assertReadOnlyQuery()</code> &mdash; SELECT-only validation before query reaches NetSuite</li>
          <li>200-row cap, 1MB size cap</li>
          <li>PEM/credential/URL redaction</li>
          <li>60 req/60s rate limiting</li>
          <li>Every query audited (type: NETSUITE)</li>
        </ul>
      </div>
      <p style="margin: 0; font-size: 13px; color: #495057;">The read-only guarantee is enforced by the server <strong>before</strong> any query reaches NetSuite. It does not depend on the NetSuite role being configured as read-only.</p>
    </div>
    <div style="flex: 1; min-width: 300px; background: white; border: 2px solid #e67e22; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <span style="background: #e67e22; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">RUN</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">Role-Bounded + Audited</span>
      </div>
      <div style="background: #fff3cd; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <p style="margin: 0; font-size: 13px; color: #343a40; font-weight: 600;">Helix-enforced governance:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #495057;">
          <li>Credentials stay server-side (never enter sandbox)</li>
          <li>Output passes sanitization (200-row, 1MB, redaction)</li>
          <li>Every execution audited (type: SUITESCRIPT)</li>
          <li>Rate limited (60 req/60s shared budget)</li>
        </ul>
      </div>
      <div style="background: #fff5f5; border-radius: 6px; padding: 12px;">
        <p style="margin: 0; font-size: 13px; color: #343a40; font-weight: 600;">Role-delegated ceiling:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #495057;">
          <li>The NetSuite integration user&rsquo;s role is the authoritative ceiling</li>
          <li>The role is per-account, variable, NOT guaranteed read-only</li>
          <li>Prod read-only is best practice, not a platform invariant</li>
          <li>Helix does NOT constrain the operation beyond the above</li>
        </ul>
      </div>
    </div>
  </div>

  <h3 id="environment-routing" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Environment Routing: Token-Bounded</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Property</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Before (Current)</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">After (Proposed)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">How env is selected</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Per-step ns-gm switching in orchestrator</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">nsEnv</code> claim in signed JWT (cryptographic)</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Who controls env</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Server sets, but agent could modify sandbox files</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Server sets; agent cannot forge signed JWT</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Default routing</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">scout/diagnosis = PROD, else = SANDBOX</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Same logic, bound into token at issuance</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">When target unavailable</td>
          <td style="padding: 10px 12px;">Silent fallback to other environment</td>
          <td style="padding: 10px 12px;"><strong>Explicit failure</strong> (HTTP 400)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


<!-- ============================================================== -->
<!-- 7. PROS AND CONS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="pros-and-cons" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">7. Pros and Cons</h2>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;">
    <!-- PROS -->
    <div style="flex: 1; min-width: 300px;">
      <div style="background: #4caf50; color: white; padding: 12px 20px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">Pros</div>
      <div style="background: #e8f5e9; border: 2px solid #4caf50; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
          <li style="margin-bottom: 12px;"><strong>Production credentials never enter sandbox</strong> &mdash; eliminates the CRITICAL Channel A exfiltration pathway entirely</li>
          <li style="margin-bottom: 12px;"><strong>All queries get full security pipeline</strong> &mdash; write-blocking, rate limiting, sanitization, secret redaction, and audit logging applied identically to SuiteQL and SuiteScript</li>
          <li style="margin-bottom: 12px;"><strong>Reuses proven architecture</strong> &mdash; the inspection proxy already governs db/logs/api; the host-agent on Sprites already demonstrates this exact pattern</li>
          <li style="margin-bottom: 12px;"><strong>Zero client UI changes</strong> &mdash; bridges existing per-org NsGmCredential model; no new credential configuration surface needed</li>
          <li style="margin-bottom: 12px;"><strong>Consistent <code style="font-size: 13px;">hlx inspect</code> interface</strong> &mdash; agents use the same CLI pattern for all data access: db, logs, api, netsuite</li>
          <li style="margin-bottom: 12px;"><strong>OAuth2 M2M already implemented server-side</strong> &mdash; the core token exchange code exists in <code style="font-size: 13px;">ns-gm-credential-test-service.ts</code></li>
          <li style="margin-bottom: 12px;"><strong>Enables future domain allowlist</strong> &mdash; the &ldquo;second 90% change&rdquo; from RSH-633 becomes viable once credentials are server-side</li>
          <li style="margin-bottom: 12px;"><strong>Zero new dependencies</strong> &mdash; <code style="font-size: 13px;">jose</code> already in package.json, <code style="font-size: 13px;">fetch</code> is built-in</li>
          <li style="margin-bottom: 0;"><strong>Cryptographic environment routing</strong> &mdash; nsEnv token claim eliminates silent credential fallback</li>
        </ul>
      </div>
    </div>
    <!-- CONS -->
    <div style="flex: 1; min-width: 300px;">
      <div style="background: #dc3545; color: white; padding: 12px 20px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px;">Cons</div>
      <div style="background: #fff5f5; border: 2px solid #dc3545; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
          <li style="margin-bottom: 12px;"><strong>Adds server hop latency</strong> &mdash; ~500ms&ndash;2s per query (cached token), 2&ndash;4s cold start. Previously zero server hop for ns-gm queries</li>
          <li style="margin-bottom: 12px;"><strong>Requires Prisma migration</strong> &mdash; though trivial: one <code style="font-size: 13px;">ALTER TYPE ... ADD VALUE</code> statement</li>
          <li style="margin-bottom: 12px;"><strong>Atomic deployment required</strong> &mdash; both server surfaces + sandbox removal must deploy together; partial deployment leaves agents without NetSuite access</li>
          <li style="margin-bottom: 12px;"><strong>Token caching adds complexity</strong> &mdash; in-memory Map with TTL management, error-triggered eviction, periodic cleanup (though minimal)</li>
          <li style="margin-bottom: 12px;"><strong>SuiteQL-only for MVP inspect</strong> &mdash; saved search and record CRUD via inspect are deferred to Round 2</li>
          <li style="margin-bottom: 12px;"><strong>Shared rate limit budget</strong> &mdash; 60 req/60s shared across ALL inspection types (db + logs + api + netsuite + run)</li>
          <li style="margin-bottom: 12px;"><strong>Parallel credential-loading path</strong> &mdash; NsGmCredential is per-org vs existing InspectionCredential per-repo; separate lookup code needed</li>
          <li style="margin-bottom: 0;"><strong>hlx run does not constrain operations</strong> &mdash; safety depends on the NetSuite role being properly configured per-account (which is best practice but not guaranteed)</li>
        </ul>
      </div>
    </div>
  </div>

  <div style="background: #e3f2fd; border: 1px solid #1565c0; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #0d47a1;"><strong>Assessment:</strong> The cons are manageable or trivially mitigated. Latency adds 1&ndash;2s per query but agents already tolerate multi-second tool calls. The atomic deployment requirement is solved by the <code style="font-size: 13px;">nsGmCli</code> flag mechanism. The shared rate limit can be upgraded to per-type limits in Round 2 if usage patterns warrant it. The critical security gains &mdash; eliminating uncontrolled production credential access &mdash; far outweigh the operational trade-offs.</p>
  </div>
</div>


<!-- ============================================================== -->
<!-- PART III: EXECUTION -->
<!-- ============================================================== -->

<div style="background: #1a1a2e; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 48px; text-align: center;">
  <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Part III</p>
  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700;">Execution</p>
</div>


<!-- ============================================================== -->
<!-- 8. EFFORT ESTIMATE -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="effort-estimate" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">8. Effort Estimate</h2>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Category</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">helix-global-server</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">helix-cli</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">New code</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">~1 file (netsuite-proxy-service.ts: OAuth2 cache + 3 RESTlet methods)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">2 files (src/inspect/netsuite.ts ~20 lines, src/run/index.ts ~30 lines)</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Modified code</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">~7 files (controller, routes, session, middleware, orchestrator, native-phase, platform-config)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">2 files (inspect/index.ts + index.ts)</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Removed code</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">~3 code paths (credential cache, ns-gm install, ns-gm switching)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">None</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Migration</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">1 Prisma migration (ALTER TYPE ADD VALUE)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">None</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Tests</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">platform-config.test.ts assertion update</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">None needed (zero runtime deps; existing test pattern)</td>
        </tr>
        <tr style="background: #e3f2fd;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Complexity</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">MEDIUM</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">LOW</span></td>
        </tr>
        <tr style="background: #e8f5e9;">
          <td style="padding: 10px 12px; font-weight: 700;">Total files</td>
          <td style="padding: 10px 12px;">~12 files</td>
          <td style="padding: 10px 12px;">~4 files</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total Estimate</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;"><strong>~16 files across 2 repos. Estimated 2&ndash;3 days</strong> development + testing. helix-global-server must be complete before helix-cli can be tested against real endpoints. The OAuth2 M2M pattern is already proven; the proxy pattern is well-established; the CLI handler follows a 12-line template.</p>
  </div>

  <h3 id="performance-expectations" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Performance Expectations</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Metric</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Expected</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Basis</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Query latency (cached token)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">500ms &ndash; 2s</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Single HTTP roundtrip to NetSuite RESTlet</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Query latency (cold start)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">2 &ndash; 4s</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">OAuth2 token exchange (~1-2s) + RESTlet query (~1-2s)</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Token cache hit rate</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">&gt;95%</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Tokens valid ~50min; steps run 5-15min with multiple queries</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Max response size</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">1MB, 200 rows</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">sanitizeInspectionResult() caps, applied to both surfaces</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">OAuth2 timeout</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">15s</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">AbortSignal.timeout matching credential test service</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; font-weight: 600;">RESTlet timeout</td><td style="padding: 8px 12px;">25s</td><td style="padding: 8px 12px;">Leaves ~5s headroom within CLI&rsquo;s 30s hxFetch timeout</td></tr>
      </tbody>
    </table>
  </div>
</div>


<!-- ============================================================== -->
<!-- 9. IMPLEMENTATION ROADMAP -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="implementation-roadmap" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">9. Implementation Roadmap</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    Seven ordered steps with clear dependencies. Steps 1&ndash;5 are on helix-global-server, step 6 on helix-cli, step 7 ties them together.
  </p>

  <!-- Steps as cards -->
  <div style="position: relative; margin-bottom: 24px;">
    <!-- Step 1 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #1565c0; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #1565c0; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">1</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">Prisma Schema + Migration</span>
        <span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">helix-global-server</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">Add <code style="font-size: 13px;">NETSUITE</code> and <code style="font-size: 13px;">SUITESCRIPT</code> to <code style="font-size: 13px;">InspectionCredentialType</code> enum. Generate migration file. Prerequisite for audit logging.</p>
    </div>

    <!-- Step 2 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #1565c0; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #1565c0; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">2</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">NetSuite Client Service + OAuth2 Cache</span>
        <span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">helix-global-server</span>
        <span style="font-size: 12px; color: #868e96;">depends on Step 1</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">New <code style="font-size: 13px;">netsuite-proxy-service.ts</code>: extract OAuth2 M2M from credential-test-service, add in-memory cache with 50min TTL, implement three RESTlet invocation methods. Built as a library/service, NOT shelling out to ns-gm CLI.</p>
    </div>

    <!-- Step 3 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #1565c0; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #1565c0; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">3</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">Controller Handlers + Routes</span>
        <span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">helix-global-server</span>
        <span style="font-size: 12px; color: #868e96;">depends on Step 2</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">New handlers: <code style="font-size: 13px;">postInspectNetsuite</code> (SuiteQL + logs with assertReadOnlyQuery) and <code style="font-size: 13px;">postRunSuitescript</code> (no read-only check). Register routes with existing inspection middleware chain.</p>
    </div>

    <!-- Step 4 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #1565c0; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #1565c0; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">4</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">Token + Manifest Extensions</span>
        <span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">helix-global-server</span>
        <span style="font-size: 12px; color: #868e96;">parallel with Steps 2&ndash;3</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">Add <code style="font-size: 13px;">nsEnv</code> claim to inspection token. Extend <code style="font-size: 13px;">configureInspectionForStep()</code> to resolve environment and add NETSUITE/SUITESCRIPT to manifest types.</p>
    </div>

    <!-- Step 5 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #dc3545; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #dc3545; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">5</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">Sandbox-Side Removal + Platform Config</span>
        <span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">helix-global-server</span>
        <span style="font-size: 12px; color: #868e96;">depends on Steps 2&ndash;4</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">Set <code style="font-size: 13px;">nsGmCli: false</code>. Remove nsGmCredentialCache, installNsGmCli(), switchNsGmForStep(), runNsGmSetupAndValidateEnv(). Update tests.</p>
    </div>

    <!-- Step 6 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #4caf50; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #4caf50; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">6</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">CLI Subcommands</span>
        <span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">helix-cli</span>
        <span style="font-size: 12px; color: #868e96;">depends on Step 3</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">New <code style="font-size: 13px;">src/inspect/netsuite.ts</code> handler, <code style="font-size: 13px;">src/run/index.ts</code> handler. Add dispatch cases in inspect router and main dispatcher. Update help text.</p>
    </div>

    <!-- Step 7 -->
    <div style="background: white; border: 1px solid #dee2e6; border-left: 4px solid #7b1fa2; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="background: #7b1fa2; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">7</span>
        <span style="font-weight: 700; font-size: 15px; color: #343a40;">End-to-End Verification</span>
        <span style="background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Both repos</span>
        <span style="font-size: 12px; color: #868e96;">depends on Steps 5&ndash;6</span>
      </div>
      <p style="margin: 0; font-size: 14px; color: #495057;">Verify: SuiteQL queries through proxy, script logs retrieval, SuiteScript execution, write-blocking, rate limiting, audit logging, environment routing, no PEM in sandbox, existing inspect db/logs/api unchanged.</p>
    </div>
  </div>

  <div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #495057;"><strong>Dependency summary:</strong> Steps 1 &rarr; 2 &rarr; 3 (sequential server pipeline). Step 4 can run in parallel with Steps 2&ndash;3. Step 5 depends on 2&ndash;4. Step 6 (CLI) depends on Step 3 (server endpoints). Step 7 (verification) depends on everything.</p>
  </div>
</div>


<!-- ============================================================== -->
<!-- 10. VERIFICATION & SUCCESS CRITERIA -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="verification-and-success-criteria" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">10. Verification &amp; Success Criteria</h2>

  <h3 id="success-criteria" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Success Criteria</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #4caf50; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #4caf50; color: white; font-weight: 600;">Criterion</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-1</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">hlx inspect netsuite</code> executes SuiteQL queries through the server proxy with SELECT-only validation, sanitization, rate limiting, and audit &mdash; safety holds regardless of account&rsquo;s NetSuite role</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-2</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">hlx inspect netsuite</code> retrieves NetSuite script logs through the server proxy with sanitization, rate limiting, and audit</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-3</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">hlx run</code> executes arbitrary SuiteScript through the server proxy with output sanitization, rate limiting, and audit &mdash; ceiling delegated to account&rsquo;s NetSuite role</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-4</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Production NetSuite credentials (PEM, accountId, clientId, certificateId) never enter the sandbox</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-5</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">nsEnv token claim binds environment at issuance; explicit failure replaces silent fallback when target env credential unavailable</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-6</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">All four sandbox-side ns-gm paths removed atomically with server surfaces landing</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-7</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Existing <code style="font-size: 12px;">hlx inspect db/logs/api</code> functionality unchanged</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-8</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">nsGmCli</code> platform config flag set to false for NETSUITE; tests updated</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-9</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Prisma schema migration committed with NETSUITE and SUITESCRIPT enum values</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SC-10</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Inspection manifest includes NETSUITE type for orgs with NsGmCredential; configureInspectionForStep adds netsuite to available types</td></tr>
        <tr><td style="padding: 8px 12px; text-align: center; font-weight: 600;">SC-11</td><td style="padding: 8px 12px;">Tokens issued without nsEnv claim continue to function for existing db/logs/api inspection &mdash; backward compatibility preserved</td></tr>
      </tbody>
    </table>
  </div>

  <h3 id="user-scenarios" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Key User Scenarios</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">ID</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Scenario</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Expected Outcome</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-01</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">SuiteQL query during scout step (PRODUCTION)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">JSON result with sanitized rows; query audited</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-02</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Script log retrieval with filters</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Log entries returned as JSON; sanitized and capped</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-03</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">SuiteScript execution during implementation (SANDBOX)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Script executes against sandbox NetSuite; result sanitized</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-04</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Write attempt via inspect (UPDATE query)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Server rejects before reaching NetSuite</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-05</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Missing SANDBOX credential during implementation</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Explicit failure; NO silent fallback to PRODUCTION</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-06</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Rate limit exceeded (&gt;60 req/60s)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Rate-limit error response; earlier requests succeed</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-07</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Query result contains PEM or credential-like string</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Credential patterns redacted by sanitizeOutput before returning to agent</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-08</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">SuiteQL query loaded from file (<code style="font-size: 12px;">--query-file</code>)</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">File contents read and sent as query; multi-line SQL preserved</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-09</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">New workflow run starts on NETSUITE platform</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">No PEM file written; no ns-gm CLI installed</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-10</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Existing db/logs/api inspection commands</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Results identical to pre-migration behavior</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-11</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">SuiteQL query returns &gt;200 rows</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Result capped at 200 rows / 1MB; truncation metadata included in response</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">SCN-12</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Any NetSuite inspection or run request completes</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Audit record created with NETSUITE or SUITESCRIPT type, repoId, orgId, and request metadata</td></tr>
        <tr><td style="padding: 8px 12px; text-align: center; font-weight: 600;">SCN-13</td><td style="padding: 8px 12px;">Token without nsEnv claim used for db/logs/api inspection</td><td style="padding: 8px 12px;">Inspection functions normally; nsEnv is only required for netsuite/run surfaces</td></tr>
      </tbody>
    </table>
  </div>

  <h3 id="technical-checks" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Technical Verification Checks</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 8px 12px; background: #1565c0; color: white; font-weight: 600;">ID</th>
          <th style="text-align: left; padding: 8px 12px; background: #1565c0; color: white; font-weight: 600;">Check</th>
          <th style="text-align: left; padding: 8px 12px; background: #1565c0; color: white; font-weight: 600;">Method</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-01</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Production credentials never enter sandbox</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: no PEM write, no installNsGmCli active, nsGmCli=false</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-02</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">hlx inspect netsuite passes full read-only pipeline</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: assertReadOnlyQuery + sanitize + rate limit + audit</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-03</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">hlx run skips read-only but applies output governance</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: no assertReadOnlyQuery, yes sanitize + audit</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-04</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">nsEnv claim is cryptographically enforced</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: nsEnv in JWT payload, not in request body</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-05</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Audit distinguishes NETSUITE from SUITESCRIPT</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: Prisma enum + audit calls with correct type</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-06</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">No silent credential fallback</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: no catch-retry-other-env pattern</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 600;">TCK-07</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">OAuth2 tokens cached with TTL</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Code inspection: Map with TTL, eviction logic, cleanup</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; text-align: center; font-weight: 600;">TCK-08</td><td style="padding: 6px 12px;">Manifest includes NETSUITE/SUITESCRIPT types</td><td style="padding: 6px 12px;">Code inspection: configureInspectionForStep adds types</td></tr>
      </tbody>
    </table>
  </div>
</div>


<!-- ============================================================== -->
<!-- 11. OPEN QUESTIONS & RISKS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="open-questions-and-risks" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">11. Open Questions &amp; Risks</h2>

  <h3 id="open-questions" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Open Questions</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #e67e22; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #e67e22; color: white; font-weight: 600;">Question</th>
          <th style="text-align: left; padding: 10px 12px; background: #e67e22; color: white; font-weight: 600;">Current Position</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">OQ-1</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">SuiteQL write-blocking coverage</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">assertReadOnlyQuery blocks 11 SQL keywords + CTE-wrapped writes. SuiteQL may have NetSuite-specific mutations not covered. Low risk since SuiteQL is designed as a read-only analytics language.</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">OQ-2</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Token caching and credential rotation</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Initial cache keys by orgId:env. Credential rotation mid-session would require version-aware keys. Deferred to Round 2 &mdash; rotation is rare and cache eviction on 401 handles it.</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">OQ-3</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Atomic deployment coordination</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">The nsGmCli flag provides atomic toggling within helix-global-server. Cross-repo coordination (CLI + server) requires same release. Feature flags could provide additional safety.</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">OQ-4</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">hlx run parameter design</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">MVP: code + modules. Future consideration: --params for JSON input, --timeout for execution limits. Can be added without breaking changes.</td></tr>
        <tr><td style="padding: 8px 12px; text-align: center; font-weight: 700;">OQ-5</td><td style="padding: 8px 12px; font-weight: 600;">Shared vs per-type rate limits</td><td style="padding: 8px 12px;">MVP uses shared 60 req/60s budget across all inspection types. May need separate limits as NetSuite usage scales. Easy to upgrade.</td></tr>
      </tbody>
    </table>
  </div>

  <h3 id="deferred-items" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Deferred to Round 2</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 8px 12px; background: #868e96; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 8px 12px; background: #868e96; color: white; font-weight: 600;">Item</th>
          <th style="text-align: left; padding: 8px 12px; background: #868e96; color: white; font-weight: 600;">Rationale for Deferral</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">1</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Domain allowlist via sandbox.update({ networkPolicy })</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Second P0 security change (RSH-633). Separate initiative.</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">2</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Multi-agent zone architecture (hot/warm/cold)</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">P1 priority. Separate orchestrator rearchitecture.</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">3</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Human CLI --env flag</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Future consideration for non-agent users.</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">4</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Per-repo NETSUITE credential type</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">If different repos need different NetSuite accounts.</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">5</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Granular rate limits</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Separate limits for inspect vs run, or per-org limits.</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">6</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Content-aware DLP</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">NLP-based filtering of sensitive data in NetSuite results.</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">7</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Audit logging hardening</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Migration from fire-and-forget to persistent/tamper-evident audit.</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; text-align: center;">8</td><td style="padding: 6px 12px; font-weight: 600;">Token caching refinement</td><td style="padding: 6px 12px;">Credential-version-aware cache keys for rotation scenarios.</td></tr>
      </tbody>
    </table>
  </div>

  <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 20px 24px; border-radius: 0 8px 8px 0;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Key Risk Mitigation</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">The ns-gm server-side migration is necessary but not sufficient. It eliminates Channel A (direct credential access) but the agent still receives sanitized production data (up to 200 rows per query). Full 90/10 security requires this migration <strong>plus</strong> the domain allowlist (Deferred Item 1). The multi-agent zone architecture (Deferred Item 2) provides the strongest isolation by ensuring production data and internet egress never coexist in the same agent instance.</p>
  </div>
</div>


<!-- ============================================================== -->
<!-- 12. APPENDIX: EVIDENCE SOURCES -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="appendix-evidence-sources" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">12. Appendix: Evidence Sources</h2>

  <h3 id="artifact-inputs-used" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Artifact Inputs Used</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Artifact</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Repo</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Why Used</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Key Takeaway</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">ticket.md (RSH-633 Research Report)</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">library</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Primary specification and design language</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Two changes achieve 90% security value; migration DECIDED</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">ticket.md (Continuation Context)</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">library</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Refined two-surface governance model</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Decomposition framing; inspect = safe by construction; run = role-bounded; nsEnv; trust model</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">scout/scout-summary.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-global-server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Architecture analysis + file inventory</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Two credential channels; 15 relevant files; OAuth2 M2M proven</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">scout/scout-summary.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-cli</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">CLI extension pattern analysis</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">4 existing subcommands; 12-line handler pattern; zero deps</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">diagnosis/diagnosis-statement.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-global-server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Root cause + detailed change mapping</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Architectural gap; 7 change areas; 4 removal targets; OAuth2 M2M proven</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">diagnosis/diagnosis-statement.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-cli</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">CLI change scope</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Two new commands; no auth/config changes; db.ts template</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">product/product.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-global-server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Product requirements + scenarios</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">9 success criteria; 12 scenarios; 7 open questions</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">tech-research/tech-research.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-global-server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Architecture decisions + technical checks</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">10 decisions with options/rationale; 8 technical checks; performance expectations</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">tech-research/tech-research.md</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">helix-cli</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">CLI architecture decisions</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">5 decisions; 5 technical checks; interface design</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; font-weight: 600;">repo-guidance.json</td><td style="padding: 6px 12px;">library (shared)</td><td style="padding: 6px 12px;">Repo intent mapping</td><td style="padding: 6px 12px;">server=target, cli=target, client=context, library=context</td></tr>
      </tbody>
    </table>
  </div>

  <h3 id="key-codebase-files" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Key Codebase Evidence</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">File</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Repo</th>
          <th style="text-align: left; padding: 8px 12px; background: #1a1a2e; color: white; font-weight: 600;">Key Evidence</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">ns-gm-credential-test-service.ts:17-61</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Complete OAuth2 M2M token exchange (PS256 JWT via jose)</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">inspection-proxy-service.ts:46-61</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">assertReadOnlyQuery (11 keywords + CTE detection)</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">inspection-sanitizer.ts:7-49</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">200-row cap, 1MB cap, 3 redaction patterns</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">orchestrator.ts:1712-1787</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">switchNsGmForStep with silent fallback (removal target)</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">session.ts:91-120</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">issueInspectionToken (no nsEnv claim exists)</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">schema.prisma:103-107</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">InspectionCredentialType enum (3 values, needs 2 more)</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">credentials.ts:1-14</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">resolveNsGmCredentialEnvironmentForStep (scout/diagnosis=PROD)</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">host-agent-service.ts</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">server</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">Architectural precedent (Sprites MCP run_helix_cli)</td></tr>
        <tr><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">src/inspect/db.ts</code></td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">cli</td><td style="padding: 6px 12px; border-bottom: 1px solid #e9ecef;">12-line handler template for new netsuite handler</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 6px 12px;"><code style="font-size: 11px;">src/lib/http.ts:37-130</code></td><td style="padding: 6px 12px;">cli</td><td style="padding: 6px 12px;">hxFetch: basePath=/api/inspect, dual-mode auth, 3-attempt retry</td></tr>
      </tbody>
    </table>
  </div>

  <h3 id="external-references" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">External References</h3>

  <div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px 20px;">
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
      <li style="margin-bottom: 6px;">OWASP Top 10 for Agentic AI (2026) &mdash; ASI05: Sandboxing and Network Controls</li>
      <li style="margin-bottom: 6px;">Meta &ldquo;Rule of Two&rdquo; (2026) &mdash; Agent must satisfy at most two of three properties</li>
      <li style="margin-bottom: 6px;">NVIDIA Agent Security Guidelines &mdash; Credential-free agent runtimes</li>
      <li style="margin-bottom: 6px;">Vercel Sandbox Documentation &mdash; sandbox.update({ networkPolicy }) API</li>
      <li style="margin-bottom: 0;">RSH-633 Security Assessment (May 2026) &mdash; Hot Sandbox Architecture, Multi-Agent Zone Architecture</li>
    </ul>
  </div>
</div>


<!-- ============================================================== -->
<!-- FOOTER -->
<!-- ============================================================== -->
<div style="border-top: 4px solid #1a1a2e; padding-top: 24px; margin-top: 48px;">
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background: #1565c0; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">RSH-636</span>
        <span style="font-weight: 700; color: #1a1a2e; font-size: 14px;">ns-gm Decomposition Report</span>
      </div>
      <p style="margin: 0; font-size: 13px; color: #868e96;">June 2026 &middot; Confidential &middot; Companion to RSH-633 Security Assessment</p>
    </div>
    <div style="text-align: right;">
      <p style="margin: 0; font-size: 12px; color: #868e96;">Prepared by Helix Research</p>
      <p style="margin: 0; font-size: 12px; color: #868e96;">All claims evidence-backed from codebase analysis</p>
    </div>
  </div>
</div>

</div>
</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-07T00:02:00.773Z) [Agent]: Your changes are ready! Updated 3 repositories.
- **Usher** (2026-06-07T04:46:11.328Z) [Helix]: @Helix is this ready
- **Helix** (2026-06-07T04:46:19.353Z) [Agent]: Yes! The ticket is in **Preview Ready** status. The last run succeeded and changes have been made across three repositories:

- **helix-global-server**
- **helix-cli**
- **helix-global-client**

All on the `helix/build/BLD-693-build-ns-gm-server-side-decomposition-hlx-inspect` branch. You should be good to review the preview!
- **Helix** (2026-06-07T05:16:39.617Z) [Agent]: Got it — let me look into this right away. I'll get back with my understanding in a few minutes.
- **Helix** (2026-06-07T05:34:01.683Z) [Agent]: Got it — let me look into this right away. I'll get back with my understanding in a few minutes.

## Continuation Context
Let's see some examples in real life. Do a comprehensive panel
