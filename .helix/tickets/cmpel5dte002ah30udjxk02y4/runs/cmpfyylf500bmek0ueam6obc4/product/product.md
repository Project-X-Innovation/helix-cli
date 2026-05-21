# Product: Reports in HTML

## Problem Statement

Reports are generated as Markdown, which limits the visual richness agents can produce. AI agents generate higher-quality, more dynamic output in HTML (styled tables, callout boxes, visual hierarchies). Switching reports to HTML enables more polished research deliverables. All section-level marking, rating, and commenting must continue working identically. Existing Markdown reports must remain readable.

This is a rerun (3rd run). Prior runs implemented the core HTML rendering, storage, and generation infrastructure across all three repos. The remaining work is: cleaning up residual `.md` references in the server, and producing verification that demonstrates genuinely rich HTML features (user feedback from prior runs: verification screenshots looked too similar to Markdown).

## Product Vision

Reports become HTML-first, giving agents the expressiveness to produce visually polished, well-structured research deliverables. Existing Markdown reports continue rendering correctly. Section-level feedback (ratings, comments, threads) works identically on both formats. This is the first step toward migrating all artifacts from Markdown to HTML.

## Users

- **Report consumers**: Team members who read, rate, and comment on generated reports in the web UI
- **AI agents**: Generate reports during RESEARCH mode workflows
- **CLI users**: Developers who inspect report headings and manage section comments via `hlx library show`

## Use Cases

1. Agent generates a new report as HTML and user views it with rich formatting
2. User rates a specific section of an HTML report via the feedback toolbar
3. User comments on a section and views threaded replies
4. User downloads an HTML report as a `.html` file
5. User exports an HTML report to PDF
6. User views a legacy Markdown report generated before the HTML switch
7. Developer runs `hlx library show` to inspect headings and comments on an HTML report

## Core Workflow

1. Agent receives HTML formatting instructions (semantic elements, heading IDs) and generates `report.html`
2. Server orchestrator captures the HTML file, stores with `text/html` content type, creates LibraryItem with `.html` filePath
3. Client detects format via `isHtmlContent()` (file extension check, content sniffing fallback) and routes to the HTML renderer
4. HTML renderer sanitizes content (DOMPurify) and injects SectionHeading components on h1-h6 for feedback integration
5. User interacts with section ratings, comments, download, and PDF export exactly as before

## Essential Features (MVP)

1. **HTML report generation**: Agent prompts instruct HTML output with semantic elements and heading `id` attributes (lowercase kebab-case, max 60 chars)
2. **HTML storage pipeline**: Server unified pipeline stores reports as `.html` with `text/html` content type in blob and Git
3. **HTML rendering**: Client renders via DOMPurify sanitization + html-react-parser with SectionHeading injection on h1-h6
4. **Section feedback on HTML**: Rating toolbar, comment badges, and threaded replies attach to HTML heading `id` attributes
5. **Backward-compatible Markdown rendering**: Existing Markdown reports render via react-markdown pipeline
6. **Format detection**: `isHtmlContent()` checks file extension first, content sniffing fallback; CLI tries HTML regex first, MD fallback
7. **HTML download**: Download button shows "Download HTML" and exports `.html` file
8. **PDF export**: react-to-print works on both formats (DOM-based, format-agnostic)
9. **CLI heading extraction**: `hlx library show` parses both HTML and Markdown headings with identical annotation output
10. **Residual cleanup**: Server `.md` references in blob key path, materializer filename, dev seed, and stale JSDoc updated to `.html`

## Features Explicitly Out of Scope (MVP)

- Converting other artifact types (non-report) to HTML (ticket scopes to reports only)
- Migrating existing production Markdown reports to HTML (they remain as-is)
- Shiki syntax highlighting for `<pre><code>` blocks in HTML reports (low priority for research reports)
- Stripping raw HTML tags from non-heading lines in CLI terminal output
- WYSIWYG editor for manual report editing
- Custom CSS theming beyond Tailwind prose classes
- Removing react-markdown dependencies (still needed for comment content rendering)

## Success Criteria

1. New reports are generated as HTML with semantic markup and heading IDs
2. HTML reports render in the web client with proper Tailwind prose styling
3. Section feedback toolbar (rate up/down/love) works on HTML headings identically to Markdown
4. Section comment badges and threaded replies work on HTML headings identically to Markdown
5. Existing Markdown reports continue rendering with no regressions
6. HTML reports download as `.html` files; download button label is dynamic
7. PDF export works for HTML reports
8. `hlx library show` displays headings from HTML reports with comment annotations
9. Agent-generated HTML is sanitized (DOMPurify, no script/style tags)
10. Residual server `.md` references cleaned up for consistency
11. Verification demonstrates genuinely rich HTML features (styled tables, callout boxes, visual hierarchies)

## User Scenarios

[SCN-01] View a newly generated HTML report
- Precondition: A RESEARCH workflow has completed and generated an HTML report
- Action: User navigates to the report in the library
- Expected Outcome: The report renders with proper formatting including styled headings,
  tables, lists, blockquotes, and visual hierarchy. Section feedback toolbars appear
  on each heading.

[SCN-02] Rate a section in an HTML report
- Precondition: User is viewing an HTML report with section headings
- Action: User clicks a rating button (thumbs up, thumbs down, or love) on a section heading
- Expected Outcome: The rating is recorded and the comment badge updates to reflect
  the new count. The rating persists on page refresh.

[SCN-03] Comment on a section in an HTML report
- Precondition: User is viewing an HTML report with section headings
- Action: User opens the comment thread on a section heading, types a comment, and submits
- Expected Outcome: The comment appears in the section's thread and the comment badge
  count increments. Other users see the comment in real-time via SSE updates.

[SCN-04] View a legacy Markdown report after the HTML switch
- Precondition: A report was generated before the HTML switch and is stored as Markdown
- Action: User navigates to the older report in the library
- Expected Outcome: The Markdown report renders correctly with existing formatting and
  section feedback/comments continue working identically.

[SCN-05] Download an HTML report
- Precondition: User is viewing an HTML report
- Action: User clicks the download button
- Expected Outcome: The report downloads as an `.html` file. The download button label
  shows "Download HTML".

[SCN-06] Export an HTML report to PDF
- Precondition: User is viewing an HTML report
- Action: User triggers the print/PDF export function
- Expected Outcome: A properly formatted PDF is generated from the HTML report content,
  preserving visual layout.

[SCN-07] View HTML report headings in the CLI
- Precondition: An HTML report exists in the library
- Action: Developer runs `hlx library show` for the report
- Expected Outcome: Section headings are extracted from the HTML, displayed with correct
  indentation levels, and annotated with comment/rating counts. Both HTML and Markdown
  heading formats are recognized.

[SCN-08] Post a section comment via CLI
- Precondition: Developer has identified a section anchor from `hlx library show`
- Action: Developer runs `hlx library comments post` with a `--section` anchor
- Expected Outcome: The comment is posted to the correct section and visible in both
  the CLI comment listing and the web client.

[SCN-09] View report with rich HTML features
- Precondition: Agent has generated a report with styled tables, callout boxes, and
  visual hierarchy elements
- Action: User views the report in the web client
- Expected Outcome: Tables display with proper column alignment and styling. Callout
  boxes render distinctly. Visual hierarchy is clear with differentiated heading sizes
  and spacing. The report looks noticeably richer than a plain Markdown report.

[SCN-10] HTML sanitization prevents unsafe content
- Precondition: An agent generates HTML containing script tags, style tags, or inline styles
- Action: User views the report in the web client
- Expected Outcome: Forbidden tags are stripped before rendering. No script execution
  or XSS vectors are present. The report content renders safely.

## Key Design Principles

1. **Format-agnostic feedback system**: The anchor-based comment/rating system works identically regardless of report format. HTML headings use `id` attributes as anchors.
2. **Backward compatibility**: Existing Markdown reports keep working. Format detection routes to the correct rendering pipeline.
3. **Security-first rendering**: DOMPurify sanitization with `<style>` and `<script>` tags forbidden. Agents instructed not to use inline styles.
4. **Minimal scope**: Only reports change format. Other artifacts remain Markdown. Shared Markdown dependencies preserved.
5. **Same UX, richer content**: Interaction model (rating, commenting, download, export) is identical. Only content format and visual richness change.

## Scope & Constraints

- **Three repos affected**: helix-global-client (rendering, format detection, export), helix-global-server (prompts, orchestration, storage), helix-cli (heading parsing)
- **Implementation status**: Core feature implemented in prior runs. Server needs residual `.md` cleanup (3 references). All repos need verification with rich HTML content.
- **No database migration**: `LibraryItem.filePath` is a plain String; `.html` extension works naturally
- **No new dependencies needed**: Client already has `dompurify` and `html-react-parser`; CLI uses regex
- **Production state**: All 20 recent production reports are `.md` (feature branch not yet deployed)
- **Markdown deps retained**: `react-markdown`, `remark-gfm`, `rehype-slug` still needed for comment content rendering and backward compat

## Future Considerations

- Extend HTML format to all artifact types (ticket description mentions this as a future goal)
- Add Shiki syntax highlighting for code blocks in HTML reports
- Strip or render non-heading HTML content in CLI for better terminal readability
- Consider HTML-to-Markdown fallback for email notifications or plaintext contexts
- Evaluate consistent CSS class vocabulary for agent-generated HTML theming

## Open Questions / Risks

| # | Question / Risk | Status |
|---|----------------|--------|
| 1 | Whether Tailwind prose styling provides sufficient visual differentiation for rich HTML vs Markdown | Unknown - both formats use the same prose classes; rich HTML elements (tables, blockquotes) should render more expressively |
| 2 | Whether DOMPurify `FORBID_TAGS: ['style']` config covers all edge cases agents might produce | Low risk - agents are instructed not to use style/script; DOMPurify provides defense-in-depth |
| 3 | Whether blob storage key path cosmetic issue (`report.md` for HTML content) causes downstream problems | Likely cosmetic only - blob URLs are opaque to consumers; should be fixed for consistency |
| 4 | Whether referenced-ticket-materializer writing `report.md` filename affects agent behavior | Functionally harmless - client content-sniffs; agents read content not filename |
| 5 | Whether HTML heading regex in CLI handles edge cases like deeply nested HTML tags in headings | Low risk - regex includes tag stripping; may miss extreme nesting but covers standard agent output |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (client) | Scope, rerun context, user discussion | Reports to HTML; user wants rich HTML verification; this is 3rd rerun |
| scout/scout-summary.md (client) | Client rendering state | Dual rendering infrastructure complete; HTML renderer uses DOMPurify + html-react-parser with SectionHeading injection |
| scout/reference-map.json (client) | Map client components | 13 files; format routing, rendering, feedback, export all implemented |
| diagnosis/diagnosis-statement.md (client) | Client diagnosis | No functional client code changes needed; HTML pipeline complete from prior runs |
| diagnosis/apl.json (client) | Client evidence Q&A | Confirmed: format detection, rendering, feedback, prose styling all working |
| scout/scout-summary.md (server) | Server report pipeline state | Unified pipeline uses HTML; three residual .md references remain |
| scout/reference-map.json (server) | Map server components | 14 files; prompts, orchestrator, storage, delivery paths identified |
| diagnosis/diagnosis-statement.md (server) | Server diagnosis | Core transition complete; blob-storage, materializer, dev-seed need .md cleanup |
| diagnosis/apl.json (server) | Server evidence Q&A | Confirmed: prompts instruct HTML, pipeline stores .html, production still .md |
| scout/scout-summary.md (CLI) | CLI heading parsing state | Dual heading extraction implemented (HTML regex priority, MD fallback) |
| scout/reference-map.json (CLI) | Map CLI components | 8 files; only show.ts is format-dependent |
| diagnosis/diagnosis-statement.md (CLI) | CLI diagnosis | No code changes needed; dual parsing complete |
| diagnosis/apl.json (CLI) | CLI evidence Q&A | Confirmed: HTML regex and MD fallback both working; comment system format-agnostic |
| repo-guidance.json (client run root) | Repo scope guidance | All three repos are targets; server needs cleanup, client and CLI need verification |
