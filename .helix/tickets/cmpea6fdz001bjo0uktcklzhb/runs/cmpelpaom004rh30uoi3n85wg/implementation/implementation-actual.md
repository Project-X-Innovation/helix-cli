# Implementation Actual — BLD-527 (Continuation): Replace copyDirRecursive shell-out with fs.cpSync

## Summary of Changes

Replaced the shell-based `copyDirRecursive` function in `src/update/perform.ts` with `fs.cpSync(src, dest, { recursive: true })`. This eliminates the last `execSync` usage in `perform.ts`, which shelled out to `xcopy` on Windows and `cp -R` on POSIX for the EXDEV cross-filesystem rename fallback. Removed the now-unused `import { execSync } from "node:child_process"` and added `cpSync` to the `node:fs` import. Created `src/update/perform.test.ts` with 4 test cases covering `getInstallRoot()`, static module structure verification, and `cpSync`-based directory copy behavior. Zero new dependencies. 61/61 tests pass.

## Files Changed

| File | Why Changed | Review Hotspot |
|------|-------------|----------------|
| `src/update/perform.ts` | **Modified.** (1) Removed `import { execSync } from "node:child_process"` (was line 1). (2) Added `cpSync` to `node:fs` import. (3) Replaced `copyDirRecursive` body from `execSync(xcopy/cp-R)` to `cpSync(src, dest, { recursive: true })`. | EXDEV fallback path — `safeRename` calls `copyDirRecursive` when `renameSync` throws EXDEV. The swap/rollback blocks at lines 158-216 use `safeRename`, so any regression in copy behavior affects update integrity. |
| `src/update/perform.test.ts` | **New.** 4 test cases in 3 describe blocks: `getInstallRoot` (2 tests), `perform.ts module structure` (1 static verification test), `fs.cpSync-based directory copy` (1 behavioral test). | New test file — uses only `node:*` imports. Static verification test reads `src/update/perform.ts` source and asserts absence of `execSync`/`child_process` and presence of `cpSync`. |

## Steps Executed

### Step 1: Replace `copyDirRecursive` body and update imports in `src/update/perform.ts`

Modified `src/update/perform.ts` with three targeted edits:

1. **Removed `execSync` import** (line 1): Deleted `import { execSync } from "node:child_process";` entirely. After replacing `copyDirRecursive`, no code in `perform.ts` calls `execSync`.

2. **Added `cpSync` to `node:fs` import** (lines 2-9): Added `cpSync` to the destructured import. Resulting import: `copyFileSync`, `cpSync`, `existsSync`, `mkdirSync`, `renameSync`, `rmSync`, `writeFileSync`.

3. **Replaced `copyDirRecursive` function body** (line 34): From `execSync(process.platform === "win32" ? 'xcopy ...' : 'cp -R ...')` to `cpSync(src, dest, { recursive: true })`. Function signature, JSDoc, and all callers unchanged.

### Step 2: Create `src/update/perform.test.ts`

Created `src/update/perform.test.ts` (117 lines) following the project's established test patterns (`node:test` describe/it, `node:assert` strict, `mkdtempSync` for isolation, `afterEach` cleanup):

1. **`getInstallRoot()` resolves to a directory that exists**: Calls `getInstallRoot()`, verifies the returned path is a non-empty string and resolves to an existing directory.

2. **`getInstallRoot()` returns a path containing `package.json`**: Calls `getInstallRoot()`, joins with `package.json`, verifies the file exists.

3. **`perform.ts` does not contain `execSync` or `child_process` (static verification)**: Reads `src/update/perform.ts` source via `readFileSync`, asserts it does NOT contain `execSync` or `child_process`, and DOES contain `cpSync`.

4. **`fs.cpSync`-based directory copy works correctly**: Creates a temp directory structure matching the update payload layout (`dist/`, `skill-content/`, `package.json`, `build-metadata.json`), copies via `cpSync(src, dest, { recursive: true })` (same API call as `copyDirRecursive`), verifies all files exist with correct content.

### Step 3: Run quality gates

Ran `npm install`, `npm run build`, `npm test`, and `node dist/index.js --version`. All passed.

## Verification Commands Run + Outcomes

| Command | Exit Code | Result |
|---------|-----------|--------|
| `npm install` | 0 | Dependencies installed (3 packages, 0 vulnerabilities) |
| `npm run build` (`tsc`) | 0 | Compiled to `dist/`; `dist/update/perform.js` (8148 bytes) and `dist/update/perform.test.js` (3790 bytes) generated |
| `npm test` | 0 | 61 tests passed, 0 failed, 0 skipped across 21 suites |
| `node dist/index.js --version` | 0 | Output: `1.3.4` |
| `grep -n "execSync\|child_process" src/update/perform.ts` | 0 matches | No `execSync` or `child_process` anywhere in perform.ts |
| `grep -rn "execSync.*tar\|spawnSync.*tar" src/update/` | 1 match | Only a JSDoc comment in `extract.ts:55` — no code invocations |
| `grep -rn "getTarExecutable" src/update/` | 0 matches | No tar executable resolution function exists |
| `grep -rn "execSync\|spawnSync" src/update/` | expected matches only | `check.ts:1,30` (gh auth token), `validate.ts:1,38` (node --version), `extract.ts:55` (JSDoc), `perform.test.ts:59,64,65` (test assertions). Zero in `perform.ts`. |
| `ls dist/update/perform.js dist/update/perform.test.js` | 0 | Both compiled files exist |

## Test/Build Results

- **TypeScript build:** PASS — zero errors, `tsc` exits 0
- **Tests:** PASS — 61/61 tests passed (flags: 14, resolve-ticket: 18, skill: 19, extract: 6, perform: 4)
- **CLI --version:** PASS — outputs `1.3.4`

## Deviations from Plan

None. Implementation follows the plan exactly in all three steps.

## Known Limitations / Follow-ups

1. **No end-to-end `hlx update` test in CI:** The extraction/copy behavior is tested via unit tests. A full end-to-end test of `hlx update` against a live GitHub release requires CI infrastructure and network access, which is outside this ticket's scope.
2. **EXDEV fallback path not directly exercised in unit tests:** Testing `safeRename`'s EXDEV fallback requires either exporting the private function or mocking `renameSync` to throw EXDEV. The `cpSync` behavior is validated indirectly via test case 4 (same API call). The user's local e2e simulation confirmed the fallback works.

## Spec Deviations

None.

## Verification Plan Results

| Check ID | Outcome | Evidence |
|----------|---------|----------|
| CHK-01 | **pass** | `npm run build` exits 0. `ls dist/update/perform.js dist/update/perform.test.js` confirms both compiled files exist (8148 and 3790 bytes respectively). |
| CHK-02 | **pass** | `npm test` exits 0. Output: 61 tests, 21 suites, 61 pass, 0 fail. All 4 new `perform.test.ts` tests pass alongside all 57 existing tests (flags: 14, resolve-ticket: 18, skill: 19, extract: 6). |
| CHK-03 | **pass** | `grep -n "execSync\|child_process" src/update/perform.ts` returns zero matches. The `execSync` import and all shell-out calls have been fully removed from `perform.ts`. |
| CHK-04 | **pass** | `grep -rn "execSync.*tar\|spawnSync.*tar" src/update/` — only match is a JSDoc comment in `extract.ts:55` describing the prior implementation. No code invocations. Separate `grep -rn "execSync\|spawnSync" src/update/` confirms only `check.ts` (gh auth token) and `validate.ts` (node --version) remain — no usage in `perform.ts`. |
| CHK-05 | **pass** | `node dist/index.js --version` exits 0, outputs `1.3.4`. |
| CHK-06 | **pass** | `grep -rn "getTarExecutable" src/update/` returns zero matches. No function that resolves or selects an external tar binary exists. |

All 6 required checks pass. Self-verification is complete.

## APL Statement Reference

Replaced the shell-based `copyDirRecursive` function in `src/update/perform.ts` with `fs.cpSync(src, dest, { recursive: true })`, removed the unused `node:child_process` import, and created `src/update/perform.test.ts` with 4 test cases. `npm run build` and `npm test` (61/61) pass. No new runtime dependencies. No `getTarExecutable` function was introduced — the in-process extraction in `extract.ts` already eliminates the external tar dependency. `package.json` is unchanged — zero runtime dependencies maintained.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` (continuation context) | Scope, requirements, user's local fix description, constraints | User requests fs.cpSync + perform.test.ts; getTarExecutable contradicts ticket constraints; in-process extraction already done |
| `implementation-plan/implementation-plan.md` | Step-by-step implementation guide and verification plan (6 checks) | 3 steps: perform.ts modification, perform.test.ts creation, quality gates |
| `tech-research/tech-research.md` | Architecture decision and API design | Option A (fs.cpSync) chosen; Decision 1 (remove child_process import); Decision 2 (don't export copyDirRecursive); Decision 3 (no getTarExecutable); Decision 4 (perform.test.ts scope) |
| `diagnosis/diagnosis-statement.md` | Root cause analysis, success criteria, change scope | copyDirRecursive lines 33-39 identified as remaining fix; execSync import removal; getTarExecutable superseded |
| `verification/verification-actual.md` | Prior verification findings to address | CHK-03 noted execSync still in perform.ts at lines 1,34 — now fixed |
| `scout/reference-map.json` | File inventory, facts, unknowns | Confirmed extract.ts is implemented; copyDirRecursive still has execSync; no perform.test.ts |
| `product/product.md` | Product spec, user scenarios | SCN-05 covers EXDEV swap; essential feature #4 is copyDirRecursive replacement |
| `src/update/perform.ts` (lines 1-246) | Direct inspection of code to change | execSync at line 34 in copyDirRecursive; import at line 1; extractTarGz wired at line 125 |
| `src/update/extract.test.ts` (lines 1-40) | Test patterns for perform.test.ts | node:test describe/it; node:assert strict; mkdtempSync; afterEach cleanup |
| `package.json` | Dependencies, build scripts, engine requirement | Zero runtime deps; Node >=18; ESM; tsc-only build |
