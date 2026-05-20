# Product Spec — BLD-527 (Continuation): Eliminate shell dependencies in update extraction and swap

## Problem Statement

The `hlx update` staged-update flow shells out to system `tar` via `execSync` to extract the GitHub release tarball. On Windows machines where Git for Windows is installed — the default developer setup — GNU tar appears first in PATH and interprets Windows drive-letter colons (`C:\...`) as remote-host syntax, producing:

```
tar (child): Cannot connect to C: resolve failed
```

**User impact:** `hlx update` is completely non-functional for Windows developers with Git for Windows installed — a near-universal population. The failure is deterministic and not user-recoverable. The existing live install is preserved (fail-closed behavior works), but these users cannot update at all.

**Current branch state:** The primary tar extraction bug is **already fixed**. `src/update/extract.ts` implements complete in-process tar.gz extraction using only Node.js built-ins (`gunzipSync` + manual USTAR header parsing). Zero new runtime dependencies were added. Comprehensive tests exist in `extract.test.ts` (6 test cases including colon-in-path reproduction).

**Remaining issue:** `copyDirRecursive` in `perform.ts` still shells out to `xcopy` (Windows) or `cp -R` (others) via `execSync` for the EXDEV cross-filesystem rename fallback. While not a tar invocation, it is an unnecessary shell dependency that can be eliminated with `fs.cpSync` (available since Node 16.7+; project requires >=18). Additionally, `perform.test.ts` does not exist.

## Product Vision

The `hlx update` pipeline runs entirely in-process for all file-system operations (extraction, directory copying), removing dependency on platform binaries, PATH ordering, or path-quoting behavior. Update works identically on Windows, macOS, and Linux.

## Users

| User | Context |
|------|---------|
| **Windows developers** | Primary affected users. Have Git for Windows installed, GNU tar first in PATH. Currently cannot use `hlx update`. |
| **macOS / Linux developers** | Existing users whose updates work today. Must not regress. |
| **Auto-update hook** | Pre-command auto-update that runs silently. Must continue to fail-open on errors. |

## Use Cases

1. **Windows update:** A Windows developer with Git for Windows runs `hlx update`. Tarball is extracted in-process. EXDEV fallback (if triggered) uses `fs.cpSync`. Update completes successfully.
2. **macOS / Linux update (no regression):** Existing users run `hlx update`. Behavior is identical — extraction and copy are now in-process instead of via shell.
3. **Corrupt tarball:** Extraction fails, returns `{ success: false, error }`, live install is untouched, user sees a clear error.
4. **Auto-update failure:** Pre-command auto-update encounters any error. It logs a warning and continues dispatching the user's command.

## Core Workflow

```
hlx update / auto-update
         |
  download tarball to staging  (unchanged)
         |
  extract tarball in-process   <-- ALREADY FIXED (extract.ts)
  (Node.js built-ins, no shell)
         |
  validate staged candidate    (unchanged)
         |
  swap staged -> live          (uses safeRename; EXDEV fallback uses fs.cpSync)
         |                      <-- REMAINING FIX
  cleanup staging + backups    (unchanged)
```

## Essential Features (MVP)

1. **In-process tar extraction (done):** `extract.ts` replaces the `execSync('tar -xzf ...')` call with `gunzipSync` + manual USTAR header parsing. No external binary involved. Zero new runtime dependencies.

2. **Same output layout (done):** After extraction, the staging directory contains `dist/`, `skill-content/`, `package.json`, `build-metadata.json`. `validateStaged()` passes without modification.

3. **Error contract preserved (done):** Extraction errors return `{ success: false, error }`. Manual `hlx update` exits non-zero. Auto-update logs a warning and continues.

4. **Replace copyDirRecursive shell-out (remaining):** Replace `execSync` with `xcopy`/`cp -R` in `perform.ts` lines 33-39 with `fs.cpSync(src, dest, { recursive: true })`. Remove the now-unused `execSync` import.

5. **perform.test.ts (remaining):** Add test coverage for the EXDEV copy fallback behavior.

## Features Explicitly Out of Scope (MVP)

- CI workflow changes (`.github/workflows/build-release.yml` unchanged).
- Update channel, auth, or discovery logic (`src/update/check.ts` unchanged).
- The validate step (`src/update/validate.ts` unchanged).
- Documentation rewrites beyond error messages at the extraction boundary.
- `getTarExecutable()` or any runtime detection of GNU tar — the in-process extraction eliminates this need entirely, and the ticket explicitly prohibits hardcoding `C:\Windows\System32\tar.exe`.
- Non-update `execSync` calls (`gh auth token` in `check.ts`, `node --version` in `validate.ts`) — these are expected and not tar-related.

## Success Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | On Windows with GNU tar first in PATH, `hlx update` extracts the tarball and completes the staged swap | Run `hlx update` on Windows with Git for Windows |
| 2 | On macOS and Linux, `hlx update` works without regression | Run `hlx update` on macOS/Linux |
| 3 | No remaining external `tar` invocation in the update module | Grep `src/update/` for `execSync`/`spawnSync` and confirm no tar calls |
| 4 | No unnecessary `execSync` in `perform.ts` | Confirm `perform.ts` does not import or use `execSync` |
| 5 | Extraction and copy tests pass | `npm test` passes including `extract.test.ts` and `perform.test.ts` |
| 6 | Build passes and version reports correctly | `npm run build` succeeds; `node dist/index.js --version` reports commit SHA |

## User Scenarios

[SCN-01] Windows developer updates CLI successfully
- Precondition: User has Git for Windows installed (GNU tar first in PATH) and a working `hlx` installation
- Action: User runs `hlx update`
- Expected Outcome: The CLI updates to the latest main build without errors. `hlx --version` reports the new commit SHA.

[SCN-02] macOS/Linux developer updates CLI without regression
- Precondition: User has a working `hlx` installation on macOS or Linux
- Action: User runs `hlx update`
- Expected Outcome: The CLI updates successfully, identical behavior to before the fix.

[SCN-03] Corrupt tarball leaves existing install intact
- Precondition: User has a working `hlx` installation. The downloaded tarball is corrupt or truncated.
- Action: User runs `hlx update`
- Expected Outcome: `hlx update` exits non-zero with a clear error message. The existing CLI remains fully functional.

[SCN-04] Auto-update failure does not brick the CLI
- Precondition: Pre-command auto-update triggers. The extraction or validation step fails (e.g., network interruption, corrupt download).
- Action: User runs any `hlx` command that triggers auto-update
- Expected Outcome: A warning is logged. The user's command executes normally with the existing CLI version.

[SCN-05] Cross-filesystem install swap succeeds
- Precondition: The staging directory and the live install directory are on different filesystems (EXDEV scenario). User runs `hlx update`.
- Action: `renameSync` fails with EXDEV, triggering the copy fallback
- Expected Outcome: The fallback uses `fs.cpSync` (in-process), the swap completes, and the update succeeds without invoking any external binary.

[SCN-06] Already up to date
- Precondition: User has the latest version installed (local commit SHA matches remote)
- Action: User runs `hlx update`
- Expected Outcome: CLI exits 0 with "Already up to date" message. No download or extraction occurs.

[SCN-07] Missing GitHub authentication
- Precondition: The GitHub repository is private. User has no GitHub auth token available.
- Action: User runs `hlx update`
- Expected Outcome: CLI exits non-zero with explicit guidance about required GitHub authentication. No silent fallback to npm or source install.

## Key Design Principles

- **No external binary for extraction or copy:** The fix eliminates system `tar`, `xcopy`, and `cp -R` dependencies — not work around them with detection or hardcoded paths.
- **Minimal change surface:** Only `perform.ts` (copy fallback) changes. `extract.ts` is already complete.
- **Preserve error contract:** `performStagedUpdate` function signature and error-handling behavior remain identical. Callers are unaffected.
- **Fail-closed preserved:** A failed extraction or copy leaves the live install intact.
- **Zero new runtime dependencies:** All fixes use Node.js built-in APIs (`gunzipSync`, `fs.cpSync`).

## Scope & Constraints

- **Repository:** `helix-cli` only. No cross-repo impact.
- **Files to change:** `src/update/perform.ts` (replace `copyDirRecursive` body with `fs.cpSync`; remove `execSync` import), new `src/update/perform.test.ts`.
- **Files already changed (this branch):** `src/update/extract.ts` (new — in-process extraction), `src/update/extract.test.ts` (new — 6 tests), `src/update/perform.ts` (extraction call updated to `extractTarGz`).
- **Files NOT changed:** `src/update/validate.ts`, `src/update/index.ts`, `src/update/check.ts`, `src/update/version.ts`, `.github/workflows/*.yml`, `tsconfig.json`, `package.json`.
- **Constraint:** `fs.cpSync` requires Node 16.7+; project requires >=18, so this is safe.
- **Constraint:** The `execSync` import in `perform.ts` is currently used only by `copyDirRecursive`. After replacement with `fs.cpSync`, the import should be removed.
- **Constraint:** The tarball is standard `.tgz` with top-level entries (no prefix), created by GNU tar on ubuntu-latest in CI. No symlinks, long paths, or special attributes.

## Future Considerations

- **Streaming extraction:** If tarball sizes grow, pipe download directly to extractor without writing to disk first.
- **Automated Windows CI tests:** Add a Windows runner to the CI matrix to catch platform-specific regressions earlier.

## Open Questions / Risks

| # | Question / Risk | Impact | Status |
|---|----------------|--------|--------|
| 1 | **safeRename Windows file-locking retry** (`perform.ts` Atomics.wait loop): Has this been tested under real Windows file-locking scenarios beyond the user's local testing? | Could cause update swap failures on Windows if locked files are common. | Low risk — user's local e2e passed; record as technical unknown. |
| 2 | **EXDEV frequency in practice:** How often does the staging-to-live rename actually cross filesystem boundaries? | Determines whether `fs.cpSync` fallback is exercised regularly or only as a rare edge case. | Low risk — the fix is simple and well-tested regardless. |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Scope, requirements, acceptance criteria, continuation context, decision constraints | Extraction-only fix; must remove tar binary dependency; preserve error contract; explicit rejection of `getTarExecutable()` workaround |
| `scout/scout-summary.md` | Current implementation state, remaining work, CI workflow status | Primary fix (extract.ts) already done; copyDirRecursive still has execSync; no perform.test.ts; zero runtime deps |
| `scout/reference-map.json` | File inventory, facts, unknowns, evidence citations | Confirmed 3 remaining execSync usages (none tar); fs.cpSync available; getTarExecutable not on branch |
| `diagnosis/diagnosis-statement.md` | Root cause analysis, success criteria, change scope | copyDirRecursive lines 33-39 identified as remaining fix; execSync import removal after; getTarExecutable explicitly superseded |
| `diagnosis/apl.json` | Structured Q&A with evidence | Colon interpretation confirmed in GNU tar parser; getTarExecutable contradicts ticket constraints; fs.cpSync confirmed as direct replacement |
| `repo-guidance.json` | Repository role | helix-cli is sole target; no cross-repo impact |
