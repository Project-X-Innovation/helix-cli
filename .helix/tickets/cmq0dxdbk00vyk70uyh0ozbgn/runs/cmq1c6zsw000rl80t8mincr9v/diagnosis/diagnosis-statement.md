# Diagnosis Statement (Revised — 14 Review Findings Incorporated)

## Problem Summary

The CLI currently has read-only library commands (list, show, comments). Three review findings directly affect the CLI: finding #4 adds `hlx library reconcile` as a new MVP command (was deferred to Round 2), finding #14 requires `hlx library iterate --file` to re-version RSH-667 and RSH-688 as an end-to-end acceptance criterion, and finding #6 requires the iterate command to pass `baseCommitSha` for optimistic concurrency.

## Root Cause Analysis

### New MVP Scope from Review Findings

1. **Reconcile command (Finding #4)**: `hlx library reconcile` must be in MVP as the missed-webhook recovery valve. Calls `POST /admin/library/reconcile` (or similar server endpoint). Previously deferred to Round 2 in the existing design (report.html line 1359).

2. **Acceptance test (Finding #14)**: The iterate command must work end-to-end with `hlx library iterate RSH-688 --file reports/RSH-688/report.html`. This validates the entire authoring pipeline. The CLI is the primary tool for this acceptance criterion.

3. **Optimistic concurrency (Finding #6)**: The iterate command must fetch the current item's latest `commitSha`, pass it as `baseCommitSha` in the iterate request, and handle 409 Conflict responses.

### Unchanged from Prior Diagnosis

Missing create/iterate/publish/delete commands remain the core gap. Existing infrastructure (`resolveLibraryItem`, `hxFetch`, flag parsing, file reading) is reusable.

## Evidence Summary

| Evidence Type | Source | Finding |
|---|---|---|
| Existing design | `report.html:1357-1359` | Cron reconcile deferred to Round 2 — now MVP |
| Command router | `library/index.ts` | list/show/comments only |
| Resolution | `resolve-library-item.ts:18-81` | 3-tier resolution reusable |
| File reading | `tickets/update-description.ts:22-28` | readFileSync + --file flag precedent |
| HTTP client | `http.ts:37-134` | hxFetch pattern |

## Success Criteria

1. `hlx library reconcile` command implemented as MVP (finding #4).
2. `hlx library iterate <ref> --file <path>` passes `baseCommitSha` (finding #6).
3. Acceptance test: `hlx library iterate RSH-688 --file ...` cleanly re-versions report (finding #14).
4. Original success criteria (create/iterate/publish/delete commands) unchanged.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (continuation context) | Findings #4, #6, #14 impact CLI | reconcile in MVP, optimistic concurrency, acceptance test |
| scout/reference-map.json (cli) | Command inventory | 3 existing commands; infrastructure reusable |
| scout/scout-summary.md (cli) | CLI patterns | Dispatcher + hxFetch; resolve-library-item |
| reports/RSH-688/report.html (sections 8, 17) | CLI design + deferred items | iterate spec, cron deferred to Round 2 |
| Prior diagnosis (cli) | Original gaps | Missing commands — still valid |
