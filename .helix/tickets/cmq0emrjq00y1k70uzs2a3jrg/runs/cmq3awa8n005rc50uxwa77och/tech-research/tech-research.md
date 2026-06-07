# Tech Research — BLD-693: ns-gm Server-Side Decomposition (helix-cli)

## Technology Foundation

- **Runtime**: Node.js with TypeScript (ES2022, Node16 module resolution)
- **CLI pattern**: Switch-based command dispatcher in `src/index.ts` (13 top-level commands) with sub-routers (e.g., `src/inspect/index.ts` with 4 subcommands)
- **HTTP client**: `hxFetch` in `src/lib/http.ts` — default basePath `/api/inspect`, retry (3 attempts), Bearer token or X-API-Key auth
- **Flag parsing**: `src/lib/flags.ts` — `getFlag`, `hasFlag`, `getPositionalArgs`, `isHelpRequested`, `requireFlag`
- **Repo resolution**: `src/lib/resolve-repo.ts` — match by exact ID, name (case-insensitive), or partial name
- **Auth**: `HELIX_INSPECT_TOKEN` env var -> Bearer token header (sourced from `/tmp/helix-inspect/env.sh`)
- **Build**: `tsc`. Test: `tsc && node --test dist/**/*.test.js`. Typecheck: `tsc --noEmit`

## Architecture Decision

### AD-1: Two new subcommands following existing patterns

**Options considered:**
1. **Extend existing inspect handler** with inline netsuite logic — Put netsuite handling directly in `src/inspect/index.ts`.
2. **New handler files** following the `db.ts` / `logs.ts` pattern — Separate handler modules with switch cases in routers.

**Chosen: Option 2 — Separate handler files**

**Rationale:** The existing codebase cleanly separates each inspect subcommand into its own file (`db.ts`, `logs.ts`, `api.ts`, `repos.ts`). Each is ~12-14 lines following the pattern: `resolveRepo -> hxFetch POST -> console.log JSON`. Creating `src/inspect/netsuite.ts` and `src/run/index.ts` as separate files maintains this consistent separation and makes the codebase easy to navigate.

### AD-2: `hlx run` as a top-level command

**Options considered:**
1. **Under inspect** (`hlx inspect run`) — Keeps all server-proxied commands under one prefix.
2. **Top-level** (`hlx run`) — Distinct from inspect, reflecting the different governance model.

**Chosen: Option 2 — Top-level `hlx run`**

**Rationale:** Per RSH-636, `hlx run` is not read-only and has a fundamentally different governance model from `hlx inspect netsuite`. Making it top-level avoids confusion with the "inspect" (read-only) prefix. On the server side, both routes live under `/api/inspect/` for auth simplicity, but the CLI user-facing command structure should reflect the semantic difference. The `src/run/index.ts` handler is added as a new directory with its own module.

### AD-3: `--env` flag as body parameter

**Options considered:**
1. **Query parameter** on the URL.
2. **Body parameter** in the POST request body.

**Chosen: Option 2 — Body parameter**

**Rationale:** `hxFetch` sends body as `Record<string, unknown>` for POST requests (http.ts:37-41). The `--env` flag is parsed via `getFlag(args, '--env')` and included in the body alongside the query/code payload. This matches how `--limit` is passed in the logs handler. When `--env` is not provided, the key is omitted from the body, and the server applies the manifest-provided default.

### AD-4: Manifest-based default environment

**Decision:** The CLI reads `nsDefaultEnv` from `/tmp/helix-inspect/manifest.json` (written by `configureInspectionForStep` on the server). When the user does not provide `--env`, the CLI sends the manifest's `nsDefaultEnv` value in the body. This avoids the server handler needing to derive step context.

**Implementation approach:** The netsuite.ts and run/index.ts handlers read the manifest to get the default env. If the manifest doesn't have `nsDefaultEnv` (backward compat), the CLI omits `env` from the body and the server falls back to SANDBOX.

## Core API/Methods

### src/inspect/netsuite.ts (NEW)

```
cmdNetsuite(config, repoNameOrId, args) {
  resolveRepo -> determine type (query vs logs) from args ->
  hxFetch POST /{repoId}/netsuite with { type, query/scriptId, env? } ->
  console.log JSON
}
```

- Supports `hlx inspect netsuite --repo <name> --query <suiteql>` for SuiteQL
- Supports `hlx inspect netsuite --repo <name> logs [--script-id <id>]` for script logs
- Supports `--env prod|sandbox` for environment override
- Query can be positional or via `--query` flag

### src/run/index.ts (NEW)

```
cmdRun(config, repoNameOrId, args) {
  resolveRepo -> parse code from positional or --code flag ->
  hxFetch POST /{repoId}/run with { code, modules?, env? } ->
  console.log JSON
}
```

- Supports `hlx run --repo <name> <code>` for positional code
- Supports `hlx run --repo <name> --code <code>` for flag-based code
- Supports `--env prod|sandbox` for environment override
- Supports `--modules <module1,module2>` for required SuiteScript modules

### src/inspect/index.ts (MOD)

- Add `case "netsuite"` to switch statement (after existing `api` case around line 120)
- Parse `--env` flag
- Update help/usage text to include netsuite subcommand

### src/index.ts (MOD)

- Add `case "run"` to main dispatcher switch (after existing commands around line 136)
- Import `cmdRun` from `src/run/index.ts`
- Update usage text to include `hlx run` command

## Technical Decisions (including rejected alternatives)

### TD-1: Code input for `hlx run`

**Decision:** Accept code from positional argument (first non-flag arg after `--repo`) or `--code` flag. Positional is the primary mode for short scripts. The `--code` flag exists for scripts that start with dashes or need explicit quoting.

### TD-2: No tests for new handlers

**Decision:** No existing inspect handler tests exist in the CLI codebase (no `.test.ts` files in `src/inspect/`). The new handlers follow the same pattern and have the same test coverage (none). Adding CLI-level tests is deferred — the server-side handlers are the critical test boundary.

### TD-3: hxFetch basePath compatibility

**Decision:** Both `hlx inspect netsuite` and `hlx run` use the default `/api/inspect` basePath. The server routes are `POST /api/inspect/:repoId/netsuite` and `POST /api/inspect/:repoId/run`. hxFetch constructs the full URL as `${baseUrl}/api/inspect/${repoId}/netsuite` and `${baseUrl}/api/inspect/${repoId}/run`. No basePath override is needed.

## Technical Checks

[TCK-01] CLI routes to correct server endpoints
- Decision Reference: "Both under /api/inspect/ with hxFetch default basePath"
  (from AD-3, TD-3)
- Verification Method: code-inspection
- Expected Evidence: `src/inspect/netsuite.ts` calls `hxFetch(config, '/${repoId}/netsuite', ...)`. `src/run/index.ts` calls `hxFetch(config, '/${repoId}/run', ...)`. Both use POST method.

[TCK-02] --env flag included in request body
- Decision Reference: "--env parsed via getFlag and included in the request body"
  (from AD-3)
- Verification Method: code-inspection
- Expected Evidence: Both handlers call `getFlag(args, '--env')` and include the result in the body object when present. When absent, `env` key is omitted from the body.

[TCK-03] Switch cases added to routers
- Decision Reference: "Add case 'netsuite' to inspect router and case 'run' to main dispatcher"
  (from AD-1, AD-2)
- Verification Method: code-inspection
- Expected Evidence: `src/inspect/index.ts` switch includes `case "netsuite"` dispatching to `cmdNetsuite`. `src/index.ts` switch includes `case "run"` dispatching to `cmdRun`.

## Cross-Platform Considerations

Not applicable. The CLI runs inside Vercel Sandboxes (Linux/Node.js). No cross-platform concerns.

## Performance Expectations

- CLI latency is dominated by server-side processing (OAuth2 token exchange, RESTlet call). CLI overhead is negligible (<10ms for flag parsing, repo resolution, HTTP dispatch).
- hxFetch retry logic (3 attempts) handles transient network errors.

## Dependencies

### Existing (no new dependencies)
- Node.js built-in modules only (no npm additions)
- `hxFetch` for HTTP client with auth and retry
- `getFlag`/`hasFlag`/`getPositionalArgs` for flag parsing
- `resolveRepo` for repository name/ID resolution

### Zero new npm dependencies

## Deferred to Round 2

- CLI tests for inspect netsuite and run handlers
- Richer error messaging (structured error display vs raw JSON)
- Interactive mode for `hlx run` (stdin pipe for longer scripts)

## Summary Table

| Aspect | Decision |
|--------|----------|
| New files | `src/inspect/netsuite.ts`, `src/run/index.ts` |
| Modified files | `src/inspect/index.ts`, `src/index.ts` |
| Handler pattern | resolveRepo -> hxFetch POST -> console.log JSON (same as db.ts/logs.ts) |
| `hlx run` scope | Top-level command (not under inspect) |
| `--env` passing | Body parameter via getFlag, omitted when not provided |
| Default env | From manifest `nsDefaultEnv`, written by server's configureInspectionForStep |
| basePath | Default `/api/inspect` — no override needed |
| New dependencies | None |

## APL Statement Reference

See `tech-research/apl.json`. All questions resolved with evidence. No unresolved followups.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (description + Override 1) | Primary specification, env as plain parameter | Two CLI subcommands, --env prod/sandbox as body param |
| ticket.md (Research Report RSH-636 §4) | CLI scope specification | ~4 files: 2 new handlers, 2 router modifications |
| diagnosis/diagnosis-statement.md (cli) | CLI implementation scope | 2 new files, 2 modified files, hxFetch basePath works, --env as body param |
| diagnosis/apl.json (cli) | Answered questions about CLI structure and --env passing | Switch locations, --env in body, basePath compatibility |
| scout/scout-summary.md (cli) | CLI architecture analysis | Switch-based routing, hxFetch client, flag utilities, consistent patterns |
| scout/reference-map.json (cli) | File map with handler templates | db.ts (12 lines), logs.ts (14 lines), http.ts basePath, flags.ts API |
| product/product.md | Product scenarios for CLI behavior | SCN-01 through SCN-06 define CLI command signatures and expected outcomes |
| src/inspect/db.ts:1-12 | Handler template pattern | resolveRepo -> hxFetch POST /{repoId}/database -> console.log JSON |
| src/inspect/logs.ts:1-14 | Handler with optional flag | --limit flag sent as body parameter, same pattern for --env |
| src/lib/http.ts:18-43 | HTTP client internals | basePath /api/inspect, body as Record<string, unknown>, Bearer auth |
| src/lib/flags.ts:5-35 | Flag parsing API | getFlag extracts value after named flag |
| repo-guidance.json | Repo intent mapping | helix-cli = target (secondary) |
