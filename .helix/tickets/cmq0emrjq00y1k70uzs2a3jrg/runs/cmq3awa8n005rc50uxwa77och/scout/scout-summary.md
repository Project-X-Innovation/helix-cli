# Scout Summary — helix-cli

## Problem

The helix-cli needs two new subcommands to surface the server-side ns-gm decomposition:
1. `hlx inspect netsuite` — SuiteQL queries + NetSuite script logs (read-only, routed through server)
2. `hlx run` — arbitrary SuiteScript execution (role-bounded, routed through server)

Both use the existing inspection token authentication and `hxFetch` HTTP client. Environment selection is via `--env prod|sandbox` parameter with per-step defaults.

## Analysis Summary

### CLI Architecture
- Main dispatcher is a switch statement in `src/index.ts` (lines 81-156) with 13 top-level commands.
- Inspect router is a switch in `src/inspect/index.ts` (lines 41-128) with 4 subcommands: repos, db, logs, api.
- All inspect handlers follow a consistent pattern: `resolveRepo → hxFetch POST → console.log JSON.stringify(result)`.
- `hxFetch` (src/lib/http.ts) has default basePath `/api/inspect`, retry logic (3 attempts), and auth via Bearer token or X-API-Key header.

### New Subcommand: `hlx inspect netsuite`
- New file `src/inspect/netsuite.ts` following `db.ts` pattern (~12 lines).
- POST to `/api/inspect/{repoId}/netsuite` with body `{type: 'query', query}` or `{type: 'logs', scriptId, ...}`.
- Flags: `--repo <name>`, `--env prod|sandbox` (optional), query as positional or `--query` flag.
- Add `case "netsuite"` to switch in `src/inspect/index.ts`.

### New Subcommand: `hlx run`
- New file `src/run/index.ts` for the top-level `run` command.
- POST to `/api/inspect/{repoId}/run` with body `{code, modules?}`.
- Flags: `--repo <name>`, `--env prod|sandbox` (optional), code from positional or flag.
- Add `case "run"` to switch in `src/index.ts`.

### Shared Infrastructure (Unchanged)
- `hxFetch` with retry, auth, basePath — reused as-is.
- `resolveRepo` for repository name/ID resolution — reused as-is.
- Flag parsing utilities (getFlag, hasFlag, getPositionalArgs) — reused as-is.
- Config loading from env vars or `~/.hlx/config.json` — reused as-is.

### Build & Quality Gates
- Build: `tsc` (TypeScript compilation)
- Typecheck: `tsc --noEmit`
- Test: `tsc && node --test dist/**/*.test.js` (Node.js built-in test runner)
- No existing inspect handler tests.

## Relevant Files

| File | Role | Key Detail |
|------|------|------------|
| `src/inspect/netsuite.ts` | NEW | Handler for hlx inspect netsuite (~20 lines) |
| `src/run/index.ts` | NEW | Handler for hlx run (~30 lines) |
| `src/inspect/index.ts` | MOD | Add netsuite case to switch + update usage |
| `src/index.ts` | MOD | Add run case to dispatcher + update usage |
| `src/inspect/db.ts` | REF | Template pattern (12 lines) |
| `src/inspect/logs.ts` | REF | Logs handler with --limit flag (14 lines) |
| `src/inspect/api.ts` | REF | API handler (11 lines) |
| `src/lib/http.ts` | REF | hxFetch with retry, auth, basePath |
| `src/lib/flags.ts` | REF | Flag parsing utilities |
| `src/lib/resolve-repo.ts` | REF | Repository name/ID resolution |
| `src/lib/config.ts` | REF | Config loading + auth env vars |
| `package.json` | REF | Build: tsc. Test: node --test |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-636) | CLI scope specification | ~4 files changed: 2 new handlers, 2 router modifications |
| ticket.md (Override 1) | Environment parameter design | --env prod\|sandbox as plain parameter, not JWT claim |
| src/inspect/index.ts | Existing router structure | Switch-based routing with 4 subcommands, help text, flag parsing |
| src/index.ts | Main dispatcher structure | Switch-based, 13 commands, configOrHelp pattern |
| src/inspect/db.ts | Handler template | resolveRepo → hxFetch POST → console.log JSON (12 lines) |
| src/inspect/logs.ts | Handler with optional flag | --limit flag pattern |
| src/lib/http.ts | HTTP client internals | basePath /api/inspect, Bearer/X-API-Key auth, retry logic |
| src/lib/flags.ts | Flag parsing API | getFlag, hasFlag, getPositionalArgs, isHelpRequested |
| src/lib/config.ts | Auth token sources | HELIX_INSPECT_TOKEN env var for sandbox auth |
| package.json | Quality gates | Build: tsc. Test: tsc && node --test. Typecheck: tsc --noEmit |
