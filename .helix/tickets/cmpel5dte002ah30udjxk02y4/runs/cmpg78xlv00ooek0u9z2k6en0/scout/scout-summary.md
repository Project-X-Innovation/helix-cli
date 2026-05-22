# Scout Summary — helix-cli

## Problem

CLI must display and annotate HTML reports alongside Markdown. The `hlx library show` command must parse headings from both formats and annotate with comment summaries.

## Analysis Summary

### Current State: Dual-Format Heading Parsing Exists

The CLI already handles both HTML and Markdown headings in `src/library/show.ts`:

1. **HTML Heading Pattern** (line 48): `/<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i` — extracts heading level, optional `id` attribute for slug, and text content. Nested HTML tags are stripped via `.replace(/<[^>]+>/g, '')`.

2. **Markdown Heading Pattern** (line 70): `/^(#{1-6})\s+(.+)$/` — standard Markdown heading extraction.

Both paths annotate with section slug and comment summary counts from the API.

### Potential Issue: Non-Heading Content Dropped

The `show.ts` line-by-line parsing only matches heading lines. For HTML reports, non-heading lines (paragraphs, tables, lists, etc.) do not match either regex and appear to be silently dropped from CLI output. This means `hlx library show` would only display annotated headings for HTML reports, not full content.

### Slugify Discrepancy

The CLI's `slugify()` uses `/[^a-z0-9\s-]/g` (preserves spaces before converting to hyphens) while the client uses `/[^a-z0-9]+/g` (replaces any non-alphanumeric run with a single hyphen). This could cause anchor mismatches for headings containing special characters, potentially affecting comment targeting.

### Quality Gates

- `npm run build` — TypeScript compilation
- `npm run typecheck` — TypeScript only
- `npm run test` — Node test runner

## Relevant Files

| File | Role |
|------|------|
| `src/library/show.ts` | Core report display with HTML+MD heading parsing |
| `src/library/index.ts` | Library command router |
| `src/library/list.ts` | List library items |
| `src/library/comments-list.ts` | List section-grouped comments |
| `src/library/comments-post.ts` | Post ratings/comments with slugify |
| `src/library/comments.ts` | Comments sub-router |
| `package.json` | Build/test commands, no external HTML/MD deps |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope understanding | Reports must work in HTML; CLI must handle both formats |
| src/library/show.ts | Core parsing logic | Already has dual HTML/MD heading regex; non-heading HTML lines may be dropped |
| package.json | Quality gates and dependencies | No external HTML/MD libraries; custom regex parsing |
