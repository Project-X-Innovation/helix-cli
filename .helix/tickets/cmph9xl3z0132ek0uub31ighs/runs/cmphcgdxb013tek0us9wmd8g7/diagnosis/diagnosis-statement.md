# Diagnosis Statement — helix-cli

## Problem Summary

The `hlx` CLI has no `preview` command group and no way to retrieve a ticket's Neon preview branch connection URI. Developers must manually query the database, decrypt the stored ciphertext, and copy-paste — a multi-step process that a single CLI command should replace.

## Root Cause Analysis

This is a **missing feature**, not a bug. The root cause is that the CLI's command surface does not yet include a `preview` group. All the building blocks exist:

1. **Ticket resolution** — `extractTicketRef()` and `resolveTicket()` in `src/lib/resolve-ticket.ts` already handle all identifier formats (internal ID, short ID, ticket number).
2. **HTTP client** — `hxFetch()` in `src/lib/http.ts` handles auth headers, retry, and error propagation. It always parses JSON responses (`response.json()` at line 81), so the server endpoint must return JSON.
3. **Command group pattern** — `src/tickets/index.ts` and `src/comments/index.ts` demonstrate the router pattern: parse subcommand, check `--help`, resolve ticket ref, dispatch to handler.
4. **Entry point registration** — `src/index.ts` uses a switch-based dispatch with `configOrHelp()` for each command group.

**Key design decision**: The server endpoint must return `{ connectionUri: "..." }` (JSON) because `hxFetch` has no text/plain response path. The CLI handler extracts `.connectionUri` and writes it to `process.stdout.write()`, with the `#`-prefixed hint going to `process.stderr.write()`.

## Evidence Summary

| Evidence | Finding |
|----------|---------|
| `src/index.ts:77-140` | Switch dispatch — add `case "preview"` with `runPreview(configOrHelp(subArgs), subArgs)` |
| `src/index.ts:35-63` | `usage()` function — add `preview` group description |
| `src/index.ts:24-33` | `configOrHelp()` returns stub config for `--help` so help works without auth |
| `src/lib/http.ts:81` | `return response.json()` — confirms JSON-only response handling |
| `src/tickets/index.ts` | Reference router: subcommand switch → `extractTicketRef` → `resolveTicket` → handler |
| `src/tickets/get.ts` | Reference handler: `hxFetch(config, path, { basePath: "/api" })` then type-assert result |
| `src/lib/resolve-ticket.ts` | Reusable ticket resolution for ID, shortId, and number |
| `src/lib/flags.ts` | `isHelpRequested()` utility for `--help` checking |
| `package.json` | Zero runtime deps, tsc build, node:test framework |

## Success Criteria

1. `hlx preview db-url <ticket>` prints the decrypted URI to stdout and a `#`-prefixed hint to stderr, exits 0.
2. `hlx preview --help` and `hlx preview db-url --help` show useful help text.
3. `hlx --help` lists the `preview` command group.
4. Piping/redirection works cleanly: `> url.txt` captures URI only, `2>/dev/null` suppresses hint.
5. All ticket identifier formats (ID, short ID, number) resolve correctly.
6. Error cases (not found, not authorized, no preview DB) exit 1 with errors on stderr and empty stdout.
7. No `.env` files read/written, no env vars mutated, no subprocesses spawned, no URI persisted to disk.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (helix-cli) | Identified files to change and patterns to follow | hxFetch always parses JSON; new preview group follows tickets/comments pattern |
| scout/scout-summary.md (helix-cli) | Summary of CLI architecture | Zero-dep TypeScript CLI with switch-based dispatch, configOrHelp pattern |
| src/index.ts | Verified dispatch pattern and usage text structure | Switch cases at lines 77-140, usage() at 35-63, configOrHelp at 24-33 |
| src/lib/http.ts | Verified hxFetch response handling | Line 81: always calls response.json() — server must return JSON |
| src/tickets/index.ts | Verified command group router pattern | extractTicketRef + resolveTicket → handler dispatch |
| src/tickets/get.ts | Verified handler pattern | hxFetch with basePath "/api", type-assert result |
| src/comments/index.ts | Second reference for ticket-scoped command group | Same extractTicketRef + resolveTicket pattern |
