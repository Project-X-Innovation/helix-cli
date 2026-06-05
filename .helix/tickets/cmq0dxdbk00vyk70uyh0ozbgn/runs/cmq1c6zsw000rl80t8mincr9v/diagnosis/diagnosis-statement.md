# Diagnosis Statement

## Problem Summary

The CLI currently supports only read operations for library items (list, show, comments list/post). No create, iterate, publish, or delete commands exist, despite the server having publish and delete API endpoints. The design must define new CLI commands for standalone report authoring and full lifecycle management.

## Root Cause Analysis

1. **Missing commands**: Only list, show, and comments are implemented. Publish and delete are missing despite server endpoints existing.
2. **No create/iterate server endpoints**: These require new server API endpoints before CLI commands can be built.
3. **File handling**: No pattern exists for reading local files and uploading content to the API.

## Evidence Summary

| Evidence Type | Source | Finding |
|---|---|---|
| Command router | `src/library/index.ts` | list, show, comments only |
| Server API | `api.ts` lines 413-414 | publish and delete endpoints exist |
| HTTP client | `src/lib/http.ts` | hxFetch with retry/auth pattern for new commands |
| Reference resolver | `src/lib/resolve-library-item.ts` | 3-tier resolution reusable for new commands |

## Success Criteria

1. `hlx library publish <ref>` command designed (can use existing server endpoint).
2. `hlx library delete <ref>` command designed (can use existing server endpoint).
3. `hlx library create --file <path> --title <title>` command designed (requires new server endpoint).
4. `hlx library iterate <ref> --file <path>` command designed (requires new server endpoint).
5. All commands follow established dispatcher + hxFetch + flag-parsing patterns.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| scout/reference-map.json (cli) | Command inventory | list/show/comments only; no create/iterate/publish/delete |
| scout/scout-summary.md (cli) | CLI patterns | Dispatcher + hxFetch + flag-parsing; resolve-library-item reusable |
| src/library/index.ts | Command structure | Switch-based dispatcher for subcommands |
| ticket.md | Design requirements | CLI must gain create, iterate, publish, delete |
