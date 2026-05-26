# Diagnosis Statement

## Problem Summary

The CLI's `hlx library show` command needs to parse both HTML and Markdown headings for section annotation. Prior runs already added dual heading extraction with HTML regex priority and Markdown fallback.

## Root Cause Analysis

This is a feature implementation ticket on its third run. The CLI changes are complete:

### Already Complete (from prior runs)
1. **Dual heading extraction** (`show.ts` lines 44-86): HTML heading regex tried first (line 48) with id attribute extraction and nested HTML tag stripping (line 52). Markdown heading regex falls back (line 70). Both produce identical annotation output.
2. **Comment system**: `comments-list.ts` and `comments-post.ts` are anchor-based and format-agnostic. No changes needed.
3. **Zero new dependencies**: The HTML heading regex suffices without an HTML parsing library.

### No Remaining Work
The CLI is fully compatible with HTML reports. No code changes needed.

### Minor Consideration (not blocking)
Non-heading HTML lines print as raw HTML in the terminal. This is acceptable since the CLI's primary purpose is section annotation, not full content rendering.

## Evidence Summary

| Evidence Type | Finding |
|---------------|---------|
| Static: show.ts lines 47-67 | HTML heading regex with id attribute extraction and tag stripping |
| Static: show.ts lines 69-85 | Markdown heading regex as fallback |
| Static: comments-list.ts, comments-post.ts | Format-agnostic, anchor-based |
| Static: package.json | Zero runtime dependencies |

## Success Criteria

1. **HTML heading extraction works**: `hlx library show` displays headings from HTML reports with comment annotations
2. **Markdown backward compat**: Existing Markdown reports continue displaying correctly
3. **No new dependencies**: Zero runtime dependency principle maintained

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope | Reports to HTML; section marking/commenting must work the same |
| scout/reference-map.json (CLI) | Map CLI components | 8 files; only show.ts is format-dependent |
| scout/scout-summary.md (CLI) | Understand CLI state | Dual extraction already implemented; comment system format-agnostic |
| show.ts (direct read) | Verify implementation | Lines 48-67 HTML regex; lines 70-85 MD fallback; both working |
