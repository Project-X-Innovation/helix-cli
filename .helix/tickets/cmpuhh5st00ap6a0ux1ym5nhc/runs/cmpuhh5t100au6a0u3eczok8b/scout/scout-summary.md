# Scout Summary: helix-cli

## Problem

After ns-gm moves server-side, sandbox agents need a way to query NetSuite data through the `hlx inspect` command structure. Currently, the helix-cli has no ns-gm or NetSuite-related code — all inspect subcommands (repos, db, logs, api) target the existing inspection proxy types. A new netsuite subcommand must be added to route NetSuite queries through the server-side proxy.

## Analysis Summary

The helix-cli's inspect module follows a consistent, well-established pattern across all subcommands:

1. **Router** (`src/inspect/index.ts`): Dispatches to subcommand handlers based on first argument
2. **Subcommand handlers** (e.g., `src/inspect/db.ts`): Parse flags, resolve repository, call `hxFetch()`, display results
3. **HTTP transport** (`src/lib/http.ts`): Handles auth (hxi_ API keys or Bearer tokens), retry logic (3 attempts, exponential backoff), 30s timeout

Each subcommand calls a corresponding server endpoint:
- `db` -> `POST /api/inspect/{repoId}/database` with `{query}`
- `logs` -> `POST /api/inspect/{repoId}/logs` with `{query, limit?}`
- `api` -> `GET /api/inspect/{repoId}/api?path=<path>`

A new `netsuite` subcommand would follow the identical pattern, calling a new server endpoint (e.g., `POST /api/inspect/{repoId}/netsuite`).

**Confirmed:** Zero ns-gm, nsgm, or NetSuite references exist in `src/` (verified by grep). This is entirely new functionality.

**Build:** TypeScript with `tsc`, strict mode, ES2022 target. Tests via Node test runner.

## Relevant Files

| File | Role |
|------|------|
| `src/inspect/index.ts` | Inspect subcommand router — add netsuite case |
| `src/inspect/db.ts` | Template for new netsuite subcommand implementation |
| `src/inspect/logs.ts` | Template for subcommand pattern |
| `src/inspect/api.ts` | Template for subcommand pattern |
| `src/inspect/repos.ts` | Repo listing — must show NETSUITE type |
| `src/lib/http.ts` | HTTP transport — reused as-is |
| `src/lib/resolve-repo.ts` | Repo resolution — reused as-is |
| `src/index.ts` | Main CLI entry point |
| `skill-content/references/commands.md` | Command documentation — needs update |
| `package.json` | Build/test scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (Research Report RSH-633) | Primary specification | Agents in sandboxes will use `hlx inspect` instead of ns-gm CLI directly |
| src/inspect/index.ts | Map command routing | 4 existing subcommands with consistent dispatch pattern |
| src/inspect/db.ts | Template analysis | Clear pattern: parse args -> resolve repo -> hxFetch POST -> display results |
| src/lib/http.ts | Transport layer | Auth, retry, timeout already handled — new subcommand just calls hxFetch() |
| package.json | Build system | TypeScript compilation only, no bundler |
