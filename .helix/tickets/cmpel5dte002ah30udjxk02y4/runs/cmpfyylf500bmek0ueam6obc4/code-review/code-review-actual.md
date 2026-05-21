# Code Review: Reports in HTML (helix-cli)

## Review Scope

Reviewed the existing CLI dual heading extraction (implemented in prior runs, unchanged in this run) to verify it remains correct alongside the server-side .md cleanup changes. No CLI code changes were made by implementation or review.

## Files Reviewed

| File | Verdict | Notes |
|------|---------|-------|
| `src/library/show.ts` (lines 44-71) | Pass | HTML regex first (with id extraction and tag stripping), MD heading fallback; both paths annotate with comment/rating counts |

## Missed Requirements & Issues Found

### Requirements Gaps

None. CLI dual heading extraction addresses product spec scenario SCN-07 and SCN-08.

### Correctness/Behavior Issues

None.

### Regression Risks

None. No CLI files were modified in this run.

### Code Quality/Robustness

No issues.

### Verification/Test Gaps

None for this run.

## Changes Made by Code Review

None. No CLI code changes needed.

## Remaining Risks / Deferred Items

1. **Raw HTML in non-heading lines**: Non-heading HTML lines still print as raw HTML in CLI output. Documented as out of scope per product.md.

## Verification Impact Notes

No verification checks affected.

## APL Statement Reference

See code-review/apl.json.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| implementation/implementation-actual.md (CLI) | Scope map | No CLI code changes in this run |
| show.ts (grep) | Verify heading extraction | HTML regex first, MD fallback; both functional |
| product/product.md | Success criteria | CLI scenarios SCN-07, SCN-08 addressed |
