# Diagnosis Statement

## Problem Summary

The CLI has no `hlx goals resume` command. Users cannot resume a PAUSED goal from the command line.

## Root Cause Analysis

The goals subcommands in `src/goals/index.ts` (lines 8-14) include only create, list, get, and terminate. No resume case exists in the command switch. The `terminate.ts` command provides the exact pattern: parse goalId from args, POST to the server endpoint, display the result.

The fix requires:
1. New `src/goals/resume.ts` file following terminate.ts pattern (POST to `/api/goals/:id/resume`)
2. New 'resume' case in `src/goals/index.ts` switch statement
3. Updated CLI docs in `src/docs/cli-content.ts`

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| Goals switch statement | src/goals/index.ts:8-14 | 4 cases: create, list, get, terminate; no resume |
| terminate.ts pattern | src/goals/terminate.ts | POST + display pattern for lifecycle actions |
| CLI docs | src/docs/cli-content.ts | Goals section needs resume command added |

## Success Criteria

1. `hlx goals resume <goalId>` command works and POSTs to `/api/goals/:id/resume`
2. CLI docs updated with resume command
3. Passes typecheck (`npm run typecheck`) and build (`npm run build`)

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/scout-summary.md (cli) | CLI analysis | 4 goals subcommands; no resume; terminate.ts is pattern |
| scout/reference-map.json (cli) | File mapping | goals/index.ts switch, terminate.ts pattern, cli-content.ts docs |
