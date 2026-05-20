# Scout Summary — BLD-527: Replace tar extraction with in-process JS extraction

## Problem

The `hlx update` staged-update flow originally shelled out to system `tar` via `execSync` to extract the GitHub release tarball. On Windows machines where Git for Windows puts GNU tar first in PATH, GNU tar misinterprets drive-letter paths (`C:\...`) as remote host syntax, failing with `Cannot connect to C: resolve failed`. This made `hlx update` non-functional for the majority of Windows developers.

The current branch has already implemented the primary fix: `src/update/extract.ts` provides a full in-process tar.gz extraction using only Node.js built-ins (`gunzipSync` + manual USTAR header parsing), and `perform.ts` calls `extractTarGz()` instead of shelling out to `tar`. Comprehensive tests exist in `extract.test.ts`.

The user's continuation context requests an additional robustness fix: replacing `copyDirRecursive`'s `execSync` (xcopy/cp-R) in `perform.ts` with `fs.cpSync`, and adding `perform.test.ts`. These changes are **not yet present** in the current branch.

## Analysis Summary

### Current Implementation State

The tar extraction bug is **already fixed**. The flow is:

1. **Download**: `perform.ts:107` fetches asset via `fetch()`, writes to `~/.hlx/staging/{sha}.tgz`
2. **Extract**: `perform.ts:125` calls `extractTarGz(tarballPath, stagingDir)` — **in-process, no external binary**
3. **Validate**: `perform.ts:132` calls `validateStaged()` — checks `dist/index.js`, `package.json`, runs `--version`
4. **Swap**: `perform.ts:163-186` renames staged into live with `.bak` backups for rollback
5. **Cleanup**: `perform.ts:223-243` removes backups and staging artifacts

### Remaining Shell-Out in perform.ts

`copyDirRecursive` (lines 33–39) still uses `execSync` for `xcopy` (Windows) / `cp -R` (others). This is the EXDEV cross-filesystem rename fallback — **not a tar invocation**. The acceptance criteria only require "no remaining external tar invocation", which is already satisfied. However, the user's continuation context requests replacing this with `fs.cpSync` (available since Node 16.7+; project requires >=18).

### execSync / child_process Usage Inventory (update module)

| Location | Usage | Tar? | Status |
|---|---|---|---|
| `perform.ts:34` | `execSync('xcopy/cp -R ...')` — EXDEV fallback copy | No | Active; user requests fs.cpSync replacement |
| `check.ts:30` | `execSync('gh auth token')` — GitHub token discovery | No | Expected; no change needed |
| `validate.ts:38` | `spawnSync('node', ...)` — version check | No | Expected; no change needed |

### User's Local Fix vs Current Code

| User's fix component | In current code? | Notes |
|---|---|---|
| In-process tar extraction (extract.ts) | **Yes** | Already implemented; uses Node built-ins only |
| extract.test.ts with comprehensive tests | **Yes** | 6 test cases, 322 lines |
| `getTarExecutable()` in perform.ts | **No** | Not needed — ticket says "do not hardcode tar path" |
| `fs.cpSync` replacing copyDirRecursive | **No** | User requests this; not yet applied |
| `perform.test.ts` | **No** | User mentions adding; not present |

### CI Workflows

| Workflow | Trigger | Status |
|---|---|---|
| `build-release.yml` | Push to main | Present; creates `latest` release with `helix-cli.tgz` |
| `publish.yml` | v* tag push | Present; npm publish with provenance |
| `auto-tag.yml` | (removed) | Not present — already removed per ticket |

### Tarball Shape (from CI)

Created in `build-release.yml` on ubuntu-latest. Top-level entries (no prefix):
- `dist/` — compiled JS (excluding test files)
- `skill-content/` — skill documentation
- `package.json` — package manifest
- `build-metadata.json` — `{ commit, builtAt }`

### Quality Gates

| Script | Command | Status |
|---|---|---|
| `build` | `tsc` | User reports passing locally |
| `test` | `tsc && node --test dist/**/*.test.js` | User reports 52/52 passing |
| `typecheck` | `tsc --noEmit` | Included in build |

Cannot verify in sandbox — `node_modules` not installed.

### Dependency Landscape

- **Runtime deps**: Zero (extraction uses only Node.js built-ins)
- **Dev deps**: `@types/node ^25.5.0`, `typescript ^6.0.2`
- **Module system**: ESM (`type: module`, Node16 resolution)
- **Node engine**: `>=18`

## Relevant Files

| File | Role | Lines |
|---|---|---|
| `src/update/extract.ts` | In-process tar.gz extraction (the primary fix) | 149 |
| `src/update/extract.test.ts` | Extraction test suite (6 test cases) | 322 |
| `src/update/perform.ts` | Staged update orchestration; still has execSync for EXDEV copy | 246 |
| `src/update/validate.ts` | Post-extraction validation contract | 66 |
| `src/update/index.ts` | Update command handler + auto-update | 207 |
| `src/update/check.ts` | GitHub release discovery + auth | 136 |
| `src/update/version.ts` | Version display | 38 |
| `package.json` | Package manifest; zero runtime deps | 44 |
| `tsconfig.json` | TypeScript build config | 15 |
| `.github/workflows/build-release.yml` | CI: tarball creation + latest release | 60 |
| `.github/workflows/publish.yml` | CI: tag-triggered npm publish | 62 |
| `src/lib/config.ts` | Config types + persistence | 222 |
| `src/index.ts` | CLI entry point + auto-update dispatch | 145 |

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|---|---|---|
| `ticket.md` | Scope, decisions, acceptance criteria | Extraction must be in-process; no external tar; preserve error contract |
| `repo-guidance.json` | Repository role confirmation | helix-cli is sole target; no cross-repo impact |
| `src/update/extract.ts` | Verify primary fix is implemented | In-process extraction using gunzipSync + USTAR parsing; no external binary |
| `src/update/extract.test.ts` | Verify test coverage for extraction | 6 tests covering CI layout, colon paths, corruption, empty, PAX, truncation |
| `src/update/perform.ts` | Check remaining shell-outs and orchestration | extractTarGz call at line 125; execSync remains at line 34 for EXDEV copy only |
| `src/update/validate.ts` | Post-extraction contract | Checks dist/index.js, package.json, runs node --version |
| `src/update/index.ts` | Error handling contract | Manual: exit(1); Auto: warn + continue |
| `src/update/check.ts` | Other execSync usage | gh auth token — not tar, expected |
| `src/update/version.ts` | Version format | semver + short SHA |
| `package.json` | Dependencies, scripts, module system | Zero runtime deps; ESM; Node >=18; test = tsc + node --test |
| `tsconfig.json` | Build constraints | ES2022, Node16, strict, dist/ output |
| `.github/workflows/build-release.yml` | Tarball shape definition | Top-level: dist/, skill-content/, package.json, build-metadata.json |
| `.github/workflows/publish.yml` | Verify tag-based npm publish retained | v* tag trigger; provenance; version validation |
| `/tmp/helix-inspect/manifest.json` | Runtime inspection availability | Not present — no runtime checks possible (expected for CLI repo) |
