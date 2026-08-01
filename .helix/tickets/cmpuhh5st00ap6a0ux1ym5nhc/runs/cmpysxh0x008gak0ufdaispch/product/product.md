# Product: ns-gm Decomposition to Server-Side Surfaces (helix-cli)

## Problem Statement

Workflow agents in ephemeral Vercel Sandboxes access production NetSuite data through the ns-gm CLI installed directly inside the sandbox. Production OAuth2 credentials (PEM private key, accountId, clientId, certificateId) are injected at `/tmp/nsgm-{runId}.pem`, giving agents uncontrolled, unmediated production access with no write-blocking, no rate limiting, no result sanitization, and no audit logging.

With ns-gm moving server-side (helix-global-server), agents need CLI commands to access the new server surfaces. Currently, helix-cli has no NetSuite-related commands. All other data access (database, logs, API) already flows through `hlx inspect db/logs/api` -- the CLI needs two new surfaces to replace the ns-gm CLI entirely.

## Product Vision

Provide two new CLI commands that give agents access to the server-side NetSuite proxy, matching the two-surface governance model defined by the ns-gm decomposition:

- **`hlx inspect netsuite`** -- Read-only data access (SuiteQL queries + NetSuite script logs). Folds into the existing governed inspect surface alongside `hlx inspect db/logs/api`. Read-only safety is enforced server-side.
- **`hlx run`** -- Arbitrary SuiteScript execution. New top-level command whose operation ceiling is delegated to the account's NetSuite role.

Both commands inherit the CLI's existing HTTP client, authentication, retry logic, and error handling. Zero new dependencies.

## Users

| User | Context |
|------|---------|
| Workflow agents (scout, diagnosis) | Query production NetSuite data and retrieve script logs to investigate tickets |
| Workflow agents (implementation, verification) | Query sandbox NetSuite data and execute SuiteScript to validate changes |
| ns-gm skill | Orchestrates NetSuite queries and SuiteScript execution; calls these CLI commands instead of the removed ns-gm CLI |
| Human developers (future) | May use these commands via `~/.hlx/config.json` auth for ad-hoc NetSuite inspection |

## Use Cases

1. **SuiteQL data inspection** -- Agent uses `hlx inspect netsuite` to query NetSuite records. CLI sends the query to the server proxy and prints sanitized JSON results.
2. **Script log retrieval** -- Agent uses `hlx inspect netsuite` with log parameters to retrieve NetSuite script execution logs for debugging.
3. **SuiteScript execution** -- Agent uses `hlx run` to execute arbitrary SuiteScript code (inline or from a file). CLI sends the code to the server proxy and prints sanitized JSON results.
4. **Query from file** -- Agent saves a complex SuiteQL query to a file and uses `--query-file` to avoid shell quoting issues, following the pattern already established by `hlx inspect db`.

## Core Workflow

1. Agent (or ns-gm skill) invokes `hlx inspect netsuite` or `hlx run` with appropriate flags.
2. CLI loads config: sandbox agents use `HELIX_INSPECT_TOKEN` env var (contains nsEnv claim); human users use `~/.hlx/config.json`.
3. CLI resolves the repo name to a repository ID via `resolveRepo()`.
4. CLI sends an authenticated HTTP request to the server via `hxFetch` (dual-mode auth: `hxi_` token -> X-API-Key header, else -> Authorization: Bearer header).
5. Server executes the query/script, applies governance, and returns sanitized JSON.
6. CLI prints the JSON result to stdout.

## Essential Features (MVP)

### `hlx inspect netsuite` Subcommand

- New case in the inspect router, following the established `db.ts` handler pattern.
- **Inline query**: `hlx inspect netsuite --repo <name> "SELECT ..."`.
- **Query from file**: `hlx inspect netsuite --repo <name> --query-file ./query.sql` (reuses existing `--query-file` pattern).
- **Script log retrieval**: `hlx inspect netsuite --repo <name> --logs` with filter flags (`--scriptId`, `--dateFrom`, `--dateTo`, `--logType`).
- Updated help text in `inspectUsage()`.

### `hlx run` Top-Level Command

- New case in main dispatcher + new `src/run/` module.
- **Inline code**: `hlx run --repo <name> "code here"`.
- **Code from file**: `hlx run --repo <name> --script-file ./script.js`.
- **Module specification**: `hlx run --repo <name> --modules N/record,N/search "code"` (optional; specifies which NetSuite modules to inject).
- Updated help text in `usage()`.
- May need `basePath` override in `hxFetch` if the server route path differs from `/api/inspect`.

### No Auth or Config Changes

- Both commands use existing auth: `HELIX_INSPECT_TOKEN` env var for sandbox agents, `~/.hlx/config.json` for human users.
- Dual-mode auth in `hxFetch` handles both token types.
- No `--env` flag needed -- environment is token-bounded (nsEnv claim baked into the token by the orchestrator).
- 3-attempt retry with exponential backoff applies automatically.

## Features Explicitly Out of Scope (MVP)

- **`--env` flag for environment selection** -- Environment is token-bounded for workflow agents. A human-facing env flag is a future consideration.
- **Interactive mode or REPL** -- Both commands are single-shot: send request, print result.
- **Client-side query validation** -- Read-only enforcement is server-side. The CLI does not validate queries.
- **New runtime dependencies** -- Both commands use existing libraries only.
- **Changes to existing `hlx inspect db/logs/api` commands** -- These remain untouched.
- **Server-side implementation** -- Server surfaces are built in helix-global-server.

## Success Criteria

| # | Criterion |
|---|-----------|
| SC-1 | `hlx inspect netsuite --repo <name> "<suiteql>"` executes a SuiteQL query through the server proxy and prints JSON results |
| SC-2 | `hlx inspect netsuite --repo <name> --query-file <path>` reads query from file and executes it |
| SC-3 | `hlx inspect netsuite` supports script log retrieval with filter flags |
| SC-4 | `hlx run --repo <name> "<code>"` or `hlx run --repo <name> --script-file <path>` executes SuiteScript through the server proxy and prints JSON results |
| SC-5 | `hlx run --modules <list>` passes module specification to the server |
| SC-6 | Both commands inherit existing auth, retry (3 attempts + backoff), and error handling from hxFetch |
| SC-7 | `hlx inspect --help` and `hlx run --help` display accurate usage information |
| SC-8 | No changes to existing `hlx inspect db/logs/api` commands |
| SC-9 | Zero new runtime dependencies |

## User Scenarios

[SCN-01] Query NetSuite production data via SuiteQL during scout step
- Precondition: Organization has PRODUCTION NsGmCredential configured; workflow is on scout step; inspection token issued with nsEnv=PRODUCTION
- Action: Agent runs `hlx inspect netsuite --repo <name> "SELECT id, companyname FROM customer WHERE isinactive = 'F' LIMIT 10"`
- Expected Outcome: JSON result with matching customer rows returned; sensitive values redacted; response capped at 200 rows; query audited in server logs

[SCN-02] Retrieve NetSuite script execution logs
- Precondition: Organization has NsGmCredential configured; agent has valid inspection token
- Action: Agent runs `hlx inspect netsuite --repo <name> --logs --scriptId 456 --dateFrom 2026-06-01 --logType ERROR`
- Expected Outcome: Script execution log entries matching filters returned as JSON; results sanitized and capped; request audited

[SCN-03] Execute SuiteScript in sandbox during implementation step
- Precondition: Organization has SANDBOX NsGmCredential configured; workflow is on implementation step; inspection token issued with nsEnv=SANDBOX
- Action: Agent runs `hlx run --repo <name> --script-file ./migration.js --modules N/record,N/search`
- Expected Outcome: SuiteScript executes against sandbox NetSuite; result returned as JSON; output sanitized; execution audited

[SCN-04] Write attempt via SuiteQL is blocked by server
- Precondition: Agent has valid inspection token
- Action: Agent runs `hlx inspect netsuite --repo <name> "UPDATE customer SET companyname = 'test' WHERE id = 1"`
- Expected Outcome: CLI receives and displays error from server indicating write operations are not allowed via inspect

[SCN-05] Explicit failure when target environment credential is missing
- Precondition: Organization has PRODUCTION NsGmCredential but not SANDBOX; agent has token with nsEnv=SANDBOX
- Action: Agent runs `hlx inspect netsuite --repo <name> "SELECT 1"`
- Expected Outcome: CLI receives and displays explicit error from server indicating SANDBOX credential is unavailable. No silent fallback.

[SCN-06] SuiteQL query from file avoids shell quoting issues
- Precondition: Agent has a complex SuiteQL query saved in a file
- Action: Agent runs `hlx inspect netsuite --repo <name> --query-file ./query.sql`
- Expected Outcome: Query read from file, executed, and results returned identically to inline query

[SCN-07] SuiteScript execution from file with modules
- Precondition: Agent has SuiteScript code saved in a file needing N/record and N/search modules
- Action: Agent runs `hlx run --repo <name> --script-file ./script.js --modules N/record,N/search`
- Expected Outcome: Code read from file, modules passed to server, execution succeeds, results returned as JSON

[SCN-08] Inline SuiteScript execution
- Precondition: Agent needs to run a simple one-line SuiteScript
- Action: Agent runs `hlx run --repo <name> "query.runSuiteQL({query:'SELECT 1'}).asMappedResults()" --modules N/query`
- Expected Outcome: Script executes and result returned as JSON

[SCN-09] Help text displays correct usage
- Precondition: CLI is installed
- Action: User runs `hlx inspect --help` and `hlx run --help`
- Expected Outcome: Help output includes netsuite subcommand in inspect listing with usage examples; run command help shows code, --script-file, --modules, --repo flags

[SCN-10] Existing database/logs/API inspection unaffected
- Precondition: Agent has valid inspection token; existing db/logs/api credentials configured
- Action: Agent runs `hlx inspect db --repo <name> "SELECT 1"` and `hlx inspect logs --repo <name>`
- Expected Outcome: Results identical to behavior before the migration; no regressions

[SCN-11] Production credentials absent from sandbox
- Precondition: Server surfaces are deployed; workflow run starts on NETSUITE platform
- Action: Agent inspects sandbox filesystem and environment variables
- Expected Outcome: No PEM file at `/tmp/nsgm-*.pem`; no ns-gm CLI installed; no NetSuite credential env vars; agent uses only `hlx inspect netsuite` and `hlx run`

[SCN-12] Rate limit error displayed clearly
- Precondition: Agent has exceeded the 60 req/60s rate limit
- Action: Agent runs `hlx inspect netsuite --repo <name> "SELECT 1"`
- Expected Outcome: CLI receives rate-limit error from server and displays it clearly to the agent

## Key Design Principles

1. **Follow established patterns**: Both commands follow the existing handler template (resolveRepo -> hxFetch -> print JSON). No architectural innovation in the CLI.
2. **Token-bounded environment**: The `nsEnv` claim on the inspection token is the single source of truth for prod-vs-sandbox. The CLI does not select or override environment.
3. **Governance is server-side**: The CLI is a thin client. Read-only enforcement, rate limiting, sanitization, and audit all happen on the server. The CLI trusts the server's response and displays errors faithfully.
4. **Zero new dependencies**: Both commands use pure TypeScript with existing `hxFetch`, config loading, flag parsing, and repo resolution.

## Scope & Constraints

- **This repo provides the CLI surface only.** Server-side endpoints, governance logic, and token enhancement are in helix-global-server.
- **Atomicity**: CLI commands must be deployable at the same time as server surfaces. If CLI ships before the server, the commands fail. If the server ships before the CLI, agents have no way to call the surfaces.
- **basePath**: `hlx inspect netsuite` uses the default `/api/inspect` basePath. `hlx run` may need a basePath override depending on server route structure.
- **hxFetch timeout**: The default 30s timeout may be insufficient for long-running SuiteScript via `hlx run`, but this is a future optimization.

## Future Considerations

- **`--env` flag**: For human CLI users, optional `--env prod|sandbox` within token authorization bounds.
- **`--timeout` flag**: Custom timeout for long-running SuiteScript via `hlx run`.
- **`--params` flag**: JSON input parameters for parameterized SuiteScript execution.
- **Tab completion**: Shell completion for subcommands and flags.

## Open Questions / Risks

| # | Question / Risk | Status |
|---|-----------------|--------|
| OQ-1 | basePath for `hlx run`: should it use `/api/inspect` (default) or `/api/run` (override)? Depends on server route structure. | Open -- blocked on server OQ-1 |
| OQ-2 | Inspect netsuite sub-modes: SuiteQL queries and log retrieval distinguished by flags (e.g., `--logs`) or by body parameter? | Open -- implementation decision |
| OQ-3 | `hlx run` timeout: default 30s may be insufficient for complex SuiteScript. Configurable per-command timeout needed? | Open -- future optimization |
| OQ-4 | Atomicity with server: how is synchronized deployment of CLI + server changes coordinated? Both repos must deploy together. | Risk -- mitigated by platform config flag |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-633) | Primary specification | ns-gm migration DECIDED; two changes achieve 90% security value |
| Continuation context (user guidance) | Refined scope and governance model | DECOMPOSITION framing; two surfaces; inspect=safe by construction, run=role-bounded+audited; nsEnv token-bounded; both surfaces in one effort |
| scout/scout-summary.md (helix-cli) | CLI structure analysis | Manual switch-case dispatch; hxFetch with basePath override; 12-line handler template; zero deps; no existing run command |
| scout/scout-summary.md (helix-global-server) | Server context for CLI alignment | OAuth2 M2M; inspection proxy patterns; credential model per-org |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change mapping | Two new commands; --modules optional; no auth/config changes; zero new deps |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server context | 8 change areas; route/endpoint structure affects CLI basePath |
| diagnosis/apl.json (helix-cli) | Evidence for 4 diagnostic questions | Dispatch patterns, auth chain reuse, env is token-bounded not CLI-flagged |
| diagnosis/apl.json (helix-global-server) | Server evidence for CLI alignment | RESTlet protocol, token claims, credential model |
| repo-guidance.json | Shared repo intent | helix-cli=target; zero dependencies confirmed |
