# Ticket Context

- ticket_id: cmq2t6x8s000tbd0ubs8ie2bt
- short_id: RSH-725
- run_id: cmq2w87tt00cvbd0urtl3uhqe
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
  <title>MVP NetSuite Play Mode &mdash; RSH-707</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 32px 24px; background: #fafbfc;">

  <!-- ================================================================ -->
  <!-- REPORT HEADER -->
  <!-- ================================================================ -->
  <div style="border-bottom: 4px solid #2d3436; padding-bottom: 24px; margin-bottom: 16px;">
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #636e72; margin: 0 0 8px 0;">Design Specification</p>
    <h1 id="mvp-netsuite-play-mode" style="font-size: 32px; font-weight: 800; color: #2d3436; margin: 0 0 8px 0; letter-spacing: -0.5px;">MVP NetSuite Play Mode</h1>
    <p style="font-size: 18px; color: #636e72; margin: 0 0 20px 0; font-style: italic;">A Play is a 3-step composed pipeline that turns user intent into repeatable, previewable NetSuite automation.</p>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <span style="display: inline-block; background: #dfe6e9; color: #2d3436; padding: 4px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">RSH-707</span>
      <span style="display: inline-block; background: #dfe6e9; color: #2d3436; padding: 4px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">June 6, 2026</span>
      <span style="display: inline-block; background: #6c5ce7; color: #fff; padding: 4px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">Status: Active Research</span>
    </div>
  </div>

  <!-- Stat Ribbon -->
  <div style="display: flex; gap: 0; margin-bottom: 40px; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6;">
    <div style="flex: 1; background: #fff; padding: 14px 16px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #2d3436;">876</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72;">Production Tickets</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 16px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #c62828;">0</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72;">Execute Tickets</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 16px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #6c5ce7;">5</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72;">MVP Levels</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 16px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #0097a7;">3</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72;">Pipeline Steps</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 16px; text-align: center;">
      <div style="font-size: 28px; font-weight: 800; color: #00897b;">3</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72;">Repos</div>
    </div>
  </div>

  <!-- Table of Contents -->
  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px 28px; margin-bottom: 48px;">
    <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 16px 0; color: #2d3436;">Contents</h2>
    <div style="display: flex; gap: 32px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 200px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #667eea; font-weight: 700; margin: 0 0 8px 0;">Vision</p>
        <ol style="margin: 0; padding-left: 18px; font-size: 14px; list-style: none;">
          <li style="margin-bottom: 6px;"><a href="#the-problem" style="color: #0984e3; text-decoration: none;">1. The Problem</a></li>
          <li style="margin-bottom: 6px;"><a href="#what-is-a-play" style="color: #0984e3; text-decoration: none;">2. What Is a Play?</a></li>
        </ol>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin: 16px 0 8px 0;">Roadmap</p>
        <ol start="3" style="margin: 0; padding-left: 18px; font-size: 14px; list-style: none;">
          <li style="margin-bottom: 6px;"><a href="#the-five-levels" style="color: #0984e3; text-decoration: none;">3. The Five Levels</a></li>
        </ol>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #636e72; font-weight: 700; margin: 0 0 8px 0;">Reference</p>
        <ol start="4" style="margin: 0; padding-left: 18px; font-size: 14px; list-style: none;">
          <li style="margin-bottom: 6px;"><a href="#architecture-and-data-model" style="color: #0984e3; text-decoration: none;">4. Architecture &amp; Data Model</a></li>
          <li style="margin-bottom: 6px;"><a href="#implementation-surface" style="color: #0984e3; text-decoration: none;">5. Implementation Surface</a></li>
          <li style="margin-bottom: 6px;"><a href="#open-questions-and-risks" style="color: #0984e3; text-decoration: none;">6. Open Questions &amp; Risks</a></li>
          <li style="margin-bottom: 6px;"><a href="#future-work" style="color: #0984e3; text-decoration: none;">7. Future Work</a></li>
          <li style="margin-bottom: 6px;"><a href="#evidence-sources" style="color: #0984e3; text-decoration: none;">8. Evidence Sources</a></li>
        </ol>
      </div>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ZONE 1: VISION -->
  <!-- ================================================================ -->
  <div style="background: linear-gradient(135deg, #667eea11, #764ba211); border-left: 4px solid #667eea; padding: 8px 16px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #667eea; font-weight: 700;">Zone 1 &mdash; Vision</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 1: THE PROBLEM -->
  <!-- ============================================================ -->
  <h2 id="the-problem" style="font-size: 26px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">1. The Problem</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">Helix knows how to <strong>build</strong> NetSuite scripts. It knows how to <strong>fix</strong> broken ones. It knows how to <strong>research</strong> questions about an account's setup. What it doesn't know how to do is <strong>run things</strong>.</p>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">Today, if a user wants to find all overdue invoices and flag the customers for credit hold, they describe the task in a Helix ticket. Helix generates the SuiteScript to do it. Then the user is on their own: they deploy the script, run it, watch it, debug it when it breaks, and run it again next month. Helix produced the code, but the <em>operation</em> &mdash; the thing the user actually wanted &mdash; is the user's problem.</p>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">This gap was supposed to be filled by Execute mode. It never was. Out of <strong>876 production tickets</strong>, zero used Execute. The mode existed in the database, in the UI, in the CLI &mdash; but no one ever selected it, because it didn't do anything different from Build.</p>

  <div style="background: #fff3e0; border-left: 4px solid #f57c00; padding: 18px 22px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0; font-size: 16px; color: #2d3436; font-weight: 500;">The gap is clear: Helix generates <em>code</em>, but it doesn't generate <em>operations</em>. Users want "find overdue invoices and flag them" as a living automation, not a script they maintain.</p>
  </div>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">Plays close this gap. A Play is an automation that Helix builds, previews, and runs &mdash; where the user describes the intent, reviews the plan, and approves the execution. The user stays in control without doing the heavy lifting.</p>

  <p style="font-size: 13px; color: #636e72; margin-top: 20px;"><em>Source: Production database query, June 6, 2026 &mdash; 876 tickets total. Mode distribution: AUTO 296, RESEARCH 239, BUILD 194, FIX 144, PLAYBOOK_CHECK 3, EXECUTE 0.</em></p>

  <!-- ============================================================ -->
  <!-- SECTION 2: WHAT IS A PLAY? -->
  <!-- ============================================================ -->
  <h2 id="what-is-a-play" style="font-size: 26px; color: #2d3436; margin-top: 56px; margin-bottom: 16px;">2. What Is a Play?</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">A Play is a composed, repeatable automation pipeline. It takes a user's intent &mdash; "reconcile vendor bills against purchase orders and flag mismatches" &mdash; and turns it into three connected steps that gather data, transform it, and act on it. Each step's output is checked before the next step receives it. The first two steps are fully safe to preview because they don't change anything. The third shows exactly what it <em>would</em> do before doing it.</p>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436; font-weight: 500;">One sentence: describe intent, get a reviewable automation that runs as many times as you need.</p>

  <!-- 2a: The 3-Step Pipeline -->
  <h3 id="the-3-step-pipeline" style="font-size: 20px; color: #2d3436; margin-top: 40px;">2a. The 3-Step Pipeline</h3>

  <p style="font-size: 16px; line-height: 1.8;">Every play follows the same three-step structure. Data flows left to right, and at each boundary a shape gate verifies the output before passing it forward:</p>

  <!-- CSS Pipeline Flow Diagram -->
  <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin: 32px 0; flex-wrap: wrap;">
    <!-- Map Box -->
    <div style="background: #e3f2fd; border: 2px solid #1565c0; border-radius: 10px; padding: 20px 24px; text-align: center; min-width: 160px; flex: 1; max-width: 220px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #1565c0; font-weight: 700; margin-bottom: 6px;">Step 1</div>
      <div style="font-size: 20px; font-weight: 700; color: #1565c0;">Map</div>
      <div style="font-size: 13px; color: #555; margin-top: 6px;">Gather data</div>
      <div style="margin-top: 8px;"><span style="display: inline-block; background: #c8e6c9; color: #2e7d32; font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600;">Read-only</span></div>
    </div>
    <!-- Arrow 1 -->
    <div style="display: flex; flex-direction: column; align-items: center; padding: 0 6px;">
      <div style="font-size: 24px; color: #636e72; line-height: 1;">&rarr;</div>
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #e17055; font-weight: 700; margin-top: 2px;">Shape Gate</div>
    </div>
    <!-- Reduce Box -->
    <div style="background: #e8f5e9; border: 2px solid #2e7d32; border-radius: 10px; padding: 20px 24px; text-align: center; min-width: 160px; flex: 1; max-width: 220px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #2e7d32; font-weight: 700; margin-bottom: 6px;">Step 2</div>
      <div style="font-size: 20px; font-weight: 700; color: #2e7d32;">Reduce</div>
      <div style="font-size: 13px; color: #555; margin-top: 6px;">Transform data</div>
      <div style="margin-top: 8px;"><span style="display: inline-block; background: #c8e6c9; color: #2e7d32; font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600;">Read-only</span></div>
    </div>
    <!-- Arrow 2 -->
    <div style="display: flex; flex-direction: column; align-items: center; padding: 0 6px;">
      <div style="font-size: 24px; color: #636e72; line-height: 1;">&rarr;</div>
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #e17055; font-weight: 700; margin-top: 2px;">Shape Gate</div>
    </div>
    <!-- Output Box -->
    <div style="background: #fce4ec; border: 2px solid #c62828; border-radius: 10px; padding: 20px 24px; text-align: center; min-width: 160px; flex: 1; max-width: 220px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c62828; font-weight: 700; margin-bottom: 6px;">Step 3</div>
      <div style="font-size: 20px; font-weight: 700; color: #c62828;">Output</div>
      <div style="font-size: 13px; color: #555; margin-top: 6px;">Act on results</div>
      <div style="margin-top: 8px;"><span style="display: inline-block; background: #ffcdd2; color: #c62828; font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600;">Dry-run first</span></div>
    </div>
  </div>

  <p style="font-size: 16px; line-height: 1.8;"><strong>Map</strong> gathers data. It queries NetSuite and produces a structured result set. Nothing is changed. <strong>Reduce</strong> transforms that data &mdash; filtering, enriching, reshaping it into something actionable. Still nothing is changed. <strong>Output</strong> acts on the results: creating records, updating fields, sending messages. This is the only step with risk, and it shows exactly what it <em>would</em> do before doing it.</p>

  <p style="font-size: 16px; line-height: 1.8;">The key insight: <strong>the agent does the heavy lifting; the user reviews and approves.</strong></p>

  <!-- 2b: Shape Enforcement -->
  <h3 id="shape-enforcement-the-trust-layer" style="font-size: 20px; color: #2d3436; margin-top: 40px;">2b. Shape Enforcement &mdash; The Trust Layer</h3>

  <p style="font-size: 16px; line-height: 1.8;">Each step declares what its output looks like &mdash; a JSON schema that defines the exact structure of the data it will produce. After a step runs, its output is validated against that declaration. If the shape doesn't match, the pipeline stops and tells you exactly why.</p>

  <div style="background: #f0f4ff; border: 1px solid #c5cae9; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #303f9f;">Enforce the shape, not the implementation.</p>
    <p style="margin: 0; font-size: 14px; color: #555;">The agent is free to generate whatever query or logic it wants, as long as the result matches the declared contract. This gives flexibility without sacrificing predictability.</p>
  </div>

  <p style="font-size: 16px; line-height: 1.8;">Why this matters:</p>
  <ul style="font-size: 16px; line-height: 1.8; padding-left: 24px;">
    <li><strong>Composability</strong> &mdash; steps chain reliably because outputs are guaranteed to match the next step's expected input</li>
    <li><strong>Monitoring</strong> &mdash; you know exactly what to measure at each boundary</li>
    <li><strong>Debugging</strong> &mdash; when something goes wrong, you can see precisely where and why the data diverged from the expected shape</li>
    <li><strong>Agent accountability</strong> &mdash; the agent is evaluated not just on "did it run" but "did it produce the right shape"</li>
  </ul>

  <!-- 2c: Created Once, Run Many Times -->
  <h3 id="created-once-run-many-times" style="font-size: 20px; color: #2d3436; margin-top: 40px;">2c. Created Once, Run Many Times</h3>

  <p style="font-size: 16px; line-height: 1.8;">A play has two distinct moments in its life:</p>

  <div style="display: flex; gap: 20px; margin: 24px 0; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 260px; background: #e8eaf6; border-radius: 8px; padding: 20px 24px;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #3949ab; font-weight: 700; margin-bottom: 8px;">Design Time</div>
      <p style="margin: 0; font-size: 15px; color: #2d3436;">The user describes their intent in a Helix ticket. Helix generates the three parts &mdash; the prompts with sample queries, the enforced output shapes, and the effects script. Everything is validated in sandbox before the play is considered ready.</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #636e72; font-style: italic;">One-time. The user describes <em>what</em>. Helix figures out <em>how</em>.</p>
    </div>
    <div style="flex: 1; min-width: 260px; background: #e8f5e9; border-radius: 8px; padding: 20px 24px;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #2e7d32; font-weight: 700; margin-bottom: 8px;">Run Time</div>
      <p style="margin: 0; font-size: 15px; color: #2d3436;">The play runs against fresh data. Map queries, Reduce transforms, Output acts. Each run produces a full audit trail &mdash; what was queried, what was transformed, what was done. Same logic, new data, every time.</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #636e72; font-style: italic;">Many times. Same play, fresh data, full audit.</p>
    </div>
  </div>

  <p style="font-size: 16px; line-height: 1.8;">This separation is what makes plays fundamentally different from code generation. A Build ticket produces a script you deploy and maintain. A Play ticket produces an automation that Helix runs and monitors for you.</p>

  <!-- 2d: Agent-Generated First -->
  <h3 id="agent-generated-first" style="font-size: 20px; color: #2d3436; margin-top: 40px;">2d. Agent-Generated First</h3>

  <p style="font-size: 16px; line-height: 1.8;">Map and Reduce are agent-generated. The agent writes the queries and the transformation logic based on a prompt that includes a sample &mdash; essentially few-shot prompting applied to automation. The sample grounds the agent, showing it what a good result looks like.</p>

  <p style="font-size: 16px; line-height: 1.8;">Output/Effects is different. It's a deterministic script, not agent-generated. The highest-stakes step in the pipeline &mdash; the one that actually changes things &mdash; needs to be predictable and auditable. An agent writes it at design time, but at run time it executes as written, not regenerated.</p>

  <div style="background: #fff8e1; border-left: 4px solid #f9a825; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0; font-size: 14px; color: #555;"><strong>Why not both agent and static from the start?</strong> One mode to build, test, and reason about &mdash; less surface area for the MVP. You learn what queries agents actually produce in practice, which informs what "static" should even look like. The natural V2 path: let users "promote" a proven query to static &mdash; lock in what works.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ZONE 2: ROADMAP -->
  <!-- ================================================================ -->
  <div style="background: linear-gradient(135deg, #00897b11, #f57c0011); border-left: 4px solid #00897b; padding: 8px 16px; margin-top: 56px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #00897b; font-weight: 700;">Zone 2 &mdash; Roadmap</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 3: THE FIVE LEVELS -->
  <!-- ============================================================ -->
  <h2 id="the-five-levels" style="font-size: 26px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">3. The Five Levels</h2>

  <p style="font-size: 16px; line-height: 1.8; color: #2d3436;">Play Mode is delivered in five progressive levels. Each level is independently useful &mdash; a real product improvement that users benefit from immediately. Later levels build on earlier ones, but each is a standalone deliverable.</p>

  <!-- Level Progress Bar -->
  <div style="display: flex; gap: 0; margin: 28px 0 36px 0; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6;">
    <div style="flex: 1; background: #4a6fa5; padding: 10px 8px; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">L1</div>
      <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Speak</div>
    </div>
    <div style="flex: 1; background: #0097a7; padding: 10px 8px; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">L2</div>
      <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Author</div>
    </div>
    <div style="flex: 1; background: #00897b; padding: 10px 8px; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">L3</div>
      <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Watch</div>
    </div>
    <div style="flex: 1; background: #f57c00; padding: 10px 8px; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">L4</div>
      <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Prove</div>
    </div>
    <div style="flex: 1; background: #c62828; padding: 10px 8px; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">L5</div>
      <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Run Live</div>
    </div>
  </div>

  <!-- ======================== LEVEL 1 ======================== -->
  <div style="border: 2px solid #4a6fa5; border-radius: 12px; padding: 0; margin-bottom: 32px; overflow: hidden;">
    <!-- Level Header -->
    <div style="background: #4a6fa5; padding: 16px 24px; display: flex; align-items: center; gap: 14px;">
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 1px;">LEVEL 1</span>
      <span style="font-size: 22px; font-weight: 700; color: #fff;">&ldquo;Speak the Language&rdquo;</span>
    </div>
    <!-- Level Body -->
    <div style="padding: 24px;">
      <!-- User Story -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a6fa5; font-weight: 700; margin-bottom: 6px;">What changes for the user</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">Users can create Play tickets &mdash; through the web UI, the CLI, or the API. Play appears as a mode choice for NetSuite organizations, right alongside Build, Fix, and Research. The system speaks the language of plays for the first time.</p>
      </div>

      <!-- What Helix Does Differently -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a6fa5; font-weight: 700; margin-bottom: 6px;">What Helix does differently</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">PLAY replaces the dead EXECUTE mode across every surface: the mode selector, the API validation, the CLI options, and the MCP tools. Play tickets get a <strong>PLY-</strong> prefix instead of EXE-. Branches use the <code style="background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 13px;">play</code> segment instead of <code style="background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 13px;">execute</code>. The platform gating stays the same &mdash; Play is NetSuite-only, just like Execute was.</p>
      </div>

      <!-- Key Capabilities -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a6fa5; font-weight: 700; margin-bottom: 6px;">Key capabilities</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>PLAY mode in the mode selector for NetSuite orgs</li>
          <li>PLY- ticket prefix; <code style="background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 13px;">play</code> branch naming</li>
          <li>EXECUTE retired from all user-facing surfaces (UI, API, CLI, MCP)</li>
          <li>Platform enforcement: PLAY only available for NetSuite organizations</li>
          <li>PLAY is user-selected, not auto-classified &mdash; users deliberately choose to create an automation</li>
        </ul>
      </div>

      <!-- Scope -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a6fa5; font-weight: 700; margin-bottom: 6px;">Scope</div>
        <p style="font-size: 14px; margin: 0; color: #555;">Server: ~12 files + 2 database migrations. Client: ~12 files (rename). CLI: 3 files. Pure plumbing &mdash; no new components, no new models.</p>
      </div>

      <!-- Visual: Before/After -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #636e72; margin-bottom: 12px;">MODE SELECTOR</div>
        <div style="display: flex; gap: 24px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 180px;">
            <div style="font-size: 11px; color: #c62828; font-weight: 600; margin-bottom: 6px;">BEFORE</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Auto</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Build</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Fix</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Research</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #ffcdd2; color: #c62828; text-decoration: line-through;">Execute</span>
            </div>
          </div>
          <div style="flex: 1; min-width: 180px;">
            <div style="font-size: 11px; color: #2e7d32; font-weight: 600; margin-bottom: 6px;">AFTER</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Auto</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Build</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Fix</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #e0e0e0; color: #555;">Research</span>
              <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; background: #4a6fa5; color: #fff; font-weight: 600;">Play</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== LEVEL 2 ======================== -->
  <div style="border: 2px solid #0097a7; border-radius: 12px; padding: 0; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #0097a7; padding: 16px 24px; display: flex; align-items: center; gap: 14px;">
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 1px;">LEVEL 2</span>
      <span style="font-size: 22px; font-weight: 700; color: #fff;">&ldquo;Author the Play&rdquo;</span>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0097a7; font-weight: 700; margin-bottom: 6px;">What changes for the user</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">When users describe their intent in a Play ticket, Helix generates a structured 3-step automation blueprint &mdash; the prompts, the samples, the output shapes, and the effects script. The user reviews a complete automation definition they didn't have to write.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0097a7; font-weight: 700; margin-bottom: 6px;">What Helix does differently</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">The workflow produces a PlayDefinition instead of code. Each step's prompt, sample, and output shape are stored and inspectable. The play goes from DRAFT to READY once all three parts are populated. A new API surface lets users view and retrieve their play definitions.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0097a7; font-weight: 700; margin-bottom: 6px;">Key capabilities</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Play data model: full 3-step structure stored per ticket</li>
          <li>API endpoints for play definition retrieval and updates</li>
          <li>Workflow integration: when a Play ticket runs, the agent generates the play definition (not code)</li>
          <li>Play definition viewer in the UI &mdash; users see their Map, Reduce, and Output steps with prompts, samples, and schemas</li>
          <li>Status lifecycle: DRAFT (generating) &rarr; READY (all parts complete)</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0097a7; font-weight: 700; margin-bottom: 6px;">Scope</div>
        <p style="font-size: 14px; margin: 0; color: #555;">Server: new data models + migration + API endpoints + workflow branching. Client: play definition viewer component. No CLI changes.</p>
      </div>

      <!-- Visual: Ticket to PlayDefinition -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #636e72; margin-bottom: 12px;">FROM TICKET TO PLAY</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap;">
          <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px 16px; text-align: center; min-width: 120px;">
            <div style="font-size: 13px; font-weight: 600; color: #2d3436;">Ticket</div>
            <div style="font-size: 11px; color: #636e72;">"Find overdue invoices<br>and flag customers"</div>
          </div>
          <div style="padding: 0 10px; font-size: 20px; color: #636e72;">&rarr;</div>
          <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px 16px; text-align: center; min-width: 120px;">
            <div style="font-size: 13px; font-weight: 600; color: #0097a7;">Helix Agent</div>
            <div style="font-size: 11px; color: #636e72;">Generates all 3 parts</div>
          </div>
          <div style="padding: 0 10px; font-size: 20px; color: #636e72;">&rarr;</div>
          <div style="background: #e0f7fa; border: 1px solid #0097a7; border-radius: 8px; padding: 12px 16px; text-align: center; min-width: 140px;">
            <div style="font-size: 13px; font-weight: 600; color: #0097a7;">PlayDefinition</div>
            <div style="font-size: 11px; color: #636e72;">Map + Reduce + Output<br>with samples &amp; schemas</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== LEVEL 3 ======================== -->
  <div style="border: 2px solid #00897b; border-radius: 12px; padding: 0; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #00897b; padding: 16px 24px; display: flex; align-items: center; gap: 14px;">
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 1px;">LEVEL 3</span>
      <span style="font-size: 22px; font-weight: 700; color: #fff;">&ldquo;Watch It Think&rdquo;</span>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin-bottom: 6px;">What changes for the user</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">Users trigger a preview and watch their play work with real sandbox data. Map queries NetSuite, Reduce transforms the results, and they see actual data flowing through their pipeline step by step &mdash; zero writes, zero risk.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin-bottom: 6px;">What Helix does differently</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">Map and Reduce execute via the NS-GM gateway in sandbox. Output shapes are validated at each step boundary &mdash; if the shape doesn't match, the pipeline stops and tells you exactly why. Results are displayed step by step. Every execution is logged with inputs, outputs, timing, and validation status.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin-bottom: 6px;">Key capabilities</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Read-only sandbox execution of Map and Reduce steps</li>
          <li>Shape validation with pass/fail at each step boundary</li>
          <li>Step-by-step results display: see the generated query, the raw data, and the transformation</li>
          <li>Execution logging: every run recorded with per-step inputs, outputs, duration, and validation outcomes</li>
          <li>Pipeline halt on shape mismatch with clear error explaining expected vs. actual</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin-bottom: 6px;">Scope</div>
        <p style="font-size: 14px; margin: 0; color: #555;">Server: execution service + NS-GM integration + shape validation + logging. Client: step-by-step results display. No CLI changes.</p>
      </div>

      <div style="background: #e0f2f1; border-left: 4px solid #00897b; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-top: 16px;">
        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Key insight:</strong> Map and Reduce are fully safe because they're read-only. This level delivers enormous user value with zero risk. Users can preview their automation pipeline working with real data before any writes happen.</p>
      </div>

      <!-- Visual: Step-by-step execution -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #636e72; margin-bottom: 12px;">EXECUTION FLOW</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="display: inline-block; background: #1565c0; color: #fff; font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 600; min-width: 56px; text-align: center;">Map</span>
            <span style="font-size: 13px; color: #555;">SuiteQL queries sandbox &rarr; 47 invoices found</span>
            <span style="display: inline-block; background: #c8e6c9; color: #2e7d32; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 600;">Shape: PASS</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="display: inline-block; background: #2e7d32; color: #fff; font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 600; min-width: 56px; text-align: center;">Reduce</span>
            <span style="font-size: 13px; color: #555;">Filter &gt;90 days, group by customer &rarr; 12 customers flagged</span>
            <span style="display: inline-block; background: #c8e6c9; color: #2e7d32; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 600;">Shape: PASS</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="display: inline-block; background: #bdbdbd; color: #fff; font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 600; min-width: 56px; text-align: center;">Output</span>
            <span style="font-size: 13px; color: #999; font-style: italic;">Not executed at L3 &mdash; preview only</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== LEVEL 4 ======================== -->
  <div style="border: 2px solid #f57c00; border-radius: 12px; padding: 0; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 16px 24px; display: flex; align-items: center; gap: 14px;">
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 1px;">LEVEL 4</span>
      <span style="font-size: 22px; font-weight: 700; color: #fff;">&ldquo;Prove It Works&rdquo;</span>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f57c00; font-weight: 700; margin-bottom: 6px;">What changes for the user</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">Two new powers. First, the full pipeline runs end-to-end in sandbox &mdash; including Output/Effects with a dry-run showing exactly what would be written. Second, canonical examples: Helix generates realistic test data, runs the play against it, and proves it works. A play isn't "done" until it passes its examples.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f57c00; font-weight: 700; margin-bottom: 6px;">What Helix does differently</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">Output/Effects executes in dry-run mode &mdash; the script shows what records it would create, update, or delete without committing. Canonical examples co-develop alongside the play in a feedback loop: the query tells Helix what kinds of data to generate, the data reveals whether the query works, and both tighten until they converge. Essentially TDD for plays, where the agent writes both the code and the tests.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f57c00; font-weight: 700; margin-bottom: 6px;">Key capabilities</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Full sandbox execution with dry-run: Output/Effects shows intended writes before committing</li>
          <li>Canonical example generation: realistic synthetic NetSuite records via NS-GM</li>
          <li>Co-development loop: query and examples refine each other until both converge</li>
          <li>Play validation gate: a play isn't READY until it's proven against canonical examples</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f57c00; font-weight: 700; margin-bottom: 6px;">Scope</div>
        <p style="font-size: 14px; margin: 0; color: #555;">Server: canonical example model + dry-run execution + validation loop. Client: dry-run results display + validation status indicators.</p>
      </div>

      <div style="background: #fff8e1; border-left: 4px solid #f57c00; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-top: 16px;">
        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Important:</strong> Canonical examples are a platform-level primitive, not play-specific. They apply equally to Build and Fix modes. Any Helix artifact that executes against NetSuite &mdash; plays, scripts, rules &mdash; can and should have canonical examples. A play simply happens to be the first consumer.</p>
      </div>

      <!-- Visual: Co-development Loop -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #636e72; margin-bottom: 12px;">CO-DEVELOPMENT LOOP</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap;">
          <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px 16px; text-align: center;">
            <div style="font-size: 13px; font-weight: 600; color: #f57c00;">Draft Query</div>
            <div style="font-size: 11px; color: #636e72;">Agent writes SuiteQL</div>
          </div>
          <div style="padding: 0 6px; font-size: 18px; color: #636e72;">&rarr;</div>
          <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px 16px; text-align: center;">
            <div style="font-size: 13px; font-weight: 600; color: #f57c00;">Generate Examples</div>
            <div style="font-size: 11px; color: #636e72;">NS-GM creates records</div>
          </div>
          <div style="padding: 0 6px; font-size: 18px; color: #636e72;">&rarr;</div>
          <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px 16px; text-align: center;">
            <div style="font-size: 13px; font-weight: 600; color: #f57c00;">Run &amp; Validate</div>
            <div style="font-size: 11px; color: #636e72;">Shapes match?</div>
          </div>
          <div style="padding: 0 6px; font-size: 18px; color: #636e72;">&circlearrowleft;</div>
          <div style="background: #fff3e0; border: 1px solid #f57c00; border-radius: 8px; padding: 12px 16px; text-align: center;">
            <div style="font-size: 13px; font-weight: 600; color: #f57c00;">Refine Both</div>
            <div style="font-size: 11px; color: #636e72;">Until convergence</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== LEVEL 5 ======================== -->
  <div style="border: 2px solid #c62828; border-radius: 12px; padding: 0; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #c62828; padding: 16px 24px; display: flex; align-items: center; gap: 14px;">
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 1px;">LEVEL 5</span>
      <span style="font-size: 22px; font-weight: 700; color: #fff;">&ldquo;Run It Live&rdquo;</span>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c62828; font-weight: 700; margin-bottom: 6px;">What changes for the user</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">Plays run against production data with full safety controls. Every write has a before-image. Every operation has an audit trail. Duplicates are prevented. Irreversible actions require explicit human approval before executing.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c62828; font-weight: 700; margin-bottom: 6px;">What Helix does differently</div>
        <p style="font-size: 15px; line-height: 1.7; margin: 0; color: #2d3436;">The NS-GM gateway gets a governance envelope. Before any write, Helix captures a before-image of the record. After the write, it logs the after-image. Idempotency keys prevent double-execution. Concurrency is detected via optimistic checks. High-risk, irreversible operations require human sign-off in the approval flow.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c62828; font-weight: 700; margin-bottom: 6px;">Key capabilities</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Before-image capture: snapshot of every record before it's modified</li>
          <li>Write audit logging: complete trail of what was changed, when, and by whom</li>
          <li>Idempotency: 3-layer defense prevents double execution</li>
          <li>Approval gates for irreversible (Tier-3) actions</li>
          <li>Concurrency detection via optimistic timestamp checks</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c62828; font-weight: 700; margin-bottom: 6px;">Scope</div>
        <p style="font-size: 14px; margin: 0; color: #555;">Server: governance wrapper on NS-GM + audit model + approval flow. Client: approval UI + audit viewer. Significant infrastructure work.</p>
      </div>

      <!-- RSH-702 Integration -->
      <div style="background: #fce4ec; border-left: 4px solid #c62828; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-top: 16px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #555;"><strong>Integration with RSH-702 (Governance Feasibility):</strong> The feasibility research found <strong>conditional Go</strong> for production execution. Key findings that shape L5:</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #555; line-height: 1.7;">
          <li><strong>3-tier reversibility</strong>: Tier-1 operations have atomic inverses (void a transaction). Tier-2 operations have derived inverses (restore a before-image). Tier-3 operations are irreversible (send an email) and require human approval.</li>
          <li><strong>NS-GM containment</strong>: The NS-GM RESTlet is a controllable chokepoint for Helix-initiated writes. SDF-deployed scripts running autonomously are outside this channel but manageable.</li>
          <li><strong>4 Go conditions</strong>: (1) Before-image capture and write audit built into NS-GM before any production writes. (2) User-event script enumeration per record type at design time. (3) Unconditional human approval for Tier-3 actions. (4) REVERSALVOIDING preference checked at runtime before void operations.</li>
        </ul>
      </div>

      <!-- Visual: Safety Stack -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px 20px; margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #636e72; margin-bottom: 12px;">GOVERNANCE STACK</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="background: #ffcdd2; border: 1px solid #ef9a9a; border-radius: 6px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 13px; font-weight: 600; color: #c62828;">Approval Gate</span>
            <span style="font-size: 11px; color: #c62828;">Human sign-off for Tier-3</span>
          </div>
          <div style="background: #ffe0b2; border: 1px solid #ffcc80; border-radius: 6px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 13px; font-weight: 600; color: #e65100;">Idempotency</span>
            <span style="font-size: 11px; color: #e65100;">3-layer dedup defense</span>
          </div>
          <div style="background: #fff9c4; border: 1px solid #fff176; border-radius: 6px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 13px; font-weight: 600; color: #f57f17;">Before-Image</span>
            <span style="font-size: 11px; color: #f57f17;">Snapshot before every write</span>
          </div>
          <div style="background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 6px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 13px; font-weight: 600; color: #2e7d32;">Write Audit</span>
            <span style="font-size: 11px; color: #2e7d32;">Full trail: who, what, when</span>
          </div>
          <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 6px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 13px; font-weight: 600; color: #1565c0;">Concurrency Check</span>
            <span style="font-size: 11px; color: #1565c0;">Optimistic timestamp validation</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ZONE 3: REFERENCE -->
  <!-- ================================================================ -->
  <div style="background: linear-gradient(135deg, #636e7211, #2d343611); border-left: 4px solid #636e72; padding: 8px 16px; margin-top: 56px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #636e72; font-weight: 700;">Zone 3 &mdash; Reference</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 4: ARCHITECTURE & DATA MODEL -->
  <!-- ============================================================ -->
  <h2 id="architecture-and-data-model" style="font-size: 22px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">4. Architecture &amp; Data Model</h2>

  <h3 id="data-model-overview" style="font-size: 17px; color: #2d3436; margin-top: 28px;">4.1 Data Model Overview</h3>

  <p style="font-size: 14px; line-height: 1.7;">The play system introduces five new models. PlayDefinition is the core artifact (1:1 with a Ticket). PlayRun tracks each execution. PlayStepResult records per-step outcomes. PlayCanonicalExample stores test data (L4). PlayWriteAuditLog captures governance evidence (L5).</p>

  <!-- Data Model Table -->
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Model</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Key Fields</th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;">Level</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Relationship</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">PlayDefinition</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>ticketId</code>, <code>mapPrompt</code>, <code>mapSample</code>, <code>mapOutputSchema</code>, <code>reducePrompt</code>, <code>reduceSample</code>, <code>reduceOutputSchema</code>, <code>outputScript</code>, <code>status</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">L2</span></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">1:1 with Ticket</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">PlayRun</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>playDefinitionId</code>, <code>environment</code>, <code>status</code>, <code>triggeredBy</code>, timestamps</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">L3</span></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Many:1 with PlayDefinition</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">PlayStepResult</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>playRunId</code>, <code>stepType</code>, <code>stepOrder</code>, <code>input</code>, <code>output</code>, <code>shapeValid</code>, <code>durationMs</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">L3</span></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Many:1 with PlayRun</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">PlayCanonicalExample</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>playDefinitionId</code>, <code>label</code>, <code>inputData</code>, <code>expectedOutputs</code>, <code>actualResult</code>, <code>status</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #f57c00; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">L4</span></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Many:1 with PlayDefinition</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">PlayWriteAuditLog</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>playRunId</code>, <code>operationType</code>, <code>recordType</code>, <code>recordId</code>, <code>beforeImage</code>, <code>afterImage</code>, <code>approvedBy</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #c62828; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">L5</span></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Many:1 with PlayRun</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size: 13px; color: #636e72;"><em>Design decision (AD-4): PlayDefinition uses inline fields rather than a separate PlayStep model. A play always has exactly 3 fixed steps, so a separate model adds join complexity for no benefit.</em></p>

  <h3 id="api-surface" style="font-size: 17px; color: #2d3436; margin-top: 28px;">4.2 API Surface</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Method</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Endpoint</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Description</th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;">Level</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">GET</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Retrieve play definition</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L2</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">POST</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Create/update play definition</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L2</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">PUT</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Update play definition</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L2</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">POST</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play/runs</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Trigger a play run</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L3</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">GET</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play/runs</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">List play runs</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L3</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">GET</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play/runs/:runId</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Run detail with step results</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L3</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">POST</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><code>/api/tickets/:ticketId/play/runs/:runId/approve</code></td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Approve pending Tier-3 action</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #c62828; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L5</span></td>
      </tr>
    </tbody>
  </table>

  <h3 id="architecture-decisions" style="font-size: 17px; color: #2d3436; margin-top: 28px;">4.3 Key Architecture Decisions</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436; width: 6%;">ID</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436; width: 25%;">Decision</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Rationale</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-1</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Replace EXECUTE, don't coexist</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Zero production usage (0/876). Keeping two equivalent modes creates confusion. EXECUTE stays in DB enum only (Postgres can't DROP enum values).</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-2</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Two-migration strategy</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Production DB has PLAYBOOK_CHECK (3 tickets from BLD-677) but local schema lacks it. Migration 1: sync PLAYBOOK_CHECK with <code>IF NOT EXISTS</code>. Migration 2: add PLAY.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-3</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">PLAY is user-selected, not auto-classified</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Users deliberately choose to create an automation. The auto-classifier stays BUILD/FIX/RESEARCH only.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-4</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Inline fields on PlayDefinition</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">A play always has exactly 3 fixed steps. A separate step model adds join complexity for no benefit. Inline fields give strong types.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-5</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Parallel path from orchestrator</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Play execution is a data pipeline (Map &rarr; Reduce &rarr; Output), not code generation. Branch from the existing orchestrator using the <code>isResearchMode</code> pattern.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-6</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Shape validation via Zod</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Zod is already used extensively in the codebase. Output schemas stored as JSON in Prisma, converted to Zod schemas at validation time. No new dependencies.</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-7</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Deploy: Server &rarr; CLI &rarr; Client</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">CLI sends <code>mode: "PLAY"</code> to server API. If CLI deploys first, server returns 400. Client deploys independently.</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">AD-8</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Platform enforcement error update</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Both create and patch endpoints update from "EXECUTE mode" to "PLAY mode" in error messages.</td>
      </tr>
    </tbody>
  </table>

  <h3 id="migration-strategy" style="font-size: 17px; color: #2d3436; margin-top: 28px;">4.4 Migration Strategy</h3>

  <div style="display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 280px; background: #e8eaf6; border: 1px solid #c5cae9; border-radius: 8px; padding: 16px 20px;">
      <div style="font-size: 12px; font-weight: 700; color: #3949ab; margin-bottom: 6px;">MIGRATION 1 &mdash; Sync</div>
      <p style="margin: 0; font-size: 13px; color: #2d3436;"><code>ALTER TYPE "TicketMode" ADD VALUE IF NOT EXISTS 'PLAYBOOK_CHECK'</code></p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #636e72;">Handles both fresh environments (adds it) and production (already exists, no-op).</p>
    </div>
    <div style="flex: 1; min-width: 280px; background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 16px 20px;">
      <div style="font-size: 12px; font-weight: 700; color: #2e7d32; margin-bottom: 6px;">MIGRATION 2 &mdash; Feature</div>
      <p style="margin: 0; font-size: 13px; color: #2d3436;"><code>ALTER TYPE "TicketMode" ADD VALUE 'PLAY'</code></p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #636e72;">Adds PLAY to the enum. EXECUTE stays in DB enum (Postgres constraint) but is removed from the Prisma schema.</p>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 5: IMPLEMENTATION SURFACE -->
  <!-- ============================================================ -->
  <h2 id="implementation-surface" style="font-size: 22px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">5. Implementation Surface</h2>

  <h3 id="cross-repo-summary" style="font-size: 17px; color: #2d3436; margin-top: 28px;">5.1 Cross-Repo Summary</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Repo</th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;"><span style="color: #b0bec5;">L1</span></th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;"><span style="color: #b0bec5;">L2</span></th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;"><span style="color: #b0bec5;">L3</span></th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;"><span style="color: #b0bec5;">L4</span></th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436;"><span style="color: #b0bec5;">L5</span></th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-server</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~12 files + 2 migrations</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~5 new files</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~3 new files</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~3 new files</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~6 new files</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">helix-global-client</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~12 files</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~3 new</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~3 new</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~2 new</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">~3 new</td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">helix-cli</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">3 files</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">&mdash;</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">&mdash;</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">&mdash;</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">&mdash;</td>
      </tr>
    </tbody>
  </table>

  <h3 id="server-l1-file-inventory" style="font-size: 17px; color: #2d3436; margin-top: 28px;">5.2 Server L1 File Inventory</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
    <thead>
      <tr style="background: #4a6fa5; color: #fff;">
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #4a6fa5;">File</th>
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #4a6fa5;">Change</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>prisma/schema.prisma</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Add PLAYBOOK_CHECK + PLAY to TicketMode enum; remove EXECUTE</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>prisma/migrations/</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Two new migration directories (sync + feature)</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/lib/platform-config.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in NETSUITE allowedModes</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/controllers/ticket-controller.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in Zod enum + error messages</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/services/ticket-id-utils.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">EXECUTE:"EXE" &rarr; PLAY:"PLY" prefix; "execute" &rarr; "play" branch</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/mcp/tools/tickets.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in z.enum (create + update)</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/services/goal-schemas.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in proposal.mode z.enum</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/services/ticket-mode-classifier.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update comment: EXECUTE &rarr; PLAY for accuracy</td></tr>
    </tbody>
  </table>

  <h3 id="client-l1-file-inventory" style="font-size: 17px; color: #2d3436; margin-top: 28px;">5.3 Client L1 File Inventory</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
    <thead>
      <tr style="background: #4a6fa5; color: #fff;">
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #4a6fa5;">File</th>
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #4a6fa5;">Change</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/types/api.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Add PLAY to TicketMode const; remove EXECUTE</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/lib/platform.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Rename executeMode to playMode; EXECUTE &rarr; PLAY in availableModes</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/components/mode-icons.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Rename ExecuteIcon to PlayIcon; update ModeIcon switch</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/lib/format.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update modeLabel: 'Execute' &rarr; 'Play'</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/routes/create-ticket.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update modeIcons + modeDisplayLabels</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/routes/ticket-detail.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update mode dropdown option</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/components/ticket-filter-bar.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update filter option</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/components/ticket-summary.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update comment text</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/components/hashtag-ticket-picker.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update color map</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/components/reference-chip.tsx</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update border color</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/lib/helix-cli-docs-content.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update CLI docs mirror</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/lib/platform.test.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Update capability + mode assertions</td></tr>
    </tbody>
  </table>

  <h3 id="cli-l1-file-inventory" style="font-size: 17px; color: #2d3436; margin-top: 28px;">5.4 CLI L1 File Inventory</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
    <thead>
      <tr style="background: #4a6fa5; color: #fff;">
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #4a6fa5;">File</th>
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #4a6fa5;">Change</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/tickets/create.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in VALID_MODES + help text</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/tickets/index.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in usage + help text</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;"><code>src/docs/cli-content.ts</code></td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Replace EXECUTE with PLAY in mode table + examples</td></tr>
    </tbody>
  </table>

  <h3 id="deploy-ordering" style="font-size: 17px; color: #2d3436; margin-top: 28px;">5.5 Deploy Ordering</h3>

  <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin: 16px 0; flex-wrap: wrap;">
    <div style="background: #e8eaf6; border: 1px solid #c5cae9; border-radius: 8px; padding: 10px 20px; text-align: center;">
      <div style="font-size: 14px; font-weight: 600; color: #3949ab;">Server</div>
      <div style="font-size: 11px; color: #636e72;">Enum + API</div>
    </div>
    <div style="padding: 0 10px; font-size: 20px; color: #636e72;">&rarr;</div>
    <div style="background: #e8eaf6; border: 1px solid #c5cae9; border-radius: 8px; padding: 10px 20px; text-align: center;">
      <div style="font-size: 14px; font-weight: 600; color: #3949ab;">CLI</div>
      <div style="font-size: 11px; color: #636e72;">Sends mode to server</div>
    </div>
    <div style="padding: 0 10px; font-size: 20px; color: #636e72;">&rarr;</div>
    <div style="background: #e8eaf6; border: 1px solid #c5cae9; border-radius: 8px; padding: 10px 20px; text-align: center;">
      <div style="font-size: 14px; font-weight: 600; color: #3949ab;">Client</div>
      <div style="font-size: 11px; color: #636e72;">Independent</div>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 6: OPEN QUESTIONS & RISKS -->
  <!-- ============================================================ -->
  <h2 id="open-questions-and-risks" style="font-size: 22px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">6. Open Questions &amp; Risks</h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436; width: 4%;">#</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436; width: 24%;">Question</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Impact &amp; Mitigation</th>
        <th style="padding: 8px 12px; text-align: center; border: 1px solid #2d3436; width: 8%;">Level</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">1</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Dry-run preview fidelity</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">NetSuite has no quarantined save or <code>BEGIN...ROLLBACK</code>. Sourced fields compute in-memory, but taxes, GL impact, and user-event script effects require <code>record.save()</code>. Mitigation: disclose limitations; use sandbox as the primary preview environment.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #f57c00; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L4</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">2</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">User-event script side effects</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">User-event scripts fire only on <code>record.save()</code>. Preview misses these side effects entirely. Mitigation: enumerate UE scripts per record type at play design time to classify actual risk tier.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #c62828; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L5</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">3</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Agent-generated SuiteQL quality</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Quality depends on the agent's understanding of NetSuite schema nuances. Bad queries erode user trust quickly. Mitigation: shape enforcement catches structural failures; canonical examples (L4) catch logic failures.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L3</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">4</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">PLAYBOOK_CHECK schema desync</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Production DB has this value but local Prisma schema lacks it. Migration ordering is delicate. Mitigation: <code>IF NOT EXISTS</code> guard; two-migration strategy handles both environments.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #4a6fa5; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L1</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">5</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Output/Effects script authoring</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">How much can the agent generate vs. requiring human editing? The effects script is deterministic, not regenerated. Mitigation: agent generates at design time; human can edit before READY.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #0097a7; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L2</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">6</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">REVERSALVOIDING preference</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">This accounting preference changes void semantics per account. Mitigation: check preference at runtime before any void operation (RSH-702 Go condition #4).</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #c62828; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L5</span></td>
      </tr>
      <tr style="background: #fff;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">7</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">NS-GM depth for canonical examples</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Can NS-GM generate records with complex relationships or only flat records? Mitigation: start flat; extend iteratively.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #f57c00; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L4</span></td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">8</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Sandbox SuiteQL fidelity</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6;">Does sandbox schema match production closely enough? Drift could make proven queries fail. Mitigation: document limitations; consider schema-check step.</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;"><span style="background: #00897b; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">L3</span></td>
      </tr>
    </tbody>
  </table>

  <!-- ============================================================ -->
  <!-- SECTION 7: FUTURE WORK -->
  <!-- ============================================================ -->
  <h2 id="future-work" style="font-size: 22px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">7. Future Work</h2>

  <p style="font-size: 14px; line-height: 1.7; color: #555;">These items are explicitly deferred from the MVP. Each is valuable, but introducing them prematurely would complicate the core play model.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Feature</th>
        <th style="padding: 8px 12px; text-align: left; border: 1px solid #2d3436;">Why Deferred</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Static query promotion</td><td style="padding: 8px 12px; border: 1px solid #dee2e6;">V2 feature. Users "promote" a proven query to a static artifact. Start agent-generated to learn what patterns emerge.</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Canonical examples as platform primitive</td><td style="padding: 8px 12px; border: 1px solid #dee2e6;">Applies to Build and Fix too, not just plays. Deserves its own research ticket.</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Triggered/scheduled plays</td><td style="padding: 8px 12px; border: 1px solid #dee2e6;">Manual execution for MVP. Scheduling adds circuit-breaker, retry, and concurrency concerns.</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Playbook convergence</td><td style="padding: 8px 12px; border: 1px solid #dee2e6;">BLD-677 rules are architecturally separate. Convergence is a future integration.</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Cross-play composition</td><td style="padding: 8px 12px; border: 1px solid #dee2e6;">Chaining plays is interesting but over-engineering for MVP.</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: 600;">Play builder UI</td><td style="padding: 8px 12px; border: 1px solid #dee2e6;">Deferred. The ticket system is sufficient for play creation at MVP.</td></tr>
    </tbody>
  </table>

  <!-- ============================================================ -->
  <!-- SECTION 8: EVIDENCE SOURCES -->
  <!-- ============================================================ -->
  <h2 id="evidence-sources" style="font-size: 22px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">8. Evidence Sources</h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #2d3436;">Source</th>
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #2d3436;">Type</th>
        <th style="padding: 6px 10px; text-align: left; border: 1px solid #2d3436;">Key Finding</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">ticket.md (Description)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Requirements</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Play = 3-step pipeline; replaces Execute; 7 design points</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">ticket.md (Discussion)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Consensus</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Map/Reduce/Output anatomy; agent-generated first; shape enforcement; canonical examples co-develop; creation vs. execution split</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">RSH-702 Research Report</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Feasibility</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Conditional Go; 3-tier reversibility; NS-GM is raw gateway; 4 Go conditions</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Production database</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Runtime query (June 6, 2026)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">876 total tickets; EXECUTE=0; AUTO 296, RESEARCH 239, BUILD 194, FIX 144, PLAYBOOK_CHECK 3</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">scout/scout-summary.md (server)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Codebase analysis</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">5 MVP levels; mode patterns; credential routing; 13+ relevant files</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">scout/scout-summary.md (client)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Codebase analysis</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">~12 files for mode rename; ExecuteIcon is already a play-triangle SVG</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">scout/scout-summary.md (CLI)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Codebase analysis</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">3 files; thin client; server enforces platform gating</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">diagnosis/diagnosis-statement.md (3 repos)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Root cause + MVP decomposition</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Per-file change maps; PLAYBOOK_CHECK desync; deploy ordering</td></tr>
      <tr style="background: #fff;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">tech-research/tech-research.md (server)</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Architecture decisions</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">8 ADs; inline PlayDefinition fields; Zod for validation; orchestrator branching</td></tr>
      <tr style="background: #f8f9fa;"><td style="padding: 6px 10px; border: 1px solid #dee2e6;">product/product.md</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">Product specification</td><td style="padding: 6px 10px; border: 1px solid #dee2e6;">MVP levels; user scenarios; success criteria; design principles; scope constraints</td></tr>
    </tbody>
  </table>

  <!-- Footer -->
  <div style="border-top: 2px solid #dee2e6; margin-top: 48px; padding-top: 20px;">
    <p style="font-size: 13px; color: #636e72; margin: 0;">RSH-707 | Design Specification | June 6, 2026 | 10 evidence sources consumed</p>
    <p style="font-size: 13px; color: #636e72; margin: 4px 0 0 0;">Referenced tickets: RSH-702 (Governance Feasibility), BLD-677 (Playbook Check)</p>
  </div>

</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-06T21:22:49.646Z) [Agent]: Your research report is ready!

## Continuation Context
Canonical examples. Have nothing to do with Play mode. Let's focus on arbitrary "make code" modes. 



How do we do this
