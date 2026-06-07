# Scout Summary — helix-cli

## Problem

The host agent runner (inside the sprite) must be able to pull unprocessed comments since a marker to support the transition from push-based to pull-based comment delivery. The CLI is the runner's interface to the helix-global-server API.

## Analysis Summary

### Current State

`hlx comments list` is already implemented at `src/comments/list.ts` with a `--since <iso-date>` flag. The command:
1. Fetches all comments via `GET /tickets/{ticketId}/comments` (L20)
2. Filters client-side by `--helix-only` (isHelixTagged) and `--since` (createdAt > date) (L26-34)
3. Outputs in human-readable format: `[timestamp] Author [markers]: content` (L42-51)

The response type (L5-14) includes: `id`, `author` (name, email), `content`, `isHelixTagged`, `isAgentAuthored`, `createdAt`.

### Key Observations

- **--since flag exists** but filtering is client-side only. All comments are fetched from the server regardless of the `--since` value.
- **No JSON output mode** — output is human-readable text. The runner inside the sprite calls `hlx` via exec and would need to parse this output, or a `--json` flag would be needed.
- **No runner/host-agent code** exists in helix-cli. The CLI is a stateless API client. The runner code that will call `hlx comments list --since` lives in helix-global-server's `src/services/host-agent/runner/` directory and is deployed to the sprite.
- **Auth is pre-configured** — the runner has `HELIX_API_KEY` written to `/app/.helix-env` during provisioning. The CLI's `hxFetch` reads this for authentication.
- **No comment tests** exist in the CLI repo currently.

### Scope Assessment

The CLI changes for this ticket appear minimal — the `--since` flag already works. Potential enhancements:
- A `--json` output flag for machine-parseable output
- Server-side `since` query parameter pass-through (efficiency)
- Cursor-based filtering by comment ID rather than timestamp

## Relevant Files

| File | Role |
|------|------|
| `src/comments/list.ts` | `hlx comments list` with `--since` flag, client-side filtering |
| `src/comments/post.ts` | `hlx comments post` for runner reply posting |
| `src/comments/index.ts` | Comments subcommand routing |
| `src/lib/http.ts` | hxFetch API client with retry, auth, timeouts |
| `src/lib/flags.ts` | Flag parsing utility (getFlag) |
| `package.json` | Build/test scripts, no ORM |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand CLI scope: runner must pull unprocessed comments since marker | `hlx comments list --since` or equivalent needed |
| src/comments/list.ts | Inspect existing --since implementation | Flag exists, client-side filtering only, human-readable output |
| src/comments/post.ts | Understand runner reply mechanism | Posts to /tickets/{ticketId}/comments |
| src/comments/index.ts | Verify command registration | list and post subcommands registered |
| src/lib/http.ts | Understand API client capabilities | hxFetch with retry, auth headers, basePath routing |
| package.json | Check build/test pipeline and dependencies | TypeScript-only build, no ORM, Node.js test framework |
