# Tech Research — helix-cli

## Technology Foundation

- **Language**: TypeScript (ES2022, Node16 modules, strict mode)
- **Runtime**: Node.js >= 18
- **Dependencies**: Zero runtime dependencies; uses only Node built-in APIs and the global `fetch` API
- **Build**: `tsc` compiles `src/` to `dist/`; tests run via `node --test dist/**/*.test.js`
- **Architecture**: Switch-based command dispatch in `src/index.ts`; each command group is a `src/<group>/index.ts` router module

## Architecture Decisions

### Decision 1: New `preview` command group following the tickets/comments router pattern

**Options considered**:
- (a) Add `db-url` as a subcommand of `hlx tickets` (e.g., `hlx tickets db-url <ref>`)
- (b) Create a new `hlx preview` top-level command group with `db-url` subcommand

**Chosen**: (b) — New `preview` command group

**Rationale**: The ticket explicitly specifies `hlx preview db-url <ticket>` as the command name (settled, do-not-re-decide). The `preview` group is also future-extensible for other preview-related subcommands (status, logs). The pattern is identical to `src/tickets/index.ts` and `src/comments/index.ts`: a router module that parses subcommands, handles `--help`, resolves ticket refs, and dispatches to handlers.

### Decision 2: Reuse `extractTicketRef` + `resolveTicket` for ticket identifier resolution

**Options considered**:
- (a) Parse the ticket identifier in the new command and pass it directly to the server endpoint
- (b) Reuse the existing `extractTicketRef()` + `resolveTicket()` pipeline from `src/lib/resolve-ticket.ts`

**Chosen**: (b) — Reuse existing resolution pipeline

**Rationale**: The ticket spec requires "resolves `<ticket>` exactly the way `hlx tickets get <ticket>` does." Both `tickets get` (`src/tickets/index.ts:65-67`) and `comments list` use the same `extractTicketRef(rest)` -> `resolveTicket(config, rawRef)` pipeline. This handles internal ID, short ID (case-insensitive), and numeric ticket number, with cross-set (active + archived) ambiguity detection. The resolved `id` (internal ID) is then passed to the server endpoint path.

**Key implication**: The "ticket not found" error naturally matches `hlx tickets get` because it comes from the same `resolveTicket` function (throws `Ticket "X" not found in org "Y"`), before the new server endpoint is called.

### Decision 3: Server response format is JSON `{ connectionUri: "..." }`

**Options considered**:
- (a) Server returns plain text (`text/plain`) with just the URI
- (b) Server returns JSON `{ connectionUri: "..." }`

**Chosen**: (b) — JSON response

**Rationale**: `hxFetch()` at `src/lib/http.ts:81` always calls `response.json()` on success. There is no text/plain response path. Modifying hxFetch to support text responses would be an out-of-scope change affecting all commands. All existing server endpoints return JSON, and the global error handler returns `{ error: message }` JSON. The CLI handler extracts `.connectionUri` from the parsed response.

### Decision 4: stdout/stderr separation via `process.stdout.write` and `process.stderr.write`

**Options considered**:
- (a) `console.log(uri)` for stdout, `console.error(hint)` for stderr
- (b) `process.stdout.write(uri + '\n')` for stdout, `process.stderr.write(hint + '\n')` for stderr

**Chosen**: (b) — Explicit stream writes

**Rationale**: Both options technically work since `console.log` writes to stdout and `console.error` writes to stderr. However, `process.stdout.write` makes the output contract explicit: the handler controls exactly what bytes go to each stream. The spec requires "stdout: the connection URI and nothing else." Using `process.stdout.write` makes this guarantee visible in code. The trailing `\n` satisfies the "single trailing newline is acceptable" provision.

### Decision 5: Error handling leverages existing top-level try/catch

**Options considered**:
- (a) Add error handling in the db-url handler itself
- (b) Let errors propagate to the top-level try/catch in `src/index.ts:141-144`

**Chosen**: (b) — Propagate to existing top-level catch

**Rationale**: The top-level catch at `src/index.ts:141-144` already handles `console.error(error.message)` + `process.exit(1)` for all commands. `resolveTicket` throws descriptive errors for not-found tickets. `hxFetch` throws descriptive errors for HTTP failures (including the server's `{ error: message }` body). No custom error handling is needed in the handler beyond the "no NeonBranchRecord" case, which the server returns as a 404 that hxFetch propagates.

**Implication for stdout guarantee**: On any error path, the handler never executes `process.stdout.write()`, so stdout is guaranteed empty. The error message goes to stderr via `console.error` in the top-level catch.

### Decision 6: Help text at three levels (top-level, group, subcommand)

**Chosen**: Follow the exact patterns from `src/index.ts:35-63` (top-level), `src/tickets/index.ts:15-33` (group), and `src/tickets/index.ts:61-63` (subcommand).

**Rationale**: The ticket requires help at all three levels. The `configOrHelp()` pattern at `src/index.ts:24-33` ensures `--help` works without authentication by returning a stub config.

## Core API/Methods

| API/Method | Location | Role |
|---|---|---|
| `extractTicketRef(args)` | `src/lib/resolve-ticket.ts:17` | Parse ticket ref from --ticket flag, env var, or positional arg |
| `resolveTicket(config, ref)` | `src/lib/resolve-ticket.ts:86` | Resolve ref to `{ id, shortId }` via API |
| `hxFetch(config, path, opts)` | `src/lib/http.ts:37` | Authenticated HTTP call with retry, JSON parsing |
| `configOrHelp(subArgs)` | `src/index.ts:24` | Return config or stub for --help |
| `isHelpRequested(args)` | `src/lib/flags.ts` | Check if --help/-h is in args |

## Technical Decisions

### CLI file structure

- **New files**: `src/preview/index.ts` (group router), `src/preview/db-url.ts` (handler)
- **Modified files**: `src/index.ts` (add `case "preview"`, update `usage()`)
- **No changes to existing command groups or shared utilities**

### Server endpoint path the CLI calls

The CLI calls `GET /api/tickets/{resolved.id}/preview-db-url` via `hxFetch(config, \`/tickets/${ticketId}/preview-db-url\`, { basePath: "/api" })`. This matches the pattern used by `tickets get` (`/tickets/${ticketId}`) and other ticket-scoped commands.

### Rejected alternative: modifying hxFetch for text responses

Adding a `responseType: 'text'` option to hxFetch would require changing the shared HTTP client and testing all callers. The JSON wrapper is simpler and consistent with the server's existing response pattern.

## Technical Checks

[TCK-01] CLI stdout contains only the URI with no extra output
- Decision Reference: "stdout/stderr separation via process.stdout.write" (Architecture Decision 4)
- Verification Method: code-inspection
- Expected Evidence: Handler uses `process.stdout.write()` for the URI output, not `console.log()`. No other writes to stdout in the handler. The hint uses `process.stderr.write()`.

[TCK-02] CLI reuses extractTicketRef + resolveTicket identically to tickets get
- Decision Reference: "Reuse extractTicketRef + resolveTicket" (Architecture Decision 2)
- Verification Method: code-inspection
- Expected Evidence: `src/preview/index.ts` imports and calls `extractTicketRef(rest)` then `resolveTicket(config, rawRef)` in the same sequence as `src/tickets/index.ts:65-67`.

[TCK-03] CLI extracts connectionUri from JSON response
- Decision Reference: "Server response format is JSON { connectionUri }" (Architecture Decision 3)
- Verification Method: code-inspection
- Expected Evidence: Handler calls `hxFetch` and accesses `.connectionUri` from the result. Type assertion or extraction is present.

## Cross-Platform Considerations

- **Shell variable capture**: `process.stdout.write(uri + '\n')` ensures `$(hlx preview db-url X)` and `(hlx preview db-url X)` in PowerShell both capture exactly the URI. The `\n` is stripped by shell substitution.
- **stderr hint**: The `# ` prefix ensures the hint cannot be mistaken for a URI in any shell context.
- **Pipe safety**: With stdout/stderr separation, `hlx preview db-url X | clip` captures only the URI.

## Performance Expectations

- **Two HTTP calls for ticket resolution**: `resolveTicket` fetches the active ticket list (and possibly archived list) before the main endpoint call. This is identical to `tickets get` and other ticket-scoped commands. Total: 2-3 HTTP requests.
- **No caching**: The URI is ephemeral per the spec. No disk writes, no in-memory caching.
- **Expected latency**: Under 2 seconds for the typical case (resolution + endpoint call).

## Dependencies

- **No new npm dependencies** — the CLI has zero runtime deps and this feature uses only existing internal modules.
- **Server dependency**: Requires the new `GET /api/tickets/:ticketId/preview-db-url` endpoint to exist in helix-global-server (see server tech-research).

## Deferred to Round 2

- `--repo` filter for multi-repo preview branches (future ticket per product spec)
- Output-shaping flags (`--json`, `--shell`, `--export`) explicitly deferred by ticket
- Extracting `readTicketId` to a shared CLI utility (cosmetic, out of scope)

## Summary Table

| Aspect | Decision |
|---|---|
| Command structure | `hlx preview db-url <ticket>` — new `preview` group |
| Ticket resolution | Reuse `extractTicketRef` + `resolveTicket` |
| Server call | `hxFetch(config, '/tickets/${id}/preview-db-url', { basePath: '/api' })` |
| Response format | JSON `{ connectionUri: "..." }` — CLI extracts `.connectionUri` |
| stdout output | `process.stdout.write(uri + '\n')` |
| stderr hint | `process.stderr.write('# Tip: ...\n')` |
| Error handling | Propagate to top-level try/catch (exit 1, stderr) |
| Help text | Three levels: top-level usage, group usage, subcommand usage |
| New files | `src/preview/index.ts`, `src/preview/db-url.ts` |
| Modified files | `src/index.ts` |
| New dependencies | None |

## APL Statement Reference

See `tech-research/apl.json` for the evidence-backed question/answer loop that resolved the key technical uncertainties for the CLI side.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|---|---|---|
| ticket.md (helix-cli) | Primary specification | Command name, output contract, failure behavior, and invariants are settled. |
| diagnosis/diagnosis-statement.md (helix-cli) | Root cause and design decisions | Missing feature; hxFetch always parses JSON; follow tickets/comments router pattern. |
| diagnosis/apl.json (helix-cli) | Evidence-backed Q&A | Confirmed command registration, JSON response requirement, stdout/stderr approach. |
| product/product.md (helix-cli) | Product requirements and scenarios | Composability, fail-closed, no side effects. 12 user scenarios defined. |
| scout/reference-map.json (helix-cli) | File-level change map | Identified files to create/modify, confirmed hxFetch JSON constraint. |
| scout/scout-summary.md (helix-cli) | CLI architecture overview | Zero-dep TypeScript CLI, switch dispatch, configOrHelp pattern. |
| src/index.ts | Entry point verification | Switch dispatch at lines 77-140, usage at 35-63, configOrHelp at 24-33. |
| src/tickets/index.ts | Reference router pattern | extractTicketRef + resolveTicket + handler dispatch (lines 60-68). |
| src/tickets/get.ts | Reference handler | hxFetch with basePath "/api", JSON response handling (line 63). |
| src/lib/http.ts | HTTP client behavior | hxFetch always returns response.json() at line 81. |
| src/lib/resolve-ticket.ts | Ticket resolution logic | extractTicketRef + resolveTicket handle all identifier formats. |
| repo-guidance.json | Repo intent | Both repos are change targets. |
