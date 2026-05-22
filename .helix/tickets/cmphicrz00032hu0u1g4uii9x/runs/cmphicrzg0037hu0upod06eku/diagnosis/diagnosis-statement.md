# Diagnosis Statement

## Problem Summary

Helix agents cannot create tickets, look up other tickets, or post comments via the CLI because the `hlx` binary available in agent sandbox environments is an outdated, inspection-only build (v1.2.0 / reporting "0.1.0") that only supports `login` and `inspect` commands. The full CLI at v1.3.4 in the source repository has all write capabilities (`tickets create`, `comments post`, etc.), but this version has never been published to npm.

## Root Cause Analysis

**Primary cause: Stale npm package**

The `helix-workflow-step-agent` installs `@projectxinnovation/helix-cli@^1.2.0` from npm. The published v1.2.0 package contains only an inspection-only CLI build:

- `dist/index.js` — switch statement handles only `login`, `inspect`, `--version`
- `dist/inspect/` — inspection subcommands
- `dist/lib/` — config + HTTP utilities
- `dist/login.js` — authentication

The full CLI source (v1.3.4) added these commands after v1.2.0 was published, but no subsequent npm publish was made:
- `tickets` (create, list, get, update-description, rerun, continue, artifacts, artifact, bundle)
- `comments` (list, post)
- `library` (list, show, comments)
- `org` (current, list, switch)
- `token` (add)
- `skill` (show, install)
- `update`
- `preview`

When agents run `hlx tickets create` or `hlx comments post`, the CLI responds with "Unknown command" and exits.

**Contributing factor: Misleading env var names**

Agent sandboxes set `HELIX_INSPECT_TOKEN` and `HELIX_INSPECT_BASE_URL`. While the CLI code treats these as aliases for `HELIX_API_KEY` and `HELIX_URL` (same auth context), the naming implies inspection-only access. This may cause agents to self-censor from attempting write operations even if the commands existed.

**Contributing factor: No environment labeling**

The CLI output does not indicate whether the configured server is production or staging. Combined with the `INSPECT` prefix in env var names, this contributes to the reported confusion about which environment agents are targeting.

**Non-issue: Server-side auth**

The server has NO read-only restriction for hxi_ API keys:
- `attachAuthContext` (middleware.ts:16) resolves hxi_ keys to full `AuthContext` via `resolveApiKeyAuth`
- `requireAuth` (middleware.ts:66) only checks `auth !== null` — no permission differentiation
- `POST /api/tickets` (api.ts:331) is accessible to any authenticated request
- `InspectionApiKey` model has no permissions or scopes field
- All 10 active production API keys have empty `repos` arrays (unrestricted)
- Production logs confirm `POST /api/tickets 201` succeeds consistently

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| Sandbox CLI version | `hlx --version` in agent sandbox | Reports "0.1.0"; only has login + inspect |
| Sandbox dist contents | `ls dist/` in installed npm package | Missing: tickets/, comments/, library/, org/, token/, skill/, update/, preview/ |
| Sandbox CLI help | `hlx` in agent sandbox | Only shows login + inspect commands |
| Source CLI version | helix-cli/package.json | v1.3.4 with full 10-command set |
| npm dependency | helix-workflow-step-agent/package.json | `@projectxinnovation/helix-cli: ^1.2.0` |
| Server auth flow | helix-global-server/src/auth/middleware.ts:227-299 | resolveApiKeyAuth builds full AuthContext identical to session auth |
| Server ticket route | helix-global-server/src/routes/api.ts:331 | POST /api/tickets behind generic requireAuth, not a special gate |
| Production API keys | DB query: InspectionApiKey WHERE status = 'ACTIVE' | All 10 keys have empty repos arrays |
| Production logs | BetterStack: POST /api/tickets | Multiple 201 responses confirmed; zero 401/403 errors on ticket endpoints |
| CLI config loading | helix-cli/src/lib/config.ts:42-43 | HELIX_INSPECT_TOKEN is alias for HELIX_API_KEY; same access level |

## Success Criteria

1. **Agents can run `hlx tickets create`** — the command exists in the sandbox-installed CLI and successfully creates tickets against production
2. **Agents can run `hlx comments post`** — the command exists and posts comments to tickets
3. **Agents can run `hlx tickets list` / `hlx tickets get`** — agents can look up any ticket, not just the current one
4. **No "Unknown command" errors** — all documented CLI commands are available in the agent sandbox environment
5. **Environment clarity** — agents should have clear signals about which environment (production) their token targets

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library run root) | Understand the full problem statement and referenced ticket RSH-534 | Agents expected to create tickets, post comments, look up tickets; confusion about prod vs staging |
| scout/reference-map.json (helix-cli) | Map CLI capabilities and auth flow | CLI v1.3.4 has both read and write commands; all env var aliases resolve to same apiKey |
| scout/scout-summary.md (helix-cli) | Synthesized CLI capability analysis | Confirmed write commands exist in source; skill docs document ticket creation |
| scout/reference-map.json (helix-global-server) | Map server auth boundaries for hxi_ keys | No read-only restriction; hxi_ keys get full AuthContext; ticket CRUD after generic requireAuth |
| scout/scout-summary.md (helix-global-server) | Server-side auth architecture verification | attachAuthContext resolves hxi_ keys; requireAuth is just null check; no permissions field on API keys |
| helix-cli/src/index.ts | Full CLI source entrypoint | 10 commands including tickets, comments, library in v1.3.4 source |
| helix-cli/src/tickets/create.ts | Ticket creation implementation | POST /api/tickets with basePath '/api'; full implementation present |
| helix-cli/src/comments/post.ts | Comment posting implementation | POST /api/tickets/{id}/comments with basePath '/api'; full implementation present |
| helix-cli/src/lib/config.ts | Config/token loading with env var priority | HELIX_INSPECT_TOKEN is legacy alias; same access as HELIX_API_KEY |
| helix-cli/src/lib/http.ts | HTTP client auth handling | hxi_ prefix uses X-API-Key header; default basePath '/api/inspect' |
| helix-cli/skill-content/SKILL.md | Agent-facing skill documentation | Documents ticket creation, comment posting as available workflow steps |
| helix-global-server/src/routes/api.ts | Server route registration and auth gates | requireAuth at line 310; ticket CRUD at lines 331+; comments before requireAuth with own auth |
| helix-global-server/src/auth/middleware.ts | Auth middleware resolving hxi_ keys | resolveApiKeyAuth builds full AuthContext; no capability downgrading |
| helix-global-server/src/controllers/ticket-controller.ts | Ticket creation handler and validation | Zod schema: title 1-160, description 1-10000, repositoryIds 1-20 |
| Production DB (runtime) | Active API key configuration | All 10 active keys unrestricted (empty repos arrays) |
| Production logs (runtime) | Ticket creation success/failure evidence | POST /api/tickets 201 confirmed; no auth failures on ticket endpoints |
| Sandbox CLI binary (runtime) | Actual CLI available to agents | v0.1.0 with only login + inspect; 'tickets' and 'comments' are "Unknown command" |
