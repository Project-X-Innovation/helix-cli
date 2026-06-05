# Scout Summary — helix-cli

## Problem

The CLI currently supports only read operations for library items (list, show, comments list/post). No create, iterate, publish, or delete commands exist, despite the server having publish and delete API endpoints. The design must define new CLI commands for standalone report authoring and full lifecycle management.

## Analysis Summary

### Current CLI Surface

The library command group dispatches to three subcommands:
- `hlx library list` — lists all items (GET /api/library/items)
- `hlx library show <ref>` — shows report with section annotations
- `hlx library comments list|post <ref>` — comment viewing and creation

Reference resolution supports exact ID, ticket short ID (case-insensitive), and title substring matching.

### Missing Commands

The ticket proposes adding: `hlx library create --file`, `iterate <ref> --file`, `publish`, `delete`. The publish and delete API endpoints already exist server-side but are not exposed via CLI. Create and iterate require new server endpoints.

### Patterns to Follow

The CLI uses a consistent pattern: subcommand dispatcher → command function → hxFetch API call → formatted output. Flag parsing uses simple `getFlag`/`requireFlag` utilities. New commands would follow this same structure.

### File Handling

The `show` command already reads `filePath` from the item detail response, establishing a precedent for file-aware operations. For `create`/`iterate`, the CLI would need to read local files and send content to the API.

## Relevant Files

| File | Role |
|------|------|
| `src/library/index.ts` | Library command router |
| `src/library/list.ts` | List items command |
| `src/library/show.ts` | Show item with section annotations |
| `src/library/comments.ts` | Comments subcommand router |
| `src/library/comments-list.ts` | List comments by section |
| `src/library/comments-post.ts` | Post section rating/comment |
| `src/lib/resolve-library-item.ts` | Reference resolution (ID, short ID, title) |
| `src/lib/http.ts` | HTTP client with retry/auth |
| `src/index.ts` | CLI entry point |
| `package.json` | Build/typecheck/test scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Design requirements | CLI must gain create, iterate, publish, delete commands |
| src/library/index.ts | Command structure | Dispatcher pattern for subcommands; entry point for expansion |
| src/library/show.ts | File-aware pattern | Already reads filePath from detail — precedent for file operations |
| src/lib/resolve-library-item.ts | Reference resolution | Three-tier resolution reusable for new commands |
| src/lib/http.ts | HTTP client pattern | Retry, auth, and API base path patterns for new API calls |
| package.json | Quality gates | Build: tsc, typecheck: tsc --noEmit, test: node --test |
