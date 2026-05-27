# Implementation Plan — helix-cli

## Overview

Add a new `hlx preview db-url <ticket>` CLI command that prints the decrypted Neon preview branch connection URI to stdout. This requires a new `preview` command group with a `db-url` subcommand, following the established router pattern from `src/tickets/index.ts`.

Three files are affected: two new files (`src/preview/index.ts`, `src/preview/db-url.ts`) and one modified file (`src/index.ts`). No new dependencies.

**Cross-repo dependency**: This CLI command calls `GET /api/tickets/:ticketId/preview-db-url` on helix-global-server. The server endpoint must be implemented first (see helix-global-server implementation plan).

## Implementation Principles

- Follow the existing command group pattern exactly: `src/tickets/index.ts` is the reference for the router, `src/tickets/get.ts` is the reference for the handler.
- Reuse `extractTicketRef` + `resolveTicket` for ticket identifier resolution — same pipeline as `hlx tickets get`.
- Server response is JSON `{ connectionUri: "..." }` because `hxFetch` always calls `response.json()` (src/lib/http.ts:81).
- stdout/stderr separation via explicit `process.stdout.write` / `process.stderr.write`.
- Error handling leverages the existing top-level try/catch at `src/index.ts:141-144`.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Create db-url handler | `src/preview/db-url.ts` |
| 2 | Create preview command group router | `src/preview/index.ts` |
| 3 | Register preview group in main entry point | Modified `src/index.ts` |
| 4 | Verify quality gates | Typecheck and build pass |

## Detailed Implementation Steps

### Step 1: Create the db-url handler

**Goal**: Implement the handler that calls the server endpoint and prints the URI to stdout.

**What to Build**:

Create `src/preview/db-url.ts` with:

1. An exported `cmdPreviewDbUrl` async function with signature `(config: HxConfig, ticketId: string) => Promise<void>`:
   - Call `hxFetch(config, \`/tickets/${ticketId}/preview-db-url\`, { basePath: "/api" })` to get the JSON response.
   - Type-assert/extract `connectionUri` from the response (e.g., `const data = result as { connectionUri: string }`).
   - Write URI to stdout: `process.stdout.write(data.connectionUri + "\n")`.
   - Write hint to stderr: `process.stderr.write("# Tip: $env:DATABASE_URL = (hlx preview db-url <ticket>); npm run dev\n")`.

Imports needed:
- `import type { HxConfig } from "../lib/config.js";`
- `import { hxFetch } from "../lib/http.js";`

Error handling: No try/catch needed in the handler itself. `hxFetch` throws on HTTP errors (including 404 for ticket-not-found and no-NeonBranchRecord). These propagate to the top-level catch at `src/index.ts:141-144` which writes to stderr and exits 1. Since `process.stdout.write` is only reached on success, stdout is guaranteed empty on any error path.

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmph9xl4g0136ek0u9ui99f4o/helix-cli
npx tsc --noEmit
```

**Success Criteria**:
- File exists at `src/preview/db-url.ts`.
- Exports `cmdPreviewDbUrl`.
- Uses `hxFetch` with `basePath: "/api"` and path `/tickets/${ticketId}/preview-db-url`.
- Uses `process.stdout.write` for the URI (not `console.log`).
- Uses `process.stderr.write` for the `#`-prefixed hint.
- No `.env` file reading, no environment variable mutation, no subprocess spawning.

### Step 2: Create the preview command group router

**Goal**: Create the preview group router that dispatches subcommands, following the `src/tickets/index.ts` pattern.

**What to Build**:

Create `src/preview/index.ts` with:

1. A `previewUsage(exitCode)` function (following `ticketsUsage` pattern at `src/tickets/index.ts:15-33`):
   ```
   Usage:
     hlx preview db-url <ticket-ref>   Print the Neon preview branch connection URI

   Ticket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).
   ```

2. An exported `runPreview` async function with signature `(config: HxConfig, args: string[]) => Promise<void>`:
   - Parse subcommand from `args[0]`, rest from `args.slice(1)`.
   - If no subcommand or `--help`/`-h`: call `previewUsage(0)`.
   - `case "db-url"`:
     - If `isHelpRequested(rest)`: print db-url-specific help and `process.exit(0)`.
       Help text: `"Usage: hlx preview db-url <ticket-ref>\n\nPrint the Neon preview branch connection URI for a ticket.\nTicket references accept: internal ID, short ID (e.g. BLD-339), or ticket number (e.g. 339).\n\nExit codes:\n  0  URI printed to stdout\n  1  Error (details on stderr)"`.
     - `const rawRef = extractTicketRef(rest)`.
     - `const resolved = await resolveTicket(config, rawRef)`.
     - `await cmdPreviewDbUrl(config, resolved.id)`.
   - `default`: print `Unknown preview command: ${subcommand}` to stderr, call `previewUsage()`.

Imports needed:
- `import type { HxConfig } from "../lib/config.js";`
- `import { isHelpRequested } from "../lib/flags.js";`
- `import { extractTicketRef, resolveTicket } from "../lib/resolve-ticket.js";`
- `import { cmdPreviewDbUrl } from "./db-url.js";`

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmph9xl4g0136ek0u9ui99f4o/helix-cli
npx tsc --noEmit
```

**Success Criteria**:
- File exists at `src/preview/index.ts`.
- Exports `runPreview`.
- Uses `extractTicketRef` + `resolveTicket` (same as `src/tickets/index.ts:65-67`).
- `--help` handling at both group and subcommand level.
- Default case prints error and shows usage.

### Step 3: Register the preview group in index.ts

**Goal**: Wire the new preview command group into the main CLI dispatch.

**What to Build**:

Modify `src/index.ts`:

1. Add import at the top (after the existing command group imports): `import { runPreview } from "./preview/index.js";`

2. Add usage line in the `usage()` function (between the `hlx comments ...` and `hlx library ...` lines):
   ```
     hlx preview db-url <ticket-ref>  Print Neon preview branch connection URI
   ```

3. Add case in the switch statement (after the `case "comments"` block, before `case "library"`):
   ```typescript
   case "preview": {
     const config = configOrHelp(args.slice(1));
     await runPreview(config, args.slice(1));
     break;
   }
   ```

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmph9xl4g0136ek0u9ui99f4o/helix-cli
npx tsc --noEmit
```

**Success Criteria**:
- `src/index.ts` imports `runPreview` from `./preview/index.js`.
- `usage()` function includes the `preview` command.
- Switch statement includes `case "preview"` with `configOrHelp` pattern.
- `preview` is NOT added to `SKIP_AUTO_UPDATE` set.

### Step 4: Verify quality gates

**Goal**: Ensure typecheck and build pass.

**What to Build**: No new code. Run quality gates.

**Verification (AI Agent Runs)**:
```bash
cd /vercel/sandbox/workspaces/cmph9xl4g0136ek0u9ui99f4o/helix-cli
npx tsc --noEmit
npm run build
```

**Success Criteria**:
- `tsc --noEmit` exits 0.
- `npm run build` exits 0.

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js >= 18 runtime | available | package.json engines field | [CHK-01], [CHK-02], [CHK-03], [CHK-04], [CHK-05] |
| npm dependencies installed | available | `npm install` in helix-cli | [CHK-01], [CHK-02], [CHK-03], [CHK-04], [CHK-05] |
| helix-global-server endpoint deployed or running locally | available | Dev setup config: `npm run dev` on port 4000 | [CHK-04], [CHK-05] |
| .env file for helix-cli with HELIX_API_KEY and HELIX_URL | available | Dev setup config provides values | [CHK-04], [CHK-05] |
| .env file for helix-global-server with all required vars | available | Dev setup config provides values | [CHK-04], [CHK-05] |
| A ticket with a NeonBranchRecord in the database | unknown | Requires a ticket that went through preview provisioning; staging DB may have one | [CHK-05] |
| helix-global-server implementation complete | available | Cross-repo dependency; server endpoint must exist | [CHK-04], [CHK-05] |

### Required Checks

[CHK-01] TypeScript compilation passes with no errors.
- Action: Run `npx tsc --noEmit` in the helix-cli root.
- Expected Outcome: Exit code 0, no type errors reported.
- Required Evidence: Terminal output of the command showing zero errors.

[CHK-02] Build succeeds and produces dist output.
- Action: Run `npm run build` in the helix-cli root.
- Expected Outcome: Exit code 0, `dist/preview/index.js` and `dist/preview/db-url.js` exist.
- Required Evidence: Terminal output showing successful build and `ls dist/preview/` showing both files.

[CHK-03] Help text works at all three levels without authentication.
- Action: Run the built CLI directly:
  - `node dist/index.js --help` — verify "preview" appears in the output.
  - `node dist/index.js preview --help` — verify "db-url" appears in the output.
  - `node dist/index.js preview db-url --help` — verify ticket-ref argument and exit codes are documented.
- Expected Outcome: All three commands exit 0 and display the expected help text.
- Required Evidence: Terminal output of each command showing the help text content.

[CHK-04] Command produces correct error for a non-existent ticket.
- Action: Start the helix-global-server dev server (`npm run dev` on port 4000 with .env from dev setup config). Configure helix-cli .env with `HELIX_URL=http://localhost:4000` and the provided `HELIX_API_KEY`. Run `node dist/index.js preview db-url nonexistent-ticket-id`.
- Expected Outcome: Exit code 1. Error message on stderr mentioning "not found". Nothing on stdout.
- Required Evidence: Terminal output showing the error message on stderr, and confirmation that stdout was empty (e.g., by redirecting stdout to a file and verifying it is empty).

[CHK-05] Command prints URI to stdout for a ticket with a NeonBranchRecord.
- Action: With both servers configured and running, identify a ticket ID that has a provisioned preview (NeonBranchRecord exists). Run `node dist/index.js preview db-url <ticket-id>`.
- Expected Outcome: Exit code 0. The decrypted Neon connection URI (starting with `postgresql://`) is printed to stdout with a single trailing newline. A `#`-prefixed usage hint is printed to stderr.
- Required Evidence: Terminal output showing the URI on stdout (captured via `> url.txt` to confirm no contamination) and the hint on stderr.

## Success Metrics

1. Two new files: `src/preview/index.ts` and `src/preview/db-url.ts`.
2. One modified file: `src/index.ts` with import, usage text, and switch case.
3. `hlx --help` lists `preview`, `hlx preview --help` lists `db-url`, `hlx preview db-url --help` documents usage.
4. Typecheck and build pass with zero errors.
5. stdout contains only the URI on success; stderr contains the `#`-prefixed hint.
6. Error paths exit 1 with errors on stderr and empty stdout.
7. No `.env` files read/written, no env vars mutated, no subprocesses spawned.
8. No new npm dependencies.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Primary specification | Command name, output contract, failure behavior, non-negotiable invariants, acceptance criteria. |
| scout/scout-summary.md (helix-cli) | CLI architecture | Zero-dep TypeScript CLI, switch dispatch, configOrHelp pattern, hxFetch always parses JSON. |
| scout/reference-map.json (helix-cli) | File-level reference map | Files to create/modify, hxFetch JSON constraint, command registration pattern. |
| diagnosis/diagnosis-statement.md (helix-cli) | Design decisions | Missing feature; follow tickets/comments pattern; server must return JSON. |
| diagnosis/apl.json (helix-cli) | Evidence-backed Q&A | Confirmed command registration, JSON response, stdout/stderr separation, error flow. |
| tech-research/tech-research.md (helix-cli) | Architecture decisions | 6 decisions: new preview group, reuse resolveTicket, JSON response, stdout.write/stderr.write, top-level catch, help at 3 levels. |
| product/product.md | Product requirements | 12 user scenarios, composability, fail-closed, no side effects. |
| repo-guidance.json | Repo intent | helix-cli is a change target. |
| src/index.ts | Entry point verification | Switch at 77-140, usage at 35-63, configOrHelp at 24-33. |
| src/tickets/index.ts | Reference router | extractTicketRef + resolveTicket + handler dispatch pattern. |
| src/tickets/get.ts | Reference handler | hxFetch with basePath "/api", type-assert result. |
| src/lib/http.ts:81 | hxFetch behavior | Always calls response.json(); server must return JSON. |
| src/lib/resolve-ticket.ts | Ticket resolution | extractTicketRef + resolveTicket handle all identifier formats. |
