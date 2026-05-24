# Ticket Context

- ticket_id: cmpj0kmd6006de80to8dytrac
- short_id: FIX-600
- run_id: cmpj0kmdn006ie80t775knaew
- run_branch: helix/fix/FIX-600-verifying-is-still-off-illegitimate-needs
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Verifying is still off. Illegitimate needs credentials and crashing report

## Description
Build ticket to implement research from RSH-599.

#FIX-588 

#FIX-594 



There is zero chance this ticket needs credentials. It still crashes when I look at the verification report 



Fill up a coffee, take a walk, and go back to the drawing board. Look at the original intention and if there are any holes 



Once you have it all figured out, come up with something beautiful 



#RSH-550

## Research Report

# Research Report: False NEEDS_CREDENTIALS Classification & Verification Report Crash

**Ticket**: RSH-599
**Date**: 2026-05-23
**Status**: Ready for Implementation
**Repos**: helix-global-server, helix-global-client
**Referenced Tickets**: RSH-550 (original 6-issue research), FIX-594 (prior server fix), FIX-588 (misclassified ticket)
**Run**: 2 (supersedes run-1 report which covered crash only)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Background & Prior Work](#2-background--prior-work)
3. [Problem 1: False NEEDS_CREDENTIALS Classification (PRIMARY)](#3-problem-1-false-needs_credentials-classification-primary)
4. [Problem 2: Verification Report Crash (SECONDARY)](#4-problem-2-verification-report-crash-secondary)
5. [Problem 3: Schema Allows Null Justification](#5-problem-3-schema-allows-null-justification)
6. [Recommended Fix -- Server (helix-global-server)](#6-recommended-fix----server-helix-global-server)
7. [Recommended Fix -- Client (helix-global-client)](#7-recommended-fix----client-helix-global-client)
8. [Cross-Repo Coordination](#8-cross-repo-coordination)
9. [Out of Scope / Future Work](#9-out-of-scope--future-work)
10. [Risk Assessment](#10-risk-assessment)
11. [Evidence Summary](#11-evidence-summary)
12. [Methodology & Data Sources](#12-methodology--data-sources)

---

## 1. Executive Summary

Two interrelated problems exist in the Helix verification system:

**PRIMARY -- False NEEDS_CREDENTIALS Classification**: Tickets are being falsely marked as NEEDS_CREDENTIALS when they clearly have nothing to do with credentials. The user explicitly states: *"There is zero chance this ticket needs credentials... Why are there many tickets coming up as needing credentials when there are no credentials in sight?"* FIX-588 is the cited example: 6 of 8 verification checks passed, 2 were blocked by a server HTTP 500 error -- zero credential involvement -- yet the ticket was marked NEEDS_CREDENTIALS.

**This is not an agent behavioral issue.** The run-1 report (this ticket's first investigation) explicitly marked false classification as "out of scope / agent behavioral." This was incorrect. The root cause is **contradictory instructions in the verification step-config**: the NEEDS_CREDENTIALS BOUNDARY (step-config.mjs:244-264) correctly limits the outcome to 2 triggers with 11 explicit exclusion categories, but the FAILURE HANDLING section (lines 315-357) contains **5 contradictory directives** that broaden `needs_credentials` to cover any server error, infrastructure gap, or blocked check -- directly overriding the boundary.

**SECONDARY -- Verification Report Crash**: When users try to view the verification report for any needs_credentials run, the page crashes with a TypeError. The crash occurs because the server's needs_credentials code paths omit the `steps` field, and the client accesses `report.steps.length` without a null guard.

### Key Findings

| # | Finding | Severity | Root Cause | Repo |
|---|---------|----------|------------|------|
| 1 | Step-config FAILURE HANDLING contradicts NEEDS_CREDENTIALS BOUNDARY with 5 broadening directives | **Critical** | Contradictory LLM instructions | helix-global-server |
| 2 | 3 of 5 production NEEDS_CREDENTIALS runs are confirmed false positives | **High** | Caused by Finding #1 | helix-global-server |
| 3 | Two `needs_credentials` code paths omit `steps` and `remediationGuidance` from verification reports | **High** | Inconsistent report construction | helix-global-server |
| 4 | Missing null guard on `report.steps.length` crashes the page | **High** | Client does not guard against missing field | helix-global-client |
| 5 | `VerificationReport` type declares `steps` as required; production data disagrees | Medium | Type-level false safety | helix-global-client |
| 6 | No ErrorBoundary on VerificationReportSection | Medium | Uncontained crash propagation | helix-global-client |
| 7 | JSON schema allows null for `needsCredentialsJustification` despite prose requiring it | Medium | Schema-prose misalignment | helix-global-server |
| 8 | All 5 production NEEDS_CREDENTIALS runs have null justification | Medium | Caused by Finding #7 | helix-global-server |

### Resolution

Six targeted changes across both repos:

| # | Fix | Repo | Addresses |
|---|-----|------|-----------|
| 1 | Rewrite FAILURE HANDLING to align with BOUNDARY | helix-global-server | Findings #1, #2 |
| 2 | Add `steps` and `remediationGuidance` to both needs_credentials handlers | helix-global-server | Finding #3 |
| 3 | Remove null from `needsCredentialsJustification` schema | helix-global-server | Findings #7, #8 |
| 4 | Make `steps` and `remediationGuidance` optional in TypeScript type | helix-global-client | Finding #5 |
| 5 | Add optional chaining guards on `report.steps` access | helix-global-client | Finding #4 |
| 6 | Wrap VerificationReportSection in ErrorBoundary | helix-global-client | Finding #6 |

---

## 2. Background & Prior Work

### RSH-550: Original 6-Issue Research (2026-05-21)

RSH-550 was the first comprehensive investigation into verification and demo problems. It identified 6 distinct issues:

| Issue | Description | Resolution Status |
|-------|-------------|-------------------|
| 3.1 | Demo content never persisted | Partially addressed |
| 3.2 | Demo viewer mispositioned | Fixed |
| 3.3 | Verification broken crash (ArtifactViewer) | Partially fixed -- ErrorBoundary added around ArtifactViewer only |
| 3.4 | `verification_broken` outcome still active | Fixed -- removed from step-config, fallback changed, consistency guard added |
| 3.5 | `platform_deferred` unrestricted | Fixed -- restricted to scenarioAcceptance schema |
| 3.6 | Status/outcome data inconsistency | Fixed -- consistency guard prevents SUCCEEDED+non-verified |

**Critical gap in RSH-550**: The investigation focused on `verification_broken` crash paths through ArtifactViewer. It did **not** examine:
- The `needs_credentials` data shape gap (a separate crash path through `VerificationReportSection`)
- The contradictory instructions in step-config that cause false NEEDS_CREDENTIALS classifications

### FIX-594: Server-Side Fixes (Deployed 2026-05-22)

FIX-594 fixed two server-side bugs:

| Bug Fixed | File | Change |
|-----------|------|--------|
| Proof screenshot guard overwrites terminal ticket status | `orchestrator.ts:2078` | Expanded guard to exclude NEEDS_CREDENTIALS and IMPOSSIBLE_SPEC |
| `stepSummaries` lost during run summary updates | `run-store.ts:252-288` | Extended `mergeExistingStepArtifacts` to preserve stepSummaries |

**What FIX-594 did NOT address**: The verification report data shape gaps and the step-config contradictions. The `chainVerificationReport` construction paths in `workflow-step-chain.ts` were not modified.

### Run-1 Report: Crash-Only Analysis (2026-05-23)

This ticket's first investigation (run-1) focused exclusively on the verification report crash. It correctly identified:
- Server: Two needs_credentials paths omit `steps` and `remediationGuidance`
- Client: Missing null guard at run-history.tsx:357, inaccurate TypeScript type, no ErrorBoundary

However, run-1 **explicitly marked the false classification problem as out-of-scope** (Section 6, items 1 and 2), categorizing it as "Agent behavioral -- the agent is not honoring the boundary."

### Why Run-1's Scope Was Insufficient

The run-1 report's characterization of false classification as "agent behavioral" was incorrect. The current analysis proves the root cause is **contradictory instructions in the step-config itself**:

- The NEEDS_CREDENTIALS BOUNDARY (lines 244-264) says: "Network-inaccessible dependency -> FAILED"
- The FAILURE HANDLING section (line 347) says: "server down, login fails, missing backend -> needs_credentials"

The agent encounters FIX-588's server HTTP 500 errors, reads line 347, and follows it. **The agent is honoring the instructions -- it's the instructions that are wrong.** The 5 contradictory directives in FAILURE HANDLING (lines 319, 325, 339, 345, 347) actively instruct the agent to report `needs_credentials` for scenarios the BOUNDARY explicitly excludes.

This updated report elevates false classification from "out of scope / agent behavioral" to **PRIMARY root cause: contradictory step-config instructions**.

### Context Chain

```
RSH-550 (6 issues) -> Remediation -> FIX-594 (2 bugs) -> RSH-599 run-1 (crash only)
                                                         -> RSH-599 run-2 (THIS REPORT):
                                                            PRIMARY: False classification (step-config contradiction)
                                                            SECONDARY: Crash (data shape gap)
                                                            TERTIARY: Null justification (schema gap)
```

---

## 3. Problem 1: False NEEDS_CREDENTIALS Classification (PRIMARY)

### User Impact

Tickets like FIX-588 are marked NEEDS_CREDENTIALS when there are no credentials involved whatsoever. This:
- Wastes developer time investigating non-existent credential issues
- Blocks the ticket pipeline (NEEDS_CREDENTIALS halts progress)
- Erodes trust in the verification system
- Prevents the ticket from advancing through re-verification

The user's frustration is clear: *"I don't know why FIX 588 says it needs credentials. It clearly does not need credentials and this is happening frequently."*

### Step-Config Contradiction Analysis

The verification step-config (`sandbox-runtime-assets/workflow-steps/verification/step-config.mjs`) contains two sections that directly contradict each other:

#### NEEDS_CREDENTIALS BOUNDARY (lines 244-264) -- The Correct Definition

The BOUNDARY defines exactly 2 valid triggers for `needs_credentials`:
1. **Missing new credential**: A ticket requires a new API key, environment variable, or secret that has not been provisioned
2. **No test environment**: A ticket requires a test/staging environment that does not exist

And explicitly lists categories that are **NEVER** `needs_credentials`:

| # | Category | Correct Outcome |
|---|----------|----------------|
| 1 | Billing/quota/plan limits | FAILED |
| 2 | Network-inaccessible dependency | FAILED |
| 3 | Environment/infrastructure agent can fix | Agent resolves |
| 4 | Tooling/browser failures | Agent resolves |
| 5 | Code defects | implementation_wrong |
| 6 | Model configuration | Agent resolves |
| 7 | Spec conflicts | impossible_spec |
| 8 | Flawed research | implementation_wrong |
| 9 | Ill-specified scenarios | impossible_spec |
| 10 | Impossible/wrong spec | impossible_spec |

#### FAILURE HANDLING (lines 315-357) -- The Contradictory Section

Five directives in this section broaden `needs_credentials` far beyond the BOUNDARY:

| Line | Contradictory Instruction | What BOUNDARY Says | Impact |
|------|---------------------------|--------------------|--------|
| **319** | "Report needs_credentials if a cascade layer cannot be executed due to **environment, tooling, or infrastructure gaps**" | Categories #3, #4: environment/tooling -> agent resolves; #2: network -> FAILED | Routes infrastructure failures to needs_credentials |
| **325** | "If any step was **skipped, blocked**... you MUST report needs_credentials or implementation_wrong -- never pass" | Blocked by infrastructure != missing credentials per BOUNDARY | Routes any blocked check to needs_credentials |
| **339** | "A check that **could not be performed**... outcome is unknown, not positive. Report needs_credentials" | Converts ANY unverifiable check into needs_credentials regardless of reason | Massive over-broadening |
| **345** | "If the **dev server fails to start**, report needs_credentials" | Category #3: environment/infrastructure agent can fix -> agent resolves | Dev server failures -> needs_credentials |
| **347** | "**server down, login fails, missing backend** -> needs_credentials -- not pass" | Category #2: network-inaccessible dependency -> FAILED | Direct contradiction of BOUNDARY |

### How FIX-588 Was Misclassified

FIX-588 ("Goals: T6") is a concrete example of this contradiction in action:

1. Verification ran 8 checks (CHK-01 through CHK-08)
2. **6 checks passed**: TypeScript compilation, ESLint, production build, Goals navigation visible, Goal list page renders, No ticket UI changes
3. **2 checks BLOCKED**: Create Goal form submission and Goal detail page -- both blocked by **server HTTP 500** for POST /api/goals and GET /api/goals/:id
4. The agent encountered "server returns HTTP 500" -> matched line 347 ("server down, missing backend -> needs_credentials")
5. Result: ticket marked NEEDS_CREDENTIALS with **zero credential involvement**

The correct classification per the BOUNDARY would be **FAILED** (Category #2: network-inaccessible dependency -> FAILED) or **implementation_wrong** (Category #5: code defect producing HTTP 500).

### Production Evidence: False Positive Breakdown

Of 5 NEEDS_CREDENTIALS runs in production (queried 2026-05-23):

| Run ID | Ticket | Failure Reason | Credential Involvement | Classification |
|--------|--------|----------------|----------------------|----------------|
| cmphmsz36... | #588 | Server HTTP 500 on Goal API (6/8 CHK passed, 2 blocked) | **None** | **False positive** |
| cmphwyd93... | #587 | T6 UI pages don't exist; Goal API returns HTTP 500 | **None** | **False positive** |
| cmphmrx9x... | #587 | T6 UI pages don't exist; server Goal API returns HTTP 500 | **None** | **False positive** |
| cmphiph2v... | #33 | SDF deployment not executed (orchestrator-managed); 1 CHK blocked | Partial -- SDF deployment is platform-managed | **Borderline** |
| cmphip8eg... | #32 | Sandbox deployment + CSV import test data needed; 2 CHK + 5 SCN blocked | Partial -- sandbox access needed | **Borderline** |

**At least 3 of 5 are confirmed false positives** -- server errors and missing upstream dependencies, not missing credentials. The 2 borderline cases (tickets #33 and #32) involve NetSuite sandbox deployment that is orchestrator-managed -- arguably infrastructure, not credentials -- and both lack proper justification regardless.

**All 5 runs have `needsCredentialsJustification: null`**, meaning even the potentially legitimate cases provide zero useful information about what credentials are needed.

---

## 4. Problem 2: Verification Report Crash (SECONDARY)

### User Impact

When a user expands a `needs_credentials` verification report in run history, the page crashes immediately with a TypeError. The user sees a blank screen or React error overlay. They must navigate away and lose their browsing context.

### Server Root Cause: Inconsistent Report Shape

Five code paths in `workflow-step-chain.ts` construct `chainVerificationReport`. Two needs_credentials paths omit fields that all other paths include:

| Path | Lines | `steps` | `cascade` | `remediationGuidance` | `attemptedStrategies` |
|------|-------|---------|-----------|----------------------|----------------------|
| Universal needs_credentials | 1140-1143 | **missing** | **missing** | **missing** | **missing** |
| Verification needs_credentials | 1298-1303 | **missing** | present | **missing** | **missing** |
| impossible_spec | 1225-1231 | present | present | missing | present |
| FAILED | 1554-1560 | present | present | present | present |
| verified | 1870-1876 | present | present | null | present |

The **universal handler** (line 1106) fires first because step-config line 237 instructs the agent to set both `status: "NEEDS_CREDENTIALS"` and `verificationResult: "needs_credentials"`. The `status` check catches it before the verification-specific handler (line 1166).

**Universal handler report shape** (workflow-step-chain.ts:1140-1143):
```typescript
chainVerificationReport = {
  outcome: "needs_credentials",
  needsCredentialsJustification: stepResult.needsCredentialsJustification ?? null,
  details: stepResult.summary,
};
```

**Verification handler report shape** (workflow-step-chain.ts:1298-1303):
```typescript
chainVerificationReport = {
  outcome: "needs_credentials",
  cascade,
  needsCredentialsJustification: stepResult.needsCredentialsJustification ?? null,
  details: vDetails,
};
```

Both are missing `steps`, `remediationGuidance`, and `attemptedStrategies`.

### Client Root Cause: Missing Null Guard

The crash occurs in `VerificationReportSection` (run-history.tsx:304-391) at **line 357**:

```tsx
// Lines 353-357
{report.cascade ? (
  <CascadeView cascade={report.cascade} />
) : (
  <>
    {report.steps.length > 0 ? (  // <-- CRASH: report.steps is undefined
```

When `cascade` is null (universal handler path), the code enters the else branch and accesses `.length` on `undefined`, producing a TypeError.

Line 361 has the same vulnerability:
```tsx
{report.steps.map((step, i) => (  // <-- Also crashes if steps is undefined
```

### Type-Level False Safety

The `VerificationReport` type (api.ts:589) declares `steps: string[]` as **required**, but production `needs_credentials` data does not include this field. The data flows from a Prisma `Json?` column through raw JSON passthrough (ticket-service.ts:585) with zero runtime validation.

### Missing ErrorBoundary

VerificationReportSection renders at run-history.tsx:768 without any ErrorBoundary wrapping. The existing ErrorBoundary (error-boundary.tsx) only protects ArtifactViewer (ticket-detail.tsx:2554-2580). Any rendering error propagates uncontained, crashing the entire page.

### Production Data Shape Confirmation

| Outcome | Records | `steps` present | `remediationGuidance` present | Crash? |
|---------|---------|-----------------|------------------------------|--------|
| verified | 809 | Yes (all) | Yes (all) | No |
| verification_broken | 153 | Yes (all) | Yes (all) | No |
| implementation_wrong | 16 | Yes (all) | Yes (all) | No |
| needs_credentials | 5 | **No (none)** | **No (none)** | **Yes** |
| impossible_spec | 1 | Yes | No | No (client uses truthiness guard) |

*Source: Production DB query, 2026-05-23. Totals reflect all-time counts, not just 7-day window.*

---

## 5. Problem 3: Schema Allows Null Justification

### The Gap

The JSON schema in step-config.mjs (line 573-574) defines `needsCredentialsJustification` as:
```json
"needsCredentialsJustification": {
  "type": ["object", "null"]
}
```

The prose at line 266 says: "MUST populate `needsCredentialsJustification` with `envVars` and `subCase`."

The schema allows `null`, so the agent satisfies the schema by returning `null` and ignoring the prose. All 5 production records have `needsCredentialsJustification: null`, which means:
- The `NeedsCredentialsPanel` in the client never renders (it uses a truthiness guard at run-history.tsx:381)
- Users receive zero information about what credentials are supposedly needed
- Even for the 2 borderline cases (tickets #32, #33) where credentials might genuinely be needed, no actionable information is provided

### Impact

This does not cause a crash (the client guards against null), but it makes every `needs_credentials` classification useless -- the user sees the outcome but gets no details about what to do.

---

## 6. Recommended Fix -- Server (helix-global-server)

### Fix 1: Rewrite FAILURE HANDLING to Align with BOUNDARY

**File**: `sandbox-runtime-assets/workflow-steps/verification/step-config.mjs`
**Lines**: 315-357

The FAILURE HANDLING section and related sub-sections must be rewritten so that infrastructure failures, server errors, and blocked non-credential checks route to **FAILED** instead of `needs_credentials`. The BOUNDARY definition (lines 244-264) is correct and must not change.

**Rules to preserve** (currently correct):
- "Report pass only if all three cascade layers passed" (line 317)
- "Partial verification is NOT a pass" (line 328)
- "Code review alone does NOT satisfy browser/API verification" (line 326)
- "Before reporting needs_credentials, MUST attempt to create needed conditions" (lines 350-354)
- "Only report needs_credentials after genuine attempts have failed" (line 355)

**Rules to fix** (5 contradictory directives):

| Current Line | Current Text | Required Change |
|-------------|-------------|-----------------|
| 319 | "Report needs_credentials if a cascade layer cannot be executed due to environment, tooling, or infrastructure gaps" | Infrastructure/tooling gaps -> FAILED per BOUNDARY #2, #3, #4. Only genuinely missing new credential -> needs_credentials. |
| 325 | "If any step was skipped, blocked... you MUST report needs_credentials or implementation_wrong" | Blocked by infrastructure -> FAILED. Blocked by missing credentials per BOUNDARY -> needs_credentials. Blocked by code defect -> implementation_wrong. |
| 339 | "A check that could not be performed... Report needs_credentials" | Distinguish: could not perform due to missing credential (needs_credentials) vs. infrastructure failure (FAILED) vs. code defect (implementation_wrong). |
| 345 | "If the dev server fails to start, report needs_credentials" | FAILED per BOUNDARY #3 (environment/infrastructure -> agent resolves, then FAILED if unresolvable). |
| 347 | "server down, login fails, missing backend -> needs_credentials" | Server down -> FAILED per BOUNDARY #2. Login fails due to code bug -> implementation_wrong. Login fails due to missing credential -> needs_credentials per BOUNDARY. |

**Before** (representative excerpt, lines 344-347):
```
FAILURE HANDLING:
- The dev server fails to start, a configuration file is missing, or a build-time env var is absent → report needs_credentials.
- Any infrastructure gap: server down, login fails, missing backend → report needs_credentials — not pass.
```

**After** (recommended replacement):
```
FAILURE HANDLING:
- If the dev server fails to start due to a code error or missing build dependency: FAILED (not needs_credentials).
- If the dev server fails to start because a genuinely new credential/env var is needed (per the NEEDS_CREDENTIALS BOUNDARY): needs_credentials.
- Server down, backend unavailable, or network errors: FAILED (per BOUNDARY category #2: network-inaccessible dependency).
- Login fails due to incorrect credentials in code: implementation_wrong.
- Login fails due to a genuinely missing new credential not yet provisioned: needs_credentials (per BOUNDARY trigger #1).
- For ALL failure scenarios, consult the NEEDS_CREDENTIALS BOUNDARY (above) before choosing needs_credentials. If the failure does not match one of the 2 BOUNDARY triggers, it is NOT needs_credentials.
```

### Fix 2: Add Missing Fields to Both needs_credentials Handlers

**File**: `src/helix-workflow/orchestrator/workflow-step-chain.ts`

**Universal needs_credentials handler (lines 1140-1143)**:

```typescript
// BEFORE
chainVerificationReport = {
  outcome: "needs_credentials",
  needsCredentialsJustification: stepResult.needsCredentialsJustification ?? null,
  details: stepResult.summary,
};

// AFTER
chainVerificationReport = {
  outcome: "needs_credentials",
  needsCredentialsJustification: stepResult.needsCredentialsJustification ?? null,
  details: stepResult.summary,
  steps: stepResult.verificationSteps ?? [],
  remediationGuidance: stepResult.remediationGuidance ?? null,
  attemptedStrategies: accumulatedStrategies,
};
```

**Verification needs_credentials handler (lines 1298-1303)**:

```typescript
// BEFORE
chainVerificationReport = {
  outcome: "needs_credentials",
  cascade,
  needsCredentialsJustification: stepResult.needsCredentialsJustification ?? null,
  details: vDetails,
};

// AFTER
chainVerificationReport = {
  outcome: "needs_credentials",
  cascade,
  needsCredentialsJustification: stepResult.needsCredentialsJustification ?? null,
  details: vDetails,
  steps: vSteps,
  remediationGuidance: vRemediation,
  attemptedStrategies: accumulatedStrategies,
};
```

**Why `steps: stepResult.verificationSteps ?? []`** in the universal handler: This handler fires for ANY step (not just verification). For non-verification steps, `stepResult.verificationSteps` may be undefined, so the `?? []` fallback is essential. For the verification-specific handler, `vSteps` is already extracted (line 1168) and safe to use directly.

### Fix 3: Remove Null from needsCredentialsJustification Schema

**File**: `sandbox-runtime-assets/workflow-steps/verification/step-config.mjs`
**Line**: 573-574

```javascript
// BEFORE
"needsCredentialsJustification": {
  "type": ["object", "null"],

// AFTER
"needsCredentialsJustification": {
  "type": "object",
```

This forces the agent to either provide proper justification (with `envVars` and `subCase`) or choose a different outcome. If you cannot name the missing credential, `needs_credentials` is the wrong outcome.

### What Does NOT Need to Change

| File | Why No Change Needed |
|------|---------------------|
| `run-store.ts` | No shape validation needed -- product spec excludes persistence-layer changes |
| `ticket-service.ts` | No API normalization needed -- server fix (new records) + client fix (historical records) provide full coverage |
| `consistency-guard.ts` | Guards status consistency, not report shape; working correctly |
| `prisma/schema.prisma` | `verificationReport` remains `Json?` -- no migration needed |

---

## 7. Recommended Fix -- Client (helix-global-client)

### Fix 4: Make Types Match Production Reality

**File**: `src/types/api.ts` (lines 589, 591)

```typescript
// BEFORE
export type VerificationReport = {
  outcome: VerificationOutcome;
  steps: string[];
  details: string;
  remediationGuidance: string | null;
  // ...
};

// AFTER
export type VerificationReport = {
  outcome: VerificationOutcome;
  steps?: string[];
  details: string;
  remediationGuidance?: string | null;
  // ...
};
```

**Blast radius**: Minimal. Only `run-history.tsx:357` and `run-history.tsx:361` access `report.steps`. `ticket-summary.tsx` only accesses `outcome` and `details` -- safe.

### Fix 5: Add Null Guards

**File**: `src/components/run-history.tsx`

```tsx
// BEFORE (line 357)
{report.steps.length > 0 ? (

// AFTER
{report.steps?.length ? (
```

```tsx
// BEFORE (line 361)
{report.steps.map((step, i) => (

// AFTER
{report.steps?.map((step, i) => (
```

Optional chaining is consistent with the existing pattern in this component -- `report.details` (line 367), `report.remediationGuidance` (line 373), `report.needsCredentialsJustification` (line 381), and `report.specDeviations` (line 384) all use truthiness guards.

### Fix 6: Wrap in ErrorBoundary

**File**: `src/components/run-history.tsx` (lines 767-769)

```tsx
// BEFORE
{run.verificationReport && (
  <VerificationReportSection report={run.verificationReport} />
)}

// AFTER
{run.verificationReport && (
  <ErrorBoundary
    fallback={
      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
        Unable to display verification report.
      </div>
    }
  >
    <VerificationReportSection report={run.verificationReport} />
  </ErrorBoundary>
)}
```

This is the established pattern -- `ErrorBoundary` already wraps `ArtifactViewer` at ticket-detail.tsx:2554-2580. The `ErrorBoundary` component (error-boundary.tsx) supports a custom `fallback` prop. Defense-in-depth for any future data shape anomaly.

---

## 8. Cross-Repo Coordination

### What Prevents New Issues vs. What Handles Historical Records

| Fix | Repo | Prevents New Issues | Handles Historical Records |
|-----|------|--------------------|-----------------------------|
| Fix 1: Rewrite FAILURE HANDLING | server | Yes -- future runs classify correctly | No -- existing false positives remain |
| Fix 2: Add missing fields | server | Yes -- future reports have complete shape | No -- existing incomplete reports remain |
| Fix 3: Remove null from schema | server | Yes -- future runs have non-null justification | No -- existing null justifications remain |
| Fix 4: Optional types | client | N/A (type-level) | Yes -- compiles against both old and new shapes |
| Fix 5: Null guards | client | Yes -- prevents crash on any missing `steps` | Yes -- handles existing incomplete reports |
| Fix 6: ErrorBoundary | client | Yes -- catches future unexpected data shapes | Yes -- catches any unhandled error |

### Deploy Order

Both repos can be deployed independently:
- **Client-first** is safe: The null guards and ErrorBoundary handle existing incomplete records. Server changes arrive later and prevent new issues.
- **Server-first** is safe: New records will have complete shape. Existing records still need client guards to render without crash.
- **Simultaneous** is ideal.

---

## 9. Out of Scope / Future Work

| # | Item | Type | Why Deferred |
|---|------|------|-------------|
| 1 | API-layer shape normalization in ticket-service.ts | Architecture hardening | Server fix (new records) + client fix (historical records) provides full coverage. Product spec explicitly excludes this. |
| 2 | VerificationReportSection test coverage | Test hardening | No tests exist for this component. Adding render tests for each outcome type would harden it. Deferred because the fix is small and verifiable through typecheck + build. |
| 3 | Database-level JSON schema enforcement | Architecture hardening | Adding JSON schema validation to the Prisma `Json?` column would catch shape issues at write time. Low priority given code-level fixes. |
| 4 | Backfill of historical records | Data migration | Only 5 records affected. Client-side optional typing + null guards handle them without data change. |
| 5 | `buildVerificationReport` helper function | Code quality | The 5 construction paths have significantly different field sets (cascade, specDeviations, retriesExhausted, failedLayer). A helper would need many optional params. Reasonable candidate for future refactoring if more outcome types are added. |
| 6 | Reclassifying existing false positives | Data migration | The 3 confirmed false positives (FIX-588 and both #587 runs) will remain as NEEDS_CREDENTIALS. The fix prevents future false positives but does not retroactively reclassify. |
| 7 | Post-step validation for needs_credentials | Defense-in-depth | A server-side validation layer could inspect the justification after the step completes and convert insufficiently-justified needs_credentials to FAILED. Deferred because step-config alignment should prevent misclassification at the source. |
| 8 | Monitoring/alerting for needs_credentials rates | Observability | A spike in needs_credentials after deployment could indicate the step-config changes are too restrictive. Consider adding observability. |

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Step-config changes too restrictive -- legitimate needs_credentials classified as FAILED | Low | Medium | BOUNDARY's 2 triggers preserved unchanged. Only the contradictory FAILURE HANDLING broadening is removed. The boundary examples (lines 330-334) provide positive guidance. |
| Schema null removal causes agent validation failure | Low | Low | If agent can't justify needs_credentials, it should choose FAILED or implementation_wrong. This is the desired behavior. |
| Making `steps` optional surfaces type errors elsewhere in client | Low | Low | Only 2 callsites access `report.steps` (run-history.tsx:357, 361). `ticket-summary.tsx` uses safe truthiness guards on other fields. |
| ErrorBoundary masks future data issues | Low | Low | ErrorBoundary logs errors via `componentDidCatch`. Crashes are detectable in monitoring -- just contained instead of page-killing. |
| Edge case: server error IS caused by missing credentials (e.g., API key not configured) | Low | Medium | The BOUNDARY already covers this: "missing new credential/env var" is trigger #1. The rewrite preserves this trigger -- only broadening directives are removed. |
| In-flight verification runs affected by step-config change | Very Low | Low | Step-config is read at step start, not mid-execution. |
| Server fix deployed before client fix | Low | None | Historical records still crash. Client fix is independently necessary. Deploy together or client-first. |

---

## 11. Evidence Summary

### Production Database Evidence (Queried 2026-05-23)

| Query | Result | Date |
|-------|--------|------|
| Total NEEDS_CREDENTIALS runs | 5 | 2026-05-23 |
| Confirmed false positives | 3 of 5 (tickets #587x2, #588) | 2026-05-23 |
| FIX-588 details | 6/8 CHK passed, 2 BLOCKED by server HTTP 500 on POST /api/goals | 2026-05-23 |
| Ticket #587 run cmphwyd93 details | SCN-01-09 all BLOCKED -- T6 UI pages don't exist, Goal API HTTP 500 | 2026-05-23 |
| Ticket #587 run cmphmrx9x details | SCN-01-09 all BLOCKED -- T6 UI pages don't exist, server Goal API HTTP 500 | 2026-05-23 |
| Ticket #33 details | CHK-06 BLOCKED -- SDF deployment orchestrator-managed, not executed | 2026-05-23 |
| Ticket #32 details | CHK-05, CHK-06 BLOCKED, SCN-01-05 deferred -- needs sandbox deployment + CSV import | 2026-05-23 |
| `needsCredentialsJustification` status | 5/5 are null | 2026-05-23 |
| needs_credentials: `steps` field present? | 0/5 (all absent) | 2026-05-23 |
| needs_credentials: `remediationGuidance` present? | 0/5 (all absent) | 2026-05-23 |
| needs_credentials: `cascade` present? | 5/5 (all present, value varies) | 2026-05-23 |
| needs_credentials: `attemptedStrategies` present? | 0/5 (all absent) | 2026-05-23 |
| verified: `steps` and `remediationGuidance` present? | 809/809 have both | 2026-05-23 |
| implementation_wrong: `steps` present? | 16/16 have `steps` | 2026-05-23 |
| impossible_spec: `steps` present? | 1/1 has `steps` | 2026-05-23 |
| Overall outcome distribution | 911 SUCCEEDED, 317 FAILED, 152 UNVERIFIED, 37 MERGED, 12 QUEUED, 5 NEEDS_CREDENTIALS, 3 RUNNING, 3 INTERRUPTED, 1 IMPOSSIBLE_SPEC | 2026-05-23 |

### Code Reference Summary

| Reference | File | Lines | Repo | Verified |
|-----------|------|-------|------|----------|
| NEEDS_CREDENTIALS BOUNDARY | step-config.mjs | 244-264 | server | Yes -- 2 triggers, 10 exclusion categories |
| FAILURE HANDLING contradictions | step-config.mjs | 319, 325, 339, 345, 347 | server | Yes -- 5 directives broadening needs_credentials |
| Status/result instruction | step-config.mjs | 236-237 | server | Yes -- dual-set causes universal handler intercept |
| needsCredentialsJustification schema | step-config.mjs | 573-574 | server | Yes -- type: ["object", "null"] allows null |
| Universal needs_credentials handler | workflow-step-chain.ts | 1140-1143 | server | Yes -- missing steps, remediationGuidance, attemptedStrategies |
| Verification needs_credentials handler | workflow-step-chain.ts | 1298-1303 | server | Yes -- missing steps, remediationGuidance, attemptedStrategies |
| impossible_spec handler | workflow-step-chain.ts | 1225-1231 | server | Yes -- includes steps |
| FAILED handler | workflow-step-chain.ts | 1554-1560 | server | Yes -- includes steps, remediationGuidance |
| verified handler | workflow-step-chain.ts | 1870-1876 | server | Yes -- includes steps, remediationGuidance |
| Raw JSON passthrough | ticket-service.ts | 585 | server | Yes -- no shape normalization |
| No shape validation at persistence | run-store.ts | 408-433 | server | Yes -- double type-cast, zero runtime validation |
| Crash site | run-history.tsx | 357 | client | Yes -- `report.steps.length > 0` without null guard |
| Second unsafe access | run-history.tsx | 361 | client | Yes -- `report.steps.map(...)` without null guard |
| Render site (no ErrorBoundary) | run-history.tsx | 766-768 | client | Yes -- bare render |
| VerificationReport type | api.ts | 589, 591 | client | Yes -- `steps: string[]` required, `remediationGuidance: string \| null` required |
| ErrorBoundary component | error-boundary.tsx | 28-65 | client | Yes -- exists, supports fallback prop |
| ArtifactViewer ErrorBoundary (pattern) | ticket-detail.tsx | 2554-2580 | client | Yes -- established wrapping pattern |

---

## 12. Methodology & Data Sources

### Investigation Approach

1. **Root cause re-evaluation**: The run-1 report dismissed false classification as "agent behavioral." This run's diagnosis re-examined the step-config instructions and proved the root cause is contradictory directives, not agent misbehavior. Each of the 5 contradictory lines was read and compared against the BOUNDARY definition.

2. **Production data verification**: All database statistics were queried against the production database on May 23, 2026 via Helix Inspect runtime inspection (helix-global-server, DATABASE type). Results are consistent with diagnosis-stage findings.

3. **Code reference verification**: All 17 code references were verified by reading the actual source files in the current codebase. All confirmed accurate at the cited line numbers.

4. **Prior work contextualization**: RSH-550 report and FIX-594 artifacts were reviewed to establish the accurate attribution chain and identify what gaps remain.

5. **Cross-repo synthesis**: Diagnosis, product, and tech-research artifacts from both helix-global-server and helix-global-client were synthesized into a unified narrative with coordinated fix recommendations.

### Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library) | Ticket scope, user frustration, continuation context | User says "zero chance this needs credentials"; asks why many tickets get false NEEDS_CREDENTIALS; wants comprehensive re-evaluation |
| Continuation context (user guidance) | Scope priority | User explicitly says to solve the false NEEDS_CREDENTIALS classification problem |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server root cause analysis (3 root causes) | PRIMARY: step-config contradictions (5 directives); SECONDARY: incomplete report shape; TERTIARY: null schema |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client root cause analysis | Crash at run-history.tsx:357; missing null guard; type mismatch; no ErrorBoundary |
| diagnosis/apl.json (helix-global-server) | Evidence-backed Q&A with production data | 3/5 confirmed false positives; all 5 null justification; step-config line-by-line contradiction |
| diagnosis/apl.json (helix-global-client) | Evidence-backed Q&A on crash path | Crash specific to needs_credentials; only 2 callsites access report.steps |
| product/product.md (helix-global-server) | Product requirements and scenarios | 4 essential features; 8 user scenarios; eliminate contradictory instructions is Feature #1 |
| product/product.md (helix-global-client) | Product requirements and scenarios | Crash-free rendering, ErrorBoundary, accurate types, no regression |
| tech-research/tech-research.md (helix-global-server) | Architecture decisions (AD-1 through AD-4) | Rewrite FAILURE HANDLING; add fields to both handlers; remove null from schema; preserve universal handler |
| tech-research/tech-research.md (helix-global-client) | Architecture decisions (AD-1 through AD-3) | Optional type + optional chaining + ErrorBoundary wrap at render site |
| tech-research/apl.json (both repos) | Resolved questions | All followups=[] in both repos; all questions answered with evidence |
| scout/scout-summary.md (helix-global-server) | Server file inventory and contradiction analysis | BOUNDARY vs FAILURE HANDLING table; handler comparison; production evidence |
| scout/scout-summary.md (helix-global-client) | Client file inventory and crash analysis | Crash site; rendering safety comparison; only steps.length unsafe |
| scout/reference-map.json (both repos) | Detailed file:line references | 12 server files; 11 client files; step-config lines 244-357; handler lines 1105-1317 |
| repo-guidance.json (library) | Repo role assignments | helix-global-server and helix-global-client are targets; library and helix-cli are context |
| RSH-550 report (library/reports/RSH-550/report.md) | Original 6-issue research | 6 issues identified; Issues 3.3-3.6 about verification; step-config contradiction NOT identified |
| FIX-594 artifacts (via RSH-599 run-1 Section 2) | Prior fix scope | Proof screenshot guard + stepSummaries fixed; verification report shape NOT addressed |
| FIX-588 status | Example false positive | Mode: FIX, Status: NEEDS_CREDENTIALS, 0 completed runs |
| RSH-599 run-1 report (library/reports/RSH-599/report.md) | Prior report scope | Covered crash only; marked false classification as "out of scope / agent behavioral" -- now corrected |
| Production DB runtime inspection (2026-05-23) | Fresh production evidence | 5 NEEDS_CREDENTIALS runs; 3 confirmed false positives; all null justification; outcome distribution |
| /tmp/helix-inspect/manifest.json | Runtime inspection availability | helix-global-server has DATABASE and LOGS inspection configured |

## Attachments
- (none)
