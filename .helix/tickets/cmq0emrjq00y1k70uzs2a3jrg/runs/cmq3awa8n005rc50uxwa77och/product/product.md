# Product — BLD-693: ns-gm Server-Side Decomposition (CLI)

## Problem Statement

The ns-gm CLI currently runs monolithically inside ephemeral sandboxes with direct, uncontrolled production NetSuite access. Production private keys (PEM) are written into the sandbox filesystem at `/tmp/nsgm-{runId}.pem`, and agents can issue arbitrary queries — including writes — without server-side mediation. There is no write-blocking, rate limiting, result sanitization, secret redaction, or audit logging on this path. Every other data source (database, logs, API) is safely mediated through the server-side inspection proxy, but NetSuite bypasses it entirely.

## Product Vision

Replace the uncontrolled in-sandbox ns-gm CLI with two governed server-side surfaces — `hlx inspect netsuite` (read-only by construction) and `hlx run` (role-bounded + audited) — so that all NetSuite access flows through the same server-side inspection proxy that governs database, logs, and API access. The sandbox becomes credential-free for NetSuite.

The `hlx` CLI is the thin interface layer: it dispatches agent commands to the server-side proxy via authenticated HTTP requests, following the same pattern as the existing `hlx inspect db/logs/api` subcommands.

## Users

| User | Context |
|------|---------|
| AI agents (in sandbox) | Primary consumers. Issue `hlx inspect netsuite` and `hlx run` commands during workflow steps (scout, diagnosis, implementation, verification). |
| Platform operators | Configure NetSuite credentials per-org/environment. Monitor audit logs. Manage integration-user roles. |
| Customers | Indirectly affected: production data access is now governed end-to-end. |

## Use Cases

1. **Read NetSuite data safely** — Agent queries production NetSuite records via SuiteQL during scout/diagnosis without the ability to mutate data, regardless of the account's NetSuite role.
2. **Retrieve NetSuite script logs** — Agent pulls script execution logs from NetSuite for debugging SuiteScript issues, optionally filtering by script ID.
3. **Execute SuiteScript** — Agent runs arbitrary SuiteScript code server-side during implementation/verification, bounded by the account's NetSuite integration-user role.
4. **Target a specific environment** — Agent explicitly selects production or sandbox NetSuite environment via `--env` when the per-step default is insufficient.

## Core Workflow

1. Agent calls `hlx inspect netsuite --query <SuiteQL>` or `hlx run --code <script>` from the sandbox.
2. The `hlx` CLI parses flags (`--repo`, `--env`, `--query`, `--code`, `--modules`, `--script-id`, positional args) and reads the inspection manifest for `nsDefaultEnv` default.
3. CLI sends an authenticated HTTP POST (Bearer token from `HELIX_INSPECT_TOKEN` env var) to the Helix server via `hxFetch`.
4. The server handles auth, rate limiting, read-only validation (for inspect), credential management, NetSuite invocation, sanitization, and audit logging.
5. The CLI receives the JSON response and prints it to stdout.

## Essential Features (MVP)

- **`hlx inspect netsuite` subcommand** — Handler with two modes: query mode (body `{type: 'query', query, env?}`, query from `--query` or positional args) and logs mode (body `{type: 'logs', scriptId?, env?}`, triggered by `logs` positional arg, optional `--script-id`). POSTs to `/api/inspect/{repoId}/netsuite`.
- **`hlx run` top-level command** — Handler accepting `--repo` (required), `--code` (or positional args), `--modules` (comma-separated), `--env`. POSTs body `{code, modules?, env?}` to `/api/inspect/{repoId}/run`.
- **`--env prod|sandbox` flag** — Accepted by both commands. When omitted, reads `nsDefaultEnv` from inspection manifest (PRODUCTION -> 'prod', else -> 'sandbox') as default.
- **Router updates** — `case "netsuite"` added to inspect switch in `src/inspect/index.ts`; `case "run"` added to main dispatcher in `src/index.ts`.

## Features Explicitly Out of Scope (MVP)

- **No `nsEnv` JWT claim** — Environment selection is a plain `--env` parameter, not a cryptographic claim.
- **No changes to existing `hlx inspect db/logs/api`** — Existing subcommands are unchanged.
- **No interactive mode** — Code/query input is from flags or positional args only.
- **No local caching** — All results are fetched fresh from the server.
- **No new runtime dependencies** — Zero npm dependencies; uses existing `hxFetch`, `resolveRepo`, `getFlag`, `getPositionalArgs`.

## Success Criteria

1. `hlx inspect netsuite --repo <name> --query <suiteql>` sends correct POST and prints JSON response.
2. `hlx inspect netsuite --repo <name> logs` sends correct POST with `{type: 'logs'}` and prints JSON response.
3. `hlx inspect netsuite --repo <name> logs --script-id <id>` includes `scriptId` in request body.
4. `hlx run --repo <name> --code <code>` sends correct POST and prints JSON response.
5. `hlx run --repo <name> --code <code> --modules N/record,N/search` sends modules as array in request body.
6. `--env prod|sandbox` is accepted by both commands and included in request body.
7. Missing `--repo` on `hlx run` exits with error (process.exit(1)).
8. TypeScript typecheck (`tsc --noEmit`) passes on helix-cli.

## User Scenarios

[SCN-01] Query NetSuite records with SuiteQL
- Precondition: Agent is running in a scout step; org has production NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite --query "SELECT id, companyname FROM customer WHERE isinactive = 'F'"`
- Expected Outcome: Agent receives a JSON result with matching customer records, capped at 200 rows, with any secrets redacted from the response

[SCN-02] Retrieve NetSuite script logs
- Precondition: Agent is running in a diagnosis step; org has production NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite logs`
- Expected Outcome: Agent receives recent NetSuite script execution logs as JSON, sanitized and size-capped

[SCN-03] Retrieve script logs filtered by script ID
- Precondition: Agent is running in a diagnosis step; org has production NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite logs --script-id customscript_my_mr`
- Expected Outcome: Agent receives script execution log entries for only the specified script, sanitized and capped

[SCN-04] Write-shaped SuiteQL is rejected
- Precondition: Agent is running in any step; org has NsGmCredential configured
- Action: Agent runs `hlx inspect netsuite --query "UPDATE customer SET companyname = 'test' WHERE id = 1"`
- Expected Outcome: The server rejects the query before it reaches NetSuite; the agent receives an error indicating the query is not read-only

[SCN-05] Execute SuiteScript code
- Precondition: Agent is running in an implementation step; org has sandbox NsGmCredential configured
- Action: Agent runs `hlx run --repo my-repo --code "var rec = record.load({type: 'customrecord_test', id: 1}); return rec.getValue('name');"`
- Expected Outcome: Agent receives the SuiteScript execution result as JSON, sanitized and audited with type SUITESCRIPT

[SCN-06] Execute SuiteScript with module imports
- Precondition: Agent is running in an implementation step; org has sandbox NsGmCredential configured
- Action: Agent runs `hlx run --repo my-repo --code "var rec = record.load({type:'salesorder',id:1}); return rec.getValue('total');" --modules N/record`
- Expected Outcome: Server executes the SuiteScript with the N/record module available; result is sanitized and audited as SUITESCRIPT

[SCN-07] Override default environment with --env flag
- Precondition: Agent is running in an implementation step (default: SANDBOX); org has both prod and sandbox credentials
- Action: Agent runs `hlx inspect netsuite --env prod --query "SELECT COUNT(*) FROM transaction"`
- Expected Outcome: The query executes against the production NetSuite environment, not the default sandbox

[SCN-08] Default environment routing per workflow step
- Precondition: Agent is running in a diagnosis step (default: PRODUCTION); no --env flag used
- Action: Agent runs `hlx inspect netsuite "SELECT id FROM transaction FETCH FIRST 5 ROWS ONLY"`
- Expected Outcome: The query runs against production NetSuite (the step default read from manifest nsDefaultEnv); agent does not need to specify --env

[SCN-09] Unavailable environment fails explicitly
- Precondition: Agent is running in any step; org has only production NsGmCredential (no sandbox credential configured)
- Action: Agent runs `hlx inspect netsuite --env sandbox --query "SELECT id FROM item"`
- Expected Outcome: The server returns HTTP 400 with a message indicating the sandbox credential is unavailable; no silent fallback to production occurs

[SCN-10] Rate limiting applied to NetSuite operations
- Precondition: Agent is running in any step; org has NsGmCredential configured
- Action: Agent sends more than 60 inspection requests within 60 seconds
- Expected Outcome: Requests beyond the 60-request limit are rejected with a rate-limit error; earlier requests completed normally

[SCN-11] Sandbox operates without NetSuite credentials
- Precondition: A new workflow run starts for an org with NsGmCredential configured
- Action: The orchestrator provisions the sandbox for any step
- Expected Outcome: No ns-gm CLI is installed in the sandbox, no PEM file is written to `/tmp`, and no ns-gm setup commands run; the sandbox is credential-free for NetSuite

[SCN-12] SDF operations still work from sandbox
- Precondition: Agent is running in an implementation step; org has SDF credentials configured
- Action: Agent runs an SDF command (e.g., `object:list` or `project:deploy`) that requires `{acct}.app.netsuite.com`
- Expected Outcome: The SDF operation succeeds because `{acct}.app.netsuite.com` remains in the sandbox runtime egress allowlist

[SCN-13] All operations are audited with distinct types
- Precondition: Agent runs both `hlx inspect netsuite` and `hlx run` commands during a workflow
- Action: Platform operator reviews the inspection audit log after the workflow completes
- Expected Outcome: SuiteQL/log queries appear with type `NETSUITE` and SuiteScript executions appear with type `SUITESCRIPT`, clearly distinguished from existing `DATABASE`/`LOGS`/`API` audit entries

## Key Design Principles

- **Safe by construction**: `hlx inspect netsuite` enforces read-only semantics at the server level — the safety guarantee is account-independent.
- **Credential-free sandbox**: No NetSuite credentials enter the sandbox. The server is the sole trust anchor.
- **Role is the ceiling**: For `hlx run`, the account's NetSuite integration-user role is the authoritative capability bound.
- **Extend, don't reinvent**: The existing CLI dispatch pattern (switch + `hxFetch` + `resolveRepo` + `getFlag`) and inspection proxy pattern (token auth, rate limiting, sanitization, audit) are reused. Zero new infrastructure.
- **Explicit failure**: No silent cross-environment fallback. Missing credentials result in a clear error.

## Scope & Constraints

- **CLI changes**: ~4 files. 2 new handlers (`src/inspect/netsuite.ts` at 60 lines, `src/run/index.ts` at 53 lines), 2 modified routers (`src/inspect/index.ts`, `src/index.ts`).
- **Pattern adherence**: All new CLI handlers follow the established `resolveRepo -> hxFetch POST -> console.log JSON` pattern from `db.ts`.
- **Auth model**: Uses `HELIX_INSPECT_TOKEN` env var (BLD-685's rotating inspection key). No new auth mechanism.
- **HTTP client**: Uses existing `hxFetch` with default basePath `/api/inspect`. No basePath override needed.
- **No tests**: No existing inspect handler tests (db.ts, logs.ts have none either), so absence is consistent with codebase convention.
- **Zero runtime deps**: TypeScript-only with tsc build. No npm dependencies.

## Future Considerations

- **Interactive REPL mode**: A future `hlx run --interactive` mode for iterative SuiteScript development.
- **Output formatting**: Pretty-print or table formatting options for query results.
- **Saved search commands**: If saved search authoring via server-side is needed, additional CLI subcommands would be added.

## Open Questions / Risks

| # | Question / Risk | Status |
|---|----------------|--------|
| 1 | **Sanitizer vs RESTlet response shapes**: Server-side `sanitizeInspectionResult` is applied to NetSuite RESTlet responses but format compatibility is unverified at runtime. | Open — verify at integration test time |
| 2 | **Environment fallback when manifest lacks nsDefaultEnv**: If `nsDefaultEnv` is not set in the inspection manifest and no `--env` flag is passed, the CLI defaults to 'sandbox' (manifest reading defaults to undefined, passed as env=undefined, server resolveEnvironment falls back to SANDBOX). Edge cases should be verified. | Open — verify end-to-end default flow |
| 3 | **Atomic deployment risk**: If helix-global-server deploys before helix-cli (or vice versa), agents may temporarily lose NetSuite access. | Risk — mitigate via coordinated release |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (BLD-693 description + RSH-636 Research Report) | Primary specification with overrides, acceptance criteria, and CLI scope | ~4 CLI files, thin interface pattern, --env as plain parameter, zero new dependencies |
| scout/scout-summary.md (helix-cli) | CLI code analysis | 2 new handlers (60+53 lines), 2 router mods, hxFetch/resolveRepo patterns, manifest nsDefaultEnv reading |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI implementation confirmation | Thin interface verified; follows db.ts pattern; no test files (consistent with codebase) |
| scout/scout-summary.md (helix-global-server) | Server-side context for full flow understanding | 303-line proxy service, endpoint paths, governance pipeline |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server implementation completeness | All 6 acceptance criteria verified; client isolation confirmed |
| repo-guidance.json | Repo intent classification | helix-cli=target (secondary), helix-global-server=target (primary), helix-global-client=context |
