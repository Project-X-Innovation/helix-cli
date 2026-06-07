# Scout Summary — helix-cli

## Problem

The ticket may require a CLI-side `converse` command (or enhancement to `comments post`) that posts a message to the Helix comment agent and waits for the reply. The CLI already has comment posting and a polling pattern that could serve as the template.

## Analysis Summary

### Current CLI Comment Infrastructure

- **`hlx comments post --ticket <id> <message>`** (src/comments/post.ts): Posts a comment via `POST /api/tickets/{ticketId}/comments` with `{ content: message }`. Returns the comment ID. Does NOT pass `isHelixTagged` — but the server-side implicit detection (`isDirectHelixAddress`) would still trigger for vocative patterns like "Helix, help me."

- **`hlx comments list --ticket <id>`** (src/comments/list.ts): Fetches all comments. Supports `--helix-only` (filters isHelixTagged), `--since` (date filter), and `--json` (machine output). These filters are directly useful for polling for an agent reply.

### Polling Pattern Reference

`src/playbook/check.ts` implements a synchronous polling pattern:
- POST to trigger an operation
- Poll every 5 seconds (`POLL_INTERVAL_MS = 5_000`)
- Max 120 polls = 10-minute timeout
- Check for terminal status set (`PASS`, `FAIL`, `ERROR`)
- Print progress dots during polling
- Return result with exit code

This pattern adapts cleanly to a converse command:
- POST comment with `isHelixTagged: true`
- Poll `GET /api/tickets/{ticketId}/comments` for new `isAgentAuthored` comment with matching `parentCommentId`
- Return the agent's reply content

### HTTP Client

`hxFetch` provides retry (3 attempts, exponential backoff) and 30s per-request timeout. Auth supports both API keys (`hxi_` prefix → X-API-Key header) and Bearer tokens. The converse command would need a longer overall timeout window than a single hxFetch call.

### CLI Architecture

- Zero runtime dependencies — pure Node.js
- Commands organized in domain directories (`comments/`, `playbook/`, `tickets/`, etc.)
- Main router in `src/index.ts` dispatches to `run*()` functions
- Flag parsing via `src/lib/flags.ts`
- Build: `tsc` → `dist/`. Tests: `node --test dist/**/*.test.js`

### Build/Quality Gates

| Gate | Command |
|------|---------|
| Build | `tsc` |
| Typecheck | `tsc --noEmit` |
| Test | `tsc && node --test dist/**/*.test.js` |

## Relevant Files

| File | Role |
|------|------|
| `src/comments/post.ts` | Comment posting — template for converse POST |
| `src/comments/list.ts` | Comment listing with filters — template for polling |
| `src/comments/index.ts` | Comment router — where new subcommand would register |
| `src/playbook/check.ts` | Polling pattern reference (5s interval, 10min max) |
| `src/lib/http.ts` | hxFetch — retry, timeout, auth handling |
| `src/lib/config.ts` | CLI config and auth loading |
| `src/index.ts` | Main CLI entry point and router |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Deliverable scope includes helix-cli | CLI may need a converse command |
| src/comments/post.ts | Understand current comment posting | POST /api with { content }, no isHelixTagged flag |
| src/comments/list.ts | Understand comment fetching | --helix-only and --since filters useful for polling |
| src/playbook/check.ts | Map existing polling pattern | 5s interval, 120 polls, terminal status check — directly adaptable |
| src/lib/http.ts | Map HTTP client capabilities | 30s timeout, 3 retries, API key + Bearer auth |
