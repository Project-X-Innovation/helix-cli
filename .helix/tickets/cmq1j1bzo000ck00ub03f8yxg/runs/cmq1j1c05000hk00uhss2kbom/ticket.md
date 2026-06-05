# Ticket Context

- ticket_id: cmq1j1bzo000ck00ub03f8yxg
- short_id: RSH-702
- run_id: cmq1j1c05000hk00uhss2kbom
- run_branch: helix/research/RSH-702-netsuite-tool-mode-reversibility-tiers-production
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
NetSuite Tool mode: reversibility tiers + production dry-run preview (feasibility report)

## Description
# Report: NetSuite "Tool" mode — governed, reversible, previewable automations

## Summary

Research and assess the feasibility of a new Helix **Tool** mode (a fourth mode alongside Build, Fix, Report) for NetSuite. A Tool ticket produces a runnable, governed NetSuite operation; Helix provides the spine around it: **preview, monitoring/audit, and rollback**. The long-term arc is: arbitrary execution → reusable tools → triggered automations. This report must validate the NetSuite-specific mechanics that make this safe — above all (a) the reversibility tiering model and (b) production dry-run previews.

## Context / Concept (decided in discussion — do not re-litigate)

- Helix is the **framework**, not the tool author. Users mint arbitrary tools. This is a **NetSuite product** — NetSuite-centric, not NetSuite-exclusive (a tool's irreversible "leaves" may touch third parties).
- **Maturity ladder:** Rung 0 arbitrary execute (human approves each run) → Rung 1 named, parameterized tool (invoked by a human or an MCP) → Rung 2 triggered tool (no human at runtime). Every rung must remain previewable, auditable, and rollback-able. Design every tool so a trigger (cron/event) could call it.
- As the human leaves the loop: **preview** becomes a guardrail/circuit-breaker (auto-proceed only within approved bounds, else escalate); **approval** migrates from per-run to design-time policy + exception escalation; **audit and rollback** become more load-bearing, not less.
- **Reversibility tiering = the autonomy-authorization rule. A tool's tier is its worst action.**
  - **Tier 1 — Atomic inverse:** known action↔inverse pairs in a curated, growing library (e.g., post bill ↔ void bill). A tool composed entirely of Tier-1 actions is auto-invertible by replaying inverses in **reverse order** (requires an ordered forward log). May run fully autonomously.
  - **Tier 2 — Derived inverse:** Helix captures the before-state, synthesizes a compensating recipe, and validates it once in sandbox. Climbs the ladder on a leash: fresh before-image per run + optimistic-concurrency check; escalate on drift. Stable Tier-2 inverses get **promoted** into the Tier-1 library (the flywheel / moat).
  - **Tier 3 — No inverse** (third-party post, email, payment capture): monitor-only; optional best-effort compensation (refund/correction) that is not a true inverse. Must not run fully autonomously without explicit human-set bounds.
- The risk gate is a function of **two separate axes**: reversibility tier AND blast radius/magnitude.
- **Governed channel:** tools touch NetSuite only through a single instrumented gateway (NS-GM) that captures before-images, logs every write (audit), and enables generic rollback. The channel provides baseline governance for free; a tool may *optionally* enrich it with a semantic inverse/plan. The framework must never depend on the author for the invariants to exist.
- **Preview is two jobs at two times:**
  - **Sandbox = design-time validation** — proves the machine works (logic, API access, shape-in→shape-out, inverse correctness). Stale sandbox data is acceptable here.
  - **Production dry-run = run-time preview** — shows the specific effect on live data. Sandbox cannot do this (sandbox data is stale).
- **Required preview fidelity scales with reversibility tier** — Tier 3 needs the most faithful preview because there is no undo.

## Open Questions To Research (the purpose of this report)

1. **Production dry-run mechanisms in NetSuite and their fidelity/limits:**
   - Projection (build the record, do not save) — what is and is not computed before save (taxes, sourced fields, totals, GL impact, user-event scripts).
   - Quarantined real save (non-posting / draft status → promote-or-delete). **Which record and transaction types support a safe non-posting/draft state** usable for this? Note this technique also collapses the preview↔apply drift gap, because the previewed record becomes the committed record.
   - Native preview records (estimate→order, quote→invoice) and their coverage.
   - Calculation/validation endpoints (tax, pricing, approval routing) usable to enrich a projection.
   - Confirm whether NetSuite exposes any user-level transaction rollback primitive (BEGIN…ROLLBACK). If not, document why per-record-type cleverness is required.
2. **Atomic-inverse library (first cut):** enumerate candidate Tier-1 action↔inverse pairs for common NetSuite records and transactions. Mark which are clean, which require before-image restore, and which carry hidden side effects (user-event scripts, GL postings, document numbering).
3. **Governed-channel completeness:** identify every path a tool could mutate NetSuite that bypasses NS-GM — especially SuiteScript/SDF deployed *into* NetSuite that then runs autonomously outside the channel. Assess how containable the chokepoint is and what leaks.
4. **Tier-2 derived-inverse safety:** concurrency/drift between the write and the undo; coverage limits of one-time sandbox validation; recommended guards.
5. **Idempotency / double-submit:** how to prevent a tool run from double-applying (e.g., not double-posting a bill) on retry or double-click.
6. **Reuse audit:** what EXECUTE mode and NS-GM do today, and what of the above already exists versus must be built. Note adjacency to **BLD-634** (direct production create/deploy with explicit approval).

## What The Report Must Produce

- An assessment of each production-dry-run mechanism with the concrete NetSuite record/transaction types it works for and where it fails.
- A first-cut atomic-inverse library table for NetSuite.
- A recommendation on how faithful Tier-3 production preview can realistically be, and the fallback when no high-fidelity dry-run exists.
- A clear statement of the governed channel's containment limits.
- Identification of reusable existing code (EXECUTE mode, NS-GM) versus net-new work.

## Out of Scope

- Implementation. This is a research/report ticket only.
- Multi-substrate / non-NetSuite adapters.
- Detailed UI/UX design of the tool registry and approval surfaces.

## Referenced Tickets

1 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### BLD-634: Allow direct deploy/creation in production with explicit approval
- Mode: BUILD | Status: PREVIEW_READY
- Completed runs: 2 (run-1, run-2)
- Materialized files: 56 artifacts
- Path: `.helix-refs/BLD-634/`
- Manifest: `.helix-refs/BLD-634/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
