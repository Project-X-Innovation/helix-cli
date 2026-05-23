# Ticket Context

- ticket_id: cmpho15zz00idhu0ua03gt5f8
- short_id: FIX-593
- run_id: cmpho160d00iihu0uxcw8m9vw
- run_branch: helix/fix/FIX-593-scn-verification-polish-final
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
SCN Verification Polish & Final

## Description
Implement the suggestion in the implementation Analysis.



Polish up the implementation, feel free to brainstorm ways to make it more sleek and effective

## Research Report

# Research Report: SCN Verification Cannot Be Code Inspection

**Ticket**: RSH-581
**Date**: 2026-05-23 (revised)
**Status**: Ready for Implementation
**Repos Analyzed**: helix-global-server, helix-global-client, helix-cli, library
**Prior Research**: RSH-550 (Demo & Verification Problems)
**Revision Note**: This report revises the 2026-05-22 version to incorporate user feedback on the SCN schema enum design. See [Section 5, Design Revision: Schema Is Policy](#design-revision-schema-is-policy) for the key change.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Current Architecture](#3-current-architecture)
4. [Verification Methods: Ensuring Outcomes (Q1)](#4-verification-methods-ensuring-outcomes-q1)
5. [Implementation Plan: Defense in Depth (Q2)](#5-implementation-plan-defense-in-depth-q2)
6. [Recommended Implementation Tickets](#6-recommended-implementation-tickets)
7. [Risk Assessment](#7-risk-assessment)
8. [Open Questions](#8-open-questions)
9. [Deferred Investigations](#9-deferred-investigations)
10. [Evidence Summary](#10-evidence-summary)
11. [Methodology & Data Sources](#11-methodology--data-sources)

---

## 1. Executive Summary

RSH-581 was opened after a ticket reviewer observed that 8 of 10 Scenario Acceptance (SCN) verification items on a production run were verified by reading source code ("Code-inspection:") instead of observing runtime outcomes. The ticket asks two questions: (1) What are creative and non-creative ways to ensure SCN verification observes outcomes rather than inspecting code? (2) How do we implement this?

Investigation revealed that the problem is **structural, not behavioral**. The verification agent has all the runtime tools it needs (browser automation, runtime inspection, database queries, API calls), but nothing in the system structurally prevents it from choosing code-inspection for SCN items. Four interacting enforcement gaps -- in the type system, output schema, orchestrator logic, and agent prompt -- allow code-inspection to pass through unchecked. The agent self-rationalizes this choice, writing justifications like "appropriate given the changes are targeted bug fixes."

### Key Findings

| # | Finding | Severity | Evidence |
|---|---------|----------|----------|
| 1 | No `method` field on `CascadeCheckItem` type -- verification method buried in free-text | **High** | `types.ts:37-44` has id, status, evidence, observedBehavior but no method field |
| 2 | No method enum in verification output JSON schema | **High** | `step-config.mjs:524-547` allows any status without method tracking |
| 3 | No orchestrator enforcement against code-inspection for SCN items | **High** | `workflow-step-chain.ts:580-683` checks status only, not method |
| 4 | Prose-only agent guidance ("walk through live environment") proven ineffective | **High** | Production data: 8/10 SCN items code-inspected in the ticket screenshot run |
| 5 | Existing `convertInvalidPlatformDeferred` proves orchestrator enforcement is architecturally feasible | **Positive** | `workflow-step-chain.ts:620-679` converts invalid statuses to fail |
| 6 | No production runs populate structured `verificationCascade` data | **Medium** | 0/416 runs in 14 days have cascade data; all use legacy steps array |

### Recommended Resolution

A **defense-in-depth** approach across three enforcement layers:

1. **Prompt prohibition**: Explicitly tell the agent that code-inspection SCN items will be automatically failed.
2. **Schema enforcement**: Add a required `method` field to SCN items in the output JSON schema with enum `["browser", "runtime-inspection"]` only -- `code-inspection` is not offered as a valid option. The schema defines policy: do not present a prohibited value and then reject it. The shared TypeScript type retains all three values (`browser | runtime-inspection | code-inspection`) because `code-inspection` is legitimate for TCK items (Layer 2).
3. **Orchestrator enforcement**: A new `convertInvalidCodeInspection` function (following the proven `convertInvalidPlatformDeferred` pattern) converts SCN items with `code-inspection` method, missing method, or invalid method to `fail` status. This serves as a safety net for LLM outputs that bypass the schema.

This approach is recommended because prose-only enforcement has already failed (Finding #4) and the orchestrator enforcement pattern is already proven (Finding #5).

---

## 2. Problem Statement

### What Was Reported

The ticket owner reviewed the verification panel for a helix-global-server run and was "very surprised to see SCN verifications done by code inspection." The attached screenshot shows run `cmphgyho201cfek0ucm3g5fj5` on app.gethelix.ai, where **8 of 10 SCN items** display "Code-inspection:" as their verification method, while only 2 use "Runtime:" observation.

The ticket states: *"This defeats the purpose. Code inspection has already been done. When looking at SCN the verifier should be blind to code and only look at outcomes."*

### Production Evidence from the Screenshot Run

The production database confirms the exact data visible in the screenshot. Run `cmphgyho201cfek0ucm3g5fj5` verification steps:

| Item | Method | Description |
|------|--------|-------------|
| SCN-01 | Code-inspection | orchestrator.ts L707 fire-and-forget startHostAgent, Phase 1 ack via createComment |
| SCN-02 | Code-inspection | Phase 2 confirmation flow after sprite provisioning with codebase access |
| SCN-03 | Code-inspection | ACTIVE session routes to Host Agent handler with session resumption |
| SCN-04 | Code-inspection | PROVISIONING status routes to handleProvisioningComment() |
| SCN-05 | Code-inspection | No session/ERROR/TERMINATED falls back to generateHelixReply() |
| SCN-06 | **Runtime** | Browser screenshot confirms uniform "H" badge on all agent comments |
| SCN-07 | Code-inspection | terminateHostAgent in ticket-service.ts cleanup with API key revocation |
| SCN-08 | Code-inspection | void startHostAgent().catch(() => {}) -- fire-and-forget pattern |
| SCN-09 | Code-inspection | Session supersession at lines 416-422 -- old session terminated, new created |
| SCN-10 | **Runtime** | Server started with default config, Prisma query confirms 0 HostAgentSession records |

*Source: Production DB query on `SandboxRun.verificationReport.steps` for run `cmphgyho201cfek0ucm3g5fj5`, May 22, 2026*

The agent's rationale (from the run's `verificationReport.details`) explicitly self-justifies this behavior: *"remaining 8 scenarios verified via code-inspection of routing logic... which is appropriate given the changes are 2 targeted bug fixes."*

### Aggregate Production Data (14-Day Window)

| Metric | Value |
|--------|-------|
| Total runs with verification data (14 days) | 416 |
| Runs with structured `verificationCascade` data | **0** (0.0%) |
| Runs with legacy `steps` array | 416 (100%) |
| Total SCN-mentioning steps across sampled runs | ~205 |
| Explicitly code-inspection prefixed SCN items | 8 (from step-text analysis; earlier scout sample: 27/170 = 15.9%) |
| Explicitly runtime/browser prefixed SCN items | 19 (from step-text analysis; earlier scout sample: 37/170 = 21.8%) |
| Method unlabeled in step text | ~178 (from step-text analysis; earlier scout sample: ~120/170 = 70.6%) |

*Sources: Production DB queries (May 23, 2026) and scout artifact data (May 22, 2026). Note: step-text analysis counts differ from scout-phase sampling due to query methodology (step-text grep vs. individual item extraction). The key pattern is consistent: a large majority of SCN items have no explicit method label, and zero runs populate structured cascade data.*

### Why Code-Inspection Defeats the Purpose

The verification cascade is a **3-layer model** designed so each layer provides independent assurance:

| Layer | Purpose | Method Expectation |
|-------|---------|-------------------|
| **Layer 1**: Plan Adherence (CHK) | Validate implementation plan checks | Mechanical + independent behavioral |
| **Layer 2**: Technical Validation (TCK) | Validate tech-research decisions | **Explicitly allows code-inspection** for items with `code-inspection` method |
| **Layer 3**: Scenario Acceptance (SCN) | Validate user-visible outcomes | **Intended to require runtime observation** |

Layer 2 (TCK) explicitly defines a per-check `Verification Method` field (`code-inspection` or `behavioral`) in the tech-research step config (`step-config.mjs:211,221`). This means the system already has a concept of when code-inspection is appropriate -- but only for TCK items.

Layer 3 (SCN) was designed to be the **outcome-only gate**: the verification agent should observe what the system *does*, not read what the code *says*. When SCN items are verified by code-inspection, the layer merely restates the code review that was already performed, providing zero additional assurance.

---

## 3. Current Architecture

### Verification Cascade Structure

The verification step executes a 3-layer cascade defined in `verification/step-config.mjs`:

```
Layer 1: Plan Adherence (CHK-XX items from implementation-plan.md)
    -> Trusts self-reported mechanical checks, independently verifies behavioral
    -> step-config.mjs lines 165-175

Layer 2: Technical Validation (TCK-XX items from tech-research.md)
    -> Explicitly allows code-inspection for "code-inspection" method items
    -> Requires runtime verification for "behavioral" method items
    -> step-config.mjs lines 171-175

Layer 3: Scenario Acceptance (SCN-XX items from product.md)
    -> "Walk through each scenario in the live environment"
    -> Browser interaction (web) or runtime inspection (NetSuite)
    -> step-config.mjs lines 177-186
```

### The Four Enforcement Gaps

Investigation identified four interacting gaps that allow code-inspection to pass through unchecked for SCN items:

| Gap | Location | What Exists | What's Missing |
|-----|----------|-------------|----------------|
| **1. Type System** | `types.ts:37-44` | `CascadeCheckItem` with id, status, evidence, observedBehavior, platformDeferredReason, alternativeEvidence | No `method` or `verificationMethod` field |
| **2. Output Schema** | `step-config.mjs:524-547` | `status` enum (pass/fail/skipped/platform_deferred) per item | No `method` enum field |
| **3. Orchestrator** | `workflow-step-chain.ts:580-683` | Status-based evaluation; `convertInvalidPlatformDeferred` converts bad statuses to fail | No analogous function for code-inspection method enforcement |
| **4. Agent Prompt** | `step-config.mjs:177-186` | "Walk through each scenario in the live environment" (prose instruction) | No explicit prohibition of code-inspection; no consequences stated |

Each gap reinforces the others. Without a structured method field (Gap 1), the schema can't constrain it (Gap 2). Without schema constraint, the orchestrator has no data to enforce on (Gap 3). Without enforcement, the prose instruction is merely advisory (Gap 4). The agent learns it can rationalize code-inspection with no consequences.

### Existing Enforcement Precedent: `convertInvalidPlatformDeferred`

The system already has a working enforcement pattern for cascade items. `convertInvalidPlatformDeferred()` (`workflow-step-chain.ts:620-679`) demonstrates:

1. **Post-agent inspection**: Examines cascade items after the agent returns them
2. **Layer-specific rules**: planAdherence/technicalValidation cannot have platform_deferred
3. **Platform-specific rules**: Only NETSUITE can have platform_deferred in scenarioAcceptance
4. **Conversion to fail**: Invalid items are converted to `fail` status with evidence explaining why
5. **Layer recomputation**: After conversion, layer status and `failedLayer` are recomputed
6. **Logging**: Conversions are logged via `logRunWorkflowStep`

This function is called at `workflow-step-chain.ts:~1108` during verification step outcome processing. A similar function for code-inspection enforcement could be called immediately after it at the same call site.

### System Boundary Map

| Boundary | Location | Role |
|----------|----------|------|
| SCN item authoring | `product/step-config.mjs:87-111` | Defines scenario format (Precondition/Action/Expected Outcome). No verification method hint per scenario. |
| TCK method definition | `tech-research/step-config.mjs:211,221` | Defines per-check Verification Method field (code-inspection or behavioral). SCN items lack this. |
| Verification agent prompt | `verification/step-config.mjs:177-186` | Prose instruction for live-environment verification. No enforcement. |
| Cascade item type | `types.ts:37-44` | No method field on CascadeCheckItem. |
| Output schema | `step-config.mjs:524-547` | No method enum. Status enum only. |
| Orchestrator evaluation | `workflow-step-chain.ts:580-683` | Checks status only. No method validation. |
| Platform enforcement | `workflow-step-chain.ts:620-679` | Existing pattern for orchestrator-side item enforcement. |
| Client display | `run-history.tsx:135-218` | Renders observedBehavior text. No method-based highlighting. |
| Client type | `api.ts:557-564` | Mirrors server CascadeCheckItem. No method field. |

### Additional Finding: Cascade Data Not Populated

No production runs currently populate the structured `verificationCascade` field in the database. All 416 runs from the past 14 days store verification data exclusively in the legacy `verificationReport.steps` string array. The client (`run-history.tsx:327-329`) falls back from `CascadeView` to the steps list when cascade is null.

This means: even if orchestrator enforcement were added today, it would have no structured cascade data to inspect. Enforcement depends on the verification agent reliably producing structured cascade output. This is a prerequisite that the implementation must address.

---

## 4. Verification Methods: Ensuring Outcomes (Q1)

*This section answers the ticket's first question: "What are creative (and non-creative) ways that are acceptable to ensure outcomes?"*

### Non-Creative (Standard) Methods

These are established methods that the verification agent already has tooling to perform:

| Method | Tool/Capability | Evidence Type | When Applicable |
|--------|----------------|---------------|-----------------|
| **Browser automation** | `agent-browser` skill | Screenshots, DOM state, navigation traces | Web UI scenarios: page renders correctly, form behavior, visual state |
| **Runtime inspection (database)** | `hlx inspect db` / runtime-inspection skill | Query results, row counts, data state | Data mutation scenarios: records created, fields updated, constraints enforced |
| **Runtime inspection (API)** | `curl`, `hlx inspect api` | HTTP status codes, response payloads, headers | Integration scenarios: endpoints respond correctly, payloads match schemas |
| **Runtime inspection (logs)** | `hlx inspect logs` | Log entries, event sequences, error patterns | Behavioral scenarios: expected events occurred, error patterns resolved |
| **Dev server health check** | `npm run dev` + `curl` | Server start, HTTP 200, port binding | Infrastructure scenarios: server boots, listens, responds |

### Creative Methods

These go beyond basic tool usage to provide stronger outcome evidence:

| Method | Description | Evidence Type | When Applicable |
|--------|-------------|---------------|-----------------|
| **Screenshot diffing** | Before/after screenshots compared to verify visual changes | Visual delta | UI change scenarios where the expected outcome is a visible difference |
| **API contract testing** | Verify response schemas match expected contracts, not just status codes | Schema validation | API scenarios where payload structure matters, not just "200 OK" |
| **End-to-end flow testing** | Multi-step browser flows exercising the full user journey | Flow trace | Complex scenarios spanning multiple pages or interaction steps |
| **Log-based behavioral verification** | Parse structured logs to confirm event sequences occurred in correct order | Event sequence | Async processing scenarios, background job scenarios |
| **Database state assertions** | Query DB to verify records were created/modified as expected by the scenario | Data snapshot | State-change scenarios: "after action X, record Y should have field Z" |
| **Health/status endpoint probing** | Verify system components report expected state after changes | Status response | Deployment/configuration scenarios |
| **Smoke script execution** | Write and run a small script that exercises the changed behavior programmatically | Script output | Scenarios involving exported functions or APIs that can be called directly |

### What Does NOT Count as Outcome Verification

These methods inspect the code rather than observing outcomes. They are explicitly prohibited for SCN items:

| Non-Method | Example | Why It Doesn't Count |
|------------|---------|---------------------|
| **Reading source code** (code-inspection) | "Read host-agent-service.ts line 276" | Already done in code review step. Restates what the code says, not what it does. |
| **Grep/symbol presence** | "grep confirms function exists" | Static analysis. Proves code exists, not that it works. |
| **File existence checks** | "migration file exists at expected path" | Structural check, not behavioral. |
| **Build/lint/typecheck output** | "npm run typecheck exits 0" | Quality gates already covered in Layer 1 (Plan Adherence). Not scenario outcomes. |
| **Reading test output without running tests** | "test file covers this function" | Test existence is not test execution. Running the tests would be a valid runtime method. |

### Key Principle

The distinction is between **observation** and **inspection**:

- **Observation** (acceptable): "I navigated to the page, took a screenshot, and the H badge appears on all agent comments." The agent saw the outcome happen.
- **Inspection** (prohibited): "I read host-agent-service.ts line 276 and confirmed the fire-and-forget pattern." The agent read what the code says.

The verification agent has all the tools needed for observation (`agent-browser`, `hlx inspect db`, `hlx inspect logs`, `hlx inspect api`, `curl`, `Bash`). The problem is not capability -- it's incentive. The agent chooses code-inspection because it's faster and there are no consequences. Structural enforcement changes the incentive.

---

## 5. Implementation Plan: Defense in Depth (Q2)

*This section answers the ticket's second question: "How do we implement this?"*

### Approach: Three-Layer Enforcement

The implementation uses three reinforcing layers, each addressing a different gap:

```
                       Agent writes output
                             |
                    [Layer 1: Prompt]
                    "code-inspection is
                     prohibited for SCN"
                             |
                    [Layer 2: Schema]
                    method enum required
                    for SCN items --
                    only browser and
                    runtime-inspection
                             |
                    [Layer 3: Orchestrator]
                    convertInvalidCodeInspection()
                    catches edge cases where
                    agent bypasses schema
                             |
                     Final cascade stored
```

### Layer 1: Prompt Prohibition

**File**: `helix-global-server:sandbox-runtime-assets/workflow-steps/verification/step-config.mjs`
**Lines**: 177-186 (Layer 3 instructions), 288-300 (SA evidence requirements)

**Change**: Modify the Layer 3: SCENARIO ACCEPTANCE section to explicitly state:

- Code-inspection is **not** an acceptable verification method for SCN items.
- SCN items verified by code-inspection will be **automatically failed by the system**.
- The agent **must** report a `method` field (`browser` or `runtime-inspection`) for each SCN item.
- If a scenario cannot be verified at runtime, use `needs_credentials` status (not code-inspection pass).

**Why this alone is insufficient**: The existing prompt already says "Walk through each scenario in the live environment" (line 179) and "substituted with a weaker check... MUST report needs_credentials" (lines 320-325). Production data proves the agent self-rationalizes around prose. But the prompt still matters: it tells the agent what's expected and why, reducing unnecessary enforcement conversions.

### Layer 2: Schema Enforcement

**File**: `helix-global-server:sandbox-runtime-assets/workflow-steps/verification/step-config.mjs`
**Lines**: 524-547 (scenarioAcceptance item schema), 466-523 (other layer schemas)

**Change**: Add a `method` property to the cascade item schemas:

- **scenarioAcceptance items**: `method` is **required**, enum `["browser", "runtime-inspection"]`
- **planAdherence items**: `method` is **optional**, enum `["browser", "runtime-inspection", "code-inspection"]`
- **technicalValidation items**: `method` is **optional**, enum `["browser", "runtime-inspection", "code-inspection"]`

The SCN schema enum intentionally **excludes** `code-inspection`. The schema IS the policy -- it tells the agent what is valid. If a method is not allowed for SCN items, it must not appear as a valid option in the SCN schema.

The full three-value enum (`browser | runtime-inspection | code-inspection`) is used only in the shared TypeScript type (for TCK compatibility) and in the TCK/CHK schemas (where code-inspection is legitimate).

### Design Revision: Schema Is Policy

The prior version of this report (dated 2026-05-22) included `code-inspection` in the SCN schema enum with the rationale: *"the agent must honestly declare its method so the orchestrator can enforce the rule. If the enum excluded code-inspection, the agent would be forced to mislabel its method."*

User feedback correctly identified this as contradictory: **"I think it's silly to have a code inspection enum if it's not allowed."**

The revised design is simpler and clearer:

| Concern | Prior Approach | Revised Approach |
|---------|---------------|-----------------|
| Schema enum for SCN items | `["browser", "runtime-inspection", "code-inspection"]` | `["browser", "runtime-inspection"]` only |
| Rationale | Force honest reporting so orchestrator can reject | Schema defines what is valid -- don't offer a prohibited option |
| Primary enforcement | Orchestrator rejects code-inspection after the fact | Schema prevents code-inspection at the output level |
| Orchestrator role | Primary enforcement mechanism | Safety net for LLM outputs that bypass the schema |
| Shared TypeScript type | Same 3-value union | Same 3-value union (unchanged -- `code-inspection` is valid for TCK) |

**Why the revision is correct:**

1. **Simplicity**: The schema tells the agent exactly what's allowed. No contradiction between "here's an option" and "but you can't use it."
2. **Design coherence**: The SCN schema has no `code-inspection` option. The prompt explains why. The orchestrator catches edge cases. Each layer has a clear, non-contradictory role.
3. **LLM behavior**: LLMs can and do output values outside schema enums -- so the orchestrator safety net is still necessary. But the schema is the first line of defense, not a surveillance tool for catching violations.

*Source: User continuation feedback on RSH-581; revised diagnosis (helix-global-server) "Critical Design Revision" subsection; revised tech-research AD2.*

### Layer 3: Orchestrator Enforcement

**File**: `helix-global-server:src/helix-workflow/orchestrator/workflow-step-chain.ts`
**Lines**: 620-679 (convertInvalidPlatformDeferred precedent), ~1108 (call site)

**Change**: Create a new `convertInvalidCodeInspection` function following the exact `convertInvalidPlatformDeferred` pattern:

**Function signature**:
```typescript
function convertInvalidCodeInspection(cascade: VerificationCascade | null): {
  cascade: VerificationCascade | null;
  conversions: Array<{ layer: string; itemId: string; reason: string }>;
  failedLayer: string | null;
}
```

**Behavior**:
1. If cascade is null, return unchanged (backward compatible).
2. Iterate over `scenarioAcceptance.items` only (Layers 1 and 2 are not affected).
3. For each SCN item where `method === "code-inspection"` OR `method` is absent/invalid (not one of `"browser"` or `"runtime-inspection"`):
   - Convert `status` to `"fail"`
   - Append evidence: `"code-inspection is not a valid verification method for Scenario Acceptance items -- converted to fail. SCN items must be verified by runtime observation (browser or runtime-inspection)."`
4. Recompute `scenarioAcceptance.layerStatus` based on remaining pass/fail counts.
5. Set `failedLayer` to `"scenarioAcceptance"` if any items were converted and the layer now fails.
6. Return the modified cascade, conversion list, and failedLayer.

**Role clarification**: With the revised schema design, the orchestrator is the **safety net**, not the primary enforcement mechanism. The schema prevents code-inspection from being a valid output; the orchestrator catches cases where the LLM outputs values outside the schema (which happens), where method is missing, or where other unexpected values appear. Both layers are necessary -- but the schema is the first line.

**Call site**: Called immediately after `convertInvalidPlatformDeferred` at `workflow-step-chain.ts:~1108`, in the verification step outcome processing block:

```typescript
// Existing: enforce platform_deferred restrictions
const pdResult = convertInvalidPlatformDeferred(cascade, platform);
cascade = pdResult.cascade;
// ... logging

// NEW: enforce code-inspection restrictions on SCN items
const ciResult = convertInvalidCodeInspection(cascade);
cascade = ciResult.cascade;
if (ciResult.conversions.length > 0) {
  logRunWorkflowStep(runId, stepId, 
    `converted ${ciResult.conversions.length} invalid code-inspection SCN item(s): ${ciResult.conversions.map(c => c.itemId).join(', ')}`
  );
}
if (ciResult.failedLayer) {
  failedLayer = ciResult.failedLayer;
}
```

### Type System Update

**Server**: `helix-global-server:src/helix-workflow/step-executor/types.ts` (lines 37-44)

Add optional `method` field to `CascadeCheckItem`:
```typescript
method?: 'browser' | 'runtime-inspection' | 'code-inspection';
```

Optional on the TypeScript type for backward compatibility with existing cascade data that lacks it. The full 3-value union is used in the shared type because `code-inspection` is a legitimate method for TCK items. The per-layer restriction is enforced by the JSON schema (Layer 2) and orchestrator (Layer 3), not the type system.

**Client**: `helix-global-client:src/types/api.ts` (lines 557-564)

Mirror the server type addition:
```typescript
method?: 'browser' | 'runtime-inspection' | 'code-inspection';
```

### Client Display Update

**File**: `helix-global-client:src/components/run-history.tsx` (lines 135-218)

Add a method badge on each cascade item, following the existing `platform_deferred` badge pattern (`run-history.tsx:192-194`):

```jsx
<span className="ml-1 rounded px-1 py-0.5 text-[10px] font-medium text-status-platform-deferred bg-status-platform-deferred/10">
  Platform Deferred (NetSuite UI)
</span>
```

Method badge labels and colors:

| Method Value | Badge Label | Color Pattern |
|-------------|-------------|---------------|
| `browser` | "Browser" | Blue-teal OKLCH token (`--color-method-browser`) |
| `runtime-inspection` | "Runtime Inspection" | Purple OKLCH token (`--color-method-runtime-inspection`) |
| `code-inspection` | "Code Inspection" | Warm neutral OKLCH token (`--color-method-code-inspection`) |

The code-inspection badge exists for TCK items where code-inspection is a legitimate method. On SCN items, code-inspection items will already have been converted to `fail` by the orchestrator, so the badge primarily serves as a diagnostic indicator. No badge renders when method is absent (backward compatibility with historical data).

### Missing Method Handling

When the cascade is populated (not null) and an SCN item has no `method` field, it is treated as invalid and converted to fail. This is a fail-safe: if the schema validation works correctly, the field should always be present. Treating absence as invalid ensures agents cannot evade enforcement by omitting the field.

When the cascade itself is null (current state for all production runs), both enforcement functions return unchanged. Enforcement activates naturally as agents start producing cascade output with the new schema.

### RESEARCH Mode

No special handling needed. RESEARCH mode verification (`step-config.mjs:48-53`) uses a completely different prompt ("Verify the research report for completeness, accuracy, and coherence") and does not execute the verification cascade (Layers 1-3). The enforcement function operates on cascade data, so RESEARCH mode is a natural no-op.

---

## 6. Recommended Implementation Tickets

### Ticket 1: Server-Side SCN Method Enforcement

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-server |
| **Complexity** | Medium |
| **Dependencies** | None (foundational change) |

**Key Changes**:

| File | Change |
|------|--------|
| `src/helix-workflow/step-executor/types.ts:37-44` | Add optional `method` field to `CascadeCheckItem` (3-value union for TCK compatibility) |
| `sandbox-runtime-assets/workflow-steps/verification/step-config.mjs:177-186` | Add explicit code-inspection prohibition for SCN items |
| `sandbox-runtime-assets/workflow-steps/verification/step-config.mjs:524-547` | Add `method` enum to output JSON schema: **SCN = `["browser", "runtime-inspection"]` only**; TCK/CHK = `["browser", "runtime-inspection", "code-inspection"]` optional |
| `sandbox-runtime-assets/workflow-steps/verification/step-config.mjs:288-300` | Add method to SA evidence requirements |
| `src/helix-workflow/orchestrator/workflow-step-chain.ts:~620` | New `convertInvalidCodeInspection` function (safety net for LLM schema bypass) |
| `src/helix-workflow/orchestrator/workflow-step-chain.ts:~1108` | Call new function after `convertInvalidPlatformDeferred` |
| `src/helix-workflow/orchestrator/workflow-step-chain.test.ts` | Unit tests following `convertInvalidPlatformDeferred` test pattern |

### Ticket 2: Client-Side Method Display

| Attribute | Detail |
|-----------|--------|
| **Repos** | helix-global-client |
| **Complexity** | Low |
| **Dependencies** | Ticket 1 (server type definition) |

**Key Changes**:

| File | Change |
|------|--------|
| `src/types/api.ts:557-564` | Add optional `method` field to `CascadeCheckItem` |
| `src/components/run-history.tsx:177-218` | Add method badge to `CascadeLayerSection` items |
| `src/index.css:117-133` | Add OKLCH color tokens for verification methods |

### Ticket Dependency Map

```
Ticket 1 (server: type + schema + enforcement + prompt)
    |
    v
Ticket 2 (client: type mirror + method badge display)
```

Ticket 1 is foundational. Ticket 2 depends on the server type definition from Ticket 1.

### Issue Coverage Matrix

| Enforcement Gap | Ticket 1 | Ticket 2 |
|-----------------|----------|----------|
| Gap 1: No method in type system | Yes (server type) | Yes (client type) |
| Gap 2: No method in output schema | Yes | -- |
| Gap 3: No orchestrator enforcement | Yes | -- |
| Gap 4: Prose-only agent guidance | Yes | -- |
| Method visibility in UI | -- | Yes |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Agent compliance**: Adding required method enum may cause LLM output compliance issues (new required field with a 2-value enum for SCN) | Medium | Medium | Schema validation catches missing fields. Missing method treated as invalid (fail-safe). The field is simple (2-value enum for SCN) and will be described clearly in the prompt. Orchestrator safety net catches any values outside the enum. |
| **Runtime-unverifiable scenarios**: Some SCN scenarios may not be verifiable at runtime (feature-gated, external dependencies, sandbox limitations) | Medium | High | Agent should use `needs_credentials` status for scenarios it cannot verify at runtime. This is already an existing, documented option. The prompt should reinforce this path. |
| **Verification pass rate impact**: Enforcement could drop pass rates significantly if many scenarios are currently only verifiable by code-inspection | Medium | High | Defense-in-depth creates the right incentive: agents will adapt to use runtime methods. `needs_credentials` provides a compliant escape valve. Monitor pass rates after rollout. |
| **Cascade data population prerequisite**: No production runs currently populate structured cascade data | High | High | Enforcement only activates when cascade is populated. This is the key prerequisite: the verification agent must reliably produce cascade output. If it doesn't, enforcement is a no-op and the problem persists. |
| **Backward compatibility with existing reports**: Existing verification reports lack the method field | Low | Low | Method field is optional on TypeScript types. Client renders no badge when method is absent. Enforcement functions return unchanged for null cascade. |
| **Over-enforcement**: Legitimate runtime verifications mislabeled by the agent | Low | Medium | Clear method enum definitions in the prompt. `browser` and `runtime-inspection` are distinct, well-defined categories. Agent has explicit guidance on which tools map to which method. |

---

## 8. Open Questions

These questions were identified during the investigation and should be tracked for follow-up:

| # | Question | Source | Status |
|---|----------|--------|--------|
| 1 | What proportion of the 120+ "unlabeled" SCN items are actually code-inspection? | Scout artifact analysis | **Open** -- True prevalence may be much higher than the explicit rate |
| 2 | Should the product step define a "verification hint" per SCN item (browser, API, runtime-inspection)? | Product artifact OQ | **Open** -- Would guide the verification agent on the expected method per scenario |
| 3 | What is the correct disposition for SCN scenarios that are genuinely unverifiable at runtime? | Product artifact OQ #1 | **Open** -- `needs_credentials` is the current answer; may need a distinct status like `not_runtime_verifiable` |
| 4 | What is the acceptable method enum for SCN items? | Tech-research AD #2 | **Resolved** -- SCN enum = `["browser", "runtime-inspection"]` only. User feedback confirmed: do not include `code-inspection` in the SCN schema. The schema defines what is valid, not what should be caught after the fact. |
| 5 | Should RESEARCH mode SCN items have different method expectations? | Product artifact OQ #5 | **Resolved** -- RESEARCH mode doesn't use the cascade, so enforcement is a natural no-op |
| 6 | Will enforcement have data to inspect given cascade is currently unpopulated? | Diagnosis finding + Product OQ #2 | **Open** -- This is the key prerequisite. If agents don't populate cascade, enforcement has nothing to act on |

---

## 9. Deferred Investigations

| # | Item | Rationale for Deferral |
|---|------|----------------------|
| 1 | **Verification hint in product step** | SCN scenarios could include a "verification approach" hint to guide the agent. Deferred: adds complexity to the product step with uncertain benefit until enforcement is in place. |
| 2 | **Admin analytics method breakdown** | `admin-verification-outcomes-service.ts` could expose method-based analytics (e.g., "what % of SCN items were browser vs. runtime-inspection"). Deferred until method data flows. |
| 3 | **Graduated enforcement** | Converting code-inspection SCN items to a "warning" state before hard fail. Deferred: `needs_credentials` already provides the compliant fallback path. Immediate enforcement aligns with ticket owner's intent. |
| 4 | **Historical SCN item re-classification** | The ~178 unlabeled SCN items from the past 14 days cannot be retroactively classified. Future data will have structured method fields. |
| 5 | **Helix Reply service cascade awareness** | `helix-reply-service.ts:511-523` reads `verificationReport.checks` but not cascade data. Exposing method information to the Reply agent is a future enhancement. |
| 6 | **Method-based filtering/sorting in client UI** | Allow reviewers to filter cascade items by method in the verification panel. Deferred: no immediate need beyond visibility. |

---

## 10. Evidence Summary

### Production Database Evidence

| Query | Result | Date Queried |
|-------|--------|--------------|
| Total runs in 14 days | 416 | 2026-05-23 |
| Runs with structured verificationCascade | 0 (0.0%) | 2026-05-23 |
| Runs with legacy steps array | 416 (100%) | 2026-05-23 |
| Screenshot run (cmphgyho2...) SCN items | 10 total: 8 code-inspection, 2 runtime | 2026-05-22 |
| Screenshot run outcome | verified | 2026-05-23 |
| SCN-mentioning steps across all runs (14 days) | ~205 total | 2026-05-23 |
| Explicitly code-inspection prefixed | 8 (step-text analysis) | 2026-05-23 |
| Explicitly runtime/browser prefixed | 19 (step-text analysis) | 2026-05-23 |
| Method unlabeled in step text | ~178 (step-text analysis) | 2026-05-23 |
| Prior scout-phase SCN item sample | ~170 items: 27 code-inspection, 37 runtime, ~120 unlabeled | 2026-05-22 |

*Note: Step-text analysis and scout-phase sampling use different methodologies (step-text grep vs. individual item extraction), producing different absolute numbers. Both confirm the same pattern: a large majority of SCN items have no explicit method label, and zero runs populate structured cascade data.*

### Code Reference Summary

| Reference | File | Line(s) | Repo | Verified |
|-----------|------|---------|------|----------|
| CascadeCheckItem type (no method field) | types.ts | 37-44 | helix-global-server | Yes |
| CascadeLayerResult type | types.ts | 52-55 | helix-global-server | Yes |
| VerificationCascade type | types.ts | 57-61 | helix-global-server | Yes |
| Layer 3 prose instruction | verification/step-config.mjs | 177-186 | helix-global-server | Yes |
| SA evidence requirements | verification/step-config.mjs | 288-300 | helix-global-server | Yes |
| PASS REQUIRES FULL VERIFICATION rule | verification/step-config.mjs | 320-325 | helix-global-server | Yes |
| scenarioAcceptance item schema | verification/step-config.mjs | 524-547 | helix-global-server | Yes |
| convertInvalidPlatformDeferred function | workflow-step-chain.ts | 620-679 | helix-global-server | Yes |
| Verification step outcome processing | workflow-step-chain.ts | 1097-1115 | helix-global-server | Yes |
| convertInvalidPlatformDeferred call site | workflow-step-chain.ts | ~1108 | helix-global-server | Yes |
| consistency-guard shouldRouteToUnverified | consistency-guard.ts | 13-22 | helix-global-server | Yes |
| TCK Verification Method field | tech-research/step-config.mjs | 211, 221 | helix-global-server | Yes |
| SCN item format (no method hint) | product/step-config.mjs | 87-111 | helix-global-server | Yes |
| isResearch check | verification/step-config.mjs | 16 | helix-global-server | Yes |
| Client CascadeCheckItem type | api.ts | 557-564 | helix-global-client | Yes |
| CascadeLayerSection component | run-history.tsx | 135-218 | helix-global-client | Yes |
| platform_deferred badge pattern | run-history.tsx | 192-194 | helix-global-client | Yes |
| Cascade fallback to steps list | run-history.tsx | 327-329 | helix-global-client | Yes |
| Prior research (enforcement gaps) | reports/RSH-550/report.md | 53 | library | Yes |

---

## 11. Methodology & Data Sources

### Investigation Approach

1. **Multi-repo artifact synthesis**: Scout, diagnosis, product, and tech-research artifacts were produced independently for all 4 repositories (helix-global-server, helix-global-client, helix-cli, library). This report synthesizes findings from all upstream artifacts into a unified analysis and recommendation.

2. **Production data verification**: Database statistics were verified through runtime inspection queries against the production database on May 22-23, 2026. Key queries: cascade population status (0/416 runs), screenshot run verification steps (confirmed 8/10 code-inspection), and recent run sampling for SCN method analysis. Aggregate SCN item statistics come from both scout-phase runtime queries and fresh step-text analysis.

3. **Code reference verification**: All code references (file:line) were verified by reading the actual source files in the current codebase during scout and diagnosis phases. All 19 references confirmed accurate.

4. **Architecture decision tracing**: Implementation recommendations originate from tech-research architecture decisions: 6 decisions for helix-global-server (method field scope, enum values, defense-in-depth, enforcement function design, missing method handling, RESEARCH mode) and 3 decisions for helix-global-client (optional field, badge pattern, color tokens). Each evaluated 2-4 options with explicit rationale.

5. **Prior research alignment**: RSH-550 previously identified "enforcement gaps where prose guidance replaces code enforcement" as a systemic verification problem (report.md:53). RSH-581 confirms this pattern specifically for SCN verification methods and provides a concrete fix.

6. **User feedback incorporation**: The user's continuation feedback ("I think it's silly to have a code inspection enum if it's not allowed") prompted a key design revision in the second run. The prior report's Section 5 Layer 2 recommended including `code-inspection` in the SCN enum for honest reporting. The revised design excludes it entirely -- the schema IS the policy. This revision was incorporated through updated diagnosis, product, and tech-research artifacts, then reflected in Sections 1, 5, 6, 7, and 8 of this report.

### Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library) | Problem statement and scope | Two questions: (1) creative/non-creative ways to ensure outcomes, (2) how to implement |
| User continuation context (ticket.md) | Design feedback on prior report | "I think it's silly to have a code inspection enum if it's not allowed" -- drove schema-is-policy revision |
| Screenshot_20260522_191255_Chrome.jpg | Visual evidence of the problem | 8/10 SCN items show "Code-inspection:" prefix with green PASS in production |
| scout/scout-summary.md (library) | Cross-repo analysis and production data | 170 SCN items in 14 days; 4-level enforcement gap; 15.9% explicit code-inspection |
| scout/reference-map.json (library) | File mapping across all repos | Key files with line-level evidence for each enforcement gap |
| scout/scout-summary.md (helix-global-server) | Server architecture analysis | convertInvalidPlatformDeferred as reusable enforcement pattern; no method field at any level |
| scout/reference-map.json (helix-global-server) | Server file-level evidence | CascadeCheckItem type, output schema, orchestrator enforcement lines |
| scout/scout-summary.md (helix-global-client) | Client display analysis | platform_deferred visual pattern as display precedent |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause: 4-gap enforcement model; revised SCN enum | SCN schema must NOT include code-inspection; "Critical Design Revision" subsection |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client root cause | Client mirrors server gap; no method distinction in UI |
| product/product.md (helix-global-server) | Product requirements, scenarios, open questions | 5 MVP features, 8 scenarios, schema-is-policy principle |
| tech-research/tech-research.md (helix-global-server) | Technical architecture decisions (revised) | AD2: SCN enum = `["browser", "runtime-inspection"]` only; 6 total ADs |
| tech-research/tech-research.md (helix-global-client) | Client technical decisions | 3 ADs: optional method field, badge display pattern, OKLCH color tokens |
| repo-guidance.json | Repo intent classification | server=target, client=target, library=context, cli=context |
| library/reports/RSH-550/report.md | Report format reference and prior research | Established structure. Identified prose-vs-enforcement pattern. |
| /tmp/helix-inspect/manifest.json | Runtime inspection availability | DATABASE and LOGS available for helix-global-server production data |
| Production DB (runtime inspection, May 23) | Fresh data verification | 416 runs/0 cascade data, screenshot run confirmed, step-text method analysis |

## Attachments
- (none)
