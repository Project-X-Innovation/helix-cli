# Verification Actual — BLD-527 (Continuation): Replace copyDirRecursive shell-out with fs.cpSync

## Plan Adaptation

The base Verification Plan defines 6 Required Checks (CHK-01 through CHK-06). The continuation context describes a targeted robustness fix: replacing `copyDirRecursive`'s `execSync` shell-out with `fs.cpSync`, removing the `node:child_process` import from `perform.ts`, and adding `perform.test.ts`. The user's continuation also mentions a `getTarExecutable()` patch that was superseded by the in-process extraction already on the branch — the ticket explicitly prohibits hardcoding tar executable paths.

The adapted plan retains all 6 base checks without modification. The continuation context does not add new checkable requirements beyond what CHK-01 through CHK-06 already cover.

| Check ID | Base Requirement | Adaptation | Rationale |
|----------|-----------------|------------|-----------|
| CHK-01 | TypeScript build passes, `dist/update/perform.js` and `dist/update/perform.test.js` generated | No change | Directly applicable |
| CHK-02 | All tests pass including new `perform.test.ts` (4 test cases) and existing `extract.test.ts` (6 test cases) | No change | Directly applicable; expect 61 total tests |
| CHK-03 | No `execSync` or `child_process` import in `perform.ts` | No change | Directly applicable |
| CHK-04 | No external tar invocation in update module | No change | Directly applicable |
| CHK-05 | CLI version command works after build | No change | Directly applicable |
| CHK-06 | No `getTarExecutable` function in update module | No change | Directly applicable |

No checks were removed. No checks were added. Coverage matches the base plan exactly.

## Outcome

**pass**

All 6 Required Checks were executed and passed with direct runtime evidence. All 3 cascade layers passed.

## Cascade Results

| Layer | Outcome | Details |
|-------|---------|---------|
| Plan Adherence | **pass** | CHK-01 through CHK-06 all verified with direct evidence |
| Technical Validation | **pass** | TCK-01 through TCK-06 all verified via code inspection and behavioral tests |
| Scenario Acceptance | **pass** | SCN-01 through SCN-07: 2 applicable and pass, 5 platform-deferred (require specific OS environments or live GitHub release infrastructure) |

## Steps Taken

1. **Environment setup** — Wrote `.env` file. Ran `npm install` which succeeded (also executed `prepare` / `npm run build` via lifecycle hook). Both completed with exit code 0.

2. **[CHK-01] TypeScript build passes with updated perform.ts** — Ran `npm run build`. Command exited with code 0, no type errors. Verified `dist/update/perform.js` (8148 bytes) and `dist/update/perform.test.js` (3790 bytes) exist. Additionally confirmed `dist/update/perform.js` contains no `child_process` import.

3. **[CHK-02] All tests pass including new perform.test.ts** — Ran `npm test`. Command exited with code 0. Output: 61 tests, 21 suites, 61 pass, 0 fail, 0 skipped. Breakdown:
   - `perform.test.ts`: 4 tests pass (`getInstallRoot` x2, module structure x1, cpSync copy x1)
   - `extract.test.ts`: 6 tests pass (CI tarball, colon-in-path, corrupt, empty, PAX, truncated entry)
   - `flags.test.ts`: 14 tests pass
   - `resolve-ticket.test.ts`: 18 tests pass
   - `skill.test.ts`: 19 tests pass

4. **[CHK-03] No execSync or child_process import in perform.ts** — Ran grep for `execSync|child_process` in `src/update/perform.ts`. Zero matches returned. The `execSync` import and all shell-out calls have been fully removed from `perform.ts`. Direct inspection of `perform.ts` lines 1-15 confirms imports are only from `node:fs`, `node:path`, `node:os`, `node:url`, and relative modules.

5. **[CHK-04] No external tar invocation in update module** — Ran grep for `execSync.*tar|spawnSync.*tar` in `src/update/`. Only match is a JSDoc comment in `extract.ts:55` describing the prior implementation — no code invocations. Separate grep for all `execSync|spawnSync` across `src/update/` confirms only: `check.ts:1,30` (`gh auth token`), `validate.ts:1,38` (`node --version`), `extract.ts:55` (JSDoc), `perform.test.ts:59,64,65` (test assertion strings). Zero in `perform.ts`.

6. **[CHK-05] CLI version command works after build** — Ran `node dist/index.js --version`. Exited with code 0. Output: `1.3.4` with informational `hlx update` message.

7. **[CHK-06] No getTarExecutable function in update module** — Ran grep for `getTarExecutable` in `src/update/`. Zero matches. No function that resolves or selects an external tar binary exists anywhere in the update module.

8. **[TCK-01] copyDirRecursive uses fs.cpSync** — Direct inspection of `src/update/perform.ts` line 34: `cpSync(src, dest, { recursive: true })`. Single-line function body, cross-platform, no shell dependency.

9. **[TCK-02] node:child_process import removed** — Direct inspection of `src/update/perform.ts` lines 1-15: no import from `node:child_process`. `cpSync` is imported from `node:fs`.

10. **[TCK-03] cpSync added to node:fs import** — Direct inspection of `src/update/perform.ts` lines 1-9: imports include `copyFileSync, cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync` from `"node:fs"`.

11. **[TCK-04] No getTarExecutable function** — Same as CHK-06. Zero matches.

12. **[TCK-05] No remaining external tar invocation** — Same as CHK-04. Only `check.ts` (`gh auth token`) and `validate.ts` (`node --version`) use child_process — neither is a tar invocation.

13. **[TCK-06] perform.test.ts exists and passes** — Ran `node --test dist/update/perform.test.js` in isolation. All 4 test cases pass: `getInstallRoot` resolves to existing dir, `getInstallRoot` path contains `package.json`, module structure has no execSync, cpSync directory copy works.

14. **[SCN-03] Corrupt tarball leaves existing install intact** — Verified via extract.test.ts test case 3: corrupt tarball throws on decompression. The `performStagedUpdate` function catches at lines 121-124 and returns `{ success: false, error }`. Live install is untouched because extraction fails before any swap step.

15. **[SCN-05] Cross-filesystem EXDEV fallback** — Verified via code inspection (`perform.ts` lines 41-60) and `perform.test.ts` test case 4 (cpSync behavioral test). The `safeRename` function falls back to `copyDirRecursive` (now `cpSync`) on EXDEV, then deletes the source. No external binary involved.

16. **Package.json verification** — Confirmed zero runtime dependencies. Only `devDependencies`: `@types/node ^25.5.0`, `typescript ^6.0.2`.

## Findings

| Check ID | Outcome | Evidence |
|----------|---------|----------|
| CHK-01 | **pass** | `npm run build` exits 0. `ls -la` confirms `dist/update/perform.js` (8148 bytes) and `dist/update/perform.test.js` (3790 bytes) exist. No `child_process` import in compiled `perform.js`. |
| CHK-02 | **pass** | `npm test` exits 0. Output: 61 tests, 21 suites, 61 pass, 0 fail. All 4 `perform.test.ts` tests, all 6 `extract.test.ts` tests, and all 51 existing tests pass. |
| CHK-03 | **pass** | `grep "execSync\|child_process" src/update/perform.ts` returns zero matches. Direct file inspection confirms no `node:child_process` import. |
| CHK-04 | **pass** | `grep "execSync.*tar\|spawnSync.*tar" src/update/` only matches a JSDoc comment in `extract.ts:55`. No code invocations. Remaining `execSync`/`spawnSync` in `check.ts` and `validate.ts` are for `gh auth token` and `node --version` respectively — not tar. |
| CHK-05 | **pass** | `node dist/index.js --version` exits 0, outputs `1.3.4`. |
| CHK-06 | **pass** | `grep "getTarExecutable" src/update/` returns zero matches. |
| TCK-01 | **pass** | `perform.ts` line 34: `cpSync(src, dest, { recursive: true })` — direct code inspection. |
| TCK-02 | **pass** | `perform.ts` has no `import` from `"node:child_process"` — direct code inspection lines 1-15. |
| TCK-03 | **pass** | `perform.ts` line 3: `cpSync` listed in `node:fs` import — direct code inspection. |
| TCK-04 | **pass** | Zero matches for `getTarExecutable` in `src/update/`. |
| TCK-05 | **pass** | Only `check.ts` (`execSync("gh auth token")`) and `validate.ts` (`spawnSync("node")`) remain. Neither is a tar invocation. `perform.ts` has zero `execSync`/`spawnSync`. |
| TCK-06 | **pass** | `node --test dist/update/perform.test.js` exits 0. All 4 test cases pass in isolation. |
| SCN-01 | **platform_deferred** | Requires Windows with Git for Windows installed — not available in sandbox environment. Code inspection confirms the fix eliminates the platform-specific code path entirely (single `cpSync` call replaces `process.platform` branching). |
| SCN-02 | **platform_deferred** | Requires macOS/Linux with a live GitHub release to test `hlx update` end-to-end. Partial evidence: build, tests, and CLI version all work correctly in Linux sandbox. |
| SCN-03 | **pass** | `extract.test.ts` test 3 confirms corrupt tarball throws. `performStagedUpdate` catches at lines 121-124 and returns `{ success: false, error }`. Live install untouched. |
| SCN-04 | **platform_deferred** | Requires triggering auto-update with a failed extraction. Code inspection of `index.ts` confirms `checkAutoUpdate()` catches errors and logs a warning without blocking the user's command. |
| SCN-05 | **pass** | `perform.test.ts` test 4 validates `cpSync` directory copy. Code inspection confirms `safeRename` EXDEV fallback at line 48 calls `copyDirRecursive` which uses `cpSync`. No external binary. |
| SCN-06 | **platform_deferred** | Requires a live GitHub release comparison. Code inspection of `check.ts` confirms the "already up to date" code path exists. |
| SCN-07 | **platform_deferred** | Requires testing against a private GitHub repo without auth. Code inspection confirms `check.ts` handles missing auth token. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `implementation-plan/implementation-plan.md` | Verification Plan with 6 Required Checks (CHK-01 through CHK-06) | Defined actions, expected outcomes, and evidence for each check |
| `implementation/implementation-actual.md` | Context about implementation steps and claimed outcomes | 2 files changed, 61 tests claimed passing — used as context only |
| `code-review/code-review-actual.md` | Review findings, no code changes made | Confirmed no issues found; prior fixes intact |
| `code-review/apl.json` | Structured review evidence | Correctness, import changes, test coverage all verified by review |
| `tech-research/tech-research.md` | Technical decisions and checks (TCK-01 through TCK-06) | fs.cpSync chosen; child_process removed; getTarExecutable prohibited |
| `product/product.md` | User scenarios (SCN-01 through SCN-07) and success criteria | 7 scenarios defined; 5 require platform-specific or live-release testing |
| `src/update/perform.ts` | Direct code inspection of implementation | cpSync at line 34; no execSync; no child_process import |
| `src/update/perform.test.ts` | Direct inspection of new test file | 4 tests, node:test pattern, proper cleanup |
| `src/update/extract.ts` | Verify in-process extraction is intact | gunzipSync + USTAR parsing; no external binary |
| `package.json` | Dependency and build verification | Zero runtime deps; Node >=18; ESM |
