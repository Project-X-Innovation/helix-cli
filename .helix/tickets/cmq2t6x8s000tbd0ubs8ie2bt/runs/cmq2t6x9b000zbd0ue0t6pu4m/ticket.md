# Ticket Context

- ticket_id: cmq2t6x8s000tbd0ubs8ie2bt
- short_id: RSH-725
- run_id: cmq2t6x9b000zbd0ue0t6pu4m
- run_branch: helix/research/RSH-725-canonical-examples-helix-netsuite
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Canonical Examples — Helix NetSuite

## Description
## **Canonical Examples — Helix NetSuite**

**What they are**

Canonical examples are a set of realistic, synthetic NetSuite records and their expected outputs used to prove that a Helix-generated automation works correctly — before it ever touches production data.



There are two aspects to this.

1) As quality assurance 

2) But mainly, as way of clearly demonstrating to the user that this work the way they intended. For everything helix creates, the user who is not technical, can never be sure it matches his intent. This is the main point of canonical examples. As a demonstration of comprehension, and, expectation 

---

**How they're built**

They co-develop alongside the automation's logic in a feedback loop:

- Helix drafts a query or transformation, customizations, → which reveals what kinds of NetSuite records it needs (e.g., open invoices tied to a specific customer class)
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

Most of all they give the user confidence and expectation

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSH-707: MVP NetSuite Play Mode — Design Specification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 24px; background: #fafbfc;">

  <!-- ================================================================ -->
  <!-- REPORT HEADER -->
  <!-- ================================================================ -->
  <div style="border-bottom: 4px solid #2d3436; padding-bottom: 20px; margin-bottom: 32px;">
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #636e72; margin: 0 0 8px 0;">Design Specification</p>
    <h1 id="mvp-netsuite-play-mode-design-specification" style="font-size: 28px; font-weight: 700; color: #2d3436; margin: 0 0 8px 0;">MVP NetSuite Play Mode</h1>
    <p style="font-size: 16px; color: #636e72; margin: 0 0 16px 0;">Research Report &mdash; RSH-707</p>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <span style="display: inline-block; background: #dfe6e9; color: #2d3436; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Date: June 6, 2026</span>
      <span style="display: inline-block; background: #00b894; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Status: Final</span>
      <span style="display: inline-block; background: #0984e3; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">3-Level MVP</span>
      <span style="display: inline-block; background: #6c5ce7; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Builds on RSH-702</span>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- TABLE OF CONTENTS -->
  <!-- ================================================================ -->
  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px 24px; margin-bottom: 36px;">
    <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 12px 0; color: #2d3436;">Table of Contents</h2>
    <ol style="margin: 0; padding-left: 20px; columns: 2; column-gap: 32px;">
      <li style="margin-bottom: 6px;"><a href="#executive-summary" style="color: #0984e3; text-decoration: none;">Executive Summary</a></li>
      <li style="margin-bottom: 6px;"><a href="#what-is-a-play" style="color: #0984e3; text-decoration: none;">What Is a Play?</a></li>
      <li style="margin-bottom: 6px;"><a href="#l1-play-mode-foundation" style="color: #0984e3; text-decoration: none;">L1: Play Mode Foundation</a></li>
      <li style="margin-bottom: 6px;"><a href="#l2-compose-and-preview" style="color: #0984e3; text-decoration: none;">L2: Compose &amp; Preview</a></li>
      <li style="margin-bottom: 6px;"><a href="#l3-run-and-monitor" style="color: #0984e3; text-decoration: none;">L3: Run &amp; Monitor</a></li>
      <li style="margin-bottom: 6px;"><a href="#cross-cutting-concerns" style="color: #0984e3; text-decoration: none;">Cross-Cutting Concerns</a></li>
      <li style="margin-bottom: 6px;"><a href="#governance-and-safety-architecture" style="color: #0984e3; text-decoration: none;">Governance &amp; Safety Architecture</a></li>
      <li style="margin-bottom: 6px;"><a href="#implementation-roadmap" style="color: #0984e3; text-decoration: none;">Implementation Roadmap</a></li>
      <li style="margin-bottom: 6px;"><a href="#evidence-sources" style="color: #0984e3; text-decoration: none;">Evidence Sources</a></li>
    </ol>
  </div>

  <!-- ================================================================ -->
  <!-- SECTION 1: EXECUTIVE SUMMARY -->
  <!-- ================================================================ -->
  <h2 id="executive-summary" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">1. Executive Summary</h2>

  <p>This report presents the complete design specification for <strong>Play Mode</strong> &mdash; a new first-class Helix ticket mode that replaces the dead EXECUTE mode with a composed, governed, previewable approach to NetSuite record-level operations. A Play is a sequence of <strong>Map</strong> (SuiteQL queries), <strong>Reduce</strong> (AI agent transforms), and <strong>Effect</strong> (record CRUD) steps where every input and output is measurable and monitorable.</p>

  <p>EXECUTE mode is unused: <strong>0 of 854 production tickets</strong> use it (runtime-verified June 6, 2026). It was designed for SDF code deployment, not direct record operations. PLAY replaces it with a fundamentally different model &mdash; preview-first, sandbox-first, composed, and governed.</p>

  <h3 id="production-data-snapshot" style="font-size: 18px; color: #2d3436; margin-top: 28px;">Production Data Snapshot</h3>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #636e72; text-transform: uppercase; letter-spacing: 1px;">Runtime-verified &bull; June 6, 2026 &bull; Production Database</p>
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #dee2e6;">
        <div style="font-size: 28px; font-weight: 700; color: #2d3436;">854</div>
        <div style="font-size: 12px; color: #636e72;">Total Tickets</div>
      </div>
      <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #dee2e6;">
        <div style="font-size: 28px; font-weight: 700; color: #0984e3;">296</div>
        <div style="font-size: 12px; color: #636e72;">AUTO</div>
      </div>
      <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #dee2e6;">
        <div style="font-size: 28px; font-weight: 700; color: #6c5ce7;">234</div>
        <div style="font-size: 12px; color: #636e72;">RESEARCH</div>
      </div>
      <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #dee2e6;">
        <div style="font-size: 28px; font-weight: 700; color: #00b894;">193</div>
        <div style="font-size: 12px; color: #636e72;">BUILD</div>
      </div>
      <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #dee2e6;">
        <div style="font-size: 28px; font-weight: 700; color: #e17055;">131</div>
        <div style="font-size: 12px; color: #636e72;">FIX</div>
      </div>
      <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: #d63031; border-radius: 6px;">
        <div style="font-size: 28px; font-weight: 700; color: #fff;">0</div>
        <div style="font-size: 12px; color: #fff;">EXECUTE</div>
      </div>
    </div>
  </div>

  <h3 id="three-level-mvp-approach" style="font-size: 18px; color: #2d3436; margin-top: 28px;">Three-Level MVP Approach</h3>

  <p>The design ships as three incremental levels. Each level is a <strong>standalone deliverable</strong> &mdash; independently useful, independently deployable, and independently testable.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436; width: 20%;">Level</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436; width: 30%;">What the User Gets</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436; width: 15%;">Effort</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436; width: 35%;">Key Deliverables</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #e3f2fd;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #0984e3; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 13px;">L1</span> Mode Foundation</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Create Play tickets via web, CLI, MCP. PLAY replaces dead EXECUTE.</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #00b894;">Light</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Prisma enum + migration, platform config, API validation, PLY- prefix, UI mode picker, CLI flag</td>
      </tr>
      <tr style="background: #e8f5e9;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 13px;">L2</span> Compose &amp; Preview</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Define play steps. Run read-only steps in sandbox. Preview results.</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #e17055;">Medium</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">PlayDefinition JSONB model, preview API, sandbox execution, step editor UI</td>
      </tr>
      <tr style="background: #fff3e0;">
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #e17055; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 13px;">L3</span> Run &amp; Monitor</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Execute plays with governance. Preview effects. Full audit trail.</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #d63031;">Heavy</td>
        <td style="padding: 10px 14px; border: 1px solid #dee2e6;">PlayExecution tables, governance envelope, SSE monitoring, human approval, before/after images</td>
      </tr>
    </tbody>
  </table>

  <h3 id="repos-in-scope" style="font-size: 18px; color: #2d3436; margin-top: 28px;">Repos in Scope</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #636e72; color: #fff;">
        <th style="padding: 8px 14px; text-align: left; border: 1px solid #636e72;">Repository</th>
        <th style="padding: 8px 14px; text-align: left; border: 1px solid #636e72;">Role</th>
        <th style="padding: 8px 14px; text-align: center; border: 1px solid #636e72;">Weight</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-server</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Prisma schema, API, orchestrator, NS-GM RESTlet, governance</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="display: inline-block; background: #d63031; color: #fff; padding: 1px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Heaviest</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-client</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Mode UI, preview panel, step editor, execution monitor</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="display: inline-block; background: #e17055; color: #fff; padding: 1px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Heavy</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-cli</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">CLI mode flag, docs mirror</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="display: inline-block; background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Light</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">library</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Context only &mdash; research reports, no code changes</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="display: inline-block; background: #dfe6e9; color: #2d3436; padding: 1px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Context</span></td>
      </tr>
    </tbody>
  </table>

  <h3 id="design-principles" style="font-size: 18px; color: #2d3436; margin-top: 28px;">Design Principles</h3>

  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 180px; background: #e3f2fd; border-top: 3px solid #0984e3; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #0984e3;">Preview First</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;">Everything read-only is previewable. Effects show projections with explicit limitation callouts.</p>
    </div>
    <div style="flex: 1; min-width: 180px; background: #e8f5e9; border-top: 3px solid #00b894; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #00b894;">Sandbox First</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;">Plays run in sandbox with canonical examples before production.</p>
    </div>
    <div style="flex: 1; min-width: 180px; background: #fce4ec; border-top: 3px solid #e17055; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #e17055;">Explicit Intent</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;">Effects never auto-execute. Human approval is the hard boundary.</p>
    </div>
    <div style="flex: 1; min-width: 180px; background: #e8eaf6; border-top: 3px solid #6c5ce7; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #6c5ce7;">Log Everything</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;">Every step's inputs and outputs are captured. Full audit trail.</p>
    </div>
  </div>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>RSH-702 Integration:</strong> This design builds on the <strong>RSH-702 Reversibility Tiers + Dry-Run Preview</strong> feasibility report (verdict: <span style="display: inline-block; background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600; font-size: 12px;">CONDITIONAL GO</span>). RSH-702's governance model, reversibility tiers, and dry-run mechanisms are integrated into L3's safety architecture. The four conditions for Go are satisfied by the governance envelope design.</p>
  </div>

  <!-- ================================================================ -->
  <!-- SECTION 2: WHAT IS A PLAY -->
  <!-- ================================================================ -->
  <h2 id="what-is-a-play" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">2. What Is a Play?</h2>

  <p>A <strong>Play</strong> is a composed sequence of steps that together perform a governed NetSuite operation. Each step has typed inputs and outputs. Steps chain together &mdash; map output feeds reduce input, reduce output feeds effect input. Every step's data is captured, measured, and auditable.</p>

  <h3 id="the-map-reduce-effect-model" style="font-size: 18px; color: #2d3436; margin-top: 28px;">2.1 The Map / Reduce / Effect Model</h3>

  <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin: 24px 0; flex-wrap: wrap;">
    <div style="background: #0984e3; color: #fff; border-radius: 8px; padding: 16px 20px; min-width: 200px; text-align: center;">
      <div style="font-size: 20px; font-weight: 700; letter-spacing: 1px;">MAP</div>
      <div style="font-size: 12px; margin-top: 6px; opacity: 0.9;">SuiteQL Queries</div>
      <div style="font-size: 11px; margin-top: 4px; opacity: 0.7;">Read data from NetSuite</div>
    </div>
    <div style="font-size: 24px; color: #636e72; padding: 0 8px;">&rarr;</div>
    <div style="background: #6c5ce7; color: #fff; border-radius: 8px; padding: 16px 20px; min-width: 200px; text-align: center;">
      <div style="font-size: 20px; font-weight: 700; letter-spacing: 1px;">REDUCE</div>
      <div style="font-size: 12px; margin-top: 6px; opacity: 0.9;">AI Agent Transforms</div>
      <div style="font-size: 11px; margin-top: 4px; opacity: 0.7;">Transform &amp; enrich data</div>
    </div>
    <div style="font-size: 24px; color: #636e72; padding: 0 8px;">&rarr;</div>
    <div style="background: #e17055; color: #fff; border-radius: 8px; padding: 16px 20px; min-width: 200px; text-align: center;">
      <div style="font-size: 20px; font-weight: 700; letter-spacing: 1px;">EFFECT</div>
      <div style="font-size: 12px; margin-top: 6px; opacity: 0.9;">Record Operations</div>
      <div style="font-size: 11px; margin-top: 4px; opacity: 0.7;">CRUD, void, transform</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Step Type</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">What It Does</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Input</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Output</th>
        <th style="padding: 10px 14px; text-align: center; border: 1px solid #2d3436;">Side Effects?</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #e3f2fd;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #0984e3;">MAP</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Executes SuiteQL queries against NetSuite via ns-gm RESTlet</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">SuiteQL query + optional parameters</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Row-set result data</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="color: #00b894; font-weight: 600;">None (read-only)</span></td>
      </tr>
      <tr style="background: #f3f0ff;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #6c5ce7;">REDUCE</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">AI agent prompts, read-only scripts, or further agent calls to transform data</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Prior step outputs + prompt template</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Transformed/enriched data</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="color: #00b894; font-weight: 600;">None (read-only)</span></td>
      </tr>
      <tr style="background: #fff3e0;">
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600; color: #e17055;">EFFECT</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">CRUD on records, transaction operations, external API calls, emails</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Prior step outputs + field mappings</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6;">Operation result + after-image</td>
        <td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="color: #d63031; font-weight: 600;">Yes (writes)</span></td>
      </tr>
    </tbody>
  </table>

  <h3 id="composability" style="font-size: 18px; color: #2d3436; margin-top: 28px;">2.2 Composability</h3>

  <p>Steps compose by reference. Each step declares which prior step outputs it consumes via <code>inputStepIds</code>. This creates a directed acyclic graph (DAG) of data flow:</p>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 16px 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8;">
    <div><span style="color: #0984e3; font-weight: 700;">step-1 [MAP]</span> "Find open sales orders" &rarr; <span style="color: #636e72;">outputs 47 rows</span></div>
    <div style="padding-left: 20px;">&darr;</div>
    <div><span style="color: #6c5ce7; font-weight: 700;">step-2 [REDUCE]</span> "Compute invoice amounts" &larr; <span style="color: #636e72;">consumes step-1</span> &rarr; <span style="color: #636e72;">outputs 47 invoice specs</span></div>
    <div style="padding-left: 20px;">&darr;</div>
    <div><span style="color: #e17055; font-weight: 700;">step-3 [EFFECT]</span> "Create invoices" &larr; <span style="color: #636e72;">consumes step-2</span> &rarr; <span style="color: #636e72;">creates 47 invoices</span></div>
  </div>

  <h3 id="play-vs-execute" style="font-size: 18px; color: #2d3436; margin-top: 28px;">2.3 Play vs. EXECUTE &mdash; Why This Is Different</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">Aspect</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">EXECUTE (dead)</th>
        <th style="padding: 10px 14px; text-align: left; border: 1px solid #2d3436;">PLAY (new)</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">What it does</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Deploys SuiteScript code via SDF</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Executes composed record-level operations via NS-GM RESTlet</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Preview</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">None</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Full preview of MAP/REDUCE; in-memory projection of effects</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Sandbox testing</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">SDF deploy to sandbox</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Direct execution with canonical examples</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Audit trail</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">SDF deploy log only</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Ordered forward log with before/after images per step</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Composition</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Monolithic script</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">Composable MAP/REDUCE/EFFECT chain with measurable I/O</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">Production usage</td><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><strong>0 of 854 tickets</strong></td><td style="padding: 8px 14px; border: 1px solid #dee2e6;">&mdash; (new)</td></tr>
    </tbody>
  </table>

  <!-- ================================================================ -->
  <!-- SECTION 3: L1 SPECIFICATION -->
  <!-- ================================================================ -->
  <h2 id="l1-play-mode-foundation" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">3. <span style="display: inline-block; background: #0984e3; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 18px;">L1</span> Play Mode Foundation</h2>

  <div style="background: #e3f2fd; border-left: 4px solid #0984e3; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Scope:</strong> PLAY as first-class TicketMode. NetSuite-only restriction. PLY- prefix. EXECUTE retirement from all user-facing surfaces. No new data models, no new UI routes &mdash; pure plumbing.</p>
  </div>

  <h3 id="l1-server-changes" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.1 Server Changes (helix-global-server)</h3>

  <h4 id="l1-prisma-migration" style="font-size: 16px; color: #2d3436; margin-top: 20px;">Prisma Migration</h4>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px 20px; margin: 12px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #636e72;">Migration: 20260606_add_play_mode</p>
    <pre style="margin: 0; font-size: 13px; background: #2d3436; color: #dfe6e9; padding: 12px 16px; border-radius: 4px; overflow-x: auto;"><code>-- Safe, non-blocking, metadata-only DDL (PG14+)
ALTER TYPE "TicketMode" ADD VALUE 'PLAY';</code></pre>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #636e72;">No data migration needed. No table lock. Sub-second execution.</p>
  </div>

  <p style="font-size: 14px;"><strong>Prisma schema:</strong> Add <code>PLAY</code> to the <code>TicketMode</code> enum. Keep <code>EXECUTE</code> for DB parity (PostgreSQL does not support <code>ALTER TYPE DROP VALUE</code>).</p>

  <h4 id="l1-server-file-changes" style="font-size: 16px; color: #2d3436; margin-top: 20px;">Per-File Change Specification</h4>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #0984e3; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">File</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">Before</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">After</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>prisma/schema.prisma</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">enum: AUTO, BUILD, FIX, RESEARCH, EXECUTE</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">enum: ..., EXECUTE, PLAY</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE stays for DB parity</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/lib/platform-config.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">NETSUITE allowedModes includes EXECUTE</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">NETSUITE allowedModes includes PLAY, not EXECUTE</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">GENERAL/SMB: no PLAY</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/services/ticket-id-utils.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE: 'EXE' / 'execute'</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">+ PLAY: 'PLY' / 'play'</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE entries kept (Record requires all keys)</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/controllers/ticket-controller.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">"EXECUTE mode is only..."</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">"This mode is only available for NetSuite organizations."</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Mode-agnostic; unify update endpoint</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/mcp/tools/tickets.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">z.enum includes EXECUTE (x2)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">z.enum includes PLAY (x2)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Both create and update schemas</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/services/goal-schemas.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">z.enum includes EXECUTE</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">z.enum includes PLAY</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">&mdash;</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/helix-workflow/orchestrator.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">isResearchMode at 3 deploy guards</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">+ isPlayMode; extend 3 guards</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Lines ~1868, ~2604, ~2853</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/services/ticket-mode-classifier.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">ConcreteMode = BUILD|FIX|RESEARCH</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><em>No changes needed</em></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY excluded by same mechanism</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;">Tests (4 files)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE assertions</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY assertions</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">platform-config, ticket-id-utils, mode-classifier, api-platform</td></tr>
    </tbody>
  </table>

  <h3 id="l1-client-changes" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.2 Client Changes (helix-global-client &mdash; ~12 files)</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead><tr style="background: #0984e3; color: #fff;"><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">File</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">Before</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">After</th></tr></thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/types/api.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE: "EXECUTE"</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY: "PLAY"</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/components/mode-icons.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">ExecuteIcon + case 'EXECUTE'</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PlayIcon + case 'PLAY' (same SVG)</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/lib/platform.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">executeMode; EXECUTE in availableModes</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">playMode; PLAY in availableModes</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/routes/create-ticket.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE icon + "Execute" label</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY icon + "Play" label</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/routes/ticket-detail.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">option value="EXECUTE"</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">option value="PLAY"</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/lib/format.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE: "Execute"</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY: "Play"</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>ticket-filter-bar.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE filter</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY filter</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>hashtag-ticket-picker.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE: bg-green-500</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY: bg-green-500</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>reference-chip.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE: border-l-green-500</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY: border-l-green-500</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>helix-cli-docs-content.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE in mode list</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY in mode list</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>platform.test.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">executeMode assertions</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">playMode assertions</td></tr>
    </tbody>
  </table>

  <h3 id="l1-cli-changes" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.3 CLI Changes (helix-cli &mdash; 2 files)</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead><tr style="background: #0984e3; color: #fff;"><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">File</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">Before</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">After</th></tr></thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/tickets/create.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">VALID_MODES includes EXECUTE</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">VALID_MODES includes PLAY</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; font-weight: 600;"><code>src/docs/cli-content.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Mode table includes EXECUTE</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Mode table includes PLAY</td></tr>
    </tbody>
  </table>

  <h3 id="l1-success-criteria" style="font-size: 18px; color: #2d3436; margin-top: 28px;">3.4 L1 Success Criteria</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead><tr style="background: #0984e3; color: #fff;"><th style="padding: 8px 12px; text-align: center; border: 1px solid #0984e3; width: 5%;">#</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">Criterion</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #0984e3;">How to Verify</th></tr></thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">1</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">User creates PLAY ticket via web UI, CLI, and MCP</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">All 3 surfaces accept <code>mode: "PLAY"</code></td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">2</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY restricted to NetSuite orgs</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Non-NetSuite org gets clear error</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">3</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLAY tickets show correct icon and "Play" label</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PlayIcon renders play-triangle SVG</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">4</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Mode classifier never auto-assigns PLAY</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">ConcreteMode and VALID_MODES exclude PLAY</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">5</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">PLY-prefixed short ID</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>formatShortId("PLAY", 42)</code> returns "PLY-42"</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">6</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">EXECUTE removed from all user-facing surfaces</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">No EXECUTE in picker, filter, MCP, CLI</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">7</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">All quality gates pass</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">tsc, eslint, vitest; tsc -b; tsc --noEmit</td></tr>
    </tbody>
  </table>

  <!-- Sections 4-9 continue below with L2, L3, Cross-cutting, Governance, Roadmap, Evidence -->
  <!-- For brevity, key sections are summarized in the implementation-actual.md artifact -->

  <!-- ================================================================ -->
  <!-- SECTION 4: L2 -->
  <!-- ================================================================ -->
  <h2 id="l2-compose-and-preview" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #00b894; padding-bottom: 8px; margin-top: 48px;">4. <span style="display: inline-block; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 18px;">L2</span> Compose &amp; Preview</h2>

  <div style="background: #e8f5e9; border-left: 4px solid #00b894; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Scope:</strong> Define play steps. Run read-only MAP/REDUCE in sandbox via ns-gm. Preview step-by-step outputs. Effects are declared but NOT executed in L2. SDF deploy phase skipped for PLAY tickets.</p>
  </div>

  <h3 id="l2-data-model" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.1 Data Model &mdash; PlayDefinition (JSONB on Ticket)</h3>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px 20px; margin: 12px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #636e72;">Migration: 20260607_add_play_definition</p>
    <pre style="margin: 0; font-size: 13px; background: #2d3436; color: #dfe6e9; padding: 12px 16px; border-radius: 4px; overflow-x: auto;"><code>ALTER TABLE "Ticket" ADD COLUMN "playDefinition" JSONB;</code></pre>
  </div>

  <h4 id="l2-zod-schemas" style="font-size: 16px; color: #2d3436; margin-top: 20px;">Zod Schema Definition</h4>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px 20px; margin: 12px 0;">
    <pre style="margin: 0; font-size: 12px; background: #2d3436; color: #dfe6e9; padding: 12px 16px; border-radius: 4px; overflow-x: auto; line-height: 1.5;"><code>PlayDefinition {
  version: "1"                      // schema version for future migration
  steps: PlayStep[]                 // ordered list of play steps
}

PlayStep {
  id: string                        // stable step ID (e.g., "step-1")
  type: "MAP" | "REDUCE" | "EFFECT"
  label: string                     // human-readable name
  config: MapConfig | ReduceConfig | EffectConfig
}

MapConfig {
  suiteql: string                   // SuiteQL query
  parameters?: Record&lt;string, string&gt;
}

ReduceConfig {
  prompt: string                    // agent prompt template
  inputStepIds: string[]            // prior step outputs to consume
}

EffectConfig {
  operationType: "CREATE" | "UPDATE" | "DELETE" | "VOID" | "TRANSFORM"
  recordType: string                // e.g., "invoice", "salesorder"
  fieldMappings?: Record&lt;string, string&gt;
  inputStepIds: string[]
}</code></pre>
  </div>

  <h3 id="l2-preview-api" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.2 Preview API</h3>

  <div style="background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 6px; padding: 16px 20px; margin: 12px 0;">
    <p style="margin: 0; font-size: 14px; font-weight: 600;"><code>POST /api/tickets/:id/play/preview</code></p>
    <p style="margin: 8px 0 0 0; font-size: 13px;">MAP steps execute via ns-gm <code>runSuiteQL</code> against SANDBOX. REDUCE steps run as Claude agent prompts with prior outputs as context. EFFECT steps return declarations only.</p>
  </div>

  <h3 id="l2-new-files" style="font-size: 18px; color: #2d3436; margin-top: 28px;">4.3 New Files</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead><tr style="background: #00b894; color: #fff;"><th style="padding: 8px 12px; text-align: left; border: 1px solid #00b894;">Repo</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #00b894;">New File</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #00b894;">Purpose</th></tr></thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Server</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>play-definition-schema.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Zod schemas for PlayDefinition</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Server</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>play-preview-service.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Sandbox execution orchestrator</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Server</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>play-controller.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Preview endpoint</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Client</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>play/play-preview-section.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Preview panel in ticket-detail</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Client</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>play/play-step-editor.tsx</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Structured step editor</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Client</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;"><code>api/play-api.ts</code></td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">usePlayPreview hook</td></tr>
    </tbody>
  </table>

  <!-- ================================================================ -->
  <!-- SECTION 5: L3 -->
  <!-- ================================================================ -->
  <h2 id="l3-run-and-monitor" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #e17055; padding-bottom: 8px; margin-top: 48px;">5. <span style="display: inline-block; background: #e17055; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 18px;">L3</span> Run &amp; Monitor</h2>

  <div style="background: #fff3e0; border-left: 4px solid #e17055; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Scope:</strong> Execute effects with governance envelope. In-memory projection preview for effects. Before/after image capture. Human approval. Real-time SSE monitoring. Full ordered audit trail.</p>
  </div>

  <h3 id="l3-execution-model" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.1 New Prisma Models</h3>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px 20px; margin: 12px 0;">
    <pre style="margin: 0; font-size: 12px; background: #2d3436; color: #dfe6e9; padding: 12px 16px; border-radius: 4px; overflow-x: auto; line-height: 1.5;"><code>PlayExecution {
  id, ticketId, organizationId
  status: PENDING | RUNNING | SUCCEEDED | FAILED | CANCELLED
  startedAt, finishedAt, approvedByUserId, environment
}

PlayStepResult {
  id, playExecutionId, stepId, stepType
  status, position, startedAt, finishedAt
  input (Json), output (Json)
  beforeImage (Json?), afterImage (Json?)   // effects only
  error (String?)
}</code></pre>
  </div>

  <h3 id="l3-governance-envelope" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.2 Governance Envelope</h3>

  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 200px; background: #e8f5e9; border-top: 3px solid #4caf50; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #2e7d32;">1. Before-Image</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;"><code>record.load({type, id})</code> captures state before mutation.</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #e3f2fd; border-top: 3px solid #2196f3; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #1565c0;">2. Execute</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;">Operation via ns-gm, tagged with playExecutionId + stepId.</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #fce4ec; border-top: 3px solid #e91e63; border-radius: 6px; padding: 14px;">
      <p style="margin: 0; font-weight: 700; font-size: 14px; color: #c62828;">3. After-Image</p>
      <p style="margin: 6px 0 0 0; font-size: 13px;">Result captured in afterImage. Full audit trail.</p>
    </div>
  </div>

  <h3 id="l3-effect-preview" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.3 Effect Preview</h3>

  <p>In-memory projection via <code>record.create({type, isDynamic: true})</code>. Shows field values and sourced fields but <strong>cannot</strong> show taxes, GL impact, approval routing, or user-event script effects (computed only on <code>record.save()</code>).</p>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;"><strong>Required UI callout:</strong> "Tax, GL impact, and user-event script effects are computed only on save and not shown in preview."</p>
  </div>

  <h3 id="l3-sse-monitoring" style="font-size: 18px; color: #2d3436; margin-top: 28px;">5.4 SSE Monitoring</h3>

  <p><code>GET /api/tickets/:id/play/executions/:execId/stream</code> &mdash; Server-Sent Events pushing step status updates. Client uses React 19 patterns: <code>useTransition</code>, <code>useDeferredValue</code>, stable callback refs.</p>

  <!-- ================================================================ -->
  <!-- SECTION 6: CROSS-CUTTING -->
  <!-- ================================================================ -->
  <h2 id="cross-cutting-concerns" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">6. Cross-Cutting Concerns</h2>

  <h3 id="migration-strategy" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.1 Migration Strategy</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead><tr style="background: #2d3436; color: #fff;"><th style="padding: 8px 14px; text-align: left; border: 1px solid #2d3436;">Level</th><th style="padding: 8px 14px; text-align: left; border: 1px solid #2d3436;">Migration</th><th style="padding: 8px 14px; text-align: left; border: 1px solid #2d3436;">Risk</th></tr></thead>
    <tbody>
      <tr style="background: #e3f2fd;"><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #0984e3; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600; font-size: 12px;">L1</span></td><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><code>ALTER TYPE ADD VALUE 'PLAY'</code></td><td style="padding: 8px 14px; border: 1px solid #dee2e6; color: #00b894;">None &mdash; metadata-only</td></tr>
      <tr style="background: #e8f5e9;"><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #00b894; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600; font-size: 12px;">L2</span></td><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><code>ALTER TABLE ADD COLUMN playDefinition JSONB</code></td><td style="padding: 8px 14px; border: 1px solid #dee2e6; color: #00b894;">None &mdash; nullable column</td></tr>
      <tr style="background: #fff3e0;"><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #e17055; color: #fff; padding: 1px 8px; border-radius: 3px; font-weight: 600; font-size: 12px;">L3</span></td><td style="padding: 8px 14px; border: 1px solid #dee2e6;"><code>CREATE TABLE</code> PlayExecution + PlayStepResult</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; color: #00b894;">None &mdash; new tables</td></tr>
    </tbody>
  </table>

  <h3 id="execute-retention" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.2 EXECUTE Retention</h3>
  <p>Kept in Postgres enum and <code>Record&lt;TicketMode&gt;</code> maps (TypeScript requires exhaustive keys). Removed from all application surfaces: allowedModes, z.enum, MCP tools, UI, CLI, docs.</p>

  <h3 id="deploy-ordering" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.3 Deploy Ordering</h3>
  <p><strong>L1:</strong> Server &rarr; CLI &rarr; Client. <strong>L2/L3:</strong> Server &rarr; Client. Server always first.</p>

  <h3 id="credential-routing" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.4 Credential Routing</h3>
  <p>Existing <code>credentials.ts</code> routes scout/diagnosis to PRODUCTION, else SANDBOX. Correct for L2. L3 adds <code>playEnvironment</code> override for production execution.</p>

  <h3 id="deferred-items" style="font-size: 18px; color: #2d3436; margin-top: 28px;">6.5 Explicitly Deferred</h3>
  <ul style="font-size: 14px;">
    <li>Rollback engine + inverse library (RSH-702 Sec. 3)</li>
    <li>Idempotency keys (RSH-702 Sec. 6)</li>
    <li>Concurrency/drift detection (RSH-702 Sec. 5)</li>
    <li>Triggered automation / Rung 2 (RSH-702 Sec. 9)</li>
    <li>Tier-2 promotion flywheel (RSH-702 Sec. 5.4)</li>
    <li>Cross-account play templates</li>
    <li>CLI play subcommands (L2/L3)</li>
  </ul>

  <!-- ================================================================ -->
  <!-- SECTION 7: GOVERNANCE -->
  <!-- ================================================================ -->
  <h2 id="governance-and-safety-architecture" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #6c5ce7; padding-bottom: 8px; margin-top: 48px;">7. Governance &amp; Safety Architecture</h2>

  <div style="background: #e8eaf6; border-left: 4px solid #6c5ce7; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px;">Integrates <strong>RSH-702</strong> findings (verdict: <span style="display: inline-block; background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600; font-size: 12px;">CONDITIONAL GO</span>).</p>
  </div>

  <h3 id="ns-gm-chokepoint-model" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.1 Containment Model</h3>

  <div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 200px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 6px; padding: 14px;">
      <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 14px;">CONTAINED</h4>
      <ul style="margin: 0; padding-left: 16px; font-size: 13px;">
        <li>Record CRUD (N/record)</li>
        <li>Transaction ops (N/transaction)</li>
        <li>Search/query (N/search, N/query)</li>
        <li>File ops, Email, HTTP calls</li>
      </ul>
    </div>
    <div style="flex: 1; min-width: 200px; background: #ffebee; border: 2px solid #f44336; border-radius: 6px; padding: 14px;">
      <h4 style="margin: 0 0 8px 0; color: #c62828; font-size: 14px;">NOT CONTAINED (Structural Leak)</h4>
      <p style="margin: 0; font-size: 13px;">10 SDF-deployed SuiteScript types running autonomously on internal triggers. Accepted, documented boundary.</p>
    </div>
  </div>

  <h3 id="three-reversibility-tiers" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.2 Three Reversibility Tiers</h3>

  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 160px; text-align: center; border-radius: 6px; padding: 14px; background: #e8f5e9; border: 2px solid #00b894;">
      <div style="font-size: 18px; font-weight: 700; color: #00b894;">Tier 1</div>
      <div style="font-size: 12px; font-weight: 600; color: #2e7d32;">Atomic Inverse</div>
      <div style="font-size: 11px; margin-top: 4px; color: #555;">Known action&harr;inverse pair. 8 pairs identified.</div>
    </div>
    <div style="flex: 1; min-width: 160px; text-align: center; border-radius: 6px; padding: 14px; background: #fff8e1; border: 2px solid #fdcb6e;">
      <div style="font-size: 18px; font-weight: 700; color: #f39c12;">Tier 2</div>
      <div style="font-size: 12px; font-weight: 600; color: #e67e22;">Derived Inverse</div>
      <div style="font-size: 11px; margin-top: 4px; color: #555;">Before-image + compensating recipe. 2 pairs identified.</div>
    </div>
    <div style="flex: 1; min-width: 160px; text-align: center; border-radius: 6px; padding: 14px; background: #ffebee; border: 2px solid #d63031;">
      <div style="font-size: 18px; font-weight: 700; color: #d63031;">Tier 3</div>
      <div style="font-size: 12px; font-weight: 600; color: #c62828;">No Inverse</div>
      <div style="font-size: 11px; margin-top: 4px; color: #555;">Shipped goods, sent emails. 2 pairs. Human approval required.</div>
    </div>
  </div>

  <h3 id="action-inverse-pairs" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.3 The 12 Action-Inverse Pairs (from RSH-702)</h3>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
      <thead><tr style="background: #2d3436; color: #fff;"><th style="padding: 6px 8px; border: 1px solid #2d3436;">#</th><th style="padding: 6px 8px; border: 1px solid #2d3436;">Action</th><th style="padding: 6px 8px; border: 1px solid #2d3436;">Record Type</th><th style="padding: 6px 8px; border: 1px solid #2d3436;">Inverse</th><th style="padding: 6px 8px; text-align: center; border: 1px solid #2d3436;">Tier</th></tr></thead>
      <tbody>
        <tr style="background: #fff;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">1</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Sales Order</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Sales Order</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">2</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Post Invoice</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Invoice</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #fff;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">3</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Post Vendor Bill</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Vendor Bill</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">4</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Credit Memo</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Credit Memo</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #fff;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">5</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Journal Entry</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Journal Entry</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">6</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Check</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Check</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #fff;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">7</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Customer Payment</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Cust. Payment</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><code>transaction.void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">8</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Purchase Order</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Purchase Order</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Close / <code>void()</code></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">1</span></td></tr>
        <tr style="background: #fff;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">9</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Update Field Value</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Any record</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Restore before-image</td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #fdcb6e; color: #2d3436; padding: 1px 6px; border-radius: 3px; font-weight: 600;">2</span></td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">10</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Delete Custom Record</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Custom Record</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Re-create from image</td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #fdcb6e; color: #2d3436; padding: 1px 6px; border-radius: 3px; font-weight: 600;">2</span></td></tr>
        <tr style="background: #fff;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">11</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Create Item Fulfillment</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Item Fulfillment</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><em>No clean inverse</em></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #d63031; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">3</span></td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 4px 8px; border: 1px solid #dee2e6;">12</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">Send Email</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;">N/email</td><td style="padding: 4px 8px; border: 1px solid #dee2e6;"><em>No inverse</em></td><td style="padding: 4px 8px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #d63031; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600;">3</span></td></tr>
      </tbody>
    </table>
  </div>

  <h3 id="four-conditions-for-go" style="font-size: 18px; color: #2d3436; margin-top: 28px;">7.4 The Four Conditions for Go</h3>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 4px; margin: 16px 0;">
    <ol style="margin: 0; font-size: 14px;">
      <li style="margin-bottom: 8px;"><strong>Before-image + write audit</strong> in NS-GM governance envelope &rarr; <span style="color: #00b894; font-weight: 600;">L3 Section 5.2</span></li>
      <li style="margin-bottom: 8px;"><strong>UE script enumeration</strong> per record type at design time &rarr; <span style="color: #00b894; font-weight: 600;">RSH-411 inference pipeline</span></li>
      <li style="margin-bottom: 8px;"><strong>Unconditional human approval</strong> for Tier-3 &rarr; <span style="color: #00b894; font-weight: 600;">L3 Section 5.4</span></li>
      <li style="margin-bottom: 8px;"><strong>REVERSALVOIDING check</strong> at runtime before void &rarr; <span style="color: #00b894; font-weight: 600;"><code>config.load()</code> before void</span></li>
    </ol>
  </div>

  <!-- ================================================================ -->
  <!-- SECTION 8: ROADMAP -->
  <!-- ================================================================ -->
  <h2 id="implementation-roadmap" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #0984e3; padding-bottom: 8px; margin-top: 48px;">8. Implementation Roadmap</h2>

  <h3 id="file-summary" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.1 File Count Summary</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <thead><tr style="background: #2d3436; color: #fff;"><th style="padding: 8px 14px; text-align: left; border: 1px solid #2d3436;">Repo</th><th style="padding: 8px 14px; text-align: center; border: 1px solid #2d3436;"><span style="background: #0984e3; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 12px;">L1</span></th><th style="padding: 8px 14px; text-align: center; border: 1px solid #2d3436;"><span style="background: #00b894; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 12px;">L2</span></th><th style="padding: 8px 14px; text-align: center; border: 1px solid #2d3436;"><span style="background: #e17055; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 12px;">L3</span></th></tr></thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-server</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">~12 modify + 1 migration</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">~4 new + 1 migration</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">~4 new + 1 migration + 1 modify</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-client</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">~12 modify</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">~3 new</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">~3 new</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-cli</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">2 modify</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">&mdash;</td><td style="padding: 8px 14px; border: 1px solid #dee2e6; text-align: center;">&mdash;</td></tr>
    </tbody>
  </table>

  <h3 id="scenario-mapping" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.2 User Scenarios &rarr; Levels</h3>

  <p><strong>L1</strong> (SCN-01 through SCN-05, SCN-13): Create, display, filter Play tickets; EXECUTE hidden; auto-classifier exclusion. <strong>L2</strong> (SCN-06 through SCN-08): Define steps, preview in sandbox, canonical examples. <strong>L3</strong> (SCN-09 through SCN-12): Effect preview, execution with approval, real-time monitoring, audit trail.</p>

  <h3 id="dependency-graph" style="font-size: 18px; color: #2d3436; margin-top: 28px;">8.3 Dependency Graph</h3>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 16px 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 2;">
    <div><span style="display: inline-block; background: #0984e3; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600;">L1</span> Server &rarr; CLI &rarr; Client (each independent after server)</div>
    <div><span style="display: inline-block; background: #00b894; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600;">L2</span> Server &rarr; Client (depends on L1)</div>
    <div><span style="display: inline-block; background: #e17055; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600;">L3</span> Server &rarr; Client (depends on L2)</div>
  </div>

  <!-- ================================================================ -->
  <!-- SECTION 9: EVIDENCE -->
  <!-- ================================================================ -->
  <h2 id="evidence-sources" style="font-size: 24px; color: #2d3436; border-bottom: 2px solid #636e72; padding-bottom: 8px; margin-top: 48px;">9. Evidence Sources</h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead><tr style="background: #636e72; color: #fff;"><th style="padding: 8px 12px; text-align: left; border: 1px solid #636e72;">Source</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #636e72;">Type</th><th style="padding: 8px 12px; text-align: left; border: 1px solid #636e72;">Key Finding</th></tr></thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Production DB (June 6, 2026)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Runtime</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">854 tickets; 0 EXECUTE; AUTO:296, RESEARCH:234, BUILD:193, FIX:131</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">RSH-702 research report</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Prior research</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">CONDITIONAL GO; 3 tiers; 12 pairs; NS-GM containment; 4 Go conditions</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">product/product.md</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Product spec</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">3-level MVP; 13 scenarios; success criteria</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">tech-research.md (server, client, CLI)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Architecture</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">18 decisions across 3 repos</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">diagnosis-statement.md (3 repos)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Root cause</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">File surfaces: server ~12, client ~12, CLI 2</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">scout/reference-map.json (3 repos)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">File inventory</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Exact file paths and line numbers</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Context7 (N/record, N/transaction)</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">API docs</td><td style="padding: 6px 12px; border: 1px solid #dee2e6;">Dry-run mechanisms; isDynamic; void semantics</td></tr>
    </tbody>
  </table>

  <!-- FOOTER -->
  <div style="border-top: 2px solid #dee2e6; margin-top: 48px; padding-top: 20px;">
    <p style="font-size: 13px; color: #636e72; margin: 0;">
      <strong>RSH-707</strong> &mdash; MVP NetSuite Play Mode Design Specification<br>
      Generated: June 6, 2026 &bull; Production data verified via runtime inspection<br>
      Source artifacts: product.md, tech-research.md, diagnosis-statement.md (server, client, CLI), RSH-702 research report
    </p>
  </div>

</body>
</html>

## Attachments
- (none)
