# Scout Summary — helix-cli (Revised for 14 Review Findings)

## Problem

CLI currently has read-only library commands (list, show, comments). The revised design must add: create, iterate, publish, delete, and reconcile commands. Finding #4 moves `hlx library reconcile` into MVP (was Round 2). Finding #14 requires `hlx library iterate --file` to re-version RSH-667 and RSH-688 as acceptance criteria. Finding #1 is relevant: `show --full` returns raw unsanitized HTML.

## Analysis Summary

### New Commands Required

1. **`hlx library create --file <path> [--title <title>]`** — POST /api/library/items
2. **`hlx library iterate <ref> --file <path> [--title <title>]`** — POST /api/library/items/:id/iterate (must pass baseCommitSha per finding #6)
3. **`hlx library publish <ref>`** — POST /api/library/items/:id/publish (admin-only per finding #7)
4. **`hlx library delete <ref>`** — DELETE /api/library/items/:id (admin-only per finding #7)
5. **`hlx library reconcile`** — POST /api/admin/library/reconcile or similar (finding #4, MVP)

### Reusable Infrastructure

- **resolveLibraryItem** (`resolve-library-item.ts:18-81`): 3-tier resolution (CUID, ticket short ID, title) — usable for iterate/publish/delete
- **hxFetch** (`http.ts:37-134`): retry, auth, basePath — established pattern
- **Flag parsing** (`flags.ts:1-36`): getFlag, requireFlag — for --file, --title
- **File reading** precedent: `tickets/update-description.ts:22-28` uses `readFileSync(filePath, 'utf-8')` with --file flag

### Raw HTML Concern (Finding #1)

`show.ts` returns raw HTML from the server without any terminal-safe stripping. While terminals don't execute `<script>` tags, the content is still unsanitized user-authored HTML. The primary fix is server-side sanitization — CLI is a secondary consumer.

### Acceptance Test (Finding #14)

The feature must cleanly re-version RSH-667 and RSH-688 via:
```
hlx library iterate RSH-688 --file reports/RSH-688/report.html
hlx library iterate RSH-667 --file reports/RSH-667/report.html
```
This replaces the "continue-hack" currently used to update them.

## Relevant Files

| File | Role |
|------|------|
| `src/library/index.ts` | Command dispatcher — expand for new commands |
| `src/library/show.ts` | Show with raw HTML output |
| `src/lib/resolve-library-item.ts` | Ref resolution for iterate/publish/delete |
| `src/lib/http.ts` | HTTP client pattern |
| `src/lib/flags.ts` | Flag parsing utilities |
| `src/tickets/update-description.ts` | --file flag precedent |
| `src/docs/cli-content.ts` | Help docs to update |
| `src/index.ts` | CLI entry point |
| `package.json` | Build/test scripts |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (continuation context) | Findings #1, #4, #6, #7, #14 impact CLI | reconcile in MVP, admin-gating, acceptance test |
| reports/RSH-688/report.html (section 8) | Existing CLI design spec | create/iterate/publish/delete commands defined |
| src/library/index.ts | Command structure | Dispatcher pattern for expansion |
| src/library/show.ts | Raw HTML concern | No sanitization on output |
| src/lib/resolve-library-item.ts | Resolution pattern | 3-tier resolution reusable |
| src/tickets/update-description.ts | --file precedent | readFileSync pattern |
| package.json | Quality gates | Build: tsc, test: node --test |
