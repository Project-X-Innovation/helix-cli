# Ticket Context

- ticket_id: cmq0dxdbk00vyk70uyh0ozbgn
- short_id: RSH-688
- run_id: cmq1c6zsw000rl80t8mincr9v
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

## Discussion
- **Helix** (2026-06-05T04:50:05.484Z) [Agent]: Your research report is ready!

## Continuation Context
Revise this design into a new iteration that incorporates the following review findings. Keep the existing structure and all correct content; apply these changes and update the affected sections (schema, reconciliation, API, permissions, risk, dev-ticket breakdown). Treat #1 and #2 as GATING defects.

1. SECURITY (gating) — HTML sanitization: reports are user-authored HTML rendered into other org members browsers (and returned raw by `library show --full`). Add server-side sanitization on render or ingest to prevent stored XSS. Not Round 2.
2. SCHEMA BUG (gating) — commitSha must NOT be globally @unique: one git push can touch multiple report files, needing one DB row per report. Change to @@unique([reportGroupId, commitSha]); the reconcile dedup key becomes (reportGroupId, commitSha).
3. Collapse the synchronous dual-write into ONE path: API/CLI/UI commit to git, then call the SAME reconcile(commitSha) the webhook uses. One projection function; self-healing on partial failure (git commit ok, DB write fails -> webhook/retry heals).
4. Move a manual/cron reconcile into MVP (e.g. `hlx library reconcile` or an admin endpoint) as the missed-webhook recovery valve, not Round 2.
5. Cross-org safety: strictly bind repository->org via EXACT html_url match and scope reportGroupId per org; never let an attacker-controlled meta.json on a direct push cross org boundaries.
6. Optimistic concurrency on iterate: require an expected baseCommitSha/version and reject stale writes to prevent lost updates and branch races on concurrent edits.
7. Gate publish and delete behind admin (requireAdmin), not just org membership; drafting/iterating can stay open to members.
8. Add a VERIFICATION ticket to the chain: live-test webhook->row, ONE commit touching TWO reports (this would have caught defect #2 empirically), concurrent iterate, and that a <script> payload is sanitized — before enabling.
9. Migration safety: table size is unknown (inspection role lacks SELECT). Confirm size before deploy and BATCH the reportGroupId backfill UPDATE to avoid long locks; include a rollback plan.
10. Add an authoring AUDIT TRAIL (create/iterate/publish/delete -> who + when), mirroring the EgressAuditLog pattern.
11. Harden the webhook beyond HMAC: payload-size and per-push fan-out bounds + rate limiting (the reconcile does a git read per affected report directory).
12. Direct-push without meta.json: define the fallback (directory name as reportGroupId) or require meta.json and document it for git-first authoring.
13. Coordinate with the in-flight egress migration chain on helix-global-server (two Prisma migrations) to avoid ordering collisions.
14. Acceptance test: the feature must cleanly re-version RSH-667 and RSH-688 themselves via `hlx library iterate --file` (replacing the continue-hack used to update them). Make that an explicit end-to-end acceptance criterion.

Reproduce the full report with these incorporated.
