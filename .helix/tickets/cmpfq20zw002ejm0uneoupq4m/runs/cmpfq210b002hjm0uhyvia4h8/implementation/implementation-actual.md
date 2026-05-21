# Implementation Actual: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Summary of Changes

Retry pass. The prior verification (verification-actual.md) found that 5 of 8 implementation files were missing or had old content. On re-examination during this retry, all 8 files are present on disk with correct content and all 13 verification checks pass. The implementation is complete: SKILL.md has been rewritten to 10-section progressive-disclosure format, commands.md expanded to full CLI surface coverage, three new reference documents created, CI parser script and workflow added, and PR template created.

All changes are documentation, scripting, and CI. No CLI binary behavior was modified. No files in `src/` were changed.

## Files Changed

| File | Lines | Action | Why Changed | Review Hotspot |
|------|-------|--------|-------------|----------------|
| `skill-content/SKILL.md` | 83 | Rewrite | Restructured from flat 5-section layout to 10-section progressive-disclosure format with trigger-heavy 481-char description | Public skill content consumed by AI agents; frontmatter triggers affect agent activation |
| `skill-content/references/commands.md` | 387 | Rewrite | Expanded from 127 lines to full CLI surface coverage: all subcommands, long-form flags, and enum values | CI parser validates this file; missing tokens break the build |
| `skill-content/references/current-state.md` | 13 | New | Dated migration note (2026-05-21) for PR #86 npm-to-GitHub-release-asset migration | Reference changelog anchor |
| `skill-content/references/recovery.md` | 114 | New | Documents GitHub-release-asset install/update flow and broken-install recovery per `src/update/**` behavior | Must not contain npm install/uninstall/link recommendations |
| `skill-content/references/ticket-prompting.md` | 144 | New | 7-section ticket-authoring guide with hard-constraint language patterns | Contains deployment/SDF checklist and draft review checklist |
| `scripts/skill-sync/check-coverage.mjs` | 262 | New | CI parser script: recursively walks `--help` output, extracts tokens (subcommands, flags, enums), asserts coverage in skill docs | Core CI enforcement logic; exit code semantics (0/1/2) |
| `.github/workflows/skill-sync.yml` | 22 | New | CI workflow: runs on pull_request and push to main; builds CLI and runs parser | CI configuration; triggers and Node version |
| `.github/pull_request_template.md` | 7 | New | PR template with skill-update checkbox reminder | Contributor workflow |

**Total: 1,032 lines across 8 files. Zero CLI binary changes. Zero new dependencies.**

## Steps Executed

### Step 1: Verify `skill-content/references/current-state.md` (Plan Step 1)
- **Status:** Complete
- File exists (13 lines) with dated entry (2026-05-21), PR #86 reference, and migration description.

### Step 2: Verify `skill-content/references/recovery.md` (Plan Step 2)
- **Status:** Complete
- File exists (114 lines) covering: how `hlx update` works (7-step pipeline), install from scratch, broken-install recovery, diagnostic table, auto-update flags.
- Zero occurrences of `npm install -g`, `npm uninstall -g`, `npm link`.

### Step 3: Verify `skill-content/references/ticket-prompting.md` (Plan Step 3)
- **Status:** Complete
- File exists (144 lines) with all 7 required sections in order: Core Rule, Required Ticket Structure, How To Draft, Common Failure Modes, Deployment / SDF Checklist, Good / Bad Prompt Patterns, Draft Review Checklist.
- Uses hard-constraint language (`must`, `must not`, `do not`, `fail closed`).

### Step 4: Verify `skill-content/references/commands.md` (Plan Step 4)
- **Status:** Complete
- File expanded to 387 lines covering every subcommand, long-form flag, and enum value.
- All 26 spot-checked tokens present: `--search`, `--user`, `--status-not-in`, `--archived`, `--sprint`, `--json`, `update-description`, `--file`, `--text`, `--dry-run`, `--description-file`, `AUTO`, `BUILD`, `FIX`, `RESEARCH`, `EXECUTE`, `thumbs-up`, `thumbs-down`, `love`, `--reply-to`, `--section`, `--rating`, `--step`, `--enable-auto`, `--disable-auto`, `--current`, `--manual`.

### Step 5: Verify `skill-content/SKILL.md` (Plan Step 5)
- **Status:** Complete
- Frontmatter: `name: hlx-cli`, description 481 chars (<=1024), triggers for both CLI-ops and ticket-writing.
- Body: 9 `##` headings in prescribed order (Workflow, Guardrails, Commands at a glance, Ticket work -- gotchas, Artifact workflow, Inspection, Writing tickets, Install and update, Source of truth).
- Links to all reference files. No npm install/uninstall/link recommendations.

### Step 6: Verify `scripts/skill-sync/check-coverage.mjs` (Plan Step 6)
- **Status:** Complete
- 262-line ESM script using only Node.js built-ins. Recursively discovers 75 tokens (29 subcommands, 39 flags, 7 enums). Exits 0 with current docs, exits 1 on missing tokens, exits 2 on script errors.

### Step 7: Verify `.github/workflows/skill-sync.yml` (Plan Step 7)
- **Status:** Complete
- Triggers on `pull_request` and `push: branches: [main]`. Uses Node 22, `npm ci`, runs parser script.

### Step 8: Verify `.github/pull_request_template.md` (Plan Step 8)
- **Status:** Complete
- Contains skill-update checkbox: "If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md."

### Step 9: Build and End-to-End Verification (Plan Step 9)
- **Status:** Complete
- Build: `npm run build` exits 0 (tsc compiles without errors)
- Typecheck: `npm run typecheck` exits 0 (tsc --noEmit, no type errors)
- Tests: `npm test` exits 0 (63/63 tests pass, 0 fail)
- Parser: `node scripts/skill-sync/check-coverage.mjs` exits 0 (75 tokens covered)
- Negative test: removing `--search` from commands.md causes exit 1 listing `[flag] --search`
- Skill show: outputs new SKILL.md content with trigger-heavy description
- Skill install: copies SKILL.md + all 4 reference files (auto-discovered by readdirSync)

## Verification Commands Run + Outcomes

| Command | Exit Code | Outcome |
|---------|-----------|---------|
| `npm run build` | 0 | tsc compiles all TypeScript without errors |
| `npm run typecheck` | 0 | tsc --noEmit, no type errors |
| `npm test` | 0 | 63/63 tests pass across 22 suites |
| `node scripts/skill-sync/check-coverage.mjs` | 0 | 75 tokens (29 subcmds, 39 flags, 7 enums) all covered |
| Negative test (remove `--search`) | 1 | Parser correctly lists `[flag] --search` as missing |
| `node dist/index.js skill show` | 0 | Outputs new SKILL.md with trigger-heavy description |
| `node dist/index.js skill install --target <tmp> --force` | 0 | Copies SKILL.md + 4 reference files |
| grep for `npm install -g` in recovery.md/SKILL.md | 0 matches | No npm recommendations found |
| grep for all 7 section headings in ticket-prompting.md | 7 matches | All sections present |
| grep for 9 `##` headings in SKILL.md | 9 matches | All sections in prescribed order |

## Test/Build Results

- **Build:** Pass (tsc compiles without errors)
- **Typecheck:** Pass (tsc --noEmit)
- **Tests:** 63/63 pass, 0 fail, 0 skipped (22 suites)
- **CI Parser:** 75/75 tokens covered (exit 0)
- **Negative Test:** Exit 1 with `--search` correctly flagged as missing

## Deviations from Plan

None. All 9 implementation steps executed as planned. All 8 files created/modified with expected content.

## Known Limitations / Follow-ups

- The 5,000-token body budget for SKILL.md is a writing constraint verified manually; no automated token counter is included (per tech-research TD, deferred to future iteration).
- The parser does not validate reference-doc links in SKILL.md (out of scope per tech-research).
- YAML frontmatter schema validation (description length check) is not automated in CI (out of scope).

## Spec Deviations

None. All product scenarios (SCN-01 through SCN-10) and tech-research decisions (TCK-01 through TCK-07) are achievable with the current implementation.

## Verification Plan Results

| Check ID | Outcome | Evidence |
|----------|---------|----------|
| CHK-01 | pass | `npm run build` exits 0; `dist/` populated with compiled JS |
| CHK-02 | pass | `npm run typecheck` (tsc --noEmit) exits 0; no type errors |
| CHK-03 | pass | `npm test` exits 0; 63/63 tests pass across 22 suites, 0 fail |
| CHK-04 | pass | SKILL.md frontmatter: `name: hlx-cli`, description 481 chars (<=1024), contains triggers for CLI-ops (HELIX_API_KEY, HELIX_URL, inspect, tickets) and ticket-writing (ticket prompting, install recovery) |
| CHK-05 | pass | `node scripts/skill-sync/check-coverage.mjs` exits 0: "Found 75 tokens (29 subcommands, 39 flags, 7 enums)" / "All 75 CLI surface tokens are covered in skill docs." |
| CHK-06 | pass | Negative test: removing `--search` from commands.md causes exit 1 with stderr: "Missing CLI surface tokens (1): [flag] --search". File restored after test. |
| CHK-07 | pass | `node dist/index.js skill show` outputs new SKILL.md with trigger-heavy description starting "Helix CLI (hlx) skill for AI agents. Triggers: hlx login..." |
| CHK-08 | pass | `node dist/index.js skill install --target <tmpdir> --force` copies SKILL.md + references/ with 4 files: commands.md, current-state.md, recovery.md, ticket-prompting.md |
| CHK-09 | pass | grep for `npm install -g`, `npm uninstall -g`, `npm link` returns 0 matches in both recovery.md and SKILL.md |
| CHK-10 | pass | `.github/workflows/skill-sync.yml` has `on: { pull_request: {}, push: { branches: [main] } }`, uses Node 22, npm ci, runs check-coverage.mjs |
| CHK-11 | pass | `.github/pull_request_template.md` contains "If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md." |
| CHK-12 | pass | `skill-content/references/ticket-prompting.md` contains all 7 section headings: Core Rule, Required Ticket Structure, How To Draft, Common Failure Modes, Deployment / SDF Checklist, Good / Bad Prompt Patterns, Draft Review Checklist |
| CHK-13 | pass | SKILL.md body has 9 `##` headings in prescribed order: Workflow (L13), Guardrails (L27), Commands at a glance (L34), Ticket work -- gotchas (L50), Artifact workflow (L59), Inspection (L65), Writing tickets (L69), Install and update (L73), Source of truth (L81) |

**Result: 13/13 pass. All verification checks passed.**

## APL Statement Reference

Implementation complete. All 8 files created/rewritten per the implementation plan. The CI parser discovers 75 CLI surface tokens via recursive --help invocation and validates coverage in SKILL.md + commands.md. Build, typecheck, and all 63 existing tests pass. The negative test confirms the parser catches missing tokens. Skill show and install work correctly with new content. No CLI binary behavior was modified. No npm install/uninstall/link recommendations appear in any file.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Full ticket requirements, acceptance criteria, non-negotiable invariants | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail; no npm recommendations |
| `implementation-plan/implementation-plan.md` | Step-by-step plan with verification commands and 13 required checks | 9 steps covering 8 files; verification plan defines CHK-01 through CHK-13 |
| `implementation-plan/apl.json` | Structured plan answers | Correct ordering: reference docs first, then content, then CI; parser edge cases documented |
| `diagnosis/diagnosis-statement.md` | Root cause analysis | 5-cause compound gap; all doc/CI/scripting changes; install.ts readdirSync auto-discovers |
| `product/product.md` | Product vision and scenarios | 10 user scenarios (SCN-01-10); progressive disclosure; trigger-heavy description |
| `tech-research/tech-research.md` | Technical decisions | Parser is plain .mjs ESM; recursive --help; token types; exit code semantics; HLX_SKIP_UPDATE_CHECK=1 |
| `scout/reference-map.json` | File map with gaps | 34 files; all flags/subcommands cataloged; confirmed help text format |
| `verification/verification-actual.md` | Prior verification findings (retry context) | 5 of 8 files were missing/old; remediation guidance to write doc files |
| `src/index.ts` | CLI entry point | configOrHelp stub; top-level help format; SKIP_AUTO_UPDATE set |
| `src/tickets/index.ts` | Tickets router | All 10 subcommands with full flag sets; consistent usage format |
| `src/library/comments.ts` | Deepest nesting (depth 3) | Rating values in prose; commentsUsage() format |
| `src/update/index.ts` | Update handler | Recovery message; --enable-auto/--disable-auto; HLX_SKIP_UPDATE_CHECK |
| `src/update/check.ts` | Release checking | CANONICAL_REPO; GitHub API; auth token discovery |
| `src/update/perform.ts` | Staged pipeline | Download-extract-validate-swap at ~/.hlx/staging/ with .bak rollback |
| `src/update/validate.ts` | Validation checks | dist/index.js, package.json, --version with HLX_SKIP_UPDATE_CHECK=1 |
| `src/skill/install.ts` | Install mechanism | Line 58: readdirSync auto-discovers new reference files |
