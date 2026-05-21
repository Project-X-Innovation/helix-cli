# Scout Summary — BLD-556: hlx library show --full

## Problem

`hlx library show <ref>` fetches the full item content from `/api/library/items/:id` but only prints extracted markdown headings (TOC with slug annotations and comment summaries). There is no flag to print the full markdown body. Users and agents who need to read reports substantively must use raw `curl` calls to the API instead of the CLI.

## Analysis Summary

The change surface is narrow and well-bounded. The key handler `cmdShow()` in `src/library/show.ts` already fetches `item.content` (the full markdown) from the API at line 24, but discards all non-heading lines at line 62 (`// Skip non-heading content for brevity`). The content is available in memory — it just needs to be printed when `--full` is passed.

The codebase has an established pattern for boolean flags via `hasFlag()` from `src/lib/flags.ts`, used consistently across 6+ commands for flags like `--json`, `--dry-run`, `--archived`, `--force`, and `--current`. The `cmdShow` function's `_args` parameter already receives the CLI args array but is unused (underscore prefix convention).

### Boundary map

| Layer | File | Role |
|-------|------|------|
| Entry point | `src/index.ts` | Top-level CLI router, usage text |
| Library router | `src/library/index.ts` | Subcommand dispatch, `--help` text for `show` |
| Show handler | `src/library/show.ts` | Fetches item, prints TOC — main change target |
| Flag utilities | `src/lib/flags.ts` | `hasFlag()` for boolean flag detection |
| Item resolver | `src/lib/resolve-library-item.ts` | Ref resolution (upstream, no changes needed) |
| HTTP client | `src/lib/http.ts` | `hxFetch()` API wrapper (no changes needed) |
| Skill docs | `skill-content/references/commands.md` | CLI command reference — needs flag documented |
| Skill top-level | `skill-content/SKILL.md` | Skill overview — may need mention of `--full` |

### Key observations

1. **Content already in memory**: `cmdShow` fetches item via `hxFetch(config, '/library/items/${resolvedId}', { basePath: "/api" })` and the `LibraryItemDetail` type includes `content: string | null`. No additional API call needed.
2. **`_args` parameter ready to use**: The third parameter of `cmdShow` is `_args: string[]` — it receives the CLI args array from the router but is unused. Renaming to `args` and calling `hasFlag(args, '--full')` follows the pattern.
3. **Help text locations**: Two in-code help texts reference `hlx library show`: the router help at `src/library/index.ts:39` and the top-level usage at `src/index.ts:55`.
4. **Skill documentation**: `skill-content/references/commands.md` lines 300-308 document the show command. Acceptance criteria explicitly requires updating this.
5. **No library tests**: No test files exist under `src/library/`. Existing tests use `node:test` + `node:assert`.
6. **No lint/CI**: Build is `tsc`. Tests are `tsc && node --test dist/**/*.test.js`. No eslint, prettier, or CI workflow files.

## Relevant Files

| File | Relevance |
|------|-----------|
| `src/library/show.ts` | Primary change target — cmdShow handler |
| `src/library/index.ts` | Help text and command routing for show |
| `src/lib/flags.ts` | hasFlag() utility — no changes needed |
| `src/index.ts` | Top-level usage text |
| `skill-content/references/commands.md` | CLI reference docs — acceptance criteria requires update |
| `skill-content/SKILL.md` | Top-level skill doc |
| `src/docs/cli-content.ts` | Embedded docs — does not currently document library (pre-existing gap) |
| `src/lib/flags.test.ts` | Test patterns reference |
| `src/lib/resolve-library-item.ts` | Upstream resolver — context only |
| `src/lib/http.ts` | HTTP client — context only |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem statement and acceptance criteria | Four acceptance criteria: `--full` prints body, default unchanged, help text updated, skill updated |
| src/library/show.ts | Primary handler under change | Already fetches full content but only prints headings; `_args` parameter is unused |
| src/library/index.ts | Command routing and help text | Routes show subcommand, help text needs `[--full]` flag |
| src/lib/flags.ts | Flag utility library | hasFlag() is the established boolean flag pattern |
| src/lib/flags.test.ts | Test patterns | node:test + node:assert, describe/it structure |
| src/index.ts | CLI entry point and usage text | Usage line for library show may need updating |
| skill-content/references/commands.md | Skill CLI reference | Library show section (lines 300-308) documents current behavior only |
| skill-content/SKILL.md | Skill overview | References library at a glance |
| src/docs/cli-content.ts | Embedded docs | Library commands not documented (pre-existing gap) |
| package.json | Build/test scripts | Build: tsc, Test: tsc && node --test, no lint |
