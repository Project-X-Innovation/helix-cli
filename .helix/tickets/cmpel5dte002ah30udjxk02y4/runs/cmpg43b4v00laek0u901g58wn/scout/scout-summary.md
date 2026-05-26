# Scout Summary: helix-cli

## Problem

The CLI's `hlx library show` command parses report content to extract headings and annotate them with comment summary counts. Switching reports to HTML requires the heading detection to handle HTML heading tags in addition to Markdown heading syntax.

## Analysis Summary

The CLI's report interaction is narrow and already supports both formats:

1. **Dual heading extraction (show.ts lines 44-86)**: The `cmdShow` function splits content by newline and tries two regex patterns per line. Line 48: HTML heading regex `/<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i` tries first, capturing level, id attribute, and inner text (with HTML tag stripping on line 52). Line 70: Markdown heading regex `^(#{1,6})\s+(.+)$` falls back. Both paths produce identical annotation output.

2. **Comment commands (comments-list.ts, comments-post.ts)**: Accept section anchors via `--section` flag and communicate with the server's comment API. Entirely anchor-based and format-agnostic. No changes needed.

3. **Raw HTML output**: For non-heading lines, the CLI currently prints them as-is. This means HTML reports display raw HTML tags in the terminal for non-heading content. This may be acceptable since the CLI's primary purpose is section annotation rather than full content display.

4. **No runtime dependencies**: The CLI has zero runtime dependencies. The HTML heading regex is sufficient without adding an HTML parsing library.

## Relevant Files

| File | Role |
|------|------|
| `src/library/show.ts` | Heading extraction - HTML regex (line 48) + MD regex (line 70) with comment annotations |
| `src/library/comments-list.ts` | Section-filtered comment listing (format-agnostic) |
| `src/library/comments-post.ts` | Section-targeted comment posting (format-agnostic) |
| `src/library/list.ts` | Library item listing (metadata only) |
| `src/library/index.ts` | Library command router |
| `src/lib/http.ts` | HTTP client for API communication |
| `skill-content/SKILL.md` | CLI documentation |
| `package.json` | Build: tsc, no runtime deps |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand scope | Reports to HTML; section marking/commenting must work the same |
| src/library/show.ts | Verify heading parsing | Already handles both HTML (line 48) and MD (line 70) headings with same annotation output |
| src/library/comments-post.ts | Check format dependency | Format-agnostic, anchor-based |
| src/library/comments-list.ts | Check format dependency | Format-agnostic, anchor-based |
| package.json | Check dependencies | Zero runtime deps; no HTML library needed |
