# Tech Research — BLD-693: ns-gm Server-Side Decomposition (helix-cli)

## Technology Foundation

- **Runtime**: Node.js with TypeScript (ES2022, Node16 module resolution, strict mode)
- **CLI pattern**: Switch-based command dispatcher in `src/index.ts` with sub-routers (e.g., `src/inspect/index.ts`)
- **HTTP client**: `hxFetch` in `src/lib/http.ts` — default basePath `/api/inspect`, retry (3 attempts, 2s base delay), Bearer token or X-API-Key auth, 30s timeout
- **Flag parsing**: `src/lib/flags.ts` — `getFlag`, `hasFlag`, `getPositionalArgs`, `isHelpRequested`
- **Repo resolution**: `src/lib/resolve-repo.ts` — match by exact ID, name (case-insensitive), or partial name
- **Auth**: `HELIX_INSPECT_TOKEN` env var -> Bearer token header (sourced from `/tmp/helix-inspect/env.sh` in sandbox)
- **Build**: `tsc`. Test: `tsc && node --test dist/**/*.test.js`. Typecheck: `tsc --noEmit`. Zero runtime npm deps.

## Architecture Decision

### AD-1: Two new subcommands following existing patterns

**Options considered:**
1. **Extend existing inspect handler** with inline netsuite logic — Put netsuite handling directly in `src/inspect/index.ts`.
2. **New handler files** following the `db.ts` / `logs.ts` pattern — Separate handler modules with switch cases in routers.

**Chosen: Option 2 — Separate handler files**

**Rationale:** The existing codebase cleanly separates each inspect subcommand into its own file (`db.ts` at 12 lines, `logs.ts` at 14 lines, `api.ts`). Each follows the pattern: `resolveRepo -> hxFetch POST -> console.log JSON`. Creating `src/inspect/netsuite.ts` (60 lines) and `src/run/index.ts` (53 lines) maintains this consistent separation.

**Verified:** `netsuite.ts` follows the exact same pattern: resolveRepo (line 21), hxFetch POST (lines 36-39 and 54-57), console.log JSON (lines 40 and 58). `run/index.ts` follows the same pattern with resolveRepo (line 27), hxFetch POST (line 48-51), console.log JSON (line 52).

### AD-2: `hlx run` as a top-level command

**Options considered:**
1. **Under inspect** (`hlx inspect run`) — Keeps all server-proxied commands under one prefix.
2. **Top-level** (`hlx run`) — Distinct from inspect, reflecting the different governance model.

**Chosen: Option 2 — Top-level `hlx run`**

**Rationale:** Per RSH-636, `hlx run` is not read-only and has a fundamentally different governance model from `hlx inspect netsuite`. Making it top-level avoids confusion with the "inspect" (read-only) prefix. On the server side, both routes live under `/api/inspect/` for auth simplicity, but the CLI user-facing command structure should reflect the semantic difference.

**Verified:** `src/run/index.ts` is in its own directory. `src/index.ts` has `case "run"` at lines 101-105 in the main dispatcher, same level as `inspect`, `version`, etc.

### AD-3: `--env` flag as body parameter with manifest default

**Options considered:**
1. **Query parameter** on the URL.
2. **Body parameter** in the POST request body.
3. **CLI-side only** (no env sent to server, server derives from step context).

**Chosen: Option 2 — Body parameter with manifest default**

**Rationale:** `hxFetch` sends body as `Record<string, unknown>` for POST requests. The `--env` flag is parsed via `getFlag(args, '--env')` and included in the body alongside the query/code payload. When `--env` is not provided, the CLI reads `nsDefaultEnv` from the manifest and sends that instead. The server handler uses `env` from the body directly — no step context lookup needed.

**Verified:** Both handlers have identical `readManifestDefaultEnv()` functions (lines 7-18) that read `/tmp/helix-inspect/manifest.json`, map `PRODUCTION` -> `'prod'`, and return `'sandbox'` for other values. The `env` key is included in the body when present (netsuite.ts line 34/52, run/index.ts line 46).

### AD-4: Manifest-based default environment

**Decision:** The CLI reads `nsDefaultEnv` from `/tmp/helix-inspect/manifest.json` (written by `configureInspectionForStep` on the server during sandbox provisioning). When the user does not provide `--env`, the CLI sends the manifest's `nsDefaultEnv` value.

**Verified:** `readManifestDefaultEnv()` at netsuite.ts lines 7-18 wraps the manifest read in try/catch. If the manifest is unreadable or missing `nsDefaultEnv`, returns `undefined`. The env resolution chain: `--env flag` -> `manifest nsDefaultEnv` -> `undefined` (server falls back to SANDBOX).

## Core API/Methods

### src/inspect/netsuite.ts (NEW, 60 lines)

`cmdNetsuite(config, repoNameOrId, args)`:
- Resolves repo via `resolveRepo`
- Parses `--env` flag with manifest fallback
- Detects mode from first positional arg:
  - `"logs"` -> POST `{ type: 'logs', scriptId?, env? }` to `/{repoId}/netsuite`
  - default -> POST `{ type: 'query', query, env? }` to `/{repoId}/netsuite`
- Query from `--query` flag or positional args joined
- Missing query -> `process.exit(1)` with error message
- Output: `JSON.stringify(result, null, 2)` to stdout

### src/run/index.ts (NEW, 53 lines)

`cmdRun(config, args)`:
- Parses `--repo` (required, validated with `process.exit(1)` on missing)
- Resolves repo via `resolveRepo`
- Parses `--env` flag with manifest fallback
- Code from `--code` flag or positional args joined
- Missing code -> `process.exit(1)` with error message
- Modules from `--modules` flag, split on comma, trimmed, filtered
- POST `{ code, modules?, env? }` to `/{repoId}/run`
- Output: `JSON.stringify(result, null, 2)` to stdout

### src/inspect/index.ts (MOD)

- `case "netsuite"` at lines 125-138 in inspect router switch
- Validates `--repo` flag (required for inspect subcommands)
- Dispatches to `cmdNetsuite(config, repoNameOrId, args)`

### src/index.ts (MOD)

- `case "run"` at lines 101-105 in main dispatcher switch
- Uses `configOrHelp` for auth resolution
- Dispatches to `cmdRun(config, args.slice(1))`

## Technical Decisions (including rejected alternatives)

### TD-1: Code input for `hlx run`

**Decision:** Accept code from positional argument (args after flags) or `--code` flag. Positional is the primary mode for short scripts. The `--code` flag exists for scripts that start with dashes or need explicit quoting. Missing code results in `process.exit(1)` with an error message.

**Verified:** run/index.ts lines 32-39 — `const code = codeFlag ?? positional.join(" "); if (!code) { console.error(...); process.exit(1); }`

### TD-2: Modules as comma-separated string

**Decision:** `--modules N/record,N/search` is parsed as `modulesFlag.split(",").map(m => m.trim()).filter(Boolean)` and sent as a string array in the body. The server Zod schema accepts `z.array(z.string()).optional()`.

**Verified:** run/index.ts lines 43-45 — `if (modulesFlag) { body.modules = modulesFlag.split(",").map((m) => m.trim()).filter(Boolean); }`

### TD-3: No tests for new handlers

**Decision:** No existing inspect handler tests exist in the CLI codebase (no `.test.ts` files in `src/inspect/`). The new handlers follow the same pattern and have the same test coverage (none). Adding CLI-level tests is deferred. The server-side handlers are the critical test boundary.

### TD-4: Duplicate `readManifestDefaultEnv` function

**Decision:** Both `netsuite.ts` and `run/index.ts` have an identical `readManifestDefaultEnv()` function (lines 7-18). This duplication is acceptable for 12 lines of manifest-reading code. Extracting to a shared utility would add a new module for minimal benefit. Can be refactored later if more handlers need it.

### TD-5: hxFetch basePath compatibility

**Decision:** Both commands use the default `/api/inspect` basePath from hxFetch. The server routes are `POST /api/inspect/:repoId/netsuite` and `POST /api/inspect/:repoId/run`. hxFetch constructs URLs as `${baseUrl}/api/inspect/${path}`, so passing `/${repoId}/netsuite` and `/${repoId}/run` produces the correct full URLs. No basePath override is needed.

## Technical Checks

[TCK-01] CLI routes to correct server endpoints
- Decision Reference: "Both under /api/inspect/ with hxFetch default basePath"
  (from AD-3, TD-5)
- Verification Method: code-inspection
- Expected Evidence: `netsuite.ts` calls `hxFetch(config, '/${repoId}/netsuite', ...)` with POST method. `run/index.ts` calls `hxFetch(config, '/${repoId}/run', ...)` with POST method.

[TCK-02] --env flag included in request body when present
- Decision Reference: "--env parsed via getFlag and included in the request body"
  (from AD-3)
- Verification Method: code-inspection
- Expected Evidence: Both handlers call `getFlag(args, '--env')`, fall back to `readManifestDefaultEnv()`, and include the result in the body object via `if (env) body.env = env`. When absent, `env` key is omitted from the body.

[TCK-03] Switch cases added to routers
- Decision Reference: "Add case 'netsuite' to inspect router and case 'run' to main dispatcher"
  (from AD-1, AD-2)
- Verification Method: code-inspection
- Expected Evidence: `inspect/index.ts` switch includes `case "netsuite"` dispatching to `cmdNetsuite`. `index.ts` switch includes `case "run"` dispatching to `cmdRun`.

## Cross-Platform Considerations

Not applicable. The CLI runs inside Vercel Sandboxes (Linux/Node.js). No cross-platform concerns.

## Performance Expectations

- CLI latency is dominated by server-side processing (OAuth2 token exchange, RESTlet call). CLI overhead is negligible (<10ms for flag parsing, repo resolution, HTTP dispatch).
- hxFetch retry logic (3 attempts, 2s base delay, exponential backoff) handles transient network errors.
- 30s timeout per request (hxFetch default) — adequate for RESTlet calls.

## Dependencies

### Existing (no new dependencies)
- Node.js built-in modules only (`node:fs` for manifest reading)
- `hxFetch` for HTTP client with auth and retry
- `getFlag`/`getPositionalArgs` for flag parsing
- `resolveRepo` for repository name/ID resolution

### Zero new npm dependencies

## Deferred to Round 2

- CLI tests for inspect netsuite and run handlers
- Richer error messaging (structured error display vs raw JSON propagation)
- Interactive mode for `hlx run` (stdin pipe for longer scripts)
- Extracting `readManifestDefaultEnv` to a shared utility (if more handlers need it)

## Summary Table

| Aspect | Decision |
|--------|----------|
| New files | `src/inspect/netsuite.ts` (60 lines), `src/run/index.ts` (53 lines) |
| Modified files | `src/inspect/index.ts` (netsuite case, lines 125-138), `src/index.ts` (run case, lines 101-105) |
| Handler pattern | resolveRepo -> hxFetch POST -> console.log JSON (same as db.ts/logs.ts) |
| `hlx run` scope | Top-level command (not under inspect) |
| `--env` passing | Body parameter via getFlag, manifest fallback via readManifestDefaultEnv |
| Default env | From manifest `nsDefaultEnv`, mapped PRODUCTION->'prod', else->'sandbox' |
| basePath | Default `/api/inspect` — no override needed |
| Modules | Comma-separated `--modules` flag, split/trimmed/filtered to string array |
| New dependencies | None |

## APL Statement Reference

See `tech-research/apl.json`. All 3 questions resolved with code-grounded evidence. No unresolved followups.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (description + Override 1) | Primary specification, env as plain parameter | Two CLI subcommands, --env prod/sandbox as body param |
| ticket.md (Research Report RSH-636 section 4) | CLI scope specification | ~4 files: 2 new handlers, 2 router modifications |
| diagnosis/diagnosis-statement.md (cli) | CLI implementation scope confirmation | 2 new files, 2 modified files, follows existing patterns, no test files (convention) |
| diagnosis/apl.json (cli) | Answered questions about CLI structure | hxFetch basePath works, --env in body, manifest env reading |
| scout/scout-summary.md (cli) | CLI architecture analysis | Switch-based routing, hxFetch client, flag utilities, zero runtime deps |
| scout/reference-map.json (cli) | File map with handler templates | db.ts (12 lines), logs.ts (14 lines), http.ts basePath, flags.ts API |
| product/product.md | Product scenarios for CLI behavior | SCN-01 through SCN-13 define command signatures and expected outcomes |
| repo-guidance.json | Repo intent mapping | helix-cli = target (secondary) |
| src/inspect/netsuite.ts (direct read, 60 lines) | Grounded handler implementation | query/logs modes, readManifestDefaultEnv, hxFetch POST, console.log JSON |
| src/run/index.ts (direct read, 53 lines) | Grounded handler implementation | --repo required, --code/--modules/--env, hxFetch POST, console.log JSON |
