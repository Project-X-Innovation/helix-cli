# Diagnosis Statement

## Problem Summary

The CLI's `hlx library show` command parses Markdown headings using a regex that will not match HTML heading tags. This is the only format-dependent code in the CLI.

## Root Cause Analysis

`src/library/show.ts` line 46 uses the regex `/^(#{1,6})\s+(.+)$/` to extract heading level and text from report content. This pattern matches Markdown headings (`# Title`, `## Section`) but will fail on HTML headings (`<h1 id="title">Title</h1>`).

The comment commands (`comments-list.ts`, `comments-post.ts`) are format-agnostic - they operate on anchor strings passed via `--section` flag and don't parse report content.

## Evidence Summary

| Evidence Type | Finding |
|---------------|---------|
| Static: show.ts line 46 | Markdown heading regex `/^(#{1,6})\s+(.+)$/` |
| Static: comments-list.ts | Format-agnostic, uses anchor strings |
| Static: comments-post.ts | Format-agnostic, uses anchor strings |
| Static: package.json | Zero runtime dependencies |

## Success Criteria

1. `hlx library show` correctly extracts and displays headings from both HTML and Markdown reports
2. Comment annotation (rating counts per section) works for HTML headings
3. No unnecessary runtime dependencies added
4. Existing Markdown report display continues working

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Understand scope | Reports switch to HTML; marking/commenting must work the same |
| scout/reference-map.json (CLI) | Map format-dependent code | Only show.ts heading regex is format-dependent |
| scout/scout-summary.md (CLI) | Understand CLI impact | Narrow: heading extraction only, comment system is format-agnostic |
