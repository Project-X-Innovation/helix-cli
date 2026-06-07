# Implementation Plan: CLI --json Flag for Comments List

## Overview

Add a `--json` output flag to `hlx comments list` so the runner's polling loop and agent tools can consume structured comment data programmatically. This is a minor change supporting the control-plane wake + CLI pull architecture in helix-global-server.

**Repos changed**: helix-cli (this repo only)

## Implementation Principles

- Single-file change: only `src/comments/list.ts` is modified.
- No breaking change: default human-readable output is preserved.
- Include comment IDs: the JSON output must include the `id` field for cursor-based deduplication by the runner.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Add --json flag to `hlx comments list` | src/comments/list.ts |
| 2 | Quality gates | typecheck + build |

## Detailed Implementation Steps

### Step 1: Add --json Flag

**Goal**: Enable machine-parseable JSON output from `hlx comments list`.

**What to Build**:
1. In `src/comments/list.ts`:
   - Parse `--json` flag: `const jsonOutput = args.includes("--json");`
   - After the existing filtering logic (helixOnly, since), before the "No comments found" check:
     - If `jsonOutput`, output `console.log(JSON.stringify(comments))` and return.
   - The filtered `comments` array already contains objects with `id`, `author`, `content`, `isHelixTagged`, `isAgentAuthored`, `createdAt` — all fields the runner needs.
   - When `--json` is active and no comments match, output `[]` (empty JSON array) instead of "No comments found." text.
   - Default behavior (no `--json` flag) remains identical to current code.

**Verification (AI Agent Runs)**:
- `npx tsc --noEmit` passes.
- `npm run build` succeeds.
- grep for `--json` in `src/comments/list.ts` confirms the flag is parsed and handled.

**Success Criteria**:
- `--json` flag outputs valid JSON array with all comment fields including `id`.
- Empty result with `--json` outputs `[]`.
- Default human-readable output is unchanged.

---

### Step 2: Quality Gates

**Goal**: All quality gates pass.

**Verification (AI Agent Runs)**:
- `npx tsc --noEmit` passes.
- `npm run build` succeeds.

**Success Criteria**:
- Zero typecheck errors.
- Build completes successfully.

---

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|-----------|--------|-----------------|---------------|
| Node.js + npm installed | available | Dev environment | CHK-01, CHK-02, CHK-03 |
| `npm install` completed in helix-cli | available | Standard dev setup | CHK-01, CHK-02, CHK-03 |

### Required Checks

[CHK-01] TypeScript compilation passes for helix-cli
- Action: Run `npx tsc --noEmit` in the helix-cli directory.
- Expected Outcome: Command exits 0 with no type errors.
- Required Evidence: Command output showing successful completion with exit code 0.

[CHK-02] Build succeeds for helix-cli
- Action: Run `npm run build` in the helix-cli directory.
- Expected Outcome: Build completes successfully.
- Required Evidence: Command output showing successful completion with exit code 0.

[CHK-03] --json flag code is present and correct
- Action: Search `src/comments/list.ts` for `--json` flag handling. Verify the JSON output branch includes comment `id` field in the output and that `JSON.stringify` is used.
- Expected Outcome: The file parses a `--json` flag. When present, outputs `JSON.stringify(comments)` where the comments array includes objects with `id`, `author`, `content`, `isHelixTagged`, `isAgentAuthored`, `createdAt`. Default human-readable output is unchanged.
- Required Evidence: Content of list.ts showing the --json flag parsing and JSON.stringify output branch.

## Success Metrics

| Metric | Target |
|--------|--------|
| TypeScript compilation | Zero errors |
| Build | Succeeds |
| --json flag | Outputs JSON with comment IDs |
| Default output | Unchanged |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | Scope for CLI changes | Runner must pull unprocessed comments since marker |
| scout/scout-summary.md (helix-cli) | CLI scope assessment | --since exists, human-readable only, --json needed |
| scout/reference-map.json (helix-cli) | CLI file inventory | 7 files, CommentResponse type includes id field |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI pull readiness | --json is primary addition, comment IDs needed for cursor |
| diagnosis/apl.json (helix-cli) | CLI Q&A | Structured output required for runner consumption |
| tech-research/tech-research.md (helix-global-server) | AD-11 CLI --json design | Include all fields, default unchanged, used by agent tools |
| src/comments/list.ts (source) | Current implementation | L5-14 CommentResponse has id, L42-51 human-readable output |
| repo-guidance.json | Repo intent | helix-cli=target (minor) |
