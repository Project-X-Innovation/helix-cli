# Product Specification — `hlx preview db-url`

## Problem Statement

Developers working with Helix preview environments cannot retrieve the Neon preview database connection URI from the CLI. The URI is stored encrypted in a `NeonBranchRecord` row keyed by ticket, but the only way to obtain it today is to manually query the database, decrypt the ciphertext, and copy-paste. This multi-step manual process blocks a common workflow: pointing a local dev server at a ticket's preview database.

## Product Vision

Provide a single composable CLI primitive — `hlx preview db-url <ticket>` — that prints the decrypted Neon preview branch connection URI to stdout. The command outputs nothing but the URI, making it safe to pipe, redirect, or capture in a shell variable. Developers can immediately use it in their own workflows (e.g., `export DATABASE_URL=$(hlx preview db-url HLX-572)`).

## Users

- **Helix developers** who work on tickets with provisioned preview environments and need to connect local tooling (dev servers, database clients, migration scripts) to the preview database.

## Use Cases

1. Retrieve the preview DB connection URI for a ticket so a local dev server can connect to it.
2. Script automated local-dev startup that captures the URI into an environment variable.
3. Verify that a ticket's preview database was provisioned by checking whether the command succeeds.

## Core Workflow

1. Developer runs `hlx preview db-url <ticket>` (ticket may be an internal ID, short ID like `HLX-572`, or ticket number).
2. CLI resolves the ticket identifier against the active org (same resolution as `hlx tickets get`).
3. CLI calls the server endpoint with the resolved ticket ID and the caller's existing credentials.
4. Server verifies the caller is authorized to read the ticket (same org-scoped check as the ticket-read endpoint).
5. Server looks up the latest `NeonBranchRecord` for that ticket, decrypts the connection URI in memory, and returns it.
6. CLI prints the URI to stdout and a `#`-prefixed usage hint to stderr. Exit code 0.
7. On any failure, nothing is printed to stdout. An error message goes to stderr. Exit code 1.

## Essential Features (MVP)

| # | Feature |
|---|---------|
| 1 | `hlx preview db-url <ticket>` command that prints the decrypted Neon connection URI to stdout |
| 2 | Accepts the same ticket identifier formats as `hlx tickets get` (internal ID, short ID, ticket number) |
| 3 | Server endpoint that authorizes via the same org-scoped check as the ticket-read endpoint |
| 4 | Server decrypts URI using the existing `decryptSecret` helper — no re-implementation |
| 5 | When multiple `NeonBranchRecord` rows exist, returns the most recently created one |
| 6 | `#`-prefixed usage hint on stderr (does not contaminate stdout) |
| 7 | `hlx --help` lists `preview` group; `hlx preview --help` lists `db-url`; `hlx preview db-url --help` documents usage |
| 8 | Fail-closed error handling: ticket not found, not authorized, no NeonBranchRecord, decryption failure — all exit 1 with errors on stderr and empty stdout |

## Features Explicitly Out of Scope (MVP)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | `--export`, `--shell`, `--json`, `--copy` flags | Ticket decision: no output-shaping flags in this ticket |
| 2 | Audit logging for the new endpoint | Ticket decision: standard request logs are sufficient |
| 3 | Rate limiting or new permission scopes | Ticket decision: reuse existing authorization, no new permissions |
| 4 | Changes to `NeonBranchRecord` schema, indexes, or encryption | Ticket invariant: no migrations or schema changes |
| 5 | Changes to Neon branch provisioning, rotation, or expiration | Out of scope: existing workflow untouched |
| 6 | UI/client work in `helix-global-client` | Ticket scope: CLI and server only |
| 7 | Writing the URI to `.env` files, config, cache, or logs | Non-negotiable invariant: URI is ephemeral (server memory -> HTTPS -> stdout) |
| 8 | Changes to other `hlx` subcommands | Ticket scope: only the new `preview` group is added |

## Success Criteria

1. `hlx preview db-url <ticket-with-preview>` prints the decrypted URI to stdout, a `#`-prefixed hint to stderr, and exits 0.
2. Piping and redirection work cleanly: `> url.txt` captures URI only; `2>/dev/null` suppresses hint; shell variable capture (`$()` or PowerShell `()`) yields only the URI with no extra whitespace or text.
3. `hlx preview db-url <ticket-without-NeonBranchRecord>` exits 1 with a clear "no preview DB branch found" error on stderr and empty stdout.
4. `hlx preview db-url <nonexistent-ticket>` produces the same error shape as `hlx tickets get <nonexistent-ticket>` and exits 1.
5. Authorization matches `hlx tickets get`: unauthorized callers get the same error shape and exit 1.
6. No `.env` files are read, written, or stat'd. No host environment variables are mutated. No subprocesses are spawned.
7. The decrypted URI does not appear in any server log, CLI log, or persisted artifact.
8. No database migration is added. No `NeonBranchRecord` schema change. No change to existing ticket-read authorization logic.
9. Help text works at all three levels: `hlx --help`, `hlx preview --help`, `hlx preview db-url --help`.

## User Scenarios

[SCN-01] Retrieve preview DB URI for a ticket with a provisioned preview
- Precondition: Developer is authenticated with `hlx`, has access to an org, and the ticket has a provisioned Neon preview branch.
- Action: Developer runs `hlx preview db-url <ticket>`.
- Expected Outcome: The decrypted Neon connection URI is printed to stdout. A `#`-prefixed usage hint appears on stderr. Exit code is 0.

[SCN-02] Capture the URI into an environment variable
- Precondition: Developer is authenticated and the ticket has a provisioned preview.
- Action: Developer runs `export DATABASE_URL=$(hlx preview db-url <ticket>)` (bash) or `$env:DATABASE_URL = (hlx preview db-url <ticket>)` (PowerShell).
- Expected Outcome: The `DATABASE_URL` variable contains exactly the URI with no surrounding whitespace, hint text, or quoting artifacts.

[SCN-03] Redirect URI to a file
- Precondition: Developer is authenticated and the ticket has a provisioned preview.
- Action: Developer runs `hlx preview db-url <ticket> > url.txt`.
- Expected Outcome: The file `url.txt` contains only the URI. The usage hint appears on the terminal (stderr) and is not in the file.

[SCN-04] Retrieve URI using a short ticket ID
- Precondition: Developer is authenticated and knows the ticket's short ID (e.g., `HLX-572`).
- Action: Developer runs `hlx preview db-url HLX-572`.
- Expected Outcome: The ticket is resolved by short ID and the URI is printed to stdout.

[SCN-05] Retrieve URI using a ticket number
- Precondition: Developer is authenticated and knows the ticket number.
- Action: Developer runs `hlx preview db-url 572`.
- Expected Outcome: The ticket is resolved by number and the URI is printed to stdout.

[SCN-06] Request URI for a ticket without a provisioned preview
- Precondition: Developer is authenticated. The ticket exists but has no `NeonBranchRecord`.
- Action: Developer runs `hlx preview db-url <ticket>`.
- Expected Outcome: Nothing is printed to stdout. An error on stderr indicates no preview DB branch was found and suggests the ticket may not have a provisioned preview. Exit code is 1.

[SCN-07] Request URI for a nonexistent ticket
- Precondition: Developer is authenticated. The ticket identifier does not match any ticket in the active org.
- Action: Developer runs `hlx preview db-url <bad-ticket>`.
- Expected Outcome: Nothing is printed to stdout. The error message matches the shape returned by `hlx tickets get` for the same invalid input. Exit code is 1.

[SCN-08] Unauthorized caller attempts to retrieve URI
- Precondition: Developer is authenticated but does not have access to the ticket's org.
- Action: Developer runs `hlx preview db-url <ticket>`.
- Expected Outcome: Nothing is printed to stdout. The error message matches what `hlx tickets get` returns for an unauthorized caller. Exit code is 1.

[SCN-09] View help for the preview command group
- Precondition: Developer has `hlx` installed.
- Action: Developer runs `hlx preview --help`.
- Expected Outcome: Help text is displayed listing available subcommands (including `db-url`) with descriptions.

[SCN-10] View help for the db-url subcommand
- Precondition: Developer has `hlx` installed.
- Action: Developer runs `hlx preview db-url --help`.
- Expected Outcome: Help text is displayed documenting the positional `<ticket>` argument and expected exit codes.

[SCN-11] Verify preview group appears in top-level help
- Precondition: Developer has `hlx` installed.
- Action: Developer runs `hlx --help`.
- Expected Outcome: The `preview` command group is listed alongside existing groups (tickets, comments, etc.).

[SCN-12] Multiple NeonBranchRecords for a ticket
- Precondition: A ticket has more than one `NeonBranchRecord` row (e.g., one per repository).
- Action: Developer runs `hlx preview db-url <ticket>`.
- Expected Outcome: The URI from the most recently created record (`createdAt DESC`) is printed to stdout.

## Key Design Principles

- **Composability**: stdout contains only the URI so it works with pipes, redirects, and variable capture. The hint goes to stderr.
- **Fail closed**: Every error path exits 1 with an error on stderr and empty stdout. No fallback URIs, no empty-string success.
- **No side effects**: The command never writes to disk, mutates environment variables, or spawns subprocesses. It is purely read-only.
- **Reuse existing primitives**: Ticket resolution, authentication, authorization, and decryption all reuse existing helpers — no new abstractions.
- **Security by default**: The decrypted URI is ephemeral (server memory -> HTTPS response -> CLI stdout). It is never logged, cached, or persisted.

## Scope & Constraints

**In scope (two repos)**:
- `helix-cli`: New `preview` command group with `db-url` subcommand. Calls the new server endpoint. Prints URI to stdout, hint to stderr.
- `helix-global-server`: New authenticated `GET /api/tickets/:ticketId/preview-db-url` endpoint. Authorizes via org-scoped ticket check, looks up latest `NeonBranchRecord`, decrypts URI, returns JSON.

**Constraints**:
- No database migrations or schema changes.
- No new npm dependencies.
- Server endpoint must return JSON (`{ connectionUri: "..." }`) because the CLI HTTP client (`hxFetch`) always parses responses as JSON.
- The `#`-prefixed stderr hint is a CLI-side concern; the server is unaware of it.

## Future Considerations

- Additional subcommands under `hlx preview` (e.g., status, logs) could be added later without changing this work.
- If multi-repo preview branches become common, a `--repo` filter could be added to `db-url` in a future ticket.
- Output-shaping flags (`--json`, `--shell`) were explicitly deferred and could be revisited.

## Open Questions / Risks

| # | Question / Risk | Status |
|---|-----------------|--------|
| 1 | The `hxFetch` client always calls `response.json()` — the server must return JSON, not plain text. Diagnosis resolved this: endpoint returns `{ connectionUri: "..." }`. | Resolved by diagnosis |
| 2 | `readTicketId` is a local helper duplicated in 5+ controller files. Whether to extract it to a shared utility is a minor implementation detail. | Implementation decision |
| 3 | `findTicketOrThrow` includes heavy joins. The new endpoint can use a lightweight org-scoped existence check instead. Diagnosis confirmed the authorization "rule" (org-scoped access) is what must match, not the specific function. | Resolved by diagnosis |
| 4 | Production data currently shows 1 `NeonBranchRecord` per ticket. The `createdAt DESC LIMIT 1` guard is forward-looking for future multi-repo scenarios. | Low risk — guard is precautionary |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-cli) | Primary specification | Command name, output contract, failure behavior, non-negotiable invariants, acceptance criteria are all settled. |
| scout/scout-summary.md (helix-cli) | CLI architecture understanding | Zero-dep TypeScript CLI with switch-based dispatch; `hxFetch` always parses JSON; `configOrHelp` pattern for help without auth. |
| scout/scout-summary.md (helix-global-server) | Server architecture understanding | Express 5.x + Prisma; `requireAuth` gates ticket routes; `decryptSecret` helper exists; Morgan logs no response bodies. |
| scout/reference-map.json (helix-cli) | File-level change map | Identified files to create/modify and confirmed `hxFetch` JSON constraint. |
| scout/reference-map.json (helix-global-server) | File-level change map | Identified route registration, auth pattern, NeonBranchRecord schema, decryption field mapping. |
| diagnosis/diagnosis-statement.md (helix-cli) | Root cause and design decisions | Missing feature; all building blocks exist; server must return JSON for `hxFetch` compatibility. |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause and design decisions | Missing feature; lightweight ticket auth check sufficient; `findFirst` with `createdAt DESC` for NeonBranchRecord lookup. |
| diagnosis/apl.json (helix-cli) | Evidence-backed Q&A | Confirmed command registration pattern, JSON response requirement, stdout/stderr separation approach. |
| diagnosis/apl.json (helix-global-server) | Evidence-backed Q&A | Confirmed route path, authorization approach, query strategy, response format, decryption error handling. |
| repo-guidance.json (helix-cli) | Repo intent | Both repos are change targets. |
