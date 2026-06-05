# Ticket Context

- ticket_id: cmq0dxdbk00vyk70uyh0ozbgn
- short_id: RSH-688
- run_id: cmq0dxdc600w3k70u22088fuw
- run_branch: helix/research/RSH-688-research-design-library-report-authoring-create
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Research/Design: Library report authoring — create + iterate/edit (git-first, coherent)

## Description
# Research/Design: Library report authoring — create + iterate/edit, coherent across all moving parts

Design a coherent capability to **add new library reports** and **iterate/edit existing ones (new versions)** — today neither is possible without a full workflow run (no create API, no git→DB sync; only the orchestrator's `createFromReport` makes a row). Produce the architecture + a dev-ticket breakdown. RESEARCH/design (this report itself dogfoods the feature). Reference: RSH-667. All three core repos attached for end-to-end design + testing.

## Current reality (verified)
- A library report = a `LibraryItem` DB row (REQUIRES `ticketId` + `runId`) + HTML content in the org's git repo (`libraryRepoUrl`) at `filePath`/branch; published reads `main`, drafts read the branch.
- Rows are created ONLY by `createFromReport` at the end of a run. **No git→DB sync, no create API.** `getItemVersions` groups versions by `ticketId`+`createdAt`. `publish`/`delete`/`list`/`get`/`comments` endpoints exist; CLI exposes only `list`/`show`/`comments`. `LibraryComment` is section-slug-anchored.

## THE central architectural decision to resolve
**git-first vs API-first vs hybrid.** Strongly evaluate the recommended hybrid:
> **Git is the source of truth for content; the DB `LibraryItem` is a projection reconciled from git via a push webhook. The API/CLI/UI author by producing git commits — they never write the index directly.** This unifies both routes (one source of truth) and makes git history the version lineage.

Resolve concretely:
1. **Reconcile trigger** — GitHub push webhook (real-time) vs periodic cron vs on-read. Must be **idempotent** (commit-SHA dedup) so redeliveries don't create duplicate versions.
2. **Auto-version detection** — a new commit touching a report file = a new version; commit SHA = version key; **draft branch = DRAFT versions, merge to `main` = publish**. Confirm this maps onto the existing `getItemVersions` + `publishItem` (main=published) model.
3. **Stable report identity** — an `id` in frontmatter / sidecar `meta.json` so renames don't break lineage; this becomes `reportGroupId`.
4. **Metadata source** — title/status/contentType from frontmatter / sidecar / derived `<h1>` (deterministic from the repo).
5. **Schema** — make `ticketId`/`runId` nullable; add `source` (RUN | GIT | API) + `authorUserId` + `reportGroupId`; keep run-sourced items working (additive migration).
6. **Comment coherence** — `LibraryComment` is section-anchored; define re-anchoring vs mark-stale when an edit changes sections (applies to ANY authoring path).
7. **Permissions** — if git-first, "who can commit/merge" (repo access) is the auth model; reconcile with app admin/author roles. Define create/iterate/publish/delete authority.
8. **Surfaces** — API (`POST /library/items`, `POST /library/items/:id/iterate`, extend publish/delete/versions), CLI (`hlx library create --file`, `iterate <ref> --file`, `publish`, `delete`), client UI (author/edit, version history, publish). Decide whether content is authored as HTML or markdown→HTML rendered.
9. **Delete / lifecycle** — file removal → soft-delete row? tombstones? interaction with published `main`.

## Deliverable
The chosen architecture (git-first hybrid or alternative, with rationale), the coherence invariants (esp. idempotent reconcile, identity stability, comment handling), the schema migration, the API/CLI/client surfaces, permissions, backwards-compat, and a dependency-ordered dev-ticket breakdown for the implementation chain.

## Out of scope
Building it (follows as an implementation chain `--implement-from` this design); the egress lockdown (separate chain).

## Referenced Tickets

1 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### RSH-667: Sandbox Egress Lockdown — Live Verification & Verified Allowlists
- Mode: RESEARCH | Status: QUEUED
- Completed runs: 1 (run-1)
- Materialized files: 14 artifacts
- Path: `.helix-refs/RSH-667/`
- Manifest: `.helix-refs/RSH-667/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
