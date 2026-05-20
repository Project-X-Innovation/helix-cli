# Scout Summary: helix-cli

## Problem

The CLI's `hlx library show` command parses Markdown headings from report content using a regex pattern (`/^(#{1,6})\s+(.+)$/`) to extract sections and annotate them with comment summary counts. HTML reports will not match this regex, breaking the section display.

## Analysis Summary

The CLI's report interaction is narrow -- it only extracts heading lines from report content for display, and provides commands for section-level commenting.

1. **Heading extraction (show.ts)**: The `cmdShow` function at line 43-64 splits content by newline and matches each line against the Markdown heading regex. Matched headings get slugified and annotated with comment summary counts (thumbs-up, love, thumbs-down). Non-heading lines are skipped entirely. For HTML reports, this regex needs to match HTML heading tags (`<h1 id="...">...</h1>`) instead.

2. **Comment commands (comments-list.ts, comments-post.ts)**: These commands accept section anchors via `--section` flag and work with the server's comment API. They are format-agnostic -- they only pass anchor strings.

3. **No parsing dependencies**: The CLI has zero runtime dependencies. Adding an HTML parsing library (like `node-html-parser` or `cheerio`) or using a simple regex for `<h[1-6]` tags are both options.

4. **Documentation (SKILL.md)**: References to "section headings annotated" and markdown-specific examples may need updating.

## Relevant Files

| File | Role |
|------|------|
| `src/library/show.ts` | Heading extraction and display with comment annotations |
| `src/library/comments-list.ts` | Section-filtered comment listing |
| `src/library/comments-post.ts` | Section-targeted comment posting |
| `src/library/index.ts` | Library command router |
| `src/library/list.ts` | Library item listing (metadata only) |
| `skill-content/SKILL.md` | Documentation for library commands |
| `package.json` | Build configuration, dependency listing |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand scope | Reports switching to HTML; marking/commenting must work the same |
| src/library/show.ts | Understand heading parsing | Line 46: markdown heading regex; line 49: slugify; lines 52-58: comment annotations |
| src/library/comments-list.ts | Check comment format dependency | Format-agnostic; uses anchor strings |
| src/library/comments-post.ts | Check comment format dependency | Format-agnostic; uses anchor strings |
| package.json | Check dependencies | Zero runtime deps; no HTML parser available |
| skill-content/SKILL.md | Check documentation | References markdown-specific report display |
