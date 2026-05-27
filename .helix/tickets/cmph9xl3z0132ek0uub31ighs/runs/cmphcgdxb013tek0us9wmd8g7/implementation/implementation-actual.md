# Implementation Actual — helix-cli

## Summary of Changes

Added a new `hlx preview db-url <ticket>` CLI command that prints the decrypted Neon preview branch connection URI to stdout. Created a new `preview` command group following the established `tickets`/`comments` router pattern. The command calls the new server endpoint `GET /api/tickets/:ticketId/preview-db-url`, extracts `connectionUri` from the JSON response, writes it to `process.stdout.write`, and writes a `#`-prefixed usage hint to `process.stderr.write`.

## Files Changed

| File | Action | Why | Review Hotspot |
|------|--------|-----|----------------|
| `src/preview/db-url.ts` | Created | Handler that calls server endpoint and writes URI to stdout, hint to stderr | N/A (new file) |
| `src/preview/index.ts` | Created | Router for the `preview` command group, dispatches `db-url` subcommand | N/A (new file) |
| `src/index.ts` | Modified | Added import for `runPreview`, usage text for `preview`, and `case "preview"` in switch | **Public interface**: modifies main CLI entry point and help text |

## Steps Executed

### Step 1: Create the db-url handler (`src/preview/db-url.ts`)
- Created `cmdPreviewDbUrl` async function.
- Uses `hxFetch(config, /tickets/${ticketId}/preview-db-url, { basePath: "/api" })` to call server.
- Type-asserts response as `{ connectionUri: string }`.
- Uses `process.stdout.write(data.connectionUri + "\n")` for URI output.
- Uses `process.stderr.write(...)` for the `#`-prefixed hint.
- No try/catch — errors propagate to top-level catch at `src/index.ts:149-152`.

### Step 2: Create the preview command group router (`src/preview/index.ts`)
- Created `previewUsage()` function following `ticketsUsage` pattern.
- Created `runPreview()` exported function with `db-url` subcommand dispatch.
- Uses `extractTicketRef()` + `resolveTicket()` for ticket resolution (same as `hlx tickets get`).
- Help handling at both group level and subcommand level.

### Step 3: Register preview group in `src/index.ts`
- Added `import { runPreview } from "./preview/index.js"` at line 15.
- Added `hlx preview db-url <ticket-ref>  Print Neon preview branch connection URI` to usage text.
- Added `case "preview"` with `configOrHelp` pattern in the switch statement (between `comments` and `library` cases).
- Did NOT add `preview` to `SKIP_AUTO_UPDATE` set.

### Step 4: Verify quality gates
- `npx tsc --noEmit` — passed (exit 0).
- `npm run build` — passed (exit 0, `dist/preview/index.js` and `dist/preview/db-url.js` exist).

## Verification Commands Run + Outcomes

| Command | Outcome |
|---------|---------|
| `npx tsc --noEmit` (helix-cli) | Pass — exit 0, no errors |
| `npm run build` (helix-cli) | Pass — exit 0, dist/preview/ files created |
| `ls dist/preview/` | Pass — db-url.js, db-url.d.ts, index.js, index.d.ts all present |
| `node dist/index.js --help` | Pass — output includes `hlx preview db-url <ticket-ref>` |
| `node dist/index.js preview --help` | Pass — shows db-url subcommand with description |
| `node dist/index.js preview db-url --help` | Pass — shows usage, ticket-ref formats, exit codes |
| `HELIX_API_KEY=<jwt> HELIX_URL=<staging> node dist/index.js preview db-url nonexistent-ticket-id` | Pass — exits 1, stderr has `Ticket "nonexistent-ticket-id" not found in org "unknown"`, stdout empty |
| `node dist/index.js preview db-url nonexistent > /tmp/stdout.txt 2> /tmp/stderr.txt` | Pass — stdout file empty, stderr has error message, exit 1 |

## Test/Build Results

- TypeScript compilation: PASS (0 errors)
- Build: PASS (`dist/preview/` directory with all expected files)
- Help text at 3 levels: PASS
- Error behavior (nonexistent ticket): PASS (exit 1, error on stderr, stdout empty)
- Happy path (URI printed to stdout): blocked — staging database does not have NeonBranchRecord columns, and the new server endpoint is not deployed to staging yet.

## Deviations from Plan

None. Implementation follows the plan exactly.

## Known Limitations / Follow-ups

1. **CHK-05 blocked by environment**: The staging database's `NeonBranchRecord` table does not have the `connectionUriCiphertext` column, so the full end-to-end happy path (URI decryption and printing) could not be verified at implementation time. This will work once the server changes are deployed and a ticket with a provisioned Neon branch exists.
2. **API key from dev config non-functional**: The `hxi_` API key provided in the dev setup config returns 401 on both local and staging servers. JWT-based auth (via login endpoint) was used instead for all verification.

## Spec Deviations

None. All product scenarios (SCN-01 through SCN-12) are addressed by the implementation. SCN-01/SCN-02/SCN-03/SCN-04/SCN-05/SCN-12 require a ticket with an actual NeonBranchRecord to fully verify at runtime, which is blocked by the staging database not having the required columns.

## Verification Plan Results

| Check ID | Outcome | Evidence/Notes |
|----------|---------|----------------|
| CHK-01 | pass | `npx tsc --noEmit` exits 0 with no errors |
| CHK-02 | pass | `npm run build` exits 0; `ls dist/preview/` shows `db-url.js`, `db-url.d.ts`, `index.js`, `index.d.ts` |
| CHK-03 | pass | All 3 help levels verified: `--help` shows preview; `preview --help` shows db-url; `preview db-url --help` shows ticket-ref and exit codes |
| CHK-04 | pass | `node dist/index.js preview db-url nonexistent-ticket-id` exits 1, stderr shows "Ticket not found in org", stdout captured to file is empty |
| CHK-05 | blocked | Staging DB does not have `connectionUriCiphertext` column in NeonBranchRecord table; the new server endpoint is not yet deployed to staging. No ticket with a valid NeonBranchRecord is available for end-to-end verification. |

Self-verification is partially blocked: CHK-01 through CHK-04 pass. CHK-05 (happy path with URI) is blocked by environment limitations (missing DB columns and undeployed endpoint).

## APL Statement Reference

The helix-cli implementation adds two new files and modifies one, following the established command group pattern exactly. No new dependencies. All static quality gates pass.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | Command name, output contract, failure behavior, non-negotiable invariants, acceptance criteria |
| implementation-plan/implementation-plan.md (helix-cli) | Step-by-step instructions | File creation order, code patterns, import paths, verification commands |
| implementation-plan/apl.json (helix-cli) | Evidence-backed Q&A | stdout/stderr separation, error handling delegation, file dependency order |
| product/product.md | Product scenarios | SCN-01 through SCN-12 drove verification approach |
| diagnosis/diagnosis-statement.md (helix-cli) | Design decisions | hxFetch JSON-only, preview group pattern, server must return JSON |
| repo-guidance.json | Repo intent | Confirmed helix-cli is a change target |
| src/tickets/index.ts | Reference router pattern | extractTicketRef + resolveTicket + handler dispatch |
| src/tickets/get.ts | Reference handler pattern | hxFetch with basePath "/api", type-assert response |
| src/lib/http.ts | hxFetch behavior | Always calls response.json() — server must return JSON |
| src/index.ts | Entry point pattern | Switch dispatch, configOrHelp, usage function |
