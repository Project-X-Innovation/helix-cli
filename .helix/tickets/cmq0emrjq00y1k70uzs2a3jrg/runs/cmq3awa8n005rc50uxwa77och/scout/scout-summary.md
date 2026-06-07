# Scout Summary — helix-cli

## Problem

The helix-cli needs two new subcommands to surface the server-side ns-gm decomposition:
1. `hlx inspect netsuite` — SuiteQL queries + NetSuite script logs (read-only, routed through server)
2. `hlx run` — arbitrary SuiteScript execution (role-bounded, routed through server)

Both use existing inspection token authentication and `hxFetch` HTTP client. Environment selection via `--env prod|sandbox` parameter with per-step defaults read from the inspection manifest.

## Analysis Summary

### hlx inspect netsuite — netsuite.ts (60 lines, implemented)
- `cmdNetsuite` handler with two modes detected by first positional arg:
  - **Query mode** (default): body `{type: 'query', query, env?}`, POST to `/{repoId}/netsuite`. Query from `--query` flag or positional args.
  - **Logs mode** (first arg = "logs"): body `{type: 'logs', scriptId?, env?}`, POST to `/{repoId}/netsuite`. Optional `--script-id` flag.
- Reads `/tmp/helix-inspect/manifest.json` for `nsDefaultEnv` default (PRODUCTION->'prod', else->'sandbox').
- Output: `JSON.stringify(result, null, 2)` to stdout.

### hlx run — run/index.ts (53 lines, implemented)
- `cmdRun` handler at top-level `run` command.
- Required: `--repo` (validated with `process.exit(1)` on missing).
- Optional: `--env`, `--code` (or positional args), `--modules` (comma-separated, split and trimmed).
- Body: `{code, modules?, env?}`, POST to `/{repoId}/run`.
- Reads manifest `nsDefaultEnv` for default environment, same as netsuite.ts.

### Routing Integration (implemented)
- `src/index.ts` line 101-105: `case "run"` dispatches to `cmdRun(config, args.slice(1))`.
- `src/inspect/index.ts` line 125-138: `case "netsuite"` dispatches to `cmdNetsuite(config, repoNameOrId, args)`.
- Both import paths use `.js` extensions (ES module convention).

### Shared Infrastructure (unchanged)
- `hxFetch` (src/lib/http.ts): basePath `/api/inspect`, Bearer/X-API-Key auth, 3-attempt retry with exponential backoff, 30s timeout.
- `resolveRepo` (src/lib/resolve-repo.ts): resolves name or ID to internal repo ID.
- `getFlag` / `getPositionalArgs` (src/lib/flags.ts): flag parsing utilities.
- Config from `HELIX_INSPECT_TOKEN` env var (in sandbox) or `HELIX_API_KEY` or `~/.hlx/config.json`.

### Build & Quality Gates
- Build: `tsc` (TypeScript ES2022, Node16 modules, strict)
- Typecheck: `tsc --noEmit`
- Test: `tsc && node --test dist/**/*.test.js` (Node.js built-in test runner)
- No existing inspect handler tests. No test files for netsuite.ts or run/index.ts.
- Zero runtime npm dependencies.
- CI: `build-release.yml` (build + test + metadata + tarball) and `publish.yml` (npm publish with provenance).

## Relevant Files

| File | Role | Key Detail |
|------|------|------------|
| `src/inspect/netsuite.ts` | NEW | cmdNetsuite: query/logs modes, 60 lines |
| `src/run/index.ts` | NEW | cmdRun: --repo/--env/--code/--modules, 53 lines |
| `src/inspect/index.ts` | MOD | 'netsuite' case at lines 125-138 |
| `src/index.ts` | MOD | 'run' case at lines 101-105 |
| `src/lib/http.ts` | BOUNDARY | hxFetch with basePath /api/inspect, retry, 30s timeout |
| `src/lib/resolve-repo.ts` | BOUNDARY | Repo name/ID resolution |
| `src/lib/flags.ts` | BOUNDARY | getFlag, getPositionalArgs utilities |
| `src/lib/config.ts` | BOUNDARY | HxConfig type, HELIX_INSPECT_TOKEN env var |
| `src/inspect/db.ts` | REF | Template pattern (12 lines) |
| `src/inspect/logs.ts` | REF | Handler with optional --limit flag (14 lines) |
| `package.json` | EXECUTION | Build: tsc. Test: node --test. Zero runtime deps |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-636) | CLI scope specification | ~4 files: 2 new handlers + 2 router modifications |
| ticket.md (Override 1) | Environment parameter design | --env prod\|sandbox as plain parameter, not JWT claim |
| repo-guidance.json | Repo intent | helix-cli is secondary target |
| src/inspect/netsuite.ts | Direct file read | 60-line handler with query/logs modes, fully implemented |
| src/run/index.ts | Direct file read | 53-line handler with --repo/--env/--code/--modules, fully implemented |
| src/inspect/index.ts | Agent exploration | netsuite case at lines 125-138 in router switch |
| src/index.ts | Agent exploration | run case at lines 101-105 in main dispatcher |
| src/lib/http.ts | Agent exploration | hxFetch: basePath /api/inspect, retry logic, auth modes |
| src/inspect/db.ts | Agent exploration | Template pattern: resolveRepo -> hxFetch POST -> console.log |
| package.json | Agent exploration | Build: tsc. Test: tsc && node --test. Zero runtime deps |
