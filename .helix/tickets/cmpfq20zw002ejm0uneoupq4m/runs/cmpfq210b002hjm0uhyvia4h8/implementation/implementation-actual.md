# Implementation Actual: Restructure bundled hlx-cli skill: progressive disclosure + CI sync

## Summary of Changes

Restructured the bundled `skill-content/` skill to follow progressive-disclosure best practices (10-section SKILL.md with trigger-heavy description), expanded `commands.md` to cover the full CLI surface, created 3 new reference documents (recovery.md, ticket-prompting.md, current-state.md), added a CI parser script that recursively walks `--help` output to enforce coverage, created a CI workflow, and added a PR template with a skill-update checkbox.

All changes are documentation, scripting, and CI. No CLI binary behavior was modified. No files in `src/` were changed.

## Files Changed

| File | Action | Why Changed | Review Notes |
|------|--------|-------------|--------------|
| `skill-content/SKILL.md` | Rewritten | Restructured from flat 5-section layout to 10-section progressive-disclosure format with trigger-heavy description (481 chars, <=1024 limit). Body has 9 `##` sections. Links to all reference files. | **Primary doc file.** All content is agent-facing. Verify section order matches ticket spec. |
| `skill-content/references/commands.md` | Rewritten | Expanded from 127 lines to 387 lines. Added all missing flags, subcommands, and enum values identified by scout. Covers full CLI surface. | **CI-validated coverage.** Parser script confirms all 75 tokens are present. |
| `skill-content/references/current-state.md` | New | Dated migration note (2026-05-21) for PR #86 npm-to-release-asset transition. | Short changelog entry. |
| `skill-content/references/recovery.md` | New | Documents GitHub-release-asset install/update/recovery flow per `src/update/**`. Covers hlx update mechanism, fresh install, broken-install recovery, and auto-update. | **No npm install/uninstall/link recommendations.** Verified by CHK-09. |
| `skill-content/references/ticket-prompting.md` | New | 7-section ticket-authoring guide with hard-constraint language patterns. Covers Core Rule, Required Ticket Structure, How To Draft, Common Failure Modes, Deployment/SDF Checklist, Good/Bad Prompt Patterns, Draft Review Checklist. | Uses `must`/`must not`/`do not` language. No soft language for invariants. |
| `scripts/skill-sync/check-coverage.mjs` | New | CI parser script. Recursively walks `--help` output, extracts subcommands/flags/enums, asserts coverage in SKILL.md + commands.md. Exit 0 = pass, 1 = missing tokens, 2 = script error. | **Shared utility for CI.** Zero dependencies (Node built-ins only). Handles pipe-separated alternatives, prose rating values, and angle-bracket enum groups. |
| `.github/workflows/skill-sync.yml` | New | CI workflow running on `pull_request` and `push: main`. Uses Node 22, `npm ci`, then runs the parser script. | Mirrors `build-release.yml` setup pattern. |
| `.github/pull_request_template.md` | New | PR template with skill-update checkbox as contributor reminder. | No pre-existing template to preserve. |

## Steps Executed (mapped to plan steps)

### Step 1: Create `skill-content/references/current-state.md`
- Created file with dated entry (2026-05-21) referencing PR #86 and the migration from npm to GitHub release assets.
- Links to `references/recovery.md` for details.

### Step 2: Create `skill-content/references/recovery.md`
- Created 114-line document covering:
  - How `hlx update` works (7-step pipeline from source code)
  - Fresh install instructions via GitHub releases
  - Broken-install recovery (try `hlx update`, manual download, diagnostic table)
  - Auto-update configuration
- Sourced from: `src/update/check.ts`, `src/update/perform.ts`, `src/update/validate.ts`, `src/update/index.ts`.
- Verified: zero occurrences of `npm install -g`, `npm uninstall -g`, `npm link`.

### Step 3: Create `skill-content/references/ticket-prompting.md`
- Created 144-line document with all 7 required sections in order.
- Uses hard-constraint language (`must`, `must not`, `do not`, `fail closed`).
- Contains required ticket structure headers, 5 failure mode examples, deployment checklist, good/bad prompt patterns, and draft review checklist.

### Step 4: Rewrite `skill-content/references/commands.md`
- Expanded from 127 to 387 lines.
- Added all previously-missing tokens: `--search`, `--user`, `--status`, `--status-not-in`, `--archived`, `--sprint`, `--json`, `update-description`, `--file`, `--text`, `--dry-run`, `--description-file`, `AUTO`/`BUILD`/`FIX`/`RESEARCH`/`EXECUTE`, `thumbs-up`/`thumbs-down`/`love`/`up`/`down`, `--reply-to`, `--section`, `--step`, `--enable-auto`/`--disable-auto`, `--current`, `--manual`.
- Each subcommand has its own heading with usage line and flag table.

### Step 5: Rewrite `skill-content/SKILL.md`
- Restructured to 9 `##` sections in prescribed order (Workflow, Guardrails, Commands at a glance, Ticket work — gotchas, Artifact workflow, Inspection, Writing tickets, Install and update, Source of truth).
- YAML frontmatter: `name: hlx-cli`, description: 481 chars (<=1024 limit) with triggers for both CLI-ops and ticket-writing.
- Links to all reference files.
- No npm install/uninstall/link recommendations.

### Step 6: Create `scripts/skill-sync/check-coverage.mjs`
- Created 262-line ESM parser script using only Node.js built-ins.
- Algorithm: recursive `--help` invocation → token extraction (subcommands, flags, enums) → substring matching against doc files with backtick stripping.
- Handles edge cases: pipe-separated subcommand alternatives, prose-format rating values, angle-bracket enum groups.
- Added blocklist and regex filter to prevent false positives from non-command words.
- Exit codes: 0 (all covered), 1 (missing tokens with list), 2 (script error).

### Step 7: Create `.github/workflows/skill-sync.yml`
- Created CI workflow with triggers: `pull_request` (all branches), `push` to `main`.
- Uses Node 22, `npm ci`, runs `node scripts/skill-sync/check-coverage.mjs`.

### Step 8: Create `.github/pull_request_template.md`
- Created PR template with Summary section and skill-update checkbox.

### Step 9: Build and End-to-End Verification
- Build: `npm run build` — exit 0
- Typecheck: `npm run typecheck` — exit 0
- Tests: `npm test` — 63/63 pass, exit 0
- Parser: `node scripts/skill-sync/check-coverage.mjs` — 75 tokens covered, exit 0
- Negative test: removed `--search`, parser exits 1 listing it as missing, restored file
- Skill show: outputs new SKILL.md content with trigger-heavy description
- Skill install: copies SKILL.md + 4 reference files to target directory

## Verification Commands Run + Outcomes

| Command | Exit Code | Outcome |
|---------|-----------|---------|
| `npm run build` | 0 | tsc compiled successfully |
| `npm run typecheck` | 0 | No type errors |
| `npm test` | 0 | 63/63 tests pass |
| `node scripts/skill-sync/check-coverage.mjs` | 0 | 75 tokens (29 subcommands, 39 flags, 7 enums) all covered |
| Negative test (remove `--search`) | 1 | Parser correctly reports `[flag] --search` as missing |
| `node dist/index.js skill show` | 0 | Outputs new SKILL.md with updated frontmatter |
| `node dist/index.js skill install --target <tmp> --force` | 0 | Copies SKILL.md + 4 reference files |

## Test/Build Results

- **Build:** tsc compiles without errors. `dist/` populated.
- **Typecheck:** `tsc --noEmit` exits 0.
- **Tests:** 63/63 pass (22 suites, 0 failures, 0 skipped). Existing skill tests validate byte-for-byte copy of SKILL.md and all references.
- **CI Parser:** Discovers 75 tokens from `--help` output and confirms all are covered in docs.

## Deviations from Plan

1. **Section count:** The plan mentions "10 sections" in SKILL.md. The ticket specifies 9 `##` headings in the body (Workflow through Source of truth). The YAML frontmatter is the 10th conceptual section but not a `##` heading. Implementation has 9 `##` headings, matching the ticket's "ten sections from Required Behavior item 1" which counts the frontmatter as section 1.

2. **Parser false-positive handling:** The plan did not anticipate that the top-level help text ("hlx -- Helix CLI workbench") would cause "workbench" and "Usage:" to be extracted as subcommands. Added a blocklist and regex filter (`/^[a-z][a-z0-9-]*$/`) to exclude non-command tokens.

## Known Limitations / Follow-ups

- **Token counting:** The 5,000-token body budget for SKILL.md is a writing constraint verified manually. No automated token counter is included (per product decision, deferred to future iteration).
- **Rating enum extraction:** The parser extracts rating values (`thumbs-up`, `thumbs-down`, `love`, `up`, `down`) from prose text via pattern matching. If the prose format in help text changes, the extraction may need updating.
- **Broken-link checking:** Reference doc links in SKILL.md are not validated by CI. Deferred to future iteration.

## Spec Deviations

None. All product scenarios (SCN-01 through SCN-10) and tech-research decisions (TCK-01 through TCK-07) were achieved as specified.

## Verification Plan Results

| Check ID | Outcome | Evidence/Notes |
|----------|---------|----------------|
| CHK-01 | pass | `npm run build` exits 0; `dist/` populated with compiled JS |
| CHK-02 | pass | `npm run typecheck` (`tsc --noEmit`) exits 0; no type errors |
| CHK-03 | pass | `npm test` exits 0; 63/63 tests pass (22 suites, 0 fail) |
| CHK-04 | pass | `name: hlx-cli` present; description is 481 chars (<=1024); contains CLI-ops triggers (HELIX_API_KEY, HELIX_URL, tickets, inspect, org) and ticket-writing triggers (writing, ticket prompting) |
| CHK-05 | pass | `node scripts/skill-sync/check-coverage.mjs` exits 0; 75 tokens (29 subcommands, 39 flags, 7 enums) all covered |
| CHK-06 | pass | Removing `--search` from commands.md causes parser to exit 1 with stderr listing `[flag] --search` as missing; file restored after test |
| CHK-07 | pass | `node dist/index.js skill show` outputs new SKILL.md content starting with `name: hlx-cli` and trigger-heavy description |
| CHK-08 | pass | `node dist/index.js skill install --target <tmp> --force` copies SKILL.md + 4 reference files (commands.md, current-state.md, recovery.md, ticket-prompting.md) |
| CHK-09 | pass | `grep` for `npm install -g`, `npm uninstall -g`, `npm link` returns 0 matches in both recovery.md and SKILL.md |
| CHK-10 | pass | `.github/workflows/skill-sync.yml` has `on: { pull_request: {}, push: { branches: [main] } }`; uses Node 22, `npm ci`, runs `check-coverage.mjs` |
| CHK-11 | pass | `.github/pull_request_template.md` contains "If this PR changes user-visible CLI behavior, I updated skill-content/SKILL.md or skill-content/references/commands.md" |
| CHK-12 | pass | `ticket-prompting.md` contains all 7 required section headings: Core Rule, Required Ticket Structure, How To Draft, Common Failure Modes, Deployment / SDF Checklist, Good / Bad Prompt Patterns, Draft Review Checklist |
| CHK-13 | pass | SKILL.md body has 9 `##` headings in order: Workflow, Guardrails, Commands at a glance, Ticket work — gotchas, Artifact workflow, Inspection, Writing tickets, Install and update, Source of truth |

All 13 required checks pass. Self-verification is complete.

## APL Statement Reference

Implementation complete. All 8 files were created/rewritten per the implementation plan. The CI parser script discovers 75 CLI surface tokens via recursive `--help` invocation and validates coverage in SKILL.md + commands.md. Build, typecheck, and all 63 existing tests pass. The negative test confirms the parser catches missing tokens. Skill show and install work correctly with new content. No CLI binary behavior was modified. No npm install/uninstall/link recommendations appear in any file.

## Artifact Inputs Used

| Artifact | Why Used | Key Takeaway |
|----------|----------|--------------|
| `ticket.md` | Full ticket requirements, acceptance criteria, non-negotiable invariants | 7-item required behavior spec; 10-section SKILL.md; CI must hard-fail; no npm recommendations |
| `implementation-plan/implementation-plan.md` | Step-by-step implementation instructions and verification plan | 9 implementation steps; 13 verification checks; file-level deliverables |
| `implementation-plan/apl.json` | Structured plan answers | Correct ordering (reference docs → content → parser → CI); edge case handling for rating enums |
| `diagnosis/diagnosis-statement.md` | Root cause analysis | 5-cause compound gap; install.ts readdirSync auto-discovers new files; all doc/CI-only changes |
| `product/product.md` | Product scenarios and success criteria | 10 user scenarios; progressive disclosure pattern; trigger-heavy description |
| `tech-research/tech-research.md` | Technical decisions and architecture | Parser is plain .mjs ESM; recursive --help strategy; token types; exit code semantics; HLX_SKIP_UPDATE_CHECK=1 |
| `scout/reference-map.json` | File map with CLI surface tokens cataloged | All flag/subcommand gaps enumerated; consistent help text format confirmed |
| `scout/scout-summary.md` | Gap analysis | SKILL.md flat 5-section layout; commands.md ~15 missing flags; no CI enforcement |
| `src/index.ts` | CLI entry point help text | configOrHelp stub (lines 24-33); top-level usage format (lines 35-63); SKIP_AUTO_UPDATE set |
| `src/tickets/index.ts` | Tickets subcommand help text | ticketsUsage (lines 17-31); all 10 subcommands with flags |
| `src/library/comments.ts` | Deepest nesting level help text | commentsUsage (lines 6-16); rating values in prose format |
| `src/inspect/index.ts` | Inspect command help text | inspectUsage (lines 9-29); PowerShell quoting tips |
| `src/skill/install.ts` | Skill install mechanism | readdirSync on references/ (line 58) auto-discovers new files |
| `src/update/check.ts` | Update check mechanism | CANONICAL_REPO; GitHub API; auth token discovery |
| `src/update/perform.ts` | Staged update pipeline | Download→extract→validate→swap with .bak rollback |
| `src/update/validate.ts` | Staged validation | dist/index.js check; package.json check; --version check |
| `src/update/index.ts` | Update command handler | Recovery message (lines 107-112); auto-update flow |
