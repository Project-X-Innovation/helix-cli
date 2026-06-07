# Diagnosis Statement — helix-cli

## Problem Summary

The CLI needs a new `converse` command that posts a message to the Helix comment agent and returns the agent's reply. Currently, `hlx comments post` sends `{ content: message }` without `isHelixTagged`, and does not wait for or detect agent replies.

## Root Cause Analysis

The CLI's `comments post` command (src/comments/post.ts L31-35) omits `isHelixTagged: true` from its POST body. Even though the CLI's HTTP request goes through the server's comment-controller (which has full dispatch logic), the controller only triggers dispatch when `isHelixTagged` is true or the content matches `isDirectHelixAddress()`. The CLI command also returns immediately after posting — no polling for reply.

The fix is a new `converse` subcommand that:
1. POSTs with `isHelixTagged: true` in the body (ensuring server-side dispatch)
2. Polls for the agent's reply using the existing polling pattern from `playbook/check.ts`
3. Returns the agent's reply content

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| POST omits isHelixTagged | `src/comments/post.ts` L31-35 | `{ content: message }` only |
| HTTP path has dispatch | `helix-global-server/src/routes/api.ts` L301 | CLI POST goes to comment-controller |
| Polling pattern exists | `src/playbook/check.ts` | 5s intervals, 120 polls, progress dots |
| List has useful filters | `src/comments/list.ts` | --helix-only, --since, --json for reply detection |

## Success Criteria

1. `hlx comments converse --ticket <id> <message>` posts a comment with `isHelixTagged: true` and returns the agent's reply.
2. Polling uses the established pattern (5s intervals, configurable timeout).
3. Progress indication during wait (dots or spinner).
4. Timeout fallback returns the posted comment ID.
5. `--json` output mode supported for machine consumption.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand requirements | CLI converse command needed alongside MCP tool |
| helix-cli scout/reference-map.json | Map CLI infrastructure | POST omits isHelixTagged; polling pattern in check.ts |
| helix-cli scout/scout-summary.md | Understand CLI patterns | Polling adapts directly; zero runtime deps |
| src/comments/post.ts | Verify current POST behavior | Only sends content, no isHelixTagged |
| helix-global-server src/routes/api.ts | Verify HTTP routing | CLI POST reaches comment-controller with dispatch |
