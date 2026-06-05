# Product: Library Report Authoring — Create + Iterate/Edit (Revision 2)

## Problem Statement

Users cannot create new library reports or iterate on existing ones without running a full workflow. The only way a library report (LibraryItem row) gets created is through the orchestrator's `createFromReport` at the end of a completed sandbox run. There is no create API, no standalone editing, and no mechanism to reconcile content committed to git with the database index. This blocks three high-value workflows: authoring reports outside the run pipeline, editing/versioning existing reports, and managing report lifecycle (publish/delete) from the CLI.

Additionally, the first iteration of this design surfaced two **gating defects**: (1) zero server-side HTML sanitization — user-authored reports are rendered into other org members' browsers and returned raw by the CLI, creating a stored XSS vulnerability; (2) the proposed `commitSha` unique constraint was globally scoped, but a single git push can touch multiple report files, each needing its own DB row with the same commit SHA. Both must be resolved before implementation proceeds.

## Product Vision

Enable standalone library report authoring — create new reports and iterate on existing ones — across all surfaces (API, CLI, UI) with git as the single source of truth for content. The database becomes a queryable projection reconciled from git via a single, shared reconcile function, unifying run-generated and manually-authored reports under one coherent, secure model. All user-authored HTML is sanitized on ingest to prevent stored XSS.

## Users

| User | Need |
|------|------|
| **Report authors** (analysts, researchers) | Create and iterate on reports without triggering a full workflow run |
| **Org admins** | Publish, delete, and manage report lifecycle; audit who changed what |
| **Team leads / reviewers** | Review, comment on, and track report versions via UI or CLI |
| **Automation / CI** | Programmatically create or update reports via API or CLI |
| **Git-first authors** | Push report content directly to the library git repo and have it indexed automatically |
| **Existing run-pipeline users** | Continue using workflow-generated reports with no behavior change |

## Use Cases

1. **Author a new report from scratch** — A user writes a report (markdown or HTML) and creates a library item without needing a ticket or sandbox run.
2. **Iterate on an existing report** — A user edits a published or draft report, producing a new version tied to the same report identity. Concurrent edits are detected and rejected to prevent lost updates.
3. **Publish a draft** — An admin promotes a draft report to published, making it visible on the `main` branch.
4. **Delete a report** — An admin removes a report from the library (soft-delete), cleaning up the index.
5. **View version history** — A user browses all versions of a report (both run-generated and manually-authored) in chronological order.
6. **Comment on a section** — A user leaves feedback anchored to a specific section heading; comments remain coherent when content is edited.
7. **CLI lifecycle management** — A user creates, iterates, publishes, deletes, or reconciles reports from the command line.
8. **Git-first authoring** — A user pushes content directly to the library git repo; the system automatically indexes it via webhook, with directory name as fallback identity when no `meta.json` exists.
9. **Manual reconciliation** — An admin triggers a reconcile to recover from missed webhooks, ensuring git and DB are in sync.
10. **Audit trail** — An admin reviews who created, iterated, published, or deleted a report and when.

## Core Workflow

1. User authors content (markdown or HTML) locally or in the UI editor.
2. Content is committed to the org's library git repo (via API/CLI/UI or direct push). Server-side HTML sanitization is applied on ingest.
3. The **same `reconcile(commitSha)` function** is called — whether triggered by the GitHub push webhook, invoked synchronously after an API/CLI/UI commit, or run manually via `hlx library reconcile`. This single projection function creates/updates corresponding LibraryItem rows idempotently, deduped by `(reportGroupId, commitSha)`.
4. The report appears in the library listing (draft on branch, published on `main`). An audit log entry is written.
5. User can iterate (new version with optimistic concurrency check), admin can publish (merge to `main`) or delete.
6. If a partial failure occurs (git commit succeeds but DB write fails), the webhook or a manual reconcile self-heals the gap.

## Essential Features (MVP)

1. **Server-side HTML sanitization** — All user-authored HTML is sanitized on ingest (create/iterate) to prevent stored XSS. Client-side DOMPurify remains as defense-in-depth. *(Gating defect #1)*
2. **Standalone report creation** — Create a library report from content without requiring a ticketId or runId. API, CLI, and UI entry points.
3. **Report iteration with optimistic concurrency** — Create a new version of an existing report. Iterate requires a `baseCommitSha`; stale writes are rejected with 409 Conflict to prevent lost updates and branch races. *(Finding #6)*
4. **Single reconcile function** — ONE `reconcile(commitSha)` function used by all paths: webhook handler, API/CLI/UI post-commit, and manual reconcile. Self-healing on partial failure. *(Finding #3)*
5. **Webhook-triggered git-to-DB reconciliation** — GitHub push webhook detects new commits touching report files and calls the reconcile function. HMAC-verified, with payload-size bounds, per-push fan-out limits, and rate limiting. *(Finding #11)*
6. **Manual reconcile in MVP** — `hlx library reconcile` CLI command and/or `POST /admin/library/reconcile` endpoint as the missed-webhook recovery valve. *(Finding #4)*
7. **Stable report identity** — A `reportGroupId` (from sidecar `meta.json` or directory name fallback) that groups versions across renames, independent of ticketId. Direct pushes without `meta.json` default to directory name as `reportGroupId`. *(Finding #12)*
8. **Schema migration** — Make `ticketId`/`runId` nullable; add `source` (RUN | GIT | API), `authorUserId`, `reportGroupId`, `commitSha`. `commitSha` uniqueness is `@@unique([reportGroupId, commitSha])` (composite, not global). Backfill batched to avoid long locks; rollback plan documented. *(Gating defect #2, Finding #9)*
9. **Cross-org safety** — Webhook handler binds repository to org via EXACT `html_url` match; `reportGroupId` scoped per org. Attacker-controlled `meta.json` on a direct push cannot cross org boundaries. *(Finding #5)*
10. **Admin-gated publish and delete** — Publish and delete require admin role; create and iterate remain open to org members. *(Finding #7)*
11. **Authoring audit trail** — All authoring actions (create, iterate, publish, delete) are logged with who + when, mirroring the existing audit log pattern. *(Finding #10)*
12. **Publish and delete from CLI** — Expose existing server publish/delete endpoints via CLI commands (`hlx library publish`, `hlx library delete`).
13. **Create and iterate from CLI** — New CLI commands (`hlx library create --file`, `hlx library iterate <ref> --file`) that send content to new server endpoints.
14. **Client UI for create/edit** — Create button on listing page, editor (leveraging existing TipTap infrastructure), iterate action on detail page. Publish/delete buttons visible only to admins.
15. **Updated client types** — Nullable `ticketId`/`runId`, new fields (`source`, `authorUserId`, `reportGroupId`, `commitSha`) in TypeScript type definitions. 409 Conflict handling for iterate.
16. **Verification ticket** — A dedicated ticket in the implementation chain that live-tests: webhook-to-row creation, one commit touching two reports, concurrent iterate race, and `<script>` payload sanitization — all before enabling. *(Finding #8)*
17. **Egress migration coordination** — New library migration timestamp coordinated with the in-flight egress migration chain to avoid ordering collisions. *(Finding #13)*

## Features Explicitly Out of Scope (MVP)

1. **Building the implementation** — This ticket produces the architecture and dev-ticket breakdown only.
2. **Egress lockdown** — Sandbox egress restrictions are a separate chain (RSH-667).
3. **Real-time collaborative editing** — Single-author editing only for MVP.
4. **Comment re-anchoring automation** — MVP defines the coherence strategy (mark-stale); automated re-anchoring is deferred.
5. **Markdown-to-HTML rendering pipeline changes** — MVP accepts content as-is (markdown or HTML); server-side rendering enhancements are deferred.
6. **Migration of existing report directory naming** — Existing `reports/{ticketShortId}/` layout remains; new standalone reports use the same directory structure with a generated ID.
7. **Periodic cron reconcile** — MVP has manual reconcile (`hlx library reconcile`); automated periodic cron is deferred.

## Success Criteria

| # | Criterion | Measurable By |
|---|-----------|---------------|
| 1 | Architecture decision (git-first hybrid) fully resolved | Design document covers reconciliation trigger, identity model, schema, and all 9 ticket questions |
| 2 | Schema migration defined with batch safety | Additive migration spec with nullable FKs, new composite unique constraint, batched backfill, and rollback plan |
| 3 | HTML sanitization designed | Server-side sanitization on ingest specified; client DOMPurify retained as defense-in-depth |
| 4 | API surface designed with concurrency control | Request/response contracts for create, iterate (with baseCommitSha), reconcile, extended versions/publish/delete |
| 5 | CLI surface designed | Command specs for create, iterate, publish, delete, reconcile with flags and patterns |
| 6 | Client UI designed with admin gating | Create, edit/iterate, version history surfaces spec'd; publish/delete admin-only |
| 7 | Comment coherence strategy defined | Approach for stale-anchor handling documented |
| 8 | Permissions model designed with admin tiers | Admin-gated publish/delete; member-level create/iterate; cross-org safety documented |
| 9 | Audit trail designed | Authoring actions logged with who + when, pattern documented |
| 10 | Webhook hardened | HMAC + payload-size + fan-out + rate-limit constraints specified |
| 11 | Dev-ticket breakdown produced with verification | Dependency-ordered chain covering all repos plus a verification ticket |
| 12 | Backward compatibility preserved | Existing run-sourced items continue working unchanged in the design |
| 13 | Dogfood acceptance test defined | RSH-667 and RSH-688 re-versioned via `hlx library iterate --file` as explicit end-to-end criterion |
| 14 | Migration coordination documented | New migration timestamp avoids collision with in-flight egress chain |

## User Scenarios

[SCN-01] Create a new standalone report via CLI
- Precondition: User is authenticated with `hlx` CLI and belongs to an org with a library repo
- Action: User runs `hlx library create --file report.md --title "Q2 Analysis"` with a local markdown file
- Expected Outcome: A new library report appears in the library listing as a draft with the given title; the content is committed to the org's library git repo; an audit log entry records the creation

[SCN-02] Create a new standalone report via UI
- Precondition: User is logged in and on the library listing page
- Action: User clicks the create button, enters a title, writes content in the editor, and saves
- Expected Outcome: A new draft report appears in the library listing with the authored content

[SCN-03] Iterate on an existing report via CLI
- Precondition: A library report exists (run-sourced or standalone)
- Action: User runs `hlx library iterate RSH-599 --file updated-report.md` referencing the report by ticket short ID
- Expected Outcome: A new version of the report is created; version history shows the previous and new versions; an audit log entry records the iteration

[SCN-04] Iterate on an existing report via UI
- Precondition: User is viewing a library report detail page
- Action: User clicks an edit/iterate action, modifies content in the editor, and saves
- Expected Outcome: A new version appears in the version history; the previous version remains accessible

[SCN-05] Concurrent edit is rejected
- Precondition: Two users load the same report version simultaneously and both begin editing
- Action: User A saves their changes; User B then attempts to save their changes based on the same original version
- Expected Outcome: User A's save succeeds; User B receives a conflict error indicating the report was updated since they started editing, and is prompted to reload before retrying

[SCN-06] Admin publishes a draft report via CLI
- Precondition: A draft report exists in the library; user has admin role
- Action: User runs `hlx library publish <ref>` referencing the draft report
- Expected Outcome: The report status changes to published; content is available on the `main` branch; an audit log entry records the publish

[SCN-07] Non-admin user cannot publish or delete
- Precondition: A draft report exists; user is an org member but not an admin
- Action: User attempts to publish or delete the report via CLI, API, or UI
- Expected Outcome: The action is denied; publish and delete buttons are not visible in the UI; CLI/API returns a permission error

[SCN-08] Delete a report via CLI
- Precondition: A report exists in the library; user has admin role
- Action: User runs `hlx library delete <ref>` referencing the report
- Expected Outcome: The report is removed from the library listing; an audit log entry records the deletion

[SCN-09] View version history including run-sourced and standalone versions
- Precondition: A report has multiple versions (some from workflow runs, some from manual edits)
- Action: User navigates to the report detail page and views version history
- Expected Outcome: All versions are listed chronologically with source labels (run vs. manual), and the user can view any prior version

[SCN-10] Git push triggers automatic DB reconciliation
- Precondition: A user or CI system commits a new report file directly to the library git repo
- Action: The commit is pushed to the repo, triggering a webhook
- Expected Outcome: A corresponding LibraryItem row is created in the database without any manual API call; duplicate webhook deliveries do not create duplicate rows

[SCN-11] Single push touching multiple reports creates one row per report
- Precondition: A user commits changes to two different report directories in a single git push
- Action: The push is received by the webhook handler
- Expected Outcome: One LibraryItem row is created per affected report directory, both sharing the same commit SHA; no uniqueness violation occurs

[SCN-12] Direct git push without meta.json
- Precondition: A user pushes a new report directory to the library repo without including a `meta.json` sidecar
- Action: The webhook fires for the push
- Expected Outcome: The system uses the directory name as the `reportGroupId` and indexes the report successfully; title is derived from content

[SCN-13] Manual reconcile recovers from missed webhook
- Precondition: A report was pushed to git but the webhook was missed; the DB is missing the corresponding row
- Action: Admin runs `hlx library reconcile` from the CLI
- Expected Outcome: The reconcile scans the git repo, detects the unindexed report, and creates the missing DB row

[SCN-14] Malicious HTML is sanitized on ingest
- Precondition: User is authenticated and authorized to create/iterate a report
- Action: User submits report content containing `<script>alert('xss')</script>` or other malicious HTML
- Expected Outcome: The script tag is stripped before content is stored; other org members viewing the report in the UI or retrieving it via CLI/API see sanitized HTML only

[SCN-15] Comment remains visible after report content is edited
- Precondition: A section-anchored comment exists on a report
- Action: The report is iterated with content changes that modify section headings
- Expected Outcome: The existing comment is displayed with a stale indicator if its anchor section was changed; it is not silently lost

[SCN-16] Existing run-generated reports continue working
- Precondition: Reports created by the workflow run pipeline exist in the library
- Action: User views, publishes, or comments on a run-generated report
- Expected Outcome: All existing behaviors (view, publish, delete, export, comment) work identically with no regressions

[SCN-17] Create report via API
- Precondition: An authenticated API client with valid org credentials
- Action: Client sends `POST /library/items` with title and content
- Expected Outcome: A new draft library item is created and returned with an assigned ID; content is committed to git; HTML is sanitized

[SCN-18] Dogfood: re-version this design report via iterate
- Precondition: RSH-688 and RSH-667 reports exist in the library
- Action: User runs `hlx library iterate RSH-688 --file reports/RSH-688/report.html`
- Expected Outcome: A new version of the RSH-688 report is created cleanly via the iterate command, replacing the continue-hack previously used to update design reports

## Key Design Principles

1. **Git is the source of truth for content** — The database is a queryable projection reconciled from git state. All authoring paths produce git commits; the DB is never written directly.
2. **Single projection function** — ONE `reconcile(commitSha)` function produces DB rows from git commits. Webhook, API post-commit, and manual reconcile all invoke it. Self-healing on partial failure.
3. **Idempotent reconciliation** — Webhook re-deliveries and duplicate events must not create duplicate versions. `(reportGroupId, commitSha)` is the dedup key.
4. **Security by default** — Server-side HTML sanitization on ingest prevents stored XSS. Client-side DOMPurify is defense-in-depth, not the primary layer.
5. **Stable identity across renames** — A `reportGroupId` in content metadata (sidecar `meta.json`) ensures version lineage survives file renames; directory name is the fallback.
6. **Additive, backward-compatible changes** — Existing run-sourced items must continue working. New fields and nullable FKs are additive; no destructive migration.
7. **Unified version model** — Run-sourced and standalone-authored versions coexist in the same version history, distinguished by `source` field.
8. **Least privilege** — Publish and delete require admin role; create/iterate are open to org members. Cross-org boundaries are strictly enforced.

## Scope & Constraints

- **Repos in scope for design**: helix-global-server (schema, API, reconciliation, sanitization, audit trail), helix-global-client (types, hooks, UI, admin gating), helix-cli (new commands including reconcile). The library repo needs convention definitions (metadata format, directory layout) but no code changes.
- **Deliverable**: Architecture document + dependency-ordered dev-ticket breakdown including a verification ticket. No implementation in this ticket.
- **Constraint — deployed schema**: The LibraryItem migration is deployed (2026-05-08). Schema changes must be additive (ALTER nullable, ADD columns) with no data loss.
- **Constraint — migration safety**: Table size is unknown (inspection role lacks SELECT). Backfill must be batched to avoid long locks; rollback plan required.
- **Constraint — egress migration coordination**: Latest migration timestamp is `20260603100000`. The new library migration must use a later timestamp and coordinate with the in-flight egress chain (RSH-667) on helix-global-server to avoid ordering collisions.
- **Constraint — dual branch conventions**: Two branch patterns coexist (`helix/ticket/{id}` and `report/{ticketId}`). The design must work with both and define the convention for standalone-authored reports.
- **Constraint — comment sidecar sync**: Comments are synced to git as JSON sidecars on the draft branch. Published items (branch=null) do not sync. The design must account for this boundary.
- **Constraint — cross-org isolation**: Repository-to-org binding must use EXACT `html_url` match. `reportGroupId` is scoped per org. A direct push must never be able to create items in another org's namespace.

## Future Considerations

- **Automated comment re-anchoring**: Use content diffing to remap section slugs when headings change, rather than just marking stale.
- **Periodic cron reconcile**: Automated scheduled reconciliation beyond the manual MVP valve.
- **Real-time collaborative editing**: Multi-user simultaneous editing with conflict resolution.
- **Server-side markdown rendering**: Render markdown to HTML on the server for consistent output across surfaces.
- **Template system**: Pre-built report templates for common report types.
- **Search and tagging**: Full-text search and tag-based filtering across the library.

## Open Questions / Risks

| # | Question / Risk | Impact | Source |
|---|-----------------|--------|--------|
| 1 | **Migration table size unknown** — Inspection role lacks SELECT on LibraryItem; cannot confirm row count or active usage volume | Backfill UPDATE must be batched; confirm size before deploy; rollback plan needed | Finding #9 |
| 2 | **Webhook reliability + recovery** — GitHub webhook delivery is at-least-once; missed webhooks leave git and DB out of sync | Manual reconcile (`hlx library reconcile`) is the MVP recovery valve; periodic cron deferred | Finding #4 |
| 3 | **Egress migration ordering** — RSH-667 egress chain may have parallel Prisma migrations on helix-global-server | Must coordinate timestamps at merge time; use a gap timestamp to leave room | Finding #13 |
| 4 | **Comment anchor stability** — Section slugs are derived from heading text; any heading edit breaks anchors | Mark-stale strategy is MVP, but user experience may suffer if edits are frequent | Original |
| 5 | **Content format (markdown vs. HTML)** — Reports exist in both formats today; editor must handle or normalize | Need clear decision on authoring format vs. storage format | Original |
| 6 | **Sanitization library choice** — Must select a server-side HTML sanitizer (e.g., sanitize-html, isomorphic-dompurify) that balances security and content preservation | Overly aggressive sanitization could strip valid report markup; underly aggressive leaves XSS vectors | Finding #1 |
| 7 | **Delete semantics** — File removal in git vs. soft-delete in DB vs. tombstone; interaction with published content on `main` | Need clear lifecycle state machine before implementation | Original |
| 8 | **Webhook fan-out abuse** — An attacker could craft a push touching many report directories, causing excessive git reads in the reconcile function | Per-push fan-out limit and rate limiting required | Finding #11 |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (library run root) | Ticket requirements, 9 arch questions, 14 review findings in continuation context | Git-first hybrid confirmed; 2 GATING defects + 12 hardening findings define this revision |
| diagnosis/diagnosis-statement.md (helix-global-server) | Revised root cause analysis with 14 findings | Zero HTML sanitization (GATING), global commitSha unique (GATING), single reconcile path, admin gating, audit trail, webhook hardening |
| diagnosis/apl.json (helix-global-server) | 14 diagnostic questions with evidence | Confirmed all defects with exact code references (library-service.ts:147-202, middleware.ts:83-90, schema.prisma:713-726) |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI-specific finding impacts | Reconcile command in MVP (#4), iterate needs baseCommitSha (#6), acceptance test via iterate (#14) |
| diagnosis/apl.json (helix-cli) | CLI diagnostic answers | 5 new commands; reconcile added; hxFetch + resolve-library-item patterns reusable |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client-specific finding impacts | Admin gating for publish/delete (#7), optimistic concurrency in iterate hooks (#6), type widening |
| diagnosis/apl.json (helix-global-client) | Client diagnostic answers | isAdmin available but unused; commitSha missing from types; DOMPurify exists as defense-in-depth |
| diagnosis/diagnosis-statement.md (library) | Content repo convention impacts | No meta.json in 22 dirs; directory name fallback for reportGroupId (#12); acceptance test content (#14) |
| scout/scout-summary.md (helix-global-server) | Server code analysis for all 14 findings | No sanitization lib in package.json; InspectionAuditLog pattern at schema:713-726; requireAdmin at middleware:83-90 |
| scout/scout-summary.md (helix-cli) | CLI command analysis | list/show/comments only; dispatcher + hxFetch + flag-parsing patterns established |
| scout/scout-summary.md (helix-global-client) | Client UI analysis | No create/edit UI; TipTap 3.22 available; DOMPurify at annotated-html-renderer.tsx:69 |
| scout/scout-summary.md (library) | Content repo inventory | 22 report dirs, no meta.json, all named by ticket short ID |
