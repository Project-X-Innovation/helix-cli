# Product — BLD-693: ns-gm Server-Side Decomposition (CLI)

## Problem Statement

The ns-gm CLI currently runs monolithically inside ephemeral sandboxes with direct, uncontrolled production NetSuite access ("Channel A"). This bypasses all server-side governance controls — no rate limiting, no write-blocking, no result sanitization, no audit logging. The agent controls the CLI and can issue arbitrary queries against production NetSuite. Meanwhile, "Channel B" (the inspection proxy for database, logs, and API) already enforces all of these controls server-side. The ns-gm CLI is the sole remaining unmediated production data path.

Additionally, NetSuite credential material (private key PEM) is injected directly into the sandbox at `/tmp/nsgm-{runId}.pem`, meaning the sandbox itself holds production secrets.

## Product Vision

Replace the uncontrolled in-sandbox ns-gm CLI with two governed server-side surfaces — `hlx inspect netsuite` (read-only by construction) and `hlx run` (role-bounded + audited) — so that all NetSuite access flows through the same server-side inspection proxy that already governs database, logs, and API access. The sandbox becomes credential-free for NetSuite. The server becomes the sole trust anchor.

The `hlx` CLI is the thin interface layer: it dispatches agent commands to the server-side proxy via authenticated HTTP requests, following the same pattern as the existing `hlx inspect db/logs/api` subcommands.

## Users

| User | Context |
|------|---------|
| AI agents (in sandbox) | Primary consumers. Issue `hlx inspect netsuite` and `hlx run` commands during workflow steps (scout, diagnosis, implementation, verification). |
| Platform operators | Configure NetSuite credentials per-org/environment. Monitor audit logs. Manage integration-user roles. |
| Customers | Indirectly affected: production data access is now governed end-to-end; customers are advised to keep prod integration role least-privilege. |

## Use Cases

1. **Read NetSuite data safely** — Agent queries production NetSuite records via SuiteQL during scout/diagnosis steps without the ability to mutate data, regardless of the account's NetSuite role.
2. **Retrieve NetSuite script logs** — Agent pulls script execution logs from NetSuite for debugging SuiteScript issues.
3. **Execute SuiteScript** — Agent runs arbitrary SuiteScript code server-side during implementation/verification steps, bounded by the account's NetSuite integration-user role.
4. **Target a specific environment** — Agent explicitly selects production or sandbox NetSuite environment when the default is insufficient.

## Core Workflow

1. Agent calls `hlx inspect netsuite --query <SuiteQL>` or `hlx run <code>` from the sandbox.
2. The `hlx` CLI parses flags (`--repo`, `--env`, `--query`, positional args) and sends an authenticated HTTP POST (Bearer token from `HELIX_INSPECT_TOKEN` env var) to the Helix server via `hxFetch`.
3. The server's inspection proxy handles auth, rate limiting, read-only validation (for inspect), credential management, NetSuite invocation, sanitization, and audit logging.
4. The CLI receives the JSON response and prints it to stdout.

## Essential Features (MVP)

- **`hlx inspect netsuite` subcommand** — New handler following the `db.ts` template pattern. Supports SuiteQL queries (`--query` flag or positional) and log retrieval (`logs` subcommand). Sends POST to `/api/inspect/{repoId}/netsuite`.
- **`hlx run` top-level command** — New handler for arbitrary SuiteScript execution. Sends POST to `/api/inspect/{repoId}/run` with code from positional arg or flag.
- **`--env prod|sandbox` flag** — Accepted by both commands. Included in request body when specified. When omitted, the server applies the per-step default.
- **`--repo` flag** — Repository resolution via existing `resolveRepo` utility.
- **Router updates** — `case "netsuite"` added to inspect switch; `case "run"` added to main dispatcher.

## Features Explicitly Out of Scope (MVP)

- **No `nsEnv` JWT claim** — Environment selection is a plain `--env` parameter, not a cryptographic claim.
- **No changes to existing `hlx inspect db/logs/api`** — Existing subcommands are unchanged.
- **No interactive mode** — Code/query input is from flags or positional args only.
- **No local caching** — All results are fetched fresh from the server on each invocation.

## Success Criteria

1. `hlx inspect netsuite --repo <name> --query <suiteql>` sends POST to `/api/inspect/{repoId}/netsuite` with `{type: 'query', query}` and prints JSON response.
2. `hlx inspect netsuite --repo <name> logs` sends POST with `{type: 'logs'}` and prints JSON response.
3. `hlx run --repo <name> <code>` sends POST to `/api/inspect/{repoId}/run` with `{code}` and prints JSON response.
4. `--env prod|sandbox` flag is accepted by both commands and included in the request body.
5. TypeScript typecheck (`tsc --noEmit`) passes on helix-cli.

## User Scenarios

[SCN-01] Query NetSuite records with SuiteQL
- Precondition: Agent is running in a scout step; org has production NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite --query "SELECT id, companyname FROM customer WHERE isinactive = 'F'"`
- Expected Outcome: Agent receives a JSON result with matching customer records, capped at 200 rows, with any secrets redacted from the response

[SCN-02] Retrieve NetSuite script logs
- Precondition: Agent is running in a diagnosis step; org has production NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite logs`
- Expected Outcome: Agent receives recent NetSuite script execution logs as JSON, sanitized and size-capped

[SCN-03] Write-shaped SuiteQL is rejected
- Precondition: Agent is running in any step; org has NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite --query "UPDATE customer SET companyname = 'test' WHERE id = 1"`
- Expected Outcome: The server rejects the query with HTTP 400 before it reaches NetSuite; the agent receives an error indicating the query is not read-only

[SCN-04] Execute SuiteScript code
- Precondition: Agent is running in an implementation step; org has sandbox NsGmCredential configured
- Action: Agent runs `hlx run "var rec = record.load({type: 'customrecord_test', id: 1}); return rec.getValue('name');"`
- Expected Outcome: Agent receives the SuiteScript execution result as JSON, sanitized and audited with type SUITESCRIPT

[SCN-05] Override default environment
- Precondition: Agent is running in an implementation step (default: SANDBOX); org has both prod and sandbox credentials
- Action: Agent runs `hlx inspect netsuite --env prod --query "SELECT COUNT(*) FROM transaction"`
- Expected Outcome: The query executes against the production NetSuite environment, not the default sandbox

[SCN-06] Unavailable environment fails explicitly
- Precondition: Agent is running in any step; org has only production NsGmCredential (no sandbox credential configured)
- Action: Agent runs `hlx inspect netsuite --env sandbox --query "SELECT id FROM item"`
- Expected Outcome: The server returns HTTP 400 with a message indicating the sandbox credential is unavailable; no silent fallback to production occurs

[SCN-07] Rate limiting applied to NetSuite operations
- Precondition: Agent is running in any step; org has NsGmCredential configured
- Action: Agent sends more than 60 inspection requests (across all types: db, logs, api, netsuite, run) within 60 seconds
- Expected Outcome: Requests beyond the 60-request limit are rejected with a rate-limit error; earlier requests completed normally

[SCN-08] Sandbox operates without NetSuite credentials
- Precondition: A new workflow run starts for an org with NsGmCredential configured
- Action: The orchestrator provisions the sandbox for any step
- Expected Outcome: No ns-gm CLI is installed in the sandbox, no PEM file is written to `/tmp`, and no ns-gm setup commands run; the sandbox is credential-free for NetSuite

[SCN-09] SDF operations still work from sandbox
- Precondition: Agent is running in an implementation step; org has SDF credentials configured
- Action: Agent runs an SDF command (e.g., `object:list` or `project:deploy`) that requires `{acct}.app.netsuite.com`
- Expected Outcome: The SDF operation succeeds because `{acct}.app.netsuite.com` remains in the sandbox runtime egress allowlist

[SCN-10] All operations are audited with distinct types
- Precondition: Agent runs both `hlx inspect netsuite` and `hlx run` commands during a workflow
- Action: Platform operator reviews the inspection audit log after the workflow completes
- Expected Outcome: SuiteQL/log queries appear with type `NETSUITE` and SuiteScript executions appear with type `SUITESCRIPT`, clearly distinguished from existing `DATABASE`/`LOGS`/`API` audit entries

## Key Design Principles

- **Safe by construction**: `hlx inspect netsuite` enforces read-only semantics at the server level (`assertReadOnlyQuery`) — the safety guarantee is account-independent and does not depend on the NetSuite role.
- **Credential-free sandbox**: After this change, no NetSuite credentials (PEM, tokens, secrets) enter the sandbox. The server is the sole trust anchor.
- **Role is the ceiling**: For `hlx run`, the account's NetSuite integration-user role is the authoritative capability bound. Helix does not constrain the operation beyond sanitization, rate limiting, and auditing.
- **Extend, don't reinvent**: The existing inspection proxy pattern (token auth, rate limiting, sanitization, audit) and CLI dispatch pattern (switch + hxFetch + resolveRepo) are reused. Zero new infrastructure.
- **Explicit failure**: No silent cross-environment fallback. If a requested environment's credential is unavailable, the operation fails with a clear HTTP 400 error.

## Scope & Constraints

- **CLI changes**: ~4 files. 2 new handlers (`src/inspect/netsuite.ts`, `src/run/index.ts`), 2 modified routers (`src/inspect/index.ts`, `src/index.ts`).
- **Pattern adherence**: All new CLI handlers follow the established `resolveRepo -> hxFetch POST -> console.log JSON` pattern from `db.ts`.
- **Auth model**: Uses `HELIX_INSPECT_TOKEN` env var (BLD-685's rotating inspection key). No new auth mechanism.
- **HTTP client**: Uses existing `hxFetch` with default basePath `/api/inspect`. No basePath override needed.

## Future Considerations

- **Interactive REPL mode**: A future `hlx run --interactive` mode for iterative SuiteScript development.
- **Output formatting**: Pretty-print or table formatting options for query results.
- **Saved search commands**: If saved search authoring via server-side is needed, additional CLI subcommands would be added.

## Open Questions / Risks

| # | Question / Risk | Status |
|---|----------------|--------|
| 1 | **RESTlet payload format**: The exact request body structure for SuiteQL execution, log retrieval, and arbitrary SuiteScript invocation is not visible in the current server codebase (it was in the ns-gm CLI). CLI request body shapes must align with what the server handlers expect. | Open — depends on server implementation |
| 2 | **Environment default resolution**: When `--env` is omitted, the server derives the default from step context. The CLI simply omits `env` from the body. The server must have step context available. | Open — server-side concern |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (BLD-693 description) | Primary ticket specification with overrides and acceptance criteria | Two governed surfaces, three overrides from RSH-636, --env as plain parameter |
| ticket.md (Research Report RSH-636) | Detailed architecture plan and CLI scope | ~4 CLI files, thin interface pattern, zero new dependencies |
| scout/scout-summary.md (helix-cli) | CLI architecture analysis | Switch-based routing, hxFetch client, flag utilities, db.ts template pattern |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI implementation scope and design notes | Two new handlers, two router mods, hxFetch basePath reuse, --env as body param |
| diagnosis/apl.json (helix-cli) | CLI questions answered | Switch locations, --env parameter passing, basePath compatibility |
| scout/scout-summary.md (helix-global-server) | Server-side context for understanding the full flow | OAuth2 M2M proven, inspection pattern, endpoint paths |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server-side scope confirmation | ~12 server files, endpoint registration pattern |
| repo-guidance.json | Repo intent mapping | helix-cli=target (secondary), helix-global-server=target (primary), helix-global-client=context |
