# Diagnosis Statement — BLD-527 (Continuation): Robustness fix for update module shell dependencies

## Problem Summary

The `hlx update` staged-update flow originally shelled out to system `tar` via `execSync` to extract the GitHub release tarball. On Windows machines where Git for Windows is installed — the default developer setup — GNU tar appears first in PATH and interprets Windows drive-letter colons (e.g., `C:\Users\...`) as remote-host syntax, producing `Cannot connect to C: resolve failed`. This made `hlx update` non-functional for the majority of Windows developers.

**Current branch state**: The primary tar extraction bug is **already fixed**. `src/update/extract.ts` provides complete in-process tar.gz extraction using only Node.js built-ins (`gunzipSync` + manual USTAR header parsing), and `perform.ts:125` calls `extractTarGz()` instead of shelling out. `extract.test.ts` provides 6 comprehensive tests. Zero new runtime dependencies were added.

**Remaining issue**: `copyDirRecursive` in `perform.ts` (lines 33–39) still shells out to `xcopy` (Windows) or `cp -R` (others) via `execSync` for the EXDEV cross-filesystem rename fallback. While this is not a tar invocation and does not violate the acceptance criteria, it is an unnecessary shell dependency that should be replaced with `fs.cpSync`.

## Root Cause Analysis

### Primary Root Cause: Shell-based tar invocation with platform-dependent path interpretation — ALREADY FIXED

**Location**: `src/update/perform.ts` (original line 124, now replaced by line 125 calling `extractTarGz`)

**Mechanism**:
1. `STAGING_BASE` resolves to `C:\Users\<user>\.hlx\staging` on Windows (line 17)
2. When `tar` resolves to GNU tar (from Git for Windows), it parses the `C:` prefix as a remote hostname
3. GNU tar attempts a network connection to host `C`, which fails

**Fix already in place**: `extract.ts` uses `gunzipSync` + manual USTAR header parsing — no external binary at all. The fix is a full in-process replacement, not a workaround.

### Secondary Issue: Shell-out in EXDEV fallback copy — OPEN

**Location**: `src/update/perform.ts`, lines 33–39

```typescript
function copyDirRecursive(src: string, dest: string): void {
  execSync(
    process.platform === "win32"
      ? `xcopy "${src}" "${dest}" /E /I /Q /Y`
      : `cp -R "${src}" "${dest}"`,
    { stdio: "pipe" },
  );
}
```

This shells out to `xcopy` or `cp -R` when `renameSync` fails with EXDEV (cross-filesystem). While functional, it is an unnecessary shell dependency. `fs.cpSync(src, dest, { recursive: true })` (available since Node 16.7+; project requires >=18) is a direct in-process replacement.

### User's getTarExecutable() approach — SUPERSEDED, DO NOT INCORPORATE

The user's continuation context describes a local fix that includes `getTarExecutable()` to resolve Windows tar via `C:\Windows\System32\tar.exe`. This approach:
- Does not exist on the current branch (the in-process extraction already solves the problem)
- Contradicts the ticket's explicit "Do Not Re-Decide" constraint: *"Do not paper over the bug by detecting and rejecting GNU tar at runtime, or by hardcoding `C:\Windows\System32\tar.exe`"*
- Would reintroduce an external binary dependency that the in-process extraction eliminates

The `fs.cpSync` replacement and `perform.test.ts` addition from the user's context **are** valid and should be incorporated.

## Evidence Summary

| Evidence | Location | Finding |
|---|---|---|
| In-process extraction implemented | `src/update/extract.ts` (149 lines) | `extractTarGz()` uses `gunzipSync` + manual USTAR parsing; zero external dependencies |
| perform.ts calls extractTarGz | `src/update/perform.ts:14,125` | Import + call site confirm in-process extraction is wired in |
| Extraction tests comprehensive | `src/update/extract.test.ts` (322 lines) | 6 tests: CI layout, colon-in-path, corrupt, empty, PAX headers, truncated |
| copyDirRecursive still shells out | `src/update/perform.ts:33-39` | `execSync` with xcopy/cp-R for EXDEV fallback — not tar |
| execSync import only for copy | `src/update/perform.ts:1` | `import { execSync }` — only used by `copyDirRecursive` |
| fs.cpSync available | Node.js docs (Context7) | Available since Node 16.7+; project requires >=18 |
| No perform.test.ts | `src/update/` directory listing | Only extract.test.ts exists in update module |
| Other child_process expected | `check.ts:30`, `validate.ts:38` | `gh auth token` and `node --version` — not tar, no changes needed |
| Zero runtime deps | `package.json` | Only devDependencies; no new dependency needed for remaining fix |
| No runtime inspection | `/tmp/helix-inspect/manifest.json` | Not present — expected for CLI repo |

## Success Criteria

1. **`copyDirRecursive` uses `fs.cpSync`**: `perform.ts` lines 33–39 use `fs.cpSync(src, dest, { recursive: true })` instead of `execSync` with xcopy/cp-R.

2. **`execSync` import removed from perform.ts**: After the `fs.cpSync` change, the `execSync` import on line 1 is unused and should be removed.

3. **`perform.test.ts` added**: A new test file covers the EXDEV copy fallback behavior (directory copy with `fs.cpSync`).

4. **No `getTarExecutable()`**: No function that resolves or invokes an external tar binary is added to any file. The in-process extraction in `extract.ts` remains the sole extraction mechanism.

5. **Existing tests pass**: `npm run build` and `npm test` continue to pass.

6. **All prior acceptance criteria remain satisfied**: In-process extraction, error contract preserved, fail-closed on manual update, fail-open on auto-update.

### Scope of Changes

| Area | File | Change Type |
|---|---|---|
| EXDEV copy fallback | `src/update/perform.ts` | Modify: Replace `copyDirRecursive` body with `fs.cpSync`; remove `execSync` import |
| Perform tests | `src/update/perform.test.ts` (new) | Create: Test EXDEV copy fallback behavior |

### Files NOT Changed

| File | Reason |
|---|---|
| `src/update/extract.ts` | In-process extraction already implemented — no changes needed |
| `src/update/extract.test.ts` | Extraction tests already comprehensive — no changes needed |
| `src/update/validate.ts` | Post-extraction validation — no changes needed |
| `src/update/index.ts` | Update command handler — no changes needed |
| `src/update/check.ts` | Release discovery — out of scope |
| `src/update/version.ts` | Version display — out of scope |
| `package.json` | No new dependencies needed (fs.cpSync is a Node built-in) |
| `.github/workflows/*.yml` | CI workflows — out of scope |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|---|---|---|
| `ticket.md` (continuation context) | Scope, requirements, user's local fix description | User requests fs.cpSync + perform.test.ts; getTarExecutable contradicts ticket constraints |
| `scout/reference-map.json` | File inventory, facts, unknowns | Confirmed extract.ts is implemented, copyDirRecursive still has execSync, no perform.test.ts |
| `scout/scout-summary.md` | Analysis of current vs user's proposed state | Clear mapping of which user changes are on branch vs not |
| `repo-guidance.json` | Repository role | helix-cli is sole target; no cross-repo impact |
| `src/update/extract.ts` (source) | Verify primary fix implementation | Complete in-process extraction using gunzipSync + USTAR parsing; no external binary |
| `src/update/perform.ts` (source) | Identify remaining shell dependencies | copyDirRecursive at lines 33-39 uses execSync for xcopy/cp-R; extractTarGz call at line 125 |
| `src/update/validate.ts` (source) | Post-extraction contract | Checks dist/index.js, package.json, node --version — no changes needed |
| `src/update/index.ts` (source) | Error handling contract | Manual: exit(1); Auto: warn + continue — already preserved |
| `src/update/extract.test.ts` (source) | Test coverage verification | 6 tests covering CI layout, colon paths, corruption, empty, PAX, truncation |
| `package.json` (source) | Dependency and build constraints | Zero runtime deps, ESM, Node >=18, fs.cpSync available |
| Context7 Node.js docs | fs.cpSync API verification | Confirmed fs.cpSync(src, dest, { recursive: true }) as direct replacement |
