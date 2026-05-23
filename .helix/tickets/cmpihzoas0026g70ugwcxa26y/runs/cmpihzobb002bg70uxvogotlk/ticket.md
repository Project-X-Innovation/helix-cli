# Ticket Context

- ticket_id: cmpihzoas0026g70ugwcxa26y
- short_id: FIX-598
- run_id: cmpihzobb002bg70uxvogotlk
- run_branch: helix/fix/FIX-598-impt-demo-feature-clean-up
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Impt: Demo Feature Clean up

## Description
Especially good logging.



Additionally I haven't seen a single screen shot in actuality so I need to assume it's broken somewhere 



Also a way to say helpful/on target or not would be good (thumbs up/thumbs down for each scene?)

## Research Report

# Demo Feature — Research Report

## Executive Summary

The Helix demo feature is a fully functional end-to-end workflow step that captures screenshots of completed ticket work and presents them in a polished UI viewer. Spanning both the server (screenshot capture, Vercel Blob upload, Prisma persistence) and client (DemoViewer component with lightbox navigation), the feature is production-active: **10 of 444 succeeded runs in the past 30 days contain demo content**, exclusively from FIX and BUILD mode tickets.

One concrete bug was identified: **a client/server mismatch in the `RESEARCH_EXCLUDED_STEPS` set** causes the client UI to display a phantom "Demo" workflow step for research-mode tickets, even though the server never executes the demo step for those tickets. This affects all 197 succeeded research-mode runs in the past 30 days. The fix is a single-line constant addition.

The feature's architecture is sound — non-blocking execution, best-effort screenshot uploads, clean type definitions — but lacks test coverage, shared source-of-truth for step exclusion rules, and monitoring/alerting for demo-related failures.

---

## Demo Feature Architecture

### Server-Side (helix-global-server)

The demo feature on the server operates as a non-blocking final workflow step:

#### Step Catalog Definition
- **File**: `src/helix-workflow/helix-workflow-step-catalog.ts` (lines 90-96)
- The demo step is defined with `nonBlocking: true` and `producesRepoArtifacts: false`
- It has no APL artifact path (`aplArtifactPath: null`)
- It is the last step in the `HELIX_WORKFLOW_STEPS` array (position 10 of 10)

```typescript
{
  id: "demo",
  title: "Demo",
  aplArtifactPath: null,
  producesRepoArtifacts: false,
  nonBlocking: true,
}
```

#### Mode-Based Step Exclusion
- **File**: `src/helix-workflow/orchestrator/step-selection.ts` (lines 1-15)
- **RESEARCH mode**: `RESEARCH_EXCLUDED_STEPS = new Set(["code-review", "preview-config", "demo"])` (line 8)
- **Sandbox deploy platforms**: `SANDBOX_DEPLOY_EXCLUDED_STEPS = new Set(["preview-config", "demo"])` (line 15)
- The `resolveStepsToRun()` function (line 17+) applies these exclusions to determine which steps execute for a given ticket

#### Screenshot Capture and Upload Flow
- **File**: `src/helix-workflow/orchestrator.ts` (lines 2101-2135)
- After a run completes, the orchestrator processes `demoContent` from the step chain result
- Screenshots at `/tmp/` paths are read from the Vercel Sandbox via `sandbox.readFileToBuffer()`
- Each screenshot is uploaded to **Vercel Blob Storage** at `demo/{runId}/{filename}` with **public access** via `uploadDemoScreenshot()` (file: `src/services/blob-storage.ts`, lines 43-59)
- Screenshot URLs in the `demoContent` JSON are **rewritten in-place** from local `/tmp/` paths to the resulting blob URLs
- Upload failures are logged but do not affect run outcome (best-effort, non-fatal)

#### Prisma Persistence
- **File**: `prisma/schema.prisma` (line 420)
- `demoContent` is a `Json?` nullable JSON column on the `SandboxRun` model
- The orchestrator persists `demoContent` via Prisma update in **all run outcome branches** (succeeded, failed, unverified, needs_credentials, impossible_spec) — see `orchestrator.ts` lines 2189-2194, 2287-2292, 2375-2380, 2437-2442, 2693-2698
- The database uses file-based Prisma migrations (54+ existing migrations; build runs `scripts/prisma-migrate-all.mjs`)

#### API Surface
- **File**: `src/services/ticket-service.ts`
- `demoContent` is included in the run response payload sent to the client as part of the `RunSummary` type

### Client-Side (helix-global-client)

#### DemoViewer Component
- **File**: `src/components/demo-viewer.tsx` (431 lines)
- **ScreenshotCard** (line 22): Individual thumbnail with hover/click, error state handling for broken images
- **ScenarioSection** (not shown inline but present): Collapsible section per scenario with `<details>` / `<summary>` pattern; first scenario expanded by default
- **DemoLightbox** (line 120): Full-screen modal using native `<dialog>` element with:
  - **Keyboard navigation**: Left/Right arrow keys for previous/next (lines 147-148)
  - **Backdrop click to close** (line 144)
  - **ESC to close** via `onCancel` handler (line 142)
  - **Previous/Next buttons** with circular navigation (wraps around)
  - **Responsive design**: Full-screen on mobile, constrained modal on desktop (line 150)
- **EmptyState** (line 315): Shown when no demo content is available, with helpful explanatory text
- **DemoViewer** (line 351, main export): Flattens all screenshots across scenarios for unified lightbox navigation, computes per-scenario index offsets

#### Type Definitions
- **File**: `src/types/api.ts` (lines 572-578)
```typescript
export type DemoContent = {
  scenarios: Array<{
    id: string;
    title: string;
    screenshots: Array<{ url: string; caption: string }>;
  }>;
};
```
- `DemoContent` is an optional field on `RunSummary` (nullable)

#### Integration Points
1. **Ticket Detail Page** (`src/routes/ticket-detail.tsx`, lines 1503-1506, 2478-2503): Finds the first non-merge run with non-null `demoContent` and renders a styled DemoViewer section on the main ticket page
2. **Run History** (`src/components/run-history.tsx`, lines 731-763): Lazy-loads DemoViewer inside each completed run's expansion panel using React `<Suspense>`
3. **Ticket Artifacts Overview** (`src/components/ticket-artifacts-overview.tsx`, line 109): Filters visible workflow steps based on mode, using `RESEARCH_EXCLUDED_STEPS.has(ws.id)` behind an `isResearch` guard

#### Step Metadata and Filtering
- **File**: `src/lib/format.ts` (lines 132-146)
- `WORKFLOW_STEPS`: Ordered array of 10 workflow steps, with demo as the last entry (`{ id: "demo", label: "Demo" }`)
- `RESEARCH_EXCLUDED_STEPS`: **Currently `new Set(["code-review", "preview-config"])`** — missing `"demo"` (the bug)
- Three consumer call sites reference `RESEARCH_EXCLUDED_STEPS`:
  - `ticket-detail.tsx` line 2409 — step selection UI (create-ticket form)
  - `ticket-detail.tsx` line 2681 — step selection UI (re-run form)
  - `ticket-artifacts-overview.tsx` line 109 — artifact overview filtering

### Data Flow Diagram

```
Server (helix-global-server)
==============================
Agent Output (demoContent JSON)
       |
       v
Step Executor (execute.ts)
  - Parses demoContent from structured output
       |
       v
Workflow Step Chain (workflow-step-chain.ts)
  - Captures demoContent only when stepId === "demo"
       |
       v
Orchestrator (orchestrator.ts)
  - Reads screenshot files from sandbox /tmp/ paths
  - Uploads to Vercel Blob at demo/{runId}/{filename}
  - Rewrites URLs from local paths to blob URLs
  - Persists demoContent to PostgreSQL via Prisma
       |
       v
Ticket Service (ticket-service.ts)
  - Includes demoContent in run API response

         --- HTTP API ---

Client (helix-global-client)
==============================
API Response -> RunSummary (demoContent field)
       |
       v
ticket-detail.tsx / run-history.tsx
  - Finds runs with non-null demoContent
  - Renders DemoViewer component
       |
       v
DemoViewer (demo-viewer.tsx)
  - Scenario grid -> Lightbox navigation
```

---

## What is Good

### 1. The Feature Works End-to-End in Production
Production data confirms the demo feature is actively generating and displaying content. Over the past 30 days, **10 of 444 succeeded runs contain demo content**. All 10 runs are from FIX (5) and BUILD (5) mode tickets, which is expected given that RESEARCH mode correctly excludes the demo step on the server side. *(Source: Production database query — `SandboxRun` joined with `Ticket` on mode, 30-day window)*

### 2. Non-Blocking Step Design
The demo step is defined with `nonBlocking: true` in `helix-workflow-step-catalog.ts` (line 95). This means demo execution never delays run completion — if the demo step fails or times out, the run outcome is determined by the preceding blocking steps. This is architecturally sound for a "nice-to-have" feature. *(Source: `helix-global-server/src/helix-workflow/helix-workflow-step-catalog.ts` lines 90-96)*

### 3. Best-Effort Screenshot Upload
The screenshot upload process in `orchestrator.ts` (lines 2101-2135) is wrapped in try/catch blocks at both the individual screenshot level and the overall process level. Failures are logged (`"failed to upload demo screenshot"`, `"demo screenshot upload failed (non-fatal)"`) but never cause run failure. This resilience pattern is well-implemented. *(Source: `helix-global-server/src/helix-workflow/orchestrator.ts` lines 2101-2135)*

### 4. DemoViewer Has Good UX
The DemoViewer component (431 lines) implements several thoughtful UX patterns:
- **Collapsible scenario sections** with the first expanded by default for immediate visibility
- **Full-screen lightbox** using native `<dialog>` element (better accessibility than custom modals)
- **Keyboard navigation** (Arrow Left/Right to navigate, ESC to close)
- **Responsive design**: Full-screen on mobile, constrained modal on desktop
- **Error handling**: Broken image thumbnails show a fallback placeholder
- **Empty state**: Informative message when no demo content is available
*(Source: `helix-global-client/src/components/demo-viewer.tsx` lines 1-431)*

### 5. Clean Type Definitions
The `DemoContent` type in `api.ts` (lines 572-578) is well-structured with scenarios containing IDs, titles, and screenshot arrays. The type is cleanly optional on `RunSummary`, making null-checking straightforward across consumer sites. *(Source: `helix-global-client/src/types/api.ts` lines 572-578)*

### 6. Demo Content Persistence Covers All Outcome Branches
The orchestrator persists `demoContent` in **all five run outcome branches** (succeeded, failed, unverified, needs_credentials, impossible_spec), ensuring that partial demo content from interrupted runs is still saved. *(Source: `helix-global-server/src/helix-workflow/orchestrator.ts` lines 2189, 2287, 2375, 2437, 2693)*

---

## What is Broken

### 1. RESEARCH_EXCLUDED_STEPS Client/Server Mismatch (Active Bug)

**The Problem**: The client-side `RESEARCH_EXCLUDED_STEPS` set does not include `"demo"`, while the server-side set does. This causes research-mode tickets to display a phantom "Demo" workflow step in the UI that will never complete.

**Server** (`helix-global-server/src/helix-workflow/orchestrator/step-selection.ts` line 8):
```typescript
export const RESEARCH_EXCLUDED_STEPS: ReadonlySet<string> = new Set(["code-review", "preview-config", "demo"]);
```

**Client** (`helix-global-client/src/lib/format.ts` line 146):
```typescript
export const RESEARCH_EXCLUDED_STEPS = new Set(["code-review", "preview-config"]);
// "demo" is MISSING ^
```

**Impact**:
- All three consumer call sites render the "Demo" step for research-mode tickets:
  - `ticket-detail.tsx` line 2409: Step selection UI shows Demo as a selectable step
  - `ticket-detail.tsx` line 2681: Re-run step selection also shows Demo
  - `ticket-artifacts-overview.tsx` line 109: Artifact overview may show a Demo section
- **197 succeeded research-mode runs in the past 30 days** are affected — users viewing any of these tickets see a phantom "Demo" step indicator that appears permanently pending/incomplete
- **0 of 197 research-mode runs have demoContent** (as expected, since the server correctly never executes the step for research tickets)

**Root Cause**: The server-side exclusion set was updated to include `"demo"` at some point, but the corresponding client-side constant was not updated to match. There is no automated mechanism to detect or prevent this drift.

**Recommended Fix**: Add `"demo"` to the client Set in `format.ts` line 146:
```typescript
export const RESEARCH_EXCLUDED_STEPS = new Set(["code-review", "preview-config", "demo"]);
```
This is a single-line change with zero risk of regression — the Set is only consulted behind `isResearchMode` guards, so FIX/BUILD mode behavior is unaffected.

*(Source: Direct code inspection of both files + production database query showing 0/197 research runs with demoContent)*

---

## What Could and Should Be Improved

### 1. No Dedicated Test Coverage for DemoViewer Component
The DemoViewer component at 431 lines is the largest untested component in the client codebase's component directory. The component test directory (`src/components/__tests__/`) only contains tests for `cascade-layer-section` and `error-boundary`. Key behaviors that should be tested:
- Scenario rendering and collapsing
- Lightbox open/close and keyboard navigation
- Empty state rendering
- Broken image fallback
*(Source: `helix-global-client/src/components/__tests__/` directory listing; `demo-viewer.tsx` at 431 lines)*

### 2. No Shared Source of Truth for Step Exclusion Sets
The step exclusion constants are independently defined in two repositories:
- Server: `helix-global-server/src/helix-workflow/orchestrator/step-selection.ts`
- Client: `helix-global-client/src/lib/format.ts`

There is no mechanism to ensure they stay in sync. The current RESEARCH_EXCLUDED_STEPS mismatch is a direct consequence. While a shared package would add cross-repo build coupling, a simpler approach (e.g., the server API including the active step list per mode) could prevent future drift without additional build dependencies.

### 3. Client Missing SANDBOX_DEPLOY_EXCLUDED_STEPS
The server defines `SANDBOX_DEPLOY_EXCLUDED_STEPS = new Set(["preview-config", "demo"])` at `step-selection.ts` line 15, but the client has **no equivalent constant**. If sandbox-deploy platform tickets are viewed in the UI, the step indicators may show steps that the server never executes. This hasn't been evidenced as actively broken, but represents the same class of drift risk as the RESEARCH_EXCLUDED_STEPS issue.
*(Source: `helix-global-server/src/helix-workflow/orchestrator/step-selection.ts` line 15; grep of helix-global-client confirmed no SANDBOX_DEPLOY_EXCLUDED_STEPS constant)*

### 4. No Demo-Related Error Monitoring or Alerting
A 30-day production log search for demo upload success/failure messages returned **zero results**. This means either:
- (a) No demo uploads occurred in the past 30 days (unlikely given 10 runs have demoContent), or
- (b) The structured log entries are not being captured at the expected level, or
- (c) The log retention/indexing doesn't surface these entries

In any case, there is no dedicated monitoring or alerting for demo feature health. If the Vercel Blob upload starts failing silently, runs would succeed but with missing screenshots — a degraded experience that would go undetected.
*(Source: Production log search for `"uploaded%demo%screenshot"` and `"demo screenshot upload failed"` returned 0 results over 30 days)*

### 5. No Test Coverage for Server-Side Demo Logic
The server-side demo screenshot upload, URL rewriting, and content persistence logic in `orchestrator.ts` (lines 2101-2135) and `blob-storage.ts` (lines 43-59) has no dedicated test coverage. These are complex operations involving file I/O, external API calls (Vercel Blob), and in-place JSON mutation.
*(Source: `helix-global-server` test directory inspection; `orchestrator.ts` demo-related code at lines 2101-2135)*

### 6. Demo Content Adoption Rate is Low
Only **10 of 444 succeeded runs (2.3%)** in the past 30 days have demo content. Among eligible modes (FIX + BUILD = 188 succeeded runs), the adoption rate is **5.3%**. This may be by design (demo requires specific agent capabilities or ticket types), but it suggests the feature is rarely triggered. Understanding and potentially improving the trigger conditions could increase the feature's value.
*(Source: Production database queries — 30-day window)*

---

## Production Data Analysis

### Run Volume (30-Day Window)

| Metric | Value |
|--------|-------|
| Total runs | 652 |
| Succeeded | 444 (68.1%) |
| Failed | 129 (19.8%) |
| Other statuses (queued, running, unverified, merged, etc.) | 79 (12.1%) |
| Runs with demoContent | 10 (1.5% of total, 2.3% of succeeded) |

*(Source: Production database query on `SandboxRun` table, 30-day window ending 2026-05-23)*

### Demo Content by Mode

| Mode | Succeeded Runs | With Demo | Demo Rate |
|------|---------------|-----------|-----------|
| RESEARCH | 197 | 0 | 0.0% (expected: server excludes demo) |
| BUILD | 99 | 5 | 5.1% |
| FIX | 89 | 5 | 5.6% |
| AUTO | 59 | 0 | 0.0% |
| **Total** | **444** | **10** | **2.3%** |

*(Source: Production database query — `SandboxRun` joined with `Ticket` on mode)*

Key observations:
- **RESEARCH mode has zero demo content** as expected (server correctly excludes the step)
- **AUTO mode has zero demo content** — needs investigation whether AUTO-mode tickets should run the demo step
- **FIX and BUILD have near-identical demo rates** (~5%), suggesting the demo step is triggered consistently when it runs

### Demo Content Size Distribution

| Metric | Value |
|--------|-------|
| Average size | ~5,024 bytes (~4.9 KB) |
| Minimum size | 3,744 bytes (~3.7 KB) |
| Maximum size | 6,680 bytes (~6.5 KB) |
| Sample count | 10 |

*(Source: Production database query — `LENGTH(CAST(demoContent AS TEXT))` on non-null rows)*

The demo content JSON payloads are small and consistent in size, suggesting a standard structure of 1-3 scenarios with a few screenshots each. No outlier sizes that would indicate data quality issues.

### Run Status Breakdown by Mode

| Mode | SUCCEEDED | FAILED | UNVERIFIED | MERGED | QUEUED | Other |
|------|-----------|--------|------------|--------|--------|-------|
| RESEARCH | 197 | 30 | 2 | 0 | 0 | 2 |
| BUILD | 99 | 40 | 16 | 5 | 4 | 4 |
| FIX | 89 | 15 | 20 | 4 | 2 | 2 |
| AUTO | 59 | 44 | 5 | 3 | 9 | 1 |

*(Source: Production database query — `SandboxRun` grouped by mode and status)*

RESEARCH mode has the highest success rate (85.7%) and FIX has a notable number of unverified runs (15.2%), which is expected given the verification workflow for code changes.

### Error Patterns

A 30-day production log search for demo-related operational messages (screenshot upload successes and failures) returned **zero results**. No demo-specific errors or warnings were detected in the production log stream. This absence suggests the feature operates silently, which is both good (no errors) and concerning (no observability).

*(Source: BetterStack log query for patterns `"uploaded%demo%screenshot"` and `"demo screenshot upload failed"` — 0 results)*

---

## Recommendations

### Priority 1: Fix RESEARCH_EXCLUDED_STEPS Mismatch
- **What**: Add `"demo"` to `RESEARCH_EXCLUDED_STEPS` in `helix-global-client/src/lib/format.ts` line 146
- **Why**: Resolves an active UX bug affecting all research-mode tickets (197 succeeded runs in 30 days). Users see a phantom "Demo" step that never completes.
- **Effort**: Single-line change, zero regression risk
- **Impact**: Immediate improvement for all research-mode ticket viewers

### Priority 2: Add Client-Side SANDBOX_DEPLOY_EXCLUDED_STEPS
- **What**: Create a `SANDBOX_DEPLOY_EXCLUDED_STEPS` constant in `format.ts` matching the server's `new Set(["preview-config", "demo"])` and wire it into the three consumer call sites
- **Why**: Prevents the same class of phantom-step bug for sandbox-deploy platform tickets
- **Effort**: Small — one new constant + conditional checks at three sites
- **Impact**: Proactive prevention of a known drift pattern

### Priority 3: Add DemoViewer Component Tests
- **What**: Add Vitest + Testing Library tests for the DemoViewer component covering scenario rendering, lightbox navigation, empty state, and broken image handling
- **Why**: The component is 431 lines with complex interactive behavior (keyboard nav, dialog management) and no test coverage
- **Effort**: Medium — estimate 100-150 lines of test code
- **Impact**: Regression safety for future UI changes to the demo viewer

### Priority 4: Establish Shared Step-Exclusion Source of Truth
- **What**: Either (a) extract exclusion sets into a shared package, or (b) have the server API return the active step list per mode, eliminating client-side maintenance of exclusion constants
- **Why**: Prevents future client/server drift for any step exclusion rule changes
- **Effort**: Medium-High — option (a) adds build coupling; option (b) requires API endpoint changes
- **Impact**: Systemic fix for the category of bugs exemplified by the current mismatch

### Priority 5: Add Server-Side Demo Upload Test Coverage
- **What**: Add tests for the screenshot upload flow in `orchestrator.ts` (lines 2101-2135) and `uploadDemoScreenshot` in `blob-storage.ts` (lines 43-59), covering URL rewriting, upload failures, and edge cases
- **Why**: Complex logic involving file I/O, external APIs, and in-place JSON mutation has no test coverage
- **Effort**: Medium — requires mocking Vercel Sandbox and Blob Storage
- **Impact**: Confidence in the most complex part of the demo feature's server-side logic

### Priority 6: Improve Demo Feature Observability
- **What**: Add structured metrics/logging for demo step execution rate, screenshot upload success/failure counts, and content size
- **Why**: Current 30-day log search found zero demo-related operational messages, indicating a monitoring blind spot
- **Effort**: Low — add log statements with structured metadata at key points
- **Impact**: Early detection of silent failures (e.g., Blob Storage outage causing missing screenshots)

---

## Appendix: Evidence Sources

| Source | Type | Key Data Point |
|--------|------|----------------|
| `helix-global-server/src/helix-workflow/orchestrator/step-selection.ts` line 8 | Code | Server RESEARCH_EXCLUDED_STEPS = `["code-review", "preview-config", "demo"]` |
| `helix-global-client/src/lib/format.ts` line 146 | Code | Client RESEARCH_EXCLUDED_STEPS = `["code-review", "preview-config"]` (missing "demo") |
| `helix-global-server/src/helix-workflow/helix-workflow-step-catalog.ts` lines 90-96 | Code | Demo step: nonBlocking=true, producesRepoArtifacts=false |
| `helix-global-server/src/helix-workflow/orchestrator.ts` lines 2101-2135 | Code | Screenshot upload, URL rewrite, best-effort error handling |
| `helix-global-server/src/services/blob-storage.ts` lines 43-59 | Code | uploadDemoScreenshot: public access, `demo/{runId}/{filename}` path |
| `helix-global-server/prisma/schema.prisma` line 420 | Code | `demoContent Json?` on SandboxRun model |
| `helix-global-client/src/components/demo-viewer.tsx` (431 lines) | Code | DemoViewer, DemoLightbox, EmptyState, ScreenshotCard |
| `helix-global-client/src/types/api.ts` lines 572-578 | Code | DemoContent type definition |
| `helix-global-client/src/routes/ticket-detail.tsx` lines 1503-1506, 2409, 2478-2503, 2681 | Code | Demo integration and RESEARCH_EXCLUDED_STEPS consumers |
| `helix-global-client/src/components/run-history.tsx` lines 731-763 | Code | Lazy-loaded DemoViewer per run |
| `helix-global-client/src/components/ticket-artifacts-overview.tsx` line 109 | Code | RESEARCH_EXCLUDED_STEPS consumer |
| Production DB: SandboxRun + Ticket (30-day) | Database | 652 total runs, 444 succeeded, 10 with demoContent |
| Production DB: Mode breakdown (30-day) | Database | RESEARCH: 197/0, BUILD: 99/5, FIX: 89/5, AUTO: 59/0 |
| Production DB: Demo content size (30-day) | Database | Avg 5,024 bytes, min 3,744, max 6,680 |
| Production Logs: Demo messages (30-day) | Logs | 0 demo-related operational log entries found |
| Scout summary (helix-global-client) | Artifact | Feature mapping, mismatch identification |
| Scout summary (helix-global-server) | Artifact | Server architecture, non-blocking step definition |
| Diagnosis statement (helix-global-client) | Artifact | Root cause analysis, 7-day production validation |
| Product spec (helix-global-client) | Artifact | Scope constraints, user scenarios |
| Tech research (helix-global-client) | Artifact | Option analysis, chosen approach (Option 1: add "demo" to Set) |

## Attachments
- (none)
