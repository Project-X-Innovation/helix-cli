# Product: Library Report Authoring — Create + Iterate/Edit

## Problem Statement

Users cannot create new library reports or iterate on existing ones without running a full workflow. The only way a library report (LibraryItem row) gets created is through the orchestrator's `createFromReport` at the end of a completed sandbox run. There is no create API, no standalone editing, and no mechanism to reconcile content committed to git with the database index. This blocks three high-value workflows: authoring reports outside the run pipeline, editing/versioning existing reports, and managing report lifecycle (publish/delete) from the CLI.

## Product Vision

Enable standalone library report authoring — create new reports and iterate on existing ones — across all surfaces (API, CLI, UI) with git as the single source of truth for content. The database becomes a queryable projection reconciled from git, unifying run-generated and manually-authored reports under one coherent model.

## Users

| User | Need |
|------|------|
| **Report authors** (analysts, researchers) | Create and iterate on reports without triggering a full workflow run |
| **Team leads / reviewers** | Publish, review, comment on, and manage report lifecycle via UI or CLI |
| **Automation / CI** | Programmatically create or update reports via API or CLI |
| **Existing run-pipeline users** | Continue using workflow-generated reports with no behavior change |

## Use Cases

1. **Author a new report from scratch** — A user writes a report (markdown or HTML) and creates a library item without needing a ticket or sandbox run.
2. **Iterate on an existing report** — A user edits a published or draft report, producing a new version tied to the same report identity.
3. **Publish a draft** — A user promotes a draft report to published, making it visible on the `main` branch.
4. **Delete a report** — A user removes a report from the library (soft-delete), cleaning up the index.
5. **View version history** — A user browses all versions of a report (both run-generated and manually-authored) in chronological order.
6. **Comment on a section** — A user leaves feedback anchored to a specific section heading; comments remain coherent when content is edited.
7. **CLI lifecycle management** — A user creates, iterates, publishes, or deletes reports from the command line.

## Core Workflow

1. User authors content (markdown or HTML) locally or in the UI editor.
2. Content is committed to the org's library git repo (via API/CLI/UI or direct push).
3. A reconciliation process detects the new commit and creates/updates the corresponding LibraryItem row in the database (idempotent, commit-SHA deduped).
4. The report appears in the library listing (draft on branch, published on `main`).
5. User can iterate (new version), publish (merge to `main`), or delete.

## Essential Features (MVP)

1. **Standalone report creation** — Create a library report from content without requiring a ticketId or runId. API, CLI, and UI entry points.
2. **Report iteration** — Create a new version of an existing report. Each version is a distinct commit; version history shows all versions (run-sourced and standalone).
3. **Git-to-DB reconciliation** — An idempotent mechanism (webhook-triggered) that detects new commits touching report files and upserts corresponding LibraryItem rows. Commit SHA used for deduplication.
4. **Stable report identity** — A `reportGroupId` (from frontmatter or sidecar metadata) that groups versions across renames, independent of ticketId.
5. **Schema migration** — Make `ticketId`/`runId` nullable; add `source` (RUN | GIT | API), `authorUserId`, `reportGroupId`, `commitSha`. Additive migration preserving all existing run-sourced items.
6. **Publish and delete from CLI** — Expose existing server publish/delete endpoints via CLI commands (`hlx library publish`, `hlx library delete`).
7. **Create and iterate from CLI** — New CLI commands (`hlx library create --file`, `hlx library iterate <ref> --file`) that send content to new server endpoints.
8. **Client UI for create/edit** — Create button on listing page, editor (leveraging existing TipTap infrastructure), iterate action on detail page.
9. **Updated client types** — Nullable `ticketId`/`runId`, new fields (`source`, `authorUserId`, `reportGroupId`) in TypeScript type definitions.

## Features Explicitly Out of Scope (MVP)

1. **Building the implementation** — This ticket produces the architecture and dev-ticket breakdown only.
2. **Egress lockdown** — Sandbox egress restrictions are a separate chain (RSH-667).
3. **Real-time collaborative editing** — Single-author editing only for MVP.
4. **Comment re-anchoring automation** — MVP defines the coherence strategy (mark-stale); automated re-anchoring is deferred.
5. **Fine-grained RBAC for library operations** — MVP relies on org membership + git repo access; granular author/admin roles are deferred.
6. **Markdown-to-HTML rendering pipeline changes** — MVP accepts content as-is (markdown or HTML); server-side rendering enhancements are deferred.
7. **Migration of existing report directory naming** — Existing `reports/{ticketShortId}/` layout remains; new standalone reports use the same directory structure with a generated ID.

## Success Criteria

| # | Criterion | Measurable By |
|---|-----------|---------------|
| 1 | Architecture decision (git-first hybrid) fully resolved | Design document covers reconciliation trigger, identity model, schema, and all 9 ticket questions |
| 2 | Schema migration defined | Additive migration spec with nullable FKs, new fields, backward-compat confirmed |
| 3 | API surface designed | Request/response contracts for create, iterate, extended versions/publish/delete |
| 4 | CLI surface designed | Command specs for create, iterate, publish, delete with flags and patterns |
| 5 | Client UI designed | Create, edit/iterate, version history surfaces spec'd with component reuse plan |
| 6 | Comment coherence strategy defined | Approach for stale-anchor handling documented |
| 7 | Permissions model designed | Git-repo-access + app-auth reconciliation documented |
| 8 | Dev-ticket breakdown produced | Dependency-ordered implementation chain covering all repos |
| 9 | Backward compatibility preserved | Existing run-sourced items continue working unchanged in the design |

## User Scenarios

[SCN-01] Create a new standalone report via CLI
- Precondition: User is authenticated with `hlx` CLI and belongs to an org with a library repo
- Action: User runs `hlx library create --file report.md --title "Q2 Analysis"` with a local markdown file
- Expected Outcome: A new library report appears in the library listing as a draft with the given title; the content is committed to the org's library git repo

[SCN-02] Create a new standalone report via UI
- Precondition: User is logged in and on the library listing page
- Action: User clicks the create button, enters a title, writes content in the editor, and saves
- Expected Outcome: A new draft report appears in the library listing with the authored content

[SCN-03] Iterate on an existing report via CLI
- Precondition: A library report exists (run-sourced or standalone)
- Action: User runs `hlx library iterate RSH-599 --file updated-report.md` referencing the report by ticket short ID or title
- Expected Outcome: A new version of the report is created; version history shows the previous and new versions

[SCN-04] Iterate on an existing report via UI
- Precondition: User is viewing a library report detail page
- Action: User clicks an edit/iterate action, modifies content in the editor, and saves
- Expected Outcome: A new version appears in the version history; the previous version remains accessible

[SCN-05] Publish a draft report via CLI
- Precondition: A draft report exists in the library
- Action: User runs `hlx library publish <ref>` referencing the draft report
- Expected Outcome: The report status changes to published; content is available on the `main` branch

[SCN-06] Delete a report via CLI
- Precondition: A report exists in the library
- Action: User runs `hlx library delete <ref>` referencing the report
- Expected Outcome: The report is removed from the library listing; the underlying content is cleaned up

[SCN-07] View version history including run-sourced and standalone versions
- Precondition: A report has multiple versions (some from workflow runs, some from manual edits)
- Action: User navigates to the report detail page and views version history
- Expected Outcome: All versions are listed chronologically with source labels (run vs. manual), and the user can view any prior version

[SCN-08] Git push triggers automatic DB reconciliation
- Precondition: A user or CI system commits a new report file directly to the library git repo
- Action: The commit is pushed to the repo, triggering a webhook
- Expected Outcome: A corresponding LibraryItem row is created (or updated) in the database without any manual API call; duplicate webhook deliveries do not create duplicate rows

[SCN-09] Comment remains visible after report content is edited
- Precondition: A section-anchored comment exists on a report
- Action: The report is iterated with content changes that modify section headings
- Expected Outcome: The existing comment is displayed with a stale indicator if its anchor section was changed; it is not silently lost

[SCN-10] Existing run-generated reports continue working
- Precondition: Reports created by the workflow run pipeline exist in the library
- Action: User views, publishes, or comments on a run-generated report
- Expected Outcome: All existing behaviors (view, publish, delete, export, comment) work identically with no regressions

[SCN-11] Create report via API
- Precondition: An authenticated API client with valid org credentials
- Action: Client sends `POST /library/items` with title and content
- Expected Outcome: A new draft library item is created and returned with an assigned ID; content is committed to git

## Key Design Principles

1. **Git is the source of truth for content** — The database is a queryable projection reconciled from git state. All authoring paths produce git commits.
2. **Idempotent reconciliation** — Webhook re-deliveries and duplicate events must not create duplicate versions. Commit SHA is the dedup key.
3. **Stable identity across renames** — A `reportGroupId` in content metadata (frontmatter or sidecar) ensures version lineage survives file renames.
4. **Additive, backward-compatible changes** — Existing run-sourced items must continue working. New fields and nullable FKs are additive; no destructive migration.
5. **Unified version model** — Run-sourced and standalone-authored versions coexist in the same version history, distinguished by `source` field.

## Scope & Constraints

- **Repos in scope for design**: helix-global-server (schema, API, reconciliation), helix-global-client (types, hooks, UI), helix-cli (new commands). The library repo needs convention definitions (metadata format, directory layout) but no code changes.
- **Deliverable**: Architecture document + dependency-ordered dev-ticket breakdown. No implementation in this ticket.
- **Constraint — deployed schema**: The LibraryItem migration is deployed (2026-05-08). Schema changes must be additive (ALTER nullable, ADD columns) with no data loss.
- **Constraint — dual branch conventions**: Two branch patterns coexist (`helix/ticket/{id}` and `report/{ticketId}`). The design must work with both and define the convention for standalone-authored reports.
- **Constraint — comment sidecar sync**: Comments are synced to git as JSON sidecars on the draft branch. Published items (branch=null) do not sync. The design must account for this boundary.

## Future Considerations

- **Automated comment re-anchoring**: Use content diffing to remap section slugs when headings change, rather than just marking stale.
- **Fine-grained RBAC**: Author vs. reviewer vs. admin roles for library operations, beyond org-membership checks.
- **Real-time collaborative editing**: Multi-user simultaneous editing with conflict resolution.
- **Server-side markdown rendering**: Render markdown to HTML on the server for consistent output across surfaces.
- **Template system**: Pre-built report templates for common report types.
- **Search and tagging**: Full-text search and tag-based filtering across the library.

## Open Questions / Risks

| # | Question / Risk | Impact |
|---|-----------------|--------|
| 1 | **Production deployment status unclear** — Inspection role lacks SELECT on LibraryItem/LibraryComment tables; cannot confirm active usage volume | Migration rollout plan may need extra caution if tables have significant production data |
| 2 | **Webhook reliability** — GitHub webhook delivery is at-least-once; missed webhooks could leave git and DB out of sync | Need fallback reconciliation (periodic cron or on-read check) as a safety net |
| 3 | **Frontmatter vs. sidecar for metadata** — No convention exists today; introducing one affects all authoring paths and backward compat | Wrong choice increases complexity; sidecar meta.json may be simpler for HTML files that lack a natural frontmatter format |
| 4 | **Comment anchor stability** — Section slugs are derived from heading text; any heading edit breaks anchors | Mark-stale strategy is MVP, but user experience may suffer if edits are frequent |
| 5 | **Content format (markdown vs. HTML)** — Reports exist in both formats today; editor must handle or normalize | Need clear decision on authoring format vs. storage format |
| 6 | **Permissions gap between git and app** — Git repo access controls who can push; app auth controls who can call API endpoints. These could diverge | Must define which layer is authoritative for each operation |
| 7 | **prisma/migrations/ directory is empty in checkout** — Migrations may be managed outside this checkout or cleaned up | Schema migration strategy needs verification before implementation |
| 8 | **Delete semantics** — File removal in git vs. soft-delete in DB vs. tombstone; interaction with published content on `main` | Need clear lifecycle state machine before implementation |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (helix-global-server) | Ticket requirements and 9 architectural questions | Git-first hybrid recommended; 9 concrete design decisions to resolve; this is a research/design-only ticket |
| scout/scout-summary.md (helix-global-server) | Server architecture analysis | createFromReport is sole creation path; no webhook handler; dual branch conventions; migration via prisma migrate deploy |
| scout/reference-map.json (helix-global-server) | Server code inventory and facts | Non-nullable ticketId/runId FKs; publishItem merges branch to main; getItemVersions groups by ticketId; comment git sync debounced 5s |
| diagnosis/diagnosis-statement.md (helix-global-server) | Root cause analysis of 6 architectural gaps | Schema constraints, orchestrator-only creation, no reconciliation, ticket-coupled versions, no metadata conventions, no comment re-anchoring |
| diagnosis/apl.json (helix-global-server) | 9 diagnostic questions with evidence | Confirmed all gaps with code references and runtime evidence; schema migration details defined |
| scout/scout-summary.md (helix-global-client) | Client UI analysis | No create/edit UI; TipTap 3.22 available; comment anchor system has no stale handling |
| diagnosis/diagnosis-statement.md (helix-global-client) | Client gap analysis | Types enforce non-nullable ticketId/runId; missing API hooks and UI surfaces; depends on server changes |
| diagnosis/apl.json (helix-global-client) | Client diagnostic answers | Type changes needed; TipTap reusable for authoring; no stale anchor UI |
| scout/scout-summary.md (helix-cli) | CLI command analysis | list/show/comments only; dispatcher + hxFetch pattern; resolve-library-item reusable |
| diagnosis/diagnosis-statement.md (helix-cli) | CLI gap analysis | 4 missing commands; publish/delete can use existing endpoints; create/iterate need new server endpoints |
| diagnosis/apl.json (helix-cli) | CLI diagnostic answers | Patterns for new commands established; file handling precedent in show command |
| scout/scout-summary.md (library) | Content repo analysis | Pure content, no code; no frontmatter/meta.json; auto-created by server |
| diagnosis/diagnosis-statement.md (library) | Content convention gap analysis | No report identity in content; ticket-coupled directory layout; no webhook config |
| diagnosis/apl.json (library) | Library diagnostic answers | Convention changes only (no code); frontmatter or sidecar needed for stable identity |
| repo-guidance.json (library run root) | Repo intent classification | server/client/CLI are targets; library is context-only (convention definitions, no code changes) |
| /tmp/helix-inspect/manifest.json | Runtime inspection availability | DATABASE and LOGS available for helix-global-server; used by diagnosis to confirm table deployment |
