# Diagnosis — BLD-556: hlx library show --full

## Problem Summary

`hlx library show <ref>` fetches the full markdown body from `/api/library/items/:id` but only renders section headings (TOC). There is no flag to print the full body. Users and agents who need to read report content substantively must bypass the CLI and call the API directly.

## Root Cause Analysis

This is a **deliberate design omission**, not a bug. The handler `cmdShow()` in `src/library/show.ts` already fetches `item.content` (the full markdown) at line 24, but the rendering loop at lines 43-64 only prints regex-matched heading lines. Line 62 has an explicit comment: `// Skip non-heading content for brevity`.

The function signature already accepts the CLI args array as a third parameter (`_args: string[]`, line 23), but it is unused (underscore prefix convention). The established pattern for boolean CLI flags — `hasFlag(args, '--flag')` from `src/lib/flags.ts` — is used consistently across 7+ commands.

**No additional API call is needed.** The content is already in memory after the existing fetch. The fix is purely a rendering-path change gated by a new `--full` flag.

### Alternative hypothesis considered

*Could the API response lack the full body in some cases?* — Disconfirmed. The `LibraryItemDetail` type (lines 4-10) types `content` as `string | null`, and line 27 already handles the null case by printing "No content available." The ticket confirms the API endpoint returns the full markdown. No runtime inspection is available to verify live API shape, but the type definition and null guard indicate this is already handled.

## Evidence Summary

| Evidence | Location | Finding |
|----------|----------|---------|
| Content fetch | `src/library/show.ts:24` | `hxFetch(config, '/library/items/${resolvedId}', { basePath: "/api" })` returns full item including `content` |
| Body discarded | `src/library/show.ts:62` | `// Skip non-heading content for brevity` — explicit omission |
| Args available | `src/library/show.ts:23` | `_args: string[]` param is passed from router but unused |
| Router passes args | `src/library/index.ts:44` | `await cmdShow(config, resolved.id, rest)` — `rest` contains all trailing args |
| Flag pattern | `src/lib/flags.ts:11-13` | `hasFlag(args, flag)` is the standard boolean flag utility |
| Flag usage | 7+ call sites | `--json`, `--dry-run`, `--archived`, `--force`, `--current` all use `hasFlag()` |
| Help text | `src/library/index.ts:39` | Currently: `Usage: hlx library show <ref>` — no flags documented |
| Usage text | `src/index.ts:55` | Currently: `hlx library show <ref>          Show report with section annotations` |
| Skill docs | `skill-content/references/commands.md:300-308` | Documents current show behavior, no flags |
| No library tests | `src/library/` | No `*.test.*` files exist under library/ |

## Success Criteria

Per ticket acceptance criteria:

1. **`hlx library show <ref> --full`** prints the full markdown body (same content as `item.content` from the API).
2. **Default behavior unchanged** — `hlx library show <ref>` without `--full` continues to print only the TOC with annotations.
3. **Help text updated** — `hlx library show --help` documents `--full`.
4. **Skill docs updated** — `skill-content/references/commands.md` documents `--full` under "hlx library show".

### Implementation scope

| File | Change |
|------|--------|
| `src/library/show.ts` | Rename `_args` to `args`, import `hasFlag`, add conditional full-body printing when `--full` is set |
| `src/library/index.ts` | Update help text at line 39 to include `[--full]` flag and description |
| `src/index.ts` | Update usage text at line 55 to mention `--full` |
| `skill-content/references/commands.md` | Update lines 300-308 to document `--full` flag with description and flag table |

### Stretch goals assessment

The ticket mentions optional stretch goals (`--body-only`, `--out <path>`). These are cheap to implement using the same `hasFlag`/`getFlag` patterns already in the codebase, but should be treated as secondary to the core `--full` flag.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Problem statement and acceptance criteria | Four acceptance criteria: --full prints body, default unchanged, help updated, skill updated |
| scout/reference-map.json | File inventory and key facts from scout | Confirmed content already fetched, _args unused, hasFlag pattern established |
| scout/scout-summary.md | Boundary map and analysis | Narrow change surface, 4 files to modify, no API changes needed |
| src/library/show.ts | Primary handler — direct inspection | Line 62 explicitly skips non-heading content; _args param unused; content already in memory |
| src/library/index.ts | Router and help text — direct inspection | Help text at line 39 needs [--full]; rest args already passed to cmdShow |
| src/lib/flags.ts | Flag utilities — direct inspection | hasFlag() is a simple args.includes() check — established pattern |
| src/index.ts | Entry point usage — direct inspection | Usage line 55 should mention --full |
| skill-content/references/commands.md | Skill documentation — direct inspection | Lines 300-308 document show command without flags |
| skill-content/SKILL.md | High-level skill overview | Mentions library at a glance — no detail changes needed |
