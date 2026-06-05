# Tech Research: Library Report Authoring — CLI Changes

## Technology Foundation

- **Runtime**: Node.js + TypeScript
- **HTTP**: `hxFetch` with retry and API key auth (existing in `src/lib/http.ts`)
- **Flag parsing**: `getFlag`/`requireFlag` utilities (existing)
- **Reference resolution**: `resolveLibraryItem` — 3-tier: exact ID, ticket short ID, title substring (existing in `src/lib/resolve-library-item.ts`)
- **Command dispatch**: Switch-based router in `src/library/index.ts`

## Architecture Decision

### Four new commands following established patterns

All new commands follow the existing dispatcher + hxFetch + flag-parsing pattern. Two commands (publish, delete) wire existing server endpoints. Two commands (create, iterate) wire new server endpoints and add local file reading.

### Command Specifications

**hlx library create --file \<path\> [--title \<title\>] [--content-type \<type\>]**
- Read local file content via `fs.readFileSync`
- Detect content type from file extension (.md = markdown, .html = HTML) if not specified
- Infer title from first `# heading` if --title not provided
- POST to `/api/library/items` with `{ title, content, contentType }`
- Output: item ID, title, status

**hlx library iterate \<ref\> --file \<path\> [--title \<title\>]**
- Resolve ref via `resolveLibraryItem`
- Read local file content
- POST to `/api/library/items/:itemId/iterate` with `{ content, title? }`
- Output: new version ID, version count

**hlx library publish \<ref\>**
- Resolve ref via `resolveLibraryItem`
- POST to `/api/library/items/:itemId/publish`
- Output: updated status

**hlx library delete \<ref\>**
- Resolve ref via `resolveLibraryItem`
- DELETE `/api/library/items/:itemId`
- Output: confirmation

## Technical Decisions

### Decision 1: File reading in CLI (not streaming)

Read entire file content via `fs.readFileSync` and send as a string in the JSON body. Report files are typically <1MB, so streaming is unnecessary. This avoids multipart form complexity.

### Decision 2: Content type detection from file extension

Infer contentType from `.md` (markdown) or `.html` (HTML) file extension. Default to REPORT content type. Allow explicit override via `--content-type` flag.

### Decision 3: Publish and delete use existing endpoints

`POST /library/items/:itemId/publish` and `DELETE /library/items/:itemId` already exist in the server. The CLI commands are thin wrappers with ref resolution and output formatting.

## Technical Checks

[TCK-01] CLI commands follow dispatcher pattern
- Decision Reference: "All new commands follow the established dispatcher + hxFetch + flag-parsing pattern"
- Verification Method: code-inspection
- Expected Evidence: New cases in the switch statement in `src/library/index.ts` for create, iterate, publish, delete. Each dispatches to a dedicated command function. iterate/publish/delete use `resolveLibraryItem` for ref resolution.

[TCK-02] File reading for create and iterate commands
- Decision Reference: "Read entire file content via fs.readFileSync" (Decision 1)
- Verification Method: code-inspection
- Expected Evidence: create and iterate commands read --file flag path, load content via fs.readFileSync, and include content as a string in the POST body JSON.

## Dependencies

- Depends on: helix-global-server API endpoints (POST /library/items, POST /library/items/:id/iterate)
- No new npm dependencies; uses Node.js built-in `fs` module for file reading

## Deferred to Round 2

- `hlx library edit <ref>` — Open content in $EDITOR, save back (interactive editing)
- `hlx library versions <ref>` — List version history from CLI
- `hlx library diff <ref> <version>` — Show diff between versions

## Summary Table

| Command | Server Endpoint | New/Existing | Key Pattern |
|---------|----------------|--------------|-------------|
| create | POST /library/items | New endpoint | File read + hxFetch + flag parsing |
| iterate | POST /library/items/:id/iterate | New endpoint | resolveLibraryItem + file read + hxFetch |
| publish | POST /library/items/:id/publish | Existing | resolveLibraryItem + hxFetch |
| delete | DELETE /library/items/:id | Existing | resolveLibraryItem + hxFetch |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/diagnosis-statement.md (cli) | CLI gap analysis | 4 missing commands; publish/delete APIs exist |
| diagnosis/apl.json (cli) | CLI diagnostic answers | Dispatcher + hxFetch + flag-parsing pattern established |
| scout/scout-summary.md (cli) | CLI command inventory | list/show/comments only; resolveLibraryItem reusable |
| src/library/index.ts | Current command structure | Switch-based dispatcher; pattern for new cases |
| product/product.md | Product requirements | Scenarios SCN-01, SCN-03, SCN-05, SCN-06 define CLI expectations |
| tech-research.md (server) | API endpoint designs | POST create and POST iterate request/response contracts |
