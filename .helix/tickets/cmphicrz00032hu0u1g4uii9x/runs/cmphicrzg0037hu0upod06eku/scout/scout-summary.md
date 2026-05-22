# Scout Summary: helix-cli

## Problem

Ticket RSH-579 asks what Helix agents can accomplish with the CLI (`hlx`). The core questions are: Can agents create tickets? Look up any ticket? Post comments? Use production inspect (DB, logs, API)? There is also reported confusion about prod vs staging environments and a concern from RSH-534 that agents may only have read-only access.

## Analysis Summary

### CLI Capabilities (Static Code Evidence)

The CLI (v1.3.4) provides **both read and write** commands:

**Write commands (present in code):**
- `hlx tickets create` (src/tickets/create.ts) - POST /api/tickets
- `hlx tickets update-description` (src/tickets/update-description.ts) - PATCH /api/tickets/{id}
- `hlx tickets rerun` (src/tickets/rerun.ts) - POST /api/tickets/{id}/rerun
- `hlx tickets continue` (src/tickets/continue.ts) - POST /api/tickets/{id}/rerun with context
- `hlx comments post` (src/comments/post.ts) - POST /api/tickets/{id}/comments
- `hlx library comments post` - POST /api/library/items/{id}/comments

**Read commands:**
- `hlx tickets list/latest/get/artifacts/artifact/bundle`
- `hlx comments list`
- `hlx inspect repos/db/logs/api` (explicitly read-only)
- `hlx library list/show/comments list`

### Authentication Flow

Config loading (src/lib/config.ts:42) checks env vars in priority order:
1. `HELIX_API_KEY` (primary)
2. `HELIX_INSPECT_TOKEN` (legacy alias)
3. `HELIX_INSPECT_API_KEY` (legacy alias)

All three resolve to the same `HxConfig.apiKey` field. The `HELIX_INSPECT_TOKEN` name is misleading - it provides the same capabilities as `HELIX_API_KEY`. There is no read-only restriction at the CLI level.

For URLs: `HELIX_URL` > `HELIX_INSPECT_BASE_URL` > `HELIX_INSPECT_URL`, all resolving to `HxConfig.url`.

### Skill Documentation

The bundled skill content (skill-content/SKILL.md) documents ticket creation explicitly in its workflow (step 6) and the commands reference (skill-content/references/commands.md) has full documentation for `hlx tickets create` with all flags. Agents with the skill installed should have awareness of write capabilities.

### Production vs Staging

The CLI is environment-agnostic - it uses whichever URL is configured. There is no hardcoded production or staging URL. Environment confusion likely stems from:
1. Env var naming (`HELIX_INSPECT_*` suggests production inspection)
2. No explicit environment indicator in CLI output or config
3. Multi-org config stores URLs per org but doesn't label them as prod/staging

### Runtime Evidence

- Production logs confirm `POST /api/tickets 201` (ticket creation succeeds) at 2026-05-22T22:45:22Z
- 10 active API keys exist in production, all with empty `repos` arrays (unrestricted access)
- No ticket-creation errors found in production logs for the past 7 days

## Relevant Files

| File | Role |
|------|------|
| `src/index.ts` | Main CLI entrypoint and command router |
| `src/tickets/index.ts` | Tickets subcommand router (10 subcommands) |
| `src/tickets/create.ts` | Ticket creation implementation |
| `src/comments/post.ts` | Comment posting implementation |
| `src/inspect/index.ts` | Read-only inspection commands |
| `src/lib/config.ts` | Config/token loading with env var priority |
| `src/lib/http.ts` | HTTP client with auth header handling |
| `src/lib/resolve-ticket.ts` | Ticket reference resolution |
| `src/lib/resolve-repo.ts` | Repository name resolution (for --repos) |
| `skill-content/SKILL.md` | Bundled agent skill documentation |
| `skill-content/references/commands.md` | Full CLI command reference |
| `package.json` | Package metadata (v1.3.4, ESM, Node >=18) |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand ticket requirements and referenced ticket RSH-534 | Core questions: can agents create tickets, look up tickets, post comments via CLI? Confusion about prod vs staging. |
| src/index.ts | Map CLI command structure | 10 top-level commands; tickets and comments both have write subcommands |
| src/tickets/create.ts | Verify ticket creation exists and works | POST /api/tickets with basePath '/api'; full implementation present |
| src/comments/post.ts | Verify comment posting exists | POST /api/tickets/{id}/comments; full implementation present |
| src/lib/config.ts | Understand env var loading and prod/staging distinction | Three env var aliases (HELIX_API_KEY, HELIX_INSPECT_TOKEN, HELIX_INSPECT_API_KEY) all provide same access |
| src/lib/http.ts | Understand auth header construction | hxi_ tokens use X-API-Key header; default basePath '/api/inspect' |
| skill-content/SKILL.md | Check what guidance agents receive | Documents both read and write operations including ticket creation workflow |
| Production logs (runtime) | Verify ticket creation works in production | POST /api/tickets returns 201 - creation succeeds |
| Production DB (runtime) | Check API key configuration | All 10 active keys have empty repos arrays (unrestricted) |
