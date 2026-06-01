# Ticket Context

- ticket_id: cmpuhh5st00ap6a0ux1ym5nhc
- short_id: RSH-636
- run_id: cmpuhh5t100au6a0u3eczok8b
- run_branch: helix/research/RSH-636-moving-ns-gm-to-server-and-access-with-hlx-inspect
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Moving ns-gm to server and access with hlx inspect

## Description
What would it look like to do this? NSGM is really powerful but as outlined in this last report it would be better if these sandboxes had access to a inspect where they can pass the same parameters, get the same information, but it can be controlled through the server. What would this look like? What are the pros and cons? What kind of effort would it take? You can start mapping it out on a high level.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Security Assessment: Hot Sandbox Architecture — Helix NetSuite — Multi-Agent Zone Architecture</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background-color: #f8f9fa; line-height: 1.6;">

<div style="max-width: 90%; margin: 0 auto; padding: 40px 20px;">

<!-- Report Header -->
<div style="border-bottom: 4px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 40px;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
    <span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Security Assessment</span>
    <span style="background: #1a1a2e; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">RSH-633</span>
    <span style="background: #1565c0; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">Multi-Agent Zone Architecture</span>
  </div>
  <h1 id="security-assessment-hot-sandbox-architecture" style="font-size: 32px; margin: 16px 0 8px 0; color: #1a1a2e; font-weight: 700;">Security Assessment: Hot Sandbox Architecture</h1>
  <p style="font-size: 20px; color: #495057; margin: 0 0 8px 0;">Helix NetSuite Production Data Access in Ephemeral Sandboxes</p>
  <p style="font-size: 14px; color: #868e96; margin: 0;">May 2026 &middot; Prepared for Leadership &middot; Confidential &middot; Multi-Agent Zone Architecture Edition</p>
</div>

<!-- Table of Contents -->
<div style="background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 40px;">
  <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 16px 0; color: #495057; font-weight: 600;">Contents</h2>
  <div style="display: flex; gap: 40px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 280px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #1a1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Part I: Current Assessment</p>
      <ol style="margin: 0 0 20px 0; padding-left: 24px;">
        <li style="margin-bottom: 6px;"><a href="#executive-summary" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Executive Summary</a></li>
        <li style="margin-bottom: 6px;"><a href="#current-architecture" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Current Architecture</a></li>
        <li style="margin-bottom: 6px;"><a href="#existing-security-controls" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Existing Security Controls</a></li>
        <li style="margin-bottom: 6px;"><a href="#security-gaps-and-exfiltration-pathways" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Security Gaps &amp; Exfiltration Pathways</a></li>
        <li style="margin-bottom: 6px;"><a href="#industry-strategies" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Industry Strategies</a></li>
      </ol>
    </div>
    <div style="flex: 1; min-width: 280px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #1565c0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Part II: Deep-Dive Analysis</p>
      <ol start="6" style="margin: 0 0 20px 0; padding-left: 24px;">
        <li style="margin-bottom: 6px;"><a href="#sandbox-provider-comparison" style="color: #1565c0; text-decoration: none; font-weight: 500;">Sandbox Provider Comparison</a></li>
        <li style="margin-bottom: 6px;"><a href="#nsgm-to-server-migration" style="color: #1565c0; text-decoration: none; font-weight: 500;">NSGM-to-Server Migration</a></li>
        <li style="margin-bottom: 6px;"><a href="#egress-control-taxonomy" style="color: #1565c0; text-decoration: none; font-weight: 500;">Egress Control Taxonomy</a></li>
        <li style="margin-bottom: 6px;"><a href="#the-memory-problem" style="color: #1565c0; text-decoration: none; font-weight: 500;">The Memory Problem</a></li>
        <li style="margin-bottom: 6px;"><a href="#multi-agent-zone-architecture" style="color: #1565c0; text-decoration: none; font-weight: 500;">Multi-Agent Zone Architecture</a></li>
      </ol>
    </div>
    <div style="flex: 1; min-width: 280px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #495057; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Part III: Recommendations</p>
      <ol start="11" style="margin: 0 0 0 0; padding-left: 24px;">
        <li style="margin-bottom: 6px;"><a href="#helix-specific-recommendations" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Helix-Specific Recommendations</a></li>
        <li style="margin-bottom: 6px;"><a href="#limitations-and-open-questions" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Limitations &amp; Open Questions</a></li>
        <li style="margin-bottom: 6px;"><a href="#appendix-evidence-sources" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">Appendix: Evidence Sources</a></li>
      </ol>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- PART I: CURRENT ASSESSMENT -->
<!-- ============================================================== -->

<!-- ============================================================== -->
<!-- 1. EXECUTIVE SUMMARY -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="executive-summary" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">1. Executive Summary</h2>

  <div style="background: linear-gradient(135deg, #fff5f5, #fff0f0); border-left: 5px solid #dc3545; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #dc3545; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Key Finding</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">Helix's "hot" sandboxes &mdash; ephemeral execution environments with production NetSuite access &mdash; currently combine <strong>full production read access</strong> to the entire NetSuite account with <strong>unrestricted internet egress</strong>. This creates an uncontrolled data exfiltration pathway. An agent running in a scout or diagnosis step can query any production data (customers, financials, transactions) and transmit it to any external endpoint.</p>
  </div>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    This is not a bug in any single component. It is an <strong>architectural gap</strong> where two independently reasonable design decisions &mdash; injecting production credentials so agents can inspect real data, and providing internet access so agents can use external tools &mdash; combine to create a risk that falls below the industry baseline. The gap violates the <strong>"Rule of Two"</strong> (Meta, 2026): an agent must satisfy at most two of three properties &mdash; processing untrusted inputs, accessing sensitive data, and communicating externally. Today's hot sandboxes do all three.
  </p>

  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Five Deep-Dive Areas</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">This edition investigates five areas directed by leadership: <strong>(1)</strong> sandbox provider comparison across Vercel, Sprites.dev, Cloudflare, and E2B; <strong>(2)</strong> the decided NSGM-to-server migration; <strong>(3)</strong> an egress control taxonomy with the <strong>90/10 strategy</strong> &mdash; two changes that eliminate both critical threat channels; <strong>(4)</strong> the memory problem &mdash; reframed for the multi-agent model where LLM context is solved by design; and <strong>(5)</strong> the <strong>multi-agent zone architecture</strong> &mdash; where each security zone is a separate agent instance connected only by sanitized artifacts.</p>
  </div>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    The primary security architecture is <strong>multi-agent zone chaining</strong>: production access and internet egress never coexist in the same agent instance. A hot agent queries production data and builds a synopsis. That synopsis is sanitized. A new warm agent &mdash; with no production access but domain-allowlisted egress &mdash; gathers information from the internet. Then a new hot agent picks up where the first left off, with both production access and the gathered information, to finish the job. Each zone transition destroys the prior agent's LLM context. Artifacts are the only bridge between zones.
  </p>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    Two changes achieve 90% of the security value: <strong>(1)</strong> moving ns-gm to a server-side proxy (decided) so production credentials never enter the sandbox, and <strong>(2)</strong> applying a domain allowlist via <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 14px;">sandbox.update({ networkPolicy })</code> so the sandbox can only reach approved services. These are low-effort changes using capabilities already available in the Vercel Sandbox platform.
  </p>

  <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">The Warm Zone: An Interim Strategy</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">The warm zone is <strong>never an end state</strong>. It is an interim stage: a separate agent instance that has no production access but can reach the internet to gather information. Work finishes in a subsequent hot zone. The warm zone exists because automated sanitization was applied to artifacts from a hot zone &mdash; <em>"Human never reviewed this. We don't know for sure that it's safe but we ran some sanitization process through it."</em> Automated sanitization = warm. Human review = cold. This is definitional.</p>
  </div>

  <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 20px 24px; margin-bottom: 0;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Bottom Line</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">Multi-agent temporal separation achieves Rule of Two compliance &mdash; production data and internet egress never coexist in the same agent instance. Two changes <strong>(1)</strong> server-side ns-gm (decided) and <strong>(2)</strong> domain allowlist via <code style="background: #d4edda; padding: 2px 6px; border-radius: 3px; font-size: 14px;">sandbox.update({ networkPolicy })</code> eliminate both CRITICAL exfiltration channels. The warm zone is an interim strategy for gathering internet information between hot zone phases. The residual risk &mdash; business data in sanitized artifacts &mdash; is bounded by data minimization, volume caps, and the user's principle: <em>"I write some synopsis that we can sanitize as the worst-case scenario if this leaks, it's not the end of the world."</em></p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 2. CURRENT ARCHITECTURE -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="current-architecture" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">2. Current Architecture</h2>

  <h3 id="what-is-a-hot-sandbox" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">What Is a "Hot" Sandbox?</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    A "hot" sandbox is an ephemeral execution environment that has access to production data. In Helix's case, sandboxes running <strong>scout</strong> and <strong>diagnosis</strong> steps receive production NetSuite credentials, giving the agent read-only access to the entire NetSuite account. We call these "hot" because they hold live production data access, as opposed to "cold" sandboxes (implementation, verification, deploy steps) that only receive sandbox-environment credentials.
  </p>

  <h3 id="sandbox-lifecycle" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Sandbox Lifecycle</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; border-radius: 4px 0 0 0; font-weight: 600;">Phase</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Description</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; border-radius: 0 4px 0 0; font-weight: 600;">Key Detail</th>
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
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Both PRODUCTION and SANDBOX NS-GM credentials pre-loaded at run start</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Cached in memory; selected per-step</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Credential Injection</td>
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
    <!-- Channel A: ns-gm CLI -->
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
    <!-- Channel B: Inspection Proxy -->
    <div style="flex: 1; min-width: 280px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #4caf50; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">CONTROLLED</span>
        <span style="font-weight: 700; font-size: 16px; color: #343a40;">Channel B: Inspection Proxy</span>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 6px;"><strong>Server-mediated</strong> &mdash; queries routed through Helix server</li>
        <li style="margin-bottom: 6px;"><strong>Credentials never leave</strong> the server process</li>
        <li style="margin-bottom: 6px;"><strong>Write-blocking</strong> (INSERT, UPDATE, DELETE, etc. blocked)</li>
        <li style="margin-bottom: 6px;">Rate limiting (60 req/60s), audit logging, result sanitization</li>
        <li style="margin-bottom: 0;">Row limits (200 rows), response size cap (1MB)</li>
      </ul>
    </div>
  </div>

  <h3 id="credential-routing-logic" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Credential Routing Logic</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    The system routes credentials based on the current workflow step. This routing is the gate that determines which sandboxes become "hot":
  </p>

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
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Full account read access via "restlets" scope</td>
        </tr>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Diagnosis</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">PRODUCTION</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #dc3545;">Yes</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Full account read access via "restlets" scope</td>
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

  <h3 id="architecture-flow" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Architecture Flow</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 12px;">
    <div style="font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; color: #343a40;">
      <div style="text-align: center; margin-bottom: 4px;">
        <span style="background: #e9ecef; padding: 6px 16px; border-radius: 4px; font-weight: 700;">Helix Global Server (Orchestrator)</span>
      </div>
      <div style="text-align: center; color: #868e96;">&darr; Creates sandbox &amp; injects credentials &darr;</div>
      <div style="text-align: center; margin: 4px 0;">
        <span style="background: #fff3cd; padding: 6px 16px; border-radius: 4px; border: 1px solid #ffc107; font-weight: 700;">Vercel Sandbox (Ephemeral, Node.js 24)</span>
      </div>
      <div style="display: flex; justify-content: center; gap: 40px; margin-top: 8px; flex-wrap: wrap;">
        <div style="text-align: center;">
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #dc3545; color: white; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px;">ns-gm CLI (Direct)</div>
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #f8d7da; padding: 6px 12px; border-radius: 4px; border: 1px solid #dc3545; font-size: 12px;">NetSuite Production</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px;">Inspection Proxy (Mediated)</div>
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #d4edda; padding: 6px 12px; border-radius: 4px; border: 1px solid #4caf50; font-size: 12px;">NetSuite (via Server)</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #ffc107; color: #343a40; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px;">HTTP/HTTPS (Open Egress)</div>
          <div style="color: #868e96;">&darr;</div>
          <div style="background: #fff3cd; padding: 6px 12px; border-radius: 4px; border: 1px solid #ffc107; font-size: 12px;">Any External Endpoint</div>
        </div>
      </div>
    </div>
  </div>
  <p style="font-size: 13px; color: #868e96; margin-bottom: 0; text-align: center;"><em>The sandbox has unrestricted outbound access. The ns-gm CLI path (red) bypasses all server-side controls.</em></p>
</div>

<!-- ============================================================== -->
<!-- 3. EXISTING SECURITY CONTROLS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="existing-security-controls" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">3. Existing Security Controls</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 20px;">
    Helix has invested in meaningful security controls, particularly around the server-side inspection proxy. These controls are well-designed and effective <strong>within their scope</strong>. The gap is that the most sensitive access path &mdash; ns-gm CLI inside the sandbox &mdash; operates outside that scope.
  </p>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Control</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Layer</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Scope</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Protects ns-gm?</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Evidence</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">AES-256-GCM encryption at rest</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e3f2fd; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #1565c0;">Server</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">All stored credentials</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #ffc107;">Partial</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">crypto.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Step-based credential routing</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e3f2fd; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #1565c0;">Orchestrator</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">PRODUCTION only for scout/diagnosis</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #4caf50;">Yes</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">credentials.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Read-only write-keyword blocking</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e8f5e9; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #2e7d32;">Proxy</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Server-mediated queries only</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #dc3545; font-weight: 700;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-proxy-service.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Result sanitization (PEM, tokens, URLs)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e8f5e9; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #2e7d32;">Proxy</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Server-mediated responses only</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #dc3545; font-weight: 700;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-sanitizer.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Rate limiting (60 req/60s)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e8f5e9; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #2e7d32;">Proxy</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Per API key/user, in-memory</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #dc3545; font-weight: 700;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-rate-limiter.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Audit logging (fire-and-forget)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e8f5e9; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #2e7d32;">Proxy</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Query type, 200-char snippet, latency</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #dc3545; font-weight: 700;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-audit-service.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Ephemeral sandbox lifecycle</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #fff3cd; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #856404;">Runtime</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Per-run creation &amp; destruction</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="color: #ffc107;">Partial</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">sandbox-runtime.ts</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Time-bounded inspection tokens</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="background: #fff3cd; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: #856404;">Sandbox</span></td>
          <td style="padding: 10px 12px;">TTL = sandbox timeout + 300s</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="color: #868e96;">N/A</span></td>
          <td style="padding: 10px 12px;"><code style="font-size: 12px;">orchestrator.ts</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Key insight:</strong> The inspection proxy controls are well-engineered. The problem is not that they are weak &mdash; it is that the primary risk pathway (ns-gm CLI in the sandbox) operates entirely outside their scope.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 4. SECURITY GAPS & EXFILTRATION PATHWAYS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="security-gaps-and-exfiltration-pathways" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">4. Security Gaps &amp; Exfiltration Pathways</h2>

  <h3 id="identified-security-gaps" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Identified Security Gaps</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">Gap</th>
          <th style="text-align: center; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">Severity</th>
          <th style="text-align: left; padding: 10px 12px; background: #dc3545; color: white; font-weight: 600;">Risk Description</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700; color: #dc3545;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">No network egress controls</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">CRITICAL</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">The sandbox can make outbound HTTP/HTTPS requests to any external endpoint. No domain filtering, no egress firewall, no allowlist.</td>
        </tr>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700; color: #dc3545;">2</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">ns-gm CLI bypasses all proxy controls</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">CRITICAL</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Queries via ns-gm inside the sandbox are not write-blocked, not rate-limited, not audited, and not sanitized.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700; color: #e67e22;">3</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Silent credential fallback</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e67e22; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">HIGH</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">If the target credential is unavailable, the system silently falls back to the other environment. A SANDBOX step could receive PRODUCTION credentials.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700; color: #e67e22;">4</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">ANTHROPIC_API_KEY in sandbox</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e67e22; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">HIGH</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">LLM access could be used to process and restructure production data before exfiltration, making detection harder.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 700; color: #ffc107;">5</td>
          <td style="padding: 10px 12px; font-weight: 700;">Single global encryption key</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">MEDIUM</span></td>
          <td style="padding: 10px 12px;">APP_ENCRYPTION_KEY is shared across all organizations. Compromise exposes all orgs' credentials.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="concrete-exfiltration-pathways" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Concrete Exfiltration Pathways</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 20px;">
    Below are three specific data exfiltration pathways that exist in the current architecture. These are not theoretical &mdash; they describe concrete data flows using tools and credentials available inside every hot sandbox.
  </p>

  <div style="background: white; border: 2px solid #dc3545; border-radius: 8px; padding: 20px 24px; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
      <span style="background: #dc3545; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">1</span>
      <span style="font-weight: 700; font-size: 16px; color: #343a40;">Direct CLI Exfiltration</span>
      <span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">HIGHEST RISK</span>
    </div>
    <div style="background: #f8f9fa; border-radius: 6px; padding: 16px; font-family: 'Courier New', monospace; font-size: 13px; color: #343a40; margin-bottom: 12px;">
      ns-gm CLI query (production data) &rarr; Node.js process (in-memory) &rarr; HTTP/HTTPS POST &rarr; attacker-controlled endpoint
    </div>
    <p style="margin: 0; font-size: 14px; color: #495057;">The agent queries production data via ns-gm CLI and POSTs it to any external URL. No server-side control intercepts either step.</p>
  </div>

  <div style="background: white; border: 2px solid #e67e22; border-radius: 8px; padding: 20px 24px; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
      <span style="background: #e67e22; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">2</span>
      <span style="font-weight: 700; font-size: 16px; color: #343a40;">LLM-Assisted Exfiltration</span>
      <span style="background: #e67e22; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">HIGH RISK</span>
    </div>
    <div style="background: #f8f9fa; border-radius: 6px; padding: 16px; font-family: 'Courier New', monospace; font-size: 13px; color: #343a40; margin-bottom: 12px;">
      ns-gm CLI query &rarr; Anthropic API (summarize/restructure) &rarr; HTTP POST &rarr; external endpoint
    </div>
    <p style="margin: 0; font-size: 14px; color: #495057;">The agent uses the Anthropic API to process and restructure data before exfiltration, making it smaller and harder to detect.</p>
  </div>

  <div style="background: white; border: 2px solid #e67e22; border-radius: 8px; padding: 20px 24px; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
      <span style="background: #e67e22; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">3</span>
      <span style="font-weight: 700; font-size: 16px; color: #343a40;">Silent Credential Fallback Exfiltration</span>
      <span style="background: #e67e22; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">HIGH RISK</span>
    </div>
    <div style="background: #f8f9fa; border-radius: 6px; padding: 16px; font-family: 'Courier New', monospace; font-size: 13px; color: #343a40; margin-bottom: 12px;">
      Credential fallback (SANDBOX target unavailable) &rarr; silent switch to PRODUCTION &rarr; Pathway 1 or 2
    </div>
    <p style="margin: 0; font-size: 14px; color: #495057;">Steps designed for sandbox-only access could inadvertently receive production credentials, expanding the attack surface to all workflow steps.</p>
  </div>

  <div style="background: #f8d7da; border: 1px solid #dc3545; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #721c24;"><strong>Business impact:</strong> Production NetSuite data includes customer records, financial transactions, vendor information, employee data, and proprietary business configurations. Exfiltration could result in regulatory violations, competitive damage, customer trust erosion, and legal liability.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 5. INDUSTRY STRATEGIES -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="industry-strategies" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">5. Industry Strategies</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    The "agent needs broad production read access and internet connectivity" problem is well-recognized in the industry. Below are six strategies ordered from the most universally adopted (baseline) to the most comprehensive (gold standard).
  </p>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #4caf50; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">BASELINE</span>
      <span style="font-weight: 700; font-size: 16px;">1. Network Egress Controls</span>
    </div>
    <div style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;"><strong>Approach:</strong> Default-deny all outbound network traffic. Allow only explicitly whitelisted domains.</p>
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;"><strong>Why it works:</strong> Even if an agent queries production data, it cannot transmit it to an unauthorized destination. Domain filtering uses SNI at the TLS handshake level.</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #495057;"><strong>Industry adoption:</strong> Minimum viable control per every major framework. OWASP ASI05 mandates sandboxing with network restrictions. All major sandbox providers offer domain-level egress controls.</p>
      <div style="background: #f1f3f5; padding: 10px 14px; border-radius: 4px; font-size: 13px;"><strong>Sources:</strong> OWASP Top 10 for Agentic AI (ASI05, 2026) &middot; NVIDIA Agent Security Guidelines &middot; Vercel Sandbox Documentation</div>
    </div>
  </div>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">RECOMMENDED</span>
      <span style="font-weight: 700; font-size: 16px;">2. Proxy-Mediated Data Access</span>
    </div>
    <div style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;"><strong>Approach:</strong> All production queries routed through a server-side proxy that holds credentials, enforces read-only, applies rate limits, sanitizes results, and logs every query.</p>
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;"><strong>Why it works:</strong> Eliminates the root cause. The agent cannot exfiltrate credentials it doesn't have; all data access is mediated and auditable.</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #495057;"><strong>Industry adoption:</strong> Standard enterprise pattern. Helix already implements this for the inspection proxy path. NVIDIA recommends "credential-free agent runtimes."</p>
      <div style="background: #f1f3f5; padding: 10px 14px; border-radius: 4px; font-size: 13px;"><strong>Sources:</strong> NVIDIA Agent Security Guidelines &middot; Enterprise API gateway patterns &middot; Helix inspection proxy (existing)</div>
    </div>
  </div>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">RECOMMENDED</span>
      <span style="font-weight: 700; font-size: 16px;">3. Multi-Agent Zone Separation</span>
    </div>
    <div style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;"><strong>Approach:</strong> Split execution into separate agent instances per security zone. Each zone gets a new agent with appropriate permissions. Hot zones have production access but deny-all egress. Warm zones have no production access but domain-allowlisted egress. Artifacts are the only bridge between zones, sanitized at every transition.</p>
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;"><strong>Why it works:</strong> Temporal separation ensures the exfiltration pipeline cannot be assembled &mdash; production access and internet egress never coexist in the same agent instance. LLM context is destroyed at each transition by design. Vercel's dynamic <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px;">sandbox.update({ networkPolicy })</code> enables complementary within-run phase isolation.</p>
      <div style="background: #f1f3f5; padding: 10px 14px; border-radius: 4px; font-size: 13px;"><strong>Sources:</strong> Meta "Rule of Two" (2026) &middot; Vercel Sandbox Documentation &middot; Principle of least privilege (temporal application)</div>
    </div>
  </div>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #7b1fa2; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">ADVANCED</span>
      <span style="font-weight: 700; font-size: 16px;">4. Least Agency / Scoped Credentials</span>
    </div>
    <div style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;">Grant only the minimum privileges required per task. Use task-scoped, time-bounded tokens restricting to specific record types or operations.</p>
      <div style="background: #f1f3f5; padding: 10px 14px; border-radius: 4px; font-size: 13px;"><strong>Sources:</strong> OWASP Agentic AI Top 10 (2026) &middot; Repello AI / OWASP Analysis</div>
    </div>
  </div>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #7b1fa2; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">ADVANCED</span>
      <span style="font-weight: 700; font-size: 16px;">5. Comprehensive Audit and Anomaly Detection</span>
    </div>
    <div style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;">Structured, append-only, tamper-evident logging of all agent actions with behavioral analytics to detect unusual patterns.</p>
      <div style="background: #f1f3f5; padding: 10px 14px; border-radius: 4px; font-size: 13px;"><strong>Sources:</strong> SOC 2 / GDPR audit requirements &middot; OWASP logging best practices</div>
    </div>
  </div>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
    <div style="background: #1a1a2e; color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #7b1fa2; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">ADVANCED</span>
      <span style="font-weight: 700; font-size: 16px;">6. RBAC / Zero Trust Authorization</span>
    </div>
    <div style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #343a40;">Per-user, per-role authorization before granting production access. Not all members should trigger production credential injection.</p>
      <div style="background: #f1f3f5; padding: 10px 14px; border-radius: 4px; font-size: 13px;"><strong>Sources:</strong> NIST SP 800-207 (Zero Trust Architecture) &middot; OWASP Agentic AI Top 10</div>
    </div>
  </div>

  <div style="background: #e3f2fd; border: 1px solid #1565c0; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0; font-size: 14px; color: #0d47a1;"><strong>Industry consensus:</strong> Network egress controls (Strategy 1) are the absolute minimum baseline. Helix currently does not implement this baseline. Strategies 2 and 3 add meaningful defense-in-depth. The multi-agent zone separation model (Strategy 3) represents the strongest achievable isolation for agents that need both production data and internet access.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- PART II: DEEP-DIVE ANALYSIS (CONTINUATION) -->
<!-- ============================================================== -->

<div style="background: #1565c0; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 48px; text-align: center;">
  <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Part II</p>
  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700;">Deep-Dive Analysis</p>
  <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.85;">Provider comparison, migration planning, egress control, memory persistence, and multi-agent zone architecture</p>
</div>

<!-- ============================================================== -->
<!-- 6. SANDBOX PROVIDER COMPARISON -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="sandbox-provider-comparison" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">6. Sandbox Provider Comparison</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    Helix operates a dual-provider architecture today: <strong>Vercel Sandbox</strong> for workflow execution (scout, diagnosis, implementation) and <strong>Sprites.dev</strong> (Fly.io-backed) for host-agent and preview deployments. Leadership asked: <em>who has the most sophisticated controls?</em> The answer is Cloudflare &mdash; but Vercel is the optimal path for Helix.
  </p>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    Four providers represent the market spectrum: two already in use (Vercel, Sprites.dev), the industry leader in egress controls (Cloudflare), and the leading open-source alternative (E2B). Each was evaluated across nine security-relevant capability dimensions using official documentation (2026).
  </p>

  <p style="font-size: 14px; color: #868e96; margin-bottom: 24px;"><em>Note: <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 13px;">updateNetworkPolicy()</code> is deprecated. This report uses <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 13px;">sandbox.update({ networkPolicy })</code>, the current Vercel API.</em></p>

  <!-- Provider Comparison Matrix -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Capability</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Vercel Sandbox</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Sprites.dev (Fly.io)</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Cloudflare Sandboxes</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">E2B</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Isolation Model</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Firecracker microVM</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Hardware-isolated VM (own kernel + inner container)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Firecracker microVM + Workers isolates</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Firecracker microVM (own kernel)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Network Policy API</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">sandbox.update({ networkPolicy })</code> &mdash; domain allowlist, deny-all, CIDR blocks</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Per-Sprite via REST API &mdash; DNS-level enforcement (REFUSED for denied)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">allowedHosts</code> / <code style="font-size: 11px;">deniedHosts</code> + Outbound Workers</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">allowInternetAccess</code> toggle + firewall allow/deny lists</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Credential Brokering</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 600;">Yes</span> &mdash; HTTP header injection on egress (bearer tokens, API keys)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">Not documented</span> in SDK</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 600;">Yes</span> &mdash; zero-trust injection via Outbound Workers; TLS interception with ephemeral CA</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">Not documented</span></td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Dynamic Policy Updates</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 600;">Mid-session</span> without restart</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 600;">Immediate</span> enforcement via REST API</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 600;">Runtime</span> <code style="font-size: 11px;">setOutboundHandler()</code> / <code style="font-size: 11px;">setOutboundByHost()</code></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #e67e22;">Per-creation</span> config only</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Programmable Egress Proxy</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 700;">YES</span> &mdash; Outbound Workers run OUTSIDE sandbox, can inspect/modify traffic</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">No</span></td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">TLS Interception</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">No</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #4caf50; font-weight: 700;">YES</span> &mdash; ephemeral CA per instance; private key never enters sandbox</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #868e96;">No</span></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">SNI Filtering</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Yes &mdash; TLS handshake, rejected before data transmitted</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">DNS-level enforcement</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Yes + full TLS inspection via ephemeral CA</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">SNI on port 443, Host header on port 80</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Session Model</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Ephemeral (45min cap)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Persistent (100GB NVMe, indefinite, hibernate/resume)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Persistent</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Ephemeral (24h cap)</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Helix Status</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">IN USE</span> workflow execution</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">IN USE</span> host-agent, previews</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #868e96; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">NOT USED</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #868e96; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">NOT USED</span></td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; font-weight: 700;">GA Date</td>
          <td style="padding: 10px 12px;">Production</td>
          <td style="padding: 10px 12px;">Production</td>
          <td style="padding: 10px 12px;"><span style="color: #1565c0; font-weight: 600;">April 2026</span></td>
          <td style="padding: 10px 12px;">Production</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Key Findings -->
  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Most Sophisticated Controls: Cloudflare</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">Cloudflare's <strong>Outbound Workers</strong> (GA April 2026) represent the most sophisticated egress control available in the industry. These are programmable proxies that run <em>outside</em> the sandbox and can inspect payloads, inject credentials, and enforce per-request policies. Combined with <strong>TLS interception via ephemeral per-instance CAs</strong>, Cloudflare can inspect ALL HTTPS traffic content without the sandbox seeing real certificates &mdash; the private key never enters the sandbox. No other provider offers this level of content-aware egress filtering at the infrastructure level.</p>
  </div>

  <div style="background: #e8f5e9; border-left: 5px solid #4caf50; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Optimal Path for Helix: Vercel</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">Vercel is the path of least resistance. It is already the workflow sandbox provider, its <code style="background: #d4edda; padding: 2px 4px; border-radius: 3px; font-size: 13px;">sandbox.update({ networkPolicy })</code> API supports all controls needed for the 90/10 strategy (domain allowlisting, credential brokering, dynamic mid-session policy updates), and migration risk is zero.</p>
  </div>

  <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Already Demonstrates the Warm Pattern: Sprites.dev</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">Sprites.dev already demonstrates the "warm" pattern in Helix production code. The host-agent on Sprites receives only inspection API keys via <code style="background: #ffeeba; padding: 2px 4px; border-radius: 3px; font-size: 13px;">host-agent-service.ts</code>, never production ns-gm credentials. Per-Sprite network policies are available via the Sprites REST API with DNS-level enforcement. Hardware-isolated VMs with inner container layer provide strong isolation.</p>
  </div>

  <div style="background: #f1f3f5; border-left: 5px solid #868e96; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 0;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #495057; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Open Source Alternative: E2B</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">E2B provides solid isolation (Firecracker microVMs with their own kernel) and cleanest ephemeral model (aligns with multi-agent zone architecture &mdash; nothing persists, 24h cap). But it lacks credential brokering, programmable egress, and dynamic policy updates (per-creation config only). Suitable for simpler use cases but insufficient for the multi-agent zone chaining pattern.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 7. NSGM-TO-SERVER MIGRATION -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="nsgm-to-server-migration" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">7. NSGM-to-Server Migration</h2>

  <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Decided</span>
      <span style="font-weight: 700; color: #2e7d32; font-size: 15px;">This migration is settled direction per leadership directive.</span>
    </div>
    <p style="margin: 8px 0 0 0; font-size: 14px; color: #343a40;">The ns-gm CLI will be moved off the sandbox and replaced with server-side inspection proxy access. This section documents the architectural mapping, not the decision rationale.</p>
  </div>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    The migration moves production NetSuite access from an uncontrolled in-sandbox CLI to the existing server-side inspection proxy. This means production credentials (PEM, accountId, clientId, certificateId) <strong>never enter the sandbox</strong>. All production queries pass through the server's sanitization, rate limiting, write-blocking, and audit pipeline.
  </p>

  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">What "Hot" Means After Migration</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">After server-side migration, a "hot" zone no longer means "credentials inside the sandbox." It means the agent <strong>can request</strong> production data via the server-side proxy. The sandbox itself is credential-free. The hot zone's risk is bounded by the proxy's sanitization, rate limiting, and volume caps &mdash; not by unlimited CLI access.</p>
  </div>

  <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;">
    <!-- What Moves OFF -->
    <div style="flex: 1; min-width: 280px; background: #fff5f5; border: 2px solid #dc3545; border-radius: 8px; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-weight: 700; color: #dc3545; font-size: 15px;">What Moves OFF the Sandbox</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 8px;"><code style="background: #f8d7da; padding: 2px 4px; border-radius: 3px; font-size: 12px;">installNsGmCli()</code> &mdash; no longer runs <code style="font-size: 12px;">npm install -g ns-gm</code> in sandbox</li>
        <li style="margin-bottom: 8px;"><code style="background: #f8d7da; padding: 2px 4px; border-radius: 3px; font-size: 12px;">runNsGmSetupAndValidateEnv()</code> &mdash; no longer writes PEM to <code style="font-size: 12px;">/tmp/nsgm-{runId}.pem</code></li>
        <li style="margin-bottom: 8px;"><code style="background: #f8d7da; padding: 2px 4px; border-radius: 3px; font-size: 12px;">ns-gm setup:ci</code> CLI configuration</li>
        <li style="margin-bottom: 0;">Per-step ns-gm environment switching in orchestrator</li>
      </ul>
    </div>
    <!-- What STAYS/EXPANDS -->
    <div style="flex: 1; min-width: 280px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-weight: 700; color: #2e7d32; font-size: 15px;">What Stays/Expands on the Server</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #495057;">
        <li style="margin-bottom: 8px;"><code style="background: #d4edda; padding: 2px 4px; border-radius: 3px; font-size: 12px;">inspection-proxy-service.ts</code> &mdash; new inspection type (NETSUITE_QUERY)</li>
        <li style="margin-bottom: 8px;"><code style="background: #d4edda; padding: 2px 4px; border-radius: 3px; font-size: 12px;">inspection-sanitizer.ts</code> &mdash; 200-row cap, 1MB cap, credential redaction</li>
        <li style="margin-bottom: 8px;"><code style="background: #d4edda; padding: 2px 4px; border-radius: 3px; font-size: 12px;">inspection-rate-limiter.ts</code> &mdash; 60 req/60s sliding window</li>
        <li style="margin-bottom: 0;"><code style="background: #d4edda; padding: 2px 4px; border-radius: 3px; font-size: 12px;">inspection-audit-service.ts</code> &mdash; fire-and-forget audit logging</li>
      </ul>
    </div>
  </div>

  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Architectural Precedent</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">The host-agent on Sprites already demonstrates this exact pattern. <code style="background: #bbdefb; padding: 2px 4px; border-radius: 3px; font-size: 13px;">host-agent-service.ts</code> creates an MCP server with a <code style="font-size: 13px;">run_helix_cli</code> tool that routes <code style="font-size: 13px;">hlx inspect</code> commands through the server. The agent never touches production credentials directly. This is not a new pattern &mdash; it is an existing, proven architecture being extended to the workflow sandbox.</p>
  </div>

  <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 0;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Critical Nuance: Necessary but Not Sufficient</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">Moving ns-gm server-side eliminates direct credential access but the agent still receives <strong>sanitized production data</strong> (up to 200 rows per query). In the multi-agent model, this data stays in the hot zone agent's context and artifacts. The sanitization determines what crosses into a warm zone. The migration is essential but must be combined with egress controls (Section 8) and multi-agent zone separation (Section 10) to achieve the 90/10 security goal.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 8. EGRESS CONTROL TAXONOMY -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="egress-control-taxonomy" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">8. Egress Control Taxonomy</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    Not all egress is created equal. Five distinct outbound channels exist in a Helix sandbox, each with different threat levels and different control options. The 90/10 insight: <strong>two targeted changes eliminate both CRITICAL channels</strong> while preserving all agent functionality.
  </p>

  <!-- Five Channels Table -->
  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Egress Channel</th>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Threat Level</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">90/10 Control</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #dc3545;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Node.js HTTP/HTTPS to arbitrary endpoints</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">CRITICAL</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Domain allowlist via <code style="font-size: 12px;">sandbox.update({ networkPolicy })</code></td>
        </tr>
        <tr style="background: #fff5f5;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #dc3545;">2</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">ns-gm CLI to NetSuite RESTlet</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">CRITICAL</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Move to server-side proxy <span style="background: #4caf50; color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;">DECIDED</span></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #e67e22;">3</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Anthropic API (<code style="font-size: 12px;">api.anthropic.com</code>)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e67e22; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">HIGH</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Credential brokering keeps API key outside sandbox</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700; color: #ffc107;">4</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">npm / GitHub (registry + git ops)</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">MEDIUM</span></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Domain allowlist restricts to specific domains</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #4caf50;">5</td>
          <td style="padding: 10px 12px; font-weight: 600;">Context7 API</td>
          <td style="padding: 10px 12px; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">LOW</span></td>
          <td style="padding: 10px 12px;">Already low-risk (read-only documentation lookup)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- The 90/10 Strategy -->
  <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border: 2px solid #4caf50; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32; font-size: 16px;">The 90/10 Value Proposition</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #343a40;">
      <strong>Two changes</strong> eliminate both CRITICAL channels while preserving all agent functionality:
    </p>
    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;">
      <div style="flex: 1; min-width: 250px; background: white; border-radius: 6px; padding: 16px;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32;">Change 1: Server-Side ns-gm</p>
        <p style="margin: 0; font-size: 14px; color: #495057;">Production credentials never enter the sandbox. All queries mediated, rate-limited, audited. <span style="background: #4caf50; color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;">DECIDED</span></p>
      </div>
      <div style="flex: 1; min-width: 250px; background: white; border-radius: 6px; padding: 16px;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32;">Change 2: Domain Allowlist</p>
        <p style="margin: 0; font-size: 14px; color: #495057;">Sandbox can only reach approved external services via <code style="font-size: 12px;">sandbox.update({ networkPolicy })</code>. No arbitrary HTTP/HTTPS to attacker-controlled endpoints.</p>
      </div>
    </div>
    <p style="margin: 0; font-size: 14px; color: #343a40;"><strong>The remaining 10% risk:</strong> Data encoded in allowed API calls (Anthropic prompts, git commits). In the multi-agent model, this residual risk is <strong>further bounded</strong> &mdash; warm zones have only sanitized artifacts, so worst-case leakage from allowed API calls is limited to the sanitized synopsis, not raw production data.</p>
  </div>

  <!-- Multi-Agent Egress Zones -->
  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Multi-Agent Risk Bounding</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">In the multi-agent zone model, egress policies are definitional: <strong>Hot zone = deny-all</strong> (production access, no external communication). <strong>Warm zone = domain allowlist</strong> (no production access, controlled external communication). The warm zone only has sanitized artifacts from the hot zone &mdash; it never had raw production access. This means the "last 10%" (data encoded in allowed API calls) is bounded by whatever made it through sanitization, not by the full volume of production data the hot zone could query.</p>
  </div>

  <!-- Proposed Domain Allowlist -->
  <h3 id="proposed-domain-allowlist" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Proposed Domain Allowlist (Warm Zone)</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #343a40; color: white; font-weight: 600;">Domain</th>
          <th style="text-align: left; padding: 10px 12px; background: #343a40; color: white; font-weight: 600;">Purpose</th>
          <th style="text-align: left; padding: 10px 12px; background: #343a40; color: white; font-weight: 600;">Special Handling</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">api.anthropic.com</code></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">LLM inference</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Credential brokering: inject ANTHROPIC_API_KEY via <code style="font-size: 12px;">injectionRules</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">registry.npmjs.org</code></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Package installation</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Standard access</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">github.com</code>, <code style="font-size: 12px;">api.github.com</code></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Git operations, GitHub API</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Standard access</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;"><code style="font-size: 12px;">context7.com</code></td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Documentation lookup</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Read-only, low risk</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Helix internal endpoints</td>
          <td style="padding: 10px 12px;">Server communication</td>
          <td style="padding: 10px 12px;">Internal infrastructure</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Credential Brokering Explanation -->
  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
    <p style="margin: 0 0 8px 0; font-weight: 700; color: #856404; font-size: 14px;">Credential Brokering: How It Works and Its Limits</p>
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #856404;">Vercel's <code style="background: #ffeeba; padding: 2px 4px; border-radius: 3px; font-size: 13px;">sandbox.update({ networkPolicy })</code> supports <code style="font-size: 13px;">injectionRules</code> that inject HTTP headers on egressing requests for specified domains. This means ANTHROPIC_API_KEY never enters the sandbox as an environment variable &mdash; the sandbox makes requests to <code style="font-size: 13px;">api.anthropic.com</code> and Vercel injects the Authorization header automatically.</p>
    <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Key limitation:</strong> This does NOT work for ns-gm's PEM-based OAuth 1.0 signing, which requires the private key for cryptographic operations inside the process &mdash; not as an HTTP header. This reinforces why ns-gm MUST move server-side entirely.</p>
  </div>

  <!-- Rule of Two -->
  <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 16px 20px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Rule of Two Compliance</p>
    <p style="margin: 0; font-size: 14px; color: #343a40;">With multi-agent zone separation, the agent never simultaneously has <strong>fresh production access AND unrestricted external communication</strong>. In a hot zone, it has production access but deny-all egress. In a warm zone, it has domain-allowlisted egress but no production access. The two dangerous capabilities exist in separate agent instances. The Rule of Two violation is resolved by architectural design.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 9. THE MEMORY PROBLEM -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="the-memory-problem" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">9. The Memory Problem</h2>

  <div style="background: linear-gradient(135deg, #fff5f5, #fff0f0); border-left: 5px solid #dc3545; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #dc3545; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">The Core Question</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;"><em>"What does it help if you close off production access and then open up egress? If I already have all the production data, I can have very damaging data already there. I have it now. I have it in a document. I have it in an artifact. And I can now send it off anywhere."</em></p>
  </div>

  <div style="background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #2e7d32; font-size: 16px;">The Multi-Agent Answer</p>
    <p style="margin: 0; font-size: 16px; color: #343a40;">
      In the multi-agent zone model, the memory problem is <strong>fundamentally different</strong>. Each zone transition creates a <strong>new agent instance</strong> with clean LLM context. No selective memory purging is needed &mdash; the old agent is destroyed. The only data that persists across zone boundaries is what is <strong>explicitly written to artifacts</strong>. Artifacts are the controlled bridge by design, and sanitization determines their "temperature."
    </p>
  </div>

  <!-- Revised Persistence Surfaces -->
  <h3 id="five-persistence-surfaces" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Data Persistence Surfaces: Single-Sandbox vs. Multi-Agent</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Surface</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Single-Sandbox Status</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Multi-Agent Status</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #e8f5e9;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">LLM context window</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="color: #dc3545; font-weight: 700;">UNSOLVED</span> &mdash; cannot selectively purge data</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">SOLVED</span> &mdash; new agent = clean context</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">2</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Filesystem artifacts</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Persist in sandbox filesystem</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;"><span style="background: #1565c0; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">BY DESIGN</span> &mdash; artifacts are the controlled bridge</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">3</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Git branch commits</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Persist in history</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Persist in history &mdash; risk accepted; minimize raw data</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: 700;">4</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Artifact inheritance</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Auto-copied across steps</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Explicit artifact passing between zones via orchestrator</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; text-align: center; font-weight: 700;">5</td>
          <td style="padding: 10px 12px; font-weight: 600;">Database logs</td>
          <td style="padding: 10px 12px;">Persist in SandboxRunStep.logLines</td>
          <td style="padding: 10px 12px;">Server-side proxy reduces log content; not in agent's context</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- The Shift -->
  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">The Paradigm Shift</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;">In the multi-agent model, LLM context destruction is the <strong>default behavior</strong> at every zone transition &mdash; not an "escalation option." <em>"Context memory is not really a challenge because for every stage we close the old Claude instance and open a new Claude instance."</em> The control surface shifts entirely to what goes INTO the artifacts. The question is no longer "how do we purge production data from memory?" but rather "what do we allow into the synopsis that crosses zone boundaries?"</p>
  </div>

  <!-- Artifact Sanitization as Gatekeeper -->
  <h3 id="artifact-sanitization-gatekeeper" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Artifact Sanitization: The Zone Boundary Gatekeeper</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    In the multi-agent model, sanitization is the critical control point. What the sanitizer allows through determines the "temperature" of the warm zone. The current sanitization capabilities and their gaps:
  </p>

  <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;">
    <div style="flex: 1; min-width: 250px; background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 20px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #2e7d32; font-size: 15px;">Currently Handled</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
        <li style="margin-bottom: 4px;"><strong>Credential patterns:</strong> PEM blocks, tokens, URLs &mdash; stripped</li>
        <li style="margin-bottom: 4px;"><strong>Volume caps:</strong> 200 rows per query, 1MB size cap</li>
        <li style="margin-bottom: 4px;"><strong>Rate limiting:</strong> 60 queries per 60 seconds</li>
        <li style="margin-bottom: 0;"><strong>Write blocking:</strong> INSERT, UPDATE, DELETE prevented</li>
      </ul>
    </div>
    <div style="flex: 1; min-width: 250px; background: #fff5f5; border: 1px solid #dc3545; border-radius: 8px; padding: 20px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #dc3545; font-size: 15px;">NOT Handled (Documented Gap)</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
        <li style="margin-bottom: 4px;"><strong>Business data:</strong> Customer names, financial records, contract details, transaction amounts</li>
        <li style="margin-bottom: 0;">Business data passes through unchanged because the agent <em>needs</em> this data to do its job</li>
      </ul>
    </div>
  </div>

  <!-- User's Mitigating Factors -->
  <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">User-Directed Mitigating Factors</p>
    <p style="margin: 0 0 12px 0; font-size: 15px; color: #856404;">The risk bounding approach accepts that sanitized data may contain some business context. The goal is to ensure the worst-case leak is bounded and non-catastrophic:</p>
    <ol style="margin: 0; padding-left: 24px; font-size: 14px; color: #856404;">
      <li style="margin-bottom: 6px;"><strong>Limit the size</strong> &mdash; the synopsis crossing from hot to warm should be minimal, task-focused</li>
      <li style="margin-bottom: 6px;"><strong>Run NLP on it</strong> &mdash; future enhancement; not currently available</li>
      <li style="margin-bottom: 0;"><strong>Limit the risk</strong> &mdash; the user controls what goes into the synopsis: <em>"I write some synopsis that we can sanitize as the worst-case scenario if this leaks, it's not the end of the world."</em></li>
    </ol>
  </div>

  <!-- Irreducible Risk -->
  <div style="background: #f8d7da; border: 1px solid #dc3545; border-radius: 8px; padding: 20px 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #721c24; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">The Irreducible Residual Risk</p>
    <p style="margin: 0; font-size: 15px; color: #721c24;">The sanitizer handles credential patterns but <strong>NOT business data</strong>. Business data passes through unchanged because the agent needs it to function. In the multi-agent model, this risk is bounded: only what the hot zone agent writes to the synopsis &mdash; not the entire production dataset &mdash; can cross into the warm zone. This is a risk bounding exercise, not a risk elimination exercise.</p>
  </div>
</div>

<!-- ============================================================== -->
<!-- 10. MULTI-AGENT ZONE ARCHITECTURE -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="multi-agent-zone-architecture" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">10. Multi-Agent Zone Architecture</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    The primary security architecture for Helix is <strong>multi-agent zone chaining</strong>. Each security zone is a separate agent instance. The old agent is destroyed, artifacts are sanitized, and a new agent starts with different permissions. Production access and internet egress never coexist in the same agent instance. This is not a phase within one sandbox &mdash; it is a fundamentally different agent.
  </p>

  <!-- Three Zone Types -->
  <h3 id="three-zone-types" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Three Zone Types</h3>

  <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;">
    <div style="flex: 1; min-width: 250px; background: #fff5f5; border: 2px solid #dc3545; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">HOT ZONE</span>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
        <li style="margin-bottom: 6px;"><strong>Production access:</strong> YES (via server-side proxy)</li>
        <li style="margin-bottom: 6px;"><strong>Egress:</strong> deny-all</li>
        <li style="margin-bottom: 6px;"><strong>Purpose:</strong> Query production data, build artifacts</li>
        <li style="margin-bottom: 0;"><strong>Entry:</strong> Start of workflow; or re-entry after warm zone</li>
      </ul>
    </div>
    <div style="flex: 1; min-width: 250px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #ffc107; color: #343a40; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">WARM ZONE</span>
        <span style="background: #856404; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600;">INTERIM ONLY</span>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
        <li style="margin-bottom: 6px;"><strong>Production access:</strong> NO (closed off)</li>
        <li style="margin-bottom: 6px;"><strong>Egress:</strong> domain-allowlisted</li>
        <li style="margin-bottom: 6px;"><strong>Purpose:</strong> Gather internet information, research</li>
        <li style="margin-bottom: 0;"><strong>Entry:</strong> From hot via automated sanitization</li>
      </ul>
    </div>
    <div style="flex: 1; min-width: 250px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">COLD ZONE</span>
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #343a40;">
        <li style="margin-bottom: 6px;"><strong>Production access:</strong> NO</li>
        <li style="margin-bottom: 6px;"><strong>Egress:</strong> open</li>
        <li style="margin-bottom: 6px;"><strong>Purpose:</strong> Fully safe operations</li>
        <li style="margin-bottom: 0;"><strong>Entry:</strong> ONLY via human review of all artifacts</li>
      </ul>
    </div>
  </div>

  <!-- Transition Rules -->
  <h3 id="zone-transition-rules" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Zone Transition Rules</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Transition</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Trigger</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">Mechanism</th>
          <th style="text-align: left; padding: 10px 12px; background: #1a1a2e; color: white; font-weight: 600;">What Crosses</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff5f5;">
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Hot &rarr; Warm</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Need internet information during a production-data task</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Close prod access, run <strong>automated sanitization</strong> on artifacts, start <strong>NEW</strong> agent with sanitized artifacts + domain-allowlisted egress</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Sanitized synopsis &mdash; credential-stripped, volume-capped, worst-case leakage is bounded</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Hot &rarr; Cold</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Need full safety guarantee on all artifacts</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;"><strong>Human reviews</strong> all artifacts and proves they are safe. Cannot be automated by definition.</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Human-verified clean artifacts</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 12px; font-weight: 700;">Warm &rarr; Hot</td>
          <td style="padding: 12px;">Gathered the internet information, need to resume production work</td>
          <td style="padding: 12px;">Close egress, write gathered info to artifacts, start <strong>NEW</strong> agent with production access + deny-all egress</td>
          <td style="padding: 12px;">Internet-sourced information only (no production data &mdash; warm zone never had it)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Multi-Agent Flow Diagram -->
  <h3 id="multi-agent-flow-example" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Multi-Agent Flow: A Practical Example</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;"><em>I'm trying to decide on some new business flow. I query production data to see what the situation is now. Then I want to get some ideas from the industry. I write some amount of data &mdash; a synopsis that we can sanitize &mdash; and open a warm zone to search the internet. Then I close the warm zone, take that information, and open a new hot zone to finish the job.</em></p>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 24px; overflow-x: auto;">
    <div style="font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6; color: #343a40; min-width: 600px;">
      <div style="display: flex; gap: 0; align-items: stretch; flex-wrap: nowrap;">
        <!-- Agent 1 -->
        <div style="flex: 1; min-width: 180px; background: #fff5f5; border: 2px solid #dc3545; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="background: #dc3545; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; display: inline-block; margin-bottom: 8px;">HOT ZONE</div>
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Agent 1</div>
          <div style="font-size: 11px; color: #495057; text-align: left;">
            Prod access: <span style="color: #dc3545; font-weight: 700;">YES</span><br>
            Egress: <span style="color: #dc3545; font-weight: 700;">deny-all</span><br><br>
            Query prod data<br>
            Build synopsis
          </div>
          <div style="font-size: 11px; color: #868e96; margin-top: 8px;">New agent<br>Clean context</div>
        </div>
        <!-- Arrow 1 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 8px; min-width: 80px;">
          <div style="font-size: 10px; color: #856404; font-weight: 600; text-align: center; margin-bottom: 4px;">sanitize<br>artifacts</div>
          <div style="font-size: 20px; color: #ffc107;">&rarr;</div>
        </div>
        <!-- Agent 2 -->
        <div style="flex: 1; min-width: 180px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="display: flex; gap: 4px; justify-content: center; margin-bottom: 8px;">
            <span style="background: #ffc107; color: #343a40; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">WARM ZONE</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Agent 2</div>
          <div style="font-size: 11px; color: #495057; text-align: left;">
            Prod access: <span style="color: #868e96; font-weight: 700;">NO</span><br>
            Egress: <span style="color: #ffc107; font-weight: 700;">allowlist</span><br><br>
            Search internet<br>
            Gather solutions
          </div>
          <div style="font-size: 11px; color: #868e96; margin-top: 8px;">New agent<br>Clean context</div>
        </div>
        <!-- Arrow 2 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 8px; min-width: 80px;">
          <div style="font-size: 10px; color: #495057; font-weight: 600; text-align: center; margin-bottom: 4px;">write info<br>artifacts</div>
          <div style="font-size: 20px; color: #868e96;">&rarr;</div>
        </div>
        <!-- Agent 3 -->
        <div style="flex: 1; min-width: 180px; background: #fff5f5; border: 2px solid #dc3545; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="background: #dc3545; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; display: inline-block; margin-bottom: 8px;">HOT ZONE</div>
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Agent 3</div>
          <div style="font-size: 11px; color: #495057; text-align: left;">
            Prod access: <span style="color: #dc3545; font-weight: 700;">YES</span><br>
            Egress: <span style="color: #dc3545; font-weight: 700;">deny-all</span><br><br>
            Finish the job<br>
            with all info
          </div>
          <div style="font-size: 11px; color: #868e96; margin-top: 8px;">New agent<br>Clean context</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Key Insights -->
  <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">The Warm Zone Is Never an End State</p>
    <p style="margin: 0; font-size: 15px; color: #856404;"><em>"You probably can't finish the job with the warm zone because it doesn't have access to production but you can gather some data. You can do some querying and then you can write that to an artifact and then open now a hot zone."</em> The warm zone exists solely to gather information from the internet between hot zone phases. Work finishes in a subsequent hot zone.</p>
  </div>

  <div style="background: #e3f2fd; border-left: 5px solid #1565c0; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #1565c0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Why Warm, Not Cold</p>
    <p style="margin: 0; font-size: 15px; color: #343a40;"><em>"Human never reviewed this. We don't know for sure that it's safe but we ran some sanitization process through it to get to a warm zone."</em> Automated sanitization = warm. Human review = cold. This is definitional. The best you can get without human approval is from a hot zone to a warm zone. The warm zone accepts that sanitized data may contain some business context &mdash; the goal is to bound the worst-case, not eliminate all risk.</p>
  </div>

  <!-- Complementary Model -->
  <h3 id="complementary-within-run-model" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Complementary: Within-Run Phase Isolation</h3>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 16px;">
    The multi-agent zone model is the <strong>primary</strong> architecture for strong zone isolation. Complementing it, Vercel's <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 14px;">sandbox.update({ networkPolicy })</code> enables phase-level isolation <em>within</em> a single workflow run. During scout/diagnosis steps, the policy is deny-all (hot). During implementation steps, the policy switches to a domain allowlist (warm). This provides an additional layer of defense without requiring new infrastructure.
  </p>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 0;">
    The two models serve different purposes: within-run isolation provides step-level network control during a single agent session. Multi-agent zone chaining provides strong context destruction and artifact-only bridges across workflow runs. Both are valuable; multi-agent chaining is the stronger guarantee.
  </p>
</div>

<!-- ============================================================== -->
<!-- PART III: RECOMMENDATIONS -->
<!-- ============================================================== -->

<div style="background: #1a1a2e; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 48px; text-align: center;">
  <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Part III</p>
  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700;">Recommendations &amp; Path Forward</p>
</div>

<!-- ============================================================== -->
<!-- 11. HELIX-SPECIFIC RECOMMENDATIONS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="helix-specific-recommendations" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">11. Helix-Specific Recommendations</h2>

  <p style="font-size: 16px; color: #343a40; margin-bottom: 24px;">
    The following roadmap maps the deep-dive findings to concrete, prioritized actions. The 90/10 strategy forms the P0 foundation. The multi-agent zone architecture is the primary architectural direction.
  </p>

  <h3 id="updated-priority-roadmap" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Updated Priority Roadmap</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow-x: auto; margin-bottom: 32px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px;">
      <thead>
        <tr>
          <th style="text-align: center; padding: 12px; background: #1a1a2e; color: white; font-weight: 600;">Priority</th>
          <th style="text-align: left; padding: 12px; background: #1a1a2e; color: white; font-weight: 600;">Action</th>
          <th style="text-align: center; padding: 12px; background: #1a1a2e; color: white; font-weight: 600;">Effort</th>
          <th style="text-align: center; padding: 12px; background: #1a1a2e; color: white; font-weight: 600;">Impact</th>
          <th style="text-align: left; padding: 12px; background: #1a1a2e; color: white; font-weight: 600;">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #e8f5e9;">
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P0</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Server-side ns-gm migration <span style="background: #4caf50; color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600;">DECIDED</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Medium</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">High</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Extend inspection proxy with NETSUITE_QUERY type. Production credentials never enter sandbox. All queries mediated, rate-limited, sanitized, audited. Architectural precedent exists (host-agent). Changes the meaning of "hot": agent CAN REQUEST production data via proxy, never HOLDS credentials.</td>
        </tr>
        <tr style="background: #e8f5e9;">
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P0</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Domain allowlist via <code style="font-size: 12px;">sandbox.update({ networkPolicy })</code></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Low</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">High</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Single API call during sandbox creation. Restrict outbound traffic to approved domains only. Blocks the primary exfiltration pathway. Hot zone = deny-all, Warm zone = domain allowlist.</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e67e22; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P1</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Multi-agent zone orchestration</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">High</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">High</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Orchestrator support for zone chaining: new sandbox per zone, artifact sanitization as gating step, explicit artifact passing between agents. Implements the Hot &rarr; Warm &rarr; Hot pattern.</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #e67e22; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P1</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Remove silent credential fallback</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Low</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Medium</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Replace silent fallback with explicit failure. Prevents SANDBOX steps from accidentally receiving PRODUCTION credentials. Especially dangerous in multi-agent model where it could give a warm zone agent unintended production access.</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P2</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Credential brokering for ANTHROPIC_API_KEY</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Low</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Medium</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Use Vercel <code style="font-size: 12px;">injectionRules</code> to inject the Anthropic API key via HTTP header rather than env var. Key never enters sandbox.</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #1565c0; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P2</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 700;">Audit hardening</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Low-Med</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;"><span style="background: #ffc107; color: #343a40; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Medium</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">Migrate from fire-and-forget to persistent, tamper-evident audit logging. Add structured logging and anomaly detection.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 12px; text-align: center;"><span style="background: #868e96; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">P3</span></td>
          <td style="padding: 12px; font-weight: 700;">Content-aware DLP for business data</td>
          <td style="padding: 12px; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">High</span></td>
          <td style="padding: 12px; text-align: center;"><span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">High</span></td>
          <td style="padding: 12px;">NLP-based or classification-based filtering of customer names, financial records, etc. No production-ready solution exists (2026). Would strengthen the Hot &rarr; Warm sanitization boundary.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Residual Risk -->
  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px 24px;">
    <p style="margin: 0 0 4px 0; font-weight: 700; color: #856404; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Residual Risk After 90/10 + Multi-Agent Implementation</p>
    <p style="margin: 0 0 8px 0; font-size: 15px; color: #856404;">Even after P0 + P1 implementation, these residual risks remain:</p>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #856404;">
      <li style="margin-bottom: 4px;">Business data (customer names, financials) persists in artifacts crossing zone boundaries</li>
      <li style="margin-bottom: 4px;">Data could be encoded in allowed API calls from warm zones (Anthropic prompts, git commits) &mdash; bounded by sanitization</li>
      <li style="margin-bottom: 4px;">Multi-agent orchestration does not exist yet &mdash; current orchestrator runs all steps in one sandbox session</li>
      <li style="margin-bottom: 0;">Audit logging is fire-and-forget (no tamper resistance) until P2</li>
    </ul>
  </div>
</div>

<!-- ============================================================== -->
<!-- 12. LIMITATIONS & OPEN QUESTIONS -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="limitations-and-open-questions" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">12. Limitations &amp; Open Questions</h2>

  <h3 id="key-limitations" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Key Limitations of This Assessment</h3>

  <ul style="font-size: 15px; color: #343a40; padding-left: 24px; margin-bottom: 28px;">
    <li style="margin-bottom: 10px;"><strong>Multi-agent orchestration does not exist yet:</strong> The current orchestrator runs all steps in a single sandbox session. Supporting true Hot &rarr; Warm &rarr; Hot zone chaining requires new sandbox creation per zone, artifact passing between sandboxes, and sanitization as a gating step. The model is defined but the machinery is not built.</li>
    <li style="margin-bottom: 10px;"><strong>Business data passes through unchanged:</strong> The sanitizer handles credential patterns (PEM, tokens, URLs) but NOT business data (customer names, financial records, contract details). No production-ready content-aware DLP solution exists for this problem (2026). The user accepts this with mitigating factors (limit size, limit risk, future NLP).</li>
    <li style="margin-bottom: 10px;"><strong>Credential brokering scope:</strong> Works for HTTP header-based auth (API keys, bearer tokens) but NOT for certificate-based OAuth (ns-gm PEM signing). This is why ns-gm must move server-side.</li>
    <li style="margin-bottom: 10px;"><strong><code style="font-size: 14px;">sandbox.update({ networkPolicy })</code> never called in Helix:</strong> The API exists in the Vercel SDK but has never been called from Helix code. Runtime behavior is unverified.</li>
    <li style="margin-bottom: 10px;"><strong>Sprites.dev network policies untested:</strong> Per-Sprite network policies are available via the Sprites REST API but not configured or tested in Helix.</li>
    <li style="margin-bottom: 10px;"><strong>Silent credential fallback undermines zone boundaries:</strong> The orchestrator implements a silent fallback that could give a warm zone agent unintended production access if credentials are misconfigured.</li>
    <li style="margin-bottom: 10px;"><strong>Domain allowlist completeness:</strong> Proposed allowlists are based on static code analysis. Runtime validation is needed to confirm the agent doesn't access additional external services.</li>
    <li style="margin-bottom: 0;"><strong>Scope limited to Helix NetSuite:</strong> This assessment focuses on the NetSuite hot sandbox risk. Other credential types and platform integrations are out of scope.</li>
  </ul>

  <h3 id="open-questions" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Open Questions</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; background: #495057; color: white; font-weight: 600;">#</th>
          <th style="text-align: left; padding: 10px 12px; background: #495057; color: white; font-weight: 600;">Question</th>
          <th style="text-align: left; padding: 10px 12px; background: #495057; color: white; font-weight: 600;">Why It Matters</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">How should the orchestrator be extended to support multi-agent zone chaining (new sandbox per zone)?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Implementation question &mdash; the model is defined but the machinery is not built.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">2</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">What is the worst-case data volume in artifacts during a typical hot zone phase?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Determines the practical risk bound of the warm zone &mdash; how much data could potentially cross via the synopsis.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">3</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">What specific sanitization techniques work for business data without breaking agent functionality?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">The core control point for Hot &rarr; Warm transitions. Determines how "warm" a warm zone truly is.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">4</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">What is the residual exfiltration risk via data encoded in allowed API calls?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">The "last 10%" &mdash; bounded by sanitization in the multi-agent model but may require human-in-the-loop or content-aware inspection.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">5</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Does the silent credential fallback in the orchestrator present an active risk today?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Credential boundary may be weaker than the code structure implies. Especially dangerous in the multi-agent model.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">6</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">What are the latency and reliability characteristics of <code style="font-size: 12px;">sandbox.update({ networkPolicy })</code>?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Domain allowlisting is the 90/10 cornerstone &mdash; runtime behavior must be validated.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">7</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Should Helix evaluate Cloudflare Outbound Workers for content-aware egress filtering?</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e9ecef;">Most sophisticated controls in the industry (GA April 2026). Worth evaluating if the 10% residual becomes unacceptable.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">8</td>
          <td style="padding: 10px 12px;">How do Sprites.dev per-Sprite network policies compare in practice to Vercel's domain allowlist?</td>
          <td style="padding: 10px 12px;">Both providers are in use &mdash; capabilities may complement each other for the warm zone pattern.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ============================================================== -->
<!-- 13. APPENDIX: EVIDENCE SOURCES -->
<!-- ============================================================== -->
<div style="margin-bottom: 48px;">
  <h2 id="appendix-evidence-sources" style="font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #dee2e6; padding-bottom: 12px; margin-bottom: 24px;">13. Appendix: Evidence Sources</h2>

  <h3 id="codebase-evidence" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Codebase Evidence (helix-global-server)</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 12px; background: #495057; color: white; font-weight: 600;">File</th>
          <th style="text-align: left; padding: 8px 12px; background: #495057; color: white; font-weight: 600;">What It Evidences</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">sandbox-runtime.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Sandbox creation with no network controls; only runtime, timeout, vCPUs configured</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">credentials.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Step-to-environment routing; scout/diagnosis = PRODUCTION, others = SANDBOX</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">native-phase.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Credential injection: PEM written to /tmp with chmod 600; ns-gm CLI configured</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">orchestrator.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Credential pre-load, per-step switching, silent fallback (lines 1720-1729), artifact inheritance</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-proxy-service.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Server-side proxy: write-blocking, LIMIT injection, credentials stay server-side</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-sanitizer.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Result redaction: PEM, credentials, URLs; 1MB cap; 200-row limit; NO business data filtering</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-rate-limiter.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Sliding window: 60 requests per 60-second window; in-memory only</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">inspection-audit-service.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Fire-and-forget audit: query type, snippet, latency; console-only failure reporting</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 12px;">host-agent-service.ts</code></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Warm pattern: inspection API keys only, binary allowlist, hlx inspect routing (lines 288-292)</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px;"><code style="font-size: 12px;">preview-deployment.ts</code></td>
          <td style="padding: 8px 12px;">Cold pattern: dev credentials only, no production access</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="external-sources" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">External Sources</h3>

  <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 12px; background: #495057; color: white; font-weight: 600;">Source</th>
          <th style="text-align: left; padding: 8px 12px; background: #495057; color: white; font-weight: 600;">Relevance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">OWASP Top 10 for Agentic AI (2026)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">ASI05 mandates sandboxing with network restrictions. "Least agency" principle for AI agents.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Meta "Rule of Two" (2026)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Framework for the core violation: agents must not simultaneously process untrusted inputs, access sensitive data, and communicate externally.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">NVIDIA Agent Security Guidelines</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Default-deny egress as baseline. "Credential-free agent runtimes" recommendation.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Vercel Sandbox SDK Reference (Context7)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;"><code style="font-size: 11px;">sandbox.update({ networkPolicy })</code> API: deny-all, domain allowlists, SNI filtering, credential brokering, dynamic updates. Replaces deprecated <code style="font-size: 11px;">updateNetworkPolicy()</code>.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Cloudflare Sandboxes (GA April 2026)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Outbound Workers: programmable egress proxies running outside sandbox. TLS interception via ephemeral per-instance CA. Zero-trust credential injection. Industry high-water mark for egress control.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">Sprites.dev API Documentation</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Per-Sprite network policies via REST API. DNS-based filtering, domain allowlists, immediate enforcement. Hardware-isolated VMs with inner container layer.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">E2B Documentation</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Firecracker microVMs. <code style="font-size: 11px;">allowInternetAccess</code> toggle, firewall allow/deny lists, CIDR rules. 24h ephemeral cap.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600;">NIST SP 800-207 (Zero Trust Architecture)</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">Foundation for RBAC and zero-trust recommendations.</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px;">
            <strong>AI Agent DLP Research (2026)</strong>
          </td>
          <td style="padding: 8px 12px;">Data minimization, egress brokering, DLP labels, human-in-the-loop &mdash; emerging patterns for agent data security.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="prior-artifacts" style="font-size: 20px; color: #343a40; margin-bottom: 16px;">Prior Analysis Artifacts</h3>

  <p style="font-size: 14px; color: #495057; margin-bottom: 16px;">This report synthesizes findings from the following detailed analysis artifacts:</p>

  <ul style="font-size: 14px; color: #495057; padding-left: 24px; margin-bottom: 0;">
    <li style="margin-bottom: 6px;"><strong>Scout Summary</strong> (helix-global-server): Architecture analysis, controls inventory, gap identification, file-level evidence</li>
    <li style="margin-bottom: 6px;"><strong>Scout Reference Map</strong> (helix-global-server): 15 key files with specific line references; 14 confirmed facts; 8 unknowns</li>
    <li style="margin-bottom: 6px;"><strong>Diagnosis Statement</strong> (library + helix-global-server): Root cause analysis, Rule of Two violation, provider comparison, egress taxonomy, memory problem (reframed for multi-agent model), zone transitions</li>
    <li style="margin-bottom: 6px;"><strong>Product Specification</strong> (library): Nine success criteria, eight user scenarios, seven key design principles, multi-agent zone model as primary architecture</li>
    <li style="margin-bottom: 6px;"><strong>Tech Research</strong> (library): Six architecture decisions with verified evidence; four-provider comparison; egress channel ranking; memory persistence analysis; multi-agent zone chaining pattern; artifact sanitization as zone boundary gatekeeper</li>
    <li style="margin-bottom: 0;"><strong>Tech Research APL</strong> (library): Six detailed Q&amp;A with evidence citations from official docs, codebase, and industry research</li>
  </ul>
</div>

<!-- Report Footer -->
<div style="border-top: 2px solid #dee2e6; padding-top: 20px; margin-top: 48px; text-align: center;">
  <p style="font-size: 13px; color: #868e96; margin: 0 0 4px 0;">RSH-633 &middot; Security Assessment: Hot Sandbox Architecture &middot; Helix NetSuite</p>
  <p style="font-size: 13px; color: #868e96; margin: 0 0 4px 0;">Multi-Agent Zone Architecture Edition &middot; Deep-Dive Analysis</p>
  <p style="font-size: 13px; color: #868e96; margin: 0;">May 2026 &middot; Confidential &middot; For Internal Use Only</p>
</div>

</div>
</body>
</html>

## Attachments
- (none)
