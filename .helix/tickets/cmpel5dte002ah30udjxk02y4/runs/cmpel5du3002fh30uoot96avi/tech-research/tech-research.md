# Tech Research: Reports in HTML (helix-cli)

## Technology Foundation

- **Runtime**: Node.js + TypeScript
- **Build**: `tsc`
- **Test**: `tsc && node --test dist/**/*.test.js`
- **Dependencies**: Zero runtime dependencies (only devDependencies: TypeScript, @types/node)
- **Affected file**: `src/library/show.ts` (single format-dependent file)

## Architecture Decision

### Decision 1: Dual-Pattern Heading Extraction

**Options considered:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Dual regex: try HTML pattern, then Markdown fallback | No new deps; handles both formats; simple | Regex-based HTML parsing is limited (acceptable for heading extraction only) |
| B | Add HTML parsing library (cheerio/node-html-parser) | Proper HTML parsing | Adds runtime dependency to zero-dep CLI; over-engineered for heading-only extraction |
| C | Replace Markdown regex with HTML-only | Simpler single path | Breaks backward compat for existing Markdown reports |

**Chosen: Option A -- Dual regex pattern**

**Rationale**: The CLI has zero runtime dependencies by design. Adding a full HTML parser for extracting headings from `<h1>`-`<h6>` tags is over-engineered. A regex pattern like `/<h([1-6])(?:\s[^>]*)?>(.+?)<\/h\1>/gi` reliably extracts heading level and text from well-formed HTML headings. The `id` attribute can be extracted with a secondary regex `id="([^"]*)"` when present. The existing Markdown regex is preserved as a fallback for backward compatibility with older reports.

### Decision 2: Format Detection in CLI

**Approach**: Content inspection -- check if any line matches the HTML heading pattern. If the first heading match is HTML, treat the entire content as HTML. Otherwise, use Markdown parsing.

**Rationale**: The CLI doesn't have access to `filePath` from the API response (the `LibraryItemDetail` type only includes `id`, `title`, and `content`). Content inspection is the simplest approach for the CLI since it already iterates line-by-line.

**Alternative considered**: Updating the CLI's API type to include `filePath`. Rejected because it would require a server API change for the CLI's minimal needs, and content inspection is sufficient and reliable.

Actually, since the server IS adding `filePath` to the `getItem()` response (per server tech-research), the CLI can consume it too. However, the CLI type (`LibraryItemDetail` in show.ts lines 4-9) currently only declares `id`, `title`, `content`. Adding `filePath` to the CLI type is a minor type-only change that provides cleaner format detection.

**Revised approach**: Add `filePath?: string | null` to the CLI's local `LibraryItemDetail` type. Use `filePath?.endsWith('.html')` for detection, with content-inspection fallback.

### Decision 3: Heading ID Extraction from HTML

For HTML headings, the `id` attribute serves as the slug for comment anchor lookup. The CLI should extract `id` from the heading tag when present, and fall back to `slugify(text)` when not.

**Pattern**: `/<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i`

This captures: group 1 = level, group 2 = id attribute value (optional), group 3 = heading text content.

## Core API/Methods

### HTML heading extraction pattern
```
// Attempt HTML heading match
const htmlMatch = /<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i.exec(line);
if (htmlMatch) {
  const level = parseInt(htmlMatch[1]);
  const id = htmlMatch[2];          // from id attribute
  const text = htmlMatch[3];         // heading text (may contain nested tags)
  const slug = id || slugify(text.replace(/<[^>]+>/g, '')); // strip nested tags for slugify
  // ... annotation logic unchanged
}

// Fall back to Markdown heading match
const mdMatch = /^(#{1,6})\s+(.+)$/.exec(line);
```

## Technical Decisions

### TD-1: Strip HTML tags from heading text for display
HTML headings may contain inline markup (e.g., `<h2 id="foo"><code>bar</code> baz</h2>`). For CLI display, strip any nested HTML tags from the text content. Use a simple `text.replace(/<[^>]+>/g, '')` since the CLI only needs plain text output.

### TD-2: Preserve Markdown display format
When displaying HTML headings, the CLI should use the same visual format as Markdown headings (`## Title [slug]` with comment annotations). The `#` count corresponds to the heading level number.

## Technical Checks

[TCK-01] CLI extracts headings from HTML reports
- Decision Reference: "Dual regex: HTML pattern first, Markdown fallback" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: show.ts contains both HTML heading regex and Markdown heading regex. HTML pattern is tried first. Both produce the same output format with slug annotations.

[TCK-02] CLI backward-compatible with Markdown reports
- Decision Reference: "Preserve Markdown pattern as fallback" (Architecture Decision 1)
- Verification Method: code-inspection
- Expected Evidence: The existing Markdown regex `/^(#{1,6})\s+(.+)$/` remains in show.ts and is used when HTML pattern doesn't match.

## Cross-Platform Considerations

Not applicable -- CLI is a Node.js tool.

## Performance Expectations

No performance impact. Adding a second regex test per line is negligible.

## Dependencies

No new dependencies. The CLI maintains its zero-runtime-dependency design.

## Deferred to Round 2

- Rendering HTML content body in CLI (currently only headings are shown)
- Updating SKILL.md documentation examples for HTML reports

## Summary Table

| Area | Decision | Risk |
|------|----------|------|
| Heading extraction | Dual regex (HTML first, MD fallback) | Low -- simple regex; only for heading tags |
| Format detection | filePath extension with content-inspection fallback | Low |
| Display format | Same visual format as Markdown headings | None |
| Dependencies | None added | None |

## APL Statement Reference

See tech-research/apl.json for the complete APL record.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (CLI) | Scope | Reports switch to HTML; commenting/marking must work the same |
| diagnosis/diagnosis-statement.md (CLI) | Root cause | Single regex at show.ts line 46 is the only format-dependent code |
| diagnosis/apl.json (CLI) | Evidence | show.ts heading regex, slugify function, zero runtime deps |
| product/product.md (CLI) | Scenario SCN-07 | CLI must display HTML report headings with comment annotations |
| scout/reference-map.json (CLI) | File inventory | 7 files; only show.ts is format-dependent |
| scout/scout-summary.md (CLI) | Impact analysis | Comments commands are format-agnostic; only heading extraction needs change |
| repo-guidance.json | Change intent | CLI is minimal-change target |
| Source: show.ts (lines 1-65) | Current implementation | Markdown regex at line 46; slugify at lines 14-21; annotation at lines 52-58 |
