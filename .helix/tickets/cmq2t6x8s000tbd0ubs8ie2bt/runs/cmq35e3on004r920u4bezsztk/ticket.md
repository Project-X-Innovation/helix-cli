# Ticket Context

- ticket_id: cmq2t6x8s000tbd0ubs8ie2bt
- short_id: RSH-725
- run_id: cmq35e3on004r920u4bezsztk
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
  <title>RSH-707: MVP NetSuite Play Mode</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 24px 20px; background: #fafbfc;">

  <!-- ================================================================ -->
  <!-- REPORT HEADER                                                     -->
  <!-- ================================================================ -->
  <div style="border-bottom: 4px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 16px;">
    <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #636e72; margin: 0 0 8px 0;">Research Report</p>
    <h1 id="mvp-netsuite-play-mode" style="font-size: 32px; font-weight: 800; color: #1a1a2e; margin: 0 0 8px 0; letter-spacing: -0.5px;">MVP NetSuite Play Mode</h1>
    <p style="font-size: 17px; color: #636e72; margin: 0 0 20px 0;">From single-ticket code changes to living, composed automations</p>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <span style="display: inline-block; background: #6c5ce7; color: #fff; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 700;">RSH-707</span>
      <span style="display: inline-block; background: #1a1a2e; color: #fff; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">June 7, 2026</span>
      <span style="display: inline-block; background: #00b894; color: #fff; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">Status: Active Research</span>
    </div>
  </div>

  <!-- Stat Ribbon -->
  <div style="display: flex; gap: 0; margin-bottom: 36px; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6;">
    <div style="flex: 1; text-align: center; padding: 14px 8px; background: #fff;">
      <div style="font-size: 28px; font-weight: 800; color: #1a1a2e;">876</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">Production Tickets</div>
    </div>
    <div style="flex: 1; text-align: center; padding: 14px 8px; background: #fff; border-left: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #c62828;">0</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">Execute Tickets</div>
    </div>
    <div style="flex: 1; text-align: center; padding: 14px 8px; background: #fff; border-left: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #6c5ce7;">5</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">MVP Levels</div>
    </div>
    <div style="flex: 1; text-align: center; padding: 14px 8px; background: #fff; border-left: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #0097a7;">3</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">Pipeline Phases</div>
    </div>
    <div style="flex: 1; text-align: center; padding: 14px 8px; background: #fff; border-left: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #00897b;">3</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">Repos</div>
    </div>
  </div>

  <!-- Table of Contents -->
  <div style="background: #f0f2f5; border-radius: 10px; padding: 24px 28px; margin-bottom: 48px;">
    <h2 id="contents" style="font-size: 18px; margin: 0 0 16px 0; color: #1a1a2e;">Contents</h2>
    <div style="display: flex; gap: 32px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 200px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #636e72; font-weight: 700; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 2px solid #4a6fa5;">Zone 1 &mdash; Vision</p>
        <ol style="margin: 0; padding-left: 18px; font-size: 14px;">
          <li style="margin-bottom: 4px;"><a href="#the-problem" style="color: #0984e3; text-decoration: none;">The Problem</a></li>
          <li style="margin-bottom: 4px;"><a href="#what-is-a-play" style="color: #0984e3; text-decoration: none;">What Is a Play?</a></li>
        </ol>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #636e72; font-weight: 700; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 2px solid #0097a7;">Zone 2 &mdash; Roadmap</p>
        <ol start="3" style="margin: 0; padding-left: 18px; font-size: 14px;">
          <li style="margin-bottom: 4px;"><a href="#the-five-levels" style="color: #0984e3; text-decoration: none;">The Five Levels</a></li>
        </ol>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #636e72; font-weight: 700; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 2px solid #c62828;">Zone 3 &mdash; Reference</p>
        <ol start="4" style="margin: 0; padding-left: 18px; font-size: 14px;">
          <li style="margin-bottom: 4px;"><a href="#architecture-and-data-model" style="color: #0984e3; text-decoration: none;">Architecture &amp; Data Model</a></li>
          <li style="margin-bottom: 4px;"><a href="#open-questions-and-risks" style="color: #0984e3; text-decoration: none;">Open Questions &amp; Risks</a></li>
          <li style="margin-bottom: 4px;"><a href="#evidence-sources" style="color: #0984e3; text-decoration: none;">Evidence Sources</a></li>
        </ol>
      </div>
    </div>
  </div>


  <!-- ================================================================ -->
  <!-- ZONE 1 — VISION                                                  -->
  <!-- ================================================================ -->
  <div style="margin-bottom: 12px;">
    <div style="display: inline-block; background: #4a6fa5; color: #fff; padding: 6px 18px; border-radius: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Zone 1 &mdash; Vision</div>
  </div>

  <!-- SECTION 1: THE PROBLEM -->
  <h2 id="the-problem" style="font-size: 26px; color: #1a1a2e; margin-top: 24px; margin-bottom: 16px;">1. The Problem</h2>

  <p style="font-size: 17px; color: #2d3436; margin-bottom: 16px;">
    Helix builds. Helix fixes. Helix researches. But Helix can't <em>run things</em>.
  </p>

  <p style="font-size: 17px; color: #2d3436; margin-bottom: 16px;">
    Today, every Helix ticket produces a one-time deliverable: a code change, a bug fix, a research report. The user describes what they want, Helix delivers it, and the ticket closes. This model works beautifully for software development. But NetSuite users don't just need code written &mdash; they need <strong>operations that run repeatedly against live data</strong>.
  </p>

  <p style="font-size: 17px; color: #2d3436; margin-bottom: 16px;">
    Consider the gap: a finance manager who needs to match open invoices against payments every Friday. A procurement manager who wants to flag purchase orders over a threshold and route them for approval. An operations lead who needs to pull transaction data from NetSuite, combine it with rates from a spreadsheet, and generate adjustment entries. Today, they can ask Helix to <em>write</em> the script &mdash; but they still have to maintain, run, and monitor it themselves.
  </p>

  <blockquote style="border-left: 4px solid #4a6fa5; margin: 28px 0; padding: 16px 24px; background: #f0f4f8; border-radius: 0 8px 8px 0; font-size: 18px; color: #2d3436; font-style: italic;">
    "Helix generates code but doesn't generate operations."
  </blockquote>

  <p style="font-size: 17px; color: #2d3436; margin-bottom: 16px;">
    An execute mode was scaffolded early in the platform's history &mdash; but it was never built out. Of 876 production tickets to date, <strong>zero</strong> have used it. The infrastructure exists in name only: a mode in a dropdown, a value in a list, but no orchestration, no execution logic, no safety model behind it.
  </p>

  <p style="font-size: 17px; color: #2d3436; margin-bottom: 24px;">
    <strong>Plays close this gap.</strong> A play is not a script that Helix writes and hands off. A play is a <em>living automation</em> &mdash; created once through the same ticket system users already know, then run as many times as needed against fresh data, with full visibility at every step.
  </p>


  <!-- SECTION 2: WHAT IS A PLAY? -->
  <h2 id="what-is-a-play" style="font-size: 26px; color: #1a1a2e; margin-top: 48px; margin-bottom: 16px;">2. What Is a Play?</h2>

  <p style="font-size: 17px; color: #2d3436; margin-bottom: 24px;">
    A play is a composed automation with three phases. Data flows through a pipeline: it is <strong>gathered</strong>, then <strong>combined and prepared</strong>, then <strong>acted upon</strong>. Each phase has strict boundaries. Each boundary is enforced. The user sees exactly what is happening at every stage.
  </p>


  <!-- 2a: The Three-Phase Pipeline -->
  <h3 id="the-three-phase-pipeline" style="font-size: 20px; color: #1a1a2e; margin-top: 36px; margin-bottom: 16px;">2a. The Three-Phase Pipeline</h3>

  <!-- Pipeline Flow Diagram -->
  <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin: 28px 0 36px 0; flex-wrap: wrap;">
    <!-- Ingress Box -->
    <div style="background: linear-gradient(135deg, #4a6fa5, #3b5998); color: #fff; padding: 20px 24px; border-radius: 10px; text-align: center; min-width: 180px; flex: 1; max-width: 240px;">
      <div style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">Ingress</div>
      <div style="font-size: 13px; opacity: 0.9;">Pull data from NetSuite<br>and/or external sources</div>
      <div style="margin-top: 10px; font-size: 11px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; display: inline-block;">Multiple sources supported</div>
    </div>
    <!-- Arrow + Shape Gate -->
    <div style="text-align: center; padding: 0 8px; flex-shrink: 0;">
      <div style="font-size: 10px; color: #636e72; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Shape Gate</div>
      <div style="font-size: 28px; color: #636e72;">&rarr;</div>
    </div>
    <!-- Setup Box -->
    <div style="background: linear-gradient(135deg, #00897b, #00695c); color: #fff; padding: 20px 24px; border-radius: 10px; text-align: center; min-width: 180px; flex: 1; max-width: 240px;">
      <div style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">Setup</div>
      <div style="font-size: 13px; opacity: 0.9;">Combine sources into<br>an actionable payload</div>
      <div style="margin-top: 10px; font-size: 11px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; display: inline-block;">Business logic lives here</div>
    </div>
    <!-- Arrow + Shape Gate -->
    <div style="text-align: center; padding: 0 8px; flex-shrink: 0;">
      <div style="font-size: 10px; color: #636e72; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Shape Gate</div>
      <div style="font-size: 28px; color: #636e72;">&rarr;</div>
    </div>
    <!-- Egress Box -->
    <div style="background: linear-gradient(135deg, #c62828, #b71c1c); color: #fff; padding: 20px 24px; border-radius: 10px; text-align: center; min-width: 180px; flex: 1; max-width: 240px;">
      <div style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">Egress</div>
      <div style="font-size: 13px; opacity: 0.9;">Deterministic script<br>for writes and effects</div>
      <div style="margin-top: 10px; font-size: 11px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; display: inline-block;">Dry-runnable before commit</div>
    </div>
  </div>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    <strong>Ingress</strong> pulls data from one or more sources. Each source &mdash; whether a NetSuite record query or an external spreadsheet &mdash; passes through its own shape gate before anything else touches it. A play can have multiple ingresses, each validated independently.
  </p>
  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    <strong>Setup</strong> takes the individually validated ingress outputs and combines them into a single, actionable payload. This is where business logic lives: filtering, enriching, joining, reshaping. The result has both an underlying shape (the raw combined data) and a visual shape (a human-readable presentation of what the data means).
  </p>
  <p style="font-size: 16px; color: #2d3436; margin-bottom: 24px;">
    <strong>Egress</strong> is a deterministic script that acts on the prepared payload. It writes records, calls external services, sends notifications. Unlike the first two phases, egress is <em>not</em> agent-generated at runtime &mdash; it is authored once during play creation and locked in. This is the highest-stakes part of the pipeline, and predictability here is non-negotiable. Before any egress runs live, it can be dry-run to show exactly what <em>would</em> happen.
  </p>


  <!-- 2b: Shape Enforcement -->
  <h3 id="shape-enforcement-the-trust-layer" style="font-size: 20px; color: #1a1a2e; margin-top: 36px; margin-bottom: 16px;">2b. Shape Enforcement &mdash; The Trust Layer</h3>

  <div style="background: #f0f4f8; border: 1px solid #d0d7de; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
    <p style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px 0; text-align: center;">"Enforce the shape, not the implementation."</p>
    <p style="font-size: 15px; color: #2d3436; margin: 0 0 16px 0;">
      At every phase boundary, the data must conform to a declared shape. The agent is free to generate whatever query or logic it wants &mdash; but the <em>result</em> must match the contract. If it doesn't, the pipeline stops cleanly.
    </p>
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 180px; background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e0e4e8;">
        <div style="font-weight: 700; color: #4a6fa5; margin-bottom: 6px; font-size: 14px;">Composability</div>
        <p style="margin: 0; font-size: 13px; color: #555;">Steps chain reliably because outputs are predictable, even when internals vary.</p>
      </div>
      <div style="flex: 1; min-width: 180px; background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e0e4e8;">
        <div style="font-weight: 700; color: #00897b; margin-bottom: 6px; font-size: 14px;">Monitoring</div>
        <p style="margin: 0; font-size: 13px; color: #555;">You know exactly what to measure and alert on at each boundary.</p>
      </div>
      <div style="flex: 1; min-width: 180px; background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e0e4e8;">
        <div style="font-weight: 700; color: #c62828; margin-bottom: 6px; font-size: 14px;">Accountability</div>
        <p style="margin: 0; font-size: 13px; color: #555;">The agent is evaluated not just on "did it run" but "did it produce the right shape."</p>
      </div>
    </div>
  </div>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    Each ingress has its own shape gate &mdash; this is per-source validation, not bulk. A play pulling transactions, customers, and an external spreadsheet has three separate gates. If one fails, the others still stand, and you know exactly which source broke.
  </p>
  <p style="font-size: 16px; color: #2d3436; margin-bottom: 24px;">
    For NetSuite sources, shapes are inherited from the entity type itself: a Transaction has known fields, a Customer has known fields, a Vendor has known fields. The shape isn't invented &mdash; it's <em>recognized</em>. For external sources, the shape is inferred from sample data at play creation time, confirmed by the user, and then enforced on every subsequent run.
  </p>


  <!-- 2c: NetSuite-Shaped Solutions -->
  <h3 id="netsuite-shaped-solutions" style="font-size: 20px; color: #1a1a2e; margin-top: 36px; margin-bottom: 16px;">2c. NetSuite-Shaped Solutions</h3>

  <div style="background: #fff8e1; border-left: 4px solid #f57c00; padding: 18px 22px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 15px; color: #2d3436;">
      <strong>This is not a generic data pipeline.</strong> Plays are NetSuite-native. They leverage the fact that NetSuite already has a well-defined vocabulary of record types: Transactions, Customers, Vendors, Items, Employees. These are not abstract "data sources" &mdash; they are known entities with known fields and known relationships.
    </p>
  </div>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    Because we work with NetSuite specifically, we get to inherit shapes rather than invent them. When an ingress pulls Sales Orders, we already know what a Sales Order looks like. When it pulls Vendor Bills, we know those fields too. This is a level of confidence that generic pipelines don't have.
  </p>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    <strong>Visual shape vs. underlying shape.</strong> Consider a transaction joined with its line items. The <em>underlying</em> shape is a flat join &mdash; a row for every line item with header fields repeated. But the <em>visual</em> shape is what a human recognizes: a transaction header with line items underneath. Both shapes exist simultaneously. The underlying shape is what the pipeline validates. The visual shape is what the user sees when reviewing results. Helix knows how to translate between them because it knows what NetSuite records <em>mean</em>.
  </p>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 24px;">
    This vocabulary grows organically. As plays encounter new record types, those types become part of the known shape library. There's no need to enumerate all possible shapes upfront. The system learns by doing.
  </p>


  <!-- 2d: Created Once, Run Many Times -->
  <h3 id="created-once-run-many-times" style="font-size: 20px; color: #1a1a2e; margin-top: 36px; margin-bottom: 16px;">2d. Created Once, Run Many Times</h3>

  <!-- Two-Panel Visual -->
  <div style="display: flex; gap: 0; margin: 24px 0; border-radius: 10px; overflow: hidden; border: 1px solid #dee2e6;">
    <div style="flex: 1; background: #f0f4f8; padding: 24px; border-right: 1px solid #dee2e6;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a6fa5; font-weight: 700; margin-bottom: 10px;">Design Time <span style="font-size: 10px; color: #999;">(one-time)</span></div>
      <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #2d3436;">
        <li style="margin-bottom: 8px;">User describes intent in a ticket</li>
        <li style="margin-bottom: 8px;">Helix generates the 3-phase definition</li>
        <li style="margin-bottom: 8px;">Validated in sandbox with examples</li>
        <li style="margin-bottom: 8px;">Play definition stored as a reusable artifact</li>
      </ul>
    </div>
    <div style="flex: 1; background: #fff; padding: 24px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin-bottom: 10px;">Run Time <span style="font-size: 10px; color: #999;">(many times)</span></div>
      <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #2d3436;">
        <li style="margin-bottom: 8px;">Play runs against fresh, live data</li>
        <li style="margin-bottom: 8px;">Every phase logs inputs and outputs</li>
        <li style="margin-bottom: 8px;">Shape gates enforce contracts every run</li>
        <li style="margin-bottom: 8px;">Full audit trail per execution</li>
      </ul>
    </div>
  </div>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 24px;">
    The user's job is to <em>describe what they want</em>, not to build automation machinery. Helix analyzes the ticket, generates the ingress queries with sample data, drafts the setup logic, and writes the egress script skeleton. The user reviews and approves. This is "ticket-to-play" &mdash; the same ticket system they already know, producing a new kind of deliverable.
  </p>


  <!-- 2e: Agent-Generated First -->
  <h3 id="agent-generated-first" style="font-size: 20px; color: #1a1a2e; margin-top: 36px; margin-bottom: 16px;">2e. Agent-Generated First</h3>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    Ingress and Setup phases are agent-generated. The agent crafts the query, the transformation, the combination logic &mdash; guided by a prompt that includes a sample showing what a good result looks like. This gives the agent both flexibility (adapt to the current context) and grounding (a concrete reference of what "right" looks like).
  </p>

  <p style="font-size: 16px; color: #2d3436; margin-bottom: 12px;">
    Egress is different. It is a deterministic script authored at play creation time. It is <em>not</em> regenerated at runtime. The highest-stakes part of the pipeline &mdash; the part that actually writes records, sends messages, or calls external services &mdash; needs to be predictable, auditable, and identical every time it runs.
  </p>

  <div style="background: #e8f5e9; border-left: 4px solid #00897b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0 24px 0;">
    <p style="margin: 0; font-size: 15px; color: #2d3436;">
      <strong>The promotion path:</strong> Over time, agent-generated queries that prove themselves can be "promoted" to static artifacts. The agent teaches you what the play should look like; you graduate it to a locked-in, reproducible form when you're ready. This is not a day-one requirement &mdash; it's the natural evolution.
    </p>
  </div>


  <!-- ================================================================ -->
  <!-- ZONE 2 — ROADMAP                                                 -->
  <!-- ================================================================ -->
  <div style="margin-top: 64px; margin-bottom: 12px;">
    <div style="display: inline-block; background: #0097a7; color: #fff; padding: 6px 18px; border-radius: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Zone 2 &mdash; Roadmap</div>
  </div>

  <h2 id="the-five-levels" style="font-size: 26px; color: #1a1a2e; margin-top: 24px; margin-bottom: 8px;">3. The Five Levels</h2>

  <p style="font-size: 16px; color: #636e72; margin-bottom: 24px;">Each level is independently valuable. Each can be shipped, used, and validated on its own. Together, they build toward a complete play platform.</p>

  <!-- Level Progress Bar -->
  <div style="display: flex; gap: 2px; margin-bottom: 36px; border-radius: 6px; overflow: hidden;">
    <div style="flex: 1; height: 8px; background: #4a6fa5;" title="L1 - Speak the Language"></div>
    <div style="flex: 1; height: 8px; background: #0097a7;" title="L2 - Author the Play"></div>
    <div style="flex: 1; height: 8px; background: #00897b;" title="L3 - Watch It Think"></div>
    <div style="flex: 1; height: 8px; background: #f57c00;" title="L4 - Prove It Works"></div>
    <div style="flex: 1; height: 8px; background: #c62828;" title="L5 - Run It Live"></div>
  </div>


  <!-- ===================== LEVEL 1 ===================== -->
  <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
    <div style="background: linear-gradient(135deg, #4a6fa5, #3b5998); padding: 20px 28px; color: #fff;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: 600;">Level 1</div>
      <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">"Speak the Language"</div>
    </div>
    <div style="padding: 24px 28px;">

      <h4 style="font-size: 15px; color: #4a6fa5; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What changes for the user</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        A new <strong>PLAY</strong> mode appears in the ticket system &mdash; in the web UI, the CLI, and the API &mdash; available for NetSuite organizations. The user can select it when creating a ticket. The old, unused EXECUTE mode disappears from every surface. Tickets get PLY- prefixes. Branches get play naming. The system speaks the user's language for the first time.
      </p>

      <h4 style="font-size: 15px; color: #4a6fa5; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What Helix does differently</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        Replaces the scaffolded-but-never-used EXECUTE mode across all surfaces. PLAY is user-selected only &mdash; Helix never auto-classifies a ticket as a play. It's gated to NetSuite organizations, since plays are NetSuite-native by design.
      </p>

      <h4 style="font-size: 15px; color: #4a6fa5; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Key capabilities</h4>
      <ul style="font-size: 14px; color: #2d3436; padding-left: 20px; margin: 0 0 20px 0;">
        <li style="margin-bottom: 6px;">Mode selector in web UI, CLI, and API</li>
        <li style="margin-bottom: 6px;">API validation for mode + platform</li>
        <li style="margin-bottom: 6px;">PLY- ticket prefix, play branch naming</li>
        <li style="margin-bottom: 6px;">Platform gating (NetSuite orgs only)</li>
        <li style="margin-bottom: 6px;">User-selected only (never auto-classified)</li>
      </ul>

      <div style="display: flex; align-items: center; gap: 16px; background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Scope</div>
        <div style="font-size: 14px; color: #2d3436;">Server ~12 files + 2 migrations &bull; Client ~12 files &bull; CLI 3 files</div>
      </div>

      <!-- Visual: Before/After Mode Chips -->
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600; margin-bottom: 8px;">Before</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span style="background: #e8f0fe; color: #1a73e8; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">AUTO</span>
            <span style="background: #fce8e6; color: #d93025; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">BUILD</span>
            <span style="background: #fef7e0; color: #e37400; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">FIX</span>
            <span style="background: #e6f4ea; color: #137333; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">RESEARCH</span>
            <span style="background: #f1f1f1; color: #999; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; text-decoration: line-through;">EXECUTE</span>
          </div>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600; margin-bottom: 8px;">After</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span style="background: #e8f0fe; color: #1a73e8; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">AUTO</span>
            <span style="background: #fce8e6; color: #d93025; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">BUILD</span>
            <span style="background: #fef7e0; color: #e37400; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">FIX</span>
            <span style="background: #e6f4ea; color: #137333; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">RESEARCH</span>
            <span style="background: linear-gradient(135deg, #4a6fa5, #3b5998); color: #fff; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">PLAY</span>
          </div>
        </div>
      </div>

    </div>
  </div>


  <!-- ===================== LEVEL 2 ===================== -->
  <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
    <div style="background: linear-gradient(135deg, #0097a7, #00838f); padding: 20px 28px; color: #fff;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: 600;">Level 2</div>
      <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">"Author the Play"</div>
    </div>
    <div style="padding: 24px 28px;">

      <h4 style="font-size: 15px; color: #0097a7; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What changes for the user</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        The user describes their intent in a ticket &mdash; "match open invoices against payments weekly" &mdash; and Helix generates a complete three-phase play definition. The user sees the generated ingress queries, the setup logic, and the egress script skeleton. They review, adjust, and approve. A play is born.
      </p>

      <h4 style="font-size: 15px; color: #0097a7; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What Helix does differently</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        When a PLAY ticket runs, the workflow branches into a play-specific path (similar to how research tickets branch today). Helix analyzes the ticket description, generates ingress prompts with sample queries, drafts setup logic, and produces an egress script skeleton. The result is stored as a structured play definition with a status lifecycle: DRAFT, then READY.
      </p>

      <h4 style="font-size: 15px; color: #0097a7; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Key capabilities</h4>
      <ul style="font-size: 14px; color: #2d3436; padding-left: 20px; margin: 0 0 20px 0;">
        <li style="margin-bottom: 6px;">Play data model with phase configurations</li>
        <li style="margin-bottom: 6px;">Agent-generated ingress prompts with sample queries</li>
        <li style="margin-bottom: 6px;">Workflow branching for PLAY mode</li>
        <li style="margin-bottom: 6px;">Play definition API for create and read</li>
        <li style="margin-bottom: 6px;">Status lifecycle (DRAFT &rarr; READY)</li>
      </ul>

      <div style="display: flex; align-items: center; gap: 16px; background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Scope</div>
        <div style="font-size: 14px; color: #2d3436;">Server: new models + migration + API + workflow &bull; Client: play viewer</div>
      </div>

      <!-- Visual: Ticket to Play Definition flow -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin-top: 16px; flex-wrap: wrap;">
        <div style="background: #f0f4f8; border: 2px solid #0097a7; border-radius: 8px; padding: 12px 18px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #0097a7;">Ticket</div>
          <div style="font-size: 11px; color: #636e72;">"Match invoices<br>against payments"</div>
        </div>
        <div style="font-size: 24px; color: #0097a7; padding: 0 10px;">&rarr;</div>
        <div style="background: #f0f4f8; border: 2px solid #0097a7; border-radius: 8px; padding: 12px 18px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #0097a7;">Agent</div>
          <div style="font-size: 11px; color: #636e72;">Analyzes intent,<br>generates 3 phases</div>
        </div>
        <div style="font-size: 24px; color: #0097a7; padding: 0 10px;">&rarr;</div>
        <div style="background: #e0f7fa; border: 2px solid #0097a7; border-radius: 8px; padding: 12px 18px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #0097a7;">Play Definition</div>
          <div style="font-size: 11px; color: #636e72;">Ingress + Setup + Egress<br>with enforced shapes</div>
        </div>
      </div>

    </div>
  </div>


  <!-- ===================== LEVEL 3 ===================== -->
  <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
    <div style="background: linear-gradient(135deg, #00897b, #00695c); padding: 20px 28px; color: #fff;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: 600;">Level 3</div>
      <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">"Watch It Think"</div>
    </div>
    <div style="padding: 24px 28px;">

      <div style="background: #e0f2f1; border: 1px solid #b2dfdb; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #00695c; text-align: center;">
          This is the key unlock &mdash; it proves the core loop works.
        </p>
      </div>

      <h4 style="font-size: 15px; color: #00897b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What changes for the user</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        The user triggers a preview and watches the ingress phases run in sandbox with real data. Zero writes. Zero risk. They see each ingress pull data, pass through its shape gate, and produce validated results. Step by step, source by source. If a shape gate fails, the user sees exactly which source broke and why.
      </p>

      <h4 style="font-size: 15px; color: #00897b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What Helix does differently</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        Runs ingress phases through the NetSuite gateway in sandbox mode. The agent generates the actual query from the ingress prompt and sample. The query executes read-only against the sandbox. The shape gate validates the returned data against the declared output shape. Every generated query and every result is logged.
      </p>

      <h4 style="font-size: 15px; color: #00897b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Key capabilities</h4>
      <ul style="font-size: 14px; color: #2d3436; padding-left: 20px; margin: 0 0 20px 0;">
        <li style="margin-bottom: 6px;">Read-only sandbox execution</li>
        <li style="margin-bottom: 6px;">Shape validation with pass/fail per ingress</li>
        <li style="margin-bottom: 6px;">Per-step results display</li>
        <li style="margin-bottom: 6px;">Execution logging (generated query, raw results, validation)</li>
        <li style="margin-bottom: 6px;">Pipeline halt on shape mismatch</li>
        <li style="margin-bottom: 6px;">Multiple ingresses run independently</li>
      </ul>

      <div style="display: flex; align-items: center; gap: 16px; background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Scope</div>
        <div style="font-size: 14px; color: #2d3436;">Server: execution service + gateway integration + shape validation &bull; Client: results display</div>
      </div>

      <!-- Visual: Step-by-step execution -->
      <div style="margin-top: 16px; border: 1px solid #e0e4e8; border-radius: 8px; overflow: hidden;">
        <div style="background: #f0f4f8; padding: 10px 16px; border-bottom: 1px solid #e0e4e8; font-size: 12px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px;">Execution Preview</div>
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="display: inline-block; width: 22px; height: 22px; background: #00897b; color: #fff; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700;">&#10003;</span>
            <span style="font-size: 14px; color: #2d3436;"><strong>Ingress 1</strong> &mdash; Open Invoices (Transaction)</span>
            <span style="font-size: 11px; color: #00897b; font-weight: 600; margin-left: auto;">Shape: PASS</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="display: inline-block; width: 22px; height: 22px; background: #00897b; color: #fff; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700;">&#10003;</span>
            <span style="font-size: 14px; color: #2d3436;"><strong>Ingress 2</strong> &mdash; Active Customers (Customer)</span>
            <span style="font-size: 11px; color: #00897b; font-weight: 600; margin-left: auto;">Shape: PASS</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="display: inline-block; width: 22px; height: 22px; background: #c62828; color: #fff; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700;">&#10007;</span>
            <span style="font-size: 14px; color: #2d3436;"><strong>Ingress 3</strong> &mdash; Rate Sheet (External)</span>
            <span style="font-size: 11px; color: #c62828; font-weight: 600; margin-left: auto;">Shape: FAIL &mdash; missing "effective_date"</span>
          </div>
        </div>
      </div>

    </div>
  </div>


  <!-- ===================== LEVEL 4 ===================== -->
  <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
    <div style="background: linear-gradient(135deg, #f57c00, #e65100); padding: 20px 28px; color: #fff;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: 600;">Level 4</div>
      <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">"Prove It Works"</div>
    </div>
    <div style="padding: 24px 28px;">

      <h4 style="font-size: 15px; color: #f57c00; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What changes for the user</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        The full pipeline runs end-to-end in sandbox. The setup phase combines ingress results. The egress dry-run shows exactly what <em>would</em> be written &mdash; which records, which fields, which values &mdash; without committing anything. Canonical examples demonstrate the play works: synthetic but realistic records, created in sandbox, prove the pipeline from end to end.
      </p>

      <h4 style="font-size: 15px; color: #f57c00; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What Helix does differently</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        The setup phase merges ingress outputs into the actionable payload. The egress runs in dry-run mode first, producing a preview of intended effects. Canonical examples co-develop alongside play logic: the query tells Helix what examples to generate, the examples reveal whether the query works, and both tighten in tandem until the pipeline consistently passes.
      </p>

      <h4 style="font-size: 15px; color: #f57c00; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Key capabilities</h4>
      <ul style="font-size: 14px; color: #2d3436; padding-left: 20px; margin: 0 0 20px 0;">
        <li style="margin-bottom: 6px;">Full 3-phase pipeline execution in sandbox</li>
        <li style="margin-bottom: 6px;">Egress dry-run showing intended writes</li>
        <li style="margin-bottom: 6px;">Canonical example generation (synthetic records via gateway)</li>
        <li style="margin-bottom: 6px;">Co-development loop (query and examples refine each other)</li>
        <li style="margin-bottom: 6px;">Validation gate before a play is considered "proven"</li>
        <li style="margin-bottom: 6px;">Full audit trail for every phase</li>
      </ul>

      <div style="display: flex; align-items: center; gap: 16px; background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Scope</div>
        <div style="font-size: 14px; color: #2d3436;">Server: canonical model + dry-run + validation loop &bull; Client: dry-run display</div>
      </div>

      <div style="background: #fff8e1; border-left: 4px solid #f57c00; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #2d3436;">
          <strong>Note:</strong> Canonical examples are a platform primitive, not play-specific. They serve both build (prove it works before production) and fix (reproduce failures). Any Helix artifact that executes against NetSuite benefits from them.
        </p>
      </div>

      <!-- Visual: Co-development loop -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin-top: 16px; flex-wrap: wrap;">
        <div style="background: #fff3e0; border: 2px solid #f57c00; border-radius: 8px; padding: 14px 20px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #e65100;">Draft Query</div>
          <div style="font-size: 11px; color: #636e72;">Agent generates<br>from play intent</div>
        </div>
        <div style="font-size: 20px; color: #f57c00; padding: 0 6px;">&rarr;</div>
        <div style="background: #fff3e0; border: 2px solid #f57c00; border-radius: 8px; padding: 14px 20px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #e65100;">Generate Examples</div>
          <div style="font-size: 11px; color: #636e72;">Synthetic sandbox<br>records via gateway</div>
        </div>
        <div style="font-size: 20px; color: #f57c00; padding: 0 6px;">&rarr;</div>
        <div style="background: #fff3e0; border: 2px solid #f57c00; border-radius: 8px; padding: 14px 20px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #e65100;">Run &amp; Validate</div>
          <div style="font-size: 11px; color: #636e72;">Execute pipeline,<br>check shapes</div>
        </div>
        <div style="font-size: 20px; color: #f57c00; padding: 0 6px;">&larr;</div>
        <div style="background: #fff3e0; border: 2px solid #f57c00; border-radius: 8px; padding: 14px 20px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #e65100;">Refine</div>
          <div style="font-size: 11px; color: #636e72;">Tighten both until<br>consistently correct</div>
        </div>
      </div>

    </div>
  </div>


  <!-- ===================== LEVEL 5 ===================== -->
  <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
    <div style="background: linear-gradient(135deg, #c62828, #b71c1c); padding: 20px 28px; color: #fff;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: 600;">Level 5</div>
      <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">"Run It Live"</div>
    </div>
    <div style="padding: 24px 28px;">

      <h4 style="font-size: 15px; color: #c62828; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What changes for the user</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        Plays execute against production data with full safety controls. Before anything is written, the system captures a snapshot of what the records look like now. After the write, it logs exactly what changed. If something can be undone, the system knows how. If it can't, the user sees an approval gate before anything irreversible happens.
      </p>

      <h4 style="font-size: 15px; color: #c62828; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What Helix does differently</h4>
      <p style="font-size: 15px; color: #2d3436; margin: 0 0 20px 0;">
        The NetSuite gateway wraps every write in a governance envelope: before-image capture, operation-type tagging, write audit logging. Production credential routing activates for approved play execution. Each operation gets an idempotency key to prevent double-execution. Concurrency detection uses optimistic timestamps to catch drift between sandbox validation and production execution.
      </p>

      <h4 style="font-size: 15px; color: #c62828; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Key capabilities</h4>
      <ul style="font-size: 14px; color: #2d3436; padding-left: 20px; margin: 0 0 20px 0;">
        <li style="margin-bottom: 6px;">Before-image capture on every write</li>
        <li style="margin-bottom: 6px;">Write audit logging (who, what, when, what changed)</li>
        <li style="margin-bottom: 6px;">3-layer idempotency (NetSuite-side, governance-side, pre-check)</li>
        <li style="margin-bottom: 6px;">Approval gates for irreversible actions</li>
        <li style="margin-bottom: 6px;">Concurrency detection via optimistic timestamps</li>
      </ul>

      <div style="display: flex; align-items: center; gap: 16px; background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">Scope</div>
        <div style="font-size: 14px; color: #2d3436;">Server: governance wrapper + audit model + approval flow &bull; Client: approval UI + audit viewer</div>
      </div>

      <!-- RSH-702 Integration Callout -->
      <div style="background: #fce4ec; border: 1px solid #f8bbd0; border-radius: 8px; padding: 18px 22px; margin-top: 16px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #c62828;">RSH-702 Integration: Reversibility &amp; Containment</p>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #2d3436;">
          The governance model for production play execution is grounded in the <strong>RSH-702 feasibility assessment</strong>, which established:
        </p>
        <ul style="font-size: 13px; color: #2d3436; padding-left: 18px; margin: 0 0 10px 0;">
          <li style="margin-bottom: 4px;"><strong>3-tier reversibility model:</strong> Tier-1 (atomic inverse via <code>transaction.void()</code>), Tier-2 (derived inverse via before-image restore), Tier-3 (no inverse &mdash; monitor only)</li>
          <li style="margin-bottom: 4px;"><strong>NS-GM containment:</strong> The gateway is a controllable chokepoint for all Helix-initiated operations, with a known structural leak from SDF-deployed scripts running autonomously</li>
          <li style="margin-bottom: 4px;"><strong>REVERSALVOIDING variability:</strong> Void semantics differ per NetSuite account &mdash; must be checked at runtime</li>
        </ul>
        <p style="margin: 0; font-size: 13px; color: #2d3436;">
          <strong>4 Conditions for Go:</strong> (1) Before-image + write audit built into gateway before any production writes. (2) User-event script enumeration per record type at design time. (3) Unconditional human approval for Tier-3 actions. (4) REVERSALVOIDING preference checked at runtime before any void.
        </p>
      </div>

      <!-- Visual: Governance Stack -->
      <div style="margin-top: 20px; border: 1px solid #e0e4e8; border-radius: 8px; overflow: hidden;">
        <div style="background: #f0f4f8; padding: 10px 16px; border-bottom: 1px solid #e0e4e8; font-size: 12px; font-weight: 600; color: #636e72; text-transform: uppercase; letter-spacing: 1px;">Governance Stack</div>
        <div style="padding: 0;">
          <div style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px;">
            <span style="display: inline-block; background: #c62828; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 80px; text-align: center;">Layer 5</span>
            <span style="font-size: 14px; color: #2d3436;">Approval gates for irreversible (Tier-3) actions</span>
          </div>
          <div style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px;">
            <span style="display: inline-block; background: #e65100; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 80px; text-align: center;">Layer 4</span>
            <span style="font-size: 14px; color: #2d3436;">Concurrency detection (optimistic timestamps)</span>
          </div>
          <div style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px;">
            <span style="display: inline-block; background: #f57c00; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 80px; text-align: center;">Layer 3</span>
            <span style="font-size: 14px; color: #2d3436;">3-layer idempotency (externalId + operation IDs + pre-check)</span>
          </div>
          <div style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px;">
            <span style="display: inline-block; background: #ffa726; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 80px; text-align: center;">Layer 2</span>
            <span style="font-size: 14px; color: #2d3436;">Write audit logging (before-image, after-image, operation)</span>
          </div>
          <div style="padding: 10px 16px; display: flex; align-items: center; gap: 12px;">
            <span style="display: inline-block; background: #ffcc02; color: #333; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 80px; text-align: center;">Layer 1</span>
            <span style="font-size: 14px; color: #2d3436;">Before-image capture (snapshot before any mutation)</span>
          </div>
        </div>
      </div>

    </div>
  </div>


  <!-- ================================================================ -->
  <!-- ZONE 3 — REFERENCE                                               -->
  <!-- ================================================================ -->
  <div style="margin-top: 64px; margin-bottom: 12px;">
    <div style="display: inline-block; background: #c62828; color: #fff; padding: 6px 18px; border-radius: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Zone 3 &mdash; Reference</div>
  </div>


  <!-- SECTION 4: ARCHITECTURE & DATA MODEL -->
  <h2 id="architecture-and-data-model" style="font-size: 26px; color: #1a1a2e; margin-top: 24px; margin-bottom: 16px;">4. Architecture &amp; Data Model</h2>

  <h3 id="data-model-overview" style="font-size: 18px; color: #1a1a2e; margin-top: 28px;">4.1 Data Model Overview</h3>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background: #1a1a2e; color: #fff;">
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Model</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Key Fields</th>
          <th style="padding: 10px 14px; text-align: center; border: 1px solid #1a1a2e;">Level</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Relationship</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">PlayDefinition</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">ticketId, status (DRAFT/READY), metadata, createdAt</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">L2</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">1:1 with Ticket</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">PlayPhase</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">type (INGRESS/SETUP/EGRESS), prompt, sample, outputSchema, ordering</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">L2</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">Many:1 with PlayDefinition</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">PlayRun</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">playDefinitionId, environment, status, triggeredBy, timestamps</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">L3</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">Many:1 with PlayDefinition</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">PlayStepResult</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">playRunId, phaseType, input, output, shapeValidation, duration</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">L3</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">Many:1 with PlayRun</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">PlayWriteAuditLog</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">playRunId, recordType, recordId, beforeImage, afterImage, operation, operationId</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #c62828; color: #fff; padding: 2px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">L5</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">Many:1 with PlayRun</td>
        </tr>
      </tbody>
    </table>
  </div>


  <h3 id="implementation-surface-per-repo" style="font-size: 18px; color: #1a1a2e; margin-top: 28px;">4.2 Implementation Surface per Repo</h3>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background: #1a1a2e; color: #fff;">
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Repo</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Responsibilities</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-server</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">Prisma schema &amp; migrations, API endpoints, mode validation, platform config, workflow orchestration, NS-GM gateway integration, shape validation, audit logging</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-client</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">Mode UI (icon, label, selector, filters), play viewer, execution results display, approval UI, audit viewer</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">helix-cli</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-size: 12px;">VALID_MODES update, help text, MCP tool mode options</td>
        </tr>
      </tbody>
    </table>
  </div>


  <h3 id="migration-and-deploy-notes" style="font-size: 18px; color: #1a1a2e; margin-top: 28px;">4.3 Migration &amp; Deploy Notes</h3>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0;">
    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #856404;">Migration Sequencing</p>
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #2d3436;">
      <code>PLAYBOOK_CHECK</code> exists in production (3 tickets from BLD-677) but is not in the local Prisma schema. A <strong>sync migration</strong> must add <code>PLAYBOOK_CHECK</code> to the enum <em>before</em> the <code>PLAY</code> migration, or the deploy will fail.
    </p>
    <p style="margin: 0; font-size: 13px; color: #2d3436;">
      <strong>Deploy ordering:</strong> Server first (schema changes, API), then client and CLI (consuming the new mode).
    </p>
  </div>


  <!-- SECTION 5: OPEN QUESTIONS & RISKS -->
  <h2 id="open-questions-and-risks" style="font-size: 26px; color: #1a1a2e; margin-top: 48px; margin-bottom: 16px;">5. Open Questions &amp; Risks</h2>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background: #1a1a2e; color: #fff;">
          <th style="padding: 10px 14px; text-align: center; border: 1px solid #1a1a2e; width: 5%;">#</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e; width: 40%;">Question / Area</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Status &amp; Recommendation</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">1</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">How many agentic iterations for query/example co-development before surfacing results?</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Open</span> Convergence signal needed (e.g., output shape consistently satisfied). Too few = weak play, too many = slow and expensive. Recommend starting with 3 iterations max and tuning.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">2</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">ns-gm depth &mdash; can it generate related records (invoice with customer + terms + line items)?</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Open</span> Today ns-gm handles individual record creation. Generating realistic record <em>graphs</em> (parent + child + dependencies) is unverified. Needs research spike.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">3</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Sandbox SuiteQL fidelity vs. production schema</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Open</span> SuiteQL runs against sandbox schema, which may differ from production (custom fields, record types added/removed). Plays proven in sandbox may encounter schema drift in production.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">4</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">BLD-634 convergence (approval gate adjacency)</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Monitor</span> Approval gates for play execution (L5) may share infrastructure with BLD-634 approval flows. Coordinate to avoid duplication.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">5</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">User-event script enumeration per record type (account-dependent tier classification)</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fce4ec; color: #c62828; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Required for L5</span> Tier-1 classification is conditional on whether user-event scripts deploy side effects. RSH-411 inference pipeline may help. Needs per-account enumeration at design time.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">6</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">REVERSALVOIDING variability across accounts</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fce4ec; color: #c62828; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Required for L5</span> Void semantics differ per account setting: direct void vs. reversing journal. Must be checked at runtime before any void operation.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">7</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Triggered automation (Rung 2) &mdash; scheduled/event-driven plays</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #f1f1f1; color: #636e72; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Deferred</span> Running plays on a schedule or in response to events is a natural evolution but out of MVP scope. Depends on L4+ being solid first.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; text-align: center; font-weight: 600;">8</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Canonical examples as platform primitive vs. play-specific</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-right: 6px;">Decided</span> Canonical examples are a platform-level Helix primitive applicable to all modes (build, fix, play). Plays are one consumer, not the owner. Design accordingly.</td>
        </tr>
      </tbody>
    </table>
  </div>


  <!-- SECTION 6: EVIDENCE SOURCES -->
  <h2 id="evidence-sources" style="font-size: 26px; color: #1a1a2e; margin-top: 48px; margin-bottom: 16px;">6. Evidence Sources</h2>

  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background: #1a1a2e; color: #fff;">
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e; width: 30%;">Source</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e; width: 15%;">Type</th>
          <th style="padding: 10px 14px; text-align: left; border: 1px solid #1a1a2e;">Key Finding Used</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">Production database (runtime query)</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Runtime</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">876 tickets total. EXECUTE=0 (safe to replace). AUTO=296, RESEARCH=239, BUILD=194, FIX=144, PLAYBOOK_CHECK=3.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">ticket.md Discussion (37 messages)</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Discussion</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Evolved play anatomy: Map/Reduce/Output &rarr; Prepare+Act &rarr; Ingress/Setup/Egress. Shape gates per source. Agent-generated queries. Deterministic egress. NetSuite-shaped solutions. Visual vs. underlying shape. Canonical examples as platform primitive.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">ticket.md RSH-702 Report</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Research</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">3-tier reversibility model. NS-GM containment (chokepoint + structural leak). 6 reusable components, 9 net-new. Conditional Go with 4 conditions. 12 action-inverse pairs.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">prisma/schema.prisma</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Codebase</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">TicketMode enum: AUTO, BUILD, FIX, RESEARCH, EXECUTE. No PLAY value. No play-related models.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">platform-config.ts</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Codebase</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">NETSUITE platform allows EXECUTE; GENERAL and SMB exclude it. Pattern extends directly to PLAY.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">credentials.ts</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Codebase</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">PRODUCTION routing for scout/diagnosis; SANDBOX for everything else. Play execution starts in sandbox.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">ns_gm_restlet.js</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Codebase</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Raw <code>new Function()</code> execution. No governance wrapper, no before-image, no write audit. Governance must be built in for L5.</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">inspection-audit-service.ts</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Codebase</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Read-only audit pattern (DATABASE/LOGS/API types). Reusable fire-and-forget pattern for play audit logging, but needs write-operation types.</td>
        </tr>
        <tr style="background: #fff;">
          <td style="padding: 10px 14px; border: 1px solid #dee2e6; font-weight: 600;">RSH-411 report</td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;"><span style="display: inline-block; background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">Adjacent Research</span></td>
          <td style="padding: 10px 14px; border: 1px solid #dee2e6;">Inference-first SDF enumeration. May provide mechanism for per-account user-event script enumeration needed for L5 tier classification.</td>
        </tr>
      </tbody>
    </table>
  </div>


  <!-- FOOTER -->
  <div style="margin-top: 64px; padding-top: 20px; border-top: 2px solid #dee2e6;">
    <p style="font-size: 12px; color: #999; margin: 0;">
      Report generated June 7, 2026 &bull; RSH-707 &bull; Referenced tickets: RSH-702 (Reversibility &amp; Containment), RSH-411 (SDF Enumeration), BLD-677 (Playbook Check), BLD-634 (Approval Gates)
    </p>
  </div>

</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-06T21:22:49.646Z) [Agent]: Your research report is ready!
- **Helix** (2026-06-07T00:51:07.245Z) [Agent]: Your research report is ready!

![Verification Screenshot](/tickets/cmq2t6x8s000tbd0ubs8ie2bt/proof/0/image?runId=cmq2w87tt00cvbd0urtl3uhqe)

![Verification Screenshot](/tickets/cmq2t6x8s000tbd0ubs8ie2bt/proof/1/image?runId=cmq2w87tt00cvbd0urtl3uhqe)

![Verification Screenshot](/tickets/cmq2t6x8s000tbd0ubs8ie2bt/proof/2/image?runId=cmq2w87tt00cvbd0urtl3uhqe)

![Verification Screenshot](/tickets/cmq2t6x8s000tbd0ubs8ie2bt/proof/3/image?runId=cmq2w87tt00cvbd0urtl3uhqe)

![Verification Screenshot](/tickets/cmq2t6x8s000tbd0ubs8ie2bt/proof/4/image?runId=cmq2w87tt00cvbd0urtl3uhqe)
- **Usher** (2026-06-07T02:01:51.650Z) [Helix]: @Helix similar to the discussion about the play, what if instead of examples, actual examples in a sandbox, we have a description of how to make good examples along with an example example?

That answers questions like: How does the verification make new examples to show the user?
- **Helix** (2026-06-07T02:02:11.013Z) [Agent]: That's a clean reframe. Instead of Helix actually generating and running synthetic sandbox records, the deliverable becomes:

1. **A guide** — what makes a good canonical example for *this specific automation*: which fields matter, what edge cases are worth covering, what a happy path looks like, and why
2. **A worked example** — a concrete, filled-in sample showing exactly what one canonical example looks like end-to-end

This answers the verification question naturally: when verification runs, it doesn't need to spin up real sandbox records — it follows the guide to *construct* examples on the fly, using the pattern laid out. The guide becomes the template that makes new examples reproducible and consistent.

The tradeoff worth thinking through: the original design's strength was *proof* — the logic actually ran and passed. This version shifts from proof to *comprehension* — the user understands what should happen and could verify it themselves. That's still valuable (arguably more transparent), but it's a different kind of confidence.

A possible middle ground: the guide + example *is* the artifact, but it's written specifically enough that it could also be used as a spec for running the real sandbox test later. Best of both — lightweight now, executable later.

Does that match the direction you're thinking, or is the goal to fully replace sandbox execution with this approach?
- **Usher** (2026-06-07T02:02:47.122Z) [Helix]: You misunderstood
- **Helix** (2026-06-07T02:02:53.411Z) [Agent]: Got it — can you help me understand what you meant? What should the deliverable actually look like?
- **Usher** (2026-06-07T02:03:07.780Z) [Helix]: Let's think about this practically. Someone has to come up with these canonical examples. Do you think that's trivial?
- **Helix** (2026-06-07T02:03:26.492Z) [Agent]: No, not at all. Coming up with good canonical examples requires actually understanding the automation — what it does, what data it touches, where it can go wrong, what "correct" even looks like. That's the hard part.

Which is exactly the point, I think. Helix built the automation, so Helix is the only one who can reason about what examples *should* exist. A non-technical user can't just invent meaningful edge cases for a NetSuite query they didn't write.

So when you said "a description of how to make good examples along with an example example" — were you saying Helix should do that intellectual work (figuring out *what* the right examples are and *why*) and surface it as a clear, readable artifact, rather than silently running sandbox records the user can't see or evaluate?
- **Usher** (2026-06-07T02:04:14.656Z) [Helix]: No, no, no! Of course we definitely, for sure need actual examples in a sandbox to run the automation on it, to run them through whatever process customization that Helix is implementing in the build or fix, and to show the user the before and after. That's a baseline.
- **Helix** (2026-06-07T02:04:28.325Z) [Agent]: Understood — actual sandbox records, running the automation against them, and showing the user the before and after is non-negotiable. That's the foundation.

So going back to your original question — given that's a baseline, what were you adding on top of it? Were you saying there should also be a *description* of the examples (explaining why each one exists, what it's testing, what the expected output means) so the user can actually understand what they're looking at — not just see raw before/after data?
- **Usher** (2026-06-07T02:04:50.373Z) [Helix]: No
- **Helix** (2026-06-07T02:05:02.954Z) [Agent]: I keep misreading you — can you say it in a different way? What should exist that doesn't exist today?
- **Usher** (2026-06-07T02:05:28.399Z) [Helix]: Suppose the implementation agent comes up with an actual concrete set of canonical examples. It ran it through the customization and it now has the before and after. What does the verification agent do now?
- **Helix** (2026-06-07T02:05:43.738Z) [Agent]: The verification agent checks whether the outputs are actually correct — meaning it looks at the before/after results and confirms the automation did what it was supposed to do.

But here's the interesting part: to do that, the verification agent needs to *understand* what "correct" looks like for each example. It can't just eyeball raw data. It needs to know:
- What this example was testing
- What the expected output should be
- Why that output would be right or wrong

Which means the implementation agent can't just hand over before/after data in isolation. It needs to hand over the examples *with enough context* that verification can actually evaluate them — what each one represents, what the correct result is, and why.

Is that the gap you're pointing at? That the implementation agent needs to produce not just the examples, but the *description of the examples* — essentially a spec that verification (and the user) can actually read and use?
- **Usher** (2026-06-07T02:06:07.653Z) [Helix]: Nope, you jumped on something and you're not letting it go.
- **Helix** (2026-06-07T02:06:24.613Z) [Agent]: You're right, I keep steering back to the same idea. Let me drop it completely.

Can you just tell me directly what you're pointing at? I'll stop guessing.
- **Usher** (2026-06-07T02:07:49.142Z) [Helix]: So not only do we have to have a set of canonical examples there before they were run through the customization and thereafter they were run through the customization., We also need this to be a repeatable process because the implementation agent doesn't build it, the verification agent does re-run the whole process. It has to now come up with its own examples that it can rerun. Of course it's helpful to have a single case of a single concrete canonical before-and-after example. Once you figure out how to do that, wouldn't it be prudent to keep that recipe for what a canonical example for this customization looks like so that it can be repeated? Not by the user but at another place when the user asks for concrete examples. There may be many places where the user asks for concrete examples.
- **Helix** (2026-06-07T02:08:03.638Z) [Agent]: That makes complete sense. The hard work is figuring out *what* a canonical example looks like for a specific customization — which fields, which record types, what boundary conditions matter. Once that's been worked out, the recipe for producing those examples should be captured and stored as a persistent artifact.

That way, any agent (or future run) can pick up the recipe and reproduce the examples from scratch, independently. It's not about the user doing it, and it's not locked inside one run — it's a reusable specification that says "here's how to construct a valid canonical example for *this* customization." And since a user might ask for concrete examples in many different contexts, having that recipe available means you don't have to re-derive it every time.

So the deliverable isn't just the before/after examples — it's the **recipe that generated them**, stored alongside the automation, ready to be replayed.

Is that it?
- **Usher** (2026-06-07T02:09:20.645Z) [Helix]: Yeah that sounds about right. Let's say for any ticket, really for any rule or play or anything, but let's say for now a ticket. Somewhere along the line we should:

- come up with canonical examples

- build the customization

- run the canonical examples through the customization

- ensure the results



And we should make this process repeatable at any time.
- **Helix** (2026-06-07T02:09:34.049Z) [Agent]: That's a clean, durable loop. To summarize what that looks like end-to-end:

1. **Come up with canonical examples** — Helix figures out what good examples look like for *this specific* customization: which records, which field values, which edge cases matter and why
2. **Build the customization** — the automation itself
3. **Run the examples through it** — produce a concrete before/after result
4. **Verify the results** — confirm the output is actually correct

And critically — the recipe for step 1 gets stored as a persistent artifact alongside the customization. So at any future point (a re-run, a fix, a user asking "can you show me this in action"), any agent can pick up that recipe and reproduce the full cycle from scratch without reinventing it.

The thing that makes this work is that the recipe is *specific* — not generic advice about canonical examples, but the exact spec for this customization's examples. That's what makes it replayable rather than just reference material.

Does the research report capture enough of this to use as a foundation, or does the framing from this conversation change what needs to be in it?
- **Usher** (2026-06-07T02:11:26.786Z) [Helix]: Here's what I would say: let's do two things:

1. Let's do a spike to check to see if this is even reasonable.

2. In the PxEvals account we have 13 evals. Let's see if this research report can flesh out what the before and after canonical examples would look like for those 13 evals.



&nbsp;

If we can find it for those 13 evals, then we're in business. 



Next we can go into how we integrate this into the flow. Let's do a theoretical check of what we can do for these 13 evals. Come up with a set of before-and-after examples that are so cool that they give confidence that the customization was correct.
- **Helix** (2026-06-07T02:12:15.271Z) [Agent]: Here's what the research report actually has — and where the gap is for your spike idea.

**What the report gives you:** A solid structural foundation. It defines the exact shape of a canonical example — the data model (`CanonicalExample` with fields like `syntheticRecords`, `expectedOutput`, `actualOutput`, `status`), the generation workflow, and how before/after pairs should be stored and displayed. It's essentially the *recipe format*.

**What it doesn't have:** Any knowledge of those 13 specific evals in PxEvals. It doesn't know what each eval does, what records it operates on, or what "correct output" looks like for any of them.

**So here's what the spike actually looks like:** Take the recipe from this report, apply it to the 13 evals — figure out what input records each eval needs, what the expected output is, and produce a before/after pair for each one. If we can do that and the before/afters are clear enough that you immediately *get it* — "oh yes, that's exactly what this eval should do" — then the approach is proven.

The interesting question is whether the spike should tackle all 13 or start with one or two to validate the pattern first before scaling up. Going deep on 2-3 well-chosen evals would probably be more convincing than shallow before/afters on all 13.

Do you want me to kick off that spike now, or do you want to pick which evals to start with first?
- **Usher** (2026-06-07T02:13:18.897Z) [Helix]: You are in AI. You can go deeply into all 13, go very deeply into all 13, go one at a time for each one. Find before, find after. If later on you get more information and you want to go back, do that by all means. If on eval six you discover something you want to go back and apply it to eval one, by all means go deep into all 13. Take as long as you need.
- **Helix** (2026-06-07T02:13:28.373Z) [Agent]: On it — Helix is diving into all 13 evals, going deep on each one and working through them iteratively. This will take some time, but it'll backtrack and refine as it learns, so expect something thorough.
