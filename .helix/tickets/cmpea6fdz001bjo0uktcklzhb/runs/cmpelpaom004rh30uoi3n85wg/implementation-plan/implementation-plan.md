# Implementation Plan — BLD-527 (Continuation): Replace copyDirRecursive shell-out with fs.cpSync

## Overview

The primary tar extraction bug is **already fixed** on this branch: `src/update/extract.ts` provides complete in-process tar.gz extraction using only Node.js built-ins, and `perform.ts:125` calls `extractTarGz()` instead of shelling out to `tar`. Comprehensive tests exist in `extract.test.ts` (6 test cases).

The remaining work is a targeted robustness improvement: replace the `copyDirRecursive` function in `src/update/perform.ts` (lines 33–39), which still shells out to `xcopy` (Windows) or `cp -R` (POSIX) via `execSync`, with `fs.cpSync(src, dest, { recursive: true })`. This eliminates the last unnecessary shell dependency in the update orchestration module. After the replacement, the `execSync` import from `node:child_process` has zero callers in `perform.ts` and must be removed. A new `src/update/perform.test.ts` test file will be added.

**Files modified:** `src/update/perform.ts` (replace `copyDirRecursive` body, update imports)
**Files created:** `src/update/perform.test.ts` (new test file)
**Files NOT changed:** `src/update/extract.ts`, `src/update/extract.test.ts`, `src/update/validate.ts`, `src/update/index.ts`, `src/update/check.ts`, `src/update/version.ts`, `package.json`, `tsconfig.json`, `.github/workflows/*`

## Implementation Principles

1. **Minimal change surface**: Only `copyDirRecursive` body and the import block in `perform.ts` change. The download, extraction, validation, swap, and cleanup stages are untouched.
2. **Zero new dependencies**: `fs.cpSync` is a Node.js built-in API from `node:fs`, available since Node 16.7.0. The project requires Node >=18, so it is unconditionally available.
3. **Preserve error contract**: `cpSync` throws on failure, which is caught by the existing try/catch at `perform.ts:163`. No change to `performStagedUpdate`'s function signature or callers.
4. **No getTarExecutable**: The ticket explicitly forbids hardcoding `C:\Windows\System32\tar.exe` or detecting GNU tar at runtime. The in-process extraction in `extract.ts` already eliminates the external tar dependency. Do not add any tar executable resolution function.
5. **Synchronous approach**: Matches the existing synchronous `safeRename` → `copyDirRecursive` call chain. The payload is small (< 15MB); `cpSync` is the appropriate API.

## Implementation Steps Summary

| Step | Goal | Deliverable |
|------|------|-------------|
| 1 | Replace `copyDirRecursive` body with `fs.cpSync` and update imports | Modified `src/update/perform.ts` |
| 2 | Create perform.test.ts with tests for getInstallRoot and directory copy behavior | New `src/update/perform.test.ts` |
| 3 | Run quality gates to verify build and all tests pass | Passing `npm run build`, `npm test` |

## Detailed Implementation Steps

### Step 1: Replace `copyDirRecursive` body and update imports in `src/update/perform.ts`

**Goal:** Eliminate the last `execSync` usage in `perform.ts` by replacing the shell-based directory copy with `fs.cpSync`.

**What to Build:**

Modify `src/update/perform.ts` with these changes:

1. **Remove the `execSync` import** (line 1):
   Delete the line `import { execSync } from "node:child_process";` entirely. After replacing `copyDirRecursive`, no code in `perform.ts` calls `execSync`.

2. **Add `cpSync` to the existing `node:fs` import** (lines 2–9):
   Add `cpSync` to the destructured import from `"node:fs"`. The resulting import should include: `copyFileSync`, `cpSync`, `existsSync`, `mkdirSync`, `renameSync`, `rmSync`, `writeFileSync`.

3. **Replace `copyDirRecursive` function body** (lines 33–39):
   Replace the current body:
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
   With:
   ```typescript
   function copyDirRecursive(src: string, dest: string): void {
     cpSync(src, dest, { recursive: true });
   }
   ```

4. **No other changes** to `perform.ts`. The function signature, JSDoc comments, `safeRename`, `performStagedUpdate`, and all other code remain identical.

**Verification (AI Agent Runs):**
```bash
npx tsc --noEmit
grep -n "execSync" src/update/perform.ts  # Should return zero results
grep -n "child_process" src/update/perform.ts  # Should return zero results
grep -n "cpSync" src/update/perform.ts  # Should show the import and the function body
```

**Success Criteria:**
- `perform.ts` does not import from `node:child_process`.
- `perform.ts` imports `cpSync` from `node:fs`.
- `copyDirRecursive` body is `cpSync(src, dest, { recursive: true })`.
- No `execSync` call remains in `perform.ts`.
- File compiles with `tsc --noEmit`.

---

### Step 2: Create `src/update/perform.test.ts`

**Goal:** Add test coverage for the perform module, specifically `getInstallRoot()` (already exported) and a static verification that `perform.ts` has no remaining `execSync` calls.

**What to Build:**

Create `src/update/perform.test.ts` following the project's established test patterns (observed in `src/update/extract.test.ts`):
- `node:test` (describe/it)
- `node:assert` (strict)
- Only `node:*` imports

**Test cases:**

1. **`getInstallRoot()` resolves to a directory that exists**: Call `getInstallRoot()`, verify the returned path is a non-empty string and that it resolves to an existing directory (the package root). This validates the `import.meta.url` → file path → `join(thisDir, '..', '..')` logic.

2. **`getInstallRoot()` returns a path containing `package.json`**: Call `getInstallRoot()`, join the result with `package.json`, verify the file exists via `existsSync`. This confirms the resolved root is the actual package directory.

3. **`copyDirRecursive` uses `fs.cpSync` (static verification)**: Read `perform.ts` source file via `readFileSync` (relative to `import.meta.url`), verify it does NOT contain `execSync` or `child_process`, and verify it DOES contain `cpSync`. This is a static structural check that the shell dependency has been eliminated.

4. **`fs.cpSync`-based directory copy works correctly**: Create a temp directory structure with nested files, call `cpSync(src, dest, { recursive: true })` directly (the same API call that `copyDirRecursive` delegates to), verify the destination contains all expected files with correct content. Use `mkdtempSync` for isolation and `afterEach` cleanup.

**Verification (AI Agent Runs):**
```bash
npm test
```

**Success Criteria:**
- `src/update/perform.test.ts` exists with all 4 test cases.
- Tests use only `node:*` imports.
- All test cases pass when run via `npm test`.
- Temp directories are cleaned up in `afterEach`.

---

### Step 3: Run quality gates

**Goal:** Confirm the full build and test suite pass end-to-end with no regressions.

**What to Build:** No new code. Run existing quality gates.

**Verification (AI Agent Runs):**
```bash
cd /vercel/sandbox/workspaces/cmpelpaom004rh30uoi3n85wg/helix-cli
npm install
npm run build
npm test
node dist/index.js --version
```

**Success Criteria:**
- `npm run build` (tsc) exits 0.
- `npm test` (tsc + node --test) exits 0 with all tests passing (existing tests in `extract.test.ts`, `flags.test.ts`, `resolve-ticket.test.ts`, `skill.test.ts`, plus new `perform.test.ts`).
- `node dist/index.js --version` produces output containing a version string.

---

## Verification Plan

### Pre-conditions

| # | Dependency | Status | Source/Evidence | Affects checks |
|---|-----------|--------|----------------|----------------|
| 1 | Node.js >= 18 installed | available | `package.json` engines field `>=18`; sandbox environment | CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, CHK-06 |
| 2 | npm installed | available | Required for `npm run build` / `npm test` | CHK-01, CHK-02, CHK-05 |
| 3 | TypeScript compiler available via devDependencies | available | `package.json` devDependencies: `typescript: ^6.0.2`; installed via `npm install` | CHK-01, CHK-02, CHK-05 |
| 4 | Repository cloned with all source files | available | Workspace at `/vercel/sandbox/workspaces/cmpelpaom004rh30uoi3n85wg/helix-cli` | CHK-01 through CHK-06 |
| 5 | `npm install` run to install devDependencies | unknown | Must run before build/test quality gates | CHK-01, CHK-02, CHK-05 |

### Required Checks

[CHK-01] **TypeScript build passes with updated perform.ts**
- Action: Run `npm install && npm run build` in the helix-cli repository root.
- Expected Outcome: The command exits with code 0. No type errors. `dist/update/perform.js` is generated without any `child_process` import. `dist/update/perform.test.js` is generated.
- Required Evidence: Full command output showing successful compilation with exit code 0. Output of `ls -la dist/update/perform.js dist/update/perform.test.js` confirming both files exist.

[CHK-02] **All tests pass including new perform.test.ts**
- Action: Run `npm test` in the helix-cli repository root.
- Expected Outcome: The command exits with code 0. All test files pass, including the new `perform.test.js` with all 4 test cases and the existing `extract.test.js` with all 6 test cases. Existing tests (`flags.test.js`, `resolve-ticket.test.js`, `skill.test.js`) continue to pass.
- Required Evidence: Full `npm test` output showing all test files and individual test case pass/fail status. Zero failures or errors.

[CHK-03] **No `execSync` or `child_process` import remains in perform.ts**
- Action: Run `grep -n "execSync\|child_process" src/update/perform.ts` in the helix-cli repository root.
- Expected Outcome: The grep command produces zero matching lines. The `execSync` import and all shell-out calls have been fully removed from `perform.ts`.
- Required Evidence: Command output showing zero matches (empty output or "no match" indication), plus the grep exit code.

[CHK-04] **No external tar invocation remains in update module**
- Action: Run `grep -rn "execSync.*tar\|spawnSync.*tar" src/update/` in the helix-cli repository root.
- Expected Outcome: Zero matches. The only remaining `execSync` and `spawnSync` usages in the update module are: (a) `check.ts` — `execSync('gh auth token')` for GitHub auth, (b) `validate.ts` — `spawnSync('node')` for version check. Neither involves tar.
- Required Evidence: Output of the grep command showing zero matches. Additionally, output of `grep -rn "execSync\|spawnSync" src/update/` showing only the `check.ts` and `validate.ts` usages — no usage in `perform.ts`.

[CHK-05] **CLI version command works after build**
- Action: Run `node dist/index.js --version` in the helix-cli repository root after a successful build.
- Expected Outcome: The command exits with code 0 and produces output containing a version string (e.g., `1.3.4` with optional commit SHA).
- Required Evidence: Command output showing the version string and exit code 0.

[CHK-06] **No getTarExecutable function exists in the update module**
- Action: Run `grep -rn "getTarExecutable" src/update/` in the helix-cli repository root.
- Expected Outcome: Zero matches. No function that resolves or selects an external tar binary exists in the update module.
- Required Evidence: Command output showing zero matches (empty output or "no match" indication).

## Success Metrics

1. `copyDirRecursive` in `src/update/perform.ts` uses `cpSync(src, dest, { recursive: true })` instead of `execSync` with xcopy/cp-R.
2. `perform.ts` does not import from `node:child_process` — the import line is fully removed.
3. `cpSync` is imported from `node:fs` in `perform.ts`.
4. `src/update/perform.test.ts` exists with 4 test cases covering `getInstallRoot()`, static verification, and `cpSync`-based copy behavior.
5. `npm run build` and `npm test` exit 0 with zero failures.
6. `node dist/index.js --version` produces version output.
7. No `getTarExecutable()` function exists anywhere in `src/update/`.
8. No remaining external tar invocation in any `src/update/` file.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` (continuation context) | Scope, requirements, user's local fix description, constraints | User requests fs.cpSync + perform.test.ts; getTarExecutable contradicts ticket constraints; in-process extraction already done |
| `scout/scout-summary.md` | Current branch state, remaining work | Primary fix (extract.ts) done; copyDirRecursive still has execSync; no perform.test.ts; zero runtime deps |
| `scout/reference-map.json` | File inventory, facts, unknowns | 3 remaining execSync usages (none tar); fs.cpSync available; getTarExecutable not on branch |
| `diagnosis/diagnosis-statement.md` | Root cause analysis, success criteria, change scope | copyDirRecursive lines 33-39 identified as remaining fix; execSync import removal; getTarExecutable superseded |
| `diagnosis/apl.json` | Structured Q&A with evidence | fs.cpSync confirmed as direct replacement; getTarExecutable contradicts Do Not Re-Decide |
| `product/product.md` | Product spec, user scenarios | SCN-05 covers EXDEV swap; essential feature #4 is copyDirRecursive replacement |
| `tech-research/tech-research.md` | Architecture decision, API design, test strategy | Option A (fs.cpSync) chosen; Decision 1 (remove child_process); Decision 2 (don't export for testing); Decision 4 (perform.test.ts scope) |
| `tech-research/apl.json` | Structured tech decisions | cpSync(src, dest, { recursive: true }) replaces entire function body; execSync import removable |
| `repo-guidance.json` | Repository role | helix-cli is sole target; no cross-repo impact |
| `src/update/perform.ts` (lines 1-246) | Direct inspection of code to change | execSync at line 34 in copyDirRecursive; import at line 1; fs imports at lines 2-9; extractTarGz wired at line 125 |
| `src/update/extract.ts` (lines 1-149) | Verify primary fix is already complete | In-process extraction using gunzipSync + USTAR parsing; no external binary; no changes needed |
| `src/update/extract.test.ts` (lines 1-30) | Test patterns for perform.test.ts | node:test describe/it; node:assert strict; mkdtempSync; afterEach cleanup; gzipSync for fixtures |
| `src/update/validate.ts` (lines 1-66) | Other child_process usages | spawnSync('node') for version check — expected, not tar, no change needed |
| `package.json` (lines 1-44) | Dependencies, build, engine | Zero runtime deps; Node >=18; ESM; tsc-only build; test: tsc && node --test |
