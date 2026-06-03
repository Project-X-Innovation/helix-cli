# Product Specification — ns-gm Server-Side Migration (helix-cli)

## Problem Statement

Workflow agents running in ephemeral sandboxes currently access production NetSuite data through the ns-gm CLI, which runs entirely inside the sandbox. Production OAuth2 credentials — PEM private keys, accountId, clientId, certificateId — are injected directly into the sandbox at `/tmp/nsgm-{runId}.pem` and used for direct NetSuite API calls. This bypasses all server-side controls: write-blocking validation, rate limiting, result sanitization, secret redaction, and audit logging.

Meanwhile, all other data access (database, logs, API) already flows through a governed server-side inspection proxy with those exact controls, accessed via `hlx inspect db/logs/api`. The ns-gm path is the only uncontrolled data access channel in the architecture.

With ns-gm moving server-side (helix-global-server), agents need CLI commands to access the new server surfaces. Currently, helix-cli has no NetSuite-related commands.

## Product Vision

Provide two new CLI commands that give agents access to the server-side NetSuite proxy, matching the two-surface governance model:

- **`hlx inspect netsuite`** — Read-only data access (SuiteQL queries + NetSuite script logs). Folds into the existing governed inspect surface alongside `hlx inspect db/logs/api`. Read-only safety is enforced server-side.
- **`hlx run`** — Arbitrary SuiteScript execution. New top-level command for operations whose ceiling is delegated to the account's NetSuite role.

Both commands inherit the CLI's existing HTTP client, authentication, retry logic, and error handling. Zero new dependencies.

## Users

| User | Context |
|------|---------|
| Workflow agents (scout, diagnosis) | Query production NetSuite data and retrieve script logs to investigate tickets |
| Workflow agents (implementation, verification) | Query sandbox NetSuite data and execute SuiteScript to validate changes |
| ns-gm skill | Orchestrates NetSuite queries and SuiteScript execution; calls these CLI commands instead of the removed ns-gm CLI |
| Human developers (future) | May use these commands via `~/.hlx/config.json` auth for ad-hoc NetSuite inspection |

## Use Cases

1. **SuiteQL data inspection** — An agent uses `hlx inspect netsuite` to query NetSuite records. The CLI sends the query to the server proxy and prints sanitized JSON results.

2. **Script log retrieval** — An agent uses `hlx inspect netsuite` with log parameters to retrieve NetSuite script execution logs for debugging.

3. **SuiteScript execution** — An agent uses `hlx run` to execute arbitrary SuiteScript code (or code from a file). The CLI sends the code to the server proxy and prints sanitized JSON results.

4. **Query from file** — An agent saves a complex SuiteQL query to a file and uses `--query-file` to avoid shell quoting issues, following the pattern already established by `hlx inspect db`.

## Core Workflow

1. Agent (or ns-gm skill) invokes `hlx inspect netsuite` or `hlx run` with appropriate flags.
2. CLI loads config: sandbox agents use `HELIX_INSPECT_TOKEN` env var; human users use `~/.hlx/config.json`.
3. CLI resolves the repo name to a repository ID via `resolveRepo()`.
4. CLI sends an authenticated HTTP request to the server via `hxFetch` (dual-mode auth: `hxi_` token -> X-API-Key header, Bearer token -> Authorization header).
5. Server executes the query/script, applies governance, and returns sanitized JSON.
6. CLI prints the JSON result to stdout.

## Essential Features (MVP)

1. **`hlx inspect netsuite` subcommand**: New case in inspect router + new handler file following the `db.ts` pattern. Supports inline query and `--query-file` flag.
2. **`hlx inspect netsuite` log retrieval**: Same subcommand with parameters for log retrieval (scriptId, date range, log type, pagination).
3. **`hlx run` top-level command**: New case in main dispatcher + new `src/run/` module. Supports inline code and `--script-file` flag.
4. **Help text**: Updated help output for `hlx inspect --help` and `hlx run --help` with usage examples.
5. **No auth changes**: Both commands use existing auth paths. Environment routing is token-bounded (nsEnv claim set server-side). No `--env` flag.

## Features Explicitly Out of Scope (MVP)

- **`--env` flag for environment selection** — Environment is token-bounded for workflow agents. A human-facing env flag is a future consideration.
- **Interactive mode or REPL** — Both commands are single-shot: send request, print result.
- **Client-side query validation** — Read-only enforcement is server-side. The CLI does not validate queries.
- **New runtime dependencies** — Both commands use pure TypeScript with existing libraries only.
- **Changes to existing `hlx inspect db/logs/api` commands** — These remain untouched.
- **Server-side implementation** — The server surfaces are built in helix-global-server (separate repo scope).

## Success Criteria

| # | Criterion |
|---|-----------|
| SC-1 | `hlx inspect netsuite --repo <name> "<suiteql>"` executes a SuiteQL query through the server proxy and prints JSON results |
| SC-2 | `hlx inspect netsuite --repo <name> --query-file <path>` reads query from file and executes it |
| SC-3 | `hlx inspect netsuite` supports script log retrieval with appropriate filter flags |
| SC-4 | `hlx run --repo <name> "<code>"` or `hlx run --repo <name> --script-file <path>` executes SuiteScript through the server proxy and prints JSON results |
| SC-5 | Both commands inherit existing auth, retry (3 attempts + backoff), and error handling from hxFetch |
| SC-6 | `hlx inspect --help` and `hlx run --help` display accurate usage information |
| SC-7 | No changes to existing `hlx inspect db/logs/api` commands |
| SC-8 | Zero new runtime dependencies |

## User Scenarios

[SCN-01] Query NetSuite production data via SuiteQL during scout step
- Precondition: Organization has PRODUCTION NsGmCredential configured; workflow is on scout step; inspection token issued with nsEnv=PRODUCTION
- Action: Agent runs `hlx inspect netsuite --repo <name> "SELECT id, companyname FROM customer WHERE isinactive = 'F' LIMIT 10"`
- Expected Outcome: JSON result with up to 10 customer rows returned; sensitive values redacted; query audited in server logs

[SCN-02] Retrieve NetSuite script execution logs
- Precondition: Organization has NsGmCredential configured; agent has valid inspection token
- Action: Agent runs `hlx inspect netsuite` with log retrieval parameters (scriptId, date range, log type)
- Expected Outcome: Script execution log entries returned as JSON; results sanitized and capped; request audited

[SCN-03] Execute SuiteScript in sandbox during implementation step
- Precondition: Organization has SANDBOX NsGmCredential configured; workflow is on implementation step; inspection token issued with nsEnv=SANDBOX
- Action: Agent runs `hlx run --repo <name> "record.load({ type: 'inventoryitem', id: 123 }).getValue('itemid')"`
- Expected Outcome: SuiteScript executes against sandbox NetSuite account; result returned as JSON; output sanitized; execution audited

[SCN-04] Read-only enforcement blocks write attempts via inspect
- Precondition: Agent has valid inspection token; agent attempts a DML query
- Action: Agent runs `hlx inspect netsuite --repo <name> "UPDATE customer SET companyname = 'test' WHERE id = 1"`
- Expected Outcome: Server rejects the query; agent receives a clear error indicating write operations are not allowed via inspect

[SCN-05] Explicit failure when target environment credential is missing
- Precondition: Organization has PRODUCTION NsGmCredential configured but not SANDBOX
- Action: Orchestrator attempts to issue inspection token with nsEnv=SANDBOX for implementation step
- Expected Outcome: Token issuance fails with an explicit error (not a silent fallback to production); workflow step receives a clear credential-unavailable error

[SCN-06] SuiteQL query from file avoids shell quoting issues
- Precondition: Agent has a complex SuiteQL query saved in a file
- Action: Agent runs `hlx inspect netsuite --repo <name> --query-file ./query.sql`
- Expected Outcome: Query is read from the file, executed, and results returned identically to inline query

[SCN-07] SuiteScript execution from file
- Precondition: Agent has SuiteScript code saved in a file
- Action: Agent runs `hlx run --repo <name> --script-file ./script.js`
- Expected Outcome: Code is read from the file, executed, and results returned identically to inline code

[SCN-08] Help text displays correct usage
- Precondition: CLI is installed
- Action: User runs `hlx inspect --help` or `hlx run --help`
- Expected Outcome: Help output includes netsuite subcommand in inspect listing and run command usage with examples

[SCN-09] Existing database/logs/API inspection unaffected
- Precondition: Agent has valid inspection token; existing db/logs/api inspection credentials configured
- Action: Agent runs `hlx inspect db --repo <name> "SELECT 1"` (or logs/api equivalent)
- Expected Outcome: Results identical to behavior before the ns-gm migration; no regressions

[SCN-10] Production credentials removed from sandbox
- Precondition: Server surfaces are deployed and operational
- Action: A new workflow run starts on the NETSUITE platform
- Expected Outcome: No PEM file is written to `/tmp/nsgm-*.pem`; no ns-gm CLI is installed; agent accesses NetSuite exclusively through `hlx inspect netsuite` and `hlx run`

## Key Design Principles

1. **Follow established patterns**: Both commands follow the existing handler template (resolve repo -> hxFetch -> print JSON). No architectural innovation needed in the CLI.
2. **Token-bounded environment**: The `nsEnv` claim on the inspection token is the single source of truth for prod-vs-sandbox. The CLI does not select environment.
3. **Governance is server-side**: The CLI is a thin client. Read-only enforcement, rate limiting, sanitization, and audit all happen on the server. The CLI trusts the server's response.
4. **Zero new dependencies**: Both commands use pure TypeScript with existing `hxFetch`, config loading, flag parsing, and repo resolution.

## Scope & Constraints

- **This repo provides the CLI surface only.** Server-side endpoints, governance logic, and token enhancement are in helix-global-server.
- **Atomicity**: The CLI commands must be deployable at the same time as the server surfaces. If the CLI ships before the server, the commands fail. If the server ships before the CLI, agents have no way to call the surfaces.
- **basePath**: `hlx inspect netsuite` likely uses the default `/api/inspect` basePath. `hlx run` may need a basePath override depending on server route structure.
- **hxFetch timeout**: The default 30s timeout in hxFetch may need adjustment for long-running SuiteScript executions, but this is a future optimization.

## Future Considerations

- **`--env` flag**: For human CLI users, an optional `--env prod|sandbox` flag could allow environment selection within token authorization bounds.
- **`--modules` flag**: A `--modules query,record` flag for `hlx run` to specify which NetSuite modules to inject into the SuiteScript execution context.
- **`--timeout` flag**: Custom timeout for long-running SuiteScript.
- **`--params` flag**: JSON input parameters for parameterized SuiteScript execution.
- **Tab completion**: Shell completion for subcommands and flags.

## Open Questions / Risks

| # | Question / Risk |
|---|----------------|
| OQ-1 | **basePath for `hlx run`**: Should `hlx run` use `/api/inspect` (default) or `/api/run` (override)? Depends on server route structure (OQ-1 in helix-global-server). |
| OQ-2 | **Inspect netsuite sub-modes**: Should SuiteQL queries and script log retrieval be distinguished by flags (e.g., `--type query\|logs`) or by separate subcommands? |
| OQ-3 | **`hlx run` parameter design**: Minimum viable flag set for SuiteScript execution — code/script-file + repo. What about `--modules`, `--params`, `--timeout`? |
| OQ-4 | **Atomicity with server**: How is synchronized deployment of CLI + server changes coordinated? Both repos must deploy together. |
| OQ-5 | **hxFetch timeout**: Default 30s may be insufficient for complex SuiteScript. Configurable per-command timeout? |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-633) | Primary specification for the migration | Two changes achieve 90% security value: server-side ns-gm + domain allowlist; migration DECIDED |
| ticket.md (Continuation Context) | Refined two-surface governance model and trust framing | inspect = safe by construction; run = role-bounded + audited; nsEnv token claim; both surfaces in one effort |
| scout/scout-summary.md (helix-cli) | CLI structure analysis | Handler pattern is 10-14 lines; hxFetch supports basePath override; zero runtime deps; no existing run command |
| scout/scout-summary.md (helix-global-server) | Server infrastructure context | OAuth2 M2M proven; inspection proxy mature; credential model is per-org not per-repo |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI change mapping with 3 change areas | Two new commands following established patterns; no auth/config changes needed |
| diagnosis/diagnosis-statement.md (helix-global-server) | Server change context | 7 server-side changes; understanding required for CLI to align with server endpoints |
| diagnosis/apl.json (helix-cli) | CLI evidence for 4 diagnostic questions | Command dispatch, inspect router, HTTP client basePath, and env flag design verified |
| diagnosis/apl.json (helix-global-server) | Server evidence for 9 diagnostic questions | RESTlet protocol, token claims, credential model verified |
| repo-guidance.json (library run root) | Shared repo intent metadata | helix-cli=target; zero new dependencies confirmed |
| scout/reference-map.json (helix-cli) | CLI file inventory | 12 files mapped; src/run/ directory does not exist yet; no 'run' case in dispatcher |
