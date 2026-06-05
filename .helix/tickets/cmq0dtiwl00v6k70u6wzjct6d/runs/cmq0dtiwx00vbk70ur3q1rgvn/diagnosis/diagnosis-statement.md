# Diagnosis Statement — BLD-684: CLI Pull Support for Host Agent

## Problem Summary

The host agent runner inside the sprite must transition from receiving pushed comments via HTTP to pulling unprocessed comments via the CLI. The CLI has `hlx comments list --since` but outputs human-readable text, making it unsuitable for programmatic consumption by the runner.

## Root Cause Analysis

The CLI was designed for human operators, not machine consumers. The `hlx comments list` command:
1. Fetches all comments from `GET /tickets/{ticketId}/comments` (no server-side filtering)
2. Filters client-side by `--since` (timestamp comparison) and `--helix-only`
3. Outputs in human-readable format: `[timestamp] Author [markers]: content`
4. Does **not** output comment IDs, which are needed for cursor-based deduplication

The runner needs structured JSON output including comment IDs to advance the `lastProcessedCommentId` marker on the server.

## Evidence Summary

- `src/comments/list.ts:20` — fetches all comments, no server-side since parameter
- `src/comments/list.ts:30-34` — client-side `--since` filtering works correctly
- `src/comments/list.ts:42-51` — human-readable output, no comment ID included
- `src/comments/list.ts:5-14` — CommentResponse type already has `id` field available
- The runner calls `hlx` via `execFile` (runner/tools.ts in helix-global-server) and needs parseable output

## Success Criteria

1. `hlx comments list --json` outputs structured JSON including comment IDs
2. The runner can call `hlx comments list --since <marker> --json` and parse results programmatically
3. Existing human-readable output remains the default (no breaking change)

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | CLI scope from ticket description | Runner must pull unprocessed comments since marker |
| scout/reference-map.json (helix-cli) | CLI file inventory and fact base | --since exists, client-side filtering, no JSON output |
| scout/scout-summary.md (helix-cli) | CLI scope assessment | Minimal changes, --json flag suggested |
| src/comments/list.ts | Direct inspection of comment list implementation | Client-side filtering, human-readable output, no comment ID in output |
| scout/reference-map.json (helix-global-server) | Cross-repo context — runner comment delivery model | Runner uses execFile for CLI calls, needs structured output |
