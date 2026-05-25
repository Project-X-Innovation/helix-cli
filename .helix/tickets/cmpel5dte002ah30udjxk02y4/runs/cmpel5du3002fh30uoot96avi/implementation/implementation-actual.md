# Implementation Actual: Reports in HTML (helix-cli)

## Summary of Changes

Updated the CLI's `hlx library show` command to support dual-format heading extraction. Added an HTML heading regex that is tried first before the existing Markdown regex fallback. Also added `filePath` to the local `LibraryItemDetail` type. Zero new dependencies.

## Files Changed

| File | Why Changed | Shared/Review Note |
|------|-------------|-------------------|
| `src/library/show.ts` | Added `filePath` to local type; added HTML heading regex before existing Markdown regex fallback | **Heading extraction logic**: review HTML regex for correctness with nested tags and id extraction |

## Steps Executed

### L1: Add filePath to local type
- Added `filePath?: string | null` to `LibraryItemDetail.item` type at line 9

### L2: Add dual-pattern heading extraction
- Added HTML heading regex at line 48: `/<h([1-6])(?:\s+[^>]*?id="([^"]*)"[^>]*)?>(.+?)<\/h\1>/i`
- Extracts level, id attribute, and raw text (stripping nested HTML tags)
- Uses id for anchor lookup when present, falls back to `slugify(rawText)`
- Preserves original Markdown regex at line 70 as fallback (completely unchanged)

### L3: Quality gates
- `npx tsc --noEmit` passed (0 errors)

## Verification Commands Run + Outcomes

| Command | Outcome |
|---------|---------|
| `npx tsc --noEmit` | Pass - zero errors |
| `grep "htmlMatch" src/library/show.ts` | Pass - found at lines 48-52 |
| `grep "#{1,6}" src/library/show.ts` | Pass - found at line 70 (Markdown fallback preserved) |

## Test/Build Results

- TypeScript: 0 errors

## Deviations from Plan

None.

## Known Limitations / Follow-ups

- Zero new runtime dependencies added (CLI design constraint maintained).
- HTML heading regex assumes well-formed heading tags on single lines. Multi-line headings would not match, but agent-generated HTML headings are expected to be single-line.

## Spec Deviations

| Criterion | Status | Notes |
|-----------|--------|-------|
| SCN-07 (CLI heading extraction) | Pass (code) | Dual regex implemented; cannot runtime-test without HTML report in the API |

## Verification Plan Results

| Check ID | Outcome | Evidence/Notes |
|----------|---------|----------------|
| CHK-01 | Pass | `npx tsc --noEmit` exits 0 with no errors |
| CHK-02 | Pass | show.ts contains HTML regex `/<h([1-6])...>/i` at line 48 and Markdown regex `/^(#{1,6})\s+(.+)$/` at line 70. HTML tested first with `continue` on match; Markdown is fallback. Both produce identical output format with slug annotations. |

## APL Statement Reference

See implementation/apl.json.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| ticket.md (CLI) | Scope | Reports switch to HTML; commenting/marking must work identically |
| implementation-plan/implementation-plan.md (CLI) | Step-by-step plan | 3 steps: type update, dual regex, quality gate |
| tech-research/tech-research.md (CLI) | Architecture decisions | Dual regex, no new deps, strip nested tags |
| diagnosis/diagnosis-statement.md (CLI) | Root cause | Single regex at show.ts line 46 |
| product/product.md | Scenario SCN-07 | CLI must display HTML report headings with annotations |
| repo-guidance.json | Change intent | CLI is minimal-change target |
| Source: show.ts (lines 1-65) | Original heading extraction code |
