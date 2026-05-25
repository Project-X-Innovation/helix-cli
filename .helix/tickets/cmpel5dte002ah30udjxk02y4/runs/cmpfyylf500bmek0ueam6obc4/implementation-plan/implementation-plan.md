# Implementation Plan: Reports in HTML — helix-cli

## Overview

No CLI code changes are needed in this rerun. The dual heading extraction (HTML regex priority, Markdown fallback) was implemented in prior runs and is confirmed functional. The comment system is anchor-based and format-agnostic. This plan covers only typecheck verification. Zero runtime dependencies maintained.

## Implementation Principles

1. **No code changes**: CLI dual heading extraction is complete from prior runs.
2. **Quality gates only**: Run typecheck to confirm no regressions.
3. **Zero dependencies**: No new dependencies needed or added.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Run CLI quality gates | typecheck passes with zero errors |

## Detailed Implementation Steps

### Step 1: Run CLI quality gates

**Goal**: Confirm the existing CLI code compiles without errors.

**What to Build**: No code changes. Run validation commands only.

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmpfyylf500bmek0ueam6obc4/helix-cli
npm install
tsc --noEmit
```

**Success Criteria**: Commands exit with code 0, no type errors.

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|-----------|--------|----------------|----------------|
| npm install completed in helix-cli | available | Standard setup step | CHK-01 |
| Node.js runtime | available | Standard environment | CHK-01 |

### Required Checks

[CHK-01] CLI typecheck passes
- Action: Run `tsc --noEmit` in the helix-cli directory.
- Expected Outcome: Command exits with code 0, no type errors.
- Required Evidence: Command output showing successful typecheck with exit code 0.

## Success Metrics

1. CLI typecheck passes with zero errors
2. Zero new dependencies added

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope | Reports to HTML; marking/commenting must work the same |
| diagnosis/diagnosis-statement.md (CLI) | CLI diagnosis | No code changes needed; dual parsing complete |
| tech-research/tech-research.md (CLI) | CLI decision | 0 files changed; dual extraction confirmed complete |
| scout/scout-summary.md (CLI) | CLI state | Dual extraction implemented; comment system agnostic |
