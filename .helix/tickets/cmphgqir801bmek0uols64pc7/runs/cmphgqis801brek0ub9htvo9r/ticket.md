# Ticket Context

- ticket_id: cmphgqir801bmek0uols64pc7
- short_id: FIX-576
- run_id: cmphgqis801brek0ub9htvo9r
- run_branch: helix/fix/FIX-576-demo-final-run
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Demo Final Run

## Description
See the previous chain of tickets 

#FIX-557 

#FIX-559 

#FIX-554 

#FIX-553 

#FIX-555 



Review the report. Make sure nothing is missing and that demos work perfectly in all cases they should (Build/Fix)

## Referenced Tickets

5 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### FIX-553: Remove verification_broken outcome and add orchestrator consistency guard
- Mode: FIX | Status: STAGING_MERGED
- Completed runs: 1 (run-1)
- Materialized files: 15 artifacts
- Path: `.helix-refs/FIX-553/`
- Manifest: `.helix-refs/FIX-553/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### FIX-554: Restrict platform_deferred to NetSuite UI scenarios only (temporary)
- Mode: FIX | Status: STAGING_MERGED
- Completed runs: 1 (run-1)
- Materialized files: 15 artifacts
- Path: `.helix-refs/FIX-554/`
- Manifest: `.helix-refs/FIX-554/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### FIX-555: Add demo step to RESEARCH and SANDBOX_DEPLOY exclusion sets
- Mode: FIX | Status: STAGING_MERGED
- Completed runs: 1 (run-1)
- Materialized files: 15 artifacts
- Path: `.helix-refs/FIX-555/`
- Manifest: `.helix-refs/FIX-555/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### FIX-557: Client UI: demo viewer placement, ArtifactViewer error boundary, verification_broken removal, platform_deferred display
- Mode: FIX | Status: STAGING_MERGED
- Completed runs: 1 (run-1)
- Materialized files: 13 artifacts
- Path: `.helix-refs/FIX-557/`
- Manifest: `.helix-refs/FIX-557/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

### FIX-559: Implement universal demo step failure fix (per RSH-558 findings)
- Mode: FIX | Status: STAGING_MERGED
- Completed runs: 1 (run-1)
- Materialized files: 15 artifacts
- Path: `.helix-refs/FIX-559/`
- Manifest: `.helix-refs/FIX-559/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Research Report

# Research Report: Demo & Verification Problems

**Ticket**: RSH-550
**Date**: 2026-05-21
**Status**: Ready for Implementation
**Repos**: helix-global-server, helix-global-client
**Referenced Ticket**: BLD-535 (Reports In HTML)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Inventory](#2-problem-inventory)
3. [Issue Analysis](#3-issue-analysis)
   - [3.1 Demo Content Never Persisted](#31-demo-content-never-persisted)
   - [3.2 Demo Viewer Mispositioned](#32-demo-viewer-mispositioned)
   - [3.3 Verification Broken Crash](#33-verification-broken-crash)
   - [3.4 verification_broken Outcome Still Active](#34-verification_broken-outcome-still-active)
   - [3.5 platform_deferred Not Restricted](#35-platform_deferred-not-restricted)
   - [3.6 Status/Outcome Data Inconsistency](#36-statusoutcome-data-inconsistency)
4. [Cross-Cutting Analysis](#4-cross-cutting-analysis)
5. [Recommended Implementation Tickets](#5-recommended-implementation-tickets)
6. [Risk Assessment](#6-risk-assessment)
7. [Deferred Investigations](#7-deferred-investigations)
8. [Evidence Summary](#8-evidence-summary)
9. [Methodology & Data Sources](#9-methodology--data-sources)

---

## 1. Executive Summary

RSH-550 was opened after multiple user-reported problems surfaced on ticket BLD-535: no demo content appears anywhere, the demo viewer is buried in an unprominent position, clicking "verification broken" crashes the UI, the verification_broken outcome persists despite product intent to remove it, and platform_deferred is used far too broadly.

Investigation revealed **6 distinct but interrelated issues** spanning 2 repositories (helix-global-server and helix-global-client). These are not isolated bugs -- they represent systemic gaps in the verification and demo pipeline: missing dependency management between workflow steps, outcome definitions that do not match product intent, enforcement gaps where prose guidance replaces code enforcement, and data consistency violations between run statuses and verification outcomes.

### Key Findings

| # | Issue | Severity | Repos | Production Impact |
|---|-------|----------|-------|-------------------|
| 3.1 | Demo content never persisted | **High** | server | 0/603 runs in 30 days have demoContent -- complete feature failure |
| 3.2 | Demo viewer mispositioned | Medium | client | Demo viewer renders after "Continue with Claude Code" instead of before |
| 3.3 | Verification broken crash | **High** | client | Clicking verification details on affected runs crashes the UI |
| 3.4 | verification_broken still active | **High** | server, client | 52 runs in 30 days use a deprecated outcome; it remains the system's default fallback |
| 3.5 | platform_deferred unrestricted | **High** | server, client | 80% of platform_deferred usage is on GENERAL platform (not NetSuite) |
| 3.6 | Status/outcome inconsistency | **High** | server | 9 inconsistent records (active bug, most recent: May 20, 2026) |

### Systemic Observation

These issues share common root patterns:
- **Silent failure**: The demo step runs without its prerequisite and fails silently (nonBlocking=true).
- **Outcome definition drift**: verification_broken was intended to be removed but remains a first-class outcome across server config, workflow logic, client types, and UI rendering.
- **Enforcement gaps**: platform_deferred has prose guidance but no code enforcement -- 80% of production usage is on the wrong platform.
- **Consistency violations**: Run statuses and verification outcomes are set in separate code paths without atomic consistency checks.

### Recommended Resolution Path

4 implementation tickets (plus 1 follow-up investigation), ordered with server-side foundational changes first, then coordinated client-side updates. All 6 issues are covered. Server tickets can execute in parallel; the client ticket coordinates with server-side verification_broken removal but handles the transitional period through a widened type union.

---

## 2. Problem Inventory

The user reported 4 problems in the ticket description. Investigation confirmed all 4 and uncovered 2 additional systemic issues:

| # | User-Reported Problem | Confirmed Issue | Additional Findings |
|---|----------------------|-----------------|---------------------|
| 1 | "There is no demo" | 3.1: Demo content never persisted | Affects ALL modes, not just RESEARCH -- 0/603 runs across BUILD, FIX, AUTO, RESEARCH |
| 2 | "Demo viewer in the old place" | 3.2: Demo viewer mispositioned | Renders after "Continue with Claude Code" section |
| 3 | "Clicking verification broken crashes" | 3.3: Crash on verification_broken runs | Caused by ArtifactViewer opening for runs with potentially malformed artifacts |
| 4 | "No more verification broken" | 3.4: verification_broken still active | Still defined, still the system fallback, 52 occurrences in 30 days |
| -- | User noted "platform deferred" concerns | 3.5: platform_deferred unrestricted | 80% usage on GENERAL platform; prose-only restriction |
| -- | Discovered during investigation | 3.6: Status/outcome data inconsistency | 9 records with impossible status/outcome combinations |

---

## 3. Issue Analysis

### 3.1 Demo Content Never Persisted

**Symptoms**: No demo content appears for any ticket in any mode. Users see nothing in the demo viewer section. The DemoViewer component's visibility gate (`ticket-detail.tsx:1502-1505`) always hides the section because no runs have `demoContent` populated.

**Root Cause**: The demo step depends on `/tmp/preview-config.json` written by the preview-config step (step 9 in the workflow). This dependency chain is broken in two ways:

1. **Exclusion gap (RESEARCH and NetSuite modes)**: The preview-config step is excluded for RESEARCH mode (`step-selection.ts:8`) and sandboxDeploy/NetSuite platforms (`step-selection.ts:15`), but the demo step is NOT excluded alongside it. The demo step runs, attempts to read the missing file, and fails silently because `nonBlocking=true` (`helix-workflow-step-catalog.ts:95`).

2. **Universal failure (all modes)**: Even for BUILD/FIX/AUTO on non-NetSuite platforms where preview-config runs successfully, demoContent is universally empty. This indicates the demo step agent itself has issues beyond the missing dependency.

**Production Evidence**:

| Mode | Total Runs (30d) | Runs with demoContent |
|------|-----------------|----------------------|
| RESEARCH | 216 | 0 |
| BUILD | 146 | 0 |
| AUTO | 124 | 0 |
| FIX | 117 | 0 |
| **Total** | **603** | **0** |

*Source: Production DB query, May 21, 2026*

**Affected Components**:

| File | Repo | Role |
|------|------|------|
| `step-selection.ts:8,15` | server | Exclusion sets that omit demo |
| `helix-workflow-step-catalog.ts:91-96` | server | Demo step definition with nonBlocking=true |
| `demo/step-config.mjs:76,163` | server | Agent prompt reading /tmp/preview-config.json |
| `orchestrator.ts:2186-2190,2648-2654` | server | demoContent persistence paths (never receive data) |
| `ticket-detail.tsx:1502-1505,2516-2522` | client | DemoViewer visibility gate and placement |

**Recommended Fix**: Add `"demo"` to both `RESEARCH_EXCLUDED_STEPS` and `SANDBOX_DEPLOY_EXCLUDED_STEPS` in `step-selection.ts`. This prevents the demo step from running when preview-config is unavailable, eliminating silent failures for RESEARCH and NetSuite modes. The broader failure on BUILD/FIX/AUTO (where preview-config does run) requires separate investigation.

**Fix Rationale**: This is the smallest correct change for the known dependency gap. More complex alternatives (dynamic dependency checking within the agent prompt, a formal step dependency system, or alternative preview URL sources) are either unreliable (agents don't consistently follow conditional instructions), disproportionate (no step dependency system exists in the codebase), or impossible (no alternative URL source exists today).

---

### 3.2 Demo Viewer Mispositioned

**Symptoms**: The user reports the demo viewer is "in the old place" -- it renders in the ticket page layout after the "Continue with Claude Code" CTA section rather than in a prominent position where it would be immediately visible.

**Root Cause**: Layout ordering in `ticket-detail.tsx`. The current rendering order in the left column is:

1. Ticket metadata and status
2. "Continue with Claude Code" section (lines 2474-2481)
3. **DemoViewer** (lines 2516-2522) -- positioned here
4. Research Report viewer

The DemoViewer should appear before the CTA section since demo screenshots are informational content that helps reviewers understand what was built, while "Continue with Claude Code" is an action item.

**Production Evidence**: No runtime data needed -- this is a layout/positioning issue confirmed by code inspection.

**Affected Components**:

| File | Repo | Role |
|------|------|------|
| `ticket-detail.tsx:2516-2522` | client | DemoViewer conditional rendering block |
| `ticket-detail.tsx:2474-2481` | client | "Continue with Claude Code" section |

**Recommended Fix**: Move the DemoViewer conditional block (`{demoContent ? ... : null}`) from its current position (after "Continue with Claude Code") to immediately before the "Continue with Claude Code" section. This places demo screenshots as the first content block after ticket metadata, making them immediately visible to reviewers without significant layout restructuring.

**Fix Rationale**: Minimizes layout disruption while achieving prominent placement. The existing `{demoContent ? ... : null}` conditional pattern correctly hides the section when no content exists and should be preserved.

---

### 3.3 Verification Broken Crash

**Symptoms**: Clicking "View details" on a run with `verification_broken` outcome crashes the UI. Users see a blank screen or React error.

**Root Cause**: Two contributing factors:

1. **ArtifactViewer data expectations**: When `onOpenArtifact("verification")` is called for a `verification_broken` run (`ticket-summary.tsx:278-285`), the ArtifactViewer attempts to load step artifacts. For runs where the verification step failed mid-way, artifacts may be partially committed or malformed, causing rendering exceptions.

2. **Status/outcome inconsistency**: 7 runs have `SUCCEEDED` status with `verification_broken` outcome. The UI renders ticket summaries assuming SUCCEEDED runs have valid, complete verification data, but verification_broken runs may lack the expected cascade/steps/details structure.

3. **Default fallback conflation**: `run-history.tsx:303` uses `"Verification Broken"` as the default label for ANY unrecognized outcome value, masking potential data issues under a misleading label.

**Production Evidence**:
- 52 runs with `verification_broken` outcome in 30 days (potential crash targets)
- 7 runs with `SUCCEEDED` status + `verification_broken` outcome (data inconsistency that violates UI assumptions)
- Most recent inconsistent record: May 20, 2026 (active bug)

**Affected Components**:

| File | Repo | Role |
|------|------|------|
| `ticket-summary.tsx:278-285` | client | "View details" button triggering ArtifactViewer |
| `ticket-detail.tsx:2530-2542` | client | ArtifactViewer Suspense rendering (no Error Boundary) |
| `run-history.tsx:303` | client | "Verification Broken" as default fallback for all unrecognized outcomes |

**Recommended Fix**: Add a React Error Boundary component wrapping the ArtifactViewer Suspense block, plus a data validation guard in the `onOpenArtifact` handler that checks for valid stepRepoMap entries before opening the viewer. The Error Boundary catches unforeseen runtime failures; the validation prevents known-bad states from reaching the renderer.

**Fix Rationale**: Belt-and-suspenders approach. Error Boundaries catch rendering exceptions (React 19 class components with `getDerivedStateFromError`). Data validation prevents the known crash path (missing artifacts for verification_broken runs). A single defense layer is insufficient given the confirmed 7 SUCCEEDED+verification_broken records with potentially inconsistent artifact data.

---

### 3.4 verification_broken Outcome Still Active

**Symptoms**: The user reports "there isn't supposed to be any more verification broken" and "the new verification does not have an option for verification broken." Despite this product intent, verification_broken remains a first-class outcome throughout the system.

**Root Cause**: verification_broken is fully wired across 3 layers and was never removed:

| Layer | Location | Role |
|-------|----------|------|
| **Step config** | `step-config.mjs:202-204` | Outcome #3 of 5, with explicit agent instructions |
| **Workflow chain** | `workflow-step-chain.ts:1385` | Fallback: `outcome: vResult ?? "verification_broken"` |
| **Client types** | `api.ts:580` | Union member in `VerificationReport.outcome` |
| **Client rendering** | `ticket-summary.tsx:51-52` | Explicit label: "Verification issue" |
| **Client fallback** | `run-history.tsx:303` | Default label for ANY unrecognized outcome |

The workflow chain fallback at line 1385 is particularly significant: when the verification step fails without specifying a `verificationResult`, the system automatically defaults to `verification_broken`. This means the outcome is not just passively available -- it is actively produced as the system's default failure mode.

**Production Evidence**:

| Status | Count | Percentage |
|--------|-------|------------|
| UNVERIFIED | 45 | 86.5% |
| SUCCEEDED | 7 | 13.5% |
| **Total verification_broken** | **52** | **100%** |

*52 runs in 30 days still produce verification_broken. This is not historical data -- it is actively being generated.*

**Affected Components**:

| File | Repo | Role |
|------|------|------|
| `verification/step-config.mjs:202-204` | server | Outcome definition and agent instructions |
| `workflow-step-chain.ts:1383-1385` | server | Fallback outcome when vResult is null |
| `api.ts:580` | client | TypeScript type union member |
| `ticket-summary.tsx:51-52` | client | Explicit verification_broken label mapping |
| `run-history.tsx:303` | client | Default fallback label |

**Recommended Fix**: 

*Server*: Remove verification_broken from the 5-outcome list in `step-config.mjs` (reducing to 4: pass, implementation_wrong, needs_credentials, impossible_spec). In `workflow-step-chain.ts:1385`, change `vResult ?? "verification_broken"` to just `vResult`. When vResult is null (agent crashed or couldn't determine), chainOutcome is already `"FAILED"` (line 1383), and the orchestrator's FAILED path calls `markRunFailed` which does NOT persist a verificationReport. So null vResult naturally produces a clean FAILED run with no specific outcome attached.

*Client*: Remove `verification_broken` from the `VerificationReport.outcome` type union. Use the widened union pattern `(string & {})` to accept unknown API values for backward compatibility. Change the default fallback label from "Verification Broken" to "Unknown" in both `run-history.tsx` and `ticket-summary.tsx`.

**Fix Rationale**: The concept of "verification is broken" should be handled by the step executor's failure handling (FAILED step status), not by a verification outcome. Cases that previously triggered verification_broken redistribute naturally: credential/environment gaps use `needs_credentials` (already exists); infrastructure failures return FAILED step status; transient issues are retried by the cascade retry system before reaching a terminal state.

---

### 3.5 platform_deferred Not Restricted

**Symptoms**: The user reports "platform deferred should only be for NetSuite UI changes" but observes it being used broadly. Investigation confirms 80% of platform_deferred usage is on the GENERAL platform (non-NetSuite).

**Root Cause**: No enforcement restricts platform_deferred to NetSuite contexts:

1. **Schema allows it everywhere**: The verification step config JSON schema allows `platform_deferred` as a valid item status on ALL three cascade layers:
   - `planAdherence.items[].status` (line 465)
   - `technicalValidation.items[].status` (line 487)
   - `scenarioAcceptance.items[].status` (line 509)

2. **Prose-only guidance**: The step config contains non-binding guidance at line 152: "Visual-only scenarios on platforms without visual access are individually platform-deferred." Agents are unreliable at following negative instructions consistently.

3. **No server-side validation**: The step executor receives `platform?: OrganizationPlatform` (`types.ts:123`), so the platform is known at execution time, but no code validates or rejects platform_deferred from non-NetSuite runs.

4. **No platform capability flags**: `platform.ts:83-154` defines platform configs but has no verification-related capability flags.

**Production Evidence**:

| Platform | Total Runs (30d) | platform_deferred Items |
|----------|-----------------|------------------------|
| GENERAL | 538 | ~12 (80% of total deferred) |
| NETSUITE | 65 | ~3 (20% of total deferred) |

*Source: Diagnosis artifacts confirmed by production platform distribution query (538 GENERAL, 65 NETSUITE runs in 30 days)*

**Semantic analysis**: `planAdherence` and `technicalValidation` check code-level concerns through code inspection or behavioral testing -- neither requires visual/UI access. Only `scenarioAcceptance` involves walking through user-facing UI flows where NetSuite visual access may be unavailable. platform_deferred is semantically invalid on the first two layers regardless of platform.

**Affected Components**:

| File | Repo | Role |
|------|------|------|
| `verification/step-config.mjs:465,487,509` | server | JSON schema allowing platform_deferred on all layers |
| `verification/step-config.mjs:152` | server | Non-binding prose guidance |
| `types.ts:123` | server | Platform available but not enforced |
| `run-history.tsx:134-212` | client | CascadeLayerSection falls through to "Skipped" for platform_deferred |
| `run-history.tsx:199-200` | client | platformDeferredReason rendered at item level (works correctly) |

**Recommended Fix**: Dual-layer enforcement:

*Layer 1 -- Step config (preventive)*: Remove `platform_deferred` from the status enum in `planAdherence` (line 465) and `technicalValidation` (line 487) schemas. Keep it only in `scenarioAcceptance` (line 509). Add explicit platform-conditional instruction: "platform_deferred is ONLY valid when the organization platform is NETSUITE."

*Layer 2 -- Post-step validation (corrective)*: After the verification step returns, inspect the cascade result. If the organization platform is NOT NETSUITE, convert any remaining `platform_deferred` items to `fail` with evidence: "platform_deferred is not valid for [PLATFORM] platform -- converted to fail."

*Client*: Add an explicit `platform_deferred` item-level styling branch in CascadeLayerSection with a distinct icon and "Platform Deferred" label, replacing the generic "Skipped" fallthrough.

**Fix Rationale**: Prompt-only enforcement (Option A) is insufficient -- production data proves 80% of usage ignores existing prose guidance. Schema restriction alone leaves a window for the scenarioAcceptance layer. Post-step validation catches anything the schema and prompt miss. The cost is modest (~10 lines of validation code plus prompt text updates).

---

### 3.6 Status/Outcome Data Inconsistency

**Symptoms**: The investigation uncovered runs with logically impossible status/outcome combinations, most notably SUCCEEDED status with `verification_broken` outcome. This creates data integrity issues and contributes to the verification_broken crash (Issue 3.3).

**Root Cause**: Run status and verification outcome are set in separate code paths without atomic consistency checks:

- `workflow-step-chain.ts:1383` always sets `chainOutcome = "FAILED"` alongside `verification_broken`
- `orchestrator.ts:2333-2367` maps FAILED chainOutcome to `markRunFailed`
- The RESEARCH mode exemption at `orchestrator.ts:2384` only applies to UNVERIFIED outcome, not FAILED

The code path analysis says SUCCEEDED+verification_broken should be impossible, yet 7 records exist. The most recent occurrence is **May 20, 2026** (one day before this report), confirming this is an active bug.

**Production Evidence**:

| Status + Outcome Combination | Count (30d) | Expected? |
|------------------------------|-------------|-----------|
| SUCCEEDED + verification_broken | 7 | No -- code should produce FAILED |
| SUCCEEDED + implementation_wrong | 1 | No -- implementation_wrong indicates failure |
| FAILED + verified | 1 | No -- verified should produce SUCCEEDED |
| **Total inconsistencies** | **9** | |

Most recent SUCCEEDED+verification_broken records:
- May 20, 2026 at 15:58 UTC
- May 20, 2026 at 15:50 UTC
- May 20, 2026 at 14:25 UTC
- May 14, 2026 at 23:28 UTC
- May 14, 2026 at 16:51 UTC

*3 of 7 occurred on a single day (May 20), suggesting a triggering condition, not random noise.*

**Possible causes** (from static analysis -- exact root cause requires run-level log analysis):
1. A race condition in the persistence layer
2. A now-patched code path that previously allowed the state
3. An edge case in the RESEARCH mode exemption interacting with chainOutcome
4. A concurrent write from separate orchestrator paths

**Affected Components**:

| File | Repo | Role |
|------|------|------|
| `workflow-step-chain.ts:1383-1385` | server | chainOutcome=FAILED paired with verification_broken |
| `orchestrator.ts:2333-2367` | server | FAILED outcome to markRunFailed mapping |
| `orchestrator.ts:2384` | server | RESEARCH mode UNVERIFIED exemption |
| `run-store.ts` | server | markRunSucceeded, markRunFailed, markRunUnverified |

**Recommended Fix**: Defense-in-depth approach:

1. **Verification_broken removal** (Issue 3.4 fix) eliminates the primary source of the inconsistency.
2. **Orchestrator consistency guard**: Before calling `markRunSucceeded`, validate that `verificationReport.outcome === "verified"` (the only outcome compatible with SUCCEEDED status). If the assertion fails, log a warning and route to `markRunFailed` or `markRunUnverified` instead.

**Fix Rationale**: Relying solely on verification_broken removal is fragile -- it assumes no future outcomes will ever produce inconsistencies. The orchestrator guard catches any invalid combination regardless of root cause, providing permanent protection.

---

## 4. Cross-Cutting Analysis

The 6 issues are not independent bugs to be fixed in isolation. They share systemic patterns that, if unaddressed, will produce similar problems in the future.

### Pattern 1: Missing Step Dependency Management

**Affected issues**: 3.1 (Demo content)

The demo step depends on preview-config's output file, but the workflow system has no formal step dependency mechanism. Exclusion lists in `step-selection.ts` must be manually kept in sync. When preview-config was added to RESEARCH_EXCLUDED_STEPS and SANDBOX_DEPLOY_EXCLUDED_STEPS, demo was not added alongside it. The `nonBlocking=true` flag compounds the problem by swallowing the resulting failure.

**Implication**: Any new nonBlocking step that depends on an excludable predecessor will silently fail unless someone remembers to update the exclusion sets. This is a manual bookkeeping problem that could recur.

### Pattern 2: Outcome Definition Drift

**Affected issues**: 3.4 (verification_broken active), 3.3 (crash)

verification_broken was intended to be removed from the verification system, but it remains fully wired across 3 layers: server step config (definition), workflow chain (fallback), and client types/rendering (display). The intent-to-remove was never executed. The outcome drifted from "deprecated, should be removed" to "the system's default failure mode" because it was the fallback value when `vResult` is null.

**Implication**: Removing features from a multi-layer system (config -> logic -> types -> UI) requires coordinated changes. If any layer retains the deprecated value, it remains active. The server workflow chain fallback is particularly insidious -- it actively produces verification_broken even if the step config were to stop instructing it.

### Pattern 3: Enforcement Gap (Prose vs. Code)

**Affected issues**: 3.5 (platform_deferred), 3.4 (verification_broken)

Both platform_deferred and verification_broken have "intended restrictions" expressed as prose in step configs but not enforced in code. The step config tells the agent "this is for NetSuite only" but the JSON schema allows it everywhere. The intent to remove verification_broken was a product decision, but the code was never updated.

**Production data validates the gap**: 80% of platform_deferred usage is on the wrong platform despite prose guidance existing in the step config since its introduction.

**Implication**: Agent-targeted prose instructions are necessary but insufficient for restrictions. Any future restriction that matters should have code-level enforcement (schema restrictions, post-step validation, or both) as a backstop.

### Pattern 4: Data Consistency Without Guards

**Affected issues**: 3.6 (status/outcome inconsistency), 3.3 (crash from inconsistent data)

Run status and verification outcome are set in separate code paths. The orchestrator determines the final status based on chainOutcome, but there is no validation that the verification report's outcome is compatible with the chosen status. This allowed 9 logically impossible combinations to be persisted, including 7 SUCCEEDED+verification_broken records and 1 FAILED+verified record.

**Implication**: Any pipeline where related fields are set independently needs consistency guards at write time. The current architecture assumes correct sequencing of status determination, but the 3-occurrences-in-one-day pattern (May 20) suggests a systematic triggering condition.

### Pattern 5: Silent Failure Masking

**Affected issues**: 3.1 (demo silent failure), 3.3 (crash from masked failures)

`nonBlocking=true` on the demo step suppresses failure signals. The `"Verification Broken"` default label in `run-history.tsx:303` masks any unrecognized outcome under a misleading name. Both patterns hide problems rather than surfacing them.

**Implication**: Silent failure modes accumulate technical debt. The demo step has been silently failing for all 603 runs in the last 30 days with no alerts, no errors, and no user-visible indication of the problem. It was only discovered through this investigation.

### Pattern 6: Client Fallback Label Design

**Affected issues**: 3.3 (crash), 3.4 (verification_broken rendering)

Using `"Verification Broken"` as the default label for ANY unrecognized verification outcome (`run-history.tsx:303`) means: (a) any new outcome value added in the future will be mislabeled as "Verification Broken," and (b) the actual verification_broken outcome is conflated with the fallback for unknown values. The ticket-summary.tsx component has a separate label ("Verification issue" at line 52), creating inconsistent labeling for the same outcome across different views.

---

## 5. Recommended Implementation Tickets

The following tickets resolve all 6 identified issues. They are ordered so each can be executed without blocked dependencies, with server-side foundational changes preceding client-side updates.

### Ticket 1: Server-Side Verification Outcome Cleanup

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-server |
| **Issues Addressed** | 3.4 (verification_broken active), 3.6 (status/outcome inconsistency) |
| **Dependencies** | None (foundational change) |
| **Complexity** | Medium |

**Key Changes**:

| File | Change |
|------|--------|
| `verification/step-config.mjs` | Remove verification_broken from the 5-outcome list (becomes 4). Remove agent instructions for outcome #3. Update outcome numbering. |
| `workflow-step-chain.ts:1385` | Change `vResult ?? "verification_broken"` to `vResult` (null passthrough). |
| `workflow-step-chain.ts:1268` | Change `vResult ?? "verification_broken"` to `vResult ?? "unknown"` (logging clarity). |
| `orchestrator.ts:~2467` | Add consistency guard: if `verificationReport.outcome !== "verified"`, route to non-success path instead of `markRunSucceeded`. |

**Outcome**: verification_broken is no longer defined or produced. Null vResult naturally results in a clean FAILED run. Orchestrator guard prevents future status/outcome inconsistencies.

---

### Ticket 2: Server-Side platform_deferred Enforcement

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-server |
| **Issues Addressed** | 3.5 (platform_deferred unrestricted) |
| **Dependencies** | None (can run in parallel with Ticket 1) |
| **Complexity** | Medium |

**Key Changes**:

| File | Change |
|------|--------|
| `verification/step-config.mjs:465` | Remove `platform_deferred` from planAdherence item status enum. |
| `verification/step-config.mjs:487` | Remove `platform_deferred` from technicalValidation item status enum. |
| `verification/step-config.mjs:~152` | Add explicit platform-conditional instruction for platform_deferred. |
| `workflow-step-chain.ts` (new logic) | Post-step validation: if platform is NOT NETSUITE, convert platform_deferred items to "fail" with evidence annotation. |

**Outcome**: platform_deferred is restricted to scenarioAcceptance layer on NetSuite platforms. Non-NetSuite usage is blocked at both the schema level (2 of 3 layers) and the validation level (all layers).

---

### Ticket 3: Server-Side Demo Step Exclusion Fix

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-server |
| **Issues Addressed** | 3.1 (demo content never persisted -- RESEARCH and NetSuite modes) |
| **Dependencies** | None (can run in parallel with Tickets 1 and 2) |
| **Complexity** | Low |

**Key Changes**:

| File | Change |
|------|--------|
| `step-selection.ts:8` | Add `"demo"` to RESEARCH_EXCLUDED_STEPS |
| `step-selection.ts:15` | Add `"demo"` to SANDBOX_DEPLOY_EXCLUDED_STEPS |

**Outcome**: Demo step no longer runs when preview-config is unavailable. Eliminates silent failures for RESEARCH and NetSuite modes. Does not resolve the broader BUILD/FIX/AUTO failure (see Ticket 5).

---

### Ticket 4: Client-Side Verification & Demo UI Fixes

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-client |
| **Issues Addressed** | 3.2 (demo viewer position), 3.3 (verification broken crash), 3.4 (client-side verification_broken removal), 3.5 (platform_deferred display) |
| **Dependencies** | Coordinates with Ticket 1 (server-side type removal), but handles the transitional period through a widened type union |
| **Complexity** | Medium |

**Key Changes**:

| File | Change |
|------|--------|
| `ticket-detail.tsx:2516-2522` | Move DemoViewer block before "Continue with Claude Code" section. |
| `ticket-detail.tsx:2530-2542` | Wrap ArtifactViewer Suspense in Error Boundary class component. |
| `api.ts:580` | Remove `verification_broken` from outcome union; add `(string & {})` for backward compat. |
| `ticket-summary.tsx:51-52` | Remove explicit `verification_broken` case; change default to "Unknown" with neutral styling. |
| `run-history.tsx:303` | Change default fallback label from "Verification Broken" to "Unknown". |
| `run-history.tsx:134-212` | Add explicit `platform_deferred` item-level branch with distinct icon and "Platform Deferred" label. |

**Outcome**: Demo viewer is prominently positioned. ArtifactViewer crashes are caught by Error Boundary. verification_broken is removed from client types and rendering. platform_deferred items are visually distinct from "Skipped." Historical records render gracefully with "Unknown" label.

---

### Ticket 5: Follow-Up Demo Step Agent Investigation

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-server |
| **Issues Addressed** | 3.1 (demo content never persisted -- BUILD/FIX/AUTO modes on non-NetSuite platforms) |
| **Dependencies** | Ticket 3 should complete first to eliminate known dependency gap |
| **Complexity** | High (requires log analysis) |

**Scope**: Investigate why the demo step produces no content even when preview-config runs successfully. This requires run-level log analysis of specific demo step executions for BUILD/FIX/AUTO runs on non-NetSuite platforms. The exclusion fix (Ticket 3) addresses the known dependency gap; this investigation addresses the unexplained universal failure.

---

### Ticket Dependency Map

```
Ticket 1 (verification outcome cleanup) ─── parallel ───┐
Ticket 2 (platform_deferred enforcement) ── parallel ───┤
Ticket 3 (demo step exclusion) ──────────── parallel ───┤
                                                         ▼
                                            Ticket 4 (client UI fixes)
                                                         │
                                                         ▼
                                            Ticket 5 (demo agent investigation)
```

### Issue Coverage Matrix

| Issue | T1 | T2 | T3 | T4 | T5 |
|-------|----|----|----|----|----|
| 3.1 Demo content | | | Yes (partial) | | Yes (full) |
| 3.2 Demo viewer position | | | | Yes | |
| 3.3 Verification crash | | | | Yes | |
| 3.4 verification_broken | Yes (server) | | | Yes (client) | |
| 3.5 platform_deferred | | Yes (server) | | Yes (client) | |
| 3.6 Status inconsistency | Yes | | | | |

All 6 issues are covered by at least one ticket.

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| verification_broken removal breaks historical data rendering | Low | Medium | Client widened union `(string & {})` handles unknown values gracefully; default "Unknown" label renders cleanly for any string |
| platform_deferred enforcement produces false failures for legitimate use cases | Low | Medium | Dual-layer approach (prompt prevention + post-step correction) allows gradual enforcement; scenarioAcceptance layer retains platform_deferred for NetSuite |
| Demo step investigation reveals deeper architectural issues | Medium | High | Separate investigation ticket (T5) isolates risk from the core fixes; exclusion fix (T3) provides immediate value independently |
| Status/outcome inconsistency has a race condition root cause that recurs after fix | Medium | Medium | Orchestrator guard prevents recurrence regardless of root cause; defense-in-depth alongside verification_broken removal |
| Client type widening `(string & {})` reduces type safety | Low | Low | Only 4 known outcomes need explicit handling; the widening only affects the verification report outcome field, not core business types |
| Cascade retry behavior changes after verification_broken removal | Low | Medium | Cascade retry budgets remain unchanged (plan_adherence: 3, technical_validation: 2, scenario_acceptance: 2); retry triggers based on layer failure, not outcome name |

---

## 7. Deferred Investigations

The following items are explicitly out of scope for the recommended implementation tickets but should be tracked for future work:

| # | Item | Rationale for Deferral |
|---|------|----------------------|
| 1 | **Demo content generation for BUILD/FIX/AUTO** | Requires run-level log analysis to diagnose why the demo step agent produces nothing even when preview-config runs. This is a deeper investigation tracked as Ticket 5. |
| 2 | **Platform capability flags** | Formal `verificationCapabilities` in platform configs would provide cleaner enforcement than platform name checks. Deferred until the simpler name-based enforcement (Ticket 2) stabilizes usage patterns. |
| 3 | **Data migration of historical records** | 52 verification_broken + 9 inconsistent records could be retroactively corrected. Deferred because (a) client rendering handles them gracefully through widened types, (b) `verificationReport` is a `Json?` field, not a database enum -- migration is a JSON update, not a schema change, and (c) records will age out of relevance. |
| 4 | **Admin verification analytics updates** | `admin-verification-outcomes-service.ts` queries outcome distribution dynamically and will naturally show historical values declining. No immediate changes needed; future update can improve filtering/labeling. |
| 5 | **Demo empty-state UX** | Showing a helpful message when no demo content exists (instead of hiding the section entirely). Deferred until server-side demo generation is fixed (Ticket 5) and content actually flows. |
| 6 | **Verification retry strategy tuning** | CASCADE_RETRY_BUDGETS remain unchanged after verification_broken removal. Tuning may be needed once we observe how the 4-outcome system behaves in production. |
| 7 | **Root cause of SUCCEEDED+verification_broken race condition** | The orchestrator guard (Ticket 1) prevents recurrence. Identifying the exact code path that produced the 7 inconsistent records requires run-level log analysis for specific run IDs. Deferred because the guard provides immediate protection. |

---

## 8. Evidence Summary

### Production Database Evidence

| Query | Result | Date Queried |
|-------|--------|--------------|
| Total runs in 30 days | 603 | 2026-05-21 |
| Runs with demoContent | 0 (0.0%) | 2026-05-21 |
| demoContent by mode | RESEARCH=216/0, BUILD=146/0, AUTO=124/0, FIX=117/0 | 2026-05-21 |
| Verification outcomes | verified=385, none=159, verification_broken=52, implementation_wrong=7 | 2026-05-21 |
| verification_broken by status | UNVERIFIED=45, SUCCEEDED=7 | 2026-05-21 |
| Status/outcome inconsistencies | 7 SUCCEEDED+verification_broken, 1 FAILED+verified, 1 SUCCEEDED+implementation_wrong | 2026-05-21 |
| Runs by platform | GENERAL=538, NETSUITE=65 | 2026-05-21 |
| Most recent SUCCEEDED+verification_broken | May 20, 2026 at 15:58 UTC | 2026-05-21 |

### Code Reference Summary

| Reference | File | Line(s) | Verified |
|-----------|------|---------|----------|
| RESEARCH_EXCLUDED_STEPS | step-selection.ts | 8 | Yes |
| SANDBOX_DEPLOY_EXCLUDED_STEPS | step-selection.ts | 15 | Yes |
| Demo step (nonBlocking=true) | helix-workflow-step-catalog.ts | 91-96 | Yes |
| Demo step reads preview-config | demo/step-config.mjs | 76, 163 | Yes |
| verification_broken outcome #3 | verification/step-config.mjs | 202-204 | Yes |
| verification_broken in schema enum | verification/step-config.mjs | 438 | Yes |
| verification_broken fallback | workflow-step-chain.ts | 1383-1385 | Yes |
| platform_deferred in planAdherence schema | verification/step-config.mjs | 465 | Yes |
| platform_deferred in technicalValidation schema | verification/step-config.mjs | 487 | Yes |
| platform_deferred in scenarioAcceptance schema | verification/step-config.mjs | 509 | Yes |
| Cascade retry budgets | workflow-step-chain.ts | 673-678 | Yes |
| DemoViewer placement | ticket-detail.tsx | 2516-2522 | Yes |
| "Continue with Claude Code" section | ticket-detail.tsx | 2474-2481 | Yes |
| VerificationReport.outcome type | api.ts | 580 | Yes |
| "Verification Broken" default fallback | run-history.tsx | 303 | Yes |
| CascadeLayerSection | run-history.tsx | 134-212 | Yes |
| verification_broken label ("Verification issue") | ticket-summary.tsx | 51-52 | Yes |
| orchestrator FAILED path | orchestrator.ts | 2333-2367 | Yes |
| orchestrator RESEARCH exemption | orchestrator.ts | 2384 | Yes |
| demoContent persistence paths | orchestrator.ts | 2186-2190, 2648-2654 | Yes |

---

## 9. Methodology & Data Sources

### Investigation Approach

1. **Artifact synthesis**: Diagnosis, product, and tech-research artifacts were produced independently for both helix-global-server and helix-global-client. This report synthesizes findings from all upstream artifacts into a unified narrative.

2. **Production data verification**: All database statistics cited in this report were independently verified through runtime inspection queries against the production database on May 21, 2026. Results match or closely track diagnosis-stage findings (minor count differences due to new runs since diagnosis).

3. **Code reference verification**: All code references (file:line) were spot-checked by reading the actual source files in the current codebase. All 20 references confirmed accurate.

4. **Architecture decision tracing**: Recommended fixes originate from tech-research architecture decisions (5 per repo, 10 total) that evaluated 2-4 options each with explicit rationale for the chosen approach.

### Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library) | Understand ticket scope and user-reported problems | 5+ issues spanning demo, verification, platform_deferred; research ticket requesting holistic analysis |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client-side root cause analysis | 5 root causes: demo gating, demo position, verification_broken crash, type persistence, platform_deferred display |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server-side root cause analysis | 4 root causes: demo dependency chain, verification_broken active, status inconsistency, platform_deferred unenforced |
| diagnosis/apl.json (helix-global-client) | Detailed investigation with 7 questions/answers | DemoViewer position, ArtifactViewer crash path, verification_broken rendering, CascadeLayerSection gaps |
| diagnosis/apl.json (helix-global-server) | Detailed investigation with 5 questions/answers | Demo step dependency, verification_broken fallback, platform_deferred enforcement, status consistency |
| product/product.md (helix-global-client) | Product requirements and success criteria | 6 success criteria, 8 scenarios, 3 design principles |
| product/product.md (helix-global-server) | Server-side product requirements | 6 success criteria, 8 scenarios, 4 design principles |
| tech-research/tech-research.md (helix-global-client) | Architecture decisions for client fixes | 5 ADs: DemoViewer repositioning, Error Boundary, type widening, platform_deferred display, fallback labels |
| tech-research/tech-research.md (helix-global-server) | Architecture decisions for server fixes | 5 ADs: demo exclusion, verification_broken removal, dual-layer enforcement, consistency guard, backward compat |
| scout/reference-map.json (helix-global-client) | Client file inventory | 7 relevant files with line-level detail |
| scout/reference-map.json (helix-global-server) | Server file inventory | 11 relevant files with line-level detail |
| repo-guidance.json (library) | Repo roles | library=context, helix-global-client=target, helix-global-server=target, helix-cli=context |
| Production DB (runtime inspection) | Fresh data verification | 603 runs/0 demoContent, 9 status/outcome inconsistencies, platform distribution |
| BLD-535 artifacts (.helix-refs/BLD-535/) | Referenced ticket context | Triggering example demonstrating the reported problems |
| library/reports/RSH-443/report.md | Existing report format reference | Structure: metadata header, TOC, executive summary, detailed analysis sections, implementation plan, risk assessment |
| library/reports/RSH-497/report.md | Existing report format reference | Structure: numbered sections, methodology, functional analysis pattern |

## Attachments
- (none)
