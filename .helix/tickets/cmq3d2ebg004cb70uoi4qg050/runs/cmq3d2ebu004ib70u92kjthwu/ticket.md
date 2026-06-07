# Ticket Context

- ticket_id: cmq3d2ebg004cb70uoi4qg050
- short_id: RSH-747
- run_id: cmq3d2ebu004ib70u92kjthwu
- run_branch: helix/research/RSH-747-implement-canonical-examples-helix-netsuite
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Implement: Canonical Examples — Helix NetSuite

## Description
Go ahead and do an example for each of these evals. Go and create the canonical examples, run them through, and show me the results. Prepare a presentation: what would it look like before and after for all 13. Take the time take as long as you need

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canonical Examples &mdash; Recipe-First Design &mdash; RSH-725</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 32px 24px; background: #fafbfc;">

  <!-- ================================================================ -->
  <!-- REPORT HEADER                                                     -->
  <!-- ================================================================ -->
  <div style="border-bottom: 4px solid #2d3436; padding-bottom: 24px; margin-bottom: 16px;">
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #636e72; margin: 0 0 8px 0;">Research Report</p>
    <h1 id="canonical-examples-recipe-first-design" style="font-size: 32px; font-weight: 800; color: #2d3436; margin: 0 0 8px 0; letter-spacing: -0.5px;">Canonical Examples &mdash; Recipe-First Design</h1>
    <p style="font-size: 18px; color: #636e72; margin: 0 0 20px 0; font-style: italic;">Proving feasibility across all 13 PxEvals with a reusable recipe model for BUILD, FIX, and AUTO modes.</p>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <span style="display: inline-block; background: #6c5ce7; color: #fff; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 700;">RSH-725</span>
      <span style="display: inline-block; background: #2d3436; color: #fff; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">June 7, 2026</span>
      <span style="display: inline-block; background: #00b894; color: #fff; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;">Status: Feasibility Proven</span>
    </div>
  </div>

  <!-- Stat Ribbon -->
  <div style="display: flex; gap: 0; margin-bottom: 40px; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6;">
    <div style="flex: 1; background: #fff; padding: 14px 8px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #2d3436;">876</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">Production Tickets</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 8px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #0984e3;">634</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">BUILD / FIX / AUTO</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 8px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #c62828;">0</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">With Canonical Examples</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 8px; text-align: center; border-right: 1px solid #dee2e6;">
      <div style="font-size: 28px; font-weight: 800; color: #6c5ce7;">13</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">PxEvals Proven</div>
    </div>
    <div style="flex: 1; background: #fff; padding: 14px 8px; text-align: center;">
      <div style="font-size: 28px; font-weight: 800; color: #00897b;">3&ndash;5</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; font-weight: 600;">Examples per Run</div>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- TABLE OF CONTENTS                                                 -->
  <!-- ================================================================ -->
  <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px 28px; margin-bottom: 48px;">
    <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 16px 0; color: #2d3436;">Contents</h2>
    <div style="display: flex; gap: 32px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 220px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #667eea; font-weight: 700; margin: 0 0 8px 0;">Foundation</p>
        <ol style="margin: 0; padding-left: 18px; font-size: 14px; list-style: none;">
          <li style="margin-bottom: 6px;"><a href="#the-problem" style="color: #0984e3; text-decoration: none;">1. The Problem</a></li>
          <li style="margin-bottom: 6px;"><a href="#what-are-canonical-examples" style="color: #0984e3; text-decoration: none;">2. What Are Canonical Examples?</a></li>
          <li style="margin-bottom: 6px;"><a href="#the-recipe-concept" style="color: #0984e3; text-decoration: none;">3. The Recipe Concept</a></li>
          <li style="margin-bottom: 6px;"><a href="#recipe-first-data-model" style="color: #0984e3; text-decoration: none;">4. Recipe-First Data Model</a></li>
        </ol>
      </div>
      <div style="flex: 1; min-width: 220px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #00897b; font-weight: 700; margin: 0 0 8px 0;">Feasibility Proof</p>
        <ol start="5" style="margin: 0; padding-left: 18px; font-size: 14px; list-style: none;">
          <li style="margin-bottom: 6px;"><a href="#build-evals-feasibility-proof" style="color: #0984e3; text-decoration: none;">5. BUILD Evals (7 Recipes)</a></li>
          <li style="margin-bottom: 6px;"><a href="#fix-evals-feasibility-proof" style="color: #0984e3; text-decoration: none;">6. FIX Evals (6 Recipes)</a></li>
        </ol>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f57c00; font-weight: 700; margin: 16px 0 8px 0;">Integration &amp; Decisions</p>
        <ol start="7" style="margin: 0; padding-left: 18px; font-size: 14px; list-style: none;">
          <li style="margin-bottom: 6px;"><a href="#integration-path" style="color: #0984e3; text-decoration: none;">7. Integration Path</a></li>
          <li style="margin-bottom: 6px;"><a href="#architecture-decisions" style="color: #0984e3; text-decoration: none;">8. Architecture Decisions</a></li>
          <li style="margin-bottom: 6px;"><a href="#open-questions-and-risks" style="color: #0984e3; text-decoration: none;">9. Open Questions &amp; Risks</a></li>
          <li style="margin-bottom: 6px;"><a href="#evidence-sources" style="color: #0984e3; text-decoration: none;">10. Evidence Sources</a></li>
        </ol>
      </div>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ZONE 1: FOUNDATION                                                -->
  <!-- ================================================================ -->
  <div style="background: linear-gradient(135deg, #667eea11, #764ba211); border-left: 4px solid #667eea; padding: 8px 16px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #667eea; font-weight: 700;">Zone 1 &mdash; Foundation</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 1: THE PROBLEM                                        -->
  <!-- ============================================================ -->
  <h2 id="the-problem" style="font-size: 26px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">1. The Problem</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">Helix generates NetSuite automations (SuiteScript, workflows, saved searches) for BUILD, FIX, and AUTO tickets. It deploys them to sandbox. It runs verification. But at no point does it show the user <strong>what the automation actually does with realistic data</strong>.</p>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">A non-technical user who asks &ldquo;add an SLA Tier field to customers&rdquo; gets back a verification status &mdash; <em>deployed successfully</em>, <em>tests pass</em> &mdash; but has no way to see: here are three customer records, here is what the SLA Tier field looks like on each, and here is how it behaves on edit. The user sees <strong>status</strong>. They need <strong>evidence of comprehension</strong>.</p>

  <div style="background: #fff3e0; border-left: 4px solid #f57c00; padding: 18px 22px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0; font-size: 16px; color: #2d3436; font-weight: 500;">The confidence gap: Helix proves code <em>works</em>, but it doesn&rsquo;t prove code <em>does what the user intended</em>. Of <strong>876 production tickets</strong>, 634 are BUILD/FIX/AUTO &mdash; all producing automations &mdash; and <strong>zero</strong> have canonical examples.</p>
  </div>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">Canonical examples close this gap. They are a set of realistic, synthetic NetSuite records and their expected outputs used to <strong>prove</strong> that a Helix-generated automation works correctly &mdash; before it ever touches production data. Most importantly, they demonstrate to the user that Helix understood their intent.</p>

  <!-- ============================================================ -->
  <!-- SECTION 2: WHAT ARE CANONICAL EXAMPLES?                       -->
  <!-- ============================================================ -->
  <h2 id="what-are-canonical-examples" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">2. What Are Canonical Examples?</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">A canonical example is a before/after pair &mdash; the state of a synthetic sandbox record <strong>before</strong> the customization runs and the state <strong>after</strong>. Typically 3&ndash;5 examples per customization: one happy path plus edge cases. Enough to build confidence, not so many they become a burden.</p>

  <!-- BUILD vs FIX visual distinction -->
  <div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 28px 0;">
    <div style="flex: 1; min-width: 280px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px 24px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="display: inline-block; background: #4caf50; color: #fff; padding: 3px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase;">BUILD Pattern</span>
      </div>
      <p style="font-size: 15px; margin: 0 0 8px 0; font-weight: 600; color: #2d3436;">Absence &rarr; Presence</p>
      <p style="font-size: 14px; margin: 0; color: #2d3436; line-height: 1.6;">The customization creates new functionality that didn&rsquo;t exist before. <strong>Before:</strong> no SLA Tier field on customer records. <strong>After:</strong> SLA Tier field exists, defaults correctly, validates properly.</p>
    </div>
    <div style="flex: 1; min-width: 280px; background: #fff3e0; border: 2px solid #f57c00; border-radius: 8px; padding: 20px 24px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="display: inline-block; background: #f57c00; color: #fff; padding: 3px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase;">FIX Pattern</span>
      </div>
      <p style="font-size: 15px; margin: 0 0 8px 0; font-weight: 600; color: #2d3436;">Broken &rarr; Corrected</p>
      <p style="font-size: 14px; margin: 0; color: #2d3436; line-height: 1.6;">The customization repairs existing functionality that is broken. <strong>Before:</strong> CSV import fails with SuiteScript error. <strong>After:</strong> CSV import succeeds without weakening UI validation.</p>
    </div>
  </div>

  <div style="background: #e3f2fd; border-left: 4px solid #0984e3; padding: 18px 22px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0; font-size: 15px; color: #2d3436;"><strong>Mode gating:</strong> Canonical examples apply only to <strong>BUILD</strong>, <strong>FIX</strong>, and <strong>AUTO</strong> ticket modes &mdash; the &ldquo;make code&rdquo; modes that produce automations. Not applicable to RESEARCH or PLAYBOOK_CHECK modes, which don&rsquo;t generate deployable artifacts.</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 3: THE RECIPE CONCEPT                                 -->
  <!-- ============================================================ -->
  <h2 id="the-recipe-concept" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">3. The Recipe Concept</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">The hard work is figuring out <em>what</em> canonical examples look like for a specific customization: which NetSuite record types, which field values, which edge cases. Once that intellectual work is done, the <strong>recipe</strong> &mdash; the specification for how to construct valid canonical examples &mdash; is the primary persistent artifact.</p>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">The recipe captures everything an independent agent needs to reproduce the examples from scratch: target record types, relevant fields, boundary conditions, setup instructions, and expected before/after states. The executed examples are <em>derived outputs</em> of the recipe &mdash; valuable, but replaceable. The recipe itself is the durable knowledge.</p>

  <!-- Co-development loop -->
  <div style="background: #f5f5f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 28px 28px 20px 28px; margin: 32px 0;">
    <h3 id="the-co-development-loop" style="font-size: 18px; margin: 0 0 20px 0; color: #2d3436;">The Co-Development Loop</h3>
    <p style="font-size: 15px; color: #636e72; margin: 0 0 20px 0;">Canonical examples co-develop alongside the automation in a feedback loop (max 3 iterations):</p>
    <div style="display: flex; gap: 0; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px 8px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #667eea; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800;">1</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 600; color: #2d3436;">Derive Examples</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Figure out what good examples look like for this customization</p>
      </div>
      <div style="flex: 0 0 30px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #b2bec3;">&rarr;</div>
      <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px 8px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #00b894; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800;">2</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 600; color: #2d3436;">Build Customization</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">The SuiteScript, workflow, or saved search itself</p>
      </div>
      <div style="flex: 0 0 30px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #b2bec3;">&rarr;</div>
      <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px 8px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #f57c00; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800;">3</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 600; color: #2d3436;">Run Through</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Execute automation against sandbox records, capture before/after</p>
      </div>
      <div style="flex: 0 0 30px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #b2bec3;">&rarr;</div>
      <div style="flex: 1; min-width: 140px; text-align: center; padding: 16px 8px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #6c5ce7; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800;">4</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 600; color: #2d3436;">Verify Results</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Confirm output matches expectations, refine if needed</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 16px; padding: 12px; background: #e8f5e9; border-radius: 6px;">
      <p style="margin: 0; font-size: 13px; color: #2d3436;"><strong>Store the recipe</strong> &mdash; persist the specification so any agent can replay the full cycle from scratch at any future point.</p>
    </div>
  </div>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">This loop is agentic and automatic. The agent iterates until the examples pass or the iteration cap (3) is reached. If results reveal a problem, both the automation logic and the examples refine in tandem.</p>

  <!-- ============================================================ -->
  <!-- SECTION 4: RECIPE-FIRST DATA MODEL                            -->
  <!-- ============================================================ -->
  <h2 id="recipe-first-data-model" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">4. Recipe-First Data Model</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">The data model has three layers: the <strong>recipe</strong> (how to generate examples), the <strong>executed example</strong> (a single before/after result), and the <strong>container</strong> (the full package persisted per run). A developer could implement these types directly.</p>

  <!-- CanonicalExampleRecipe -->
  <h3 id="canonicalexamplerecipe" style="font-size: 20px; color: #2d3436; margin-top: 32px; margin-bottom: 12px;">CanonicalExampleRecipe</h3>
  <p style="font-size: 15px; line-height: 1.7; color: #2d3436;">The recipe is the primary persistent artifact. It captures everything an independent agent needs to reproduce examples from scratch for a specific customization.</p>

  <div style="background: #1a1a2e; border-radius: 8px; padding: 20px 24px; margin: 16px 0; overflow-x: auto;">
    <pre style="margin: 0; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 13px; line-height: 1.7; color: #dfe6e9; white-space: pre-wrap; word-wrap: break-word;"><span style="color: #6c5ce7;">type</span> <span style="color: #00b894;">CanonicalExampleRecipe</span> = {
  <span style="color: #636e72;">/** Which NetSuite record types are involved */</span>
  <span style="color: #fdcb6e;">targetRecordTypes</span>: <span style="color: #74b9ff;">string</span>[];

  <span style="color: #636e72;">/** Which fields matter for this customization and why */</span>
  <span style="color: #fdcb6e;">fieldSpecifications</span>: <span style="color: #74b9ff;">Array</span>&lt;{
    <span style="color: #fdcb6e;">recordType</span>: <span style="color: #74b9ff;">string</span>;
    <span style="color: #fdcb6e;">fieldId</span>: <span style="color: #74b9ff;">string</span>;
    <span style="color: #fdcb6e;">fieldLabel</span>: <span style="color: #74b9ff;">string</span>;
    <span style="color: #fdcb6e;">relevance</span>: <span style="color: #74b9ff;">string</span>; <span style="color: #636e72;">// Why this field matters</span>
  }&gt;;

  <span style="color: #636e72;">/** How to construct the "before" state.
   *  BUILD: create records without the new functionality.
   *  FIX: create records in the broken state (precondition). */</span>
  <span style="color: #fdcb6e;">setupInstructions</span>: <span style="color: #74b9ff;">string</span>;

  <span style="color: #636e72;">/** 3-5 example templates with expected before/after states */</span>
  <span style="color: #fdcb6e;">exampleDefinitions</span>: <span style="color: #74b9ff;">Array</span>&lt;{
    <span style="color: #fdcb6e;">label</span>: <span style="color: #74b9ff;">string</span>;
    <span style="color: #fdcb6e;">category</span>: <span style="color: #e17055;">"happy-path"</span> | <span style="color: #e17055;">"edge-case"</span> | <span style="color: #e17055;">"boundary"</span>;
    <span style="color: #fdcb6e;">description</span>: <span style="color: #74b9ff;">string</span>;
    <span style="color: #fdcb6e;">beforeState</span>: <span style="color: #74b9ff;">Record</span>&lt;<span style="color: #74b9ff;">string</span>, <span style="color: #74b9ff;">unknown</span>&gt;;
    <span style="color: #fdcb6e;">expectedAfterState</span>: <span style="color: #74b9ff;">Record</span>&lt;<span style="color: #74b9ff;">string</span>, <span style="color: #74b9ff;">unknown</span>&gt;;
  }&gt;;

  <span style="color: #636e72;">/** Boundary conditions specific to this customization */</span>
  <span style="color: #fdcb6e;">boundaryConditions</span>: <span style="color: #74b9ff;">string</span>[];

  <span style="color: #636e72;">/** How to execute the customization against the examples */</span>
  <span style="color: #fdcb6e;">executionMethod</span>: <span style="color: #74b9ff;">string</span>;

  <span style="color: #636e72;">/** BUILD (absence-to-presence) or FIX (broken-to-corrected) */</span>
  <span style="color: #fdcb6e;">pattern</span>: <span style="color: #e17055;">"BUILD"</span> | <span style="color: #e17055;">"FIX"</span>;
};</pre>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0 28px 0; font-size: 14px;">
    <thead>
      <tr style="background: #f1f3f5;">
        <th style="text-align: left; padding: 10px 14px; border-bottom: 2px solid #dee2e6; font-weight: 700; color: #2d3436;">Field</th>
        <th style="text-align: left; padding: 10px 14px; border-bottom: 2px solid #dee2e6; font-weight: 700; color: #2d3436;">Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">targetRecordTypes</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Which NetSuite record types to create (e.g., Customer, Sales Order, Invoice)</td></tr>
      <tr style="background: #fafbfc;"><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">fieldSpecifications</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Declares which fields matter and why &mdash; the agent&rsquo;s explicit statement of what it is testing</td></tr>
      <tr><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">setupInstructions</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Prose instructions for constructing the &ldquo;before&rdquo; state &mdash; critical for FIX evals where preconditions define the broken state</td></tr>
      <tr style="background: #fafbfc;"><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">exampleDefinitions</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">3&ndash;5 concrete example templates with expected before/after states, categorized as happy-path, edge-case, or boundary</td></tr>
      <tr><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">boundaryConditions</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Threshold values and special conditions the customization must handle (e.g., &ldquo;exactly $10,000&rdquo;, &ldquo;empty results&rdquo;)</td></tr>
      <tr style="background: #fafbfc;"><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">executionMethod</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">How to trigger the customization against the examples (save record, run search, POST to RESTlet, etc.)</td></tr>
      <tr><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;"><code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">pattern</code></td><td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">BUILD (absence &rarr; presence) or FIX (broken &rarr; corrected)</td></tr>
    </tbody>
  </table>

  <!-- CanonicalExample -->
  <h3 id="canonicalexample" style="font-size: 20px; color: #2d3436; margin-top: 32px; margin-bottom: 12px;">CanonicalExample (Executed)</h3>
  <p style="font-size: 15px; line-height: 1.7; color: #2d3436;">A single executed example. The agent creates the record, runs the customization, and captures the actual before/after state. The status field records whether the outcome matched expectations.</p>

  <div style="background: #1a1a2e; border-radius: 8px; padding: 20px 24px; margin: 16px 0; overflow-x: auto;">
    <pre style="margin: 0; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 13px; line-height: 1.7; color: #dfe6e9; white-space: pre-wrap; word-wrap: break-word;"><span style="color: #6c5ce7;">type</span> <span style="color: #00b894;">CanonicalExample</span> = {
  <span style="color: #fdcb6e;">label</span>: <span style="color: #74b9ff;">string</span>;
  <span style="color: #fdcb6e;">category</span>: <span style="color: #e17055;">"happy-path"</span> | <span style="color: #e17055;">"edge-case"</span> | <span style="color: #e17055;">"boundary"</span>;
  <span style="color: #636e72;">/** Actual record state before customization ran */</span>
  <span style="color: #fdcb6e;">beforeState</span>: <span style="color: #74b9ff;">Record</span>&lt;<span style="color: #74b9ff;">string</span>, <span style="color: #74b9ff;">unknown</span>&gt;;
  <span style="color: #636e72;">/** Actual record state after customization ran */</span>
  <span style="color: #fdcb6e;">afterState</span>: <span style="color: #74b9ff;">Record</span>&lt;<span style="color: #74b9ff;">string</span>, <span style="color: #74b9ff;">unknown</span>&gt;;
  <span style="color: #636e72;">/** Whether the actual after-state matched expected */</span>
  <span style="color: #fdcb6e;">status</span>: <span style="color: #e17055;">"pass"</span> | <span style="color: #e17055;">"fail"</span> | <span style="color: #e17055;">"skipped"</span>;
  <span style="color: #636e72;">/** If status is "fail", what was wrong */</span>
  <span style="color: #fdcb6e;">failureReason</span>?: <span style="color: #74b9ff;">string</span>;
};</pre>
  </div>

  <!-- CanonicalExamplesData -->
  <h3 id="canonicalexamplesdata" style="font-size: 20px; color: #2d3436; margin-top: 32px; margin-bottom: 12px;">CanonicalExamplesData (Container)</h3>
  <p style="font-size: 15px; line-height: 1.7; color: #2d3436;">The top-level container persisted as a JSONB column on <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">SandboxRun</code>. Bundles the recipe with executed examples, a human-readable summary, and metadata about when and where the examples were generated.</p>

  <div style="background: #1a1a2e; border-radius: 8px; padding: 20px 24px; margin: 16px 0; overflow-x: auto;">
    <pre style="margin: 0; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 13px; line-height: 1.7; color: #dfe6e9; white-space: pre-wrap; word-wrap: break-word;"><span style="color: #6c5ce7;">type</span> <span style="color: #00b894;">CanonicalExamplesData</span> = {
  <span style="color: #636e72;">/** The reusable recipe for generating these examples */</span>
  <span style="color: #fdcb6e;">recipe</span>: <span style="color: #00b894;">CanonicalExampleRecipe</span>;
  <span style="color: #636e72;">/** The executed before/after examples */</span>
  <span style="color: #fdcb6e;">examples</span>: <span style="color: #00b894;">CanonicalExample</span>[];
  <span style="color: #636e72;">/** Human-readable summary */</span>
  <span style="color: #fdcb6e;">summary</span>: <span style="color: #74b9ff;">string</span>;
  <span style="color: #636e72;">/** When the examples were generated */</span>
  <span style="color: #fdcb6e;">generatedAt</span>: <span style="color: #74b9ff;">string</span>; <span style="color: #636e72;">// ISO 8601</span>
  <span style="color: #636e72;">/** Which workflow step generated them */</span>
  <span style="color: #fdcb6e;">generatedDuring</span>: <span style="color: #e17055;">"implementation"</span> | <span style="color: #e17055;">"verification"</span>;
};</pre>
  </div>

  <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 18px 22px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0; font-size: 15px; color: #2d3436;"><strong>Integration note:</strong> <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">CanonicalExamplesData</code> follows the exact same pattern as <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">walkthroughData</code> and <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">demoContent</code> on the <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">SandboxRun</code> model. It is carried in <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">HelixWorkflowStepResult</code>, captured by <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">workflow-step-chain.ts</code>, and persisted by <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">orchestrator.ts</code> as a JSONB column.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ZONE 2: FEASIBILITY PROOF                                        -->
  <!-- ================================================================ -->
  <div style="background: linear-gradient(135deg, #00897b11, #00b89411); border-left: 4px solid #00897b; padding: 8px 16px; margin-bottom: 8px; margin-top: 48px; border-radius: 0 4px 4px 0;">
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #00897b; font-weight: 700;">Zone 2 &mdash; Feasibility Proof: 13 PxEval Recipes</p>
  </div>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436; margin-top: 24px;">The following sections prove that concrete canonical example recipes can be defined for all 13 active PxEvals. Each recipe includes target record types, key fields, setup instructions, and a before/after examples table. Together they demonstrate that the recipe-first model works for the full range of Helix automations.</p>

  <!-- ============================================================ -->
  <!-- SECTION 5: BUILD EVALS FEASIBILITY PROOF                      -->
  <!-- ============================================================ -->
  <h2 id="build-evals-feasibility-proof" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">5. BUILD Evals &mdash; Absence to Presence (7 Recipes)</h2>

  <p style="font-size: 15px; color: #636e72; margin-bottom: 32px;">BUILD evals demonstrate the <strong>absence &rarr; presence</strong> pattern: before the customization, the functionality does not exist; after, it works correctly. Each recipe defines what records to create in sandbox, what to expect, and what edge cases to cover.</p>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 1                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 1</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Customer SLA Tier Field</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Customer</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custentity_sla_tier</code> (select: Standard, Gold, Platinum)</div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create customer records without the SLA Tier field.</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Save customer records; user event or field default populates SLA Tier.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Customer &ldquo;Acme Corp&rdquo; &mdash; no SLA Tier field exists</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Customer &ldquo;Acme Corp&rdquo; &mdash; SLA Tier = &ldquo;Standard&rdquo; (default)</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Customer &ldquo;Big Deal Inc&rdquo; &mdash; SLA Tier manually set to &ldquo;Platinum&rdquo;</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Customer &ldquo;Big Deal Inc&rdquo; &mdash; SLA Tier = &ldquo;Platinum&rdquo; (persists)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Vendor record &mdash; should NOT have SLA Tier field</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Vendor record &mdash; still no SLA Tier field (correctly excluded)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 2                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 2</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Sales Manager Dashboard Search</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Sales Order</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">entity</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">trandate</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">total</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">status</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">salesrep</code></div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create sales orders &mdash; some over $10k, some under.</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Run saved search; verify qualifying orders appear, non-qualifying don&rsquo;t.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO #1001, Customer &ldquo;Acme&rdquo;, total $15,000, Open</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Search returns SO #1001 with correct columns</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO #1002, Customer &ldquo;Small Co&rdquo;, total $5,000, Open</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Search does NOT return SO #1002 (below $10k)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO #1003, Customer &ldquo;Edge Inc&rdquo;, total $10,000 exactly</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Search returns SO #1003 (at threshold &mdash; clarifies &ldquo;over $10,000&rdquo;)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 3                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 3</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Sales Order Margin Review User Event</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Sales Order (with line items)</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custbody_needs_margin_review</code> (checkbox), line <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">estimatedmargin</code></div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create SOs with varying line margins (some below 20%, some above).</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Save SO; user event fires; check checkbox and script logs.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO with line item at 15% margin, checkbox unchecked</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Checkbox = checked, log shows &ldquo;Line 1 triggered flag (15% margin)&rdquo;</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO with all lines at 25% margin</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Checkbox = unchecked (no low-margin lines)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO with line at exactly 20% margin</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Clarifies &ldquo;below 20%&rdquo; threshold behavior</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO edited: remove low-margin line, add high-margin line</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Checkbox = unchecked (re-evaluates on edit)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 4                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 4</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Rolling Item Sales Snapshot</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Inventory Item, Item Fulfillment</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custitem_rolling_30day_sales</code> (numeric), fulfillment quantity/date</div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create inventory items with fulfillment history (some within 30 days, some older).</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Run scheduled script; verify field populated with correct quantities.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Item &ldquo;Widget A&rdquo; with 3 fulfillments (50+30+20) in last 30 days</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><code style="background: #e8f5e9; padding: 2px 4px; border-radius: 3px;">custitem_rolling_30day_sales = 100</code></td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Item &ldquo;Widget B&rdquo; with fulfillments only 45 days ago</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><code style="background: #e8f5e9; padding: 2px 4px; border-radius: 3px;">custitem_rolling_30day_sales = 0</code> (outside window)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Item &ldquo;Widget C&rdquo; with a return (credit memo) in last 30 days</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Return excluded from calculation</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Item &ldquo;Widget D&rdquo; with fulfillment exactly 30 days ago</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Included/excluded depending on boundary interpretation</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 5                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 5</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Customer Escalation Custom Record</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Custom Record (Customer Escalation), Customer</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_esc_customer</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_esc_priority</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_esc_status</code></div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create customer records; escalation record type doesn&rsquo;t exist yet.</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Create escalation records; verify linking, field population, role-based access.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Customer &ldquo;Acme Corp&rdquo; exists, no escalation capability</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Escalation record created: customer=Acme, priority=High, status=Open, assigned to Sales Rep A</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Sales Rep B views escalations</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Sees only own assigned escalations (not Rep A&rsquo;s)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Manager views escalations</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Sees ALL escalations (including Rep A&rsquo;s and Rep B&rsquo;s)</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Unrelated role (e.g., Warehouse) views escalations</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">No access &mdash; cannot see or create escalations</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 6                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 6</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Expense Report Approval Workflow</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Expense Report</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">total</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">approvalstatus</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">supervisor</code></div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create expense reports with varying totals.</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Submit expense reports; verify routing behavior.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Expense report, total $1,500 (over $1k)</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Routes to supervisor for approval, status = Pending Approval</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Expense report, total $800 (under $1k)</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Proceeds normally without supervisor routing</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Expense report, total $1,000 exactly</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Clarifies &ldquo;over $1,000&rdquo; threshold behavior</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Supervisor rejects $1,500 report</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Status = Rejected, report is editable, can be resubmitted</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 15                                            -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #4caf50; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #4caf50; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 15</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">System X Shipment Status RESTlet</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">BUILD</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Custom Record (External Shipment Status), Sales Order</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_ext_ship_id</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_ext_ship_so</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_ext_ship_status</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custrecord_ext_ship_tracking</code></div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;"><strong>Setup:</strong> Create sales orders; no RESTlet or shipment record exists yet.</div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> POST to RESTlet with shipment data; verify record creation.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">SO #2001 exists, no shipment record</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">POST {extId: &ldquo;SX-001&rdquo;, soId: 2001, status: &ldquo;Shipped&rdquo;} &rarr; Shipment record created</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Repeat POST with same extId &ldquo;SX-001&rdquo; but updated status</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Upsert: existing record updated (idempotent), not duplicated</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">POST with invalid SO ID</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Structured error response: {error: &ldquo;Sales order not found&rdquo;, code: &ldquo;INVALID_SO&rdquo;}</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Verify correlation ID in script logs</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Log entry includes correlation ID matching response</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 6: FIX EVALS FEASIBILITY PROOF                       -->
  <!-- ============================================================ -->
  <h2 id="fix-evals-feasibility-proof" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">6. FIX Evals &mdash; Broken to Corrected (6 Recipes)</h2>

  <p style="font-size: 15px; color: #636e72; margin-bottom: 16px;">FIX evals demonstrate the <strong>broken &rarr; corrected</strong> pattern: existing functionality is broken and the customization repairs it. The critical difference from BUILD is the <strong>precondition setup</strong> &mdash; FIX recipes must explicitly define how to establish the broken state before the fix is applied.</p>

  <div style="background: #fff3e0; border-left: 4px solid #f57c00; padding: 16px 22px; border-radius: 0 6px 6px 0; margin: 0 0 32px 0;">
    <p style="margin: 0; font-size: 14px; color: #2d3436;"><strong>Precondition setup is what makes FIX canonical examples harder than BUILD.</strong> For BUILD evals, the &ldquo;before&rdquo; state is simply the absence of functionality. For FIX evals, the agent must construct a specific broken state &mdash; deploy a script that fails, configure an incorrect role assignment, set up a race condition. The recipe must capture these preconditions precisely enough for independent reproduction.</p>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 8                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #f57c00; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 8</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Finance Invoice PDF Update</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">FIX</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Invoice, Customer</div>
        <div><strong>Key Fields:</strong> Invoice PDF template fields &mdash; SLA Tier, line Location, &ldquo;FINANCE REVIEW REQUIRED&rdquo; flag</div>
      </div>
      <div style="background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #c62828;"><strong>Precondition Setup:</strong> Customer has SLA Tier field. Invoice exists with balance. Current PDF template is missing the SLA Tier, Location, and finance review fields. Generate PDF before fix to capture broken state.</p>
      </div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Generate PDF before fix; apply fix; generate PDF after.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State (Broken)</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State (Corrected)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Invoice PDF for customer with SLA Tier = Gold, line Location = &ldquo;NYC&rdquo; &mdash; PDF shows neither</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">PDF header shows &ldquo;SLA Tier: Gold&rdquo;, line table includes &ldquo;Location: NYC&rdquo;</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Invoice balance $12,000 (over $10k)</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">PDF shows &ldquo;FINANCE REVIEW REQUIRED&rdquo; banner</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Invoice balance $5,000 (under $10k)</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">PDF does NOT show &ldquo;FINANCE REVIEW REQUIRED&rdquo;</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Boundary</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Invoice on non-finance form</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">PDF unchanged &mdash; fix applies to finance invoice form only</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 9                                             -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #f57c00; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 9</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Admin Bulk Transaction Update Tool</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">FIX</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Sales Order, Invoice (transactions)</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">memo</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">department</code></div>
      </div>
      <div style="background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #c62828;"><strong>Precondition Setup:</strong> Create mix of open, closed, and locked transactions. No bulk update capability exists &mdash; the &ldquo;broken state&rdquo; is the absence of the tool itself.</p>
      </div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Call Suitelet/RESTlet with transaction IDs and new field values.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State (Broken)</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State (Corrected)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Open SO #3001, memo=&ldquo;old&rdquo;, dept=Sales</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">After bulk update: memo=&ldquo;updated&rdquo;, dept=Marketing. Response: {status: &ldquo;success&rdquo;}</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Closed SO #3002</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Response: {status: &ldquo;failed&rdquo;, reason: &ldquo;Record is closed&rdquo;} &mdash; record unchanged</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Locked invoice #3003</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Response: {status: &ldquo;failed&rdquo;, reason: &ldquo;Record is locked&rdquo;} &mdash; record unchanged</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Non-existent ID #9999</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Response: {status: &ldquo;failed&rdquo;, reason: &ldquo;Record not found&rdquo;}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 10                                            -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #f57c00; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 10</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Fix CSV-Only Sales Order User Event Failure</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">FIX</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Sales Order</div>
        <div><strong>Key Fields:</strong> User event script, CSV import context, UI validation</div>
      </div>
      <div style="background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #c62828;"><strong>Precondition Setup:</strong> Existing user event script works in UI but fails during CSV import. Deploy the broken script and confirm CSV import fails with SuiteScript error before applying fix.</p>
      </div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Attempt CSV import before fix (fails); apply fix; attempt CSV import after (succeeds); verify UI still works.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State (Broken)</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State (Corrected)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">CSV import of SO with valid data &mdash; SuiteScript error thrown</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">CSV import succeeds, SO created with correct field values</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">UI save of SO with valid data (before fix) &mdash; works</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">UI save still works after fix (no regression)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">UI save of SO with invalid data &mdash; UI validation catches it</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">UI validation still catches it after fix (not weakened)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 11                                            -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #f57c00; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 11</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Fix Warehouse Operations Suitelet Access</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">FIX</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Suitelet deployment, Role (Warehouse Operations)</div>
        <div><strong>Key Fields:</strong> Script deployment audience/role settings</div>
      </div>
      <div style="background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #c62828;"><strong>Precondition Setup:</strong> Suitelet works for admin but the Warehouse Operations role gets &ldquo;Access Denied&rdquo;. Deploy the script with restricted audience excluding Warehouse Operations.</p>
      </div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Access Suitelet as Warehouse Operations role before fix (denied); apply fix; access after (granted).</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State (Broken)</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State (Corrected)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Warehouse Operations user navigates to Suitelet URL &mdash; &ldquo;Access Denied&rdquo; error</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Suitelet loads with pick/pack interface</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Admin user accesses Suitelet</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Works correctly before AND after fix (no regression)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Random non-warehouse role accesses Suitelet</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Appropriately restricted before AND after fix</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 12                                            -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #f57c00; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 12</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Fix Sales Order User Event Execution Order</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">FIX</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Sales Order, Customer</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custentity_credit_tier</code> (customer field), Script A (populates), Script B (reads)</div>
      </div>
      <div style="background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #c62828;"><strong>Precondition Setup:</strong> Script A and Script B both deploy as beforeSubmit on Sales Order. Script B runs before Script A due to incorrect ordering &mdash; it reads a blank credit tier because Script A hasn&rsquo;t populated it yet.</p>
      </div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Create SO before fix (Script B reads blank); apply fix (reorder scripts); create SO after (Script A populates first, Script B reads correct value).</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State (Broken)</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State (Corrected)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Create SO for customer with credit tier = &ldquo;Gold&rdquo; &mdash; Script B logs &ldquo;credit tier: blank&rdquo;</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Script B logs &ldquo;credit tier: Gold&rdquo; (Script A populates first)</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Create SO for customer with no credit tier set</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Script A populates default, Script B reads default (graceful handling)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ────────────────────────────────────────────────── -->
  <!-- EVAL 13                                            -->
  <!-- ────────────────────────────────────────────────── -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
    <div style="background: #f57c00; padding: 14px 20px; display: flex; align-items: center; gap: 12px;">
      <span style="background: #fff; color: #f57c00; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800;">EVAL 13</span>
      <span style="color: #fff; font-size: 16px; font-weight: 700;">Margin Override Reason Role/State Visibility</span>
      <span style="margin-left: auto; background: rgba(255,255,255,0.2); color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">FIX</span>
    </div>
    <div style="padding: 20px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; font-size: 14px;">
        <div><strong>Target Records:</strong> Sales Order</div>
        <div><strong>Key Fields:</strong> <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">custbody_margin_override_reason</code>, <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">orderstatus</code>, user role</div>
      </div>
      <div style="background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 13px; color: #c62828;"><strong>Precondition Setup:</strong> No Margin Override Reason field exists. The broken state is the absence of role/state-based visibility controls.</p>
      </div>
      <div style="font-size: 14px; margin-bottom: 16px;"><strong>Execution:</strong> Create field with role/state-based visibility rules; verify correct visibility per role and order status.</div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Category</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Before State (Broken)</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">After State (Corrected)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">1</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Happy path</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Finance Manager views SO in Pending Approval status &mdash; no field exists</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Margin Override Reason field visible and editable</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">2</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Finance Manager views SO in Approved status</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Field visible but NOT editable (locked after approval)</td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">3</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Sales Rep views SO in Pending Approval status</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Field NOT visible (wrong role)</td>
          </tr>
          <tr style="background: #fafbfc;">
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #dee2e6;">4</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Edge case</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Admin views SO in Pending Approval status</td>
            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">Field NOT visible (not Finance Manager role)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ZONE 3: INTEGRATION & DECISIONS                                   -->
  <!-- ================================================================ -->
  <div style="background: linear-gradient(135deg, #f57c0011, #e1700511); border-left: 4px solid #f57c00; padding: 8px 16px; margin-bottom: 8px; margin-top: 48px; border-radius: 0 4px 4px 0;">
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f57c00; font-weight: 700;">Zone 3 &mdash; Integration &amp; Decisions</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 7: INTEGRATION PATH                                   -->
  <!-- ============================================================ -->
  <h2 id="integration-path" style="font-size: 26px; color: #2d3436; margin-top: 40px; margin-bottom: 16px;">7. Integration Path</h2>

  <p style="font-size: 17px; line-height: 1.8; color: #2d3436;">Canonical examples flow through the exact same infrastructure as <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">walkthroughData</code> and <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">demoContent</code>. No new plumbing is needed &mdash; the pattern is proven and carries 755 walkthrough runs and 112 demo runs in production today.</p>

  <!-- Data Flow Diagram -->
  <div style="background: #f5f5f5; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin: 24px 0;">
    <h3 id="data-flow" style="font-size: 16px; margin: 0 0 20px 0; color: #2d3436;">Data Flow: Implementation Step to Client</h3>
    <div style="display: flex; flex-direction: column; gap: 0;">
      <div style="display: flex; align-items: stretch; gap: 0;">
        <div style="flex: 1; background: #667eea; color: #fff; padding: 14px 16px; border-radius: 6px 6px 0 0; text-align: center;">
          <div style="font-size: 14px; font-weight: 700;">Implementation Step</div>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">Agent generates recipe + examples via ns-gm</div>
        </div>
      </div>
      <div style="text-align: center; padding: 4px 0; color: #b2bec3; font-size: 20px;">&darr;</div>
      <div style="display: flex; align-items: stretch; gap: 0;">
        <div style="flex: 1; background: #0984e3; color: #fff; padding: 14px 16px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700;">HelixWorkflowStepResult.canonicalExamples</div>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">types.ts &mdash; optional field alongside walkthroughData, demoContent</div>
        </div>
      </div>
      <div style="text-align: center; padding: 4px 0; color: #b2bec3; font-size: 20px;">&darr;</div>
      <div style="display: flex; align-items: stretch; gap: 0;">
        <div style="flex: 1; background: #00b894; color: #fff; padding: 14px 16px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700;">workflow-step-chain.ts</div>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">Conditional capture block (lines 1351&ndash;1357 pattern)</div>
        </div>
      </div>
      <div style="text-align: center; padding: 4px 0; color: #b2bec3; font-size: 20px;">&darr;</div>
      <div style="display: flex; align-items: stretch; gap: 0;">
        <div style="flex: 1; background: #f57c00; color: #fff; padding: 14px 16px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700;">orchestrator.ts</div>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">Best-effort persistence to SandboxRun JSONB column (try/catch)</div>
        </div>
      </div>
      <div style="text-align: center; padding: 4px 0; color: #b2bec3; font-size: 20px;">&darr;</div>
      <div style="display: flex; align-items: stretch; gap: 0;">
        <div style="flex: 1; background: #6c5ce7; color: #fff; padding: 14px 16px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700;">SandboxRun.canonicalExamples (JSONB)</div>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">prisma/schema.prisma &mdash; new Json? column alongside walkthroughData, demoContent</div>
        </div>
      </div>
      <div style="text-align: center; padding: 4px 0; color: #b2bec3; font-size: 20px;">&darr;</div>
      <div style="display: flex; align-items: stretch; gap: 0;">
        <div style="flex: 1; background: #2d3436; color: #fff; padding: 14px 16px; border-radius: 0 0 6px 6px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700;">ticket-service.ts &rarr; API Response &rarr; Client</div>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">Included in run history response for client rendering</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Integration Points Table -->
  <h3 id="concrete-integration-points" style="font-size: 18px; color: #2d3436; margin-top: 28px; margin-bottom: 12px;">Concrete Integration Points</h3>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="text-align: left; padding: 12px 14px;">File</th>
        <th style="text-align: left; padding: 12px 14px;">Change</th>
        <th style="text-align: left; padding: 12px 14px;">Pattern Reference</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">prisma/schema.prisma</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Add <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">canonicalExamples Json?</code> to SandboxRun model</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Alongside <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">walkthroughData</code> (line 470), <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">demoContent</code> (line 472)</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">types.ts</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Add <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">canonicalExamples?: unknown</code> to HelixWorkflowStepResult</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">At line 137, alongside walkthroughData/demoContent at lines 152&ndash;153</td>
      </tr>
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">workflow-step-chain.ts</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Add conditional capture block for <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">canonicalExamples</code></td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Matching pattern at lines 1351&ndash;1357 for walkthroughData/demoContent</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">orchestrator.ts</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Add best-effort persistence in try/catch</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Same pattern as walkthroughData persistence (non-fatal logging)</td>
      </tr>
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">step-config.mjs (implementation)</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Add agent prompt instructions for canonical example generation</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Mode-gated to BUILD/FIX/AUTO via prompt (not step-selection.ts)</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">step-config.mjs (verification)</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Add agent prompt instructions for recipe re-run and validation</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Receives recipe from implementation step; produces CascadeCheckItem entries</td>
      </tr>
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6; font-family: monospace; font-size: 13px;">ticket-service.ts</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Include <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">canonicalExamples</code> in API response</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Already maps walkthroughData/demoContent &mdash; add canonicalExamples to same mapping</td>
      </tr>
    </tbody>
  </table>

  <div style="background: #e3f2fd; border-left: 4px solid #0984e3; padding: 18px 22px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #2d3436;">Mode Gating Strategy</p>
    <p style="margin: 0; font-size: 14px; color: #2d3436;">Canonical examples are gated to BUILD/FIX/AUTO via <strong>agent prompt instructions</strong> in step-config.mjs, not via step-selection.ts exclusion sets. The implementation step already runs for these modes; gating happens in the prompt: &ldquo;For BUILD, FIX, and AUTO tickets, generate canonical examples. For RESEARCH and PLAYBOOK_CHECK tickets, skip this section.&rdquo;</p>
  </div>

  <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 18px 22px; border-radius: 0 6px 6px 0; margin: 24px 0;">
    <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #2d3436;">Best-Effort Generation</p>
    <p style="margin: 0; font-size: 14px; color: #2d3436;">Canonical examples are generated <strong>best-effort</strong> &mdash; failure does not fail the run. This follows the <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">walkthroughData</code> pattern (step-config.mjs lines 316&ndash;346) and the demo step&rsquo;s <code style="background: #c8e6c9; padding: 2px 6px; border-radius: 3px;">nonBlocking: true</code> setting. Once generation reliability is proven across production runs, canonical examples can be elevated to blocking &mdash; this is a configuration change, not an architectural one.</p>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 8: ARCHITECTURE DECISIONS                             -->
  <!-- ============================================================ -->
  <h2 id="architecture-decisions" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">8. Architecture Decisions</h2>

  <!-- AD-1: Recipe-first -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #f1f3f5; padding: 14px 20px; border-bottom: 1px solid #dee2e6;">
      <span style="font-size: 15px; font-weight: 700; color: #2d3436;">AD-1: Recipe-First Model</span>
      <span style="float: right; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600;">CHOSEN</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="font-size: 14px; margin: 0 0 12px 0;"><strong>Decision:</strong> Store the recipe (specification for generating examples) as the primary artifact, with executed examples as derived outputs.</p>
      <p style="font-size: 14px; margin: 0 0 12px 0;"><strong>Rationale:</strong> The user explicitly requires that the process be repeatable at any time &mdash; any agent can pick up the recipe and reproduce examples from scratch (ticket.md discussion). Without the recipe, examples are one-time artifacts.</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px; background: #ffebee; border-radius: 6px; padding: 10px 14px;">
          <p style="margin: 0; font-size: 12px; color: #c62828; font-weight: 600;">Rejected: Examples-Only</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Violates repeatability requirement. Can&rsquo;t regenerate without recipe.</p>
        </div>
        <div style="flex: 1; min-width: 180px; background: #ffebee; border-radius: 6px; padding: 10px 14px;">
          <p style="margin: 0; font-size: 12px; color: #c62828; font-weight: 600;">Rejected: External Artifact</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Over-engineers initial design. Breaks JSONB column pattern. Recipes evolve per run.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- AD-2: Augment existing steps -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #f1f3f5; padding: 14px 20px; border-bottom: 1px solid #dee2e6;">
      <span style="font-size: 15px; font-weight: 700; color: #2d3436;">AD-2: Augment Existing Steps (Not a New Step)</span>
      <span style="float: right; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600;">CHOSEN</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="font-size: 14px; margin: 0 0 12px 0;"><strong>Decision:</strong> Generate canonical examples within the existing implementation step and validate in the existing verification step. No new workflow step.</p>
      <p style="font-size: 14px; margin: 0 0 12px 0;"><strong>Rationale:</strong> The implementation agent has the most context about the customization. A separate step adds ordering complexity, increases run time, and loses context.</p>
      <div style="background: #ffebee; border-radius: 6px; padding: 10px 14px;">
        <p style="margin: 0; font-size: 12px; color: #c62828; font-weight: 600;">Rejected: Separate Canonical Examples Step</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Adds step ordering complexity, context loss, and run-time overhead.</p>
      </div>
    </div>
  </div>

  <!-- AD-3: JSONB column -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #f1f3f5; padding: 14px 20px; border-bottom: 1px solid #dee2e6;">
      <span style="font-size: 15px; font-weight: 700; color: #2d3436;">AD-3: JSONB Column on SandboxRun</span>
      <span style="float: right; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600;">CHOSEN</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="font-size: 14px; margin: 0 0 12px 0;"><strong>Decision:</strong> Add <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 3px;">canonicalExamples Json?</code> as a JSONB column on SandboxRun, following the walkthroughData/demoContent pattern.</p>
      <p style="font-size: 14px; margin: 0 0 12px 0;"><strong>Rationale:</strong> Run-scoped storage preserves version history naturally. Estimated 5&ndash;20KB per run &mdash; negligible compared to existing JSONB columns.</p>
      <div style="background: #ffebee; border-radius: 6px; padding: 10px 14px;">
        <p style="margin: 0; font-size: 12px; color: #c62828; font-weight: 600;">Rejected: Separate Table</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #636e72;">Over-normalizes a run-scoped artifact. Breaks established pattern.</p>
      </div>
    </div>
  </div>

  <!-- AD-4: Best-effort -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #f1f3f5; padding: 14px 20px; border-bottom: 1px solid #dee2e6;">
      <span style="font-size: 15px; font-weight: 700; color: #2d3436;">AD-4: Best-Effort Generation (Initially)</span>
      <span style="float: right; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600;">CHOSEN</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Decision:</strong> Canonical examples are generated best-effort &mdash; failure does not fail the run.</p>
      <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Path to blocking:</strong> Once generation reliability is proven across production runs, canonical examples can be elevated to blocking for BUILD/FIX/AUTO modes. This is a configuration change, not an architectural one.</p>
    </div>
  </div>

  <!-- AD-5: Co-development loop -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #f1f3f5; padding: 14px 20px; border-bottom: 1px solid #dee2e6;">
      <span style="font-size: 15px; font-weight: 700; color: #2d3436;">AD-5: Co-Development Loop (Max 3 Iterations)</span>
      <span style="float: right; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600;">CHOSEN</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Decision:</strong> The agent runs a create-execute-verify loop with a cap of 3 iterations before settling.</p>
      <p style="font-size: 14px; margin: 0;"><strong>Rationale:</strong> Prevents infinite loops while allowing refinement. Adds ~1&ndash;3 minutes in worst case. Iteration count can be tuned based on production data.</p>
    </div>
  </div>

  <!-- AD-6: ns-gm -->
  <div style="border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
    <div style="background: #f1f3f5; padding: 14px 20px; border-bottom: 1px solid #dee2e6;">
      <span style="font-size: 15px; font-weight: 700; color: #2d3436;">AD-6: ns-gm as the Execution Bridge</span>
      <span style="float: right; background: #00b894; color: #fff; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 600;">CHOSEN</span>
    </div>
    <div style="padding: 16px 20px;">
      <p style="font-size: 14px; margin: 0 0 8px 0;"><strong>Decision:</strong> All sandbox record operations go through ns-gm CLI &mdash; record creation, SuiteQL queries, script execution, and log verification.</p>
      <p style="font-size: 14px; margin: 0;"><strong>Rationale:</strong> ns-gm is the existing sandbox interaction mechanism already used by the implementation agent. No new tooling is needed. Each example requires 1&ndash;3 ns-gm CLI calls; for 3&ndash;5 examples, this adds ~15&ndash;30 seconds.</p>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 9: OPEN QUESTIONS & RISKS                             -->
  <!-- ============================================================ -->
  <h2 id="open-questions-and-risks" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">9. Open Questions &amp; Risks</h2>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="text-align: center; padding: 12px; width: 30px;">#</th>
        <th style="text-align: left; padding: 12px 14px;">Question / Risk</th>
        <th style="text-align: center; padding: 12px; width: 100px;">Status</th>
        <th style="text-align: left; padding: 12px 14px;">Impact</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;">1</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Can ns-gm generate related record graphs (invoice + customer + terms + line items) reliably?</td>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Open</span></td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Evals 5, 8, 15 require multi-record setups</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;">2</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Recipe quality depends on agent comprehension of the ticket description</td>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Open</span></td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Poor ticket descriptions may yield poor recipes</td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;">3</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Co-development iteration count tuning &mdash; is 3 the right maximum?</td>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;"><span style="background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Open</span></td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Too few = unreliable results; too many = slow runs</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;">4</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Sandbox schema drift &mdash; examples proven in sandbox may not perfectly represent production</td>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Acknowledged</span></td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Not blocking for MVP &mdash; sandbox is the accepted testing environment</td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;">5</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">FIX eval precondition complexity &mdash; establishing the broken state is harder than the fix itself</td>
        <td style="text-align: center; padding: 12px; border-bottom: 1px solid #dee2e6;"><span style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">Mitigated</span></td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #dee2e6;">Recipe&rsquo;s setupInstructions field captures preconditions explicitly</td>
      </tr>
    </tbody>
  </table>

  <!-- Deferred Items -->
  <h3 id="deferred-items" style="font-size: 18px; color: #2d3436; margin-top: 28px; margin-bottom: 12px;">Deferred to Follow-on Tickets</h3>

  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #2d3436;">Client Rendering</p>
      <p style="margin: 0; font-size: 12px; color: #636e72;">CanonicalExamplesViewer component for ticket detail view (similar to walkthrough-viewer.tsx)</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #2d3436;">Automated Recipe Derivation</p>
      <p style="margin: 0; font-size: 12px; color: #636e72;">Fully automated recipe generation from arbitrary ticket descriptions via agent prompts</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #2d3436;">Recipe Persistence</p>
      <p style="margin: 0; font-size: 12px; color: #636e72;">Cross-run recipe reuse via ticket-level storage or recipe retrieval mechanism</p>
    </div>
  </div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px;">
    <div style="flex: 1; min-width: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #2d3436;">Blocking Generation</p>
      <p style="margin: 0; font-size: 12px; color: #636e72;">Elevate from best-effort to blocking once reliability is proven. Configuration change, not architectural.</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #2d3436;">Phase 4 Eval Integration</p>
      <p style="margin: 0; font-size: 12px; color: #636e72;">Extend PxEval tests to validate actual NetSuite record state (currently tests only check terminal status badges)</p>
    </div>
    <div style="flex: 1; min-width: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #2d3436;">Record Graph Generation</p>
      <p style="margin: 0; font-size: 12px; color: #636e72;">Complex multi-record relationship synthesis via ns-gm. Viable but unverified for some evals.</p>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 10: EVIDENCE SOURCES                                  -->
  <!-- ============================================================ -->
  <h2 id="evidence-sources" style="font-size: 26px; color: #2d3436; margin-top: 48px; margin-bottom: 16px;">10. Evidence Sources</h2>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
    <thead>
      <tr style="background: #f1f3f5;">
        <th style="text-align: left; padding: 10px 14px; border-bottom: 2px solid #dee2e6; font-weight: 700;">Source</th>
        <th style="text-align: left; padding: 10px 14px; border-bottom: 2px solid #dee2e6; font-weight: 700;">Artifact / Location</th>
        <th style="text-align: left; padding: 10px 14px; border-bottom: 2px solid #dee2e6; font-weight: 700;">Key Contribution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Ticket description</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">ticket.md lines 1&ndash;62</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Primary problem definition &mdash; canonical examples as proof of comprehension</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">User discussion</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">ticket.md lines 924&ndash;1029</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Recipe concept origin, 4-step loop, repeatability requirement, &ldquo;spike all 13 PxEvals&rdquo;</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Prior run feedback</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">User continuation context</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">&ldquo;Have nothing to do with Play mode. Focus on arbitrary make code modes.&rdquo;</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Tech research</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">tech-research/tech-research.md</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Recipe data model types, all 13 PxEval recipes with before/after tables, technical decisions TD-1&ndash;TD-7</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Product spec</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">product/product.md</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Success criteria, user scenarios SCN-01&ndash;SCN-10, design principles, scope constraints</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Diagnosis</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">diagnosis/diagnosis-statement.md</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Root cause (zero canonical examples in 634 BUILD/FIX/AUTO tickets), existing infrastructure evidence</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Server codebase</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">helix-global-server scout artifacts</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">SandboxRun JSONB columns, HelixWorkflowStepResult type, workflow-step-chain.ts capture pattern, orchestrator.ts persistence</td>
      </tr>
      <tr style="background: #fafbfc;">
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Regression testing</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">helix-regression-testing scout artifacts, eval-catalog.ts</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">13 active PxEvals (7 BUILD, 6 FIX) with detailed ticket descriptions, record types, and expected behaviors</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Prior report</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">reports/RSH-725/report.html (prior run)</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #dee2e6;">Architecture decisions, CanonicalExample/CanonicalExamplesData types (pre-recipe), server/client implementation surface</td>
      </tr>
    </tbody>
  </table>

  <!-- ================================================================ -->
  <!-- FOOTER                                                            -->
  <!-- ================================================================ -->
  <div style="border-top: 2px solid #dee2e6; padding-top: 24px; margin-top: 48px; text-align: center;">
    <p style="font-size: 13px; color: #636e72; margin: 0 0 4px 0;">Generated for ticket <strong>RSH-725</strong> &mdash; Canonical Examples &mdash; Helix NetSuite</p>
    <p style="font-size: 12px; color: #b2bec3; margin: 0;">June 7, 2026 &bull; Recipe-First Design Specification &bull; Feasibility Proven for 13 PxEvals</p>
  </div>

</body>
</html>

## Attachments
- (none)

## Discussion
- **Helix** (2026-06-07T05:48:16.483Z) [Agent]: Interesting question — let me dig into this right away. I'll share my thoughts shortly.
