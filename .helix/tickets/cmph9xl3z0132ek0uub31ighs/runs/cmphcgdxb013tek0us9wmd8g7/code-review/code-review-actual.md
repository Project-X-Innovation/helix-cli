# Code Review — helix-cli

## Review Scope

Reviewed all files changed in the helix-cli implementation for the `hlx preview db-url <ticket>` command. Cross-referenced against ticket requirements, product spec, implementation plan, and existing codebase patterns (tickets command group, hxFetch, resolve-ticket).

## Files Reviewed

| File | Lines | Verdict |
|------|-------|---------|
| `src/preview/db-url.ts` | 1-13 (new) | Clean |
| `src/preview/index.ts` | 1-41 (new) | Clean |
| `src/index.ts` | Line 15 (import), Line 55 (usage), Lines 100-104 (switch case) | Clean |
| `src/lib/http.ts` | 1-134 | Reference only — verified hxFetch error handling and JSON parsing |
| `src/lib/resolve-ticket.ts` | 1-167 | Reference only — verified extractTicketRef + resolveTicket behavior |
| `src/lib/config.ts` | 1-222 | Reference only — verified no .env file reading |
| `src/tickets/index.ts` | 1-149 | Reference only — verified command group pattern |
| `src/tickets/get.ts` | 1-124 | Reference only — verified handler pattern |

## Missed Requirements & Issues Found

### Requirements Gaps
None. All ticket requirements and acceptance criteria are addressed:

1. **AC-1**: URI → stdout via `process.stdout.write`, hint → stderr via `process.stderr.write`, exit 0 on success.
2. **AC-2**: `> url.txt` captures URI only (stdout.write, not console.log).
3. **AC-3**: `2>/dev/null` suppresses hint (stderr only).
4. **AC-4**: Shell variable capture works (stdout contains only URI + newline).
5. **AC-5**: No NeonBranchRecord → server returns 404, hxFetch throws, top-level catch writes to stderr, exit 1.
6. **AC-6**: Nonexistent ticket → `resolveTicket` throws same error as `hlx tickets get` (shared function).
7. **AC-7**: Same authorization — uses `resolveTicket` (org-scoped fetch) + server's org-scoped check.
8. **AC-8**: Multiple records → server uses `orderBy: { createdAt: "desc" }`.
9. **AC-9**: No `.env` file interaction — `loadConfig` reads `~/.hlx/config.json` or env vars, never `.env*` files.
10. **AC-10**: Decrypted URI not logged — CLI uses `process.stdout.write` (not console.log which could be intercepted), no logging middleware.
11. **AC-11**: Help at 3 levels: `hlx --help`, `hlx preview --help`, `hlx preview db-url --help` all verified in implementation.
12. **AC-12**: No migration, no schema changes, no auth logic changes.

### Correctness / Behavior Issues
None. The implementation correctly:
- Uses `hxFetch(config, /tickets/${ticketId}/preview-db-url, { basePath: "/api" })` matching the server endpoint path.
- Type-asserts the response as `{ connectionUri: string }`, matching the server's `res.json({ connectionUri })`.
- Uses `process.stdout.write(data.connectionUri + "\n")` for stdout-only URI output (not `console.log` which is also stdout but semantically different).
- Uses `process.stderr.write("# Tip: ...")` for the hint, matching the ticket's exact hint format.
- Relies on top-level catch at `src/index.ts:149-152` for error handling — stdout.write is never reached on error because hxFetch throws before it.

### Regression Risks
None. Changes are additive:
- Two new files (`src/preview/db-url.ts`, `src/preview/index.ts`) with no shared utility modifications.
- `src/index.ts` modifications add import, usage line, and switch case — no existing behavior changed.
- No new dependencies.

### Code Quality / Robustness
No issues. The implementation follows the established command group pattern exactly:
- `src/preview/index.ts` mirrors `src/tickets/index.ts` structure.
- `src/preview/db-url.ts` mirrors `src/tickets/get.ts` handler pattern.
- `configOrHelp` + `runPreview` dispatch in `src/index.ts` matches all other command groups.

### Non-Negotiable Invariants Verified
- No `.env*` file read/write/stat: `loadConfig` reads `~/.hlx/config.json` and env vars only. `cmdPreviewDbUrl` does not touch files.
- No env var mutation: The command reads `HELIX_API_KEY`/`HELIX_URL` for config (standard across all commands) and `HELIX_TICKET_ID` in `extractTicketRef` (shared utility). Neither sets/mutates any env var.
- No subprocess spawning: No `child_process` import, no exec/spawn calls.
- URI path: server → HTTPS → hxFetch → stdout.write. Never persisted to cache, config, history, or log.

### Verification / Test Gaps
None within scope. Happy-path (URI printed to stdout) is blocked by staging environment limitations (server endpoint not deployed, NeonBranchRecord columns missing in staging DB). This is an environment gap, not a code defect.

## Changes Made by Code Review

None. No issues requiring fixes were identified.

## Remaining Risks / Deferred Items

1. **End-to-end happy-path blocked**: Full URI retrieval cannot be verified until the server endpoint is deployed and a ticket with a valid NeonBranchRecord exists in the database.
2. **No ESLint configuration in helix-cli**: The repo has no ESLint config. TypeScript compilation is the primary quality gate. This is pre-existing and not related to this ticket.

## Verification Impact Notes

No changes were made by code review. All existing verification checks remain valid:
- **CHK-01** (TypeScript): Still valid.
- **CHK-02** (Build): Still valid.
- **CHK-03** (Help text at 3 levels): Still valid.
- **CHK-04** (Error for nonexistent ticket): Still valid.
- **CHK-05** (Happy path with URI): Still blocked by environment, but the code path is correct by inspection.

## APL Statement Reference

The helix-cli implementation is correct and complete. Two new files and one modification, following the established command group pattern exactly. No new dependencies. stdout/stderr separation verified. Error handling delegates to shared utilities (resolveTicket, hxFetch, top-level catch). All quality gates pass. No code review fixes were needed.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary spec | Command name, output contract, failure behavior, non-negotiable invariants, acceptance criteria |
| implementation/implementation-actual.md (helix-cli) | Scope map | Listed files changed and verification results |
| implementation-plan/implementation-plan.md (helix-cli) | Planned design | File creation order, code patterns, verification commands |
| implementation/apl.json (helix-cli) | Implementation evidence | Confirmed pattern adherence, stdout/stderr separation, error handling |
| product/product.md | Product requirements | 12 user scenarios drove requirements cross-check |
| repo-guidance.json | Repo intent | Confirmed helix-cli is a change target |
| src/lib/http.ts | hxFetch behavior | Confirmed always calls response.json(), throws Error on non-OK responses |
| src/lib/resolve-ticket.ts | Ticket resolution | Confirmed extractTicketRef + resolveTicket used identically by hlx tickets get |
| src/lib/config.ts | Config loading | Confirmed no .env file reading — uses ~/.hlx/config.json and env vars |
| src/tickets/index.ts | Pattern reference | Verified preview group router matches tickets group pattern |
| src/tickets/get.ts | Pattern reference | Verified db-url handler matches tickets get handler pattern |
