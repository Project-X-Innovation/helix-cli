# Diagnosis Statement -- helix-cli

## Problem Summary

After ns-gm moves server-side, sandbox agents need CLI commands to access NetSuite data and execute SuiteScript through the server-side proxy. Currently, helix-cli has no NetSuite-related commands. Two new commands are required: (1) `hlx inspect netsuite` for read-only SuiteQL queries and script log retrieval, and (2) `hlx run` for arbitrary SuiteScript execution. Both are part of the ns-gm decomposition -- the interface moves to the hlx CLI while the NetSuite-client logic moves to the server.

## Root Cause Analysis

The helix-cli currently routes all inspection commands (`hlx inspect db/logs/api`) through the server-side proxy via `hxFetch`. NetSuite access has been handled entirely by the ns-gm CLI running directly inside the sandbox. With ns-gm moving server-side, the CLI needs two new surfaces that follow existing patterns.

### What must change in helix-cli

**1. `hlx inspect netsuite` subcommand**
- New case in inspect router (`src/inspect/index.ts:41-128`)
- New handler file (`src/inspect/netsuite.ts`) following `src/inspect/db.ts` pattern (~12 lines)
- Pattern: `resolveRepo -> hxFetch POST /{repoId}/netsuite with { query } -> console.log JSON`
- Support `--query-file` flag for reading SQL from file (reuse router pattern at lines 70-88)
- May support `--type query|logs` or `--logs` flag for SuiteQL vs script log discrimination
- Update help text at lines 9-31

**2. `hlx run` top-level command**
- New case in main dispatcher (`src/index.ts:81-156`)
- New module (`src/run/index.ts`) -- directory does not exist yet
- Handler pattern: parse `--repo`, `--script-file` or inline code, optional `--modules`
- `hxFetch POST /{repoId}/run with { code, modules? }` body
- May need `basePath` override if server route path differs from `/api/inspect`
- May need longer timeout than 30s (SuiteScript execution can be slow)
- Use `configOrHelp` pattern (index.ts:26-35) for help/auth flow
- Add help text in usage() at L37-67

**3. No auth or config changes**
- Both commands use existing auth: `HELIX_INSPECT_TOKEN` env var for sandbox agents, `~/.hlx/config.json` for human users
- Dual-mode auth already handled by `hxFetch` (`hxi_` -> X-API-Key, else -> Bearer)
- No `--env` flag needed -- environment is token-bounded (nsEnv claim baked in by orchestrator)
- 3-attempt retry with exponential backoff applies automatically

## Evidence Summary

| Evidence | Source | Finding |
|----------|--------|---------|
| Command dispatch | src/index.ts:81-156 | No 'run' case exists; 14 existing cases verified; configOrHelp pattern at L26-35 |
| Inspect router | src/inspect/index.ts:41-128 | Switch on args[0] for repos/db/logs/api; --query-file handling at lines 70-88 |
| Handler template | src/inspect/db.ts:1-12 | 12-line handler: resolveRepo -> hxFetch POST /{repoId}/database -> console.log JSON |
| HTTP client | src/lib/http.ts:37-134 | basePath defaults '/api/inspect'; dual-mode auth (hxi_ vs Bearer); 3-attempt retry; 30s timeout; basePath override supported |
| Config loading | src/lib/config.ts:40-86 | HELIX_API_KEY > HELIX_INSPECT_TOKEN > HELIX_INSPECT_API_KEY priority; no changes needed |
| Flag utilities | src/lib/flags.ts | getFlag, hasFlag, getPositionalArgs, isHelpRequested available |
| Env var injection | orchestrator.ts:1670-1674 (server) | HELIX_INSPECT_TOKEN + HELIX_INSPECT_BASE_URL written to sandbox env.sh |

## Success Criteria

1. `hlx inspect netsuite --repo <name> "<suiteql>"` executes SuiteQL query through server proxy and prints JSON result
2. `hlx inspect netsuite --repo <name> --query-file <path>` reads query from file (avoids shell quoting issues)
3. `hlx inspect netsuite` supports script log retrieval with appropriate filter flags
4. `hlx run --repo <name> "<code>"` or `hlx run --repo <name> --script-file <path>` executes SuiteScript through server proxy and prints JSON result
5. Both commands inherit existing auth, retry, and error handling from hxFetch
6. `hlx inspect --help` and `hlx run --help` display accurate usage information
7. No changes to existing `hlx inspect db/logs/api` commands
8. Zero new runtime dependencies

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| Continuation Context | Two-surface scope | hlx inspect netsuite (read-only) + hlx run (arbitrary SuiteScript) as CLI commands; env is token-bounded |
| scout/reference-map.json (helix-cli) | CLI structure mapping | Command dispatch at index.ts:81-156; inspect router at inspect/index.ts:41-128; no 'run' case |
| scout/scout-summary.md (helix-cli) | Pattern analysis | Each handler is 10-14 lines; hxFetch supports basePath override; zero runtime deps |
| src/inspect/db.ts (direct read, lines 1-12) | Handler template verification | 12-line pattern: resolveRepo -> hxFetch POST -> console.log JSON -- direct template for netsuite |
| src/index.ts (verified via agent) | Dispatch pattern verification | 14 existing cases at L81-156; inspect at L90-94; configOrHelp at L26-35 |
| src/inspect/index.ts (verified via agent) | Router pattern verification | Switch at L41 with repos/db/logs/api; inspectUsage at L9-31; --query-file at L70-88 |
| src/lib/http.ts (verified via agent) | HTTP client verification | basePath='/api/inspect' at L43; dual auth at L52-61; timeout=30s at L5; retry at L64-130 |
| src/lib/config.ts (verified via agent) | Config verification | HxConfig at L13-20; env var priority at L42-43 |
