# Implementation Plan: Reports in HTML (helix-cli)

## Overview

Update the CLI's `hlx library show` command to extract headings from both HTML and Markdown reports. This is a minimal change: update the heading regex in `show.ts` to try HTML heading patterns first, then fall back to the existing Markdown pattern. Also add `filePath` to the local type for optional format detection. No new dependencies.

**Cross-repo coordination**: The server (helix-global-server) adds `filePath` to the library item API response. The CLI can optionally consume it for format detection, but content inspection (HTML regex match) is the primary detection method since the CLI iterates line-by-line already.

## Implementation Principles

- Zero new runtime dependencies (CLI design constraint).
- Support both HTML and Markdown headings for backward compatibility.
- Use simple regex for HTML heading extraction (sufficient for well-formed `<h1>`-`<h6>` tags).
- Preserve existing CLI display format (heading level indicators with slug annotations).

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| L1 | Add filePath to local LibraryItemDetail type | Modified `src/library/show.ts` |
| L2 | Add dual-pattern heading extraction | Modified `src/library/show.ts` |
| L3 | Quality gates | TypeScript compilation passes |

## Detailed Implementation Steps

### Step L1: Add filePath to local LibraryItemDetail type

**Goal**: Extend the CLI's local type to include filePath from the server response.

**What to Build**:
- In `src/library/show.ts`, update the `LibraryItemDetail` type (lines 4-9) to add `filePath`:
  ```
  type LibraryItemDetail = {
    item: {
      id: string;
      title: string;
      content: string | null;
      filePath?: string | null;
    };
  };
  ```

**Verification (AI Agent Runs)**:
- `grep "filePath" src/library/show.ts` shows the new field.

**Success Criteria**: Local type includes optional filePath field.

### Step L2: Add dual-pattern heading extraction

**Goal**: Update the heading parsing loop to match both HTML and Markdown headings.

**What to Build**:
- In `src/library/show.ts`, update the line-by-line parsing loop (lines 44-63):
  - Before the existing Markdown regex (line 46), add an HTML heading regex:
    ```
    const htmlMatch = /<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i.exec(line);
    ```
  - If `htmlMatch` succeeds:
    - Extract `level = parseInt(htmlMatch[1])`, `id = htmlMatch[2]`, `rawText = htmlMatch[3]`.
    - Strip nested HTML tags from text for display: `text = rawText.replace(/<[^>]+>/g, "").trim()`.
    - Use `slug = id || slugify(text)` for anchor lookup.
    - Build heading prefix as `"#".repeat(level)`.
    - Output annotation in the same format as Markdown headings.
  - If `htmlMatch` does not succeed, fall back to existing Markdown regex (line 46, unchanged).
- The existing Markdown regex and handling (lines 46-63) remain unchanged as the fallback path.

**Verification (AI Agent Runs)**:
- `grep "h\[1-6\]" src/library/show.ts` or similar shows the HTML regex.
- `grep "#{1,6}" src/library/show.ts` shows the preserved Markdown regex.
- `npx tsc --noEmit` passes.

**Success Criteria**: Both HTML and Markdown heading patterns are matched; TypeScript compiles.

### Step L3: Quality gates

**Goal**: Ensure TypeScript compilation passes.

**Verification (AI Agent Runs)**:
- `npx tsc --noEmit` passes.

**Success Criteria**: Zero type errors.

## Verification Plan

### Pre-conditions

| Dependency | Status | Source/Evidence | Affects checks |
|------------|--------|-----------------|----------------|
| Node.js and npm installed | available | Dev environment | CHK-01, CHK-02 |
| npm install completed | available | Must run `npm install` in CLI root | CHK-01, CHK-02 |
| TypeScript compiler available | available | tsc in devDependencies | CHK-01 |

### Required Checks

[CHK-01] TypeScript compilation passes
- Action: Run `npx tsc --noEmit` in the helix-cli root.
- Expected Outcome: Command exits with code 0, no type errors.
- Required Evidence: Terminal output showing successful compilation with no errors.

[CHK-02] Dual heading regex present in show.ts
- Action: Read `src/library/show.ts` and verify it contains both an HTML heading regex (matching `<h[1-6]` tags) and the existing Markdown heading regex (`/^(#{1,6})\s+(.+)$/`). Verify the HTML regex extracts level, id attribute, and text content. Verify the Markdown regex is preserved as a fallback.
- Expected Outcome: Two regex patterns are present in the heading parsing loop. HTML pattern is tested first. Markdown pattern is the fallback. Both produce the same output format with slug annotations and comment counts.
- Required Evidence: File content excerpt of show.ts showing both regex patterns and the conditional logic.

## Success Metrics

1. `hlx library show` correctly extracts headings from HTML reports via HTML heading regex.
2. Existing Markdown heading extraction preserved as fallback.
3. TypeScript compilation passes.
4. Zero new runtime dependencies.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (CLI) | Scope | Reports switch to HTML; commenting/marking must work the same |
| scout/scout-summary.md (CLI) | Impact analysis | Only show.ts heading regex is format-dependent; comments are format-agnostic |
| scout/reference-map.json (CLI) | File inventory | 7 files; only show.ts needs changes |
| diagnosis/diagnosis-statement.md (CLI) | Root cause | Single regex at show.ts line 46 |
| diagnosis/apl.json (CLI) | Evidence | show.ts heading regex, slugify function, zero runtime deps |
| product/product.md (CLI) | Scenario SCN-07 | CLI must display HTML report headings with comment annotations |
| tech-research/tech-research.md (CLI) | Architecture decision | Dual regex (HTML first, MD fallback); no new deps; strip nested tags |
| repo-guidance.json | Change intent | CLI is minimal-change target |
| Source: show.ts (lines 1-65) | Code inspection | Confirmed Markdown regex at line 46; slugify at lines 14-21; annotation at lines 52-58 |
