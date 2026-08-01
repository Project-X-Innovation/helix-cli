# Ticket Context

- ticket_id: cmpybdvoy006mae0u8th5xzly
- short_id: RSH-653
- run_id: cmpybdvr9006rae0uy7h8bn8b
- run_branch: helix/research/RSH-653-playbook-staged-work-mvp-1-flesh-out
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook Staged work - MVP 1 Flesh out

## Description
Flesh out the first level of MVP. 



What are some potential rabbit holes? What are some potential caveats? What are some major decisions that need to be made? How does it bring the most value? How do we get the most value with the least amount of moving parts? What is the question we are exactly trying to answer? How do we exactly answer that question without getting in the way of other things? 



Then flesh out:

- what the UI looks like

- what the tech stack looks like

- what are the relevant flows and agentic flows necessary

## Research Report

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playbook Staged Work: MVP and Follow-Up Staging Plan -- RSH-652</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 960px; margin: 0 auto; padding: 24px; background: #fafbfc;">

  <!-- Title Block -->
  <div style="border-bottom: 3px solid #2d3748; padding-bottom: 20px; margin-bottom: 32px;">
    <h1 id="playbook-staged-work-mvp-and-follow-up-staging" style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px 0;">Playbook Staged Work: MVP and Follow-Up Staging Plan</h1>
    <table style="border-collapse: collapse; width: auto;">
      <tbody>
        <tr>
          <td style="padding: 4px 16px 4px 0; font-weight: 600; color: #4a5568;">Ticket</td>
          <td style="padding: 4px 0;">RSH-652</td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 4px 0; font-weight: 600; color: #4a5568;">Date</td>
          <td style="padding: 4px 0;">June 3, 2026</td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 4px 0; font-weight: 600; color: #4a5568;">Status</td>
          <td style="padding: 4px 0;"><span style="background: #48bb78; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">Final</span></td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 4px 0; font-weight: 600; color: #4a5568;">Repos</td>
          <td style="padding: 4px 0;">library (report output only)</td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 4px 0; font-weight: 600; color: #4a5568;">Referenced Tickets</td>
          <td style="padding: 4px 0;">RSH-411 (Playbook Design Specification)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Table of Contents -->
  <div style="background: #edf2f7; border-radius: 8px; padding: 20px 28px; margin-bottom: 36px;">
    <h2 id="table-of-contents" style="font-size: 18px; margin: 0 0 12px 0; color: #2d3748;">Table of Contents</h2>
    <ol style="margin: 0; padding-left: 20px; columns: 2; column-gap: 32px;">
      <li style="margin-bottom: 4px;"><a href="#executive-summary" style="color: #3182ce; text-decoration: none;">Executive Summary</a></li>
      <li style="margin-bottom: 4px;"><a href="#background-rsh-411-overview" style="color: #3182ce; text-decoration: none;">Background: RSH-411 Overview</a></li>
      <li style="margin-bottom: 4px;"><a href="#the-problem-why-phase-1-needs-re-staging" style="color: #3182ce; text-decoration: none;">The Problem: Why Phase 1 Needs Re-Staging</a></li>
      <li style="margin-bottom: 4px;"><a href="#stakeholder-mvp-vision" style="color: #3182ce; text-decoration: none;">Stakeholder MVP Vision</a></li>
      <li style="margin-bottom: 4px;"><a href="#mvp-stage-1-single-rule-validation-loop" style="color: #3182ce; text-decoration: none;">MVP (Stage 1): Single-Rule Validation Loop</a></li>
      <li style="margin-bottom: 4px;"><a href="#stage-2-activation-layer" style="color: #3182ce; text-decoration: none;">Stage 2: Activation Layer</a></li>
      <li style="margin-bottom: 4px;"><a href="#rsh-411-phase-2-enhanced-monitoring-and-infere" style="color: #3182ce; text-decoration: none;">RSH-411 Phase 2 (Unchanged)</a></li>
      <li style="margin-bottom: 4px;"><a href="#rsh-411-phase-3-real-time-and-advanced-unchang" style="color: #3182ce; text-decoration: none;">RSH-411 Phase 3 (Unchanged)</a></li>
      <li style="margin-bottom: 4px;"><a href="#full-staging-overview" style="color: #3182ce; text-decoration: none;">Full Staging Overview</a></li>
      <li style="margin-bottom: 4px;"><a href="#rationale-for-the-split" style="color: #3182ce; text-decoration: none;">Rationale for the Split</a></li>
      <li style="margin-bottom: 4px;"><a href="#dependency-analysis-and-ordering" style="color: #3182ce; text-decoration: none;">Dependency Analysis &amp; Ordering</a></li>
      <li style="margin-bottom: 4px;"><a href="#mvp-check-vs-stage-2-monitoring" style="color: #3182ce; text-decoration: none;">MVP Check vs. Stage 2 Monitoring</a></li>
      <li style="margin-bottom: 4px;"><a href="#open-questions" style="color: #3182ce; text-decoration: none;">Open Questions</a></li>
      <li style="margin-bottom: 4px;"><a href="#methodology-and-data-sources" style="color: #3182ce; text-decoration: none;">Methodology &amp; Data Sources</a></li>
    </ol>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 1: Executive Summary -->
  <h2 id="executive-summary" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">1. Executive Summary</h2>

  <p>RSH-411 designed the <strong>Playbook</strong> -- a persistent, org-owned business rules layer with inference, monitoring, workflow integration, and comprehensive UI. Its Phase 1 "MVP" bundled <strong>15 components</strong> spanning data model through candidate review UI, mixing two separable concerns: the structural <em>foundation</em> (rules exist as data) and the intelligence <em>activation</em> layer (rules are discovered, enforced, and monitored automatically).</p>

  <p>Stakeholder feedback sharpened the MVP to its essence: <strong>"Write ONE business rule. Helix checks live data. Show examples of where it holds or breaks down."</strong> This frames the MVP around a single-rule validation loop -- not a full registry or intelligence platform, but the smallest experience that proves the concept works and delivers real value.</p>

  <p>This report re-stages RSH-411's Phase 1 into two increments:</p>

  <ul>
    <li><strong>MVP (Stage 1) -- Single-Rule Validation Loop</strong>: 8 components. Write a rule, check it against production data, see results with examples and a technical interpretation. Immediately useful. Ships fast.</li>
    <li><strong>Stage 2 -- Activation Layer</strong>: ~10 components. Auto-discovery from SDF objects, scheduled monitoring, MCP tools, workflow integration, candidate review, and full hierarchy UI. Makes the Playbook intelligent and proactive.</li>
  </ul>

  <p>RSH-411's Phases 2 (enhanced monitoring, conversational interface, GOAL mode) and Phase 3 (real-time events, visual graph, analytics, cross-org templates) remain unchanged. The re-staging only affects Phase 1's internal decomposition.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 2: Background -->
  <h2 id="background-rsh-411-overview" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">2. Background: RSH-411 Overview</h2>

  <p>RSH-411 proposed the Playbook as a new core capability for Helix. The key design decisions:</p>

  <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid #cbd5e0;">
          <th style="text-align: left; padding: 8px 12px; color: #4a5568; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Concept</th>
          <th style="text-align: left; padding: 8px 12px; color: #4a5568; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Design</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 10px 12px; font-weight: 600;">Rule Types</td>
          <td style="padding: 10px 12px;">3 perpetual types: <strong>Constraints</strong> (things that must/must not happen), <strong>Workflows</strong> (how processes should flow), <strong>Monitors</strong> (conditions to watch)</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 10px 12px; font-weight: 600;">Hierarchy</td>
          <td style="padding: 10px 12px;">3-tier via self-referential <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">parentRuleId</code>: Domain &gt; Category &gt; Rule</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 10px 12px; font-weight: 600;">Inference</td>
          <td style="padding: 10px 12px;">Hybrid: SDF metadata extraction + LLM business-intent analysis. Inference-first model -- Helix proposes, users refine.</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 10px 12px; font-weight: 600;">Monitoring</td>
          <td style="padding: 10px 12px;">DB-driven polling with <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">nextRunAt</code>; Helix-inferred cadence; notifications + auto-ticket spawning</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 10px 12px; font-weight: 600;">Identity</td>
          <td style="padding: 10px 12px;">Playbook = "how things ought to be" (prescriptive); Library = "what things are" (descriptive). Distinct pillars.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Data Model</td>
          <td style="padding: 10px 12px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">PlaybookRule</code> + <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">PlaybookRuleTicket</code> + enums. Self-contained, no dependencies on inference or monitoring.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p><strong>RSH-411's original three-phase plan:</strong></p>

  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 180px; background: #ebf8ff; border: 1px solid #90cdf4; border-radius: 8px; padding: 14px 18px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: #2b6cb0;">15</div>
      <div style="font-size: 13px; color: #4a5568; font-weight: 600;">Phase 1 Components</div>
      <div style="font-size: 12px; color: #718096;">"MVP"</div>
    </div>
    <div style="flex: 1; min-width: 180px; background: #fefcbf; border: 1px solid #ecc94b; border-radius: 8px; padding: 14px 18px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: #975a16;">7</div>
      <div style="font-size: 13px; color: #4a5568; font-weight: 600;">Phase 2 Components</div>
      <div style="font-size: 12px; color: #718096;">Enhanced Monitoring</div>
    </div>
    <div style="flex: 1; min-width: 180px; background: #fed7e2; border: 1px solid #fc8181; border-radius: 8px; padding: 14px 18px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: #9b2c2c;">7</div>
      <div style="font-size: 13px; color: #4a5568; font-weight: 600;">Phase 3 Components</div>
      <div style="font-size: 12px; color: #718096;">Real-Time &amp; Advanced</div>
    </div>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 3: The Problem -->
  <h2 id="the-problem-why-phase-1-needs-re-staging" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #e53e3e; padding-left: 12px;">3. The Problem: Why Phase 1 Needs Re-Staging</h2>

  <p>RSH-411's Phase 1 bundles 15 components that mix two fundamentally different concerns. Some components build the <em>structure</em> that makes the Playbook exist as data. Others add the <em>intelligence</em> that makes it proactive. Shipping them together means the MVP is neither small nor fast.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #2d3748; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">RSH-411 Phase 1 Component</th>
        <th style="text-align: center; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Concern</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #f0fff4; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Data model (PlaybookRule + PlaybookRuleTicket + enums + migration)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Foundation</span></td>
      </tr>
      <tr style="background: #f0fff4; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">CRUD service (create, read, update, lifecycle)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Foundation</span></td>
      </tr>
      <tr style="background: #f0fff4; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">HTTP API (controller + routes)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Foundation</span></td>
      </tr>
      <tr style="background: #f0fff4; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Client: types + API hooks</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Foundation</span></td>
      </tr>
      <tr style="background: #f0fff4; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Client: navigation (sidebar)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Foundation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">MCP tools (5 playbook tools)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Monitoring (scheduled polling, 60s interval)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Inference (SDF metadata extraction + LLM analysis)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Workflow integration (rules injected into ticket context)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Scout pre-filtering (relevance scoring per ticket)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Notifications (MONITOR_ALERT + RULE_PROPOSED)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #f0fff4; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Client: routes (/playbook, /playbook/:ruleId, /playbook/new, /playbook/review)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Foundation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Client: hierarchy UI (breadcrumb + tree preview)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Client: review UI (batch candidate review page)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
      <tr style="background: #fff5f5;">
        <td style="padding: 8px 14px;">Client: ticket-detail integration (PlaybookRulesSection)</td>
        <td style="padding: 8px 14px; text-align: center;"><span style="background: #fed7d7; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">Activation</span></td>
      </tr>
    </tbody>
  </table>

  <p>Of the 15 components, roughly <strong>6 are foundation</strong> (structural, must exist for anything else to work) and <strong>9 are activation</strong> (intelligence, integration, and advanced UI that build on the foundation). Shipping all 15 together means the "MVP" is about 2x larger than necessary to prove the core concept.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 4: Stakeholder MVP Vision -->
  <h2 id="stakeholder-mvp-vision" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">4. Stakeholder MVP Vision</h2>

  <blockquote style="border-left: 4px solid #3182ce; background: #ebf8ff; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #2c5282;">
    "You write ONE business rule and Helix will go and check live data and let you know if it's true or not. If it's true, it'll show you examples. If it's wrong, it'll show you examples. [...] That would be my MVP, MVP, MVP."
    <div style="font-style: normal; font-size: 13px; color: #4a5568; margin-top: 8px;">-- Stakeholder (ticket discussion)</div>
  </blockquote>

  <p>The stakeholder further specified what Helix should return for each rule check -- not just pass/fail with examples, but also a <strong>technical interpretation</strong>:</p>

  <blockquote style="border-left: 4px solid #805ad5; background: #faf5ff; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0 0 8px 0;"><strong>Example rule:</strong> "All orders from the website need approval by Steve"</p>
    <p style="margin: 0 0 8px 0;"><strong>Helix interprets:</strong></p>
    <p style="margin: 0; font-style: italic;"><code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">isFromWebsite = true</code> should go to approval by <code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">Employee is "Steve Emerson"</code></p>
    <div style="font-size: 13px; color: #4a5568; margin-top: 8px;">-- Stakeholder (ticket discussion)</div>
  </blockquote>

  <p>This gives the MVP output three parts:</p>

  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 200px; background: white; border: 2px solid #3182ce; border-radius: 8px; padding: 16px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 6px;">1</div>
      <div style="font-weight: 700; color: #2d3748; margin-bottom: 4px;">The Rule</div>
      <div style="font-size: 13px; color: #718096;">As the user wrote it, in plain language</div>
    </div>
    <div style="flex: 1; min-width: 200px; background: white; border: 2px solid #805ad5; border-radius: 8px; padding: 16px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 6px;">2</div>
      <div style="font-weight: 700; color: #2d3748; margin-bottom: 4px;">Helix's Interpretation</div>
      <div style="font-size: 13px; color: #718096;">A technical/functional consultant-level description of what the rule means</div>
    </div>
    <div style="flex: 1; min-width: 200px; background: white; border: 2px solid #38a169; border-radius: 8px; padding: 16px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 6px;">3</div>
      <div style="font-weight: 700; color: #2d3748; margin-bottom: 4px;">Evidence</div>
      <div style="font-size: 13px; color: #718096;">Real examples from live data that confirm or contradict the rule</div>
    </div>
  </div>

  <p>The stakeholder noted the interpretation could be <em>"maybe somewhat hidden so you only have to see it if you want"</em> -- an expandable/collapsible element, not always in your face.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 5: MVP (Stage 1) -->
  <h2 id="mvp-stage-1-single-rule-validation-loop" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #38a169; padding-left: 12px;">5. MVP (Stage 1): Single-Rule Validation Loop</h2>

  <div style="background: #f0fff4; border: 2px solid #9ae6b4; border-radius: 8px; padding: 16px 20px; margin: 0 0 20px 0;">
    <p style="margin: 0; font-weight: 600; color: #276749;">Core value loop: Author a rule (plain language) &rarr; Helix checks against live data &rarr; User sees results (pass/fail + examples) + technical interpretation</p>
  </div>

  <h3 id="mvp-component-table" style="font-size: 17px; color: #2d3748;">Component Table (8 Components)</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #c6f6d5; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #276749; color: white;">
        <th style="text-align: center; padding: 10px 14px; font-size: 13px; width: 32px;">#</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Component</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Scope</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">1</td>
        <td style="padding: 10px 14px; font-weight: 600;">Data model</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">PlaybookRule</code> + <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">PlaybookRuleTicket</code> + enums + Prisma migration. <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">parentRuleId</code> included for future hierarchy but unused in UI.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fafff9;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">2</td>
        <td style="padding: 10px 14px; font-weight: 600;">CRUD service</td>
        <td style="padding: 10px 14px;">Create, read, update, basic lifecycle transitions (DRAFT &rarr; ACTIVE only).</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">3</td>
        <td style="padding: 10px 14px; font-weight: 600;">HTTP API</td>
        <td style="padding: 10px 14px;">Playbook controller + routes registered in <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">api.ts</code>.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fafff9;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">4</td>
        <td style="padding: 10px 14px; font-weight: 600;">Live data check</td>
        <td style="padding: 10px 14px;">On-demand rule validation against production data. User-initiated, single execution. Returns pass/fail + examples + technical interpretation. <strong>No background processor, no scheduled execution.</strong></td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">5</td>
        <td style="padding: 10px 14px; font-weight: 600;">Client: types + API hooks</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">PlaybookRule</code> types in <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">api.ts</code>; TanStack Query hooks in <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">playbook.ts</code>.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fafff9;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">6</td>
        <td style="padding: 10px 14px; font-weight: 600;">Client: basic UI</td>
        <td style="padding: 10px 14px;">Minimal UI to create a rule, trigger a check, and view results. <strong>Flat list</strong> -- no hierarchy navigation, no tree preview, no breadcrumbs. Domain and type visible as metadata.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">7</td>
        <td style="padding: 10px 14px; font-weight: 600;">Client: navigation</td>
        <td style="padding: 10px 14px;">Playbook entry in sidebar navigation, peer to Library.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #276749;">8</td>
        <td style="padding: 10px 14px; font-weight: 600;">Rule authoring</td>
        <td style="padding: 10px 14px;">Create a business rule with name, description, type (Constraint/Workflow/Monitor), and domain assignment.</td>
      </tr>
    </tbody>
  </table>

  <h3 id="what-the-mvp-delivers" style="font-size: 17px; color: #2d3748;">What This Delivers</h3>

  <p>A user can write one business rule in plain language and immediately learn whether it's true in production. The <strong>"wrong examples"</strong> are the most valuable output -- they reveal where the rule breaks down, providing immediate actionable insight even before a full rules library exists. The technical interpretation shows whether Helix understood the rule correctly, surfacing ambiguity upfront.</p>

  <h3 id="what-the-mvp-defers" style="font-size: 17px; color: #2d3748;">What This Defers to Stage 2</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #4a5568; color: white;">
        <th style="text-align: left; padding: 8px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Deferred Feature</th>
        <th style="text-align: left; padding: 8px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Why Deferred</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Inference pipeline</td>
        <td style="padding: 8px 14px;">Requires SDF metadata extraction + LLM analysis; separable from manual rule creation</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f7fafc;">
        <td style="padding: 8px 14px;">Scheduled monitoring processor</td>
        <td style="padding: 8px 14px;">Requires background polling infrastructure; MVP uses on-demand checks only</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Workflow integration</td>
        <td style="padding: 8px 14px;">Depends on having a populated rules library; low value with few rules</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f7fafc;">
        <td style="padding: 8px 14px;">Scout pre-filtering</td>
        <td style="padding: 8px 14px;">Depends on workflow integration</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">MCP tools</td>
        <td style="padding: 8px 14px;">Value requires a populated Playbook; can follow once rules exist</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f7fafc;">
        <td style="padding: 8px 14px;">Candidate review UI</td>
        <td style="padding: 8px 14px;">Depends on inference pipeline producing candidates</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px;">Full hierarchy UI</td>
        <td style="padding: 8px 14px;">MVP works with a flat list; hierarchy becomes valuable at scale</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f7fafc;">
        <td style="padding: 8px 14px;">Notifications</td>
        <td style="padding: 8px 14px;">Depends on monitoring and inference</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px;">Extended lifecycle (SUPERSEDED, ARCHIVED)</td>
        <td style="padding: 8px 14px;">MVP needs DRAFT &rarr; ACTIVE only; extended states follow when rules accumulate</td>
      </tr>
    </tbody>
  </table>

  <h3 id="relationship-to-rsh-411-data-model" style="font-size: 17px; color: #2d3748;">Relationship to RSH-411 Data Model</h3>

  <p>The MVP uses RSH-411's data model as designed (see RSH-411, Section 11). Key scoping decisions:</p>

  <ul>
    <li><strong>Status enum</strong>: Only <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">DRAFT</code> and <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">ACTIVE</code> at MVP. <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">CANDIDATE</code> requires inference (Stage 2). <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">SUPERSEDED</code> and <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">ARCHIVED</code> add management complexity with low value when few rules exist.</li>
    <li><strong>Source enum</strong>: Only <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">USER_CREATED</code> at MVP. <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">INFERRED</code> and <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">TICKET_DISCOVERED</code> require inference.</li>
    <li><strong>parentRuleId</strong>: Included in the model for future hierarchy but unused by the flat-list UI.</li>
    <li><strong>Monitor-specific fields</strong> (monitorFrequency, nextRunAt, lastRunAt): Present in the schema but unused until Stage 2 monitoring.</li>
  </ul>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 6: Stage 2 -->
  <h2 id="stage-2-activation-layer" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #805ad5; padding-left: 12px;">6. Stage 2: Activation Layer</h2>

  <p>Stage 2 makes the Playbook intelligent, integrated, and proactive. It absorbs all remaining RSH-411 Phase 1 components that were deferred from the MVP.</p>

  <div style="background: #faf5ff; border: 2px solid #d6bcfa; border-radius: 8px; padding: 16px 20px; margin: 0 0 20px 0;">
    <p style="margin: 0; font-weight: 600; color: #553c9a;">What this delivers: Auto-discovery of business rules from existing NetSuite customizations. Proactive monitoring with alerts. Tickets automatically receive relevant Playbook context. External agents can query rules via MCP tools.</p>
  </div>

  <h3 id="stage-2-component-table" style="font-size: 17px; color: #2d3748;">Component Table (~10 Components)</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #d6bcfa; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #553c9a; color: white;">
        <th style="text-align: center; padding: 10px 14px; font-size: 13px; width: 32px;">#</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Component</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Scope</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">1</td>
        <td style="padding: 10px 14px; font-weight: 600;">Inference pipeline (basic)</td>
        <td style="padding: 10px 14px;">SDF metadata extraction + LLM business-intent analysis. Full org scan. Candidates surface as <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">CANDIDATE</code> status.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fcfaff;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">2</td>
        <td style="padding: 10px 14px; font-weight: 600;">Candidate review UI</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">/playbook/review</code> route. Batch confirm, refine, or reject inferred candidates.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">3</td>
        <td style="padding: 10px 14px; font-weight: 600;">MCP tools</td>
        <td style="padding: 10px 14px;">5 playbook tools registered in <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">register-tools.ts</code>. External agents can query rules through governed interfaces.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fcfaff;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">4</td>
        <td style="padding: 10px 14px; font-weight: 600;">Monitoring processor</td>
        <td style="padding: 10px 14px;">Scheduled polling at 60s interval, <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">nextRunAt</code>-based execution. Background processor -- not user-initiated.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">5</td>
        <td style="padding: 10px 14px; font-weight: 600;">Workflow integration</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">playbookRulesMarkdown</code> injected into <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">buildTicketArtifactMarkdown()</code>. Tickets automatically receive relevant Playbook context.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fcfaff;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">6</td>
        <td style="padding: 10px 14px; font-weight: 600;">Scout pre-filtering</td>
        <td style="padding: 10px 14px;">Relevance scoring + top-N rule selection per ticket. Ensures only applicable rules are injected.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">7</td>
        <td style="padding: 10px 14px; font-weight: 600;">Notifications</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">MONITOR_ALERT</code> + <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">RULE_PROPOSED</code> notification types. Proactive alerts when violations are detected.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fcfaff;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">8</td>
        <td style="padding: 10px 14px; font-weight: 600;">Client: ticket-detail integration</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">PlaybookRulesSection</code> in ticket-detail page. Shows applicable Playbook rules in ticket context.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">9</td>
        <td style="padding: 10px 14px; font-weight: 600;">Full hierarchy UI</td>
        <td style="padding: 10px 14px;">Breadcrumb navigation + tree preview. Domain &gt; Category &gt; Rule browsing with visual hierarchy.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #553c9a;">10</td>
        <td style="padding: 10px 14px; font-weight: 600;">Extended lifecycle</td>
        <td style="padding: 10px 14px;"><code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">CANDIDATE</code>, <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">SUPERSEDED</code>, <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">ARCHIVED</code> states + full lifecycle transitions.</td>
      </tr>
    </tbody>
  </table>

  <h3 id="stage-2-dependencies-on-mvp" style="font-size: 17px; color: #2d3748;">Dependencies on MVP</h3>

  <p>Every Stage 2 component depends on the MVP foundation:</p>
  <ul>
    <li><strong>Inference</strong> needs the CRUD service layer to persist discovered candidates</li>
    <li><strong>Monitoring</strong> needs the data model (<code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">nextRunAt</code> fields) and service layer to execute checks</li>
    <li><strong>Workflow integration</strong> needs rules to exist before they can be injected as ticket context</li>
    <li><strong>MCP tools</strong> need the service layer to expose operations</li>
    <li><strong>Candidate review</strong> needs inference to produce candidates</li>
    <li><strong>Notifications</strong> need monitoring to fire alerts and inference to propose rules</li>
    <li><strong>Hierarchy UI</strong> needs the data model's <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">parentRuleId</code> populated with real rules</li>
    <li><strong>Extended lifecycle</strong> needs enough rules to make SUPERSEDED/ARCHIVED meaningful</li>
  </ul>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 7: RSH-411 Phase 2 -->
  <h2 id="rsh-411-phase-2-enhanced-monitoring-and-infere" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #d69e2e; padding-left: 12px;">7. RSH-411 Phase 2: Enhanced Monitoring &amp; Inference <span style="background: #fefcbf; color: #975a16; padding: 2px 10px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-left: 8px;">Unchanged from RSH-411</span></h2>

  <p>The following phase is preserved exactly as specified in RSH-411 (Section 25, Phase 2). The re-staging of Phase 1 does not affect subsequent phases.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #ecc94b; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #975a16; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Component</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Scope</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px; font-weight: 600;">On-change polling</td>
        <td style="padding: 8px 14px;">Short-interval (5-15 min) NS record change detection</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 8px 14px; font-weight: 600;">Incremental inference</td>
        <td style="padding: 8px 14px;">Re-run when SDF objects change</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px; font-weight: 600;">Conversational interface</td>
        <td style="padding: 8px 14px;">Chat panel on Playbook page</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 8px 14px; font-weight: 600;">GOAL ticket mode</td>
        <td style="padding: 8px 14px;">Goal decomposition into rules + child tickets</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px; font-weight: 600;">Auto-ticket spawning</td>
        <td style="padding: 8px 14px;">Full guardrails: dedup, cooldown, severity thresholds, rate limits</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 8px 14px; font-weight: 600;">Report-viewer integration</td>
        <td style="padding: 8px 14px;">"Proposed Rules" section for research reports</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; font-weight: 600;">Persistent chat history</td>
        <td style="padding: 8px 14px;">Conversation storage beyond session</td>
      </tr>
    </tbody>
  </table>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 8: RSH-411 Phase 3 -->
  <h2 id="rsh-411-phase-3-real-time-and-advanced-unchang" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #e53e3e; padding-left: 12px;">8. RSH-411 Phase 3: Real-Time &amp; Advanced <span style="background: #fed7e2; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-left: 8px;">Unchanged from RSH-411</span></h2>

  <p>The following phase is preserved exactly as specified in RSH-411 (Section 25, Phase 3). The re-staging of Phase 1 does not affect subsequent phases.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #fc8181; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #9b2c2c; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Component</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Scope</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px; font-weight: 600;">Real-time event monitoring</td>
        <td style="padding: 8px 14px;">NS user event scripts calling Helix webhook</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fff5f5;">
        <td style="padding: 8px 14px; font-weight: 600;">Streaming chat responses</td>
        <td style="padding: 8px 14px;">SSE/WebSocket for conversational interface</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px; font-weight: 600;">Visual rule graph</td>
        <td style="padding: 8px 14px;">D3/force-directed visualization of rule relationships</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fff5f5;">
        <td style="padding: 8px 14px; font-weight: 600;">Rule analytics</td>
        <td style="padding: 8px 14px;">Trigger frequency, refinement history, coverage gaps</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 14px; font-weight: 600;">Rule conflict detection</td>
        <td style="padding: 8px 14px;">Identify and resolve contradictory rules</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fff5f5;">
        <td style="padding: 8px 14px; font-weight: 600;">Cross-org rule templates</td>
        <td style="padding: 8px 14px;">Common NetSuite patterns shared across organizations</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; font-weight: 600;">Drag-and-drop hierarchy</td>
        <td style="padding: 8px 14px;">Visual hierarchy management with @dnd-kit/react</td>
      </tr>
    </tbody>
  </table>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 9: Full Staging Overview -->
  <h2 id="full-staging-overview" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">9. Full Staging Overview</h2>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #2d3748; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Stage</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Name</th>
        <th style="text-align: center; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Components</th>
        <th style="text-align: center; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Cumulative</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Value Delivered</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f0fff4;">
        <td style="padding: 10px 14px;"><span style="background: #c6f6d5; color: #276749; padding: 2px 10px; border-radius: 10px; font-size: 13px; font-weight: 700;">MVP</span></td>
        <td style="padding: 10px 14px; font-weight: 600;">Single-Rule Validation Loop</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">8</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">8</td>
        <td style="padding: 10px 14px;">Write a rule, check it, see results + examples</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #faf5ff;">
        <td style="padding: 10px 14px;"><span style="background: #e9d8fd; color: #553c9a; padding: 2px 10px; border-radius: 10px; font-size: 13px; font-weight: 700;">Stage 2</span></td>
        <td style="padding: 10px 14px; font-weight: 600;">Activation Layer</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">10</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">18</td>
        <td style="padding: 10px 14px;">Auto-discovery, monitoring, MCP, workflow integration</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 10px 14px;"><span style="background: #fefcbf; color: #975a16; padding: 2px 10px; border-radius: 10px; font-size: 13px; font-weight: 700;">Phase 2</span></td>
        <td style="padding: 10px 14px; font-weight: 600;">Enhanced Monitoring &amp; Inference</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">7</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">25</td>
        <td style="padding: 10px 14px;">Conversational UI, GOAL mode, auto-ticket spawning</td>
      </tr>
      <tr style="background: #fff5f5;">
        <td style="padding: 10px 14px;"><span style="background: #fed7e2; color: #9b2c2c; padding: 2px 10px; border-radius: 10px; font-size: 13px; font-weight: 700;">Phase 3</span></td>
        <td style="padding: 10px 14px; font-weight: 600;">Real-Time &amp; Advanced</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">7</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; font-size: 18px;">32</td>
        <td style="padding: 10px 14px;">Visual graph, analytics, conflict detection, cross-org templates</td>
      </tr>
    </tbody>
  </table>

  <p>The original RSH-411 plan had 15 + 7 + 7 = <strong>29 total components</strong>. The re-staged plan has 8 + 10 + 7 + 7 = <strong>32 total components</strong> -- the additional 3 come from the more granular decomposition in Stage 2 (separating extended lifecycle, full hierarchy UI, and ticket-detail integration as distinct components rather than folding them into broader entries).</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 10: Rationale -->
  <h2 id="rationale-for-the-split" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">10. Rationale for the Split</h2>

  <h3 id="foundation-vs-activation" style="font-size: 17px; color: #2d3748;">Foundation vs. Activation</h3>

  <p>The split follows a single organizing principle: <strong>the structural layer that makes the Playbook exist</strong> (foundation) vs. <strong>the intelligence layer that makes it proactive</strong> (activation).</p>

  <div style="display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0;">
    <div style="flex: 1; min-width: 250px; background: #f0fff4; border: 2px solid #9ae6b4; border-radius: 8px; padding: 18px;">
      <h4 style="margin: 0 0 8px 0; color: #276749;">Foundation (MVP)</h4>
      <p style="margin: 0; font-size: 14px; color: #4a5568;">Data exists. CRUD works. UI browses. Users create rules and check them against reality. The Playbook is a tool you actively use.</p>
    </div>
    <div style="flex: 1; min-width: 250px; background: #faf5ff; border: 2px solid #d6bcfa; border-radius: 8px; padding: 18px;">
      <h4 style="margin: 0 0 8px 0; color: #553c9a;">Activation (Stage 2)</h4>
      <p style="margin: 0; font-size: 14px; color: #4a5568;">Rules are auto-discovered. Monitoring runs continuously. Tickets receive Playbook context automatically. The Playbook works for you even when you're not looking.</p>
    </div>
  </div>

  <h3 id="each-stage-independently-valuable" style="font-size: 17px; color: #2d3748;">Each Stage Is Independently Valuable</h3>

  <ul>
    <li><strong>MVP alone</strong>: A user can write "Purchase orders over $10K require manager approval," hit check, and learn whether it's actually true in production -- right now, with real data. That's useful even with zero other rules, zero automation, zero monitoring. The "wrong examples" immediately reveal business process gaps.</li>
    <li><strong>Stage 2 builds on MVP</strong>: Once foundation rules exist, Stage 2 makes them self-sustaining. Helix discovers rules you didn't know about, monitors them continuously, and injects them into every ticket. You go from "I check when I remember" to "the Playbook watches everything, always."</li>
  </ul>

  <h3 id="manual-before-automatic" style="font-size: 17px; color: #2d3748;">Manual Before Automatic</h3>

  <p>Users manually create and check rules before any automation exists. This is deliberate: it builds trust in the system, validates the data model, and ensures the core value loop works before adding complexity. If the one-rule check doesn't feel useful, no amount of inference or monitoring will save it.</p>

  <h3 id="value-loop-first" style="font-size: 17px; color: #2d3748;">Value Loop First</h3>

  <p>The MVP is defined by the smallest experience that completes a full value loop: <strong>rule in, evidence out</strong>. Not by the number of features, not by architectural completeness, but by whether a user walks away knowing something they didn't know before.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 11: Dependency Analysis -->
  <h2 id="dependency-analysis-and-ordering" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">11. Dependency Analysis &amp; Ordering</h2>

  <h3 id="within-mvp" style="font-size: 17px; color: #2d3748;">Within MVP (Build Order)</h3>

  <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0; font-family: 'Courier New', monospace; font-size: 14px; line-height: 2;">
    Data model &rarr; CRUD service &rarr; HTTP API &rarr; Live data check &rarr; Client types + hooks &rarr; Client basic UI + navigation
  </div>

  <p>Each layer depends on the one before it. The data model is the foundation; everything else builds upward.</p>

  <h3 id="stage-2-on-mvp" style="font-size: 17px; color: #2d3748;">Stage 2 on MVP</h3>

  <ul>
    <li><strong>Inference</strong> &rarr; needs CRUD service to persist candidates</li>
    <li><strong>Candidate review</strong> &rarr; needs inference to produce candidates</li>
    <li><strong>Monitoring</strong> &rarr; needs data model + service for execution</li>
    <li><strong>Notifications</strong> &rarr; needs monitoring + inference</li>
    <li><strong>Workflow integration</strong> &rarr; needs rules to exist</li>
    <li><strong>Scout pre-filtering</strong> &rarr; needs workflow integration</li>
    <li><strong>MCP tools</strong> &rarr; needs service layer</li>
    <li><strong>Hierarchy UI</strong> &rarr; needs populated rules with parent relationships</li>
    <li><strong>Ticket-detail integration</strong> &rarr; needs workflow integration</li>
    <li><strong>Extended lifecycle</strong> &rarr; needs candidate status (inference) + enough rules for supersede/archive</li>
  </ul>

  <h3 id="cross-stage-dependencies" style="font-size: 17px; color: #2d3748;">Cross-Stage Dependencies</h3>

  <p><strong>No backward dependencies.</strong> Stage 2 adds to the MVP; it does not modify it. The MVP's data model, service layer, API, and UI remain intact. Stage 2 extends them with new processors, tools, and UI components.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 12: Check vs. Monitoring -->
  <h2 id="mvp-check-vs-stage-2-monitoring" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #e53e3e; padding-left: 12px;">12. MVP Check vs. Stage 2 Monitoring</h2>

  <div style="background: #fff5f5; border: 2px solid #fc8181; border-radius: 8px; padding: 16px 20px; margin: 0 0 20px 0;">
    <p style="margin: 0; font-weight: 600; color: #9b2c2c;">This distinction is critical. Conflating these two creates scope creep where the MVP inherits the monitoring processor's complexity.</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #2d3748; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Dimension</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; background: #276749;">MVP: On-Demand Check</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; background: #553c9a;">Stage 2: Scheduled Monitoring</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Trigger</td>
        <td style="padding: 10px 14px; background: #f0fff4;">User-initiated (click a button)</td>
        <td style="padding: 10px 14px; background: #faf5ff;">Scheduled (60s polling interval)</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Execution</td>
        <td style="padding: 10px 14px; background: #f0fff4;">Single execution, returns immediately</td>
        <td style="padding: 10px 14px; background: #faf5ff;">Continuous, runs in background</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Infrastructure</td>
        <td style="padding: 10px 14px; background: #f0fff4;">Synchronous API call, no background processor</td>
        <td style="padding: 10px 14px; background: #faf5ff;">Background processor (<code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">setInterval</code>-based, <code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">nextRunAt</code> tracking)</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Results</td>
        <td style="padding: 10px 14px; background: #f0fff4;">Returned to user in the response</td>
        <td style="padding: 10px 14px; background: #faf5ff;">Stored, fire notifications, can auto-spawn tickets</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: 600;">Persistence</td>
        <td style="padding: 10px 14px; background: #f0fff4;">No state tracking between checks</td>
        <td style="padding: 10px 14px; background: #faf5ff;">Tracks <code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">lastRunAt</code>, <code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">nextRunAt</code>, <code style="background: #e9d8fd; padding: 2px 6px; border-radius: 4px;">monitorFrequency</code></td>
      </tr>
    </tbody>
  </table>

  <p>The MVP's live data check reuses existing server infrastructure (NetSuite REST API calls, SuiteQL queries) and adds LLM-mediated query generation. It does <strong>not</strong> require the full monitoring processor. The check is user-initiated and on-demand -- you push a button and get a result.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 13: Open Questions -->
  <h2 id="open-questions" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #d69e2e; padding-left: 12px;">13. Open Questions</h2>

  <p>The following questions were raised during stakeholder discussion and product analysis. They should be resolved during implementation ticket planning.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #ecc94b; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #975a16; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Question</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Context</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">What counts as a "rule" at MVP?</td>
        <td style="padding: 10px 14px;">Is it a natural language statement, a structured format, or something in between? Affects how Helix parses it for live data checks. <em>(Raised in ticket discussion.)</em></td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 10px 14px; font-weight: 600;">What is the live data source?</td>
        <td style="padding: 10px 14px;">Is Helix querying the database, NetSuite APIs, SDF objects, or something else? The data source determines what types of rules are checkable at MVP. <em>(Raised in ticket discussion.)</em></td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">What triggers the check?</td>
        <td style="padding: 10px 14px;">MVP assumes on-demand (user-initiated). Is there a need for automatic periodic checks even at MVP? <em>(Raised in ticket discussion.)</em></td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 10px 14px; font-weight: 600;">How do "examples" surface?</td>
        <td style="padding: 10px 14px;">What format do pass/fail examples take? Raw records, summarized descriptions, links to NS records? Affects client UI complexity at MVP.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Can the MVP work without full hierarchy?</td>
        <td style="padding: 10px 14px;">The stakeholder's "one rule" framing suggests hierarchy can be deferred until rules accumulate. This report recommends flat list at MVP with data model hierarchy support for later.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #fffff0;">
        <td style="padding: 10px 14px; font-weight: 600;">GENERAL vs NETSUITE platform treatment</td>
        <td style="padding: 10px 14px;">The inference pipeline is NetSuite-specific. Do GENERAL orgs get a different MVP experience? RSH-411 recommends manual-only for GENERAL orgs.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: 600;">Inference accuracy</td>
        <td style="padding: 10px 14px;">Mining SDF objects for business intent will produce false positives. Stage 2 should start with high-confidence signals and flag low-confidence candidates clearly.</td>
      </tr>
    </tbody>
  </table>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Section 14: Methodology -->
  <h2 id="methodology-and-data-sources" style="font-size: 22px; color: #1a1a2e; border-left: 4px solid #3182ce; padding-left: 12px;">14. Methodology &amp; Data Sources</h2>

  <p>This report was produced by analyzing the RSH-411 design specification, stakeholder discussion, and existing codebase patterns to identify a natural decomposition of Phase 1 into independently valuable stages.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #2d3748; color: white;">
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Source</th>
        <th style="text-align: left; padding: 10px 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Evidence Used</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">RSH-411 Report</td>
        <td style="padding: 10px 14px;">1460+ line design specification. Phase 1 component table (Section 25), data model (Section 11), monitoring system (Section 12), inference pipeline (Section 9), hierarchy model (Section 14), rule lifecycle (Section 19), integration maps (Sections 22-23).</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f7fafc;">
        <td style="padding: 10px 14px; font-weight: 600;">Stakeholder Discussion</td>
        <td style="padding: 10px 14px;">RSH-652 ticket discussion. MVP framing: "write ONE rule, check live data, get examples." Technical interpretation example. MVP, MVP, MVP directive. Stage 2 Order Approval Flow concept.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Server Codebase</td>
        <td style="padding: 10px 14px;">helix-global-server: Prisma schema (zero PlaybookRule tables), API route patterns, service layer patterns, background processor patterns. Confirms greenfield implementation and established patterns.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f7fafc;">
        <td style="padding: 10px 14px; font-weight: 600;">Client Codebase</td>
        <td style="padding: 10px 14px;">helix-global-client: React Router v7 routing, TanStack Query hooks, existing Library UI as nearest neighbor. Confirms UI patterns for extension.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600;">Product Specification</td>
        <td style="padding: 10px 14px;">RSH-652 product spec: 8 essential MVP features, success criteria (max 8 components), out-of-scope features table, user scenarios.</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: 600;">Existing Report Format</td>
        <td style="padding: 10px 14px;">RSH-411 and RSH-599 reports in library/reports/: title block, Table of Contents, numbered sections, component tables.</td>
      </tr>
    </tbody>
  </table>

  <h3 id="staging-derivation-process" style="font-size: 17px; color: #2d3748;">How the Staging Was Derived</h3>

  <ol>
    <li><strong>Cataloged</strong> all 15 RSH-411 Phase 1 components with their dependencies</li>
    <li><strong>Classified</strong> each as "foundation" (must exist for anything) or "activation" (requires foundation + adds intelligence)</li>
    <li><strong>Validated</strong> the MVP scope against the stakeholder's "one rule + check + examples" directive</li>
    <li><strong>Confirmed</strong> the live data check belongs in MVP (not CRUD-only) per stakeholder requirement</li>
    <li><strong>Verified</strong> no backward dependencies exist from Stage 2 to MVP</li>
    <li><strong>Preserved</strong> Phases 2 and 3 unchanged as they don't overlap with Phase 1 re-staging</li>
  </ol>

  <p>For full technical specifications of individual components (data model schema, API endpoint contracts, UI component designs), see <strong>RSH-411</strong>. This report defines scope boundaries and staging rationale; RSH-411 provides the implementation-ready detail.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 36px 0;">

  <!-- Footer -->
  <div style="text-align: center; color: #a0aec0; font-size: 13px; padding: 20px 0; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0;">RSH-652 &middot; Playbook Staged Work &middot; June 2026</p>
    <p style="margin: 4px 0 0 0;">For technical specifications, see <strong>RSH-411: Adding a Business Rules Layer and Reframing for the Agentic Future</strong></p>
  </div>

</body>
</html>

## Attachments
- (none)
