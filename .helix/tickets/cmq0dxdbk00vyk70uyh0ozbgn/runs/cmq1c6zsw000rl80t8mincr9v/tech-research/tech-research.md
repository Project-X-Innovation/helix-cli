# Tech Research: Library Report Authoring — CLI (Revision 2)

> Revision 2 adds `hlx library reconcile` (Finding #4), `baseCommitSha` handling on iterate (Finding #6), admin-gated publish/delete awareness (Finding #7), and acceptance test criteria (Finding #14).

## Technology Foundation

- **Runtime**: Node.js 18+ ESM, zero runtime deps
- **HTTP**: `hxFetch` client (`src/lib/http.ts`) with retry, auth headers, basePath override
- **Ref resolution**: `resolveLibraryItem` (`src/lib/resolve-library-item.ts`) — 3-tier: CUID, ticket short ID, title substring
- **Flag parsing**: `getFlag`, `hasFlag`, `requireFlag` (`src/lib/flags.ts`)
- **File reading**: `readFileSync(filePath, 'utf-8')` precedent in `src/tickets/update-description.ts`

## Architecture Decision

CLI commands are thin clients over server API endpoints. All business logic (sanitization, reconciliation, concurrency control) lives server-side. The CLI's role is: read local files, resolve refs, call the API, display results.

### Five New Commands (revised from 4)

| Command | Server Endpoint | Auth Level | Finding |
|---------|----------------|------------|---------|
| `hlx library create --file <path> [--title]` | `POST /api/library/items` | Org member | — |
| `hlx library iterate <ref> --file <path> [--title]` | `POST /api/library/items/:id/iterate` | Org member | F6 (baseCommitSha) |
| `hlx library publish <ref>` | `POST /api/library/items/:id/publish` | Admin | F7 |
| `hlx library delete <ref>` | `DELETE /api/library/items/:id` | Admin | F7 |
| `hlx library reconcile` | `POST /api/admin/library/reconcile` | Admin | F4 (NEW) |

### Iterate with Optimistic Concurrency (Finding #6)

The iterate command must:
1. Resolve ref → fetch item details including `commitSha`
2. Read local file content
3. POST to iterate endpoint with `baseCommitSha: item.commitSha`
4. On 409 Conflict: display clear error with guidance

```
Error: Conflict — this report was updated since your last read.
Latest version: abc1234
Run `hlx library show <ref>` to see the latest version, then retry.
```

### Admin-Gated Commands (Finding #7)

Publish, delete, and reconcile require admin role. On 403 response, display:
```
Error: Admin access required for this operation.
```

### Manual Reconcile (Finding #4)

`hlx library reconcile` calls `POST /api/admin/library/reconcile` and displays a summary:
```
Reconciled: 3 new items
Skipped: 45 (already indexed)
Errors: 0
```

This is the missed-webhook recovery valve — moved to MVP from the original Round 2 deferral.

## Technical Decisions

### Decision 1: File reading via readFileSync (unchanged)
**Chosen**: Read entire file content via `fs.readFileSync`, send as string in JSON body
**Rejected**: Multipart form upload, streaming

Rationale: Report files are typically <1MB text. JSON body aligns with existing hxFetch pattern.

### Decision 2: Content type detection from file extension (unchanged)
**Chosen**: Infer from `.md` (markdown) or `.html` (HTML) extension. Default to REPORT. Allow `--content-type` override.

### Decision 3: Fetch commitSha before iterate (NEW — Finding #6)
**Chosen**: Iterate command fetches current item to obtain commitSha, passes as `baseCommitSha`
**Rejected**: Requiring `--base-commit-sha` flag from user

Rationale: Users should not need to know about commit SHAs. CLI fetches automatically and passes in the iterate request.

### Decision 4: Reconcile as admin-only server call (NEW — Finding #4)
**Chosen**: `hlx library reconcile` calls `POST /api/admin/library/reconcile`
**Rejected**: Client-side reconciliation (CLI scanning git directly)

Rationale: Server has git access and DB access. CLI should not need git credentials or direct DB access.

## Technical Checks

[TCK-01] CLI iterate sends baseCommitSha
- Decision Reference: "Iterate command fetches current item commitSha, sends as baseCommitSha"
  (from Decision 3)
- Verification Method: code-inspection
- Expected Evidence: Iterate command fetches item details first, extracts commitSha, includes `baseCommitSha` in POST body. 409 response handled with user-friendly error message.

[TCK-02] CLI reconcile command exists
- Decision Reference: "hlx library reconcile calls POST /api/admin/library/reconcile"
  (from Decision 4)
- Verification Method: code-inspection
- Expected Evidence: 'reconcile' case in library dispatcher switch in `src/library/index.ts`. Uses hxFetch to call admin endpoint. Displays reconciled/skipped/errored counts.

[TCK-03] All 5 commands registered in dispatcher
- Decision Reference: "Five new commands following established patterns"
- Verification Method: code-inspection
- Expected Evidence: create, iterate, publish, delete, reconcile cases added to switch in `src/library/index.ts`. Each dispatches to a dedicated command function.

## Performance Expectations

| Operation | Expected Latency | Notes |
|-----------|-----------------|-------|
| create | 3-7s | File read + API call (sanitize + git branch + 2 commits + reconcile) |
| iterate | 2-5s | Item fetch + file read + API call (concurrency check + sanitize + git commit + reconcile) |
| publish | 2-5s | API call (merge branch to main) |
| delete | 1-2s | API call (hard delete + branch cleanup) |
| reconcile | 5-60s | Depends on commit count; server scans git history |

## Dependencies

- No new npm packages. Zero runtime deps maintained.
- Server endpoints (Phase 1-4) must be deployed before CLI commands are usable.

## Acceptance Criteria (Finding #14)

The iterate command must be able to re-version RSH-667 and RSH-688 via:
```
hlx library iterate RSH-688 --file reports/RSH-688/report.html
hlx library iterate RSH-667 --file reports/RSH-667/report.html
```
This replaces the continue-hack previously used and is an explicit end-to-end dogfooding criterion.

## Deferred to Round 2

- `hlx library edit <ref>` — Open content in $EDITOR
- `hlx library versions <ref>` — List version history from CLI
- `hlx library diff <ref> <version>` — Show diff between versions

## Summary Table

| Command | Server Endpoint | New/Existing | Key Pattern | Finding |
|---------|----------------|--------------|-------------|---------|
| create | POST /library/items | New endpoint | File read + hxFetch | — |
| iterate | POST /library/items/:id/iterate | New endpoint | resolveLibraryItem + baseCommitSha fetch | F6 |
| publish | POST /library/items/:id/publish | Existing | resolveLibraryItem + hxFetch | F7 (admin) |
| delete | DELETE /library/items/:id | Existing | resolveLibraryItem + hxFetch | F7 (admin) |
| reconcile | POST /admin/library/reconcile | New endpoint | hxFetch (admin) | F4 (new in MVP) |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| diagnosis/apl.json (cli) | CLI gap analysis | 5 new commands; reconcile added per F4; baseCommitSha per F6 |
| scout/reference-map.json (cli) | CLI code inventory | Dispatcher pattern; resolveLibraryItem; hxFetch; --file flag precedent |
| product/product.md (server) | Product requirements | Scenarios SCN-01, SCN-03, SCN-06, SCN-08, SCN-13, SCN-18 |
| tech-research/tech-research.md (server) | API endpoint contracts | POST /library/items, iterate with baseCommitSha, admin reconcile, 409 Conflict |
| tech-research/tech-research.md (cli — prior) | Previous iteration to revise | 4 commands → 5; added reconcile, baseCommitSha, admin gating |
