# Tech Research: Reports in HTML — helix-cli (Rerun)

## Technology Foundation

The CLI is a Node.js + TypeScript tool with zero runtime dependencies. The only format-dependent file is `src/library/show.ts`, which extracts headings from report content for section annotation display. Dual heading extraction (HTML regex priority, Markdown fallback) was implemented in prior runs.

**Implementation status: Complete. No code changes needed in this rerun.**

## Architecture Decision

### Decision 1: No CLI code changes needed

**Options considered:**
1. **No changes** — Dual heading extraction is complete and functional.
2. **Add HTML content stripping for non-heading lines** — Clean terminal output.

**Chosen: Option 1 — no changes.**

**Rationale:** The CLI's `show.ts` already has dual heading extraction confirmed by direct code inspection:
- **HTML regex** (line 48): `/<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i` — extracts level, id attribute, and inner text
- **Tag stripping** (line 52): `rawText = htmlMatch[3].replace(/<[^>]+>/g, '').trim()` — removes nested HTML from heading text
- **Markdown fallback** (line 70): `/^(#{1,6})\s+(.+)$/` — backward compat for existing `.md` reports
- Both paths produce identical annotation output with comment summary counts

Option 2 (stripping non-heading HTML) is explicitly out of scope per product.md. The CLI's primary purpose is section annotation, not full content rendering.

## Core API/Methods

No changes. Existing patterns documented for verification reference:

| Method | File:Line | Purpose |
|--------|-----------|---------|
| HTML heading regex | `show.ts:48` | Extract h1-h6 with id attribute and text |
| Tag stripping | `show.ts:52` | Remove nested HTML tags from heading display text |
| Markdown heading regex | `show.ts:70` | Fallback for `.md` reports |
| Comment annotation | `show.ts:54-65` | Append comment/rating counts to heading display |

## Technical Decisions

### Accepted: Regex-based HTML parsing is sufficient
A full HTML parsing library (cheerio, node-html-parser) was rejected in prior runs. Regex extraction of heading-level tags from well-formed agent HTML is reliable and preserves the CLI's zero-dependency design.

### Accepted: HTML regex priority, Markdown fallback order
HTML regex is tried first (line 48) because new reports will be HTML. Markdown regex (line 70) serves as fallback for existing reports. This order ensures correct handling of both formats without content-type detection overhead.

### Accepted: Comment system is format-agnostic
`comments-list.ts` and `comments-post.ts` use anchor-based section targeting via `--section` flag. The anchor string matches heading id/slug regardless of source format. No changes needed.

## Technical Checks

[TCK-01] No CLI source code modifications
- Decision Reference: "No CLI code changes needed" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: No `src/` files are modified compared to branch baseline for this rerun.

[TCK-02] CLI correctly parses HTML headings
- Decision Reference: "Dual heading extraction"
- Verification Method: code-inspection
- Expected Evidence: `show.ts` line 48 contains HTML heading regex; line 70 contains Markdown fallback. Both produce identical annotation output.

## Cross-Platform Considerations

Not applicable. Node.js CLI tool.

## Performance Expectations

No performance impact. No code changes in this rerun.

## Dependencies

No new dependencies. Zero runtime dependencies maintained.

## Deferred to Round 2

- Stripping non-heading HTML content for cleaner CLI display
- Updating SKILL.md documentation examples for HTML reports

## Summary Table

| Aspect | Detail |
|--------|--------|
| Scope | 0 files changed — dual extraction confirmed complete |
| Risk | None — no code modifications |
| Dependencies | None (zero-dep design maintained) |
| Build validation | `tsc --noEmit` |

## APL Statement Reference

The CLI is fully compatible with HTML reports from prior runs. Dual heading extraction in show.ts handles both HTML tags and Markdown headings with identical output. Comment system is format-agnostic. No code changes needed.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md | Scope | Reports to HTML; marking/commenting must work the same |
| diagnosis/diagnosis-statement.md (CLI) | CLI diagnosis | No code changes needed; dual parsing complete |
| diagnosis/apl.json (CLI) | Evidence Q&A | HTML regex and MD fallback confirmed working |
| product/product.md | Scenarios SCN-07, SCN-08 | CLI must display HTML headings; comment posting works |
| scout/reference-map.json (CLI) | File mapping | 8 files; only show.ts is format-dependent |
| scout/scout-summary.md (CLI) | CLI state | Dual extraction implemented; comment system agnostic |
| repo-guidance.json | Repo scope | CLI needs verification only, no code changes |
