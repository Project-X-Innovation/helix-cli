# Product: Server-Side ns-gm Migration via hlx inspect

## Problem Statement

The ns-gm CLI currently runs directly inside ephemeral Vercel sandboxes with decrypted production PEM private keys written to the filesystem. This means sandbox agents have uncontrolled, unmediated access to the entire production NetSuite account — no rate limiting, no write-blocking, no audit logging, no result sanitization. Combined with unrestricted internet egress, this creates a data exfiltration pathway where an agent can query any production data and send it to any external endpoint.

An existing server-side inspection proxy already handles DATABASE, LOGS, and API queries with full security controls (write-blocking, 200-row cap, 1MB cap, rate limiting, audit logging). The ns-gm CLI path operates entirely outside that proxy's scope.

## Product Vision

Move all NetSuite production data access from an uncontrolled in-sandbox CLI to the existing server-side inspection proxy. After migration, production credentials (PEM private key, accountId, clientId) never enter the sandbox. Agents access NetSuite data via `hlx inspect netsuite`, routed through the server with the same security controls applied to database, logs, and API queries today.

## Users

- **Helix agents (automated):** Primary consumers. Agents running in scout and diagnosis steps query production NetSuite data to investigate tickets. They currently use `ns-gm` CLI directly; after migration they use `hlx inspect netsuite`.
- **Platform operators:** Benefit from audit visibility, rate limiting, and write-blocking on all production data queries — controls that currently do not exist for ns-gm.
- **Organization administrators:** Manage NetSuite credentials through the existing settings UI. No new credential setup required.

## Use Cases

1. **Agent queries production NetSuite data during scout/diagnosis** — the primary use case. The agent runs a SuiteQL query to inspect production records, receiving sanitized results through the server proxy.
2. **Agent queries sandbox NetSuite data during implementation/verification** — non-production steps receive sandbox environment credentials automatically, preserving current per-step routing behavior.
3. **Platform enforces security controls on all NetSuite queries** — every query is write-blocked, rate-limited, row-capped, size-capped, and audit-logged, regardless of which agent issued it.

## Core Workflow

1. Agent in sandbox needs NetSuite data (e.g., to check a record, run a SuiteQL query).
2. Agent runs `hlx inspect netsuite --repo <name> --query "<SuiteQL>"`.
3. CLI POSTs the query to the server endpoint (`POST /api/inspect/{repoId}/netsuite`).
4. Server determines the correct environment (PRODUCTION for scout/diagnosis, SANDBOX for other steps).
5. Server loads the organization's NsGmCredential, performs OAuth2 M2M token exchange server-side, and calls the NetSuite RESTlet.
6. Server applies security pipeline: write-keyword blocking, 200-row cap, 1MB response cap, credential redaction, rate limiting (60 req/60s), and audit logging.
7. Sanitized results returned to the agent.

## Essential Features (MVP)

1. **NETSUITE_QUERY inspection proxy type** — new handler in the server-side inspection proxy, following the existing DATABASE/LOGS/API pattern with the full security pipeline (sanitization, rate limiting, write-blocking, audit).
2. **Server-side OAuth2 M2M token exchange for NetSuite** — server loads PEM credentials and performs the PS256 JWT assertion flow to obtain access tokens. (Note: this capability is already proven in the existing credential test service.)
3. **Per-step environment routing** — scout/diagnosis steps receive PRODUCTION credentials, other steps receive SANDBOX credentials, matching current behavior but enforced server-side.
4. **`hlx inspect netsuite` CLI subcommand** — new subcommand in helix-cli following the established db/logs/api pattern, allowing agents to query NetSuite from inside sandboxes.
5. **Removal of sandbox-side ns-gm injection** — remove `installNsGmCli()`, `runNsGmSetupAndValidateEnv()`, PEM file writes to `/tmp`, and per-step ns-gm CLI switching from the orchestrator.
6. **Credential bridge from NsGmCredential model** — the new proxy handler loads credentials from the existing per-org NsGmCredential model rather than requiring new per-repo credential configuration.

## Features Explicitly Out of Scope (MVP)

1. **Domain allowlist / network egress controls** — the second P0 item from the research report (via `sandbox.update({ networkPolicy })`). Separate work item.
2. **Multi-agent zone orchestration** — the Hot/Warm/Hot zone chaining pattern. P1 priority, separate work item.
3. **Silent credential fallback removal** — replacing the orchestrator's silent fallback to the other environment. P1 priority.
4. **Credential brokering for ANTHROPIC_API_KEY** — using Vercel `injectionRules` for the LLM API key. P2 priority.
5. **Content-aware DLP for business data** — NLP-based filtering of customer names, financials, etc. P3 priority, no production-ready solution exists.
6. **helix-global-client UI changes** — no new credential management UI needed if the proxy bridges to the existing per-org NsGmCredential model.
7. **Prisma InspectionCredentialType enum extension** — if the credential bridge uses NsGmCredential directly (per-org), no schema migration is needed for a new enum value.
8. **Audit logging hardening** — migrating from fire-and-forget to persistent, tamper-evident audit. P2 priority.

## Success Criteria

1. **No production credentials in sandboxes** — no PEM file writes, no `npm install -g ns-gm`, no `ns-gm setup:ci/init/env` commands inside any sandbox.
2. **All NetSuite queries pass through the inspection proxy** — with write-keyword blocking, 200-row cap, 1MB response cap, credential redaction, rate limiting (60 req/60s), and audit logging.
3. **`hlx inspect netsuite` works from sandboxes** — agents can query NetSuite data using the same `hlx inspect` pattern they use for database, logs, and API queries.
4. **Per-step environment routing preserved** — scout/diagnosis steps query PRODUCTION, other steps query SANDBOX.
5. **Existing inspection proxy functionality unaffected** — DATABASE, LOGS, API queries continue to work identically.
6. **Existing NsGmCredential management UI continues to work** — no changes to the settings UI.

## User Scenarios

[SCN-01] Agent queries production NetSuite data during scout step
- Precondition: Organization has PRODUCTION NsGmCredentials configured; a scout step is running in a sandbox
- Action: Agent runs `hlx inspect netsuite --repo <name> --query "SELECT id, companyname FROM customer WHERE id = 123"`
- Expected Outcome: Agent receives a JSON response with the query results, limited to 200 rows and 1MB,
  with any credential-like values redacted. The query is audit-logged on the server.

[SCN-02] Agent queries sandbox NetSuite data during implementation step
- Precondition: Organization has SANDBOX NsGmCredentials configured; an implementation step is running
- Action: Agent runs `hlx inspect netsuite --repo <name> --query "SELECT id FROM customrecord_test"`
- Expected Outcome: The query executes against the SANDBOX NetSuite environment (not production),
  and sanitized results are returned.

[SCN-03] Write query is blocked by the proxy
- Precondition: Agent is running in any step with NetSuite access
- Action: Agent runs `hlx inspect netsuite --repo <name> --query "UPDATE customer SET companyname = 'test' WHERE id = 1"`
- Expected Outcome: The server rejects the query before execution, returning an error indicating
  write operations are not permitted. No data is modified in NetSuite.

[SCN-04] Rate limit prevents excessive querying
- Precondition: Agent is running in a sandbox and has already made 60 NetSuite queries in the past 60 seconds
- Action: Agent runs another `hlx inspect netsuite` query
- Expected Outcome: The server returns a rate-limit error (HTTP 429) without executing the query.
  The agent can retry after the rate window resets.

[SCN-05] Production credentials are absent from the sandbox filesystem
- Precondition: A scout or diagnosis step is running (previously, these steps had PEM files in /tmp)
- Action: Agent examines `/tmp/` for any `nsgm-*.pem` files or checks for the `ns-gm` CLI binary
- Expected Outcome: No PEM files exist in `/tmp/`. The `ns-gm` CLI is not installed.
  NetSuite access is only available through `hlx inspect netsuite`.

[SCN-06] Agent queries NetSuite when no credentials are configured
- Precondition: Organization has not configured NsGmCredentials for the target environment
- Action: Agent runs `hlx inspect netsuite --repo <name> --query "SELECT id FROM customer"`
- Expected Outcome: The server returns a clear error indicating NetSuite credentials are not configured
  for the organization/environment. No silent fallback to another environment occurs.

[SCN-07] Large query results are capped
- Precondition: Agent is querying a table with thousands of records
- Action: Agent runs `hlx inspect netsuite --repo <name> --query "SELECT * FROM customer"`
- Expected Outcome: Results are capped at 200 rows maximum. The response indicates truncation
  occurred. Total response size does not exceed 1MB.

[SCN-08] Existing inspection queries continue working
- Precondition: Organization has DATABASE, LOGS, and/or API inspection credentials configured
- Action: Agent runs `hlx inspect db --repo <name> --query "SELECT 1"` or similar existing commands
- Expected Outcome: Existing inspection commands work exactly as before with no behavioral changes.

[SCN-09] hlx inspect shows netsuite in available subcommands
- Precondition: Agent has access to the hlx CLI
- Action: Agent runs `hlx inspect` or `hlx inspect --help`
- Expected Outcome: The help output lists `netsuite` as an available subcommand alongside
  repos, db, logs, and api.

[SCN-10] NetSuite query audit trail is recorded
- Precondition: Agent is running in a scout step with production access
- Action: Agent runs multiple `hlx inspect netsuite` queries during the step
- Expected Outcome: Each query is logged in the audit system with query type (NETSUITE_QUERY),
  a snippet of the query, the organization, and execution latency.

## Key Design Principles

- **Credentials never leave the server** — production PEM keys, account IDs, and client IDs are loaded, used for token exchange, and discarded within the server process. No credential material enters the sandbox.
- **Reuse existing security pipeline** — the inspection proxy's sanitization, rate limiting, write-blocking, and audit logging apply to NetSuite queries the same way they apply to database queries. No new security controls need to be invented.
- **Transparent to the agent** — agents use the same `hlx inspect` pattern they already use for database, logs, and API queries. The command interface is consistent and discoverable.
- **Preserve credential routing semantics** — scout/diagnosis steps get PRODUCTION access, other steps get SANDBOX access. The routing logic moves from sandbox-side CLI switching to server-side credential loading, but the policy is unchanged.

## Scope & Constraints

- **Two repos change:** helix-global-server (primary: new proxy type, credential bridge, sandbox-side removal) and helix-cli (secondary: new subcommand).
- **Zero client changes:** helix-global-client requires no changes because the proxy bridges to the existing per-org NsGmCredential model.
- **Existing credential management is sufficient:** Organizations already configure NsGmCredentials through the settings UI. No new onboarding steps.
- **OAuth2 M2M signing is already proven server-side:** The `ns-gm-credential-test-service.ts` demonstrates the complete PS256 JWT assertion flow. This is not a new capability.
- **Architectural precedent exists:** The host-agent service on Sprites already routes `hlx inspect` commands through the server via the `run_helix_cli` MCP tool.

## Future Considerations

- **Domain allowlist (P0, separate ticket):** Applying `sandbox.update({ networkPolicy })` to restrict outbound network traffic. Combined with server-side ns-gm, this achieves the 90/10 security value.
- **Multi-agent zone orchestration (P1):** Hot/Warm/Hot zone chaining where each zone is a separate agent instance. Requires orchestrator changes for new sandbox per zone, artifact sanitization as a gating step.
- **Silent credential fallback removal (P1):** Replacing the orchestrator's silent fallback (which could give a non-production step PRODUCTION credentials) with explicit failure.
- **Per-repo NETSUITE credential type:** If future requirements need per-repo NetSuite access (different credentials per repo), the InspectionCredentialType enum would need extension and client UI updates.

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|----------------|--------|
| 1 | How should per-step environment (PRODUCTION vs SANDBOX) be communicated through the inspection API? Options: request body parameter, manifest.json config, or inspection token claims. | Affects API design and security model for environment routing. |
| 2 | Should the credential bridge from NsGmCredential use the repository's organization context, or should the environment be included in the API request? | Determines whether any Prisma schema changes are needed and how credential lookup works. |
| 3 | What happens when both PRODUCTION and SANDBOX NsGmCredentials are unavailable? The current orchestrator has a silent fallback to the other environment. | Must ensure the new proxy does not replicate the silent fallback behavior — should fail explicitly. |
| 4 | Does the `ns-gm` CLI support additional operations beyond SuiteQL queries (e.g., saved search, record CRUD) that agents currently use? | If so, the inspection proxy may need additional endpoint variations beyond a single query endpoint. |
| 5 | Latency impact: adding a server hop for every NetSuite query introduces network latency. The OAuth2 token exchange adds further latency per request (unless tokens are cached). | May need server-side token caching to avoid re-authenticating for every query within a step. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-633) | Primary specification for the migration | ns-gm migration is DECIDED. Two changes (server-side ns-gm + domain allowlist) achieve 90% security value. PEM-based signing cannot use credential brokering — must move fully server-side. |
| scout/scout-summary.md (helix-global-server) | Understand server architecture | Two credential channels: Channel A (ns-gm CLI, uncontrolled) and Channel B (inspection proxy, controlled). OAuth2 M2M already proven server-side. Clear removal/extension boundaries. |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause and success criteria | Architectural gap, not a bug. Current flow (PEM injection) vs target flow (proxy-mediated). Six success criteria defined. |
| diagnosis/apl.json (helix-global-server) | Design decisions and evidence | Credential bridge design (per-org NsGmCredential, not per-repo). Environment routing options. Seven questions answered with code evidence. |
| scout/scout-summary.md (helix-cli) | CLI extension pattern | Consistent 12-line subcommand pattern. Zero existing NetSuite code. Transport/auth infrastructure reusable. |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change scope | One new handler file, one dispatch case, documentation update. Straightforward extension. |
| diagnosis/apl.json (helix-cli) | CLI implementation detail | New file src/inspect/netsuite.ts following db.ts pattern. POST to /api/inspect/{repoId}/netsuite. |
| scout/scout-summary.md (helix-global-client) | Client impact assessment | Zero client changes needed if proxy bridges to per-org NsGmCredential. Existing UI manages the right data. |
| scout/scout-summary.md (library) | Repo role assessment | Documentation/research repo. No source code changes. Research report is the primary specification. |
| repo-guidance.json | Repo intent mapping | helix-global-server=target, helix-cli=target, helix-global-client=context, library=context. |
