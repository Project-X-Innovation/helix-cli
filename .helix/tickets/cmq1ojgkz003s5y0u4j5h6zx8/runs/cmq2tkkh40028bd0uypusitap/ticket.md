# Ticket Context

- ticket_id: cmq1ojgkz003s5y0u4j5h6zx8
- short_id: RSH-707
- run_id: cmq2tkkh40028bd0uypusitap
- run_branch: helix/research/RSH-707-mvp-netsuite-play-mode
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Mvp NetSuite Play mode

## Description
Tools are now called plays.



What is an mvp.



1. Use normal Helix ticket system to create a Play (replaces execute)
2. what is a play?

A series of composed AI agent prompts, suiteql (map), read only scripts or further agent calls to transform the data (reduce) and outputs/effects (crud on records/external API calls/emails or messages).

These can be composed and the inputs and outputs of each can be measured and monitored

3. a play is run in sandbox with canonical examples. Much like the rules in the playbook (#BLD-677), we demonstrate with examples. We can use ns-gm to create the canonical/sample inputs and run the play on them, and show the actual sandbox outputs 
4. Much of the play can be previewed. Everything besides the outputs/effects is read only and can be previewed. 
5. The only last thing to brainstorm is how to get at least a taste of preview on the output/effect. Or at least demonstrate comfort 
6. The user can run the play
7. Of course we log/monitor everything everything on the way

## Referenced Tickets

1 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### BLD-677: Playbook check — trigger endpoint, result ingestion, and CLI
- Mode: BUILD | Status: PREVIEW_READY
- Completed runs: 1 (run-1)
- Materialized files: 1 artifacts
- Path: `.helix-refs/BLD-677/`
- Manifest: `.helix-refs/BLD-677/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSH-702: NetSuite Tool Mode — Reversibility Tiers + Production Dry-Run Preview</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 24px; background: #fafbfc;">

  <!-- Report Header -->
  <div style="border-bottom: 4px solid #2d3436; padding-bottom: 20px; margin-bottom: 32px;">
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #636e72; margin: 0 0 8px 0;">Feasibility Report</p>
    <h1 id="netsuite-tool-mode-reversibility-tiers-production-d" style="font-size: 28px; font-weight: 700; color: #2d3436; margin: 0 0 8px 0;">NetSuite Tool Mode: Reversibility Tiers + Production Dry-Run Preview</h1>
    <p style="font-size: 16px; color: #636e72; margin: 0 0 16px 0;">Research Report &mdash; RSH-702</p>
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <span style="display: inline-block; background: #dfe6e9; color: #2d3436; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Date: June 5, 2026</span>
      <span style="display: inline-block; background: #00b894; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Status: Final</span>
      <span style="display: inline-block; background: #6c5ce7; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Verdict: Conditional Go</span>
    </div>
  </div>

  <!-- Table of Contents -->
  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px 24px; margin-bottom: 36px;">
    <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 12px 0; color: #2d3436;">Table of Contents</h2>
    <ol style="margin: 0; padding-left: 20px; columns: 2; column-gap: 32px;">
      <li style="margin-bottom: 6px;"><a href="#executive-summary" style="color: #0984e3; text-decoration: none;">Executive Summary</a></li>
      <li style="margin-bottom: 6px;"><a href="#production-dry-run-assessment" style="color: #0984e3; text-decoration: none;">Production Dry-Run Assessment</a></li>
      <li style="margin-bottom: 6px;"><a href="#first-cut-atomic-inverse-library" style="color: #0984e3; text-decoration: none;">First-Cut Atomic-Inverse Library</a></li>
      <li style="margin-bottom: 6px;"><a href="#governed-channel-containment" style="color: #0984e3; text-decoration: none;">Governed Channel Containment</a></li>
      <li style="margin-bottom: 6px;"><a href="#tier-2-derived-inverse-safety" style="color: #0984e3; text-decoration: none;">Tier-2 Derived-Inverse Safety</a></li>
      <li style="margin-bottom: 6px;"><a href="#idempotency-and-double-submit-prevention" style="color: #0984e3; text-decoration: none;">Idempotency &amp; Double-Submit Prevention</a></li>
      <li style="margin-bottom: 6px;"><a href="#reuse-audit" style="color: #0984e3; text-decoration: none;">Reuse Audit</a></li>
      <li style="margin-bottom: 6px;"><a href="#tier-3-preview-fidelity-and-fallback" style="color: #0984e3; text-decoration: none;">Tier-3 Preview Fidelity &amp; Fallback</a></li>
      <li style="margin-bottom: 6px;"><a href="#open-questions-and-future-work" style="color: #0984e3; text-decoration: none;">Open Questions &amp; Future Work</a></li>
    </ol>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 1: EXECUTIVE SUMMARY -->
  <!-- ============================================================ -->
  <h2 id="executive-summary" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">1. Executive Summary</h2>

  <p>This report assesses the feasibility of introducing a <strong>Tool mode</strong> to Helix &mdash; a fourth mode alongside Build, Fix, and Report &mdash; that produces governed, reversible, previewable NetSuite record-level operations. Tool mode would enable Helix to execute individual NetSuite actions (create invoice, void bill, update fields) with three safety pillars: <strong>preview</strong> (show what will happen), <strong>audit</strong> (log what did happen), and <strong>rollback</strong> (undo what happened).</p>

  <p>The central finding is a <strong>large gap between the aspirational vision and current reality</strong>. The NS-GM RESTlet is a raw code-execution gateway today &mdash; no before-image capture, no write audit trail, no rollback capability. EXECUTE mode deploys SuiteScript code, not individual record operations. NetSuite provides useful but limited dry-run primitives: in-memory projection, record transformation chains, and transaction void. No quarantined non-posting/draft state or <code>BEGIN...ROLLBACK</code> transaction primitive exists.</p>

  <p>Despite this gap, the report finds <strong>conditional feasibility</strong>. Six existing infrastructure components are directly reusable (credentials, environment resolution, approval gates, platform config, audit pattern, CLI framework). Nine net-new capabilities must be built. The governed channel has a real structural containment leak &mdash; SDF-deployed SuiteScript runs autonomously inside NetSuite outside the channel &mdash; but this leak is manageable for Tool mode's direct record operations.</p>

  <h3 id="key-decisions-summary" style="font-size: 18px; color: #2d3436; margin-top: 28px;">Key Decisions Summary</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0 24px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; font-weight: 600; border: 1px solid #2d3436; width: 30%;">Decision Area</th>
        <th style="padding: 10px 14px; text-align: left; font-weight: 600; border: 1px solid #2d3436;">Finding / Recommendation</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Production Dry-Run Fidelity</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Three mechanisms available (projection, transform, void). Fidelity is <strong>partial</strong>: sourced fields compute in-memory, but taxes, GL impact, and user-event script effects require <code>record.save()</code>. No quarantined-save or <code>BEGIN...ROLLBACK</code> exists.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Tier-1 Inverse Viability</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">12 candidate action-inverse pairs identified. Clean void is viable for most transaction types via <code>transaction.void()</code>. Tier-1 purity is <strong>account-dependent</strong> &mdash; user-event scripts may introduce Tier-3 side effects. REVERSALVOIDING preference changes void semantics per account.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Governed Channel Coverage</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">NS-GM RESTlet is a controllable chokepoint for Helix-initiated operations. <strong>Structural containment leak</strong> from 10 SDF-deployed script types running autonomously. Leak is manageable: focus governance on the chokepoint; use inference for visibility into deployed scripts.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Tier-2 Safety Approach</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Optimistic concurrency via <code>dateLastModified</code>. No pessimistic locking available in NetSuite. Sandbox validates logic; production uses fresh before-image. Escalate on drift.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Idempotency Mechanism</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Three-layer defense: (1) <code>externalId</code> for NetSuite-side dedup on create, (2) forward-log operation IDs for governance-side dedup, (3) pre-execution existence checks for additional safety.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Build Effort Assessment</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">6 reusable components with specific file references. 9 net-new capabilities must be built. Heaviest lifts: governance envelope on RESTlet, rollback engine, before-image capture.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #00b894;">Go/No-Go Recommendation</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 13px;">CONDITIONAL GO</span> &mdash; Feasible with scoped first phase. Start with Tier-1 operations on core transaction types (invoice, bill, SO) through the NS-GM chokepoint. Defer Tier-2 promotion flywheel and triggered automation to later phases. Accept the structural containment leak as a documented boundary.</td>
      </tr>
    </tbody>
  </table>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Conditions for Go:</strong> (1) Before-image capture and write audit logging are built into the NS-GM governance envelope before any production writes. (2) User-event script enumeration per record type is performed at tool design time to classify actual tier. (3) Human approval is unconditional for Tier-3 actions. (4) REVERSALVOIDING preference is checked at runtime before any void operation.</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 2: PRODUCTION DRY-RUN ASSESSMENT -->
  <!-- ============================================================ -->
  <h2 id="production-dry-run-assessment" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">2. Production Dry-Run Assessment</h2>

  <p>This section answers <strong>Research Question 1</strong>: What production dry-run mechanisms exist in NetSuite, and what are their fidelity limits per record/transaction type?</p>

  <h3 id="available-mechanisms" style="font-size: 18px; color: #2d3436; margin-top: 28px;">2.1 Available Mechanisms</h3>

  <p>Three mechanisms are available from NetSuite's SuiteScript API surface:</p>

  <div style="background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 6px; padding: 16px 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 15px;">Mechanism 1: Projection (In-Memory Build)</h4>
    <p style="margin: 0; font-size: 14px;"><code>record.create({type, isDynamic: true})</code> constructs a record in memory. Sourced fields compute on <code>setValue()</code>. Field validations and client-side constraints apply. The record exists only in the RESTlet's execution context until explicitly saved.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #555;"><strong>Evidence:</strong> Context7 N/record docs &mdash; <code>record.create()</code> returns <code>record.Record</code> object; <code>isDynamic: true</code> enables real-time field sourcing.</p>
  </div>

  <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 6px; padding: 16px 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 8px 0; color: #1565c0; font-size: 15px;">Mechanism 2: Record.transform (Native Type Chain)</h4>
    <p style="margin: 0; font-size: 14px;"><code>record.transform({fromType, fromId, toType})</code> returns an unsaved transformed record. Supports specific chains: estimate &rarr; sales order, sales order &rarr; invoice, sales order &rarr; item fulfillment, purchase order &rarr; vendor bill, customer &rarr; sales order. The transformed record inherits line items and values from the source.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #555;"><strong>Evidence:</strong> Context7 N/record docs &mdash; <code>record.transform()</code> accepts <code>fromType</code>, <code>fromId</code>, <code>toType</code>, <code>isDynamic</code>; returns unsaved <code>record.Record</code>.</p>
  </div>

  <div style="background: #fce4ec; border: 1px solid #f8bbd0; border-radius: 6px; padding: 16px 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 8px 0; color: #c62828; font-size: 15px;">Mechanism 3: Transaction.void (Reversal)</h4>
    <p style="margin: 0; font-size: 14px;"><code>transaction.void({type, id})</code> voids a committed transaction. Behavior depends on the <code>REVERSALVOIDING</code> accounting preference: <strong>direct void</strong> (marks original as void, memo = 'VOID', returns same ID) or <strong>reversing journal</strong> (creates a new offsetting journal entry, returns new ID). This is a reversal mechanism, not a preview, but it enables Tier-1 atomic inverse.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #555;"><strong>Evidence:</strong> Context7 N/transaction docs &mdash; <code>transaction.void()</code> returns void transaction ID; REVERSALVOIDING preference at Setup &gt; Accounting &gt; Accounting Preferences.</p>
  </div>

  <h3 id="what-is-missing" style="font-size: 18px; color: #2d3436; margin-top: 28px;">2.2 What Is Missing</h3>

  <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
      <li><strong>No quarantined non-posting/draft state API:</strong> NetSuite does not provide a first-class API for saving a record in a non-posting draft state that auto-promotes. Draft preview must be custom-built per record type using custom status fields or approval-hold workflows.</li>
      <li><strong>No <code>BEGIN...ROLLBACK</code> transaction primitive:</strong> The <code>N/transaction</code> module exposes only <code>void()</code>. No <code>transaction.begin()</code>, <code>transaction.commit()</code>, or <code>transaction.rollback()</code> methods exist. This confirms per-record-type reversal strategies are required.</li>
      <li><strong>No independent calculation/validation endpoints:</strong> Tax calculations, pricing computations, and approval routing are embedded in the <code>record.save()</code> lifecycle. They cannot be invoked independently to enrich a projection.</li>
    </ul>
  </div>

  <h3 id="per-type-mechanism-matrix" style="font-size: 18px; color: #2d3436; margin-top: 28px;">2.3 Per-Type Mechanism Matrix</h3>

  <p>The following table maps each mechanism to specific NetSuite record/transaction types. Cells indicate applicability and fidelity limits.</p>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background: #2d3436; color: #fff;">
          <th style="padding: 10px 12px; text-align: left; border: 1px solid #2d3436; white-space: nowrap;">Record / Transaction Type</th>
          <th style="padding: 10px 12px; text-align: center; border: 1px solid #2d3436;">Projection<br>(In-Memory Build)</th>
          <th style="padding: 10px 12px; text-align: center; border: 1px solid #2d3436;">Record.transform<br>(Native Chain)</th>
          <th style="padding: 10px 12px; text-align: center; border: 1px solid #2d3436;">Transaction.void<br>(Reversal)</th>
          <th style="padding: 10px 12px; text-align: left; border: 1px solid #2d3436;">Fidelity Limits</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Sales Order</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes (from Estimate)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Projection: item pricing, sourced fields compute. Tax, shipping, GL: only on save. Transform from estimate populates lines.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Invoice</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes (from SO)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Transform from SO pre-populates all lines. Void creates GL-offsetting entries. Tax not computed until save.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Vendor Bill</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes (from PO)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Transform from PO carries item lines. Void affected by REVERSALVOIDING. Expense allocation on save only.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Purchase Order</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #fff3cd; color: #856404; font-weight: 600;">Source only</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes (Close)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">PO is a transform source (PO &rarr; Vendor Bill, PO &rarr; Item Receipt). Void/Close both applicable. Approval routing on save only.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Credit Memo</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes (from Invoice)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Transform from Invoice copies lines for credit. Void reverses GL. Amount applied on save.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Journal Entry</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Not a transform target. Projection shows debit/credit lines but GL validation on save. Void creates offsetting JE.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Customer Payment</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Projection shows payment allocation. Invoice application computed on setValue. Void reverses application but <strong>REVERSALVOIDING</strong> may apply.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Item Fulfillment</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes (from SO)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">No clean void</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Transform from SO shows fulfillable lines. <strong>Physical shipment cannot be undone.</strong> Inventory impact on save only. Tier-3 once shipped.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Customer</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #fff3cd; color: #856404; font-weight: 600;">Source only</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A (entity)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Entity record, not transaction. Projection shows field computations. Void N/A. Inverse: delete or before-image restore.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Vendor</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A (entity)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Entity record. Projection shows sourced fields. Delete possible if no linked transactions. Before-image restore for updates.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Inventory Item</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A (entity)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Entity record. Pricing/costing fields preview via projection. Inventory levels not in projection (committed qty on save).</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Custom Record</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #e8f5e9; color: #2e7d32; font-weight: 600;">Yes</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center; background: #ffebee; color: #c62828; font-weight: 600;">N/A (non-txn)</td>
          <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-size: 12px;">Fully projectable. No transform chains. Delete for reversal. Custom scripts on record type may introduce side effects.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; font-weight: 600; font-size: 14px; color: #e65100;">Critical Limitation: User-Event Scripts</p>
    <p style="margin: 8px 0 0 0; font-size: 14px;"><code>beforeSubmit</code> and <code>afterSubmit</code> user-event scripts fire <strong>only on <code>record.save()</code></strong>. In-memory projection cannot predict server-side script effects. This means any user-event script that creates additional records, sends emails, triggers workflows, or makes HTTP callouts will not be reflected in the preview. Projection fidelity is inherently limited to field values and sourced-field computations.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #555;"><strong>Evidence:</strong> Context7 &mdash; User event scripts <code>beforeSubmit</code>/<code>afterSubmit</code> entry points fire on <code>record.save()</code>, <code>record.submit()</code>, and <code>record.delete()</code> only.</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 3: ATOMIC-INVERSE LIBRARY -->
  <!-- ============================================================ -->
  <h2 id="first-cut-atomic-inverse-library" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">3. First-Cut Atomic-Inverse Library</h2>

  <p>This section answers <strong>Research Question 2</strong>: What are the candidate Tier-1 action-inverse pairs for common NetSuite records/transactions?</p>

  <h3 id="tier-classification-rules" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.1 Tier Classification Rules</h3>

  <p>A tool's reversibility tier equals its <strong>worst action</strong>. The classification rules are:</p>
  <ul style="font-size: 14px;">
    <li><strong>Tier 1 &mdash; Atomic Inverse:</strong> Known action &harr; inverse pair from the curated library. The inverse is mechanically executable. A tool composed entirely of Tier-1 actions is auto-invertible by replaying inverses in reverse order (requires ordered forward log).</li>
    <li><strong>Tier 2 &mdash; Derived Inverse:</strong> Helix captures the before-state and synthesizes a compensating recipe. Validated once in sandbox. Requires fresh before-image per run and optimistic-concurrency check. Escalate on drift.</li>
    <li><strong>Tier 3 &mdash; No Inverse:</strong> Third-party posts, email sends, payment captures, external API calls. Monitor-only with optional best-effort compensation that is <strong>not a true inverse</strong>.</li>
  </ul>

  <div style="background: #e8eaf6; border-left: 4px solid #5c6bc0; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Account-Dependent Purity:</strong> Tier-1 classification below is for the <em>API operation alone</em>. User-event scripts deployed on a record type can silently introduce Tier-3 side effects (emails, external calls). Tier-1 purity is conditional on per-account enumeration of deployed user-event scripts. The RSH-411 inference pipeline provides a mechanism for this enumeration.</p>
  </div>

  <h3 id="action-inverse-pair-table" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.2 Action-Inverse Pair Table</h3>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
      <thead>
        <tr style="background: #2d3436; color: #fff;">
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">#</th>
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">Action</th>
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">Record Type</th>
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">Inverse Operation</th>
          <th style="padding: 8px 10px; text-align: center; border: 1px solid #2d3436;">Tier</th>
          <th style="padding: 8px 10px; text-align: center; border: 1px solid #2d3436;">Clean?</th>
          <th style="padding: 8px 10px; text-align: center; border: 1px solid #2d3436;">REVERSAL-<br>VOIDING</th>
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">UE Script Risk</th>
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">GL Impact</th>
          <th style="padding: 8px 10px; text-align: left; border: 1px solid #2d3436;">Doc # Consumed</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">1</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Sales Order</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Sales Order</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may trigger fulfillment workflows</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">None (non-posting until billed)</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (SO number)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">2</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Post Invoice</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Invoice</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit commonly sends customer email notification</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Creates offsetting GL</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (invoice number)</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">3</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Post Vendor Bill</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Vendor Bill</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may trigger AP approval workflow</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Creates offsetting GL</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (bill number)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">4</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Credit Memo</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Credit Memo</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may auto-apply to invoices</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Creates offsetting GL</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (CM number)</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">5</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Journal Entry</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Journal Entry</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Low risk &mdash; JE rarely has UE scripts</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Creates offsetting GL</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (JE number)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">6</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Check</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Check</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may trigger bank feed sync</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Creates offsetting GL</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (check number)</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">7</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Customer Payment</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Customer Payment</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #e17055; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 11px;">Yes</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may trigger payment receipt email</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Reverses application + GL</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (payment number)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">8</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Purchase Order</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Purchase Order</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Close PO / <code>transaction.void()</code></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">1</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Yes</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may trigger vendor notification</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">None (non-posting)</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (PO number)</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">9</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Update Field Value</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Any record</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Restore before-image field values</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #fdcb6e; color: #2d3436; padding: 1px 8px; border-radius: 3px; font-weight: 600;">2</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Needs before-image</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">N/A</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">beforeSubmit/afterSubmit fire on save; may cascade</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Depends on field (posting fields create GL)</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">No</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">10</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Delete Custom Record</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Custom Record</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Re-create from before-image</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #fdcb6e; color: #2d3436; padding: 1px 8px; border-radius: 3px; font-weight: 600;">2</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">Needs before-image</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">N/A</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">beforeSubmit fires on delete; new internal ID on re-create</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">None (non-posting)</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">No (but new internal ID)</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">11</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Create Item Fulfillment</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Item Fulfillment</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><em>No clean inverse &mdash; shipped is shipped</em></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #d63031; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">3</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">N/A</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">afterSubmit may trigger shipping integration</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Inventory committed</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">Yes (IF number)</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">12</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; font-weight: 600;">Send Email</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">N/email</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;"><em>No inverse &mdash; sent email cannot be recalled</em></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #d63031; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600;">3</span></td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">No</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6; text-align: center;">N/A</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">N/A (is itself a side effect)</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">None</td>
          <td style="padding: 6px 10px; border: 1px solid #dee2e6;">No</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 id="annotation-notes" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.3 Annotation Notes</h3>

  <ul style="font-size: 14px;">
    <li><strong>REVERSALVOIDING preference:</strong> Affects void semantics for Bill Payment, Payroll Liability Payment, Customer Refund, Tax Payment, and Tax Liability Check. When enabled, void creates a <em>reversing journal</em> (new offsetting entry with new ID) instead of a direct void (same ID, memo = 'VOID'). Helix must check this preference at runtime via <code>config.load({type: config.Type.ACCOUNTING_PREFERENCES})</code> before executing any void operation. <em>(Source: Context7 N/config docs)</em></li>
    <li><strong>Document number consumption:</strong> Void operations consume a new transaction number in reversing-journal mode. This means voiding an invoice and re-creating it will use two additional document numbers. The audit trail preserves both the original and the void, but numbering gaps are visible to users.</li>
    <li><strong>GL impact:</strong> Void does <em>not</em> erase the original GL entries. It creates new offsetting entries that zero out the net effect. The original GL posting remains in the ledger for audit purposes. This is important for period-close processes.</li>
    <li><strong>Account-dependent Tier-1 purity:</strong> The classifications above are for the API operations alone. If a customer's NetSuite account has user-event scripts deployed on invoice records that send external emails or update third-party systems on <code>afterSubmit</code>, then posting an invoice is effectively Tier-3 (because the void cannot recall the email). Runtime enumeration of user-event scripts per record type (using the RSH-411 inference pipeline) is recommended before classifying a tool's actual tier. <em>(Source: <code>library:reports/RSH-411/report.md</code> &mdash; inference-first model for SDF script enumeration)</em></li>
  </ul>

  <!-- ============================================================ -->
  <!-- SECTION 4: GOVERNED CHANNEL CONTAINMENT -->
  <!-- ============================================================ -->
  <h2 id="governed-channel-containment" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">4. Governed Channel Containment</h2>

  <p>This section answers <strong>Research Question 3</strong>: What are the governed channel's containment limits, and what bypasses NS-GM?</p>

  <h3 id="current-state-ns-gm-is-a-raw-pipe" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.1 Current State: NS-GM Is a Raw Pipe</h3>

  <p>The NS-GM RESTlet (<code>helix-global-server:netsuite-setup/FileCabinet/SuiteScripts/ns_gm_restlet.js</code>) is today a <strong>raw code-execution gateway</strong>, not a governed channel. Key evidence:</p>

  <ul style="font-size: 14px;">
    <li><strong>Line 166:</strong> <code>const executionFunction = new Function(...moduleNames, userCode)</code> &mdash; arbitrary SuiteScript code is eval'd with no interception.</li>
    <li><strong>Lines 163-189:</strong> <code>safeExecute()</code> wraps execution in try-catch only &mdash; no pre-mutation snapshot, no write logging, no operation-type filtering.</li>
    <li><strong>Skill guardrails:</strong> Production is read-only by <em>policy</em> (NS-GM SKILL.md), not by technical enforcement in the RESTlet.</li>
    <li><strong>Audit logging:</strong> <code>InspectionAuditLog</code> (<code>inspection-audit-service.ts</code>) records read-only inspection queries (DATABASE/LOGS/API types) only. No write-operation audit model exists.</li>
  </ul>

  <h3 id="containment-model" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.2 Containment Model</h3>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 200px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 6px; padding: 14px;">
        <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 14px;">CONTAINED</h4>
        <p style="margin: 0; font-size: 13px;">All Helix-initiated runtime operations through NS-GM RESTlet:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 16px; font-size: 13px;">
          <li>Record CRUD (<code>N/record</code>)</li>
          <li>Transaction operations (<code>N/transaction</code>)</li>
          <li>Search/query reads (<code>N/search</code>, <code>N/query</code>)</li>
          <li>File operations (<code>N/file</code>)</li>
          <li>Email sends (<code>N/email</code>)</li>
          <li>HTTP calls (<code>N/https</code>)</li>
        </ul>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #555;">These all pass through the single RESTlet chokepoint and can be wrapped with governance (before-image, audit, rollback).</p>
      </div>
      <div style="flex: 1; min-width: 200px; background: #ffebee; border: 2px solid #f44336; border-radius: 6px; padding: 14px;">
        <h4 style="margin: 0 0 8px 0; color: #c62828; font-size: 14px;">NOT CONTAINED (Structural Leak)</h4>
        <p style="margin: 0; font-size: 13px;">SDF-deployed SuiteScript running autonomously inside NetSuite on internal triggers:</p>
        <ol style="margin: 8px 0 0 0; padding-left: 16px; font-size: 13px;">
          <li>User Event Scripts</li>
          <li>Scheduled Scripts</li>
          <li>Workflow Action Scripts</li>
          <li>Map/Reduce Scripts</li>
          <li>Suitelets</li>
          <li>Portlets</li>
          <li>Client Scripts</li>
          <li>RESTlets (deployed, non-NS-GM)</li>
          <li>Mass Update Scripts</li>
          <li>Bundle Installation Scripts</li>
        </ol>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #555;">These fire on NetSuite-internal triggers (record save, schedule, workflow transition) &mdash; they are not routed through the NS-GM RESTlet.</p>
      </div>
    </div>
  </div>

  <p style="font-size: 14px;"><em>Source: <code>helix-global-server:.claude/skills/netsuite-objects/SKILL.md</code> &mdash; 10 SDF script types with autonomous execution capability.</em></p>

  <h3 id="the-leak-is-structural-not-a-bug" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.3 The Leak Is Structural, Not a Bug</h3>

  <p>The containment leak is a <strong>structural characteristic of the NetSuite platform</strong>, not something that can be "fixed." SDF-deployed scripts are designed to run autonomously inside NetSuite's own execution engine. User-event scripts fire when <em>any process</em> &mdash; including manual UI actions, CSV imports, other scripts, or NS-GM operations &mdash; saves a record. The NS-GM RESTlet has no visibility into, or control over, these autonomous executions.</p>

  <h3 id="what-ns-gm-needs-to-become-a-governed-channel" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.4 What NS-GM Needs to Become a Governed Channel</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Capability</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">What It Does</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Current State</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Before-image capture</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Query record state before mutation via <code>record.load()</code></td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #d63031;">Does not exist</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Operation-type tagging</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Classify each operation as read or write</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #d63031;">Not implemented &mdash; RESTlet treats all code equally</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Write audit logging</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Log every write operation with before/after state</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #e17055;">InspectionAuditLog exists for reads only</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Rollback point / forward log</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Ordered log of operations for inverse replay</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #d63031;">Does not exist</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Idempotency keys</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Prevent duplicate operations on retry</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #d63031;">Does not exist</span></td>
      </tr>
    </tbody>
  </table>

  <h3 id="mitigation-recommendations" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.5 Mitigation Recommendations</h3>

  <ol style="font-size: 14px;">
    <li><strong>Focus governance on the NS-GM chokepoint.</strong> All Helix-initiated Tool mode record operations flow through the RESTlet. Adding governance here (before-image, audit, rollback) provides baseline safety for direct record operations.</li>
    <li><strong>Use the RSH-411 inference pipeline for visibility.</strong> Enumerate user-event scripts per record type to surface side-effect risks before a tool executes. The inference pipeline mines existing SDF metadata to identify scripts deployed on each record type. <em>(Source: <code>library:reports/RSH-411/report.md</code> &mdash; inference-first model)</em></li>
    <li><strong>Accept the structural leak as a documented boundary.</strong> Tool mode governs what it controls (NS-GM chokepoint). SDF-deployed autonomous scripts are outside the channel. Document this as a known limit.</li>
    <li><strong>Consider governance-aware SuiteScript templates.</strong> For future deployed scripts (via BUILD/FIX/EXECUTE modes), provide templates that log operations through a governance endpoint, extending the governed channel to deployed code over time.</li>
  </ol>

  <!-- ============================================================ -->
  <!-- SECTION 5: TIER-2 DERIVED-INVERSE SAFETY -->
  <!-- ============================================================ -->
  <h2 id="tier-2-derived-inverse-safety" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">5. Tier-2 Derived-Inverse Safety</h2>

  <p>This section answers <strong>Research Question 4</strong>: How safe is Tier-2 rollback under concurrent modifications, and what guards are recommended?</p>

  <h3 id="optimistic-concurrency-via-datelastmodified" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.1 Optimistic Concurrency via <code>dateLastModified</code></h3>

  <p>NetSuite records expose a <code>dateLastModified</code> field queryable via SuiteQL. Since NetSuite provides no pessimistic record-level locking API, optimistic concurrency is the only viable approach:</p>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <ol style="margin: 0; font-size: 14px;">
      <li><strong>Capture</strong>: When loading the before-image (<code>record.load({type, id})</code>), record <code>dateLastModified</code> alongside all field values.</li>
      <li><strong>Execute</strong>: Perform the tool's write operations (create, update, void).</li>
      <li><strong>Before undo</strong>: If rollback is needed, re-check <code>dateLastModified</code> before applying the inverse.</li>
      <li><strong>Decision</strong>:
        <ul>
          <li>If <code>dateLastModified</code> unchanged &rarr; safe to apply inverse.</li>
          <li>If <code>dateLastModified</code> changed &rarr; <strong>escalate</strong>: pause execution, alert human, show what changed.</li>
        </ul>
      </li>
    </ol>
  </div>

  <p style="font-size: 14px;"><em>Source: Context7 &mdash; NetSuite records have <code>lastmodifieddate</code> field queryable via SuiteQL (<code>SELECT lastmodifieddate FROM transaction WHERE id = :id</code>).</em></p>

  <h3 id="concurrency-window-analysis" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.2 Concurrency Window Analysis</h3>

  <p>The vulnerability window is the time between before-image capture and undo attempt:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Scenario</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Window Size</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Risk Level</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Recommended Guard</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Immediate rollback (user clicks undo)</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Seconds</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #00b894; font-weight: 600;">Low</span></td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><code>dateLastModified</code> check</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Delayed rollback (issue found hours later)</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Hours</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #e17055; font-weight: 600;">Medium</span></td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Re-load record + field-level diff before undo</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Long-running multi-step tool undo</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Days</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="color: #d63031; font-weight: 600;">High</span></td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Fresh before-image per record + human review</td>
      </tr>
    </tbody>
  </table>

  <h3 id="sandbox-validation-coverage-limits" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.3 Sandbox Validation Coverage Limits</h3>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-weight: 600; font-size: 14px;">Sandbox proves logic, not data.</p>
    <ul style="margin: 8px 0 0 0; font-size: 14px;">
      <li>Sandbox data diverges from production (stale by days or weeks)</li>
      <li>Custom field configurations, mandatory fields, and custom segments may differ between environments</li>
      <li>A sandbox-validated inverse may fail on production data with different field configurations</li>
      <li>User-event script deployments may differ between sandbox and production</li>
    </ul>
    <p style="margin: 8px 0 0 0; font-size: 14px;"><strong>Recommendation:</strong> Sandbox validates the <em>shape</em> of the inverse (API calls succeed, field types match). Production execution always uses a <em>fresh</em> before-image captured immediately before the operation.</p>
  </div>

  <h3 id="tier-2-to-tier-1-promotion-criteria" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.4 Tier-2 to Tier-1 Promotion Criteria</h3>

  <p>Stable Tier-2 inverses can be <strong>promoted</strong> to the Tier-1 library (the flywheel / moat) when all criteria are met:</p>

  <ol style="font-size: 14px;">
    <li>Inverse has been sandbox-validated (shape correctness)</li>
    <li>Inverse has been successfully applied in production N times without escalation (empirical confidence)</li>
    <li>No account-specific user-event scripts introduce Tier-3 side effects on the involved record types (side-effect clearance)</li>
    <li>Promoted with <strong>account-specific annotation</strong> &mdash; Tier-1 in one account does not automatically mean Tier-1 in another</li>
  </ol>

  <!-- ============================================================ -->
  <!-- SECTION 6: IDEMPOTENCY -->
  <!-- ============================================================ -->
  <h2 id="idempotency-and-double-submit-prevention" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">6. Idempotency &amp; Double-Submit Prevention</h2>

  <p>This section answers <strong>Research Question 5</strong>: How do we prevent a tool run from double-applying operations (e.g., double-posting a bill) on retry or double-click?</p>

  <h3 id="three-layer-defense" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.1 Three-Layer Defense</h3>

  <div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 200px; background: #e8f5e9; border-top: 4px solid #4caf50; border-radius: 6px; padding: 16px;">
      <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 15px;">Layer 1: externalId Deduplication</h4>
      <p style="margin: 0; font-size: 13px;"><strong>Where:</strong> NetSuite-side</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;"><code>record.create()</code> supports an <code>externalId</code> field. Setting a deterministic external ID before create ensures that a retry performs an <strong>upsert</strong> (update existing) rather than creating a duplicate record.</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;"><strong>Limitation:</strong> Only works for create operations. Does not prevent duplicate voids, deletes, or field updates.</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #555;"><em>Source: Context7 N/record docs &mdash; externalId field for record creation and upsert semantics.</em></p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #e3f2fd; border-top: 4px solid #2196f3; border-radius: 6px; padding: 16px;">
      <h4 style="margin: 0 0 8px 0; color: #1565c0; font-size: 15px;">Layer 2: Forward Log Operation IDs</h4>
      <p style="margin: 0; font-size: 13px;"><strong>Where:</strong> Governance layer (Helix server)</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;">The governance layer assigns a unique <strong>operation ID</strong> per tool execution step. Before executing: check if this operation ID already completed in the forward log. The idempotency key prevents re-execution of completed operations.</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;"><strong>Bonus:</strong> The forward log also enables ordered inverse replay for rollback &mdash; dual purpose.</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #fce4ec; border-top: 4px solid #e91e63; border-radius: 6px; padding: 16px;">
      <h4 style="margin: 0 0 8px 0; color: #c62828; font-size: 15px;">Layer 3: Pre-Execution Existence Checks</h4>
      <p style="margin: 0; font-size: 13px;"><strong>Where:</strong> Tool logic</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;">Before creating a record, query NetSuite for existing records matching expected criteria. Example: before creating a vendor bill, check for existing bills with the same vendor + bill number + amount.</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;"><strong>Limitation:</strong> Matching criteria are record-type-specific and may have edge cases (e.g., same vendor/amount but different date).</p>
    </div>
  </div>

  <h3 id="invoice-double-post-example" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.2 Example: Preventing Invoice Double-Post</h3>

  <p>A tool that creates invoices from sales orders must prevent double-posting on retry:</p>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px 20px; margin: 16px 0; font-size: 14px;">
    <ol style="margin: 0;">
      <li><strong>Layer 1:</strong> Set <code>externalId</code> to a deterministic value derived from the tool execution ID + SO number (e.g., <code>TOOL-42-SO-1001</code>). If the invoice already exists with this externalId, NetSuite updates instead of creating.</li>
      <li><strong>Layer 2:</strong> Check the forward log for operation ID <code>create-invoice-SO-1001</code>. If marked completed, skip execution.</li>
      <li><strong>Layer 3:</strong> Query for existing invoices linked to SO-1001 that were created by a Tool mode operation. If found, skip or prompt for confirmation.</li>
    </ol>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 7: REUSE AUDIT -->
  <!-- ============================================================ -->
  <h2 id="reuse-audit" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">7. Reuse Audit</h2>

  <p>This section answers <strong>Research Question 6</strong>: What of the above already exists in the EXECUTE mode and NS-GM infrastructure versus what must be built net-new?</p>

  <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Context:</strong> EXECUTE mode deploys SuiteScript code and SDF objects via SuiteCloud CLI &mdash; it does not execute individual record operations. Tool mode needs different infrastructure. However, the surrounding ecosystem (credentials, approval, audit patterns, platform config) is directly reusable.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px;"><em>Source: <code>platform-config.ts</code> lines 65-86; <code>deploy-phase.ts</code> &mdash; SDF project:deploy workflow.</em></p>
  </div>

  <h3 id="reusable-infrastructure" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.1 Reusable Infrastructure</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 12px; text-align: left; border: 1px solid #2d3436;">Component</th>
        <th style="padding: 10px 12px; text-align: left; border: 1px solid #2d3436;">File Reference</th>
        <th style="padding: 10px 12px; text-align: left; border: 1px solid #2d3436;">Reuse Assessment</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #e8f5e9;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">NS-GM RESTlet Gateway</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-server:netsuite-setup/FileCabinet/SuiteScripts/ns_gm_restlet.js</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #2e7d32; font-weight: 600;">High</span> &mdash; Execution pipe exists with 24 N/* modules loaded. Needs governance wrapper (before-image, audit, rollback).</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">OAuth 2.0 M2M Credentials</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-server:src/helix-workflow/ns-gm-credentials.ts</code><br><code>helix-global-server:src/services/ns-gm-credential-test-service.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #2e7d32; font-weight: 600;">Direct reuse</span> &mdash; Production-ready AES-256-GCM encryption with key rotation. PS256 JWT client assertion for token exchange.</td>
      </tr>
      <tr style="background: #e8f5e9;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Environment Resolution</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-server:src/helix-workflow/orchestrator/credentials.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #e17055; font-weight: 600;">Reusable with modification</span> &mdash; Currently: scout/diagnosis = PRODUCTION, all else = SANDBOX. Needs new PRODUCTION path for approved Tool mode writes.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Platform Config + EXECUTE Mode</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-server:src/lib/platform-config.ts</code><br><code>helix-global-server:src/controllers/ticket-controller.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #2e7d32; font-weight: 600;">Extends naturally</span> &mdash; NETSUITE platform config, TicketMode enum, API enforcement pattern all extend to TOOL mode.</td>
      </tr>
      <tr style="background: #e8f5e9;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Approval Gates</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-client:src/api/approval.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #2e7d32; font-weight: 600;">Reusable</span> &mdash; PENDING &rarr; APPROVED | NEEDS_DEFENSE flow. <code>directToProductionEnabled</code> toggle already exists for production-path approval.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">InspectionAuditLog Pattern</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-server:src/services/inspection-audit-service.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #e17055; font-weight: 600;">Pattern reusable</span> &mdash; Fire-and-forget Prisma write. Extend with write-operation types (RECORD_CREATE, RECORD_UPDATE, RECORD_DELETE, TRANSACTION_VOID).</td>
      </tr>
      <tr style="background: #e8f5e9;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Credential Readiness UI</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-global-client:src/components/ns-readiness-banner.tsx</code><br><code>helix-global-client:src/api/settings.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #2e7d32; font-weight: 600;">Reusable</span> &mdash; Readiness status for SANDBOX + PRODUCTION NS-GM credentials, SDF credentials.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">CLI Mode Flag</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>helix-cli:src/tickets/create.ts</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><span style="color: #2e7d32; font-weight: 600;">Extensible</span> &mdash; <code>--mode EXECUTE</code> extends to <code>--mode TOOL</code>. VALID_MODES array updated.</td>
      </tr>
    </tbody>
  </table>

  <h3 id="net-new-capabilities" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.2 Net-New Capabilities Required</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #d63031; color: #fff;">
        <th style="padding: 10px 12px; text-align: left; border: 1px solid #d63031;">Capability</th>
        <th style="padding: 10px 12px; text-align: left; border: 1px solid #d63031;">Gap Description</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Before-image capture</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">No pre-mutation record snapshot exists anywhere in the codebase. Must capture full record state via <code>record.load()</code> before any write operation.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Write-operation audit model</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">InspectionAuditLog covers read queries only (DATABASE/LOGS/API). Needs write-operation types and before/after state storage.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Rollback engine</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">No reversal mechanism &mdash; manual only today. Must replay inverses from forward log in reverse order.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Atomic-inverse library</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Does not exist. Must be researched, curated, and maintained. This report provides the first-cut seed (Section 3).</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Production dry-run mechanism</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">No production preview mechanism. CLI <code>--dry-run</code> (<code>helix-cli:src/tickets/continue.ts</code>) is client-side payload preview only. Must build in-memory projection and transform-chain preview.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Governance envelope on RESTlet</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">RESTlet passes raw code via <code>new Function()</code>; no interception layer. Must add operation-type classification and governance hooks without breaking existing usage.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Ordered forward log</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">No execution log for ordered operation recording. Required for inverse replay (rollback), idempotency, and audit.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Idempotency keys</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">No double-submit protection exists. Must implement <code>externalId</code> + forward-log operation IDs + existence checks.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Concurrency/drift detection</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">No optimistic-concurrency checks on records. Must implement <code>dateLastModified</code> comparison before undo operations.</td>
      </tr>
    </tbody>
  </table>

  <h3 id="bld-634-adjacency" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.3 BLD-634 Adjacency Note</h3>

  <p style="font-size: 14px;">BLD-634 (direct production deploy/creation with explicit approval) is architecturally adjacent to Tool mode. The <code>directToProductionEnabled</code> flag already exists in the approval system (<code>helix-global-client:src/api/approval.ts</code>), confirming the production-path approval gate pattern is partially implemented. BLD-634 artifacts were not found at <code>.helix-refs/BLD-634/</code> despite the ticket claiming 56 materialized artifacts, so deep adjacency analysis was not possible. This should be revisited when BLD-634 artifacts are accessible.</p>

  <!-- ============================================================ -->
  <!-- SECTION 8: TIER-3 PREVIEW FIDELITY -->
  <!-- ============================================================ -->
  <h2 id="tier-3-preview-fidelity-and-fallback" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">8. Tier-3 Preview Fidelity &amp; Fallback</h2>

  <p>This section provides the <strong>Tier-3 preview fidelity recommendation</strong>: how faithful production preview can realistically be for irreversible actions, and the fallback strategy when no high-fidelity dry-run exists.</p>

  <h3 id="tier-3-definition" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.1 Tier-3 Definition</h3>

  <p>Tier-3 actions are those with <strong>no inverse</strong>. Once executed, they cannot be undone:</p>
  <ul style="font-size: 14px;">
    <li><strong>Email sends</strong> (<code>N/email.send()</code>) &mdash; a sent email cannot be recalled</li>
    <li><strong>External HTTP calls</strong> (<code>N/https.post()</code>) &mdash; data sent to third parties cannot be retracted</li>
    <li><strong>Physical fulfillment</strong> &mdash; once goods ship, the fulfillment is irreversible</li>
    <li><strong>Payment captures</strong> &mdash; payment processor charges are irreversible (refund is compensation, not inverse)</li>
    <li><strong>Webhook/integration triggers</strong> &mdash; downstream system state changes cannot be recalled</li>
  </ul>

  <h3 id="achievable-preview-fidelity" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.2 Achievable Preview Fidelity</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">What Preview CAN Show</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">What Preview CANNOT Show</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; background: #e8f5e9; vertical-align: top;">
          <ul style="margin: 0; padding-left: 16px;">
            <li>Field values and sourced-field computations (in-memory projection)</li>
            <li>Transform chain output: what the resulting record would look like (structure, line items)</li>
            <li>Input parameters and expected record shape</li>
            <li>Known side-effect annotations from the inverse library</li>
            <li>User-event script list (from inference pipeline) that will fire on save</li>
          </ul>
        </td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; background: #ffebee; vertical-align: top;">
          <ul style="margin: 0; padding-left: 16px;">
            <li>User-event script effects (what afterSubmit scripts will actually do)</li>
            <li>External system responses (third-party API results)</li>
            <li>Email delivery outcome</li>
            <li>Tax and GL impact (computed only on save)</li>
            <li>Approval routing decisions</li>
            <li>Workflow transition effects</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>

  <div style="background: #e8eaf6; border-left: 4px solid #5c6bc0; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Required preview fidelity scales with reversibility tier.</strong> Tier-3 needs the <em>most</em> faithful preview because there is no undo. Yet Tier-3 is precisely where preview fidelity is lowest (user-event effects, external responses are unknowable pre-execution). This is the fundamental tension. The fallback strategy addresses it.</p>
  </div>

  <h3 id="fallback-strategy" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.3 Fallback Strategy</h3>

  <p>When no high-fidelity dry-run exists for a Tier-3 action, the fallback is a four-step protocol:</p>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <ol style="margin: 0; font-size: 14px;">
      <li style="margin-bottom: 12px;">
        <strong style="color: #0984e3;">Show the human what will happen</strong> &mdash; Projection of inputs and expected outputs. List which user-event scripts will fire (from inference). Surface known side-effect annotations from the inverse library. Make the limitations of the preview explicit ("Tax and GL impact will be computed on save; user-event script effects are not previewed").
      </li>
      <li style="margin-bottom: 12px;">
        <strong style="color: #d63031;">Require explicit human approval</strong> &mdash; Tier-3 actions must <strong>never</strong> auto-approve. This is the unconditional authorization rule. Even in triggered/automated contexts (Rung 2), Tier-3 actions must escalate to a human. The approval gate exists (<code>helix-global-client:src/api/approval.ts</code>) and is reusable.
      </li>
      <li style="margin-bottom: 12px;">
        <strong style="color: #6c5ce7;">Execute with full audit trail</strong> &mdash; Every operation is recorded in the ordered forward log with: operation ID, timestamp, record type, record ID, before-image (if applicable), after-image, operation result, and user who approved.
      </li>
      <li style="margin-bottom: 12px;">
        <strong style="color: #e17055;">Provide best-effort compensation</strong> &mdash; Not a true inverse. Examples: correction email, refund request, manual reversal instructions. This compensation is <strong>explicitly labeled as NOT a true inverse</strong> so users understand the limitation.
      </li>
    </ol>
  </div>

  <h3 id="tier-3-as-autonomy-boundary" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.4 Tier-3 as Autonomy Boundary</h3>

  <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 6px; padding: 16px 20px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #c62828;">The Authorization Rule</p>
    <p style="margin: 8px 0 0 0; font-size: 14px;">Tier-3 actions must <strong>not</strong> run fully autonomously without explicit human-set bounds. This is not a safety recommendation &mdash; it is the design-time authorization rule for Tool mode. A tool containing Tier-3 leaves may run at Rung 2 (triggered) only if: (a) the trigger scope is within pre-approved bounds, (b) each Tier-3 action was individually approved at design time, and (c) circuit-breaker limits are set (max executions, max affected records, timeout).</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 9: OPEN QUESTIONS & FUTURE WORK -->
  <!-- ============================================================ -->
  <h2 id="open-questions-and-future-work" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">9. Open Questions &amp; Future Work</h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436; width: 5%;">#</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436; width: 30%;">Question / Area</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Status &amp; Recommendation</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">1</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">BLD-634 convergence</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Artifacts not found at <code>.helix-refs/BLD-634/</code>. The <code>directToProductionEnabled</code> flag confirms partial implementation. Revisit when BLD-634 artifacts are accessible to assess shared approval-gate infrastructure.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">2</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">ns-gm CLI source</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">The CLI is an external npm package installed in <code>native-phase.ts</code>. Its internal implementation may contain governance features not visible from codebase analysis. Recommend CLI source review.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">3</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">User-event script enumeration</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Account-dependent. Tier-1 classification depends on what scripts are deployed per record type. Recommend runtime enumeration using the RSH-411 inference pipeline before tool execution.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">4</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">REVERSALVOIDING variability</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Void semantics differ per account. Must check at runtime via <code>config.load({type: config.Type.ACCOUNTING_PREFERENCES})</code>. Document in tool metadata which void mode is used.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">5</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Quarantined-save feasibility</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Not a first-class NetSuite API. Custom implementation per record type (custom status fields, approval-hold workflows). Defer to implementation phase; start with projection-only preview.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">6</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Triggered automation (Rung 2)</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Deferred to implementation phase. Tool mode must be designed so triggers (cron/event) can invoke tools. Preview becomes a guardrail/circuit-breaker in triggered mode.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">7</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Tier-2 promotion flywheel</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Mechanism described (Section 5.4) but not designed. Requires: success-count tracking, cross-account annotation, and review workflow for promotion decisions.</td>
      </tr>
    </tbody>
  </table>

  <!-- ============================================================ -->
  <!-- EVIDENCE APPENDIX -->
  <!-- ============================================================ -->
  <h2 id="evidence-sources" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">Evidence Sources</h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #636e72; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #636e72;">Source</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #636e72;">Type</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #636e72;">Key Finding Used</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>ns_gm_restlet.js</code> (lines 163-189)</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Raw <code>new Function()</code> execution; no governance wrapper</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>inspection-audit-service.ts</code></td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">InspectionAuditLog covers reads only (DATABASE/LOGS/API)</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>platform-config.ts</code> (lines 65-86)</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE is NETSUITE-only; same sandboxDeploy workflow</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>credentials.ts</code> (lines 4-14)</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Environment resolution: PRODUCTION for scout/diagnosis, SANDBOX for all else</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>approval.ts</code></td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>directToProductionEnabled</code> flag; PENDING &rarr; APPROVED | NEEDS_DEFENSE</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>prisma/schema.prisma</code></td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">TicketMode enum includes EXECUTE; no TOOL mode; no write-audit models</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Context7: <code>N/record</code></td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">API Documentation</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>record.create()</code>, <code>record.transform()</code>, <code>record.load()</code> API behavior</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Context7: <code>N/transaction</code></td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">API Documentation</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>transaction.void()</code> API; REVERSALVOIDING preference behavior</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Context7: User Event Scripts</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">API Documentation</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>beforeSubmit</code>/<code>afterSubmit</code> fire only on <code>record.save()</code></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">NS-GM SKILL.md</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Skill Config</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Production read-only by policy, not technical enforcement</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">netsuite-objects SKILL.md</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Skill Config</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">10 SDF script types with autonomous execution</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>RSH-411/report.md</code></td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Adjacent Research</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Inference-first model for SDF script enumeration; governance patterns</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Codebase search (grep)</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Code Analysis</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">Zero matches for before-image, rollback, undo, compensating-action implementations</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <div style="border-top: 2px solid #dee2e6; margin-top: 48px; padding-top: 20px;">
    <p style="font-size: 13px; color: #636e72; margin: 0;">RSH-702 | Feasibility Report | Generated June 5, 2026</p>
    <p style="font-size: 13px; color: #636e72; margin: 4px 0 0 0;">Referenced tickets: BLD-634, RSH-411</p>
  </div>

</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-06T02:30:56.717Z) [Agent]: Your research report is ready!
- **Helix** (2026-06-06T04:32:46.867Z) [Agent]: Your research report is ready!
- **Usher** (2026-06-06T19:55:46.437Z) [Helix]: @Helix What if we had the option, for map and reduce, to have agent generated queries and scripts live
- **Helix** (2026-06-06T19:56:02.583Z) [Agent]: Great question — this would be a powerful extension to the Play model. Here's how it could work:

**Agent-Generated Map & Reduce (Live Mode)**

Instead of pre-written, static SuiteQL queries or scripts, the agent would **generate them on the fly** based on the play's intent and the current context. A few angles to consider:

**Upside**
- Much more flexible — the play adapts to varying inputs without needing a human to pre-author every query
- The agent can reason about the data shape it's working with and craft the right query/transform in the moment
- Opens the door to truly dynamic plays that handle edge cases gracefully

**Things to think through**
- **Safety & predictability** — Live-generated queries are harder to audit ahead of time. You'd want the agent to explain what it's about to run before it runs it, especially for map (reads) and definitely before reduce (transforms)
- **Preview story** — This actually *helps* the preview model: you could show the user the generated query/script before executing, making the "taste of preview" for outputs more achievable
- **Guardrails** — You'd still want to enforce read-only constraints on map/reduce even when generated live. The agent shouldn't be able to accidentally slip in a write
- **Logging** — The generated query/script itself becomes a key artifact to log, so you can reproduce or audit what actually ran

**A possible middle ground**: let plays support both modes — static (authored) queries for reliability and repeatability, and agent-generated (live) queries for flexibility — with the mode being explicit per step. That way teams can opt into the power where they want it, with eyes open.

Does this align with what you were thinking, or were you imagining it more as a default behavior for all plays?
- **Usher** (2026-06-06T19:57:35.308Z) [Helix]: What would be an easier start? To default to agent generated and later bring in static? Or start with both?
- **Helix** (2026-06-06T19:57:47.138Z) [Agent]: Starting with **agent-generated only** is the easier path, and here's why:

**Start with agent-generated (recommended)**
- One mode to build, test, and reason about — less surface area for the MVP
- You learn what queries/scripts agents actually produce in practice, which informs what "static" should even look like
- The preview story still works: show the user the generated query before running it
- You can harden it iteratively once you see real usage patterns

**Starting with both**
- Doubles the implementation and UI complexity upfront
- You'd need to design the authoring experience for static plays before you fully understand the use cases
- Risk of over-engineering before you've validated the core loop

**The natural migration path** would be:
1. MVP: agent generates everything, logs the output (query/script becomes an artifact)
2. V2: let users "promote" a generated query to a static one — they see it worked, they lock it in. This makes the static authoring experience feel earned rather than speculative.

That promotion mechanic is also a nice UX story — the agent teaches you what the play should look like, and you graduate it to a reproducible, auditable artifact when you're ready.
- **Usher** (2026-06-06T19:58:24.230Z) [Helix]: Maybe we can enforce the output shape
- **Helix** (2026-06-06T19:58:36.999Z) [Agent]: That's a really smart guardrail. Enforcing the output shape would give you the best of both worlds — the flexibility of agent-generated queries with the predictability of static ones.

Here's how it could play out:

**Enforce the shape, not the implementation**
- Each play step declares its expected output schema upfront (e.g., "return a list of records with these fields")
- The agent generates whatever query/script it wants, but the result is validated against that schema before moving to the next step
- If the shape doesn't match, the play fails fast and clearly — rather than silently passing bad data downstream

**Why this is powerful**
- **Composability** — steps can reliably chain together because outputs are predictable, even if the internals vary
- **Monitoring** — you know exactly what to measure and alert on at each step boundary
- **Preview** — you can show the user a sample of the output (conforming to the shape) before any effects are applied
- **Agent accountability** — the agent is evaluated not just on "did it run" but "did it produce the right shape"

**A nice side effect**: the output shape declaration essentially becomes the contract between steps. That makes plays much easier to debug, version, and reuse across different contexts.

This could also be the foundation of the "taste of preview on outputs" you mentioned in the ticket — if you know the shape, you can dry-run the output transformation and show what *would* be written before anything is committed.
- **Usher** (2026-06-06T19:59:09.094Z) [Helix]: Nice
- **Helix** (2026-06-06T19:59:16.266Z) [Agent]: Glad it's landing well! The shape enforcement idea really does tie the whole play model together nicely. Let me know when you're ready to move forward with building it out.
- **Usher** (2026-06-06T19:59:44.927Z) [Helix]: So a play would have 3 steps
- **Helix** (2026-06-06T19:59:56.475Z) [Agent]: Based on the ticket description, yes — a play naturally breaks into 3 steps:

1. **Map** — gather the data (SuiteQL queries, read-only; agent-generated)
2. **Reduce** — transform the data (scripts or further agent calls; agent-generated)
3. **Output/Effects** — act on the results (record writes, API calls, emails/messages)

The first two are fully previewable since they're read-only. The third is where you get the "taste of preview" — and with output shape enforcement, you can show the user exactly *what would be written* before anything is committed.

Clean three-step model. Does that feel right, or are you thinking the steps could be more granular/composable within each?
- **Usher** (2026-06-06T20:00:35.357Z) [Helix]: Tell me more
- **Helix** (2026-06-06T20:00:49.872Z) [Agent]: Sure! Here's a deeper look at how each of the three steps would work together:

---

**Step 1 — Map (Gather)**
The agent generates SuiteQL queries based on the play's intent. These are read-only, so they're completely safe to run and preview. The output is a structured dataset — and because we enforce the output shape, downstream steps always know exactly what they're receiving.

**Step 2 — Reduce (Transform)**
The agent takes the mapped data and transforms it — through scripts, further agent reasoning, or both. Again, read-only. This is where business logic lives: filtering, enriching, aggregating, or reshaping the data into something actionable. Fully previewable.

**Step 3 — Output/Effects (Act)**
This is where things happen: writing records, calling external APIs, sending emails or messages. Because the output shape is declared upfront, you can do a **dry-run** — showing the user exactly what *would* be written before anything is committed. That's your "taste of preview" for the otherwise-risky part.

---

**What makes this model compelling:**

- **Each step is an artifact** — the generated query, the transformed data, and the intended effects are all logged and inspectable
- **Steps are composable** — because shapes are enforced at each boundary, you can mix and match steps across different plays
- **Progressive trust** — you preview Map and Reduce freely, then get a dry-run of Output before pulling the trigger
- **The user stays in control** — they can see what's about to happen at every stage and choose to proceed or not

The whole thing is essentially a pipeline where the agent does the heavy lifting, but the user has full visibility and sign-off before anything irreversible happens.

Want to go deeper on any particular step, or talk through how the dry-run / preview for Output/Effects would work?
- **Usher** (2026-06-06T20:02:23.074Z) [Helix]: I think a nice compromise to what you said above about accepting both an agent version and a code version, could be aan agent prompt that includes a sample
- **Helix** (2026-06-06T20:02:34.806Z) [Agent]: That's a really elegant middle ground. An agent prompt that **includes a sample** gives you:

- **Flexibility** — the agent can still adapt and generate the query/script for the current context
- **Grounding** — the sample acts as a concrete reference, showing the agent exactly what a good output looks like
- **Implicit shape enforcement** — the sample demonstrates the expected structure without needing a formal schema declaration

It's essentially few-shot prompting applied to the play model. The agent sees the intent *and* a canonical example, so it's not working from a blank slate — it's interpolating from something known to work.

This also maps nicely to point 3 in your ticket: running plays in sandbox with canonical examples. The sample in the prompt *is* the canonical example — it serves double duty as both a guiding input for the agent and a reference for what "good" looks like when reviewing or auditing the output.

And if you log what the agent generated alongside the sample it was given, you get a really clean audit trail: "here's what we asked for, here's the example we showed, here's what it produced."

Want to think through what that prompt structure would look like, or how samples would be authored and stored per play?
- **Usher** (2026-06-06T20:05:58.835Z) [Helix]: Ok so we are getting closer. The Helix ticket to create the play, maps the original ticket to a play with 3 compostable parts.

The first 2 are agent prompts, the prompts have a sample query/transformation, as well as an enforced (by code) output shape (JSON?). The 3rd is a script
- **Helix** (2026-06-06T20:06:11.024Z) [Agent]: That's a really clean definition. To recap what you're landing on:

**A Play has 3 composable parts:**

1. **Map (Agent Prompt)** — includes a sample SuiteQL query as a grounding example; output shape enforced by code (JSON schema)
2. **Reduce (Agent Prompt)** — includes a sample transformation; output shape enforced by code (JSON schema)
3. **Output/Effects (Script)** — deterministic, authored code that acts on the shaped data from step 2

**Why this works well:**
- Steps 1 & 2 are fully previewable — the agent generates, but the shape is guaranteed at the boundary
- Step 3 being a script (not agent-generated) is a smart call — effects are the highest-stakes part, so having deterministic, auditable code there is the right tradeoff
- The sample in the prompt serves as both a canonical example *and* an implicit contract for what the agent should produce
- JSON shape enforcement means each step's output is machine-verifiable before passing to the next

**One thing worth nailing down:** how the Helix ticket maps to a play. Is the idea that Helix analyzes the ticket description and *generates* the three parts (prompts + sample + script skeleton), or does the user author the parts with Helix assisting? Or both?
- **Usher** (2026-06-06T20:09:05.814Z) [Helix]: There's two parts. The creation of the play (one time) and the execution of the play (as many times as necessary)
- **Helix** (2026-06-06T20:09:16.568Z) [Agent]: Exactly right — and that separation is a clean architectural boundary:

**Creation (one-time)**
Helix analyzes the ticket and generates the play: the two agent prompts (with sample queries/transformations and enforced output shapes) and the output/effects script. This is a design-time artifact — authored once, validated in sandbox with canonical examples, and stored as a reusable play.

**Execution (many times)**
The play is run against real inputs. Each run goes through the three steps in sequence, with the shaped outputs flowing between them. Everything is logged — the generated queries, the transformed data, what the script did — so every execution is fully auditable.

This also clarifies the preview story nicely:
- **Creation time** — you validate the play in sandbox with sample inputs to prove it works
- **Execution time** — the user can preview Map and Reduce outputs before triggering the Output/Effects script

Does the creation flow live entirely within the Helix ticket system, or do you envision a separate "play builder" UI for authoring/editing plays after the initial generation?
- **Usher** (2026-06-06T20:12:46.127Z) [Helix]: I don't think a play builder is the way to go for now
- **Helix** (2026-06-06T20:12:52.265Z) [Agent]: Makes sense — keeping creation fully within the Helix ticket system for now is the simpler path. You get a play generated from the ticket, validated in sandbox, and ready to execute, without adding a separate UI surface to build and maintain.

When you're ready to move forward with the implementation, just say the word.
- **Usher** (2026-06-06T20:13:24.754Z) [Helix]: I think it becomes a "build your own agent" of we make them do it
- **Helix** (2026-06-06T20:13:32.742Z) [Agent]: Totally agree — if users have to manually author the prompts, samples, and scripts themselves, you've just rebuilt a DIY agent framework, which is a much heavier lift and a different product entirely.

The value of Helix generating the play from the ticket is that the user describes *what they want*, and Helix figures out the *how* — the right SuiteQL approach, the transformation logic, the output script. The user's job is to review and approve, not to build.

That's the "ticket-to-play" magic. Keep it that way.
- **Usher** (2026-06-06T20:14:12.665Z) [Helix]: Do you think this is a valuable product? Realistically
- **Helix** (2026-06-06T20:14:26.851Z) [Agent]: Honestly, yes — and here's why I think so:

**The core insight is real.** Most automation tools make you choose between flexibility (write your own code) and accessibility (use a rigid no-code builder). This sits in a genuinely different spot: you describe intent, Helix generates the machinery, and you review rather than build. That's a meaningful unlock.

**The three-part structure is sound.** Map → Reduce → Output/Effects mirrors how real business processes actually work, and having the first two be agent-generated (but shape-enforced) while keeping effects as deterministic scripts is a smart risk model. It's not just philosophically clean — it means you can actually trust it.

**The audit/preview story matters to enterprise buyers.** NetSuite customers are accountants, ops teams, and finance people. They are deeply skeptical of automation that does things they can't inspect. The fact that every run is logged, every step is previewable, and effects require a dry-run before commit — that's not just a nice feature, that's the thing that gets it past procurement.

**Where I'd be realistic:** The quality of the generated plays will live or die on how well Helix understands NetSuite's data model and the nuances of SuiteQL. If the Map step generates queries that don't quite fit the real schema, users will lose trust fast. The sandbox validation with canonical examples (point 3 in your ticket) is the key risk mitigator here — it has to be tight.

But the fundamental idea? Yes. It's valuable. "Describe what you want, get a reviewable, auditable, repeatable automation" is a strong product for the NetSuite space specifically.
- **Usher** (2026-06-06T20:15:26.457Z) [Helix]: Ok so we have the anatomy of a play nailed dpwn
- **Helix** (2026-06-06T20:15:33.587Z) [Agent]: Yes, and it's a clean one:

1. **Map** — agent prompt with a sample SuiteQL query, JSON output shape enforced by code
2. **Reduce** — agent prompt with a sample transformation, JSON output shape enforced by code
3. **Output/Effects** — a deterministic script that acts on the shaped data

Creation happens once via the Helix ticket system. Execution happens as many times as needed, with full logging and preview at every step.

Ready to start building when you are.
- **Usher** (2026-06-06T20:16:46.532Z) [Helix]: Now sandbox "canonical examples" generation
- **Helix** (2026-06-06T20:17:09.381Z) [Agent]: Great next piece to nail down. Here's how canonical example generation could work:

**The goal:** Before a play is ever run on real data, you have a small set of realistic inputs that prove the play works end-to-end in sandbox.

**How generation would work:**

1. **Helix analyzes the play's intent** — it knows what kinds of NetSuite records the Map step will query (e.g., open invoices, vendor bills, inventory items)
2. **ns-gm generates matching sandbox records** — synthetic but realistic, conforming to the actual NetSuite schema for those record types
3. **Helix runs the full play against them** — Map → Reduce → dry-run of Output/Effects
4. **The actual sandbox outputs become the canonical examples** — not hypothetical, but real results from a real run

**What makes a good canonical set:**
- A happy path example (the normal case)
- One or two edge cases (empty result, unusual values, boundary conditions)
- Ideally 3–5 examples total — enough to build confidence, not so many it becomes a test suite maintenance burden

**These examples serve double duty:**
- **Validation at creation time** — proves the play works before anyone runs it in production
- **Regression baseline at execution time** — if something changes, you can re-run against the same examples and compare

The examples would live with the play as its proof of correctness — essentially its "it works, here's the evidence" artifact.

Does ns-gm already have enough smarts to generate domain-specific records from a description, or does it need the play's Map query as a hint for what to generate?
- **Usher** (2026-06-06T20:18:54.614Z) [Helix]: I think they codevelop. You create the query on examples, and you create examples to test the query
- **Helix** (2026-06-06T20:19:04.238Z) [Agent]: That's the right mental model — a feedback loop rather than a linear sequence:

- You sketch the query → it tells you what kinds of examples you need
- You generate examples → they reveal whether the query actually works
- The query gets refined → the examples get updated to match

They converge together until both are solid. The examples aren't just test fixtures — they're part of the play's definition. And the query isn't final until it's proven against real (synthetic) data.

This also means the creation process is inherently iterative, not a one-shot generation. Helix proposes a starting point for both, then the two are tightened in tandem until the canonical run passes end-to-end in sandbox.

Clean. It's essentially TDD for plays — but where the agent writes both the code *and* the tests, with the user reviewing the evidence rather than authoring either.
- **Usher** (2026-06-06T20:19:45.443Z) [Helix]: Yeah so we probably need to build that in to the agents of helix
- **Helix** (2026-06-06T20:19:58.207Z) [Agent]: Exactly — the iterative loop between query generation and example generation can't be a manual back-and-forth. It needs to be baked into how Helix's agents operate during play creation:

- The agent that writes the Map query also knows to signal "here's what kinds of records I need examples of"
- The agent that generates canonical examples feeds results back so the query agent can validate and refine
- This cycles automatically until both converge — the user sees the finished product, not the iteration

In practice, that means the play creation workflow in Helix isn't a single pass — it's a short agentic loop where query and examples co-evolve, and the output is a play that's already been proven in sandbox before the user even reviews it.

The key design question then becomes: **how many iterations does Helix allow before surfacing results to the user?** Too few and the play might not be solid; too many and it becomes slow and opaque. Some kind of convergence signal (e.g., the output shape is satisfied and the examples pass) would be the natural stopping condition.
- **Usher** (2026-06-06T20:20:40.619Z) [Helix]: The truth is, canonical examples is not a "play" thing. It really applies across all types
- **Usher** (2026-06-06T20:20:55.514Z) [Helix]: Well, build and fix
- **Helix** (2026-06-06T20:20:57.618Z) [Agent]: You're right — canonical examples are a broader concept that lives at the platform level, not just within plays.

The same pattern applies anywhere Helix is generating or running something: you want a grounding set of realistic examples to validate against, whether that's a play, a rule in the playbook, an automation, or any other artifact. The co-development loop (generate the logic, generate examples to test it, refine both) is a general capability that plays would *use*, not own.

That's actually a cleaner architecture — canonical examples become a shared primitive that any agent in Helix can invoke, and plays just happen to be one consumer of it.
- **Helix** (2026-06-06T20:21:09.957Z) [Agent]: Right — canonical examples are foundational to both:

- **Build** — you generate examples upfront to prove a new play (or any automation) works before it ever touches production
- **Fix** — when something breaks, the canonical examples become your reproduction case. You run the same inputs, see where it fails, fix it, and confirm the examples pass again

That makes canonical examples a core Helix primitive, not a play-specific feature. Every ticket that produces executable behavior — whether it's a play, a script, an integration — benefits from having a set of "here's what it should do, proven with real synthetic data."

Worth capturing that scope explicitly as the canonical examples work gets built out.
- **Usher** (2026-06-06T20:21:49.437Z) [Helix]: Can you create a ticket to research this
- **Helix** (2026-06-06T20:22:02.515Z) [Agent]: I don't have the ability to create tickets directly — that's something you'd need to do through the ticketing system. But here's a suggested title and description you could use:

---

**Title:** Canonical Examples — Platform-Level Research

**Description:**
Research and design canonical examples as a shared Helix primitive, applicable across all artifact types (plays, scripts, automations, rules, etc.) — not just plays.

Key questions to explore:
1. What does the co-development loop look like between logic generation and example generation? (query ↔ examples refine each other)
2. How are canonical examples stored, versioned, and associated with the artifact they validate?
3. How does this primitive serve both **build** (prove it works before production) and **fix** (reproduce and confirm a failure is resolved)?
4. What's the convergence signal — how does Helix know when examples and logic are "solid enough"?
5. How do ns-gm-generated synthetic records feed into this system?
6. How many agentic iterations should Helix run before surfacing results to the user?

---

Want me to adjust the scope or focus of that description before you create it?
- **Usher** (2026-06-06T20:23:35.293Z) [Helix]: - Where in the current agent flow do they get built
- Let's focus this on Netsuite 
- Do we have any questions about the feasibility
- **Helix** (2026-06-06T20:23:55.191Z) [Agent]: Great set of questions — let me take each one:

---

**Where in the current agent flow do they get built**

During **play creation**, canonical examples would be generated as part of the implementation step — after the Map query and Reduce transformation are drafted but before the play is considered ready. It's the validation gate: the play isn't "done" until it's been run against canonical examples in sandbox and the outputs match the enforced shapes. So it sits between *implementation* and *testing* in the current flow, or could expand what testing means in the play creation context.

---

**Focused on NetSuite**

In NetSuite terms, canonical example generation means:
- **ns-gm** creates realistic sandbox records (invoices, vendor bills, customers, etc.) that match what the Map query expects to find
- The SuiteQL query runs against those records in sandbox
- The Reduce agent transforms the results
- The Output/Effects script does a dry-run against the shaped data

The examples are scoped to NetSuite record types, so Helix needs to know the relevant schema (which record type, which fields matter) to generate meaningful ones — not just generic JSON.

---

**Feasibility questions**

A few open ones worth researching:

1. **ns-gm's depth** — can it generate records with the right field combinations and relationships (e.g., an invoice tied to a customer with specific terms)? Or does it only handle flat record creation?
2. **SuiteQL sandbox fidelity** — does the sandbox reflect the real schema closely enough that a query proven there will reliably work in production?
3. **Convergence control** — how many agent iterations between query refinement and example regeneration is realistic before it gets slow or expensive?
4. **Schema awareness** — does Helix currently have enough NetSuite schema knowledge to know *what* to generate examples of, given a plain-language play description?

That last one is probably the biggest feasibility risk. Want me to flag these as part of the research ticket description?
- **Usher** (2026-06-06T20:25:07.289Z) [Helix]: Nevermind. Just give me a description of canonical examples as it relates to Helix NetSuite, including everything we have discovered
- **Helix** (2026-06-06T20:25:24.148Z) [Agent]: ## Canonical Examples — Helix NetSuite

**What they are**

Canonical examples are a set of realistic, synthetic NetSuite records and their expected outputs used to prove that a play (or any Helix-generated automation) works correctly — before it ever touches production data.

---

**How they're built**

They co-develop alongside the play's logic in a feedback loop:

- Helix drafts the Map query → which tells it what kinds of NetSuite records it needs (e.g., open invoices tied to a specific customer class)
- **ns-gm** generates matching synthetic sandbox records with realistic field values and relationships
- The query runs against those records in sandbox
- The results either validate the query or reveal it needs refinement
- Both the query and the examples are tightened in tandem until the output shape is consistently satisfied

This is agentic and automatic — Helix runs the loop internally and surfaces the finished, proven play to the user.

---

**Where they sit in the flow**

They're generated during **play creation**, after the Map and Reduce steps are drafted but before the play is considered ready. They're the validation gate — a play isn't done until it's been run against canonical examples in sandbox with passing results.

---

**What they cover**

- A **happy path** example (the normal case)
- One or two **edge cases** (empty results, boundary values, unusual field combinations)
- Typically 3–5 examples — enough to build confidence without becoming a maintenance burden

---

**Why they matter beyond plays**

Canonical examples aren't play-specific. They're a platform-level Helix primitive that serves two moments:

- **Build** — prove new logic works in sandbox before it reaches production
- **Fix** — when something breaks, the examples are your reproduction case. You run the same inputs, locate the failure, fix it, and confirm the examples pass again

Any Helix artifact that executes against NetSuite — plays, scripts, rules, integrations — can and should have canonical examples.

---

**Open feasibility questions**

1. How deeply can ns-gm generate related records (e.g., an invoice with the right customer, terms, and line items) vs. flat record creation?
2. Does sandbox SuiteQL fidelity hold closely enough to production that a query proven there will reliably work live?
3. Does Helix have sufficient NetSuite schema awareness to know *what* to generate from a plain-language description alone?
- **Usher** (2026-06-06T20:26:20.279Z) [Helix]: Very bad. Leave out anything "play" related. Just explain the concepts to the best that we have discovered
- **Helix** (2026-06-06T20:26:30.441Z) [Agent]: ## Canonical Examples — Helix NetSuite

**What they are**

Canonical examples are a set of realistic, synthetic NetSuite records and their expected outputs used to prove that a Helix-generated automation works correctly — before it ever touches production data.

---

**How they're built**

They co-develop alongside the automation's logic in a feedback loop:

- Helix drafts a query or transformation → which reveals what kinds of NetSuite records it needs (e.g., open invoices tied to a specific customer class)
- **ns-gm** generates matching synthetic sandbox records with realistic field values and relationships
- The logic runs against those records in sandbox
- The results either validate the logic or reveal it needs refinement
- Both the logic and the examples tighten in tandem until the output is consistently correct

This loop is agentic and automatic — Helix runs it internally and surfaces a finished, proven artifact to the user.

---

**What they cover**

- A **happy path** example — the normal, expected case
- One or two **edge cases** — empty results, boundary values, unusual field combinations
- Typically 3–5 examples total — enough to build confidence without becoming a maintenance burden

---

**Why they matter**

Canonical examples serve two moments:

- **Build** — prove new logic works in sandbox before it reaches production
- **Fix** — when something breaks, the examples are the reproduction case. Run the same inputs, locate the failure, fix it, confirm the examples pass again

---

**Open feasibility questions**

1. How deeply can ns-gm generate related records (e.g., an invoice with the correct customer, terms, and line items) vs. flat record creation?
2. Does sandbox SuiteQL fidelity hold closely enough to production that logic proven there will reliably work live?
3. Does Helix have sufficient NetSuite schema awareness to know *what* to generate from a plain-language description alone?
- **Usher** (2026-06-06T20:26:56.427Z) [Helix]: Beautiful
- **Helix** (2026-06-06T20:27:02.139Z) [Agent]: Glad it landed! Let me know when you're ready to move on to the next piece.
- **Usher** (2026-06-06T20:42:24.645Z) [Helix]: Do another round based on our fleshing out of what a play is
- **Helix** (2026-06-06T20:42:35.382Z) [Agent]: Another round is kicked off! This run has the benefit of everything we fleshed out — the three-part anatomy, the agent-generated Map and Reduce with enforced output shapes, the deterministic effects script, and the co-development loop for canonical examples.
