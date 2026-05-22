# Ticket Context

- ticket_id: cmph9xl3z0132ek0uub31ighs
- short_id: BLD-575
- run_id: cmph9xl4g0136ek0u9ui99f4o
- run_branch: helix/build/BLD-575-hlx-cli-add-command-to-print-neon-preview-branch
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
hlx CLI: add  command to print Neon preview branch URI

## Description
# Ticket: hlx CLI — `preview db-url` command to print a ticket's Neon preview branch URI

## Summary

Add a new CLI command `hlx preview db-url <ticket>` that prints the decrypted Neon preview branch connection URI for the given ticket to stdout. Add the supporting server endpoint in `helix-global-server`. The command is read-only and must not touch any `.env` file, environment variables, or running processes.

## Why

After a ticket's preview is provisioned, Helix creates a Neon DB branch and stores its connection URI (encrypted) in a `NeonBranchRecord` row keyed by `ticketId`. There is currently no CLI-facing way to retrieve that URI, so developers cannot point a local dev server at a ticket's preview DB without manually pulling the row, decrypting it, and copy-pasting. This command closes that gap with a single composable primitive: stdout is the URI, exit code signals success/failure, the user decides what to do with it.

## Decisions Already Made

- Command name: `hlx preview db-url <ticket>`.
- Ticket identifier accepted: internal ID, short ID (e.g. `HLX-572`), or ticket number — exactly the same set accepted by `hlx tickets get`.
- Authorization on the new server endpoint: reuse the same authorization rule as the existing ticket-read endpoint that backs `hlx tickets get`. If a caller can read the ticket, the caller can read its preview DB URI. No new role or permission is introduced.
- Output contract:
  - stdout: the connection URI and nothing else. A single trailing newline is acceptable. No banners, prefixes, JSON wrappers, ANSI colors, or extra fields.
  - stderr: a one-line usage hint on success only, prefixed with `#` so it cannot be mistaken for the URI:
    ```
    # Tip: $env:DATABASE_URL = (hlx preview db-url <ticket>); npm run dev
    ```
- No audit logging is added. Standard request logs are sufficient.
- Source of truth for the URI: `NeonBranchRecord` row in `helix-global-server` matching `ticketId`. Decryption uses the existing helper that already reads `connectionUriCiphertext`, `connectionUriIv`, `connectionUriTag`, and `connectionUriKeyVersion`. Reuse that helper. Do not reimplement decryption.
- One record per ticket is assumed. If multiple rows exist for a ticket, return the most recently created one (`createdAt DESC LIMIT 1`).

## Do Not Re-Decide

- The command name, flag surface, ticket-identifier set, authorization rule, and output contract are settled above.
- Do not add `--export`, `--shell`, `--json`, `--copy`, or any other output-shaping flag in this ticket.
- Do not add audit logging, rate limiting, or new permission scopes.
- Do not change `NeonBranchRecord`'s schema, the encryption scheme, the key-version model, or how/when the row is created.
- Do not change the existing preview-config step or anything in the ticket workflow that provisions the Neon branch.

## Non-Negotiable Invariants

- The CLI must never read, write, or modify any `.env`, `.env.local`, or shell profile file.
- The CLI must never set, mutate, or read environment variables of the host process or any spawned process for this command.
- The CLI must never spawn `npm`, the dev server, or any subprocess as part of this command.
- The decrypted URI must travel: server memory → HTTPS response → CLI stdout. It must not be written to a CLI cache, config file, history file, or log.
- stdout must contain the URI only. The usage hint must go to stderr so `hlx preview db-url <ticket> | clip` and `$env:DATABASE_URL = (hlx preview db-url <ticket>)` both work without contamination.

## In Scope

- `helix-cli`: register a new `hlx preview` command group and a `db-url <ticket>` subcommand. Wire it to the new server endpoint. Print URI to stdout, hint to stderr.
- `helix-global-server`: new authenticated endpoint that accepts a ticket identifier, applies the same authorization check used by the ticket-read endpoint, looks up the latest `NeonBranchRecord` for that ticket, decrypts the URI using the existing decryption helper, and returns the plain URI in the response body.
- `--help` text for both the `preview` group and the `db-url` subcommand.

## Out of Scope

- Any `--export`, `--shell`, `--json`, or shell-detection behavior.
- Audit logging, rate limiting, new permission scopes.
- Any change to how Neon branches are created, rotated, expired, or deleted.
- Any change to `NeonBranchRecord` columns, indexes, or encryption.
- Any change to other `hlx` subcommands.
- Any client/UI work in `helix-global-client`.
- Any change to the existing ticket-read authorization logic — reuse it as-is.

## Required Behavior

1. `hlx preview --help` and `hlx preview db-url --help` produce useful help text.
2. `hlx preview db-url <ticket>` resolves `<ticket>` exactly the way `hlx tickets get <ticket>` does (internal ID, short ID, or ticket number, scoped to the active org).
3. The CLI calls the new server endpoint with the resolved ticket identifier and the caller's existing credentials.
4. The server endpoint applies the same authorization rule as the ticket-read endpoint. If the caller is not authorized to read the ticket, return the same error shape the ticket-read endpoint returns.
5. The server endpoint finds the latest `NeonBranchRecord` for that `ticketId` (`createdAt DESC LIMIT 1`), decrypts the connection URI via the existing helper, and returns it.
6. On success, the CLI prints the URI to stdout (single trailing newline acceptable) and prints the usage hint to stderr.
7. Exit code 0 on success.

## Failure Behavior

Fail closed in every case below. Exit code is 1. Error message goes to stderr. stdout must be empty.

- Ticket does not exist in the active org: same error wording as `hlx tickets get` for the same input.
- Caller is not authorized to read the ticket: same error wording as `hlx tickets get` for the same input.
- Ticket exists but has no `NeonBranchRecord`: message must say a preview DB branch was not found for this ticket and suggest the ticket may not have a provisioned preview yet. Do not return an empty string, do not exit 0, do not fall back to any other URI.
- Decryption fails (missing key version, tampered ciphertext, etc.): generic "failed to decrypt preview DB URI" message on stderr. Do not leak ciphertext, IV, tag, or key version in the error.
- Network or auth failure talking to the server: same handling as other `hlx` commands today.

## Persistence / Artifact Rules

- The CLI must not persist the URI to disk anywhere (no config file, no cache, no history).
- The server must not persist the decrypted URI (it is decrypted in-memory per request and returned).
- No new database tables, columns, or migrations.

## Acceptance Criteria

1. `hlx preview db-url <ticket-with-preview>` prints the decrypted Neon connection URI to stdout, prints a `#`-prefixed usage hint to stderr, and exits 0.
2. `hlx preview db-url <ticket-with-preview> > url.txt` writes a file containing only the URI (no hint, no banner).
3. `hlx preview db-url <ticket-with-preview> 2>/dev/null` (or `2>$null` in PowerShell) prints only the URI to stdout.
4. `$env:DATABASE_URL = (hlx preview db-url <ticket-with-preview>)` (PowerShell) and `export DATABASE_URL=$(hlx preview db-url <ticket-with-preview>)` (bash) both set `DATABASE_URL` to exactly the URI with no surrounding whitespace, hint text, or quoting artifacts.
5. `hlx preview db-url <ticket-without-NeonBranchRecord>` prints nothing to stdout, prints a clear "no preview DB branch found" error to stderr, and exits 1.
6. `hlx preview db-url <nonexistent-ticket>` produces the same error shape as `hlx tickets get <nonexistent-ticket>` and exits 1.
7. A caller who is not authorized to read the ticket via `hlx tickets get` is also not authorized to call `hlx preview db-url` for that ticket, and gets the same error shape.
8. When multiple `NeonBranchRecord` rows exist for a ticket, the latest one by `createdAt` is returned.
9. No `.env*` file in the user's working tree is read, written, or stat'd by this command. No environment variables in the CLI's host process are mutated.
10. The decrypted URI does not appear in any server log line, CLI log line, or persisted artifact. Standard request logs (route, status code, latency) are unchanged in shape.
11. `hlx --help` lists the new `preview` group; `hlx preview --help` lists `db-url`; `hlx preview db-url --help` documents the single positional argument and exit codes.
12. No migration is added. No change to `NeonBranchRecord` columns. No change to the existing ticket-read authorization logic.

## Attachments
- (none)
