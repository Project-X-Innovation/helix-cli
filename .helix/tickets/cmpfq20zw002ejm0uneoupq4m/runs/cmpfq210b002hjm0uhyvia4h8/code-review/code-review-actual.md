# Code Review: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Review Scope

Reviewed all 8 files listed in `implementation/implementation-actual.md` against ticket requirements, product spec, implementation plan, tech-research decisions, and CLI source code. Cross-checked documentation claims against actual source (`src/update/check.ts`, `src/update/index.ts`, `src/update/perform.ts`, `src/update/validate.ts`, `src/tickets/create.ts`). Ran all quality gates (build, typecheck, tests, CI parser, negative test, skill show/install).

## Files Reviewed

| File | Review Verdict | Notes |
|------|---------------|-------|
| `skill-content/SKILL.md` | Pass | 10-section progressive disclosure (9 `##` + frontmatter); `name: hlx-cli`; 481-char description <=1024 with dual triggers; no npm recommendations |
| `skill-content/references/commands.md` | Pass | 387 lines covering all subcommands, long-form flags, enum values; parser confirms 75 tokens covered |
| `skill-content/references/current-state.md` | Pass | Dated 2026-05-21; cites PR #86; links to recovery.md |
| `skill-content/references/recovery.md` | Pass | Documents GitHub-release-asset flow matching `src/update/**`; covers hlx update pipeline, fresh install, recovery, diagnostics; zero npm recommendations |
| `skill-content/references/ticket-prompting.md` | Pass | All 7 sections in order; hard-constraint language; 5 failure modes with examples; good/bad patterns match ticket spec |
| `scripts/skill-sync/check-coverage.mjs` | Pass | Recursive --help walker; correct token extraction (subcommands, flags, enums); exit codes 0/1/2; HLX_SKIP_UPDATE_CHECK=1; handles edge cases (pipe-separated alternatives, prose ratings, blocklist) |
| `.github/workflows/skill-sync.yml` | Pass | Triggers: pull_request + push:main; Node 22; npm ci; runs check-coverage.mjs |
| `.github/pull_request_template.md` | Pass | Contains skill-update checkbox per ticket spec |

## Missed Requirements & Issues Found

### Requirements Gaps

None. All 7 Required Behavior items, all 8 Acceptance Criteria, and all Non-Negotiable Invariants are met.

### Correctness/Behavior Issues

None. Documentation content cross-checked against CLI source code:
- `--description` file-path gotcha matches `src/tickets/create.ts` lines 48-58
- VALID_MODES enum matches `src/tickets/create.ts` line 13
- Auth token discovery order matches `src/update/check.ts` lines 25-29
- Recovery message matches `src/update/index.ts` lines 107-112
- Staging pipeline matches `src/update/perform.ts` (staging dir, .bak rollback, rename swap)
- Validation steps match `src/update/validate.ts` (dist/index.js, package.json, --version)

### Regression Risks

None. No `src/` files modified. Existing tests (63/63) pass. Build and typecheck pass. Skill show/install work correctly with new content.

### Code Quality/Robustness

No issues. Parser script uses only Node built-ins, handles edge cases (blocklist, regex filter, pipe-separated alternatives), and has clear exit semantics.

### Verification/Test Gaps

None. All 13 verification checks from the plan were confirmed:
- CHK-01 through CHK-03: Build, typecheck, tests pass
- CHK-04: Description 481 chars, dual triggers confirmed
- CHK-05: Parser exits 0 with 75 tokens covered
- CHK-06: Negative test exits 1 listing missing `--search`
- CHK-07: skill show outputs new SKILL.md
- CHK-08: skill install copies SKILL.md + 4 reference files
- CHK-09: Zero npm install/uninstall/link in SKILL.md and recovery.md
- CHK-10: skill-sync.yml triggers on pull_request and push:main
- CHK-11: PR template has skill-update checkbox
- CHK-12: ticket-prompting.md has all 7 sections
- CHK-13: SKILL.md body has 9 `##` sections in correct order

## Changes Made by Code Review

None. No issues requiring code fixes were found.

## Remaining Risks / Deferred Items

1. **Token counting not automated.** The 5,000-token SKILL.md body budget is a writing constraint verified manually. No automated token counter exists. (Per product decision, deferred to future iteration.)
2. **Broken-link checking not in CI.** Reference doc links in SKILL.md are not validated by the CI workflow. (Deferred per implementation plan.)
3. **Rating enum extraction fragility.** The parser extracts rating values (`thumbs-up`, `thumbs-down`, `love`, `up`, `down`) via prose pattern matching. If the help text format for ratings changes, extraction may need updating.

## Verification Impact Notes

No verification checks are affected by code review. All 13 CHK IDs remain valid as-is. No behavior or assumptions were changed.

## APL Statement Reference

Code review complete. All 8 implementation files verified against ticket requirements, product spec, and CLI source code. No issues found. Build, typecheck, 63/63 tests, and CI parser (75 tokens) all pass. No code fixes applied. Implementation correctly delivers: 10-section progressive-disclosure SKILL.md with trigger-heavy description, full CLI surface coverage in commands.md, 3 new reference docs (ticket-prompting, recovery, current-state) with required content and language patterns, recursive CI parser script with hard-fail exit semantics, CI workflow on pull_request/push:main, and PR template with skill-update checkbox. No regressions to existing CLI behavior or skill install/show commands.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Primary requirements source: acceptance criteria, non-negotiable invariants, required behavior | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail; no npm recommendations |
| `implementation/implementation-actual.md` | Scope map: files changed, steps executed, verification results | 8 files, 75 tokens, 13 checks claimed passing — used as starting point for independent verification |
| `implementation/apl.json` | Implementation claims and evidence | Verified claims against actual code and runtime output |
| `product/product.md` | Product scenarios and success criteria | 10 user scenarios; progressive disclosure pattern; trigger-heavy description; hard enforcement |
| `implementation-plan/implementation-plan.md` | Detailed implementation steps and verification plan | 9 steps; 13 verification checks; file-level deliverables with acceptance criteria |
| `diagnosis/diagnosis-statement.md` | Root cause analysis | 5-cause compound gap; install.ts readdirSync auto-discovers; all doc/CI-only changes |
| `tech-research/tech-research.md` | Technical decisions | Parser is plain .mjs ESM; recursive --help; token types; exit semantics; HLX_SKIP_UPDATE_CHECK=1 |
| `scout/scout-summary.md` | Gap analysis between current and target state | SKILL.md flat 5-section layout; commands.md ~15 missing flags; no CI; no PR template |
| `repo-guidance.json` | Repo intent metadata | helix-cli is sole target repo |
| `src/tickets/create.ts` | Source verification for --description gotcha and VALID_MODES | Lines 48-58: file-path detection; line 13: VALID_MODES enum confirmed |
| `src/update/check.ts` | Source verification for auth token discovery | Lines 25-29: GITHUB_TOKEN, GH_TOKEN, gh auth token order confirmed |
| `src/update/index.ts` | Source verification for recovery message | Lines 107-112: recovery message matches recovery.md guidance |
| `src/update/perform.ts` | Source verification for staging pipeline | Staging at ~/.hlx/staging, .bak rollback, rename-based swap confirmed |
| `src/update/validate.ts` | Source verification for validation checks | dist/index.js, package.json, --version checks confirmed |
