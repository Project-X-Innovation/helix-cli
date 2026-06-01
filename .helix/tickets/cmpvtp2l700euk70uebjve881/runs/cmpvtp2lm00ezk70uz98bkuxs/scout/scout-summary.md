# Scout Summary: helix-cli (RSH-640)

## Problem

The helix-cli provides the callback surface that the Host Agent's in-sprite runner uses to interact with Helix: `hlx comments post` for posting replies and `hlx inspect` for database/logs/API queries. The RSH-640 development plan must address how the runner authenticates with scoped, refreshable tokens and whether any CLI changes are needed to support the new security model.

## Analysis Summary

### Current CLI Architecture

The helix-cli is a zero-dependency ESM CLI tool (Node 18+, TypeScript) with command routing from `src/index.ts`. Key callback surfaces for the Host Agent:

1. **`hlx comments post`** (`src/comments/post.ts`): Resolves ticket via `--ticket` flag or `HELIX_TICKET_ID` env, POSTs `{content: message}` to `/api/tickets/{ticketId}/comments`. Response includes `{comment: {id}}`.

2. **`hlx comments list`** (`src/comments/list.ts`): Lists ticket comments with `--helix-only` and `--since` filters. Response includes `isAgentAuthored` and `isHelixTagged` flags.

3. **`hlx inspect db|logs|api`** (`src/inspect/*.ts`): All inspection commands resolve a repo by name/ID and call the server's `/api/inspect/{repoId}/{type}` endpoints. These endpoints are subject to inspection key repo scoping on the server side.

### Authentication Model

Config loading (`src/lib/config.ts`) uses priority order:
1. **Environment variables**: `HELIX_API_KEY` / `HELIX_INSPECT_TOKEN`, `HELIX_URL` / `HELIX_INSPECT_BASE_URL`
2. **Multi-token config file**: `~/.hlx/config.json` with org switching

The HTTP client (`src/lib/http.ts`) sets `X-API-Key` header for `hxi_`-prefixed tokens or `Authorization: Bearer` for others. Includes `X-Helix-Org-ID` for org scoping. Has 3-attempt retry with exponential backoff and 30s timeout.

### Impact Assessment

The CLI is **agnostic to where it runs**. No host-agent or sprite references exist in the codebase. The in-sprite runner will use environment variables (`HELIX_INSPECT_TOKEN`, `HELIX_URL`, `HELIX_TICKET_ID`) injected by the control plane at sprite launch. Key observations:

- **Token scoping** is a server-side concern: the inspection API key's `repos[]` field restricts what the token can access. The CLI just passes the token; it doesn't enforce scoping.
- **Token refresh** may be purely a control-plane concern if the runner re-reads env vars on each CLI invocation. If the runner is a long-lived process that caches the token, the CLI would need no changes but the runner would need to handle refresh.
- **Comment identity** (FLAW-07) is a server-side concern: the server determines comment attribution from the auth token, not from the CLI.

### Quality Gates

- **Build:** `tsc`
- **Test:** `tsc && node --test`
- **No ORM/database** (pure CLI)
- **No CI workflows** found

## Relevant Files

| File | Role |
|------|------|
| `src/comments/post.ts` | Callback: post replies via /api/tickets/{ticketId}/comments |
| `src/comments/list.ts` | Callback: list comments with filtering |
| `src/inspect/db.ts` | Callback: execute SQL queries via inspection API |
| `src/inspect/logs.ts` | Callback: query logs via inspection API |
| `src/inspect/api.ts` | Callback: call repo APIs via inspection API |
| `src/inspect/repos.ts` | Lists available repos (scoped by token) |
| `src/lib/config.ts` | Config loading from env vars or config file |
| `src/lib/http.ts` | HTTP client with auth headers, retry, timeout |
| `src/lib/resolve-ticket.ts` | Ticket resolution from --ticket flag or HELIX_TICKET_ID env |
| `src/lib/resolve-repo.ts` | Repo resolution by name or ID |
| `src/index.ts` | Main entry point and command router |
| `package.json` | Build/test scripts, dependencies |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli run root) | Ticket scope for helix-cli | CLI changes needed for callback surface authentication with scoped, refreshable tokens |
| src/comments/post.ts (direct read) | Callback surface implementation | Posts to /api/tickets/{ticketId}/comments using hxFetch with auth token from config |
| src/lib/config.ts (direct read) | Auth config loading | Priority: env vars > multi-token config file. In-sprite runner uses HELIX_INSPECT_TOKEN env var |
| src/lib/http.ts (direct read) | HTTP client auth | X-API-Key for hxi_ tokens, 3-attempt retry, 30s timeout. Auth model already supports scoped tokens |
| src/inspect/*.ts (direct read) | Inspection command handlers | All hit /api/inspect/{repoId}/{type} endpoints subject to server-side repo scoping |
| package.json (direct read) | Project metadata | Zero-dependency ESM CLI, Node 18+, TypeScript. No ORM. |
