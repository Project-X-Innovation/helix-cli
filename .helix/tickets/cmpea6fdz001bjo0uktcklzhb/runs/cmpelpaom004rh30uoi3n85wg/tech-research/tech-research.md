# Tech Research — BLD-527 (Continuation): Replace copyDirRecursive shell-out with fs.cpSync

## Technology Foundation

- **Runtime**: Node.js >= 18 (declared in `package.json` engines, line 17)
- **Module system**: ESM (`"type": "module"`, ES2022 target, Node16 resolution)
- **Build**: TypeScript 6.x compiled via `tsc` to `dist/`
- **Test runner**: Node.js built-in `node:test` (describe/it) + `node:assert` (strict)
- **Current runtime dependencies**: Zero — entire codebase uses only `node:*` built-in modules and relative path imports
- **Release tarball contents**: `dist/`, `skill-content/`, `package.json`, `build-metadata.json` only (no `node_modules/`)

### Current Branch State

The primary tar extraction bug is **already fixed** on this branch:

| Component | Status | Location |
|-----------|--------|----------|
| In-process tar.gz extraction | Done | `src/update/extract.ts` (149 lines) — `gunzipSync` + manual USTAR header parsing |
| Extraction tests | Done | `src/update/extract.test.ts` (322 lines) — 6 test cases covering CI layout, colon-in-path, corruption, empty archive, PAX headers, truncated entry |
| `perform.ts` extraction call site | Done | Line 125 calls `extractTarGz(tarballPath, stagingDir)` instead of `execSync('tar -xzf ...')` |

**Remaining issue**: `copyDirRecursive` in `perform.ts` (lines 33–39) still shells out to `xcopy` (Windows) or `cp -R` (POSIX) via `execSync` for the EXDEV cross-filesystem rename fallback. This is an unnecessary shell dependency that should be replaced with `fs.cpSync`.

## Architecture Decision

### Problem

`perform.ts` lines 33–39 define `copyDirRecursive`, which uses `execSync` with platform-conditional commands:

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

This function is called by `safeRename` (line 53) when `renameSync` fails with EXDEV (cross-filesystem). While not a tar invocation (acceptance criteria #3 is already satisfied), it is an unnecessary shell dependency with the same class of risk as the original tar bug: platform-specific binary availability, PATH ordering, and path-quoting edge cases.

### Options Considered

#### Option A: Replace with `fs.cpSync(src, dest, { recursive: true })` — CHOSEN

Replace the function body with a single `fs.cpSync` call. Remove the `execSync` import from `node:child_process` (now unused). Add `cpSync` to the existing `node:fs` import.

**Pros:**
- Cross-platform in a single call — no platform branching needed
- In-process — no external binary, no PATH dependency, no path-quoting issues
- Available since Node 16.7.0; project requires >=18
- Consistent with the zero-dependency, `node:*`-only import pattern used throughout the codebase
- Eliminates the last remaining `execSync` call in `perform.ts`, allowing full removal of the `node:child_process` import
- `force: true` (default) handles existing files; `recursive: true` copies the full tree
- Throws on failure, preserving the existing error propagation via `safeRename`'s caller try/catch (line 163)

**Cons:**
- None material. `fs.cpSync` is stable, cross-platform, and directly equivalent

#### Option B: Keep current `execSync` with `xcopy`/`cp -R` — REJECTED

Leave the code unchanged.

**Pros:**
- No change, no risk of introducing a regression

**Cons:**
- Retains unnecessary shell dependency in the update module
- `xcopy` has path-quoting edge cases on Windows (similar class of bug to the original tar issue)
- Inconsistent with the fix direction: the ticket eliminated the external tar binary for extraction, but left an external binary for copying
- The user's continuation context explicitly requests this replacement

#### Option C: Use `fs.promises.cp()` (async) — REJECTED

Use the async variant instead of the synchronous one.

**Pros:**
- Non-blocking

**Cons:**
- `safeRename` (line 46) and `copyDirRecursive` (line 33) are synchronous functions
- Making them async would require making `safeRename` async, which propagates to every call site in the swap block (lines 163–186)
- No benefit: the copy is small (dist/, skill-content/, two JSON files), brief in duration, and runs during an interactive `hlx update` where blocking for milliseconds is acceptable

### Chosen Option: A — `fs.cpSync`

**Rationale:** `fs.cpSync` is a direct, in-process, cross-platform replacement. It removes the last `execSync` call in `perform.ts`, aligning the module fully with the in-process approach taken for extraction. The project's Node >=18 requirement guarantees availability. No other option offers a better tradeoff.

## Core API/Methods

### `fs.cpSync(src, dest, options)` — from `node:fs`

Per Context7 Node.js docs:

- **`src`** (string) — source path to copy
- **`dest`** (string) — destination path to copy to
- **`options.recursive`** (boolean, default `false`) — must be set to `true` to copy directory trees
- **`options.force`** (boolean, default `true`) — overwrite existing files/directories
- **`options.dereference`** (boolean, default `false`) — dereference symlinks (not relevant; no symlinks in payload)
- **`options.errorOnExist`** (boolean, default `false`) — throw if destination exists when force is false
- **Throws** on failure — integrates with existing try/catch at `perform.ts:163`

Usage in `copyDirRecursive`:

```
function copyDirRecursive(src: string, dest: string): void {
  cpSync(src, dest, { recursive: true });
}
```

### Import changes in `perform.ts`

- **Remove**: `import { execSync } from "node:child_process";` (line 1) — no remaining callers
- **Add `cpSync`** to existing `node:fs` import (lines 2–9):
  ```
  import {
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    renameSync,
    rmSync,
    writeFileSync,
  } from "node:fs";
  ```

## Technical Decisions

### Decision 1: Remove `node:child_process` import entirely from `perform.ts`

**Chosen: Yes — remove the import**

Rationale:
- After replacing `copyDirRecursive`, `execSync` has zero callers in `perform.ts`
- The import is dead code and should be cleaned up
- Other files in the update module that use `child_process` (`check.ts:1` for `gh auth token`, `validate.ts:1` for `spawnSync('node')`) are unaffected — they have their own imports

Evidence:
- `perform.ts:1` — `import { execSync } from "node:child_process"` — only used at line 34
- `perform.ts:34` — the sole `execSync` call, replaced by `cpSync`

### Decision 2: Do NOT export `copyDirRecursive` for testing

**Chosen: Keep `copyDirRecursive` private; test indirectly**

Rationale:
- `copyDirRecursive` is a 1-line function after the fix: `cpSync(src, dest, { recursive: true })`
- There is no meaningful logic to test in the function body itself — it is a trivial delegation
- The meaningful behavior to verify is that `safeRename` correctly falls back to copy+delete on EXDEV
- Testing `safeRename` indirectly through `performStagedUpdate` requires mocking the full download/extract/validate chain — too high setup cost for a 1-line function
- Instead, `perform.test.ts` should test `getInstallRoot()` (already exported) and document the EXDEV path as covered by integration-level verification
- The user's continuation context mentions `perform.test.ts` — a lightweight test file covering `getInstallRoot()` and confirming no remaining `execSync` tar calls satisfies the intent

### Decision 3: Do NOT incorporate `getTarExecutable()` from user's continuation context

**Chosen: Do not add any tar executable resolution function**

Rationale:
- The ticket's "Do Not Re-Decide" section explicitly states: *"Do not paper over the bug by detecting and rejecting GNU tar at runtime, or by hardcoding `C:\Windows\System32\tar.exe`. The fix must remove the shell dependency entirely."*
- The in-process extraction in `extract.ts` already fully eliminates the external tar dependency
- `getTarExecutable()` does not exist on the current branch — the superior in-process approach is already in place
- Adding it would reintroduce an external binary dependency that the extraction fix eliminates

Evidence:
- Ticket "Do Not Re-Decide" constraints
- `extract.ts` already provides complete in-process extraction — no external binary invoked
- `perform.ts:125` calls `extractTarGz()`, not any shell-based tar command

### Decision 4: `perform.test.ts` scope

**Chosen: Lightweight test file covering `getInstallRoot()` and confirming module structure**

Rationale:
- `getInstallRoot()` (line 24) is the only non-`performStagedUpdate` export and has testable behavior: it resolves the package install root relative to the running file's location using `import.meta.url`
- `copyDirRecursive` after the fix is `cpSync(src, dest, { recursive: true })` — a trivial delegation to a Node.js built-in; the built-in itself does not need unit testing
- `safeRename` is module-private and exercises `renameSync` with fallback to `copyDirRecursive` — testing it requires either exporting it or mocking `renameSync` to throw EXDEV
- The primary verification that the EXDEV path works is the user's local e2e simulation (confirmed passing) and the behavioral verification step
- `perform.test.ts` adds value by: (a) testing `getInstallRoot()`, (b) being a named test file that confirms the module compiles and loads

## Technical Checks

[TCK-01] copyDirRecursive uses fs.cpSync instead of execSync
- Decision Reference: "Replace copyDirRecursive body with fs.cpSync(src, dest, { recursive: true })"
  (from Architecture Decision, Option A)
- Verification Method: code-inspection
- Expected Evidence: `perform.ts` lines 33-39 contain `cpSync(src, dest, { recursive: true })`. No `execSync` call remains in `copyDirRecursive`.

[TCK-02] node:child_process import removed from perform.ts
- Decision Reference: "Remove node:child_process import entirely from perform.ts"
  (from Technical Decision 1)
- Verification Method: code-inspection
- Expected Evidence: `perform.ts` has no `import` from `"node:child_process"`. The `cpSync` function is imported from `"node:fs"`.

[TCK-03] cpSync added to node:fs import in perform.ts
- Decision Reference: "Add cpSync to existing node:fs import"
  (from Core API/Methods, import changes)
- Verification Method: code-inspection
- Expected Evidence: The `node:fs` import in `perform.ts` includes `cpSync` alongside the existing imports (`copyFileSync`, `existsSync`, `mkdirSync`, `renameSync`, `rmSync`, `writeFileSync`).

[TCK-04] No getTarExecutable function exists in the update module
- Decision Reference: "Do NOT incorporate getTarExecutable() from user's continuation context"
  (from Technical Decision 3)
- Verification Method: code-inspection
- Expected Evidence: Grep for `getTarExecutable` across `src/update/` returns zero results. No function resolves or selects an external tar binary.

[TCK-05] No remaining external tar invocation in update module
- Decision Reference: "In-process extraction eliminates external tar dependency"
  (from prior tech-research Architecture Decision, already implemented)
- Verification Method: code-inspection
- Expected Evidence: Grep for `execSync` and `spawnSync` in `src/update/` finds only: (1) `check.ts:30` — `execSync('gh auth token')` for GitHub auth, (2) `validate.ts:38` — `spawnSync('node')` for version check. Neither is a tar invocation. `perform.ts` has zero `execSync`/`spawnSync` calls.

[TCK-06] perform.test.ts exists and passes
- Decision Reference: "perform.test.ts scope — lightweight test file"
  (from Technical Decision 4)
- Verification Method: behavioral
- Expected Evidence: `src/update/perform.test.ts` exists. `npm test` includes it in the test run and all tests pass.

## Cross-Platform Considerations

| Platform | `copyDirRecursive` before fix | `copyDirRecursive` after fix |
|----------|-------------------------------|------------------------------|
| **Windows** | `execSync('xcopy ...')` — depends on xcopy availability and path quoting | `cpSync(src, dest, { recursive: true })` — in-process, no binary dependency |
| **macOS** | `execSync('cp -R ...')` — depends on cp availability | Same in-process call |
| **Linux** | `execSync('cp -R ...')` — depends on cp availability | Same in-process call |

Key platform notes:
- `fs.cpSync` is implemented within the Node.js runtime and handles platform-specific filesystem operations internally
- No path-quoting issues because paths are passed as function arguments, not interpolated into a shell command string
- The EXDEV fallback triggers when staging and install directories are on different filesystems — this can happen on any platform but is most common on Linux with separate mount points

## Performance Expectations

| Metric | Current (`execSync xcopy/cp -R`) | After (`fs.cpSync`) |
|--------|----------------------------------|---------------------|
| Copy time (small dir tree) | ~100-300ms (process spawn + copy) | ~10-50ms (no process spawn overhead) |
| Memory peak | Low (external process) | Low (in-process filesystem operations) |
| Platform uniformity | Platform-branching code | Single cross-platform call |

The EXDEV fallback copies a small payload: `dist/` (compiled JS), `skill-content/`, `package.json`, `build-metadata.json`. Total payload is < 15MB. `fs.cpSync` should be faster than `execSync` due to eliminating process spawn overhead.

## Dependencies

### Runtime dependencies added: None

`fs.cpSync` is a Node.js built-in API from `node:fs`, available since Node 16.7.0. The project requires Node >=18.

### Dev dependencies added: None

Tests use the same `node:test` + `node:assert` + `node:fs` built-in modules used by existing tests.

### Why no npm dependency

The release tarball published by CI contains `dist/`, `skill-content/`, `package.json`, and `build-metadata.json` — **no `node_modules/`** (confirmed in `.github/workflows/build-release.yml` lines 37–43). Every import in the codebase resolves to either `node:*` built-in modules or relative paths (confirmed via grep — zero third-party imports in `src/`). Adding any npm dependency would produce a bare specifier import that fails at runtime for GitHub-release-installed copies.

## Deferred to Round 2

- **Streaming extraction**: If tarball sizes grow significantly, a streaming pipeline could reduce peak memory. Not needed at current payload sizes (< 5MB compressed).
- **Replace `gh auth token` shell-out (check.ts:30)**: Not a tar invocation and out of scope. Could be replaced with direct credential file reading.
- **Windows CI runner**: Adding a Windows runner to the CI matrix would catch platform-specific regressions earlier. Currently relying on local Windows testing.

## Summary Table

| Aspect | Decision |
|--------|----------|
| **Remaining change** | Replace `copyDirRecursive` body with `fs.cpSync`; remove `execSync` import |
| **New runtime dependencies** | None (preserves zero-dependency design) |
| **New dev dependencies** | None |
| **Build system changes** | None (`tsc` remains sole build step) |
| **CI workflow changes** | None |
| **Files created** | `src/update/perform.test.ts` (tests for perform module) |
| **Files modified** | `src/update/perform.ts` (replace copyDirRecursive body; update imports) |
| **Files NOT changed** | `extract.ts`, `extract.test.ts`, `validate.ts`, `index.ts`, `check.ts`, `version.ts`, `package.json`, `tsconfig.json`, `.github/workflows/*` |
| **Error handling** | Preserved — `cpSync` throws on failure; caught by existing try/catch at line 163 |
| **Platform support** | Windows, macOS, Linux — all via single `fs.cpSync` call |
| **getTarExecutable** | Not incorporated — contradicts ticket constraints; in-process extraction already solves the problem |

## APL Statement Reference

See `tech-research/apl.json`. The remaining work is a targeted robustness improvement: replace `copyDirRecursive`'s `execSync`-based xcopy/cp-R call with `fs.cpSync(src, dest, { recursive: true })`, remove the unused `node:child_process` import, and add `perform.test.ts`. The primary tar extraction fix (`extract.ts`) is already complete and requires no changes.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` (continuation context) | Scope, requirements, user's local fix description, decision constraints | User requests fs.cpSync + perform.test.ts; getTarExecutable contradicts ticket constraints; local verification passed |
| `diagnosis/diagnosis-statement.md` | Root cause analysis, success criteria, change scope | copyDirRecursive lines 33-39 identified as remaining fix; execSync import removal after; getTarExecutable explicitly superseded |
| `diagnosis/apl.json` | Structured Q&A with evidence | Confirmed fs.cpSync as direct replacement; getTarExecutable conflicts with ticket "Do Not Re-Decide" |
| `product/product.md` | Product spec, user scenarios, success criteria | SCN-05 covers EXDEV cross-filesystem swap; essential feature #4 is copyDirRecursive replacement |
| `scout/reference-map.json` | File inventory, current code state, unknowns | Confirmed extract.ts is implemented; copyDirRecursive still has execSync; no perform.test.ts; fs.cpSync available |
| `scout/scout-summary.md` | Analysis of current vs user's proposed state | Mapping of which user changes are on branch vs not; zero runtime deps confirmed |
| `repo-guidance.json` | Repository role | helix-cli is sole target; no cross-repo impact |
| `src/update/perform.ts` (lines 1-246) | Direct inspection of remaining shell dependency | execSync at line 34 in copyDirRecursive; import at line 1; extractTarGz already wired at line 125 |
| `src/update/extract.ts` (lines 1-149) | Verify primary fix is complete | In-process extraction using gunzipSync + USTAR parsing; no external binary invoked |
| `src/update/extract.test.ts` (lines 1-322) | Verify extraction test coverage | 6 tests covering CI layout, colon paths, corruption, empty, PAX, truncation |
| `src/update/validate.ts` (lines 1-66) | Post-extraction contract | Checks dist/index.js, package.json, runs node --version; spawnSync('node') is expected, not tar |
| `src/update/check.ts` (lines 1-35) | Other execSync usage | execSync('gh auth token') — not tar, expected, no change needed |
| `package.json` (lines 1-44) | Dependencies, build scripts, engine requirement | Zero runtime deps; Node >=18; ESM; tsc-only build |
| `tsconfig.json` (lines 1-15) | Build constraints | ES2022 target, Node16 modules, strict mode, output to dist/ |
| Context7 Node.js docs | fs.cpSync API verification | Confirmed fs.cpSync(src, dest, { recursive: true }) as direct cross-platform replacement; available since Node 16.7 |
| Prior tech-research artifacts | Previous run's analysis | Confirmed no-npm-dependency constraint (no node_modules in release tarball); extraction approach already implemented |
