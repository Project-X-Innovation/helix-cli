# Code Review Actual — BLD-527 (Continuation): Replace copyDirRecursive shell-out with fs.cpSync

## Review Scope

Reviewed the continuation implementation that replaces the `execSync`-based `copyDirRecursive` function in `src/update/perform.ts` with `fs.cpSync(src, dest, { recursive: true })`, removes the unused `node:child_process` import, and adds `src/update/perform.test.ts` with 4 test cases. Additionally re-verified the prior code review's fixes (extract.ts bounds check, stale JSDoc, truncated-entry test) are still intact.

Review focus areas:
- Correctness of the `cpSync` replacement and import changes
- Error contract preservation through the `safeRename` -> `copyDirRecursive` call chain
- Test coverage adequacy in `perform.test.ts`
- Regression risk to the swap/rollback logic in `performStagedUpdate`
- No remaining unnecessary shell dependencies in `perform.ts`
- Prior review fixes still in place (extract.ts bounds check, JSDoc, test case 6)
- Ticket acceptance criteria satisfaction

## Files Reviewed

| File | Review Focus | Findings |
|------|-------------|----------|
| `src/update/perform.ts` (modified, 240 lines) | `copyDirRecursive` replacement, import changes, error propagation, swap/rollback integrity | No issues. `cpSync(src, dest, { recursive: true })` is a correct, direct replacement. `execSync` import fully removed. JSDoc at line 68 correctly says "Extract in-process via extractTarGz (no external binary)". Error contract preserved: `cpSync` throws on failure, caught by existing try/catch at line 158. |
| `src/update/perform.test.ts` (new, 117 lines) | Test structure, coverage, temp dir cleanup, import correctness | No issues. 4 test cases covering `getInstallRoot()` (2 tests), static module structure verification (1 test), `cpSync`-based directory copy behavior (1 test). Uses `node:test` describe/it pattern matching project conventions. `afterEach` cleanup properly manages temp dirs. |
| `src/update/extract.ts` (unchanged, 149 lines) | Prior review fixes still intact | Confirmed: bounds check at lines 127-131 still present. Path traversal protection at lines 105-119 intact. No regression. |
| `src/update/extract.test.ts` (unchanged, 322 lines) | Prior review test case still intact | Confirmed: test case 6 (truncated tar entry) at lines 278-321 still present and passing. |
| `src/update/validate.ts` (unchanged, 66 lines) | Compatibility with updated perform.ts | No issues. `spawnSync("node")` for version check is expected and correct — not a tar invocation. |
| `src/update/check.ts` (unchanged, 136 lines) | Remaining `execSync` usage verification | No issues. `execSync("gh auth token")` is expected — not a tar invocation, out of scope. |
| `src/update/index.ts` (unchanged, 207 lines) | Caller error handling consistency | No issues. `runUpdate()` exits non-zero on failure (fail-closed). `checkAutoUpdate()` logs warning and continues (fail-open). Both unchanged. |
| `src/update/version.ts` (unchanged, 38 lines) | Version reporting | No issues. `getPackageVersion()` reads package.json and config — unaffected by perform.ts changes. |
| `package.json` (unchanged) | No new dependencies | Correct. Zero runtime deps maintained. `cpSync` is a Node.js built-in. |

## Missed Requirements & Issues Found

### Requirements Gaps

None. All ticket requirements and acceptance criteria are met:

| Requirement | Status | Evidence |
|-------------|--------|----------|
| In-process extraction (no external tar) | Met | `extract.ts` uses `gunzipSync` + USTAR parsing. `perform.ts` calls `extractTarGz()` at line 120. Zero external tar invocations. |
| `copyDirRecursive` uses `fs.cpSync` | Met | `perform.ts` line 34: `cpSync(src, dest, { recursive: true })` |
| `execSync` import removed from `perform.ts` | Met | `grep -n 'execSync\|child_process' src/update/perform.ts` returns zero matches |
| No `getTarExecutable` function | Met | `grep -rn 'getTarExecutable' src/` returns zero matches |
| `perform.test.ts` added | Met | 4 test cases, all passing |
| Zero new runtime dependencies | Met | `package.json` unchanged; all imports are `node:*` built-ins |
| Build passes | Met | `npm run build` exits 0 |
| All tests pass | Met | `npm test` exits 0: 61 tests, 0 failures |
| CLI version works | Met | `node dist/index.js --version` outputs `1.3.4` |

### Correctness/Behavior Issues

None found. The `cpSync(src, dest, { recursive: true })` call:
- Is a direct functional equivalent of the prior `execSync('xcopy/cp -R')` call
- Throws on failure, which is caught by the try/catch at `perform.ts:158` (swap block)
- Handles the EXDEV cross-filesystem fallback correctly within `safeRename`
- Does not require platform-specific branching (eliminates the `process.platform === "win32"` conditional)

### Regression Risks

None identified. The change is confined to the `copyDirRecursive` function body (1 line) and the import block (2 lines removed, 1 line added). The function signature, callers (`safeRename` at line 48), and the entire `performStagedUpdate` flow (download, extract, validate, swap, rollback, cleanup) are unchanged.

### Code Quality/Robustness

No issues. The replacement is minimal and clean:
- Before: 5-line function body with platform branching and string interpolation into a shell command
- After: 1-line function body calling a cross-platform Node.js built-in

### Verification/Test Gaps

None material. The 4 new test cases in `perform.test.ts` provide:
1. `getInstallRoot()` resolves to an existing directory (runtime behavior)
2. `getInstallRoot()` returns a path containing `package.json` (runtime behavior)
3. Static verification that `perform.ts` has no `execSync`/`child_process` and does have `cpSync` (regression guard)
4. `cpSync`-based directory copy correctly handles a nested directory tree matching the update payload layout (behavioral validation)

The `safeRename` EXDEV fallback path is not directly unit-tested (it would require exporting the private function or mocking `renameSync`), but:
- The `cpSync` API call is tested directly via test case 4
- The user's local e2e simulation confirmed the fallback works end-to-end
- The rollback/restore logic in `performStagedUpdate` is unchanged and was previously verified

### Prior Code Review Fixes Verified

| Fix | Status | Evidence |
|-----|--------|----------|
| Bounds check in `extract.ts` (lines 127-131) | Still intact | `if (size > 0 && dataStart + size > tar.length)` guard prevents silent truncation |
| JSDoc fix in `perform.ts` (line 68) | Still intact | Says "Extract in-process via extractTarGz (no external binary)" |
| Test case 6 (truncated tar entry) in `extract.test.ts` | Still intact | Lines 278-321, passes in test run |

## Changes Made by Code Review

No code changes made. The implementation is correct, minimal, and well-scoped. All ticket requirements are satisfied. Build and all 61 tests pass.

## Remaining Risks / Deferred Items

1. **Path traversal `startsWith` without trailing separator (extract.ts:115):** The check `!fullPath.startsWith(resolvedDest)` could theoretically match a sibling directory that shares a prefix. However, this is safe in practice because: (a) `..` components are rejected first (line 108), (b) leading `/` is stripped first (line 105), and (c) `path.resolve(base, relative)` with a safe relative path always produces a path under `base/`. Could be strengthened with `resolvedDest + path.sep` in a future hardening pass. (Carried forward from prior review.)

2. **Tar format edge cases:** The parser handles USTAR format with PAX headers. Exotic features (GNU long name extensions, sparse files) are not supported. These are not produced by our CI and would fail closed with a checksum mismatch error. No action needed. (Carried forward from prior review.)

3. **No end-to-end `hlx update` test in CI:** A full e2e test of `hlx update` against a live GitHub release requires CI infrastructure and network access, outside this ticket's scope. The user's local e2e simulation confirmed the full flow works.

## Verification Impact Notes

No code review changes were made in this pass, so all verification checks remain valid without any modifications needed.

| Check ID | Impact | Status |
|----------|--------|--------|
| CHK-01 (Build passes) | No impact | Still valid |
| CHK-02 (All tests pass) | No impact — 61 tests expected | Still valid |
| CHK-03 (No execSync/child_process in perform.ts) | No impact | Still valid |
| CHK-04 (No external tar invocation) | No impact | Still valid |
| CHK-05 (CLI version works) | No impact | Still valid |
| CHK-06 (No getTarExecutable function) | No impact | Still valid |

## APL Statement Reference

Code review of the continuation implementation is complete. No issues found and no code changes made. The `copyDirRecursive` replacement with `fs.cpSync(src, dest, { recursive: true })` is correct, the `execSync` import is properly removed, and `perform.test.ts` provides adequate coverage with 4 test cases. All 61 tests pass, build succeeds, CLI version outputs `1.3.4`. Prior review fixes (extract.ts bounds check, JSDoc, truncated-entry test) remain intact. Zero runtime dependencies maintained.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` (continuation context) | Requirements, scope, constraints, acceptance criteria | fs.cpSync replacement required; getTarExecutable prohibited; in-process extraction already done |
| `implementation/implementation-actual.md` | Scope map of changed files and verification claims | 2 files changed (perform.ts modified, perform.test.ts created); 4 new tests; claims verified by direct code inspection |
| `implementation/apl.json` | Implementation structured evidence | Error contract and dependency claims verified against actual code |
| `implementation-plan/implementation-plan.md` | Intended design, 3 implementation steps, 6 verification checks | Steps 1-3 completed correctly; all 6 checks verified passing |
| `tech-research/tech-research.md` | Architecture decision: fs.cpSync over xcopy/cp-R | Option A chosen correctly; Decision 3 (no getTarExecutable) honored |
| `diagnosis/diagnosis-statement.md` | Root cause analysis, remaining issue identification | copyDirRecursive lines 33-39 identified as remaining fix; correctly fixed |
| `product/product.md` | Product spec, user scenarios, scope constraints | SCN-05 (EXDEV swap) addressed; essential feature #4 completed |
| `verification/verification-actual.md` | Prior verification context | Prior run verified 57 tests; current run has 61 (4 new from perform.test.ts) |
| `repo-guidance.json` | Repository role | helix-cli is sole target; no cross-repo impact |
| `code-review/code-review-actual.md` (prior) | Prior review findings and fixes | 3 fixes applied in prior review; all verified still intact |
| `code-review/apl.json` (prior) | Prior review structured evidence | Prior bounds check and JSDoc fixes confirmed present |
| `src/update/perform.ts` (lines 1-240) | Direct code review of changes | cpSync at line 34; no execSync/child_process; error contract preserved |
| `src/update/perform.test.ts` (lines 1-117) | Direct review of new test file | 4 tests, node:test pattern, proper cleanup, adequate coverage |
| `src/update/extract.ts` (lines 1-149) | Verify prior review fixes intact | Bounds check at lines 127-131 present; path traversal protection intact |
| `src/update/extract.test.ts` (lines 1-322) | Verify prior review test case intact | Test case 6 (truncated entry) at lines 278-321 present and passing |
| `src/update/validate.ts` (lines 1-66) | Post-extraction contract compatibility | spawnSync("node") for version check — expected, not tar |
| `src/update/check.ts` (lines 1-136) | Remaining execSync usage audit | execSync("gh auth token") — expected, not tar |
| `src/update/index.ts` (lines 1-207) | Caller error handling review | fail-closed (exit 1) and fail-open (warn+continue) preserved |
| `src/update/version.ts` (lines 1-38) | Version reporting review | Unaffected by changes |
| `package.json` (lines 1-44) | Dependencies, build scripts, engine | Zero runtime deps; Node >=18; ESM; tsc-only build |
