# Scout Summary — helix-cli

## Problem

Two new CLI commands must replace sandbox-side ns-gm CLI access, matching the two-surface governance model:

1. **`hlx inspect netsuite`** — Read-only SuiteQL queries and NS script logs via the server-side inspection proxy.
2. **`hlx run`** — Arbitrary SuiteScript execution via the server-side proxy. New top-level command (not under `inspect`).

Both commands route through the existing `hxFetch` HTTP client, inheriting auth, retry, and error handling. No ns-gm CLI dependency — all NetSuite operations go through the server-side proxy.

## Analysis Summary

### CLI Architecture

The CLI uses a **manual switch-case dispatch pattern** (no Commander.js/yargs):
- Top-level: `src/index.ts` (L80-156) dispatches `command` via switch
- Sub-level: `src/inspect/index.ts` (L33-129) dispatches `subcommand` via switch
- Each handler follows a 12-line template: `resolveRepo` → `hxFetch(config, path, {method, body})` → `console.log(JSON.stringify(result))`

### New Command Registration Points

**`hlx inspect netsuite`:**
- Add `case "netsuite":` in `src/inspect/index.ts` switch (after `case "api":` at L109)
- Add help text in `inspectUsage()` at L9-31
- Create new handler file: `src/inspect/netsuite.ts` following `db.ts` pattern
- Calls `hxFetch(config, /${repoId}/netsuite, { method: "POST", body })` 

**`hlx run`:**
- Add `case "run":` in `src/index.ts` top-level switch (after `case "inspect":` at L90)
- Add help text in `usage()` at L37-67
- Create new handler directory/file: `src/run/index.ts`
- May need basePath override in hxFetch if route is not under /api/inspect

### Auth & HTTP

- `hxFetch` (http.ts:37-80) defaults basePath to `/api/inspect`
- Auth: `hxi_*` tokens → `X-API-Key` header; other → `Authorization: Bearer` (L53-57)
- Config priority: `HELIX_API_KEY` > `HELIX_INSPECT_TOKEN` > `HELIX_INSPECT_API_KEY` (config.ts:42)
- 3-attempt retry with exponential backoff; 30s timeout via AbortSignal.timeout
- `hxFetch` supports `basePath` override, so `hlx run` can use a different API path

### Quality Gates

- Build: `tsc`
- Typecheck: `tsc --noEmit`
- Test: `tsc && node --test dist/**/*.test.js`
- No separate lint script

## Relevant Files

| File | Role |
|------|------|
| `src/index.ts` | Top-level command dispatch — add `run` case |
| `src/inspect/index.ts` | Inspect subcommand router — add `netsuite` case |
| `src/inspect/db.ts` | Reference handler template (12-line pattern) |
| `src/inspect/logs.ts` | Handler with optional params pattern |
| `src/inspect/api.ts` | Handler with GET pattern |
| `src/lib/http.ts` | hxFetch HTTP client with auth, retry, basePath |
| `src/lib/config.ts` | Config loading with env var priority |
| `src/lib/flags.ts` | Flag parsing utilities |
| `src/lib/resolve-repo.ts` | Repo name/ID resolution |
| `package.json` | Quality gates |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report) | Primary spec | Two surfaces: inspect netsuite (read-only) and run (role-bounded) |
| Continuation context | Scope refinement | Both surfaces in one effort; hlx run is top-level command |
| src/index.ts (direct read) | Verified dispatch pattern | Manual switch-case at L80-156; no 'run' case exists |
| src/inspect/index.ts (direct read) | Verified inspect routing | Switch at L41 with repos/db/logs/api; no 'netsuite' case |
| src/inspect/db.ts (direct read) | Verified handler template | 12-line pattern: resolveRepo → hxFetch POST → JSON output |
| src/lib/http.ts (direct read) | Verified HTTP client | basePath=/api/inspect; hxi_ detection; 30s timeout; 3 retries |
| src/lib/config.ts (direct read) | Verified env var priority | HELIX_API_KEY > HELIX_INSPECT_TOKEN > HELIX_INSPECT_API_KEY |
| package.json (direct read) | Verified quality gates | build=tsc; typecheck=tsc --noEmit; test=tsc && node --test |
