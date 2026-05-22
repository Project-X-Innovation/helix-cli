# Scout Summary — helix-cli

## Problem

Add a new `hlx preview db-url <ticket>` command to the CLI. The command must resolve a ticket identifier (internal ID, short ID, or ticket number), call a new server endpoint to retrieve the decrypted Neon preview branch connection URI, and print only the URI to stdout with a `#`-prefixed usage hint to stderr. No `preview` command group currently exists; one must be created.

## Analysis Summary

The CLI is a zero-dependency TypeScript project using a switch-based dispatch pattern in `src/index.ts`. Command groups (tickets, inspect, comments, library, org, token, skill) each have a `src/<group>/index.ts` router that dispatches subcommands. The `tickets get` command is the closest reference: it uses `extractTicketRef()` + `resolveTicket()` from `src/lib/resolve-ticket.ts` for ticket identifier resolution, then calls `hxFetch()` with `basePath: "/api"` to hit the server.

Key patterns observed:
- **Command registration**: Import `runPreview` in `src/index.ts`, add a `case "preview"` with `configOrHelp()`, and update the `usage()` help text.
- **Router structure**: New `src/preview/index.ts` follows the `tickets/index.ts` pattern — parse subcommand, handle `--help`, dispatch to handler.
- **Ticket resolution**: Reuse `extractTicketRef()` and `resolveTicket()` identically to `tickets get`.
- **API call**: `hxFetch(config, path, { basePath: "/api" })` handles auth headers, retry, and error throwing.
- **Output contract**: stdout = URI only, stderr = `#`-prefixed hint. The top-level `try/catch` in `index.ts` already sends errors to stderr with `process.exit(1)`.

**Design boundary**: `hxFetch()` always calls `response.json()` on success (line 81 of `src/lib/http.ts`). All existing server endpoints return JSON. The new server endpoint should follow the same JSON pattern (e.g., `{ connectionUri: "..." }`), and the CLI handler extracts the URI string for stdout output.

## Relevant Files

| File | Role |
|------|------|
| `src/index.ts` | Main entry point — add `preview` case and update usage help |
| `src/tickets/index.ts` | Reference router pattern for command group with ticket resolution |
| `src/tickets/get.ts` | Reference handler — hxFetch with basePath `/api`, error handling |
| `src/lib/resolve-ticket.ts` | Ticket ID resolution — reuse extractTicketRef + resolveTicket |
| `src/lib/http.ts` | hxFetch — auth, retry, JSON response parsing |
| `src/lib/flags.ts` | isHelpRequested, flag parsing utilities |
| `src/lib/config.ts` | HxConfig type, config loading |
| `src/comments/index.ts` | Second reference for ticket-scoped command groups |
| `src/lib/resolve-ticket.test.ts` | Test patterns — node:test, mocking hxFetch |
| `package.json` | Build: tsc, typecheck: tsc --noEmit, test: tsc && node --test |
| `tsconfig.json` | ES2022, Node16 modules, strict |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Ticket specification | Command name, output contract, failure behavior, and non-negotiable invariants are settled. |
| src/index.ts | Entry point inspection | Switch-based dispatch, configOrHelp pattern, usage text location, SKIP_AUTO_UPDATE set. |
| src/tickets/index.ts | Reference command group | Pattern: subcommand switch → extractTicketRef → resolveTicket → handler. |
| src/tickets/get.ts | Reference handler | hxFetch call with basePath "/api", JSON response handling, error propagation. |
| src/lib/resolve-ticket.ts | Ticket resolution logic | extractTicketRef supports --ticket flag, env var, or positional arg. resolveTicket matches by ID, shortId, or number. |
| src/lib/http.ts | HTTP client | hxFetch always parses JSON on success. Auth via X-API-Key or Bearer token. Retry on 429/5xx. |
| src/lib/flags.ts | Flag utilities | isHelpRequested, getFlag, hasFlag available for subcommand parsing. |
| package.json | Build system | Zero deps, tsc build, node:test framework, Node >=18. |
